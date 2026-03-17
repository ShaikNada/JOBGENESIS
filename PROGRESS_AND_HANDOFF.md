# JobGenesis — Progress Report & Handoff Document
> Generated: March 12, 2026 | For: Next AI Model Continuation

---

## Project Overview
**JobGenesis** is a cyberpunk-themed, AI-powered career simulation platform. Users upload resumes, get matched to jobs, and enter a multi-stage "Gauntlet" (MCQ exam → Coding IDE → AI Voice Interview) that evaluates their skills in real-time. The platform features aggressive theming (dark/red/neon), AI proctoring, and gamified progression.

**Tech Stack:**
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose)
- **AI**: Google Gemini API (via `@google/generative-ai`)
- **Other**: Socket.io, TensorFlow.js (COCO-SSD), Web Speech API, Web Audio API

**Root Directory**: `d:\project\jobGenisis(1)\coding-gauntlet`

---

## ✅ Completed Features

### 1. Self-Healing Bot (Digital Immune System)
**Files:**
- `backend/src/services/ai/selfHealer.ts` — Core engine
- `backend/src/server.ts` — Wired via `process.on('uncaughtException')`

**What it does:**
- Catches runtime crashes globally.
- Parses the stack trace to identify the broken file + line number.
- Extracts code context (±15 lines around the crash).
- Sends the context to Gemini with a "fix this bug" prompt.
- Parses the AI's JSON response (`targetContent` + `replacementContent`).
- **AST Verification**: Runs the patched code through a TypeScript AST parser to ensure it compiles before writing.
- **Line-Number Splicing**: Uses strict line-number-based array splicing (not fragile string matching) to apply patches.
- **Auto-Git**: Creates a new branch (`autofix/<timestamp>`), commits the patch, and pushes to origin.
- **Gauntlet Level Generation**: Converts the bug into a playable `Problem` document in MongoDB with `tags: ["auto-generated"]`.

**How to trigger it:**
```bash
curl http://localhost:4000/api/auth/crash
```
This hits an intentional `TypeError` route, the bot catches it, fixes the code, commits, and generates a Gauntlet Level.

---

### 2. Matrix Glitch Visualizer (Frontend)
**Files:**
- `src/components/DigitalImmunityWrapper.tsx` — Global overlay component

**What it does:**
- Wraps the entire `<App />` component.
- Listens for `system-breach` WebSocket events from the backend.
- When triggered, renders a full-screen red Matrix-style terminal UI with a typing animation showing the AI's fix explanation.
- Auto-dismisses after the animation completes.

---

### 3. Overwatch Protocol (AI Proctoring)
**Files:**
- `src/hooks/useAntiCheat.ts` — Keystroke cadence (WPM) + copy-paste + tab-switch detection
- `src/hooks/useProctorAI.ts` — TensorFlow.js COCO-SSD webcam analysis
- `src/components/SentinelCam.tsx` — Webcam feed + violation display UI
- `src/components/IdeLayout.tsx` — Score deduction wiring

**What it does:**
- **Keystroke Monitoring**: Tracks words-per-minute and flags inhuman typing speed or excessive copy-paste events.
- **Tab Switching**: Detects `window.blur` events and warns/penalizes.
- **Webcam AI**: Uses TensorFlow COCO-SSD (client-side) to detect phones, multiple people, or candidate absence.
- **Score Deduction**: Each violation deducts points from the candidate's live score.
- All proctoring runs **client-side** for privacy.

> ⚠️ **Known Limitation**: Webcam proctoring cannot be tested in headless/automated environments. Requires manual browser testing.

---

### 4. Anomaly Bounty Board
**Files:**
- `backend/src/routes/problems.route.ts` — `GET /bounties` + `GET /:id`
- `src/components/JobDashboard.tsx` — "Active Bounties 👾" tab
- `src/App.tsx` — `missionConfig.bountyId` state
- `src/components/IdeLayout.tsx` — Bounty bypass logic

**What it does:**
- Fetches all `Problem` documents tagged `"auto-generated"` from the DB.
- Displays them in a "Dark Net" styled card grid on the Job Dashboard.
- When a user clicks "Claim Bounty", it **bypasses** the MCQ exam and AI generation.
- `IdeLayout` directly fetches the raw problem from `/api/problems/:id` and sets `TOTAL_STAGES = 1` (single-stage fix).

**Backend lookup** in `backend/src/services/judge/index.ts` uses `$or` query to handle both Mongo ObjectIDs and custom string UUIDs from auto-generated problems.

---

### 5. Stress Protocol: The Neural Interview
**Files:**
- `backend/src/controllers/interview.controller.ts` — `isStressMode` flag in both `generateInitialQuestion` and `evaluateResponse`
- `src/components/AiInterviewRoom.tsx` — Full stress UI
- `src/components/StressHeartbeat.tsx` — SVG heartbeat monitor

**What it does:**
- **Backend**: When `isStressMode` is true, the AI prompt switches to an aggressive, skeptical, zero-tolerance personality.
- **Auto-trigger**: Activates when `difficulty === 'hard'` OR the role includes "Staff" or "Principal".
- **UI**: Dark red vignette, noise overlay, glitch effects that increase over time.
- **Heartbeat Monitor**: SVG path animation with BPM that accelerates as `stressLevel` (0 to 1) increases every 5 seconds.
- **Audio Drone**: Web Audio API generates a 40Hz bass sine oscillator with LFO modulation that speeds up with stress.
- **Glitch Effect**: Random periodic UI distortion that becomes more frequent at higher stress levels.

---

### 6. Neural Skill Tree
**Files:**
- `backend/src/models/User.model.ts` — Added `skillTree` (frontend/backend/systemDesign/security/algorithms/bountiesSolved/totalXP) + `badges[]` to schema
- `backend/src/services/skillTree.service.ts` — `awardXP()` + `getSkillTree()` + automatic badge unlocking
- `backend/src/routes/skillTree.route.ts` — `GET /api/skill-tree` + `POST /api/skill-tree/award`
- `backend/src/app.ts` — Mounted at `/api/skill-tree`
- `src/components/NeuralSkillTree.tsx` — Interactive SVG node-link visualization
- `src/components/JobDashboard.tsx` — "Neural Map" tab

**What it does:**
- **5-Domain XP Tracking**: Frontend, Backend, System Design, Security, Algorithms.
- **XP Rings**: Each SVG node has a circular progress ring that fills based on domain XP.
- **Hover Effects**: Nodes glow, connections highlight, and a detail popup shows exact XP/level/progress.
- **Auto Badges**: 5 legendary badges checked server-side on every XP award:
  - 🛡️ The Guardian (5+ bounties solved)
  - ⚡ Steel Nerves (Stress interview + high XP)
  - 👁️ Shadow Architect (1+ bounty solved)
  - 🧠 Algorithm God (500+ algorithm XP)
  - 🚀 Neural Pioneer (1000+ total XP)

---

## ⚠️ Known Issues & Incomplete Items

| Item | Status | Details |
|---|---|---|
| BullMQ/Redis | ❌ Disabled | Missing `REDIS_URI` env var. Code queue falls back to direct execution. |
| Bounty E2E Test | ⏳ Pending | Need to manually trigger a crash, wait for self-heal, then claim the bounty. |
| Stress Protocol Browser Test | ⏳ Pending | Need manual testing in a real browser (not headless). |
| Skill Tree XP Wiring | ✅ Done | `fireXPAward()` in `App.tsx` calls `POST /api/skill-tree/award` after every exam, simulation, and interview completion with role-to-domain mapping. |
| Webcam Proctoring Test | ⏳ Manual Only | Cannot test in headless environments. |
| `App.tsx` Lint | ⚠️ Minor | There may be a lingering TS warning about `bountyId` prop on `IdeLayout`. |

---

## 🔲 Suggested Next Steps

### Priority 1: Wire XP Awards into Mission Flow
- In `App.tsx`, after the coding simulation completes (`onComplete` callback), call `POST /api/skill-tree/award` with the appropriate event (`missionComplete`, `bountyComplete`, etc.) and relevant domains.
- This will make the Neural Skill Tree actually update after gameplay.

### Priority 2: Multiplayer / Pair Programming Mode (✅ DONE)
- Configured real-time WebSocket room generation in `JobDashboard.tsx`.
- Wired `roomId` through `App.tsx` down to `IdeLayout.tsx` and `CodeEditor.tsx`.
- Synced full code blocks over sockets with debouncing.
- Rendered remote client cursors in Monaco Editor using `.remote-cursor` decorations. (like Google Docs for code).
- Shared timer and combined score.

### Priority 3: Recruiter Live Dashboard (✅ DONE)
- Replaced the static mock arrays in `RecruiterDashboard.tsx` with a live React state that subscribes to Socket.io events.
- Wired `backend/socketService.ts` to forward `candidate_telemetry` and `candidate_log` into a `recruiter_room`.
- Tracked candidate progression from `App.tsx` and emitted live proctoring strikes from `IdeLayout.tsx` straight to the recruiter's command center.

### Priority 4: Deployment & CI/CD
- Docker Compose for local dev (MongoDB + Redis + Backend + Frontend).
- Vercel (frontend) + Railway/Render (backend) deployment.
- GitHub Actions for lint/build/test on PR.

### Priority 5: Polish & Production Readiness
- Error boundary components for graceful UI failures.
- Rate limiting on AI endpoints.
- Proper JWT refresh token flow.
- Comprehensive E2E tests (Playwright).

---

## Key Environment Variables

```env
# Backend (.env)
MONGODB_URI=<your-mongo-connection-string>
JWT_SECRET=<your-secret>
GEMINI_API_KEY=<google-gemini-key>
REDIS_URI=<optional, for BullMQ>
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_BACKEND_URL=http://localhost:4000
```

## File Structure (Key Files Only)

```
coding-gauntlet/
├── backend/src/
│   ├── app.ts                          # Express app setup + route mounting
│   ├── server.ts                       # HTTP server + Socket.io + self-healer wiring
│   ├── socketService.ts                # Socket.io singleton
│   ├── controllers/
│   │   ├── interview.controller.ts     # AI interview (stress mode)
│   │   ├── auth.controller.ts
│   │   ├── job.controller.ts
│   │   └── ...
│   ├── models/
│   │   ├── User.model.ts              # User schema (skillTree + badges)
│   │   └── Problem.model.ts           # Gauntlet problems schema
│   ├── routes/
│   │   ├── problems.route.ts          # /bounties + /:id
│   │   ├── skillTree.route.ts         # /api/skill-tree
│   │   ├── interview.route.ts
│   │   └── ...
│   └── services/
│       ├── ai/selfHealer.ts           # Self-healing bot + Gauntlet level gen
│       ├── ai/evaluator.ts            # Challenge generation + code evaluation
│       ├── judge/index.ts             # Deterministic JS sandbox
│       └── skillTree.service.ts       # XP + badge logic
├── src/
│   ├── App.tsx                        # Main app state + routing
│   ├── components/
│   │   ├── JobDashboard.tsx           # Tabs: Auto-Match, Target, Bounties, Neural Map
│   │   ├── IdeLayout.tsx              # Coding simulation IDE
│   │   ├── AiInterviewRoom.tsx        # Voice interview (stress mode)
│   │   ├── NeuralSkillTree.tsx        # Interactive SVG skill tree
│   │   ├── StressHeartbeat.tsx        # SVG heartbeat + BPM
│   │   ├── DigitalImmunityWrapper.tsx # Matrix glitch overlay
│   │   ├── SentinelCam.tsx            # Webcam proctoring UI
│   │   └── ...
│   ├── hooks/
│   │   ├── useAntiCheat.ts            # Keystroke + tab monitoring
│   │   ├── useProctorAI.ts            # TensorFlow webcam detection
│   │   └── ...
│   └── lib/gemini.ts                  # Frontend API helpers
└── package.json
```

---

**End of Handoff. Good luck, next model! 🚀**
