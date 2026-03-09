# AI Mood Mirror - PRD

## Original Problem Statement
Build an AI Mood Mirror web app. Visitors interact with the system by writing, drawing, or speaking. The AI analyses the emotional state (mood) behind the input and generates a personalised response text that reflects or reacts to the detected mood. The system acts like a mirror of emotions powered by AI.

## Architecture
- **Backend**: FastAPI (Python) with Gemini 3 Flash via emergentintegrations
- **Frontend**: React with Tailwind CSS, Framer Motion, Recharts, dark immersive theme
- **Database**: MongoDB (mood_analyses + mood_journal collections)
- **AI**: Gemini 3 Flash (gemini-3-flash-preview) via Emergent LLM Key — text + vision (multimodal)

## User Personas
- General public / museum visitors / anyone curious about AI emotion analysis
- Anonymous, no auth required
- English and German speakers

## What's Been Implemented (Jan 2026)

### MVP (Iteration 1)
- [x] Full-stack AI Mood Mirror with dark immersive theme
- [x] Three input modes: Write, Draw, Speak
- [x] Gemini 3 Flash integration for mood analysis
- [x] Emotion breakdown visualization (6 emotions)
- [x] Creative AI responses (poems, motivation, jokes)
- [x] Session history panel
- [x] Glassmorphism UI with ambient mood orb

### Feature Update (Iteration 2)
- [x] Drawing Vision Analysis via Gemini FileContent (base64 image)
- [x] Audio Waveform Visualization (Web Audio API)
- [x] Mood Journal: save, view, delete, personal notes
- [x] Mood Trends: Recharts AreaChart, time filtering (7d/30d/90d)
- [x] Journal Stats: avg emotion percentages

### Feature Update (Iteration 3)
- [x] Multi-language: English + German (full UI translation via i18n.js)
- [x] AI responds in selected language (German responses from Gemini)
- [x] Speech recognition language switching (en-US / de-DE)
- [x] Language switcher component (EN/DE toggle in header)
- [x] Ambient Background Music: Web Audio API procedural synthesis
  - Different chord progressions per mood (C major for happy, A minor for sad, etc.)
  - LFO modulation, low-pass filters, smooth crossfades
  - Volume control with hover slider
  - Toggle on/off button in bottom-right corner
- [x] Critical bug fix: Python .format() KeyError on JSON template strings

All tests passing: Backend 100%, Frontend 100%, Integration 100%

## Backlog
- P2: Social sharing of mood results (share card image)
- P2: Export mood journal as PDF
- P3: More languages (French, Spanish, etc.)
- P3: Collaborative mood sessions
