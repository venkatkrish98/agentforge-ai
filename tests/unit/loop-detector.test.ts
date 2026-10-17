import { describe, it, expect } from "vitest";
import { computePatchFingerprint, detectRepairLoop } from "@/lib/sandbox/loop-detector";
import { RepairAttempt } from "@/lib/types/task";

describe("Repair Loop Detector & Max Attempts Enforcement", () => {
  it("computes deterministic SHA-256 fingerprint for code changes", () => {
    const changes1 = [
      { path: "src/calculator.js", newContent: "function safeDivide() { return a / b; }" }
    ];
    const changes2 = [
      { path: "src/calculator.js", newContent: "function safeDivide() { return a / b; }" }
    ];
    const changes3 = [
      { path: "src/calculator.js", newContent: "function safeDivide() { throw new Error(); }" }
    ];

    const fp1 = computePatchFingerprint(changes1);
    const fp2 = computePatchFingerprint(changes2);
    const fp3 = computePatchFingerprint(changes3);

    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
  });

  it("permits repair attempts below maximum limit", () => {
    const history: RepairAttempt[] = [
      {
        attemptNumber: 1,
        diagnosis: "Bug A",
        proposedSolution: "Fix A",
        patchFingerprint: "fp_111",
        resolved: false,
        timestamp: Date.now()
      }
    ];

    const check = detectRepairLoop("fp_222", history, 3);
    expect(check.hasLoop).toBe(false);
  });

  it("detects and halts when maximum repair attempts reached", () => {
    const history: RepairAttempt[] = [
      { attemptNumber: 1, diagnosis: "D1", proposedSolution: "S1", patchFingerprint: "fp1", resolved: false, timestamp: 1 },
      { attemptNumber: 2, diagnosis: "D2", proposedSolution: "S2", patchFingerprint: "fp2", resolved: false, timestamp: 2 },
      { attemptNumber: 3, diagnosis: "D3", proposedSolution: "S3", patchFingerprint: "fp3", resolved: false, timestamp: 3 }
    ];

    const check = detectRepairLoop("fp_different", history, 3);
    expect(check.hasLoop).toBe(true);
    expect(check.reason).toContain("Maximum repair attempt limit (3) reached");
  });

  it("detects cyclic duplicate patch proposal", () => {
    const history: RepairAttempt[] = [
      { attemptNumber: 1, diagnosis: "D1", proposedSolution: "S1", patchFingerprint: "identical_hash", resolved: false, timestamp: 1 }
    ];

    const check = detectRepairLoop("identical_hash", history, 3);
    expect(check.hasLoop).toBe(true);
    expect(check.reason).toContain("identical to Attempt #1");
  });
});
