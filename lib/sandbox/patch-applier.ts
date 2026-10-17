import * as diff from "diff";
import fs from "node:fs/promises";
import path from "node:path";
import { FileChange } from "@/lib/types/task";
import { validateSafeWorkspacePath } from "./path-validator";

export interface Snapshot {
  id: string;
  timestamp: number;
  files: {
    path: string;
    content: string;
  }[];
}

/**
 * Creates a readable unified diff between original and updated content.
 */
export function generateUnifiedDiff(
  filePath: string,
  originalContent: string,
  newContent: string
): { diff: string; additions: number; deletions: number } {
  const patch = diff.createPatch(filePath, originalContent, newContent, "original", "modified");
  
  // Calculate additions and deletions
  const diffLines = patch.split("\n");
  let additions = 0;
  let deletions = 0;

  for (const line of diffLines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      additions++;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      deletions++;
    }
  }

  return {
    diff: patch,
    additions,
    deletions
  };
}

/**
 * Creates an in-memory snapshot of workspace files before changes are applied.
 */
export async function createWorkspaceSnapshot(
  workspaceRoot: string,
  targetFiles: string[]
): Promise<Snapshot> {
  const snapshot: Snapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    files: []
  };

  for (const relPath of targetFiles) {
    const val = validateSafeWorkspacePath(workspaceRoot, relPath);
    if (!val.isValid || !val.safeRelativePath) continue;

    const fullPath = path.join(workspaceRoot, val.safeRelativePath);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      snapshot.files.push({
        path: val.safeRelativePath,
        content
      });
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  return snapshot;
}

/**
 * Restores a workspace snapshot (rollback).
 */
export async function rollbackWorkspaceSnapshot(
  workspaceRoot: string,
  snapshot: Snapshot
): Promise<{ restoredCount: number }> {
  let count = 0;
  for (const file of snapshot.files) {
    const val = validateSafeWorkspacePath(workspaceRoot, file.path);
    if (!val.isValid || !val.safeRelativePath) continue;

    const fullPath = path.join(workspaceRoot, val.safeRelativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.content, "utf-8");
    count++;
  }
  return { restoredCount: count };
}

/**
 * Safely applies file changes to workspace.
 */
export async function applyFileChanges(
  workspaceRoot: string,
  changes: { path: string; newContent: string }[]
): Promise<{ applied: FileChange[]; errors: string[] }> {
  const applied: FileChange[] = [];
  const errors: string[] = [];

  for (const change of changes) {
    const val = validateSafeWorkspacePath(workspaceRoot, change.path);
    if (!val.isValid || !val.safeRelativePath) {
      errors.push(`Invalid path rejected: ${change.path} (${val.error})`);
      continue;
    }

    const fullPath = path.join(workspaceRoot, val.safeRelativePath);
    let originalContent = "";
    try {
      originalContent = await fs.readFile(fullPath, "utf-8");
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        errors.push(`Failed reading ${val.safeRelativePath}: ${err.message}`);
        continue;
      }
    }

    const diffInfo = generateUnifiedDiff(val.safeRelativePath, originalContent, change.newContent);

    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, change.newContent, "utf-8");

      applied.push({
        path: val.safeRelativePath,
        originalContent,
        newContent: change.newContent,
        diff: diffInfo.diff,
        additions: diffInfo.additions,
        deletions: diffInfo.deletions
      });
    } catch (err: any) {
      errors.push(`Failed writing to ${val.safeRelativePath}: ${err.message}`);
    }
  }

  return { applied, errors };
}
