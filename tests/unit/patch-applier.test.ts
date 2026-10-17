import { describe, it, expect } from "vitest";
import { generateUnifiedDiff } from "@/lib/sandbox/patch-applier";

describe("Patch Applier & Diff Synthesis", () => {
  it("generates correct unified diff with addition and deletion counts", () => {
    const original = `function add(a, b) {\n  return a - b;\n}`;
    const modified = `function add(a, b) {\n  return a + b;\n}`;

    const res = generateUnifiedDiff("src/math.js", original, modified);
    expect(res.diff).toContain("-  return a - b;");
    expect(res.diff).toContain("+  return a + b;");
    expect(res.additions).toBe(1);
    expect(res.deletions).toBe(1);
  });

  it("handles empty original content (new file creation)", () => {
    const original = "";
    const modified = "console.log('hello');\n";

    const res = generateUnifiedDiff("src/new-file.js", original, modified);
    expect(res.additions).toBe(1);
    expect(res.deletions).toBe(0);
    expect(res.diff).toContain("+console.log('hello');");
  });
});
