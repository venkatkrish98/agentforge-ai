# AgentForge AI 🛠️⚡

> **Autonomous AI-Assisted Coding, Safe Sandbox Test Execution, and Evidence-Backed Test Repair**  
> *Built for the **Nebius × NVIDIA Global AI Hackathon** (Coding & Agentic Engineering Track)*

[![Tests](https://img.shields.io/badge/tests-35%20passed-emerald)](https://github.com/venkatkrish98/agentforge-ai)
[![Nebius Token Factory](https://img.shields.io/badge/Nebius-Token%20Factory%20Live-cyan)](https://tokenfactory.nebius.com)
[![NVIDIA Nemotron](https://img.shields.io/badge/Model-NVIDIA%20Nemotron%203.5%20Lightning-purple)](https://www.nvidia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 Project Overview & Core Differentiation

Most AI coding assistants function merely as conversational chatbots or static code-review tools: they output speculative snippets, summarize pull requests, and leave the human engineer to manually copy code, troubleshoot build errors, and debug runtime failures.

**AgentForge AI** is fundamentally different. It is an **active, closed-loop software repair agent**:
1. **Task & Project Ingestion:** Ingests a task description and target repository context into an isolated workspace directory.
2. **Autonomous Planning:** Employs **NVIDIA Nemotron** via **Nebius Token Factory** to formulate an evidence-backed, multi-phase repair plan.
3. **Safe Patch Formulation:** Synthesizes precision source code modifications and generates readable unified diffs.
4. **Human-in-the-Loop Approval Gate:** Pauses for human review before any code is written to disk or tests are executed.
5. **Governed Process Test Runner:** Runs the project's test suite via host child process execution governed by a strict command allowlist (`node --test`, `npm test`, `npx vitest run`), process timeouts (15s), and environment variable secret-stripping.
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

## 🔒 Security Architecture & Execution Guardrails

- **Zero Credential Exfiltration:** `NEBIUS_API_KEY` and all environment variables are systematically stripped before spawning test subprocesses.
- **Strict Command Allowlist:** Only permitted commands (`node --test [args]`, `npm test`, `npx vitest run`) are executed. Shell chaining (`;&|`$<>`) and metacharacters are strictly rejected.
- **Path Containment & Symlink Guard:** All file writes and reads use separator-aware `path.relative` checking (`!rel.startsWith("..") && !path.isAbsolute(rel)`) to eliminate sibling prefix traversal, reject symlink creation, and block external symlink targets.
- **Origin & CSRF Guard:** All state-mutating endpoints (`/api/tasks`, `/reset`, `/plan`, `/approve`, `/reject`, `/models/test`) require verified local origin headers (`localhost`, `127.0.0.1`).
- **Process Runner vs Container Isolation:** The test runner executes local child processes with tight guardrails and timeout enforcement. As with any test runner invoking `npm test`, it is designed for trusted local repositories; multi-tenant enterprise deployments running untrusted third-party code should containerize execution (e.g. Docker/gVisor).
- **Prompt Injection Neutralization:** Repository contents, code comments, and issue descriptions are treated strictly as untrusted string data within system prompts.
- **Loop Detector:** Computes deterministic SHA-256 fingerprints of proposed patches to halt oscillating repair attempts.

---

## 💻 Quick Start & Setup

### 1. Prerequisites
- **Node.js:** v18.0.0 or later (tested on v20 and v24)
- **npm:** v9.0.0 or later

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/venkatkrish98/agentforge-ai.git
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
- **Path Validator:** 9 tests (relative paths, sibling prefix containment, path traversal `../`, null bytes, Windows device names, and dangling symlink escape detection).
- **Request Guard & DNS Rebinding:** 5 tests (IPv4 loopback, IPv6 bracketed `[::1]:3000` literal parsing, hostile Host header 403 rejection, and blind CSRF prevention).
- **Test Runner & Allowlist:** 5 tests (approved commands, dangerous chaining rejection, TAP output parsing, subprocess execution).
- **Loop Detector:** 4 tests (SHA-256 fingerprinting, attempt limits, cyclic proposal detection).
- **Nebius Parser:** 4 tests (`<think>` tag stripping, markdown JSON extraction, malformed recovery).
- **Patch Applier:** 2 tests (unified diff additions/deletions, snapshot rollback).
- **Provider & Prompt Injection:** 4 tests (model catalog, missing key mock mode, secret masking, injection isolation).
- **Task Orchestrator Lifecycle:** 2 integration tests (complete Plan -> Propose -> Approve -> Sandbox Test -> Repair -> Export journey).
- **Total:** **35 tests passed (100% pass rate across 8 suites)**.

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
