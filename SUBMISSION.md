# Devpost Submission Draft: AgentForge AI

## Project Name
**AgentForge AI**

## Elevator Pitch
Autonomous AI-assisted coding and test-repair workspace powered by NVIDIA Nemotron on Nebius Token Factory. AgentForge writes real code, runs genuine tests in an isolated sandbox, diagnoses runtime failures, and performs bounded iterative repairs backed by verified assertion evidence.

---

## Track
**Coding and Agentic Engineering Track**  
*Nebius × NVIDIA Global AI Hackathon*

---

## Inspiration
Current AI coding tools fall into two camps:
1. **Passive chatbots:** They suggest snippets in markdown, but leave developers to manually copy, paste, test, and debug syntax and logic errors.
2. **Release-readiness & PR summary tools:** They provide high-level comments or checklists without actually writing code, running tests, or validating runtime behavior.

We asked: *What if an AI assistant could operate as a true junior engineer pair programmer?* An agent that doesn't stop at proposing code, but actually runs the unit tests, reads real `stdout`/`stderr` and stack traces, conducts root-cause diagnosis, and iteratively repairs defects in an isolated sandbox until 100% of the assertions pass—while keeping the human in control with approval gates and zero secret leakage.

---

## What It Does
**AgentForge AI** is an end-to-end autonomous coding and test-repair workspace:
1. **Task Ingestion & Project Context:** Select a sample project or import repository files.
2. **Multi-Phase Planning with NVIDIA Nemotron:** The agent generates an evidence-backed, step-by-step engineering plan.
3. **Safe Patch Proposal:** Synthesizes file modifications and displays readable unified diffs with line-by-line additions and deletions.
4. **Human Approval Gate:** Enforces human review before applying code to disk or executing tests.
5. **Isolated Sandbox Test Execution:** Runs approved test commands (`node --test`, `npm test`) under strict allowlists, 15s execution timeouts, and secret-stripped environments.
6. **Bounded Iterative Repair Loop:** Analyzes test failures and error traces to execute surgical repairs, equipped with SHA-256 loop detection to prevent infinite cycles.
7. **Evidence-Backed Synthesis:** Formulates verified passing checklists, explicit assumptions, and exports standardized `.patch` files.

---

## How We Built It
- **Inference Cloud:** **Nebius Token Factory** OpenAI-compatible completions API (`https://api.tokenfactory.nebius.com/v1/`).
- **AI Model:** **NVIDIA Nemotron 3.5 Lightning** (`nvidia/Nemotron-3_5-Lightning`), an optimized hybrid MoE model delivering frontier coding intelligence at sub-2s latency.
- **Frontend & App Layer:** Next.js 14 App Router, TypeScript strict mode, Tailwind CSS, Lucide icons.
- **Sandbox Engine:** Node child-process isolation, custom path traversal guards, atomic workspace snapshots, and TAP/spec test output parsers.
- **Safety & Loop Detection:** Deterministic SHA-256 patch fingerprinting, attempt counters, secret sanitization, and shell-operator rejection.
- **Testing:** 27 unit & integration tests across 7 test suites (Vitest) and Playwright E2E coverage.

---

## Nebius Token Factory & NVIDIA Integration
AgentForge AI connects directly to Nebius Token Factory:
- Verified model IDs: `nvidia/Nemotron-3_5-Lightning` (primary), `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`, `nvidia/nemotron-3-super-120b-a12b`, and `nvidia/Nemotron-3-Ultra-550b-a55b`.
- The server loads `NEBIUS_API_KEY` from environment variables, strictly protecting credentials from browser bundles and child subprocesses.
- Includes an active **Model Settings** page with live latency ping testing (averaging ~1.4s roundtrip).
- Honest Mock Mode: If credentials are not supplied, the platform falls back to a transparently labeled mock mode without fabricating cloud results.

---

## Challenges We Overcame
- **Reasoning Tag Handling:** High-capacity reasoning models like Nemotron often output thinking preludes (`<think>...</think>`). We engineered resilient parsers to strip reasoning tokens and reliably extract structured JSON.
- **Safe Subprocess Sandboxing:** Ensuring that running user-provided test suites cannot execute arbitrary shell commands required designing a strict regex allowlist and stripping sensitive environment variables.
- **Loop Oscillation:** Preventing the agent from bouncing between conflicting repairs required implementing deterministic SHA-256 patch fingerprinting and loop detection.

---

## What We Learned
- The **NVIDIA Nemotron 3.5 Lightning** model served on Nebius Token Factory delivers exceptional speed and reasoning precision for agentic iterative loops, consistently outperforming generic general-purpose models on code repair tasks.
- Combining structured JSON schemas with TAP output parsing creates a dependable feedback loop for autonomous agents.

---

## What's Next for AgentForge AI
- Docker/containerized sandbox execution for multi-language runtimes (Python, Go, Rust).
- Git branch integration to automatically open Pull Requests upon verification.
- Support for visual UI screenshot testing in web applications.
