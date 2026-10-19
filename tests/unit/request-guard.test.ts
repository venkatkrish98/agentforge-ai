import { describe, it, expect } from "vitest";
import { validateLocalMutationRequest, extractHostname } from "@/lib/security/request-guard";

describe("Request Guard & DNS Rebinding Protection", () => {
  it("extracts hostnames correctly for IPv4, localhost, and bracketed IPv6", () => {
    expect(extractHostname("localhost:3000")).toBe("localhost");
    expect(extractHostname("127.0.0.1:3000")).toBe("127.0.0.1");
    expect(extractHostname("[::1]:3000")).toBe("[::1]");
    expect(extractHostname("[::1]")).toBe("[::1]");
    expect(extractHostname("attacker.com:8080")).toBe("attacker.com");
  });

  it("permits IPv6 loopback requests with Host: [::1]:3000", () => {
    const req = new Request("http://[::1]:3000/api/tasks/reset", {
      method: "POST",
      headers: {
        host: "[::1]:3000",
        origin: "http://[::1]:3000",
        "x-agentforge-request": "1"
      }
    });
    const res = validateLocalMutationRequest(req);
    expect(res.isAllowed).toBe(true);
  });

  it("permits IPv4 loopback requests with Host: 127.0.0.1:3000", () => {
    const req = new Request("http://127.0.0.1:3000/api/tasks/reset", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3000",
        origin: "http://127.0.0.1:3000",
        "x-agentforge-request": "1"
      }
    });
    const res = validateLocalMutationRequest(req);
    expect(res.isAllowed).toBe(true);
  });

  it("rejects hostile Host header from DNS rebinding attack with 403", () => {
    const req = new Request("http://127.0.0.1:3000/api/tasks/reset", {
      method: "POST",
      headers: {
        host: "attacker.com:3000",
        origin: "http://attacker.com:3000"
      }
    });
    const res = validateLocalMutationRequest(req);
    expect(res.isAllowed).toBe(false);
    expect(res.errorResponse?.status).toBe(403);
  });

  it("rejects blind requests lacking origin and custom header", () => {
    const req = new Request("http://127.0.0.1:3000/api/tasks/reset", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3000"
      }
    });
    const res = validateLocalMutationRequest(req);
    expect(res.isAllowed).toBe(false);
    expect(res.errorResponse?.status).toBe(403);
  });
});
