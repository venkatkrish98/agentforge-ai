import fs from "node:fs/promises";
import path from "node:path";
import { ProjectContextFile } from "@/lib/types/task";
import { validateSafePathWithSymlinkGuard, isPathInside } from "./path-validator";

const RUNS_ROOT = path.resolve(
  process.env.VERCEL ? "/tmp/workspaces-data/runs" : process.cwd(),
  process.env.VERCEL ? "" : path.join("workspaces-data", "runs")
);

/**
 * Prepares an isolated directory for a task execution run.
 */
export async function initializeTaskWorkspace(
  taskId: string,
  files: ProjectContextFile[]
): Promise<string> {
  const workspacePath = path.join(RUNS_ROOT, taskId);
  await fs.mkdir(workspacePath, { recursive: true });

  for (const file of files) {
    const val = await validateSafePathWithSymlinkGuard(workspacePath, file.path);
    if (!val.isValid || !val.safeRelativePath) {
      throw new Error(`Forbidden file path in project context: ${file.path} (${val.error})`);
    }

    const targetFilePath = path.join(workspacePath, val.safeRelativePath);
    await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
    await fs.writeFile(targetFilePath, file.content, "utf-8");
  }

  return workspacePath;
}

/**
 * Reads all files from a task workspace directory.
 */
export async function readTaskWorkspaceFiles(
  workspacePath: string
): Promise<ProjectContextFile[]> {
  const result: ProjectContextFile[] = [];

  async function walk(dir: string, baseDir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      // Disallow symlinks and common ignore folders
      if (entry.isSymbolicLink()) continue;
      if (entry.name === "node_modules" || entry.name === ".git") continue;

      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

      // Verify realpath doesn't escape baseDir
      const real = await fs.realpath(fullPath).catch(() => fullPath);
      if (!isPathInside(baseDir, real) && real !== path.resolve(baseDir)) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(fullPath, baseDir);
      } else if (entry.isFile()) {
        const content = await fs.readFile(fullPath, "utf-8");
        result.push({ path: relPath, content });
      }
    }
  }

  try {
    await walk(workspacePath, workspacePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }

  return result;
}

/**
 * Cleans up an isolated workspace directory.
 */
export async function cleanupTaskWorkspace(taskId: string): Promise<void> {
  const workspacePath = path.join(RUNS_ROOT, taskId);
  try {
    await fs.rm(workspacePath, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
