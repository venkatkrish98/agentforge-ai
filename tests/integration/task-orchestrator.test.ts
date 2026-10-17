import { describe, it, expect, beforeEach } from "vitest";
import { taskStore } from "@/lib/storage/task-store";
import { taskOrchestrator } from "@/lib/orchestrator/task-orchestrator";

describe("Task Orchestrator & Autonomous Coding-Repair Journey", () => {
  beforeEach(async () => {
    await taskStore.resetDemoData();
  });

  it("completes full task lifecycle: Plan -> Propose Diff -> Await Approval -> Approve -> Test -> Verify -> Export", async () => {
    // 1. Fetch initialized calc-vault task
    const tasks = await taskStore.listTasks();
    const calcTask = tasks.find((t) => t.projectId === "calc-vault");
    expect(calcTask).toBeDefined();
    if (!calcTask) return;

    // Set mock mode for fast, deterministic, self-contained test execution
    calcTask.isMockMode = true;
    calcTask.requireApprovalForChanges = true;
    await taskStore.saveTask(calcTask);

    // 2. Plan and propose code modifications
    const afterPlan = await taskOrchestrator.planAndProposeChanges(calcTask.id);

    expect(afterPlan.plan.length).toBeGreaterThan(0);
    expect(afterPlan.proposedChanges.length).toBeGreaterThan(0);
    expect(afterPlan.status).toBe("awaiting_approval");

    // Diffs should be computed
    const calcDiff = afterPlan.proposedChanges.find((c) => c.path === "src/calculator.js");
    expect(calcDiff).toBeDefined();
    expect(calcDiff?.diff).toContain("+");

    // Event audit trail should record planning and approval request
    const approvalReqEvent = afterPlan.events.find((e) => e.type === "approval_requested");
    expect(approvalReqEvent).toBeDefined();

    // 3. User Approves changes -> Sandbox test runner executes
    const afterExecution = await taskOrchestrator.executeApprovedPatch(calcTask.id);

    // Status should be success
    expect(afterExecution.status).toBe("success");
    expect(afterExecution.testRuns.length).toBeGreaterThan(0);

    const latestRun = afterExecution.testRuns[afterExecution.testRuns.length - 1];
    expect(latestRun.exitCode).toBe(0);
    expect(latestRun.passed).toBe(true);

    // Final Report verification
    expect(afterExecution.finalReport).toBeDefined();
    expect(afterExecution.finalReport?.verifiedResults.length).toBeGreaterThan(0);

    // 4. Download patch export
    const exportedPatch = taskOrchestrator.getDownloadablePatch(afterExecution);
    expect(exportedPatch).toContain("# AgentForge AI Exported Patch");
    expect(exportedPatch).toContain("Index: src/calculator.js");
  });

  it("handles rejection and rollback safely", async () => {
    const tasks = await taskStore.listTasks();
    const tokenTask = tasks.find((t) => t.projectId === "auth-token-guard");
    expect(tokenTask).toBeDefined();
    if (!tokenTask) return;

    tokenTask.isMockMode = true;
    tokenTask.requireApprovalForChanges = true;
    await taskStore.saveTask(tokenTask);

    await taskOrchestrator.planAndProposeChanges(tokenTask.id);

    // Reject changes
    const rejectedTask = await taskOrchestrator.rejectPatch(tokenTask.id);
    expect(rejectedTask.status).toBe("cancelled");
    expect(rejectedTask.proposedChanges.length).toBe(0);

    const rejectionEvent = rejectedTask.events.find((e) => e.type === "approval_rejected");
    expect(rejectionEvent).toBeDefined();
  });
});
