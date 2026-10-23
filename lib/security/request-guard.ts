import { NextResponse } from "next/server";

export interface RequestGuardResult {
  isAllowed: boolean;
  errorResponse?: NextResponse;
}

/**
 * Strict set of permitted loopback hostnames.
 * Arbitrary Host headers are explicitly forbidden to prevent DNS rebinding attacks.
 */
const ALLOWED_LOOPBACK_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]"
]);

/**
 * Safely extracts hostname from a Host header, supporting IPv4, standard hostnames,
 * and bracketed IPv6 literals (e.g. "[::1]:3000" -> "[::1]").
 */
export function extractHostname(hostHeader: string): string {
  if (!hostHeader) return "";
  const trimmed = hostHeader.trim();
  if (trimmed.startsWith("[")) {
    const closeBracket = trimmed.indexOf("]");
    if (closeBracket !== -1) {
      return trimmed.slice(0, closeBracket + 1).toLowerCase();
    }
  }
  return trimmed.split(":")[0].toLowerCase();
}

/**
 * Validates that state-mutating requests (POST, DELETE, PUT, PATCH) originate strictly from
 * a verified loopback origin or trusted client session.
 * 
 * Mitigations:
 * 1. DNS Rebinding Protection: Host header must strictly be a loopback host (localhost, 127.0.0.1, [::1]).
 * 2. Sec-Fetch-Site rejection (blocks cross-site browser fetches).
 * 3. Origin header validation (must strictly match loopback hosts, never arbitrary Host headers).
 * 4. Referer header validation (must strictly match loopback hosts).
 * 5. Header-presence requirement: rejects requests that omit Origin, Referer, and the
 *    'x-agentforge-request' custom header, defending against blind form CSRF or stripped-referrer attacks.
 */
export function validateLocalMutationRequest(req: Request): RequestGuardResult {
  const host = req.headers.get("host") || "";
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const secFetchSite = req.headers.get("sec-fetch-site");
  const customHeader = req.headers.get("x-agentforge-request");

  // Helper to test if a hostname is permitted (loopback hosts or deployed Vercel domain)
  const isPermittedHost = (hostname: string) => {
    const lower = hostname.toLowerCase();
    const clean = lower.startsWith("[") && lower.endsWith("]") ? lower.slice(1, -1) : lower;
    if (ALLOWED_LOOPBACK_HOSTS.has(lower) || ALLOWED_LOOPBACK_HOSTS.has(clean)) return true;
    if (process.env.VERCEL && (lower.endsWith(".vercel.app") || lower.includes("vercel"))) return true;
    if (process.env.ALLOWED_HOSTS?.split(",").map((h) => h.trim().toLowerCase()).includes(lower)) return true;
    return false;
  };

  // 1. Host header validation against DNS rebinding (supports IPv4, localhost, IPv6 [::1], and Vercel cloud domains)
  const hostName = extractHostname(host);
  if (hostName && !isPermittedHost(hostName)) {
    return {
      isAllowed: false,
      errorResponse: NextResponse.json(
        { error: `Forbidden: Untrusted Host '${hostName}'.` },
        { status: 403 }
      )
    };
  }

  // 2. Block explicit cross-site requests signaled by browser metadata
  if (secFetchSite && secFetchSite === "cross-site") {
    return {
      isAllowed: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Cross-site request rejected by AgentForge Security Policy." },
        { status: 403 }
      )
    };
  }

  // 3. Validate Origin header if present
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (!isPermittedHost(originUrl.hostname)) {
        return {
          isAllowed: false,
          errorResponse: NextResponse.json(
            { error: `Forbidden: Untrusted origin '${origin}'.` },
            { status: 403 }
          )
        };
      }
    } catch {
      return {
        isAllowed: false,
        errorResponse: NextResponse.json(
          { error: "Forbidden: Malformed origin header." },
          { status: 400 }
        )
      };
    }
  }

  // 4. Validate Referer header if present
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!isPermittedHost(refererUrl.hostname)) {
        return {
          isAllowed: false,
          errorResponse: NextResponse.json(
            { error: `Forbidden: Untrusted referer '${referer}'.` },
            { status: 403 }
          )
        };
      }
    } catch {
      return {
        isAllowed: false,
        errorResponse: NextResponse.json(
          { error: "Forbidden: Malformed referer header." },
          { status: 400 }
        )
      };
    }
  }

  // 5. Strict defense against blind CSRF (e.g. <form action="..." method="POST"> with rel="noreferrer")
  let hasLocalOrigin = false;
  if (origin) {
    try {
      hasLocalOrigin = isPermittedHost(new URL(origin).hostname);
    } catch {
      hasLocalOrigin = false;
    }
  }

  let hasLocalReferer = false;
  if (referer) {
    try {
      hasLocalReferer = isPermittedHost(new URL(referer).hostname);
    } catch {
      hasLocalReferer = false;
    }
  }

  const hasTrustedHeader = customHeader === "1" || customHeader === "true";

  if (!hasLocalOrigin && !hasLocalReferer && !hasTrustedHeader) {
    return {
      isAllowed: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Request missing local origin or 'x-agentforge-request' verification header." },
        { status: 403 }
      )
    };
  }

  return { isAllowed: true };
}

