import { NextResponse } from "next/server";
import { taskStore } from "@/lib/storage/task-store";
import { taskOrchestrator } from "@/lib/orchestrator/task-orchestrator";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskStore.getTask(params.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const patchContent = taskOrchestrator.getDownloadablePatch(task);
    const filename = `agentforge-${task.projectId}-${params.id.substring(0, 8)}.patch`;

    return new NextResponse(patchContent, {
      status: 200,
      headers: {
        "Content-Type": "text/x-diff; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
