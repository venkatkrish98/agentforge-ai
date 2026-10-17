import { z } from "zod";

export const TaskStatusSchema = z.enum([
  "idle",
  "analyzing",
  "planning",
  "generating_code",
  "awaiting_approval",
  "applying_patch",
  "running_tests",
  "analyzing_failure",
  "repairing",
  "success",
  "failed",
  "cancelled"
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const PlanStepStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "skipped"
]);
export type PlanStepStatus = z.infer<typeof PlanStepStatusSchema>;

export const PlanStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: PlanStepStatusSchema,
  actionType: z.enum([
    "context_analysis",
    "patch_formulation",
    "patch_application",
    "test_execution",
    "failure_diagnosis",
    "repair_iteration",
    "final_verification"
  ]),
  output: z.string().optional(),
  startedAt: z.number().optional(),
  completedAt: z.number().optional()
});
export type PlanStep = z.infer<typeof PlanStepSchema>;

export const FileChangeSchema = z.object({
  path: z.string(),
  originalContent: z.string(),
  newContent: z.string(),
  diff: z.string(),
  additions: z.number(),
  deletions: z.number()
});
export type FileChange = z.infer<typeof FileChangeSchema>;

export const TestAssertionSchema = z.object({
  title: z.string(),
  passed: z.boolean(),
  error: z.string().optional(),
  durationMs: z.number().optional()
});
export type TestAssertion = z.infer<typeof TestAssertionSchema>;

export const TestRunResultSchema = z.object({
  id: z.string(),
  command: z.string(),
  exitCode: z.number(),
  passed: z.boolean(),
  durationMs: z.number(),
  stdout: z.string(),
  stderr: z.string(),
  totalTests: z.number(),
  passedTests: z.number(),
  failedTests: z.number(),
  assertions: z.array(TestAssertionSchema).default([]),
  timestamp: z.number()
});
export type TestRunResult = z.infer<typeof TestRunResultSchema>;

export const RepairAttemptSchema = z.object({
  attemptNumber: z.number(),
  diagnosis: z.string(),
  proposedSolution: z.string(),
  patchFingerprint: z.string(),
  testRunResult: TestRunResultSchema.optional(),
  resolved: z.boolean(),
  timestamp: z.number()
});
export type RepairAttempt = z.infer<typeof RepairAttemptSchema>;

export const AgentEventTypeSchema = z.enum([
  "task_created",
  "context_loaded",
  "model_call_start",
  "model_call_success",
  "model_call_error",
  "plan_generated",
  "patch_proposed",
  "approval_requested",
  "approval_granted",
  "approval_rejected",
  "patch_applied",
  "rollback_performed",
  "test_started",
  "test_finished",
  "failure_diagnosed",
  "repair_attempted",
  "task_completed",
  "task_failed",
  "task_cancelled"
]);
export type AgentEventType = z.infer<typeof AgentEventTypeSchema>;

export const AgentEventSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: AgentEventTypeSchema,
  message: z.string(),
  metadata: z.record(z.any()).optional()
});
export type AgentEvent = z.infer<typeof AgentEventSchema>;

export const FinalReportSchema = z.object({
  summary: z.string(),
  verifiedResults: z.array(z.string()),
  failedChecks: z.array(z.string()),
  skippedChecks: z.array(z.string()),
  assumptions: z.array(z.string()),
  totalDurationMs: z.number(),
  repairsNeeded: z.number(),
  modelUsed: z.string(),
  isMock: z.boolean()
});
export type FinalReport = z.infer<typeof FinalReportSchema>;

export const ProjectContextFileSchema = z.object({
  path: z.string(),
  content: z.string()
});
export type ProjectContextFile = z.infer<typeof ProjectContextFileSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  taskDescription: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  status: TaskStatusSchema,
  requireApprovalForChanges: z.boolean().default(true),
  maxRepairAttempts: z.number().default(3),
  currentRepairAttempt: z.number().default(0),
  files: z.array(ProjectContextFileSchema),
  plan: z.array(PlanStepSchema).default([]),
  proposedChanges: z.array(FileChangeSchema).default([]),
  appliedChanges: z.array(FileChangeSchema).default([]),
  testRuns: z.array(TestRunResultSchema).default([]),
  repairHistory: z.array(RepairAttemptSchema).default([]),
  events: z.array(AgentEventSchema).default([]),
  finalReport: FinalReportSchema.optional(),
  modelId: z.string().default("nvidia/Nemotron-3_5-Lightning"),
  isMockMode: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number()
});
export type Task = z.infer<typeof TaskSchema>;
