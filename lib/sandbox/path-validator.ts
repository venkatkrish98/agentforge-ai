import path from "node:path";
import fs from "node:fs/promises";

export interface PathValidationResult {
  isValid: boolean;
  safeRelativePath?: string;
  resolvedFullPath?: string;
  error?: string;
}

/**
 * Checks if targetPath is strictly inside rootDir using separator-aware comparison.
 * Prevents sibling path bypasses (e.g. /workspace-sibling vs /workspace).
 */
export function isPathInside(rootDir: string, targetPath: string): boolean {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(targetPath);

  const rel = path.relative(resolvedRoot, resolvedTarget);
  return Boolean(rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * Validates that a file path is safe and strictly resides within the target workspace directory.
 * Prevents:
 * - Path traversal (e.g., ../, ..\, /etc/passwd, C:\Windows)
 * - Sibling directory prefix matching (e.g., /workspace-evil vs /workspace)
 * - Absolute paths attempting to escape workspace
 * - Null byte injection
 * - Windows device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
 */
export function validateSafeWorkspacePath(
  workspaceRoot: string,
  userProvidedPath: string
): PathValidationResult {
  if (!userProvidedPath || typeof userProvidedPath !== "string") {
    return { isValid: false, error: "Empty or invalid path provided" };
  }

  // Check for null byte
  if (userProvidedPath.includes("\0")) {
    return { isValid: false, error: "Path contains forbidden null byte" };
  }

  // Normalize separators
  const cleanPath = userProvidedPath.replace(/\\/g, "/").trim();

  // Prevent path traversal tokens
  const segments = cleanPath.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { isValid: false, error: "Path points to workspace root directly; target file expected" };
  }

  for (const seg of segments) {
    if (seg === ".." || seg === ".") {
      return {
        isValid: false,
        error: `Path traversal token '${seg}' detected in ${userProvidedPath}`
      };
    }

    // Windows reserved device names
    const baseName = seg.split(".")[0]?.toUpperCase();
    if (
      baseName &&
      [
        "CON",
        "PRN",
        "AUX",
        "NUL",
        "COM1",
        "COM2",
        "COM3",
        "COM4",
        "COM5",
        "COM6",
        "COM7",
        "COM8",
        "COM9",
        "LPT1",
        "LPT2",
        "LPT3",
        "LPT4",
        "LPT5",
        "LPT6",
        "LPT7",
        "LPT8",
        "LPT9"
      ].includes(baseName)
    ) {
      return {
        isValid: false,
        error: `Reserved Windows device name '${baseName}' in path`
      };
    }
  }

  // Check absolute paths
  const resolvedRoot = path.resolve(workspaceRoot);
  const resolvedTarget = path.isAbsolute(cleanPath)
    ? path.resolve(cleanPath)
    : path.resolve(resolvedRoot, cleanPath);

  // Separator-aware relative containment check
  if (!isPathInside(resolvedRoot, resolvedTarget)) {
    return {
      isValid: false,
      error: `Path '${userProvidedPath}' resolves outside workspace boundaries: ${resolvedTarget}`
    };
  }

  const relative = path.relative(resolvedRoot, resolvedTarget).replace(/\\/g, "/");

  return {
    isValid: true,
    safeRelativePath: relative,
    resolvedFullPath: resolvedTarget
  };
}

/**
 * Validates path and ensures no symlinks (including dangling symlinks) along the path point outside the workspace.
 */
export async function validateSafePathWithSymlinkGuard(
  workspaceRoot: string,
  userProvidedPath: string
): Promise<PathValidationResult> {
  const lexical = validateSafeWorkspacePath(workspaceRoot, userProvidedPath);
  if (!lexical.isValid || !lexical.resolvedFullPath) {
    return lexical;
  }

  const resolvedRoot = path.resolve(workspaceRoot);
  const realRoot = await fs.realpath(resolvedRoot).catch(() => resolvedRoot);
  const targetPath = lexical.resolvedFullPath;

  // 1. Check if targetPath itself exists (regular file, directory, or symlink)
  try {
    const lstat = await fs.lstat(targetPath);
    if (lstat.isSymbolicLink()) {
      // It is a symlink: attempt to canonicalize target path.
      // If the target cannot be resolved (dangling symlink), reject it immediately.
      // Allowing an unresolvable symlink risks intermediate directory symlink escapes.
      let realTarget: string;
      try {
        realTarget = await fs.realpath(targetPath);
      } catch {
        return {
          isValid: false,
          error: `Symlink escape detected: '${userProvidedPath}' is a dangling or unresolvable symlink pointing to a non-existent target.`
        };
      }

      if (!isPathInside(realRoot, realTarget)) {
        return {
          isValid: false,
          error: `Symlink escape detected: '${userProvidedPath}' is a symlink pointing outside workspace to '${realTarget}'`
        };
      }
    } else {
      // Regular file or directory: verify realpath
      const realTarget = await fs.realpath(targetPath);
      if (!isPathInside(realRoot, realTarget)) {
        return {
          isValid: false,
          error: `Path escape detected: '${userProvidedPath}' resolves outside workspace to '${realTarget}'`
        };
      }
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      return { isValid: false, error: `Failed verifying path: ${err.message}` };
    }
    // targetPath does not exist on disk at all. Proceed to check parent directories.
  }

  // 2. For files being written into parent directories, verify all existing parent directories
  let current = path.dirname(targetPath);
  while (current && current !== path.dirname(current)) {
    try {
      const parentLstat = await fs.lstat(current);
      if (parentLstat.isSymbolicLink()) {
        let realCurrent: string;
        try {
          realCurrent = await fs.realpath(current);
        } catch {
          return {
            isValid: false,
            error: `Symlink escape detected: parent directory '${current}' is an unresolvable symlink.`
          };
        }

        if (!isPathInside(realRoot, realCurrent) && realCurrent !== realRoot) {
          return {
            isValid: false,
            error: `Symlinked parent directory '${current}' escapes workspace to '${realCurrent}'`
          };
        }
      } else {
        const realCurrent = await fs.realpath(current);
        if (!isPathInside(realRoot, realCurrent) && realCurrent !== realRoot) {
          return {
            isValid: false,
            error: `Parent directory '${current}' escapes workspace to '${realCurrent}'`
          };
        }
      }
    } catch (e: any) {
      if (e.code === "ENOENT") {
        current = path.dirname(current);
        continue;
      }
      return { isValid: false, error: `Failed verifying parent path '${current}': ${e.message}` };
    }

    if (current === resolvedRoot || current === realRoot) break;
    current = path.dirname(current);
  }

  return lexical;
}

