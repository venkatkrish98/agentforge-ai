# AgentForge AI — Hackathon Demo Video & Media Package

**Project:** AgentForge AI — Autonomous AI-assisted coding and evidence-backed test-repair workspace  
**Competition:** Nebius × NVIDIA Global AI Hackathon  
**Track:** Coding and Agentic Engineering  
**Repository:** [github.com/venkatkrish98/agentforge-ai](https://github.com/venkatkrish98/agentforge-ai)  

---

## 1. Verified Video Deliverables & Technical Specifications

All video and media deliverables have been prepared, synchronized, and verified:

| Deliverable | File Path | Verified Specs | Status |
|---|---|---|---|
| **Demo Video (MP4)** | [`agentforge-demo.mp4`](file:///C:/Agentforge-AI/submission-assets/demo/agentforge-demo.mp4) | **Duration:** `02:45.04` (165.04s) <br> **Resolution:** `1920 × 1080` (16:9 widescreen) <br> **Framerate:** 30.0 fps progressive <br> **Video Codec:** H.264 / AVC (High Profile) <br> **Audio Codec:** AAC 22.05 kHz mono <br> **File Size:** `5.05 MB` <br> **Captions:** Compact burned-in synchronized subtitles (font 14, thin border, positioned cleanly at bottom) <br> **Pacing:** 14 dynamic cuts matching dialogue (7s–17s per shot, zero static freeze) | **VERIFIED READY** |
| **Video Thumbnail** | [`thumbnail.png`](file:///C:/Agentforge-AI/submission-assets/demo/thumbnail.png) | **Resolution:** `1920 × 1080` (16:9 PNG) <br> Clean typography, AgentForge AI branding, hackathon track attribution | **VERIFIED READY** |
| **Synchronized Captions** | [`captions.srt`](file:///C:/Agentforge-AI/submission-assets/demo/captions.srt) | 66 synchronized subtitle entries matching speech audio to millisecond precision | **VERIFIED READY** |
| **Voiceover Script** | [`voiceover-script.md`](file:///C:/Agentforge-AI/submission-assets/demo/voiceover-script.md) | Timed English narration script with exact timecodes and visual cues | **VERIFIED READY** |
| **Visual Shot List** | [`shot-list.md`](file:///C:/Agentforge-AI/submission-assets/demo/shot-list.md) | 14-shot storyboard detailing framing, UI actions, and spoken anchors | **VERIFIED READY** |
| **Master Voiceover WAV**| [`voiceover.wav`](file:///C:/Agentforge-AI/submission-assets/demo/voiceover.wav) | 158.46s master speech audio (tempo adjusted in MP4 to 165s) | **VERIFIED READY** |

---

## 2. Dynamic 14-Shot Breakdown (02:45 Total)

The demo captures authentic application footage from `http://127.0.0.1:3000`:

- **0:00 – 0:10.5 (Shot 1a):** Wide view of the AgentForge AI dashboard and workspace list.
- **0:10.5 – 0:26.5 (Shot 1b):** Close-up zoom into workbench header, task objective panel, and loop monitor.
- **0:26.5 – 0:40.0 (Shot 2a):** Close-up of CalcVault task card, highlighting the failing unit tests (`safeDivide` and `calculateCompoundInterest`).
- **0:40.0 – 0:47.5 (Shot 2b):** Target project context files and action click on **Start Repair Run**.
- **0:47.5 – 0:58.5 (Shot 3a):** Cut to `/settings`, showing live **Nebius Token Factory** connection diagnostic and sub-2s latency.
- **0:58.5 – 01:09.5 (Shot 3b):** Server-Side Secret Isolation card showing fully masked key `•••••••••••••••••••••••• (Server-Isolated)` and `NVIDIA Nemotron 3.5 Lightning` catalog card.
- **01:09.5 – 01:21.5 (Shot 4a):** Return to workspace, showing the autonomous 4-phase plan formulated by Nemotron.
- **01:21.5 – 01:33.5 (Shot 4b):** Switch to Code Diff tab, showing red/green diff on `src/calculator.js`.
- **01:33.5 – 01:47.5 (Shot 5):** Close-up zoom on amber **Human Approval Gate Required** banner (`Waiting for human sign-off on diff`) and action buttons.
- **01:47.5 – 02:00.0 (Shot 6a):** Click "Approve & Run Tests", showing test execution metrics: `Exit Code: 0 (SUCCESS)`, `Duration: 174ms`, `Passed Assertions: 5 / 5`.
- **02:00.0 – 02:17.5 (Shot 6b):** Focus on all 5 green passing test assertions checklist.
- **02:17.5 – 02:27.5 (Shot 7a):** Cut to Final Report tab, showing Evidence-Backed Verification Synthesis and explicit assumptions.
- **02:27.5 – 02:34.5 (Shot 7b):** Action focus on cyan **Export .patch** button.
- **02:34.5 – 02:45.0 (Shot 8):** Closing summary card with project architecture points and hackathon track attribution.

---

## 3. Strict Truthfulness & Security Verification

1. **Zero Credential Exposure:** The API key is fully masked as `•••••••••••••••••••••••• (Server-Isolated)` with zero visible prefix or suffix characters. No `.env.local`, terminal exports, or raw keys appear anywhere on screen.
2. **Accurate Execution Metrics:** Narration and visual metrics explicitly state the true test duration (`174 milliseconds`) and true process architecture (`Host Subprocess Sandbox` with strict allowlists and containment guards).
3. **Trademark Compliance:** No unlicensed third-party graphical logos are used. Plain-text hackathon attribution and NVIDIA Nemotron references are used accurately.
4. **Subtitles:** Elegant font size 14 with thin outline and bottom placement ensuring zero interference with code diffs or dashboard tabs.

---

## 4. YouTube Upload & Submission Checklist for the User

When uploading the video to YouTube and submitting the project:

### Step 1: Upload to YouTube
1. Open YouTube Studio ([studio.youtube.com](https://studio.youtube.com)).
2. Click **Create** > **Upload videos**, and select `submission-assets/demo/agentforge-demo.mp4`.
3. Set **Title**:
   ```
   AgentForge AI — Autonomous Coding & Evidence-Backed Test Repair (Nebius x NVIDIA AI Hackathon)
   ```
4. Set **Description**:
   ```text
   AgentForge AI is an autonomous AI-assisted coding and test-repair workspace built for the Nebius × NVIDIA Global AI Hackathon (Coding & Agentic Engineering track).

   Key Capabilities:
   • Powered by NVIDIA Nemotron 3.5 Lightning served via Nebius Token Factory
   • Autonomous 4-phase planning and unified diff generation
   • Human-in-the-Loop Approval Gate before any filesystem or test execution
   • Real host subprocess test execution with strict allowlists and containment guards
   • Real-time TAP test evidence (5/5 assertions pass in 174ms)
   • Evidence-backed verification reports and git-compatible .patch export

   GitHub Repository: https://github.com/venkatkrish98/agentforge-ai
   Built with Next.js 14, TypeScript, Tailwind CSS, and Nebius Token Factory.
   ```
5. Set **Thumbnail**: Upload [`thumbnail.png`](file:///C:/Agentforge-AI/submission-assets/demo/thumbnail.png).
6. Set **Subtitles**: Upload [`captions.srt`](file:///C:/Agentforge-AI/submission-assets/demo/captions.srt) (English) under the Subtitles tab.
7. Visibility: Set to **Public** or **Unlisted**.

### Step 2: Hackathon Submission Form
- **Track:** Coding and Agentic Engineering
- **Video URL:** Your public/unlisted YouTube video URL
- **Repository URL:** `https://github.com/venkatkrish98/agentforge-ai`
