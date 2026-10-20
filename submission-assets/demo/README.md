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
| **Demo Video (MP4)** | [`agentforge-demo.mp4`](file:///C:/Agentforge-AI/submission-assets/demo/agentforge-demo.mp4) | **Duration:** `02:36.25` (156.25s) — comfortably under 3-min hackathon limit <br> **Resolution:** `1920 × 1080` (16:9 widescreen) <br> **Framerate:** 30.0 fps progressive <br> **Scale:** 100% default browser scale (no artificial zoom or crop cuts) <br> **Video Codec:** H.264 / AVC (High Profile) <br> **Audio Codec:** AAC 44.1 kHz mono <br> **File Size:** `6.16 MB` <br> **Captions:** Compact burned-in synchronized subtitles (font 14, thin border, positioned cleanly at bottom) <br> **Pacing:** 8 authentic full-scale scenes matching narration precisely | **VERIFIED READY** |
| **Video Thumbnail** | [`thumbnail.png`](file:///C:/Agentforge-AI/submission-assets/demo/thumbnail.png) | **Resolution:** `1920 × 1080` (16:9 PNG) <br> Clean typography, AgentForge AI branding, hackathon track attribution | **VERIFIED READY** |
| **Synchronized Captions** | [`captions.srt`](file:///C:/Agentforge-AI/submission-assets/demo/captions.srt) | Synchronized subtitle entries matching speech audio to millisecond precision | **VERIFIED READY** |
| **Voiceover Script** | [`voiceover-script.md`](file:///C:/Agentforge-AI/submission-assets/demo/voiceover-script.md) | Timed English narration script with exact timecodes and visual cues | **VERIFIED READY** |
| **Visual Shot List** | [`shot-list.md`](file:///C:/Agentforge-AI/submission-assets/demo/shot-list.md) | 8-scene storyboard detailing framing, UI actions, and spoken anchors | **VERIFIED READY** |
| **Master Voiceover WAV**| [`voiceover.wav`](file:///C:/Agentforge-AI/submission-assets/demo/voiceover.wav) | 156.20s master speech audio | **VERIFIED READY** |

---

## 2. 8 Authentic Full-Scale Scenes Breakdown (02:36 Total)

The demo captures authentic live application footage from `http://127.0.0.1:3000` at 100% default scale:

- **0:00 – 0:23.4 (Scene 1):** Full-scale overview of the AgentForge AI workspace with CalcVault selected from frame 0 (0:00), displaying active task list, security badges, and developer context.
- **0:23.4 – 0:41.8 (Scene 2):** Live inspection of CalcVault bug details in developer workbench, detailing the 2 failing unit tests (`safeDivide` zero denominator and `calculateCompoundInterest` exponent defect) and hovering over the primary **Start Repair Run** button.
- **0:41.8 – 1:05.7 (Scene 3):** User clicks "Model & Settings" in navbar. Smooth live transition to `/settings`, clicking "Test Connection", live **Nebius Token Factory** ping resolving with **Nebius Connection Healthy**, live latency badge, 28 verified models, and fully masked key `•••••••••••••••••••••••• (Server-Isolated)`.
- **1:05.7 – 1:22.8 (Scene 4):** User clicks "Start Repair Run". Autonomous plan formulated by Nemotron; user clicks **Plan (4)** tab and glides down inspecting the 4 structured execution phases.
- **1:22.8 – 1:46.4 (Scene 5):** User reviews **Code Diff** tab showing unified diff on `calculator.js` (red removals, green additions) with smooth scrolling, amber **Human Approval Gate Required** banner, and hovering on **Approve & Run Tests**.
- **1:46.4 – 2:09.3 (Scene 6):** User clicks **Approve & Run Tests**. Real test runner executes in isolated host subprocess; user navigates to **Tests & Evidence** tab showing real test execution: **EXIT CODE: 0 (SUCCESS)**, **DURATION: 143ms**, **PASSED ASSERTIONS: 5 / 5** with green checkmarks.
- **2:09.3 – 2:24.6 (Scene 7):** User reviews **Final Report** tab showing Evidence-Backed Verification Synthesis panel, verified behaviors checklist, total verified in 143ms, and clicking cyan **Export .patch** button.
- **2:24.6 – 2:36.2 (Scene 8):** Clean closing summary title card highlighting core pillars: NVIDIA Nemotron on Nebius Token Factory, Human Approval Gate, and Deterministic Verification (143ms Real Test Execution • 5/5 Passing Assertions • Git Unified .patch).

---

## 3. Strict Truthfulness & Security Verification

1. **Authentic Screen Recording (Not Slideshow):** Every scene is recorded from the live running browser session at 1920×1080 30fps using Playwright, featuring real user interactions: mouse movement, button hover/clicks with neon interaction ripples, live diagnostic execution, tab transitions, and real test execution.
2. **Zero Credential Exposure:** The API key is fully masked as `•••••••••••••••••••••••• (Server-Isolated)` with zero visible prefix or suffix characters. No `.env.local`, terminal exports, or raw keys appear anywhere on screen.
3. **Consistent Execution Metric:** All four touchpoints—live screen UI, voiceover narration, closing title card, and synchronized subtitles—consistently report the exact same metric: **143 milliseconds** (`143ms`).
4. **Trademark Compliance:** No unlicensed third-party graphical logos are used. Plain-text hackathon attribution and NVIDIA Nemotron references are used accurately.
5. **Subtitles:** Elegant font size 14 with thin outline and bottom placement ensuring zero interference with code diffs or dashboard tabs.

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
   • Real-time TAP test evidence (5/5 assertions pass in 143ms)
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
