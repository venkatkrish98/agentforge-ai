import { taskStore } from "@/lib/storage/task-store";
import { nebiusClient } from "@/lib/nebius/client";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";
import {
  initializeTaskWorkspace,
  cleanupTaskWorkspace,
  readTaskWorkspaceFiles
} from "@/lib/sandbox/workspace-manager";
import {
  applyFileChanges,
  createWorkspaceSnapshot,
  rollbackWorkspaceSnapshot,
  generateUnifiedDiff,
  Snapshot
} from "@/lib/sandbox/patch-applier";
import { executeTestCommand } from "@/lib/sandbox/test-runner";
import { detectRepairLoop, computePatchFingerprint } from "@/lib/sandbox/loop-detector";
import { Task, FileChange, TestRunResult, RepairAttempt } from "@/lib/types/task";

export class TaskOrchestrator {
  private activeSnapshots: Map<string, Snapshot> = new Map();

  /**
   * Starts or resumes a task run through planning and patch proposal.
   */
  public async planAndProposeChanges(taskId: string): Promise<Task> {
    const task = await taskStore.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const sampleProject = SAMPLE_PROJECTS.find((p) => p.id === task.projectId);
    const testCommand = sampleProject ? sampleProject.testCommand : "npm test";

    task.status = "planning";
    await taskStore.saveTask(task);
    await taskStore.addEvent(taskId, "model_call_start", `Initiating planning with model ${task.modelId}...`);

    // 1. Generate plan
    const planResult = await nebiusClient.generatePlan(
      task.taskDescription,
      task.projectName,
      task.files,
      testCommand,
      task.modelId,
      task.isMockMode
    );

    task.plan = planResult.steps;
    task.status = "generating_code";
    await taskStore.saveTask(task);
    await taskStore.addEvent(
      taskId,
      "plan_generated",
      `Structured plan formulated with ${task.plan.length} phases. ${planResult.isMock ? "[MOCK MODE]" : ""}`
    );

    // 2. Generate code modifications
    await taskStore.addEvent(taskId, "model_call_start", `Synthesizing code patch using ${task.modelId}...`);
    const patchResult = await nebiusClient.generatePatch(
      task.taskDescription,
      planResult.summary,
      task.files,
      testCommand,
      task.modelId,
      task.isMockMode
    );

    // Build diffs
    const proposedChanges: FileChange[] = [];
    for (const mod of patchResult.filesToModify) {
      const original = task.files.find((f) => f.path === mod.path)?.content || "";
      const diffInfo = generateUnifiedDiff(mod.path, original, mod.newContent);
      proposedChanges.push({
        path: mod.path,
        originalContent: original,
        newContent: mod.newContent,
        diff: diffInfo.diff,
        additions: diffInfo.additions,
        deletions: diffInfo.deletions
      });
    }

    task.proposedChanges = proposedChanges;

    // Check approval policy
    if (task.requireApprovalForChanges) {
      task.status = "awaiting_approval";
      await taskStore.saveTask(task);
      await taskStore.addEvent(
        taskId,
        "approval_requested",
        `Proposed ${proposedChanges.length} file change(s). Awaiting human review and sign-off before disk modification and test execution.`
      );
      return task;
    }

    // Otherwise apply directly
    return await this.executeApprovedPatch(taskId);
  }

  /**
   * Executes approved changes in isolated workspace, runs tests, and engages repair loop if tests fail.
   */
  public async executeApprovedPatch(taskId: string): Promise<Task> {
    const task = await taskStore.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const sampleProject = SAMPLE_PROJECTS.find((p) => p.id === task.projectId);
    const testCommand = sampleProject ? sampleProject.testCommand : "npm test";

    task.status = "applying_patch";
    await taskStore.saveTask(task);
    await taskStore.addEvent(taskId, "approval_granted", "Human approval confirmed. Initializing isolated sandbox workspace.");

    // 1. Initialize isolated workspace
    const workspaceRoot = await initializeTaskWorkspace(taskId, task.files);

    // 2. Take backup snapshot before modifications
    const targetFilePaths = task.proposedChanges.map((c) => c.path);
    const snapshot = await createWorkspaceSnapshot(workspaceRoot, targetFilePaths);
    this.activeSnapshots.set(taskId, snapshot);

    // 3. Apply changes to workspace
    const applyResult = await applyFileChanges(
      workspaceRoot,
      task.proposedChanges.map((c) => ({ path: c.path, newContent: c.newContent }))
    );

    if (applyResult.errors.length > 0) {
      await taskStore.addEvent(taskId, "patch_applied", `Warning during patch apply: ${applyResult.errors.join(", ")}`);
    }

    task.appliedChanges = applyResult.applied;
    task.status = "running_tests";
    await taskStore.saveTask(task);
    await taskStore.addEvent(taskId, "test_started", `Executing test suite in isolated workspace: '${testCommand}'`);

    // 4. Run tests
    let testResult = await executeTestCommand({
      workspaceRoot,
      command: testCommand
    });

    task.testRuns.push(testResult);
    await taskStore.saveTask(task);
    await taskStore.addEvent(
      taskId,
      "test_finished",
      `Test run completed with exit code ${testResult.exitCode} (${testResult.passedTests}/${testResult.totalTests} passed) in ${testResult.durationMs}ms.`
    );

    // 5. If tests passed directly, finalize!
    if (testResult.passed) {
      return await this.finalizeSuccessfulTask(task, workspaceRoot);
    }

    // 6. Enter Iterative Repair Loop
    task.status = "analyzing_failure";
    await taskStore.saveTask(task);
    await taskStore.addEvent(
      taskId,
      "failure_diagnosed",
      `Test suite failed with exit code ${testResult.exitCode}. Initiating iterative root cause analysis.`
    );

    let attempt = 0;
    while (!testResult.passed && attempt < task.maxRepairAttempts) {
      attempt++;
      task.currentRepairAttempt = attempt;
      task.status = "repairing";
      await taskStore.saveTask(task);

      await taskStore.addEvent(
        taskId,
        "repair_attempted",
        `Repair Iteration #${attempt}/${task.maxRepairAttempts}: Consulting model for failure diagnosis and surgical repair.`
      );

      // Current workspace files
      const currentWorkspaceFiles = await readTaskWorkspaceFiles(workspaceRoot);

      // Ask model for diagnosis and repair patch
      const repairPatch = await nebiusClient.diagnoseAndRepair(
        task.taskDescription,
        currentWorkspaceFiles,
        testCommand,
        {
          stdout: testResult.stdout,
          stderr: testResult.stderr,
          exitCode: testResult.exitCode,
          failedCount: testResult.failedTests,
          assertions: testResult.assertions
        },
        attempt,
        task.modelId,
        task.isMockMode
      );

      // Loop detection
      const fingerprint = computePatchFingerprint(repairPatch.filesToModify);
      const loopCheck = detectRepairLoop(fingerprint, task.repairHistory, task.maxRepairAttempts);

      if (loopCheck.hasLoop) {
        await taskStore.addEvent(
          taskId,
          "task_failed",
          `Loop Detector triggered: ${loopCheck.reason}`
        );
        task.status = "failed";
        await taskStore.saveTask(task);
        return task;
      }

      // Apply repair patch to workspace
      const repairApply = await applyFileChanges(workspaceRoot, repairPatch.filesToModify);
      task.appliedChanges = repairApply.applied;

      // Re-run tests
      testResult = await executeTestCommand({
        workspaceRoot,
        command: testCommand
      });
      task.testRuns.push(testResult);

      const repairAttemptRecord: RepairAttempt = {
        attemptNumber: attempt,
        diagnosis: repairPatch.diagnosis,
        proposedSolution: repairPatch.proposedSolution,
        patchFingerprint: fingerprint,
        testRunResult: testResult,
        resolved: testResult.passed,
        timestamp: Date.now()
      };
      task.repairHistory.push(repairAttemptRecord);

      await taskStore.saveTask(task);

      if (testResult.passed) {
        await taskStore.addEvent(
          taskId,
          "test_finished",
          `Repair Iteration #${attempt} SUCCEEDED! All ${testResult.totalTests} tests now passing.`
        );
        return await this.finalizeSuccessfulTask(task, workspaceRoot);
      } else {
        await taskStore.addEvent(
          taskId,
          "test_finished",
          `Repair Iteration #${attempt} did not resolve all assertions (${testResult.failedTests} failing).`
        );
      }
    }

    // If loop finished without passing
    task.status = "failed";
    await taskStore.saveTask(task);
    await taskStore.addEvent(
      taskId,
      "task_failed",
      `Reached maximum repair attempts (${task.maxRepairAttempts}) without passing all tests.`
    );
    return task;
  }

  /**
   * Rejects proposed patch, rolls back workspace snapshot, and sets status to cancelled.
   */
  public async rejectPatch(taskId: string): Promise<Task> {
    const task = await taskStore.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const snapshot = this.activeSnapshots.get(taskId);
    if (snapshot) {
      const workspaceRoot = await initializeTaskWorkspace(taskId, task.files);
      await rollbackWorkspaceSnapshot(workspaceRoot, snapshot);
      this.activeSnapshots.delete(taskId);
      await taskStore.addEvent(taskId, "rollback_performed", "Restored workspace snapshot to pre-patch state.");
    }

    task.status = "cancelled";
    task.proposedChanges = [];
    await taskStore.saveTask(task);
    await taskStore.addEvent(taskId, "approval_rejected", "User rejected proposed changes. Run cancelled.");
    return task;
  }

  /**
   * Finalizes successful run, generates report, and syncs workspace files back to task state.
   */
  private async finalizeSuccessfulTask(task: Task, workspaceRoot: string): Promise<Task> {
    task.status = "success";
    const updatedFiles = await readTaskWorkspaceFiles(workspaceRoot);
    task.files = updatedFiles;

    const latestTestRun = task.testRuns[task.testRuns.length - 1];

    const report = await nebiusClient.generateFinalReport(
      task.taskDescription,
      task.projectName,
      task.appliedChanges.map((c) => ({
        path: c.path,
        additions: c.additions,
        deletions: c.deletions
      })),
      {
        passed: latestTestRun?.passed || true,
        totalTests: latestTestRun?.totalTests || 0,
        passedTests: latestTestRun?.passedTests || 0,
        failedTests: latestTestRun?.failedTests || 0,
        durationMs: latestTestRun?.durationMs || 0
      },
      task.repairHistory.length,
      task.modelId,
      task.isMockMode
    );

    task.finalReport = report;
    await taskStore.saveTask(task);
    await taskStore.addEvent(
      task.id,
      "task_completed",
      `Task completed successfully! ${report.verifiedResults.length} verified assertions recorded.`
    );

    return task;
  }

  /**
   * Generates downloadable unified patch format string.
   */
  public getDownloadablePatch(task: Task): string {
    const changes = task.appliedChanges.length > 0 ? task.appliedChanges : task.proposedChanges;
    if (changes.length === 0) {
      return "# No file changes generated for this task.\n";
    }

    let output = `# AgentForge AI Exported Patch\n# Task: ${task.title}\n# Model: ${task.modelId} (${task.isMockMode ? "Mock" : "Live"})\n# Date: ${new Date().toISOString()}\n\n`;
    for (const change of changes) {
      output += change.diff + "\n\n";
    }
    return output;
  }
}

export const taskOrchestrator = new TaskOrchestrator();
