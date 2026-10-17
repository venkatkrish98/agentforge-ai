import { NextResponse } from "next/server";
import { taskStore } from "@/lib/storage/task-store";
import { validateLocalMutationRequest } from "@/lib/security/request-guard";

export async function POST(req: Request) {
  const guard = validateLocalMutationRequest(req);
  if (!guard.isAllowed && guard.errorResponse) {
    return guard.errorResponse;
  }

  try {
    const tasks = await taskStore.resetDemoData();
    return NextResponse.json({ message: "Demo data reset successfully", tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
