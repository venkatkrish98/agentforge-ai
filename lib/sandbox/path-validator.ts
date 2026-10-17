import path from "node:path";

export interface PathValidationResult {
  isValid: boolean;
  safeRelativePath?: string;
  error?: string;
}

/**
 * Validates that a file path is safe and strictly resides within the target workspace directory.
 * Prevents:
 * - Path traversal (e.g., ../, ..\, /etc/passwd, C:\Windows)
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

  // Check for suspicious absolute prefixes
  if (/^(\/|[a-zA-Z]:)/.test(cleanPath)) {
    // If it's an absolute path, it MUST resolve inside workspaceRoot
    const resolved = path.resolve(cleanPath);
    const rootResolved = path.resolve(workspaceRoot);
    if (!resolved.startsWith(rootResolved)) {
      return {
        isValid: false,
        error: `Absolute path escapes workspace root: ${userProvidedPath}`
      };
    }
  }

  // Prevent path traversal tokens
  const segments = cleanPath.split("/").filter(Boolean);
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

  // Resolve inside workspace
  const resolvedTarget = path.resolve(workspaceRoot, cleanPath);
  const resolvedRoot = path.resolve(workspaceRoot);

  if (!resolvedTarget.startsWith(resolvedRoot)) {
    return {
      isValid: false,
      error: `Path resolves outside workspace boundaries: ${userProvidedPath}`
    };
  }

  const relative = path.relative(resolvedRoot, resolvedTarget).replace(/\\/g, "/");

  return {
    isValid: true,
    safeRelativePath: relative
  };
}
