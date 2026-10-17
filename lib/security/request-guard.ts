import { NextResponse } from "next/server";

export interface RequestGuardResult {
  isAllowed: boolean;
  errorResponse?: NextResponse;
}

/**
 * Validates that state-mutating requests (POST, DELETE, PUT) originate from a trusted local origin.
 * Defends against Cross-Site Request Forgery (CSRF) and unauthorized external invocations.
 */
export function validateLocalMutationRequest(req: Request): RequestGuardResult {
  const host = req.headers.get("host") || "";
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const secFetchSite = req.headers.get("sec-fetch-site");

  // If sec-fetch-site is present, reject cross-site requests
  if (secFetchSite && secFetchSite === "cross-site") {
    return {
      isAllowed: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Cross-site request rejected by AgentForge Security Policy." },
        { status: 403 }
      )
    };
  }

  // If origin is provided, verify it matches the host or localhost
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isLocalhost =
        originUrl.hostname === "localhost" ||
        originUrl.hostname === "127.0.0.1" ||
        originUrl.hostname === "::1";

      const hostWithoutPort = host.split(":")[0];
      const originMatchesHost = originUrl.hostname === hostWithoutPort;

      if (!isLocalhost && !originMatchesHost) {
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

  // If referer is provided without origin, verify it matches host
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      const isLocalhost =
        refererUrl.hostname === "localhost" ||
        refererUrl.hostname === "127.0.0.1" ||
        refererUrl.hostname === "::1";

      const hostWithoutPort = host.split(":")[0];
      const refererMatchesHost = refererUrl.hostname === hostWithoutPort;

      if (!isLocalhost && !refererMatchesHost) {
        return {
          isAllowed: false,
          errorResponse: NextResponse.json(
            { error: `Forbidden: Untrusted referer '${referer}'.` },
            { status: 403 }
          )
        };
      }
    } catch {
      // Ignore malformed referer
    }
  }

  return { isAllowed: true };
}
