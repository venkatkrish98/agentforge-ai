import { NextResponse } from "next/server";
import { nebiusClient } from "@/lib/nebius/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const modelId = body?.modelId || nebiusClient.getDefaultModel();

    const result = await nebiusClient.testConnection(modelId);
    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      {
        result: {
          status: "error",
          provider: "Nebius Token Factory",
          model: "unknown",
          latencyMs: 0,
          message: `Unexpected test failure: ${err.message}`,
          hasValidApiKey: nebiusClient.hasApiKey(),
          timestamp: Date.now()
        }
      },
      { status: 500 }
    );
  }
}
