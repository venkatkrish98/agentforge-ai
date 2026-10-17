import { NextResponse } from "next/server";
import { taskOrchestrator } from "@/lib/orchestrator/task-orchestrator";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedTask = await taskOrchestrator.rejectPatch(params.id);
    return NextResponse.json({ task: updatedTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
