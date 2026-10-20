# AgentForge AI — Video Shot List & Visual Storyboard

- **Target Format:** 16:9 widescreen (1920 × 1080)
- **Framerate:** 30.0 fps progressive
- **Total Duration:** 2:45.04 (165.04 seconds)
- **Primary Source:** Real application at `http://127.0.0.1:3000` (zero mocked UI or test fakes)

---

## Dynamic 14-Shot Breakdown

| Shot | Timestamp | Duration | Framing / Camera Movement | Visual Elements & UI Actions | Voiceover Anchor |
|---|---|---|---|---|---|
| **Shot 1a** | `0:00 – 0:10.5` | 10.5s | Wide (1920×1080) | AgentForge AI Dashboard overview. Dark `#090d16` theme, top navbar with Nebius x NVIDIA banner, active workspaces list. | *"Welcome to AgentForge AI..."* |
| **Shot 1b** | `0:10.5 – 0:26.5` | 16.0s | Medium-close zoom | Workspace workbench header, task objective panel, and loop monitor widgets. | *"AgentForge AI is fundamentally different..."* |
| **Shot 2a** | `0:26.5 – 0:40.0` | 13.5s | Close-up on card | CalcVault task card. Highlights failing `safeDivide` division-by-zero bug and compound interest formula defect. | *"Here in our developer dashboard, we select CalcVault..."* |
| **Shot 2b** | `0:40.0 – 0:47.5` | 7.5s | Action focus | Target files (`package.json`, `src/calculator.js`, `test/calculator.test.js`) and click on **Start Repair Run**. | *"Let's start the repair run."* |
| **Shot 3a** | `0:47.5 – 0:58.5` | 11.0s | Cut to `/settings` | Live Connection Diagnostic card, active Nebius Token Factory connection, and sub-2s latency metrics. | *"In Model Settings, AgentForge AI is connected live..."* |
| **Shot 3b** | `0:58.5 – 01:09.5` | 11.0s | Close-up on security | Server-Side Secret Isolation card showing fully masked key `•••••••••••••••••••••••• (Server-Isolated)` and NVIDIA Nemotron 3.5 Lightning catalog card. | *"All API credentials remain strictly server-isolated..."* |
| **Shot 4a** | `01:09.5 – 01:21.5` | 12.0s | Return to workspace | Autonomous execution plan tab showing Nemotron's 4-phase structured repair steps. | *"Returning to the workspace, Nemotron analyzes the repository AST..."* |
| **Shot 4b** | `01:21.5 – 01:33.5` | 12.0s | Cut to Code Diff tab | Unified diff on `src/calculator.js`: red removal of `return NaN;`, green addition of `DivisionByZeroError` and corrected math formula. | *"Switching to the Code Diff tab, we see the generated unified diff..."* |
| **Shot 5** | `01:33.5 – 01:47.5` | 14.0s | Close-up on gate | Amber **Human Approval Gate Required** banner, `Waiting for human sign-off on diff`, and **Reject & Abort** / **Approve & Run Tests** buttons. | *"Notice our core safety principle: the Human Approval Gate..."* |
| **Shot 6a** | `01:47.5 – 02:00.0` | 12.5s | Cut to Tests tab | Test execution summary: `EXIT CODE: 0 (SUCCESS)`, `DURATION: 174ms`, `PASSED ASSERTIONS: 5 / 5`. | *"The test runner executes as a host subprocess..."* |
| **Shot 6b** | `02:00.0 – 02:17.5` | 17.5s | Scroll / assertion view | All 5 unit test assertions passing with green checkmarks (zero divisor throws error, quarterly compounding matches precision). | *"all five assertions pass with exit code zero in just 174 milliseconds."* |
| **Shot 7a** | `02:17.5 – 02:27.5` | 10.0s | Cut to Report tab | Evidence-Backed Verification Synthesis panel, verified behaviors, and explicit assumptions checklist. | *"In the Final Report tab, AgentForge AI synthesizes evidence..."* |
| **Shot 7b** | `02:27.5 – 02:34.5` | 7.0s | Action focus | One-click **Export .patch** cyan button, downloading Git-compatible unified patch. | *"We click Export Patch to immediately download a standard git-compatible unified patch..."* |
| **Shot 8** | `02:34.5 – 02:45.0` | 10.6s | Closing title card | Clean AgentForge AI summary card with hackathon track attribution, architecture points, and MIT open source license. | *"Safe, verified, and developer-first."* |

---

## Verified Guidelines Compliance

1. **Zero Credential Leakage:** API key display is strictly masked (`•••••••••••••••••••••••• (Server-Isolated)`). No raw keys, token strings, `.env.local`, or terminal logs are visible.
2. **Accurate Execution Metrics:** Narration states the exact truth: `174 milliseconds` and `Host Subprocess Sandbox` with strict allowlists and containment guards.
3. **Paced Visual Storytelling:** Visual cuts occur every 7 to 17 seconds, keeping the viewer engaged and matching the speech content at every moment.
4. **Third-Party Trademarks:** Plain-text hackathon track attribution and model references are used without unlicensed logos.
