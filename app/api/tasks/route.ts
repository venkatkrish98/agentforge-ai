import { NextResponse } from "next/server";
import { taskStore } from "@/lib/storage/task-store";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";
import { Task } from "@/lib/types/task";
import { z } from "zod";

const CreateTaskInputSchema = z.object({
  title: z.string().min(3),
  taskDescription: z.string().min(10),
  projectId: z.string(),
  modelId: z.string().default("nvidia/Nemotron-3_5-Lightning"),
  requireApprovalForChanges: z.boolean().default(true),
  maxRepairAttempts: z.number().min(1).max(5).default(3),
  isMockMode: z.boolean().default(false)
});

export async function GET() {
  try {
    const tasks = await taskStore.listTasks();
    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateTaskInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid task input", details: parsed.error.format() }, { status: 400 });
    }

    const { title, taskDescription, projectId, modelId, requireApprovalForChanges, maxRepairAttempts, isMockMode } = parsed.data;

    const sample = SAMPLE_PROJECTS.find((p) => p.id === projectId);
    const projectName = sample ? sample.name : "Custom Workspace";
    const files = sample ? sample.files : [];

    const now = Date.now();
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newTask: Task = {
      id: taskId,
      title,
      taskDescription,
      projectId,
      projectName,
      status: "idle",
      requireApprovalForChanges,
      maxRepairAttempts,
      currentRepairAttempt: 0,
      files,
      plan: [],
      proposedChanges: [],
      appliedChanges: [],
      testRuns: [],
      repairHistory: [],
      events: [
        {
          id: `ev_${now}`,
          timestamp: now,
          type: "task_created",
          message: `Task '${title}' created for project '${projectName}'.`,
          metadata: { modelId, isMockMode }
        }
      ],
      modelId,
      isMockMode,
      createdAt: now,
      updatedAt: now
    };

    const saved = await taskStore.saveTask(newTask);
    return NextResponse.json({ task: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
