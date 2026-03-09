# AI Mood Mirror - PRD

## Original Problem Statement
Build an AI Mood Mirror web app. Visitors interact with the system by writing, drawing, or speaking. The AI analyses the emotional state (mood) behind the input and generates a personalised response text that reflects or reacts to the detected mood. The system acts like a mirror of emotions powered by AI.

## Architecture
- **Backend**: FastAPI (Python) with Gemini 3 Flash via emergentintegrations
- **Frontend**: React with Tailwind CSS, Framer Motion, Recharts, dark immersive theme
- **Database**: MongoDB (mood_analyses + mood_journal collections)
- **AI**: Gemini 3 Flash (gemini-3-flash-preview) via Emergent LLM Key — supports text AND vision (image analysis)

## User Personas
- General public / museum visitors / anyone curious about AI emotion analysis
- Anonymous, no auth required

## Core Requirements
- Text input for mood expression
- Drawing canvas with AI vision analysis (actual image sent to Gemini)
- Speech/voice recording with real-time waveform visualization (Web Audio API)
- AI mood analysis with 6 emotion scores (happiness, sadness, stress, calmness, anger, curiosity)
- Creative AI-generated responses (poems, motivation, jokes)
- Mood visualization with animated emotion bars
- Mood Journal with saved reflections, personal notes, trend charts, time filtering
- Session history of past analyses

## What's Been Implemented (Jan 2026)

### MVP (Iteration 1)
- [x] Full-stack AI Mood Mirror with dark immersive theme
- [x] Three input modes: Write, Draw, Speak
- [x] Gemini 3 Flash integration for mood analysis
- [x] Emotion breakdown visualization (6 emotions)
- [x] Creative AI responses (poems, motivation, jokes)
- [x] Session history with history panel
- [x] Glassmorphism UI with ambient mood orb
- [x] All tests passing (100% across backend, frontend, integration)

### Feature Update (Iteration 2)
- [x] Drawing Vision Analysis: Sends actual base64 canvas image to Gemini 3 Flash via FileContent for multimodal visual mood analysis
- [x] Audio Waveform Visualization: Real-time waveform + frequency bar canvas during speech recording using Web Audio API (AudioContext, AnalyserNode)
- [x] Mood Journal: Save reflections with personal notes, expandable emotion breakdowns, delete entries
- [x] Mood Trends: Recharts AreaChart showing 6-emotion evolution over time with gradient fills
- [x] Journal Stats: Average emotion percentages across all journal entries
- [x] Time Filtering: 7d / 30d / 90d filter on journal view
- [x] Navigation: Journal button + History button in header, Mood Mirror logo returns to main view
- [x] All tests passing (100% across backend, frontend, integration)

## Backlog
- P1: Multi-language support for mood analysis
- P2: Social sharing of mood results (share card image)
- P2: Export mood journal as PDF
- P3: Ambient background music that shifts with mood
- P3: Collaborative mood sessions (multiple users)
