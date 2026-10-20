# AgentForge AI — Hackathon Demo Voiceover Script

**Project:** AgentForge AI  
**Track:** Coding and Agentic Engineering (Nebius × NVIDIA Global AI Hackathon)  
**Total Duration:** `02:45.04` (165.04 seconds)  
**Pacing:** Brisk, conversational, professional tech presentation  

---

### Scene 1: Hook & Workspace Introduction (`0:00 – 0:26`, 26.5s)
- **Visual:** Wide view of AgentForge AI dashboard (`http://127.0.0.1:3000/?tab=overview`). Subtle zoom into active workbench and workspace list.
> *"Welcome to AgentForge AI, an AI-assisted coding and test-repair workspace built for the Nebius and NVIDIA Global AI Hackathon. Most AI coding assistants act as conversational chatbots that leave developers to manually copy snippets, fix syntax errors, and debug runtime failures. AgentForge AI is fundamentally different: it turns an issue into a reviewed, tested, and evidence-backed repair loop with full deterministic verification."*

---

### Scene 2: CalcVault Selection & Bug Objective (`0:26 – 0:47`, 21.0s)
- **Visual:** Close-up cut to the CalcVault Task Objective card. Focus on failing unit test descriptions (`safeDivide` zero denominator and `calculateCompoundInterest` exponent defect) and click on **Start Repair Run**.
> *"Here in our developer dashboard, we select CalcVault, a financial math operations engine. CalcVault has two critical unit test failures: safeDivide returns NaN instead of throwing DivisionByZeroError on zero divisor, and the compound interest calculation has rate scaling and exponent defects. Let's start the repair run."*

---

### Scene 3: Model Settings & Nebius Token Factory (`0:47 – 01:09`, 22.0s)
- **Visual:** Cut to `/settings`. Focus on the live **Nebius Token Factory** connection diagnostic, sub-2s latency, selected `nvidia/Nemotron-3_5-Lightning`, and fully masked key `•••••••••••••••••••••••• (Server-Isolated)`.
> *"In Model Settings, AgentForge AI is connected live to Nebius Token Factory, streaming low-latency inference using NVIDIA Nemotron 3.5 Lightning. Nebius delivers fast completions in under two seconds. All API credentials remain strictly server-isolated, fully masked, and never exposed to client bundles or child processes."*

---

### Scene 4: Autonomous Plan & Code Diff (`01:09 – 01:33`, 24.0s)
- **Visual:** Return to workspace. First 12s on Plan tab (4-phase structured plan formulated by Nemotron). Then cut to Code Diff tab, focusing on `src/calculator.js` (red removal of `return NaN;`, green addition of defensive error checks and corrected compounding math).
> *"Returning to the workspace, Nemotron analyzes the repository AST and formulates a four-phase plan: diagnose division checks, repair compounding math, run the test suite, and compile verification evidence. Switching to the Code Diff tab, we see the generated unified diff. It introduces defensive zero guards and corrects the compound interest formula with clean mathematical precision."*

---

### Scene 5: Human Approval Gate (`01:33 – 01:47`, 14.0s)
- **Visual:** Close-up zoom on amber **Human Approval Gate Required** banner, `Waiting for human sign-off on diff`, and action buttons (`Reject & Abort` / `Approve & Run Tests`).
> *"Notice our core safety principle: the Human Approval Gate. No files are written to disk and no execution occurs until an engineer reviews the proposed diff. Developers can inspect exact line additions and deletions, retaining complete control with the choice to approve or reject with instant rollback."*

---

### Scene 6: Approve & 174ms Real Test Execution (`01:47 – 02:17`, 30.0s)
- **Visual:** Click **Approve & Run Tests**. Cut to **Tests & Evidence** tab. Show real execution metrics: `Exit Code: 0 (SUCCESS)`, `Duration: 174ms`, `Passed Assertions: 5 / 5`, and green checkmarks for all 5 test cases.
> *"We click Approve and Run Tests. The test runner executes as a host subprocess governed by strict command allowlists, directory containment, and purged environment variables. Watch the real execution: all five assertions pass with exit code zero in just 174 milliseconds. Zero division throws the expected error, and financial compounding matches expected precision."*

---

### Scene 7: Final Evidence Synthesis & Patch Export (`02:17 – 02:34`, 17.0s)
- **Visual:** Cut to **Final Report** tab. Show Evidence-Backed Verification Synthesis, verified behaviors, explicit assumptions, and hover on cyan **Export .patch** button.
> *"In the Final Report tab, AgentForge AI synthesizes evidence: verified test checklists, execution duration metrics, and loop detection fingerprints. We click Export Patch to immediately download a standard git-compatible unified patch file ready for pull requests or CI pipelines."*

---

### Scene 8: Summary & Hackathon Attribution (`02:34 – 02:45`, 10.6s)
- **Visual:** Clean closing title card with AgentForge AI branding, architecture summary, and hackathon track attribution.
> *"AgentForge AI brings deterministic evidence and human oversight to generative coding, powered by NVIDIA Nemotron on Nebius Token Factory. Safe, verified, and developer-first."*
