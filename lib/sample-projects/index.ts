export interface SampleProject {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultTaskTitle: string;
  defaultTaskDescription: string;
  testCommand: string;
  files: {
    path: string;
    content: string;
  }[];
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: "calc-vault",
    name: "CalcVault (Financial Math Engine)",
    category: "Financial Computation",
    description: "Financial computation and expression evaluation utility with regression bugs in zero division handling and compound interest formulas.",
    defaultTaskTitle: "Repair zero-division safety and compound interest formula in CalcVault",
    defaultTaskDescription: "Two critical unit tests are failing in CalcVault:\n1. safeDivide(a, b) currently returns NaN when dividing by zero; it must throw an Error with message 'DivisionByZeroError: denominator cannot be zero'.\n2. calculateCompoundInterest(principal, ratePercent, years, compoundsPerYear) fails to compute the correct compound interest due to an off-by-one exponent error and improper rate scaling. Fix the math so interest compounds accurately as A = P * (1 + r/n)^(n*t).\nRun the unit tests, identify the failing assertions, apply precise patches, and verify all tests pass.",
    testCommand: "node --test test/calculator.test.js",
    files: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "calc-vault",
            version: "1.0.0",
            scripts: {
              test: "node --test test/calculator.test.js"
            }
          },
          null,
          2
        )
      },
      {
        path: "src/calculator.js",
        content: `/**
 * CalcVault Core Financial Math Operations
 */

class DivisionByZeroError extends Error {
  constructor(message = "DivisionByZeroError: denominator cannot be zero") {
    super(message);
    this.name = "DivisionByZeroError";
  }
}

/**
 * Safely divides two numbers.
 * Bug: Returns NaN instead of throwing DivisionByZeroError when b === 0.
 */
function safeDivide(a, b) {
  if (b === 0) {
    // BUG: Should throw new DivisionByZeroError("DivisionByZeroError: denominator cannot be zero")
    return NaN;
  }
  return a / b;
}

/**
 * Calculates compound interest.
 * Formula: A = P * (1 + r/n)^(n*t)
 * Total compound interest = A - P
 * @param {number} principal - Starting amount (P)
 * @param {number} ratePercent - Annual interest rate percentage (e.g. 5 for 5%)
 * @param {number} years - Time in years (t)
 * @param {number} compoundsPerYear - Compounding frequency (n)
 *
 * BUG: Exponent has an off-by-one compounding term and ratePercent is not divided by 100.
 */
function calculateCompoundInterest(principal, ratePercent, years, compoundsPerYear = 1) {
  if (principal < 0 || ratePercent < 0 || years < 0) {
    throw new Error("Inputs must be non-negative");
  }
  // BUG: rate is not converted to decimal and exponent is wrong
  const r = ratePercent; // should be ratePercent / 100
  const n = compoundsPerYear;
  const t = years;
  
  // Buggy compounding exponent
  const amount = principal * Math.pow(1 + r / n, n * (t - 1));
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
`
      },
      {
        path: "test/calculator.test.js",
        content: `const test = require("node:test");
const assert = require("node:assert/strict");
const { safeDivide, calculateCompoundInterest, applyDiscount } = require("../src/calculator.js");

test("CalcVault - safeDivide with normal inputs", () => {
  const result = safeDivide(10, 2);
  assert.equal(result, 5);
});

test("CalcVault - safeDivide throws DivisionByZeroError on zero divisor", () => {
  assert.throws(
    () => {
      safeDivide(10, 0);
    },
    /DivisionByZeroError/
  );
});

test("CalcVault - applyDiscount calculates correct discounted price", () => {
  const result = applyDiscount(100, 20);
  assert.equal(result, 80);
});

test("CalcVault - calculateCompoundInterest with annual compounding", () => {
  // P = 1000, rate = 5%, t = 2 years, n = 1
  // A = 1000 * (1 + 0.05)^2 = 1000 * 1.1025 = 1102.50
  // Interest = 102.50
  const interest = calculateCompoundInterest(1000, 5, 2, 1);
  assert.equal(interest, 102.50);
});

test("CalcVault - calculateCompoundInterest with quarterly compounding", () => {
  // P = 2000, rate = 8%, t = 3 years, n = 4 (quarterly)
  // r = 0.08, n = 4 => r/n = 0.02
  // nt = 4 * 3 = 12
  // A = 2000 * (1.02)^12 = 2000 * 1.26824179456 = 2536.48
  // Interest = 536.48
  const interest = calculateCompoundInterest(2000, 8, 3, 4);
  assert.equal(interest, 536.48);
});
`
      }
    ]
  },
  {
    id: "auth-token-guard",
    name: "AuthTokenGuard (JWT & Header Validator)",
    category: "Security & Authentication",
    description: "API authentication guard and token parser with null-safety and epoch timestamp comparison defects.",
    defaultTaskTitle: "Fix null header handling and token expiration in AuthTokenGuard",
    defaultTaskDescription: "Unit tests in AuthTokenGuard reveal two defects:\n1. extractBearerToken crashes with an uncaught TypeError when authorization header is undefined or empty string, instead of returning null.\n2. isTokenExpired incorrectly rejects valid tokens or accepts expired ones due to mismatched timestamp units (milliseconds vs seconds). Fix expiration check so tokens with exp in UNIX epoch seconds are compared against Math.floor(Date.now() / 1000).\nRun the test suite, repair the source code, and verify all tests pass.",
    testCommand: "node --test test/token-guard.test.js",
    files: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "auth-token-guard",
            version: "1.0.0",
            scripts: {
              test: "node --test test/token-guard.test.js"
            }
          },
          null,
          2
        )
      },
      {
        path: "src/token-guard.js",
        content: `/**
 * AuthTokenGuard - Token Extraction and Security Verification
 */

/**
 * Extracts a bearer token from the HTTP Authorization header.
 * Bug: Throws TypeError when authHeader is null or undefined.
 */
function extractBearerToken(authHeader) {
  // BUG: Missing null / undefined / empty check before calling .split
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

/**
 * Validates if a token payload is expired.
 * exp is in UNIX epoch seconds.
 * Bug: Compares epoch seconds directly with Date.now() (milliseconds), causing false expiration.
 */
function isTokenExpired(payload, nowSeconds = null) {
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }
  const currentSec = nowSeconds !== null ? nowSeconds : Date.now(); // BUG: should be Math.floor(Date.now() / 1000)
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
`
      },
      {
        path: "test/token-guard.test.js",
        content: `const test = require("node:test");
const assert = require("node:assert/strict");
const { extractBearerToken, isTokenExpired, hasRequiredScope } = require("../src/token-guard.js");

test("AuthTokenGuard - extractBearerToken parses standard bearer format", () => {
  const token = extractBearerToken("Bearer eyJhbGciOi...");
  assert.equal(token, "eyJhbGciOi...");
});

test("AuthTokenGuard - extractBearerToken handles null and undefined safely", () => {
  assert.equal(extractBearerToken(undefined), null);
  assert.equal(extractBearerToken(null), null);
  assert.equal(extractBearerToken(""), null);
});

test("AuthTokenGuard - isTokenExpired correctly marks future token as not expired", () => {
  // exp set to 1 hour into future (UNIX epoch seconds)
  const currentSeconds = Math.floor(Date.now() / 1000);
  const futurePayload = { exp: currentSeconds + 3600 };
  assert.equal(isTokenExpired(futurePayload), false);
});

test("AuthTokenGuard - isTokenExpired correctly marks past token as expired", () => {
  const currentSeconds = Math.floor(Date.now() / 1000);
  const pastPayload = { exp: currentSeconds - 60 };
  assert.equal(isTokenExpired(pastPayload), true);
});

test("AuthTokenGuard - hasRequiredScope validates permissions correctly", () => {
  const payload = { scopes: ["read:data", "write:code"] };
  assert.equal(hasRequiredScope(payload, "write:code"), true);
  assert.equal(hasRequiredScope(payload, "admin:all"), false);
});
`
      }
    ]
  },
  {
    id: "async-event-bus",
    name: "AsyncEventBus (Concurrent Event Dispatcher)",
    category: "Concurrency & Async",
    description: "Asynchronous pub/sub event pipeline with error propagation defects and unhandled listener rejections.",
    defaultTaskTitle: "Fix error propagation and listener rejection handling in AsyncEventBus",
    defaultTaskDescription: "AsyncEventBus handles async subscriber dispatching. However:\n1. When a subscriber listener throws or rejects, emitAsync swallows the failure and returns successfully instead of aggregating errors.\n2. getFailedDispatches() never records the rejected listener details.\nDiagnose the failure, update emitAsync to capture errors and re-throw or record them properly, and verify all tests pass.",
    testCommand: "node --test test/event-bus.test.js",
    files: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            name: "async-event-bus",
            version: "1.0.0",
            scripts: {
              test: "node --test test/event-bus.test.js"
            }
          },
          null,
          2
        )
      },
      {
        path: "src/event-bus.js",
        content: `/**
 * AsyncEventBus - Asynchronous pub/sub event pipeline
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
   * Bug: Ignores failures in listeners without recording them in failedDispatches or rejecting.
   */
  async emitAsync(event, payload) {
    const handlers = this.listeners.get(event) || [];
    // BUG: Catches errors and completely swallows them without recording in failedDispatches
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        // Swallowed! Should record in this.failedDispatches: { event, error: err.message, timestamp: Date.now() }
        // and throw AggregateError or reject if any handler failed!
      }
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
`
      },
      {
        path: "test/event-bus.test.js",
        content: `const test = require("node:test");
const assert = require("node:assert/strict");
const { AsyncEventBus } = require("../src/event-bus.js");

test("AsyncEventBus - dispatches event to successful listeners", async () => {
  const bus = new AsyncEventBus();
  let received = null;
  bus.on("task:done", (data) => {
    received = data;
  });

  await bus.emitAsync("task:done", { id: "123" });
  assert.deepEqual(received, { id: "123" });
});

test("AsyncEventBus - records failed dispatches when listener rejects", async () => {
  const bus = new AsyncEventBus();
  bus.on("user:signup", async () => {
    throw new Error("DatabaseTimeoutException");
  });

  await assert.rejects(
    async () => {
      await bus.emitAsync("user:signup", { user: "alice" });
    },
    /DatabaseTimeoutException/
  );

  const failures = bus.getFailedDispatches();
  assert.equal(failures.length, 1);
  assert.equal(failures[0].event, "user:signup");
  assert.equal(failures[0].error, "DatabaseTimeoutException");
});

test("AsyncEventBus - unsubscribe removes listener", async () => {
  const bus = new AsyncEventBus();
  let count = 0;
  const unsubscribe = bus.on("ping", () => {
    count++;
  });

  await bus.emitAsync("ping");
  assert.equal(count, 1);

  unsubscribe();
  await bus.emitAsync("ping");
  assert.equal(count, 1);
});
`
      }
    ]
  }
];
