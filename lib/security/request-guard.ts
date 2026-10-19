import { NextResponse } from "next/server";

export interface RequestGuardResult {
  isAllowed: boolean;
  errorResponse?: NextResponse;
}

/**
 * Validates that state-mutating requests (POST, DELETE, PUT, PATCH) originate strictly from
 * a verified local origin or trusted client session.
 * 
 * Mitigations:
 * 1. Sec-Fetch-Site rejection (blocks cross-site browser fetches).
 * 2. Origin header validation (must match localhost / 127.0.0.1 / ::1 / host).
 * 3. Referer header validation (must match localhost / 127.0.0.1 / host).
 * 4. Header-presence requirement: rejects requests that omit Origin, Referer, and the
 *    'x-agentforge-request' custom header, defending against blind form CSRF or stripped-referrer attacks.
 */
export function validateLocalMutationRequest(req: Request): RequestGuardResult {
  const host = req.headers.get("host") || "";
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const secFetchSite = req.headers.get("sec-fetch-site");
  const customHeader = req.headers.get("x-agentforge-request");

  // 1. Block explicit cross-site requests signaled by browser metadata
  if (secFetchSite && secFetchSite === "cross-site") {
    return {
      isAllowed: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Cross-site request rejected by AgentForge Security Policy." },
        { status: 403 }
      )
    };
  }

  // Helper to test if a hostname is local
  const isLocalHost = (hostname: string) =>
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === host.split(":")[0];

  // 2. Validate Origin header if present
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (!isLocalHost(originUrl.hostname)) {
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

  // 3. Validate Referer header if present
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!isLocalHost(refererUrl.hostname)) {
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

  // 4. Strict defense against blind CSRF (e.g. <form action="..." method="POST"> with rel="noreferrer")
  // If Origin, Referer, and Sec-Fetch-Site are completely absent, require the custom header 'x-agentforge-request'.
  // Browsers cannot set custom headers on cross-origin form submissions or unprompted navigation.
  const hasLocalOrigin = origin && isLocalHost(new URL(origin).hostname);
  const hasLocalReferer = referer && isLocalHost(new URL(referer).hostname);
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

