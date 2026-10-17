import { describe, it, expect } from "vitest";
import { validateSafeWorkspacePath, isPathInside } from "@/lib/sandbox/path-validator";
import path from "node:path";

describe("Path Validator & Sandbox Boundary Guard", () => {
  const mockRoot = path.resolve("C:/mock-workspace-root");

  it("accepts valid relative file paths inside workspace", () => {
    const res1 = validateSafeWorkspacePath(mockRoot, "src/calculator.js");
    expect(res1.isValid).toBe(true);
    expect(res1.safeRelativePath).toBe("src/calculator.js");

    const res2 = validateSafeWorkspacePath(mockRoot, "package.json");
    expect(res2.isValid).toBe(true);
    expect(res2.safeRelativePath).toBe("package.json");

    const res3 = validateSafeWorkspacePath(mockRoot, "test/deep/nested/file.test.js");
    expect(res3.isValid).toBe(true);
    expect(res3.safeRelativePath).toBe("test/deep/nested/file.test.js");
  });

  it("rejects sibling directory prefix bypass (e.g. workspace-root-evil)", () => {
    // Sibling directory that startsWith workspaceRoot string but is a different folder
    const siblingDir = path.resolve("C:/mock-workspace-root-evil");
    const siblingFile = path.join(siblingDir, "stolen.txt");

    const res = validateSafeWorkspacePath(mockRoot, siblingFile);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("resolves outside workspace boundaries");

    // Also verify isPathInside utility
    expect(isPathInside(mockRoot, siblingFile)).toBe(false);
    expect(isPathInside(mockRoot, path.join(mockRoot, "src/index.js"))).toBe(true);
  });

  it("rejects path traversal attempting to escape root with ../", () => {
    const res = validateSafeWorkspacePath(mockRoot, "../secret.txt");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Path traversal token '..' detected");
  });

  it("rejects deeply nested path traversal token ../../../etc/passwd", () => {
    const res = validateSafeWorkspacePath(mockRoot, "src/../../etc/passwd");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Path traversal token '..' detected");
  });

  it("rejects null byte injection", () => {
    const res = validateSafeWorkspacePath(mockRoot, "src/index.js\0.png");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("forbidden null byte");
  });

  it("rejects Windows reserved device names", () => {
    const res1 = validateSafeWorkspacePath(mockRoot, "CON");
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain("Reserved Windows device name 'CON'");

    const res2 = validateSafeWorkspacePath(mockRoot, "src/NUL.txt");
    expect(res2.isValid).toBe(false);
    expect(res2.error).toContain("Reserved Windows device name 'NUL'");
  });

  it("rejects empty or whitespace-only paths", () => {
    const res = validateSafeWorkspacePath(mockRoot, "");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Empty or invalid path");
  });
});
