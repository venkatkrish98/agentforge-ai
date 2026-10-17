import { NextResponse } from "next/server";
import { taskOrchestrator } from "@/lib/orchestrator/task-orchestrator";
import { validateLocalMutationRequest } from "@/lib/security/request-guard";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = validateLocalMutationRequest(req);
  if (!guard.isAllowed && guard.errorResponse) {
    return guard.errorResponse;
  }

  try {
    const updatedTask = await taskOrchestrator.planAndProposeChanges(params.id);
    return NextResponse.json({ task: updatedTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
