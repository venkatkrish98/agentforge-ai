import { NextResponse } from "next/server";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";

export async function GET() {
  try {
    return NextResponse.json({
      projects: SAMPLE_PROJECTS.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        defaultTaskTitle: p.defaultTaskTitle,
        defaultTaskDescription: p.defaultTaskDescription,
        testCommand: p.testCommand,
        fileCount: p.files.length,
        files: p.files.map((f) => ({ path: f.path, size: f.content.length }))
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
