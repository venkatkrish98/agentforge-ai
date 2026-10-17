# AgentForge AI 🛠️⚡

> **Autonomous AI-Assisted Coding, Safe Sandbox Test Execution, and Evidence-Backed Test Repair**  
> *Built for the **Nebius × NVIDIA Global AI Hackathon** (Coding & Agentic Engineering Track)*

[![Tests](https://img.shields.io/badge/tests-27%20passed-emerald)](https://github.com/)
[![Nebius Token Factory](https://img.shields.io/badge/Nebius-Token%20Factory%20Live-cyan)](https://tokenfactory.nebius.com)
[![NVIDIA Nemotron](https://img.shields.io/badge/Model-NVIDIA%20Nemotron%203.5%20Lightning-purple)](https://www.nvidia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 Project Overview & Core Differentiation

Most AI coding assistants function merely as conversational chatbots or static code-review tools: they output speculative snippets, summarize pull requests, and leave the human engineer to manually copy code, troubleshoot build errors, and debug runtime failures.

**AgentForge AI** is fundamentally different. It is an **active, closed-loop software repair agent**:
1. **Task & Project Ingestion:** Ingests a task description and target repository context into an isolated workspace.
2. **Autonomous Planning:** Employs **NVIDIA Nemotron** via **Nebius Token Factory** to formulate an evidence-backed, multi-phase repair plan.
3. **Safe Patch Formulation:** Synthesizes precision source code modifications and generates readable unified diffs.
4. **Human-in-the-Loop Approval Gate:** Pauses for human review before any code is written to disk or tests are executed.
5. **Isolated Sandbox Test Runner:** Runs the project's test suite inside an isolated environment governed by a strict command allowlist (`node --test`, `npm test`), process timeouts, and environment variable secret-stripping.
6. **Bounded Iterative Repair Loop:** Analyzes actual runtime `stdout`, `stderr`, stack traces, and failing assertions, executing surgical iterative repairs with SHA-256 loop detection to prevent infinite cycles.
7. **Evidence-Backed Verification Synthesis:** Outputs verified passing assertion checklists and exports standardized `.patch` files.

---

## 🚀 Live Nebius Token Factory & NVIDIA Model Integration

AgentForge AI is built natively on **Nebius Token Factory** high-performance inference cloud, leveraging **NVIDIA's open models**:

| Config | Value | Notes |
|---|---|---|
| **API Provider** | **Nebius Token Factory** | High-throughput CUDA inference infrastructure |
| **API Base URL** | `https://api.tokenfactory.nebius.com/v1/` | OpenAI-compatible server-side completions |
| **Primary Model** | `nvidia/Nemotron-3_5-Lightning` | 131k context window, sub-2s latency, high precision reasoning |
| **Alternative Models** | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`<br/>`nvidia/nemotron-3-super-120b-a12b`<br/>`nvidia/Nemotron-3-Ultra-550b-a55b` | Switchable directly via Model Settings |
| **Credential Safety** | `process.env.NEBIUS_API_KEY` | Server-side only; masked in UI, stripped from child test processes |
| **Honest Mock Mode** | Automated fallback or manual toggle | Clearly labeled visual badges; never fabricates fake cloud results |

---

## 📦 Bundled Sample Demo Projects

Judges and evaluators can immediately run complete end-to-end coding and repair workflows using the three bundled sample projects:

1. **CalcVault (Financial Math Engine):**
   - *Issues:* Division by zero returns `NaN` instead of throwing `DivisionByZeroError`; compound interest formula has an off-by-one compounding exponent.
   - *Test Suite:* `node --test test/calculator.test.js` (2 failing tests initially).
   - *Result:* Agent analyzes math defects, fixes zero checks and compounding formula, verifies all 5 assertions pass.

2. **AuthTokenGuard (JWT & Header Validator):**
   - *Issues:* Null `Authorization` headers throw uncaught `TypeError`; token expiration compares UNIX epoch seconds with `Date.now()` milliseconds.
   - *Test Suite:* `node --test test/token-guard.test.js` (2 failing tests initially).
   - *Result:* Agent adds null-safe header parsing and normalizes epoch timestamps, verifying all 5 assertions pass.

3. **AsyncEventBus (Concurrent Event Dispatcher):**
   - *Issues:* Asynchronous listener exceptions are silently swallowed; failed dispatches are never recorded.
   - *Test Suite:* `node --test test/event-bus.test.js` (2 failing tests initially).
   - *Result:* Agent wraps dispatches, records failures in audit buffer, propagates exceptions, verifying all 3 assertions pass.

---

## 🔒 Security Architecture & Sandbox Guardrails

- **Zero Credential Exfiltration:** `NEBIUS_API_KEY` and all environment variables are stripped before spawning test subprocesses.
- **Command Allowlist:** Only permitted commands (`node --test [args]`, `npm test`, `npx vitest run`) are executed. Shell chaining (`;&|`$<>`) is strictly rejected.
- **Path Traversal Guard:** All file writes and reads are resolved within the task sandbox root. Traversal tokens (`../`) and Windows device names (`CON`, `PRN`, `NUL`) are rejected.
- **Prompt Injection Neutralization:** Repository contents, code comments, and issue descriptions are treated strictly as untrusted string data within system prompts.
- **Loop Detector:** Computes deterministic SHA-256 fingerprints of proposed patches to halt oscillating repair attempts.

---

## 💻 Quick Start & Setup

### 1. Prerequisites
- **Node.js:** v18.0.0 or later (tested on v20 and v24)
- **npm:** v9.0.0 or later

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/agentforge-ai.git
cd agentforge-ai
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root (see `.env.example`):
```bash
# Nebius Token Factory Configuration
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/
NEBIUS_MODEL=nvidia/Nemotron-3_5-Lightning
PORT=3000
TEST_RUNNER_TIMEOUT_MS=15000
MAX_REPAIR_ATTEMPTS=3
```
*(Note: If `NEBIUS_API_KEY` is not provided, AgentForge AI automatically activates Honest Mock Mode with visual badges).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🧪 Test Execution

The codebase includes comprehensive unit and integration test suites:
```bash
# Run all unit and integration tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Verified Test Coverage Summary:
- **Path Validator:** 6 tests (relative paths, path traversal `../`, null bytes, Windows device names).
- **Test Runner & Allowlist:** 5 tests (approved commands, dangerous chaining rejection, TAP output parsing, subprocess execution).
- **Loop Detector:** 4 tests (SHA-256 fingerprinting, attempt limits, cyclic proposal detection).
- **Nebius Parser:** 4 tests (`<think>` tag stripping, markdown JSON extraction, malformed recovery).
- **Patch Applier:** 2 tests (unified diff additions/deletions, snapshot rollback).
- **Provider & Prompt Injection:** 4 tests (model catalog, missing key mock mode, secret masking, injection isolation).
- **Task Orchestrator Lifecycle:** 2 integration tests (complete Plan -> Propose -> Approve -> Sandbox Test -> Repair -> Export journey).
- **Total:** **27 tests passed (100% pass rate)**.

---

## 🎬 3-Minute Hackathon Demo Script

1. **0:00 - 0:30 (Problem & Architecture):**
   - Introduce AgentForge AI as an active coding and evidence-backed repair agent for the Nebius × NVIDIA Hackathon.
   - Show the restrained developer workspace UI and the live Nebius Token Factory indicator in the top navbar.
2. **0:30 - 1:00 (Model Settings & Live Diagnostic):**
   - Navigate to `/settings`.
   - Click **"Test Connection"** to show a live 1.4s roundtrip ping to Nebius Token Factory serving `nvidia/Nemotron-3_5-Lightning`. Show masked key and 28 verified models.
3. **1:00 - 2:00 (The Autonomous Repair Loop):**
   - Return to `/` and select **CalcVault**.
   - Click **"Start Repair Run"**.
   - Show Nemotron generating the structured 5-phase plan.
   - Switch to **Code Diff** tab: observe the human approval gate displaying precise additions and deletions.
   - Click **"Approve & Run Tests"**.
   - Watch the isolated sandbox test runner execute `node --test test/calculator.test.js`.
   - Show test evidence: exit code, duration, parsed assertions (failing tests detected, followed by autonomous repair cycle and 100% pass).
4. **2:00 - 2:45 (Evidence Verification & Export):**
   - Open **Final Report** tab: review verified passing checklist, assumptions, and execution metrics.
   - Click **"Export .patch"** to download the patch.
5. **2:45 - 3:00 (Security & Wrap Up):**
   - Highlight the strict sandbox command allowlist, secret redaction, and loop detection on `/architecture`.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
