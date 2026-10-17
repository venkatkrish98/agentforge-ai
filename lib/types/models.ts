import { z } from "zod";

export const ModelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.literal("Nebius Token Factory"),
  family: z.string(),
  description: z.string(),
  contextWindow: z.number(),
  maxTokens: z.number(),
  isRecommended: z.boolean().default(false),
  verifiedOnPlatform: z.boolean().default(true)
});
export type ModelInfo = z.infer<typeof ModelInfoSchema>;

export const VERIFIED_NEBIUS_MODELS: ModelInfo[] = [
  {
    id: "nvidia/Nemotron-3_5-Lightning",
    name: "NVIDIA Nemotron 3.5 Lightning",
    provider: "Nebius Token Factory",
    family: "NVIDIA Nemotron",
    description: "High-speed, low-latency reasoning and coding model optimized for iterative agent loops.",
    contextWindow: 131072,
    maxTokens: 4096,
    isRecommended: true,
    verifiedOnPlatform: true
  },
  {
    id: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
    name: "NVIDIA Nemotron 3 Nano (30B-A3B)",
    provider: "Nebius Token Factory",
    family: "NVIDIA Nemotron",
    description: "Fast hybrid MoE model specialized for code generation, patch synthesis, and quick analysis.",
    contextWindow: 65536,
    maxTokens: 4096,
    isRecommended: false,
    verifiedOnPlatform: true
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b",
    name: "NVIDIA Nemotron 3 Super (120B-A12B)",
    provider: "Nebius Token Factory",
    family: "NVIDIA Nemotron",
    description: "Large capacity enterprise agent reasoning model with deep root-cause diagnosis capabilities.",
    contextWindow: 131072,
    maxTokens: 8192,
    isRecommended: false,
    verifiedOnPlatform: true
  },
  {
    id: "nvidia/Nemotron-3-Ultra-550b-a55b",
    name: "NVIDIA Nemotron 3 Ultra (550B-A55B)",
    provider: "Nebius Token Factory",
    family: "NVIDIA Nemotron",
    description: "Flagship massive scale MoE model for complex multi-module repairs and architecture refactoring.",
    contextWindow: 131072,
    maxTokens: 8192,
    isRecommended: false,
    verifiedOnPlatform: true
  }
];

export const ConnectionTestResultSchema = z.object({
  status: z.enum(["connected", "disconnected", "error", "mock"]),
  provider: z.string(),
  model: z.string(),
  latencyMs: z.number(),
  message: z.string(),
  hasValidApiKey: z.boolean(),
  maskedKey: z.string().optional(),
  availableModelsCount: z.number().optional(),
  timestamp: z.number()
});
export type ConnectionTestResult = z.infer<typeof ConnectionTestResultSchema>;
