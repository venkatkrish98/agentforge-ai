import { describe, it, expect } from "vitest";
import { validateSafeWorkspacePath, validateSafePathWithSymlinkGuard, isPathInside } from "@/lib/sandbox/path-validator";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

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

  it("detects and rejects dangling symlinks pointing outside workspace boundaries", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentforge-symtest-"));
    try {
      const outsideGhostFile = path.join(tempDir, "..", "ghost-secret-file.txt");
      const danglingSymlink = path.join(tempDir, "dangling-escape.js");

      // Create a dangling symlink pointing to an uncreated file outside the workspace
      fs.symlinkSync(outsideGhostFile, danglingSymlink, "file");

      const res = await validateSafePathWithSymlinkGuard(tempDir, "dangling-escape.js");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Symlink escape detected");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("allows safe newly proposed files in legitimate subdirectories via symlink guard", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentforge-validtest-"));
    try {
      const res = await validateSafePathWithSymlinkGuard(tempDir, "src/new-feature.js");
      expect(res.isValid).toBe(true);
      expect(res.safeRelativePath).toBe("src/new-feature.js");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

