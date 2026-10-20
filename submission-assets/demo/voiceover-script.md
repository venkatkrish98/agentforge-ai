# AgentForge AI — Hackathon Demo Voiceover Script

**Project:** AgentForge AI  
**Track:** Coding and Agentic Engineering (Nebius × NVIDIA Global AI Hackathon)  
**Total Duration:** `02:36.25` (156.25 seconds) — well within the 3:00 hackathon limit  
**Pacing:** Natural, confident, professional tech walkthrough  
**Scale:** 100% default browser scale (1920×1080 viewport, no artificial zoom/crop cuts)  

---

### Scene 1: Hook & Workspace Introduction (`0:00 – 0:23.4`, 23.4s)
- **Visual:** Full-scale AgentForge AI workspace (`http://127.0.0.1:3000/?tab=overview`). Shows clean dark UI, top navbar with Nebius × NVIDIA banner, and active workspaces list.
> *"Welcome to AgentForge AI, an AI-assisted coding and test-repair workspace built for the Nebius and NVIDIA Global AI Hackathon. Traditional AI coding assistants act as conversational chatbots, leaving developers to manually copy snippets, fix syntax errors, and debug runtime failures. AgentForge AI turns a coding task into an evidence-backed, human-reviewed, and verified repair loop."*

---

### Scene 2: CalcVault Selection & Bug Objective (`0:23.4 – 0:41.8`, 18.5s)
- **Visual:** Full-scale CalcVault developer workbench. Shows 2 failing unit tests (`safeDivide` zero denominator and `calculateCompoundInterest` exponent defect) and primary **Start Repair Run** button.
> *"Here in the developer workbench, we select CalcVault, a financial math operations engine with two critical unit test failures. Safe-divide returns NaN on a zero denominator instead of throwing an error, and compound interest calculations fail due to rate scaling and an exponent defect. Let's start the repair run."*

---

### Scene 3: Model Settings & Live Nebius Diagnostic (`0:41.8 – 1:05.7`, 23.9s)
- **Visual:** Full-scale Model & Settings page (`/settings?test=1`). Shows completed live diagnostic: green **Nebius Connection Healthy** badge, **Latency: 1552ms**, verified model `nvidia/Nemotron-3_5-Lightning`, 28 models verified, and masked key `•••••••••••••••••••••••• (Server-Isolated)`.
> *"In Model Settings, AgentForge AI connects live to Nebius Token Factory, streaming low-latency inference using NVIDIA Nemotron 3.5 Lightning. Watch our live connection diagnostic: the verification ping succeeds with healthy latency and zero authentication errors. All API credentials remain strictly server-isolated, fully masked, and never exposed to client bundles or child processes."*

---

### Scene 4: Autonomous Plan Formulating (`1:05.8 – 1:27.5`, 21.7s)
- **Visual:** Full-scale Plan tab showing Nemotron's 5-phase structured execution plan: diagnose division checks, formulate surgical repairs, snapshot prior state, run the test suite, and compile verification evidence.
> *"Returning to the workspace, Nemotron analyzes the repository AST and formulates a five-phase plan: diagnose division checks, formulate surgical repairs, snapshot prior state, run the test suite, and compile verification evidence. The agent maps out each phase before modifying any source code."*

---

### Scene 5: Code Diff & Human Approval Gate (`1:22.8 – 1:46.4`, 23.6s)
- **Visual:** Full-scale Code Diff tab showing unified diff on `calculator.js` (red removals, green additions) and amber **Human Approval Gate Required** banner with **Approve & Run Tests** and **Reject & Abort** buttons.
> *"Switching to the Code Diff tab, we see the generated unified diff. It introduces defensive zero guards and corrects the compound interest formula. Notice our core safety principle: the Human Approval Gate. No files are written to disk and no execution occurs until an engineer reviews the proposed diff. The developer maintains complete authority, with the choice to approve or reject with instant rollback."*

---

### Scene 6: Approve & 143ms Real Test Execution (`1:46.4 – 2:09.3`, 22.9s)
- **Visual:** Full-scale Tests & Evidence tab showing real test execution: **EXIT CODE: 0 (SUCCESS)**, **DURATION: 143ms**, **PASSED ASSERTIONS: 5 / 5** with green checkmarks.
> *"We click Approve and Run Tests. The test runner executes as a host subprocess governed by strict command allowlists, directory containment, and purged environment variables. Watch the real execution: all five assertions pass with exit code zero in just 143 milliseconds. Zero division throws the expected error, and compounding matches exact currency precision."*

---

### Scene 7: Final Evidence Synthesis & Patch Export (`2:09.3 – 2:24.6`, 15.3s)
- **Visual:** Full-scale Final Report tab with Evidence-Backed Verification Synthesis panel, verified behaviors, and one-click cyan **Export .patch** button.
> *"In the Final Report tab, AgentForge AI synthesizes evidence: verified test checklists, duration metrics, and loop detection fingerprints. We click Export Patch to immediately download a standard git-compatible unified patch file ready for pull request review."*

---

### Scene 8: Summary & Hackathon Track Attribution (`2:24.6 – 2:36.2`, 11.6s)
- **Visual:** Clean closing summary title card highlighting core pillars: NVIDIA Nemotron on Nebius Token Factory, Human Approval Gate, and Deterministic Verification.
> *"AgentForge AI brings deterministic evidence and human oversight to generative coding, powered by NVIDIA Nemotron on Nebius Token Factory. Safe, verified, and developer-first."*
