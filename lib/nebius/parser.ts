/**
 * Strips thinking / reasoning tags from models like Nemotron, DeepSeek, etc.
 * e.g., <think>...</think> or thinking prelude blocks.
 */
export function stripThinkingBlocks(rawContent: string): string {
  if (!rawContent) return "";
  
  // Remove <think>...</think>
  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Remove "Here's a thinking process: ... ```json"
  if (cleaned.startsWith("Here's a thinking process:") || cleaned.startsWith("Thinking Process:")) {
    const jsonStart = cleaned.indexOf("```json");
    if (jsonStart !== -1) {
      cleaned = cleaned.substring(jsonStart);
    } else {
      const braceStart = cleaned.indexOf("{");
      if (braceStart !== -1) {
        cleaned = cleaned.substring(braceStart);
      }
    }
  }

  return cleaned.trim();
}

/**
 * Extracts and parses a JSON object from model output (handling code fences and text wrapping).
 */
export function extractJsonFromResponse<T = any>(rawText: string): { data: T | null; error?: string } {
  const stripped = stripThinkingBlocks(rawText);

  // Attempt 1: direct parse
  try {
    const parsed = JSON.parse(stripped);
    return { data: parsed as T };
  } catch {
    // Continue
  }

  // Attempt 2: extract from ```json ... ```
  const codeBlockMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      return { data: parsed as T };
    } catch {
      // Continue
    }
  }

  // Attempt 3: find outermost JSON object { ... }
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const slice = stripped.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(slice);
      return { data: parsed as T };
    } catch {
      // Continue
    }
  }

  // Attempt 4: find outermost JSON array [ ... ]
  const firstBracket = stripped.indexOf("[");
  const lastBracket = stripped.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const slice = stripped.substring(firstBracket, lastBracket + 1);
      const parsed = JSON.parse(slice);
      return { data: parsed as T };
    } catch {
      // Continue
    }
  }

  return {
    data: null,
    error: `Failed to extract valid JSON from model response. Preview: ${stripped.substring(0, 200)}...`
  };
}
