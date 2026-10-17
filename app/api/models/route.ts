import { NextResponse } from "next/server";
import { nebiusClient } from "@/lib/nebius/client";
import { VERIFIED_NEBIUS_MODELS } from "@/lib/types/models";

export async function GET() {
  try {
    return NextResponse.json({
      provider: "Nebius Token Factory",
      baseUrl: nebiusClient.getBaseUrl(),
      defaultModel: nebiusClient.getDefaultModel(),
      hasApiKey: nebiusClient.hasApiKey(),
      maskedApiKey: nebiusClient.getMaskedKey(),
      verifiedModels: VERIFIED_NEBIUS_MODELS
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
