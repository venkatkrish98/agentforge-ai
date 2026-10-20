# AgentForge AI — Video Shot List & Visual Storyboard

- **Target Format:** 16:9 widescreen (1920 × 1080)
- **Framerate:** 30.0 fps progressive
- **Total Duration:** 2:36.25 (156.25 seconds) — well within the 3:00 hackathon limit
- **Primary Source:** Real application at `http://127.0.0.1:3000` (zero mocked UI or test fakes)
- **Zoom & Viewport:** 100% default browser scale (1920×1080 viewport, no artificial crop or zoom cuts)

---

## 8 Authentic Full-Scale Scenes Breakdown

| Scene | Timestamp | Duration | Viewport & Layout (100% Scale) | Visual Elements & UI Actions | Voiceover & Synchronized Caption |
|---|---|---|---|---|---|
| **Scene 1** | `0:00 – 0:23.4` | 23.4s | Full Viewport (1920×1080) | AgentForge AI developer workspace. Dark theme, top navbar with Nebius × NVIDIA banner, active workspaces list. | *"Welcome to AgentForge AI, an AI-assisted coding and test-repair workspace built for the Nebius and NVIDIA Global AI Hackathon..."* |
| **Scene 2** | `0:23.4 – 0:41.8` | 18.5s | Full Viewport (1920×1080) | Selection of CalcVault in developer workbench. Displays 2 unit test failures (`safeDivide` NaN bug and compound interest formula defect) and primary **Start Repair Run** button. | *"Here in the developer workbench, we select CalcVault, a financial math operations engine with two critical unit test failures..."* |
| **Scene 3** | `0:41.8 – 0:65.7` | 23.9s | Full Viewport (1920×1080) | Model & Settings page with live connection diagnostic. Green **Nebius Connection Healthy** badge, live **Latency: 1552ms**, verified model `nvidia/Nemotron-3_5-Lightning`, 28 models verified, and masked key `•••••••••••••••••••••••• (Server-Isolated)`. | *"In Model Settings, AgentForge AI connects live to Nebius Token Factory, streaming low-latency inference using NVIDIA Nemotron 3.5 Lightning. Watch our live connection diagnostic..."* |
| **Scene 4** | `0:65.8 – 0:87.5` | 21.7s | Full Viewport (1920×1080) | Autonomous Plan tab showing Nemotron's 5-phase structured execution plan: diagnose division checks, formulate surgical repairs, snapshot prior state, run the test suite, and compile verification evidence. | *"Returning to the workspace, Nemotron analyzes the repository AST and formulates a five-phase plan..."* |
| **Scene 5** | `0:82.8 – 1:46.4` | 23.6s | Full Viewport (1920×1080) | Code Diff tab showing unified diff on `calculator.js` (red removals, green additions) and amber **Human Approval Gate Required** banner with **Approve & Run Tests** / **Reject & Abort** buttons. | *"Switching to the Code Diff tab, we see the generated unified diff. Notice our core safety principle: the Human Approval Gate..."* |
| **Scene 6** | `1:46.4 – 2:09.3` | 22.9s | Full Viewport (1920×1080) | Tests & Evidence tab showing real test execution: **EXIT CODE: 0 (SUCCESS)**, **DURATION: 143ms**, **PASSED ASSERTIONS: 5 / 5** with green checkmarks. | *"We click Approve and Run Tests. The test runner executes as a host subprocess... all five assertions pass with exit code zero in just 143 milliseconds."* |
| **Scene 7** | `2:09.3 – 2:24.6` | 15.3s | Full Viewport (1920×1080) | Final Report tab with Evidence-Backed Verification Synthesis panel, verified behaviors checklist, and one-click cyan **Export .patch** button. | *"In the Final Report tab, AgentForge AI synthesizes evidence... We click Export Patch to immediately download a standard git-compatible unified patch file..."* |
| **Scene 8** | `2:24.6 – 2:36.2` | 11.6s | Full Viewport (1920×1080) | Closing summary title card highlighting core pillars: NVIDIA Nemotron on Nebius Token Factory, Human Approval Gate, and Deterministic Verification. | *"AgentForge AI brings deterministic evidence and human oversight to generative coding, powered by NVIDIA Nemotron on Nebius Token Factory. Safe, verified, and developer-first."* |

---

## Verified Guidelines Compliance

1. **100% Default Scale:** Zero artificial cropping or digital zooming; natural browser proportions preserved across every frame.
2. **Zero Credential Leakage:** API key display is strictly masked (`•••••••••••••••••••••••• (Server-Isolated)`). No raw keys, token strings, `.env.local`, or terminal logs are visible.
3. **Live Diagnostic Demonstration:** Settings scene captures the completed non-destructive ping showing `Nebius Connection Healthy`, live measured latency, and 28 verified models on account.
4. **Accurate Execution Metrics:** Narration states the exact truth: real execution duration and `Host Subprocess Sandbox` with strict allowlists and containment guards.
5. **Exact Per-Scene Synchronization:** Subtitles and spoken audio are rendered within each self-contained scene clip, eliminating drift and cross-scene leakage.
