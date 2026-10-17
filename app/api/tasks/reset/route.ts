import { NextResponse } from "next/server";
import { taskStore } from "@/lib/storage/task-store";

export async function POST() {
  try {
    const tasks = await taskStore.resetDemoData();
    return NextResponse.json({ message: "Demo data reset successfully", tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
