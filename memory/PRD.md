# AI Mood Mirror - PRD

## Original Problem Statement
Build an AI Mood Mirror web app. Visitors interact with the system by writing, drawing, or speaking. The AI analyses the emotional state (mood) behind the input and generates a personalised response text that reflects or reacts to the detected mood. The system acts like a mirror of emotions powered by AI.

## Architecture
- **Backend**: FastAPI (Python) with Gemini 3 Flash via emergentintegrations
- **Frontend**: React with Tailwind CSS, Framer Motion, dark immersive theme
- **Database**: MongoDB for mood analysis history
- **AI**: Gemini 3 Flash (gemini-3-flash-preview) via Emergent LLM Key

## User Personas
- General public / museum visitors / anyone curious about AI emotion analysis
- Anonymous, no auth required

## Core Requirements
- Text input for mood expression
- Drawing canvas for creative expression  
- Speech/voice recording input (Web Speech API)
- AI mood analysis with 6 emotion scores
- Creative AI-generated responses (poems, motivation, jokes)
- Mood visualization with animated emotion bars
- Session history of past analyses

## What's Been Implemented (Jan 2026)
- [x] Full-stack AI Mood Mirror with dark immersive theme
- [x] Three input modes: Write, Draw, Speak
- [x] Gemini 3 Flash integration for mood analysis
- [x] Emotion breakdown visualization (6 emotions)
- [x] Creative AI responses (poems, motivation, jokes)
- [x] Session history with history panel
- [x] Glassmorphism UI with ambient mood orb
- [x] Input validation (Literal types for input_type)
- [x] All tests passing (Backend 100%, Frontend 100%, Integration 100%)

## Backlog
- P1: Save drawings as actual images and send to vision model for analysis
- P1: Add audio waveform visualization during speech recording
- P2: Share mood analysis results (social sharing)
- P2: Mood trends over time (charts/analytics)
- P2: Multiple language support
- P3: Export mood journal as PDF
