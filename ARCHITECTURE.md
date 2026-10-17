# AgentForge AI: Technical Architecture Specification

## 1. Executive Summary

AgentForge AI is an autonomous, evidence-backed software repair workspace engineered for the **Nebius × NVIDIA Global AI Hackathon**. Unlike passive code-review assistants, AgentForge AI operates as a stateful, closed-loop engineering agent. It ingests problem descriptions and repository context, plans surgical fixes using **NVIDIA Nemotron** on **Nebius Token Factory**, validates and snapshots code changes, enforces human approval gates, runs test suites inside isolated sandboxes, and diagnoses runtime failures to execute bounded iterative repairs.

---

## 2. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AgentForge AI Client Web UI                     │
│  (Next.js App Router, Tailwind CSS Dark Theme, Lucide Icons, Zod)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Server-Side Orchestration Layer                     │
├────────────────────────┬───────────────────────────────────────────────┤
│  Task Orchestrator     │ Coordinates Plan -> Diff -> Test -> Repair   │
│  Nebius Client Adapter │ Calls Token Factory with NVIDIA Nemotron       │
│  Task Persistence      │ Atomic JSON Task Store & Event Audit Trail    │
└───────────┬────────────┴───────────────────────┬───────────────────────┘
            │                                    │
            ▼                                    ▼
┌─────────────────────────┐          ┌───────────────────────────────────┐
│  Nebius Token Factory   │          │     Isolated Sandbox Engine       │
│  (NVIDIA Nemotron 3.5)  │          ├───────────────────────────────────┤
│  • Base: /v1/           │          │ • Workspace Copier (runs/{id})    │
│  • Masked Server Secret │          │ • Path Traversal Guard (no ../)   │
│  • OpenAI Compatibility │          │ • Snapshot Backup & Reversible    │
│  • Thinking Tag Strip   │          │ • Command Allowlist (node, npm)   │
│  • JSON Output Parser   │          │ • Subprocess Timeout (15,000ms)   │
└─────────────────────────┘          │ • Secret Redaction from Child Env │
                                     │ • SHA-256 Repair Loop Detector    │
                                     └───────────────────────────────────┘
```

---

## 3. Data Flow & The 6-Stage Autonomous Loop

### Stage 1: Context & Task Ingestion
- User creates a task or selects one of the 3 bundled projects (`CalcVault`, `AuthTokenGuard`, `AsyncEventBus`).
- The project files are ingested into memory with strict validation against path traversal.
- The task record is initialized with status `idle` and recorded in the event audit timeline.

### Stage 2: Autonomous Planning with NVIDIA Nemotron
- The server formats a structured planning prompt containing the task description and file contexts.
- Nebius Token Factory runs inference using `nvidia/Nemotron-3_5-Lightning`.
- Reasoning prelude blocks (`<think>...</think>`) are sanitized by the parser.
- The response is parsed into structured, typed phases (`context_analysis`, `patch_formulation`, `patch_application`, `test_execution`, `failure_diagnosis`, `repair_iteration`, `final_verification`).

### Stage 3: Code Patch Formulation & Human-in-the-Loop Gate
- The model generates full replacement contents for files requiring repairs.
- The patch applier computes standard unified diffs and records line additions and deletions.
- If `requireApprovalForChanges` is enabled, the task pauses at `awaiting_approval`.
- A human engineer inspects the side-by-side or unified diff before authorizing workspace modification.

### Stage 4: Isolated Workspace Execution
- Once approved, an isolated task workspace directory is prepared in `workspaces-data/runs/{taskId}`.
- An in-memory snapshot of prior file state is captured to guarantee 100% reversible rollbacks.
- The patch is written to the isolated workspace.
- The test runner executes the configured test command (`node --test test/calculator.test.js`).
- The subprocess environment is stripped of all credentials (`NEBIUS_API_KEY`, tokens, passwords).
- Execution is strictly bounded by a 15-second timeout and 100KB output limit.

### Stage 5: Bounded Iterative Repair & Loop Detection
- The test runner parses `stdout` and `stderr` using TAP/spec parsers, extracting exit codes and assertions.
- If all assertions pass (`exitCode === 0`), execution advances to Stage 6.
- If assertions fail, the orchestrator triggers an iterative diagnosis cycle:
  1. Test runner `stdout`, `stderr`, stack traces, and failing assertions are sent to Nemotron.
  2. The model produces a root-cause diagnosis and a targeted fix.
  3. A deterministic SHA-256 fingerprint of the proposed repair is computed:
     `computePatchFingerprint(changes)`
  4. The loop detector evaluates if the fingerprint matches previous attempts or if `maxRepairAttempts` (default 3) has been exceeded.
  5. If duplicate or exceeded, execution halts to protect against resource waste.
  6. If clean, the repair is applied and tests are re-executed.

### Stage 6: Evidence Verification & Synthesis
- Upon passing all tests, the agent synthesizes an evidence report:
  - Itemized verified behaviors.
  - Remaining failed checks (if any).
  - Explicit skipped checks.
  - Engineering assumptions.
- An exportable `.patch` file is generated for developer download.

---

## 4. Component Modules

| Module | File | Purpose |
|---|---|---|
| **Nebius Client** | `lib/nebius/client.ts` | Server-side adapter for Nebius Token Factory |
| **Model Catalog** | `lib/types/models.ts` | Verified NVIDIA models metadata |
| **Parser** | `lib/nebius/parser.ts` | Strips reasoning tags and parses JSON |
| **Path Validator** | `lib/sandbox/path-validator.ts` | Guards against path traversal and device names |
| **Test Runner** | `lib/sandbox/test-runner.ts` | Secure subprocess execution and TAP parsing |
| **Patch Applier** | `lib/sandbox/patch-applier.ts` | Unified diffs, additions/deletions, snapshots |
| **Loop Detector** | `lib/sandbox/loop-detector.ts` | SHA-256 fingerprinting and iteration bounding |
| **Task Store** | `lib/storage/task-store.ts` | Persistence store and audit event log |
| **Sample Projects** | `lib/sample-projects/index.ts` | Bundled demo repositories with runnable tests |
