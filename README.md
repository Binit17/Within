<div align="center">

# Within

**AI-Powered Multi-Modal Mental Wellness Platform**

Real-time biomarker sensing · Gemini 2.0 Flash therapeutic AI · Gamified recovery

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Gemini_2.0-Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision-FF6F00?logo=google&logoColor=white)](https://mediapipe.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Built by **Team 404StressNotFound** — US-Nepal Hackathon 2026*

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Multi-Modal Sensing Pipelines](#multi-modal-sensing-pipelines)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Within is a full-stack mental wellness platform that moves beyond self-reported text to capture **physiological and behavioral signals** in real time. A singleton `CheckInEngine` orchestrates three concurrent sensing pipelines — facial emotion detection, vocal stress analysis, and oculomotor tracking — and streams the resulting biomarker context to a Gemini 2.0 Flash backend that drives clinically grounded therapeutic conversations.

The platform is designed around three principles:

1. **Multi-modal objectivity** — Emotions are inferred from blendshape geometry, voice perturbation metrics (jitter/shimmer), and eye movement patterns, not just what the user types.
2. **Therapeutic grounding** — The AI companion uses CBT-based cognitive distortion detection, PHQ-9 aligned risk scoring, and cross-session trigger profiling to steer conversations.
3. **Positive reinforcement** — A 20-level village gamification system rewards consistent engagement, making mental health maintenance feel rewarding.

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Frontend — React + Vite (Port 8080)"]
        UI["Page Components<br/>ChatPage · CheckInPage<br/>Home · Profile · Resources"]
        Engine["CheckInEngine<br/><i>Singleton — coordinates all sensing</i>"]
        API["api.ts<br/><i>Centralized HTTP client</i>"]
        
        UI --> Engine
        UI --> API
    end

    subgraph Sensors["Browser APIs"]
        CAM["getUserMedia<br/>Camera Stream"]
        MIC["getUserMedia<br/>Audio Stream"]
        SR["SpeechRecognition<br/>Web Speech API"]
    end

    subgraph ML["Client-Side ML"]
        MP["MediaPipe<br/>FaceLandmarker<br/><i>WASM + GPU</i>"]
        WA["Web Audio API<br/>AnalyserNode<br/><i>FFT 2048</i>"]
    end

    subgraph Server["Backend — FastAPI (Port 8000)"]
        Sessions["Session Manager<br/><i>Create · Chat · End</i>"]
        Gemini["GeminiTherapist<br/><i>Gemini 2.0 Flash</i>"]
        Risk["Risk Monitor<br/><i>PHQ-9 keywords</i>"]
        Trigger["Trigger Analyzer<br/><i>Cross-session profiling</i>"]
        Distortion["Distortion Analyzer<br/><i>10 CBT distortions</i>"]
        Report["Report Generator<br/><i>Clinical summaries</i>"]
        Village["Village Engine<br/><i>20-level progression</i>"]
    end

    CAM --> MP
    MIC --> WA
    MIC --> SR
    MP --> Engine
    WA --> Engine
    SR --> Engine
    API -- "HTTP /api/*" --> Sessions
    Sessions --> Gemini
    Sessions --> Risk
    Sessions --> Trigger
    Sessions --> Distortion
    Gemini --> Report
    Village --> API

    style Client fill:#FFF7ED,stroke:#F97316,color:#1a1a1a
    style Sensors fill:#EFF6FF,stroke:#3B82F6,color:#1a1a1a
    style ML fill:#F0FDF4,stroke:#16A34A,color:#1a1a1a
    style Server fill:#FDF2F8,stroke:#EC4899,color:#1a1a1a
```

---

## Multi-Modal Sensing Pipelines

All three pipelines run concurrently inside the `CheckInEngine` singleton. Data is sampled every second, accumulated over the session, averaged, and sent to the backend with each chat turn.

### Facial Emotion Detection

```mermaid
graph LR
    A["📷 Camera<br/>getUserMedia"] --> B["MediaPipe<br/>FaceLandmarker<br/><i>WASM/GPU</i>"]
    B --> C["52 Face<br/>Blendshapes"]
    C --> D["Emotion Mapper"]
    D --> E["7 Emotions<br/>+ Arousal<br/>+ Valence"]
    E --> F["React State<br/><i>60fps updates</i>"]
    E --> G["Sample Buffer<br/><i>1s intervals</i>"]
    G --> H["Averaged Snapshot<br/>→ Backend"]

    style A fill:#DBEAFE,stroke:#3B82F6,color:#1a1a1a
    style B fill:#FEF3C7,stroke:#D97706,color:#1a1a1a
    style D fill:#DCFCE7,stroke:#16A34A,color:#1a1a1a
    style H fill:#FCE7F3,stroke:#EC4899,color:#1a1a1a
```

**Blendshape → Emotion mapping:**

| Emotion | Primary Blendshapes | Weights |
|---------|-------------------|---------|
| Happy | `mouthSmileL/R` + `cheekSquintL/R` | 0.5 + 0.3 |
| Sad | `mouthFrownL/R` + `browInnerUp` | 0.5 + 0.4 |
| Angry | `browDownL/R` + `mouthPressL/R` | 0.5 + 0.3 |
| Fearful | `browInnerUp` + `eyeWideL/R` | 0.4 + 0.3 |
| Disgusted | `noseSneerL/R` + `mouthShrugUpper` | 0.5 + 0.3 |
| Surprised | `browOuterUpL/R` + `jawOpen` | 0.4 + 0.4 |
| Neutral | Computed as `max(0, 1 − Σ others)` | — |

**Derived dimensions:**
- **Valence** = `0.8·happy + 0.2·surprised − 0.6·sad − 0.4·angry − 0.3·fear − 0.5·disgust`
- **Arousal** = `0.8·angry + 0.7·fear + 0.6·surprised + 0.3·happy − 0.3·sad − 0.5·neutral`

---

### Vocal Stress Analysis

```mermaid
graph LR
    A["🎙️ Microphone<br/>getUserMedia"] --> B["AudioContext<br/>createMediaStreamSource"]
    B --> C["AnalyserNode<br/><i>FFT size: 2048</i>"]
    C --> D["getFloatTimeDomainData"]
    D --> E["Autocorrelation<br/>Pitch Detection"]
    D --> F["RMS Energy<br/>Calculation"]
    E --> G["Pitch History<br/><i>30-frame window</i>"]
    F --> H["Amplitude History<br/><i>30-frame window</i>"]
    G --> I["Jitter<br/><i>pitch perturbation</i>"]
    G --> J["Mean F0<br/><i>fundamental freq</i>"]
    H --> K["Shimmer<br/><i>amplitude perturbation</i>"]
    F --> L["Energy<br/><i>RMS loudness</i>"]
    I & J & K & L --> M["VocalData<br/>→ Backend"]

    style A fill:#DBEAFE,stroke:#3B82F6,color:#1a1a1a
    style C fill:#FEF3C7,stroke:#D97706,color:#1a1a1a
    style E fill:#EDE9FE,stroke:#8B5CF6,color:#1a1a1a
    style M fill:#FCE7F3,stroke:#EC4899,color:#1a1a1a
```

| Metric | Formula | Clinical Relevance |
|--------|---------|-------------------|
| **Jitter** | `mean(|Pᵢ − Pᵢ₋₁|) / mean(P)` | Pitch instability → vocal tremor under stress |
| **Shimmer** | `mean(|Aᵢ − Aᵢ₋₁|) / mean(A)` | Amplitude instability → emotional dysregulation |
| **Mean F0** | `mean(pitchHistory)` | Fundamental frequency — ↓ in depression, ↑ in anxiety |
| **Energy** | `√(Σxᵢ² / N)` | Voice loudness — engagement vs. withdrawal |

Pitch detection uses **autocorrelation**: the time-domain signal is correlated against lagged copies of itself. The lag at which the correlation peaks gives the fundamental period, converted to frequency via `F0 = sampleRate / lagAtPeak`. Voice activity gating requires RMS > 0.01 to avoid spurious pitch on silence.

---

### Oculomotor Tracking

```mermaid
graph LR
    A["👁️ MediaPipe<br/>FaceLandmarker"] --> B["Eye Blendshapes"]
    B --> C["Blink Detector"]
    B --> D["Gaze Analyzer"]
    C --> E["eyeBlinkL/R > 0.4<br/><i>rising-edge detect</i>"]
    E --> F["Timestamp Buffer<br/><i>10s sliding window</i>"]
    F --> G["Blink Rate<br/><i>blinks/min</i>"]
    D --> H["Max Deviation<br/>eyeLookOut/In/Up/Down"]
    H --> I["Aversion Detection<br/><i>deviation > 0.35</i>"]
    I --> J["Gaze Avoidance %<br/><i>aversion frames / total</i>"]
    G & J --> K["OculomotorData<br/>→ Backend"]

    style A fill:#FEF3C7,stroke:#D97706,color:#1a1a1a
    style C fill:#DCFCE7,stroke:#16A34A,color:#1a1a1a
    style D fill:#EDE9FE,stroke:#8B5CF6,color:#1a1a1a
    style K fill:#FCE7F3,stroke:#EC4899,color:#1a1a1a
```

| Metric | Threshold | Clinical Significance |
|--------|-----------|----------------------|
| **Blink Rate** | > 20/min | Elevated blink rate associated with anxiety and cognitive load |
| **Gaze Avoidance** | > 35% | Sustained gaze aversion linked to social anxiety, shame, and avoidance behaviors |

Both metrics are derived from the same MediaPipe FaceLandmarker output as the emotion pipeline — no additional model or sensor required.

---

### End-to-End Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as CheckInEngine
    participant R as React UI
    participant B as FastAPI Backend
    participant G as Gemini 2.0 Flash

    U->>E: Grants camera + mic
    E->>E: Init MediaPipe + AudioContext + SpeechRecognition
    
    loop Every animation frame
        E->>E: FaceLandmarker.detectForVideo()
        E->>E: AnalyserNode.getFloatTimeDomainData()
        E->>R: onEmotionUpdate(7 emotions)
        E->>R: onVocalUpdate(jitter, shimmer, F0, energy)
        E->>R: onOculomotorUpdate(blinkRate, gazeAvoidance)
    end

    loop Every 1 second
        E->>E: Push sample to emotionSamples[]
        E->>E: Push sample to vocalSamples[]
    end

    U->>R: Types / speaks a message
    R->>E: engine.getAveragedData()
    E-->>R: { emotions, vocals, oculomotor, transcript }
    R->>B: POST /api/sessions/{id}/chat
    Note over R,B: Message + emotion_snapshot + vocal_metrics + oculomotor_snapshot
    B->>G: Chat with biomarker-enriched system prompt
    G-->>B: Therapeutic response
    B->>B: assess_risk(message)
    B-->>R: { reply, risk_level, risk_alert }
    R->>U: Display AI response + update biomarker panel
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Buddy AI Companion** | Gemini 2.0 Flash-powered therapeutic dog companion that receives real-time biomarker context with every message |
| **Live Biomarker Dashboard** | Expandable panel showing real-time FFT voice waveform, 7-emotion bar chart, circular eye-tracking gauges, and valence-arousal scatter plot |
| **Journal Check-In** | Three input modes (Video / Audio / Text) with full multi-modal capture and AI-powered analysis |
| **Cognitive Distortion Detection** | 10 CBT distortion types classified from conversation transcripts |
| **Trigger Profiling** | Cross-session accumulation of psychological triggers, themes, and growth areas |
| **Crisis Safety Net** | PHQ-9 keyword monitoring with automatic clinical escalation and emergency resources |
| **Village Gamification** | 20-level progression system — your virtual village grows with each completed session |
| **Clinician Portal** | Care team dashboard for viewing session reports and risk profiles |
| **Guided Breathing** | 4-7-8 box breathing exercises with visual animation and XP rewards |
| **Cultural Context** | Nepal-specific stressors: "Abroad ko Tension", "Ghar ko Pressure", "Remittance Burden" |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, TypeScript, Vite | SPA framework and build tooling |
| UI Components | Tailwind CSS, shadcn/ui, Radix | Design system and accessible primitives |
| Animation | Framer Motion | Page transitions and micro-interactions |
| Typography | Plus Jakarta Sans + Inter | Display headings + legible body text |
| Face Detection | MediaPipe FaceLandmarker | 52-blendshape face mesh at 60fps (WASM/GPU) |
| Audio Analysis | Web Audio API (AnalyserNode) | FFT-based pitch/energy extraction |
| Speech-to-Text | Web SpeechRecognition API | Browser-native live transcription |
| Visualization | Canvas 2D API | Real-time FFT waveform rendering |
| Backend | FastAPI, Pydantic, Uvicorn | Async Python API server |
| AI Model | Google Gemini 2.0 Flash | Therapeutic conversation and clinical analysis |
| Risk Engine | Custom keyword matcher | PHQ-9 aligned crisis detection |
| CBT Engine | LLM classifier | 10 cognitive distortion types |

---

## Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.10 |
| Google API Key | [Gemini API access](https://aistudio.google.com/apikey) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Binit17/Within.git
cd 404StressNotFound

# 2. Install frontend dependencies
npm install

# 3. Set up the backend
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Add your key: GOOGLE_API_KEY=your_key_here
```

### Running

```bash
# Terminal 1 — Backend (port 8000)
cd backend && source venv/bin/activate
uvicorn main:app --port 8000 --reload

# Terminal 2 — Frontend (port 8080)
npm run dev
```

Open **http://localhost:8080** and grant camera/microphone permissions for full functionality.

> **Note:** The Vite dev server proxies `/api/*` requests to `localhost:8000` automatically.

---

## API Reference

Interactive documentation available at **http://localhost:8000/docs** (Swagger UI).

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sessions` | Create a new therapy session |
| `GET` | `/api/sessions` | List all sessions |
| `GET` | `/api/sessions/{id}` | Get session details |
| `POST` | `/api/sessions/{id}/chat` | Send message with biomarker context |
| `POST` | `/api/sessions/{id}/end` | End session → trigger analysis + village growth |
| `GET` | `/api/sessions/{id}/report` | Generate clinical report |

### Biomarkers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sessions/{id}/emotions` | Submit facial emotion snapshot |
| `POST` | `/api/sessions/{id}/vocals` | Submit vocal biomarker data |
| `POST` | `/api/checkin/analyze` | Full multi-modal check-in analysis |

### Gamification & Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/village/state` | Get current village level and progress |
| `POST` | `/api/village/grow` | Advance village (demo utility) |
| `POST` | `/api/village/reset` | Reset village to level 1 |
| `GET` | `/api/profile/triggers` | Get accumulated trigger profile |
| `GET` | `/api/health` | Service health check |

---

## Project Structure

```
within/
├── backend/
│   ├── main.py                 # FastAPI routes, session lifecycle, village engine
│   ├── gemini_client.py        # Gemini 2.0 Flash client with clinical system prompt
│   ├── models.py               # Pydantic schemas (Session, EmotionSnapshot, etc.)
│   ├── risk_monitor.py         # PHQ-9 keyword-based crisis detection
│   ├── trigger_analyzer.py     # LLM-driven cross-session trigger profiling
│   ├── distortion_analyzer.py  # 10-type CBT cognitive distortion classifier
│   ├── report_generator.py     # Clinical report generation via Gemini
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
│
├── src/
│   ├── lib/
│   │   ├── checkInEngine.ts    # Multi-modal sensing engine (singleton)
│   │   └── api.ts              # Backend API client
│   │
│   ├── components/
│   │   └── LiveBiomarkerPanel.tsx  # Real-time visualization dashboard
│   │
│   ├── pages/
│   │   ├── Index.tsx           # Home — vitals, stress, garden, devices
│   │   ├── ChatPage.tsx        # Buddy AI chat with live biomarkers
│   │   ├── CheckInPage.tsx     # Multi-modal journal (Video/Audio/Text)
│   │   ├── BreathingPage.tsx   # Guided 4-7-8 breathing
│   │   ├── ResourcesPage.tsx   # Mental health resources library
│   │   ├── ClinicianPortal.tsx # Care team dashboard
│   │   ├── ProfilePage.tsx     # User profile and settings
│   │   └── SOSPage.tsx         # Emergency contacts and helplines
│   │
│   ├── hooks/
│   │   └── useGamification.tsx # Village progression and XP logic
│   │
│   └── index.css               # Design system, tokens, animations
│
├── vite.config.ts              # Vite config with /api proxy
├── tailwind.config.ts          # Tailwind extended theme
└── package.json
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---


## Team

**Team 404StressNotFound** — US-Nepal Hackathon 2026

| Member | Role | Contributions |
|--------|------|---------------|
| **Manushi Parajuli** | Team Lead, UI/UX Designer | Team coordination, project planning, UI/UX design system, component architecture, user flow optimization |
| **Sanskriti Poudel** | Product Strategist, UI/UX Designer | Concept ideation, feature specification, UI/UX design, gamification mechanics, breathing exercises module,  cultural contextualization |
| **Anjal Poudel** | Frontend Developer, Research | Frontend component development, resources page, mental health research & content curation |
| **Rebika Parajuli** | Frontend Developer, QA & Testing | Page development, responsive design implementation, cross-browser testing, user experience validation |
| **Binit KC** | Backend Engineer, Systems Integration | FastAPI backend architecture, Gemini AI integration, multi-modal sensing engine (MediaPipe + Web Audio + SpeechRecognition), real-time biomarker pipeline, frontend-backend integration,  |

---

## License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built with 🧠 + ❤️ for mental health by Team 404StressNotFound</sub>
</div>

