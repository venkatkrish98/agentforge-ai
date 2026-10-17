import { PlanStep, FileChange } from "@/lib/types/task";
import { generateUnifiedDiff } from "@/lib/sandbox/patch-applier";

export interface MockPlanResult {
  summary: string;
  steps: PlanStep[];
  initialHypothesis: string;
}

export interface MockPatchResult {
  rationale: string;
  filesToModify: {
    path: string;
    newContent: string;
  }[];
}

export interface MockRepairResult {
  diagnosis: string;
  proposedSolution: string;
  filesToModify: {
    path: string;
    newContent: string;
  }[];
}

/**
 * Honest Mock Provider for offline testing and local demo without API keys.
 * Clearly identified in all reports, events, and UI badges.
 */
export class MockNebiusProvider {
  static getPlan(projectId: string, taskDescription: string): MockPlanResult {
    const timestamp = Date.now();
    return {
      summary: `[MOCK / SIMULATED] Analyzed task requirements for ${projectId}: identified failing test cases and formula defects.`,
      initialHypothesis: `Unit tests indicate defects in edge case handling in ${projectId}. Applying surgical code repairs will restore 100% test pass rate.`,
      steps: [
        {
          id: `step_plan_1_${timestamp}`,
          title: "Inspect Codebase & Failing Assertions",
          description: "Analyze project source files and identify root cause of test failures.",
          status: "completed",
          actionType: "context_analysis",
          startedAt: timestamp,
          completedAt: timestamp + 200
        },
        {
          id: `step_plan_2_${timestamp}`,
          title: "Formulate Targeted Patch",
          description: "Generate precision source code repairs for zero-division checks and formula logic.",
          status: "pending",
          actionType: "patch_formulation"
        },
        {
          id: `step_plan_3_${timestamp}`,
          title: "Apply Patch with Snapshot Guard",
          description: "Validate path safety, snapshot prior state, and apply changes.",
          status: "pending",
          actionType: "patch_application"
        },
        {
          id: `step_plan_4_${timestamp}`,
          title: "Execute Test Suite in Sandbox",
          description: "Run configured test command and capture real stdout/stderr and exit codes.",
          status: "pending",
          actionType: "test_execution"
        },
        {
          id: `step_plan_5_${timestamp}`,
          title: "Verify Test Evidence & Synthesize Report",
          description: "Ensure all assertions pass and generate final verification report.",
          status: "pending",
          actionType: "final_verification"
        }
      ]
    };
  }

  static getFixForProject(
    projectId: string,
    existingFiles: { path: string; content: string }[]
  ): MockPatchResult {
    if (projectId === "calc-vault") {
      const fixedCalcJs = `/**
 * CalcVault Core Financial Math Operations (Repaired by AgentForge)
 */

class DivisionByZeroError extends Error {
  constructor(message = "DivisionByZeroError: denominator cannot be zero") {
    super(message);
    this.name = "DivisionByZeroError";
  }
}

/**
 * Safely divides two numbers.
 * Fixed: Throws DivisionByZeroError when denominator is zero.
 */
function safeDivide(a, b) {
  if (b === 0) {
    throw new DivisionByZeroError("DivisionByZeroError: denominator cannot be zero");
  }
  return a / b;
}

/**
 * Calculates compound interest.
 * Formula: A = P * (1 + r/n)^(n*t)
 * Total compound interest = A - P
 * Fixed: Rate divided by 100 and compounding exponent set to (n * t).
 */
function calculateCompoundInterest(principal, ratePercent, years, compoundsPerYear = 1) {
  if (principal < 0 || ratePercent < 0 || years < 0) {
    throw new Error("Inputs must be non-negative");
  }
  const r = ratePercent / 100;
  const n = compoundsPerYear;
  const t = years;
  
  const amount = principal * Math.pow(1 + r / n, n * t);
  const interest = amount - principal;
  
  return Number(interest.toFixed(2));
}

/**
 * Calculates percentage discount.
 */
function applyDiscount(price, discountPercent) {
  if (price < 0 || discountPercent < 0 || discountPercent > 100) {
    throw new Error("Invalid price or discount percent");
  }
  const discount = (price * discountPercent) / 100;
  return Number((price - discount).toFixed(2));
}

module.exports = {
  DivisionByZeroError,
  safeDivide,
  calculateCompoundInterest,
  applyDiscount
};
`;
      return {
        rationale: "[MOCK / SIMULATED] Fixed safeDivide zero-division check to throw DivisionByZeroError, converted ratePercent to decimal ratio, and corrected compounding exponent to n * t.",
        filesToModify: [
          {
            path: "src/calculator.js",
            newContent: fixedCalcJs
          }
        ]
      };
    }

    if (projectId === "auth-token-guard") {
      const fixedTokenGuardJs = `/**
 * AuthTokenGuard - Token Extraction and Security Verification (Repaired by AgentForge)
 */

/**
 * Extracts a bearer token from the HTTP Authorization header.
 * Fixed: Added safe null and undefined checks before string splitting.
 */
function extractBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  const parts = authHeader.trim().split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

/**
 * Validates if a token payload is expired.
 * exp is in UNIX epoch seconds.
 * Fixed: Normalized current timestamp to UNIX epoch seconds.
 */
function isTokenExpired(payload, nowSeconds = null) {
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }
  const currentSec = nowSeconds !== null ? nowSeconds : Math.floor(Date.now() / 1000);
  return payload.exp <= currentSec;
}

/**
 * Validates token scopes.
 */
function hasRequiredScope(payload, requiredScope) {
  if (!payload || !Array.isArray(payload.scopes)) {
    return false;
  }
  return payload.scopes.includes(requiredScope);
}

module.exports = {
  extractBearerToken,
  isTokenExpired,
  hasRequiredScope
};
`;
      return {
        rationale: "[MOCK / SIMULATED] Fixed null/undefined check in extractBearerToken and converted Date.now() to epoch seconds in isTokenExpired.",
        filesToModify: [
          {
            path: "src/token-guard.js",
            newContent: fixedTokenGuardJs
          }
        ]
      };
    }

    if (projectId === "async-event-bus") {
      const fixedEventBusJs = `/**
 * AsyncEventBus - Asynchronous pub/sub event pipeline (Repaired by AgentForge)
 */

class AsyncEventBus {
  constructor() {
    this.listeners = new Map();
    this.failedDispatches = [];
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.listeners.has(event)) return;
    const filtered = this.listeners.get(event).filter((h) => h !== handler);
    this.listeners.set(event, filtered);
  }

  /**
   * Dispatches event to all listeners concurrently.
   * Fixed: Records handler failures in failedDispatches and throws rejection.
   */
  async emitAsync(event, payload) {
    const handlers = this.listeners.get(event) || [];
    let firstError = null;

    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        this.failedDispatches.push({
          event,
          error: err.message || "UnknownHandlerError",
          timestamp: Date.now()
        });
        if (!firstError) {
          firstError = err;
        }
      }
    }

    if (firstError) {
      throw firstError;
    }
  }

  getFailedDispatches() {
    return [...this.failedDispatches];
  }

  clear() {
    this.listeners.clear();
    this.failedDispatches = [];
  }
}

module.exports = { AsyncEventBus };
`;
      return {
        rationale: "[MOCK / SIMULATED] Fixed emitAsync to capture handler errors, log them to failedDispatches, and propagate the error.",
        filesToModify: [
          {
            path: "src/event-bus.js",
            newContent: fixedEventBusJs
          }
        ]
      };
    }

    // Generic fallback for custom project in mock mode
    return {
      rationale: "[MOCK / SIMULATED] Generic template patch.",
      filesToModify: []
    };
  }
}
