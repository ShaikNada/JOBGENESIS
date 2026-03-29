# JobGenesis 🚀
*Project Code Name: Project Vanguard*

> **The AI-Powered "Gauntlet" for Elite Engineering Talent.**

![JobGenesis Preview](public/preview.png) *(Add a screenshot here if you have one)*

## 🎯 The Problem Overview
Traditional technical recruiting is broken and slow:
- **Resume Noise**: 90% of applicants don't match the required skills of the role.
- **Cheating Ecosystem**: Generative AI (like ChatGPT and Claude) makes traditional take-home assignments and unproctored tests obsolete.
- **Inconsistency**: Human interviewers are subject to bias and inconsistency.
- **Manual Toil**: Scaling true technical exams for thousands of candidates simultaneously is nearly impossible.

## ✨ Our Solution
JobGenesis is a high-fidelity, end-to-end technical assessment platform that uses "Forensic AI" to verify candidate integrity while providing a premium, production-realistic experience.

### 🛤️ The "Gauntlet" Experience
1. **Bio-Calibration (Resume Parsing)**: Instant resume parsing into a structured AI bio-profile.
2. **The MCQ Core**: Role-specific, AI-generated technical questions validated server-side.
3. **Real-time IDE**: A multi-round coding environment powered by background worker execution (BullMQ).
4. **AI Audio Interview (RAG)**: A voice-based interview where a "Senior Engineer" AI grills candidates on their code, adapting to company-specific engineering culture.
5. **ML Intelligence Report**: A granular "Employability Index" score generated automatically at the end of the mission.

---

## 🛠️ Core Innovations (Our "Wow" Factors)

### 🛡️ Overwatch Protocol (AI Proctoring)
- **Forensic Telemetry**: Tracks keystroke intervals (Typing Stability), tab-switching frequency, and clipboard activity to catch superhuman or bot-like patterns.
- **Behavioral Analysis**: Advanced ML differentiates between "Elite Human Talent" and "Bot-Assisted" input.
- **Webcam Monitoring**: Real-time visual integrity checks integrated directly into the browser.

### 🤖 The Self-Healer (Autonomous Infrastructure)
- **Zero-Downtime Resilience**: An AI bot monitors the Node.js backend to intercept fatal crashes in real-time.
- **Auto-Patching**: Uses Google Gemini to analyze stack traces, write fixes, verify them via the AST (Abstract Syntax Tree), and autonomously push Git commits.
- **Gamified Learning**: Real-world bugs that occur in production are converted on the fly into "Gauntlet Challenges" for candidates!

---

## 💻 Technology Stack

### **Frontend Pipeline**
- **Framework**: React + Vite + TypeScript
- **Design & UI**: Tailwind CSS paired with **Framer Motion** for premium micro-animations.
- **Core Components**: Monaco Editor (VS Code integration), Recharts (Live analytics visualization), WebRTC/Media Streams (Audio & Webcam).

### **Backend & Execution**
- **Runtime**: Node.js + Express + TypeScript
- **Real-time Engine**: Socket.io for live heartbeat tracking and proctoring events.
- **Scalable Execution**: **BullMQ** + **Redis** for decoupled secure code execution and queue management.
- **Database**: MongoDB (Mongoose) for schema persistence.

### **Intelligence Layer (AI & ML)**
- **LLM Engine**: Google Gemini AI (RAG Interviewer + Self-Healer) & Groq SDK (Lightning-fast inference).
- **ML Microservice**: Python + Scikit-Learn for Employability Index classification.
- **Edge Vision**: TensorFlow.js for client-side visual proctoring.

---

## 🚀 Quick Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB connection string
- Redis connection (e.g., Upstash or local)
- Gemini and Groq API Keys
- Firebase Project setup

### 1. Install & Run Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Install & Run Frontend
```bash
# In the root directory
npm install
npm run dev
```

### 3. Install & Run ML Engine (Optional for deep analytics)
```bash
cd ml-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

*Built for the next generation of engineers. JobGenesis doesn't just hire; it validates.*
