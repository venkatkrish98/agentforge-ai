import crypto from "node:crypto";
import { RepairAttempt } from "@/lib/types/task";

export interface LoopDetectionResult {
  hasLoop: boolean;
  reason?: string;
  fingerprint: string;
}

/**
 * Computes a deterministic SHA-256 fingerprint for a patch.
 */
export function computePatchFingerprint(changes: { path: string; newContent: string }[]): string {
  const normalized = changes
    .map((c) => `${c.path}:${c.newContent.trim().replace(/\r\n/g, "\n")}`)
    .sort()
    .join("||");

  return crypto.createHash("sha256").update(normalized).digest("hex").substring(0, 16);
}

/**
 * Detects whether the agent is stuck in an oscillating repair loop or proposing an identical patch.
 */
export function detectRepairLoop(
  currentFingerprint: string,
  history: RepairAttempt[],
  maxAttempts: number = 3
): LoopDetectionResult {
  // Check if max attempts reached
  if (history.length >= maxAttempts) {
    return {
      hasLoop: true,
      reason: `Maximum repair attempt limit (${maxAttempts}) reached. Halting iterative repair loop to prevent resource exhaustion.`,
      fingerprint: currentFingerprint
    };
  }

  // Check for duplicate patch fingerprint in history
  const duplicate = history.find((h) => h.patchFingerprint === currentFingerprint);
  if (duplicate) {
    return {
      hasLoop: true,
      reason: `Agent proposed a patch identical to Attempt #${duplicate.attemptNumber}. Halting to break infinite cycle.`,
      fingerprint: currentFingerprint
    };
  }

  return {
    hasLoop: false,
    fingerprint: currentFingerprint
  };
}
