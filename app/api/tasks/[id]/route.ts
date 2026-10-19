import { NextResponse } from "next/server";
import { taskStore } from "@/lib/storage/task-store";
import { validateLocalMutationRequest } from "@/lib/security/request-guard";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskStore.getTask(params.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = validateLocalMutationRequest(req);
  if (!guard.isAllowed) {
    return guard.errorResponse;
  }

  try {
    const success = await taskStore.deleteTask(params.id);
    if (!success) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

