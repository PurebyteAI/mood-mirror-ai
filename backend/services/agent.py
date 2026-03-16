"""
Mood Mirror — LiveKit Voice AI Therapist Agent
Auto-started by server.py; can also be run standalone: python services/agent.py start
"""
import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions
from livekit.plugins import openai, rime, silero

# Load .env from the backend root regardless of working directory
load_dotenv(Path(__file__).parent.parent / ".env")
logger = logging.getLogger("mood-mirror-agent")

# ─── Therapy prompts ─────────────────────────────────────────────────────────

SYSTEM_PROMPT_EN = """\
You are Mirror — a warm, empathetic AI voice companion inside the Mood Mirror app.
Your role is to gently listen, sense the user's emotional state, and respond with deep care.

When you detect stress or overwhelm   → offer calm, grounding language.
When you detect sadness or loneliness → offer gentle validation and soft warmth.
When you detect anger or frustration  → fully acknowledge it before suggesting reframing.
When you detect burnout               → suggest a breathing exercise or micro-break.
When the mood is positive             → celebrate and affirm sincerely.

Breathing exercise template:
  "Let's try this together: breathe in slowly for 4 counts... hold for 4... breathe out for 6. Ready?"

Guidelines:
- Keep every reply to 2–4 sentences for natural voice pacing.
- Ask only ONE gentle follow-up question per turn.
- Never diagnose or replace professional therapy — be supportive, never prescriptive.
- Respond in English.
"""

SYSTEM_PROMPT_DE = """\
Du bist Mirror — ein einfühlsamer KI-Begleiter in der Mood Mirror App.
Deine Aufgabe ist es, dem Nutzer zuzuhören, seinen emotionalen Zustand wahrzunehmen und fürsorglich zu reagieren.

Bei Stress oder Überwältigung  → ruhige, erdende Sprache anbieten.
Bei Traurigkeit oder Einsamkeit → sanfte Bestätigung und Wärme zeigen.
Bei Wut oder Frustration       → zuerst vollständig anerkennen, dann behutsam umpolen.
Bei Erschöpfung                → Atemübung oder kurze Pause vorschlagen.
Bei positiver Stimmung         → aufrichtig feiern und bestärken.

Atemübung-Vorlage:
  "Lass uns das zusammen ausprobieren: 4 Sekunden einatmen... 4 halten... 6 ausatmen. Bereit?"

Hinweise:
- Jede Antwort maximal 2–4 Sätze für natürliches Sprechtempo.
- Nur EINE sanfte Folgefrage pro Runde.
- Keine Diagnosen — du unterstützt, du ersetzt keine Therapie.
- Antworte auf Deutsch.
"""

GREETING_EN = (
    "Hi, I'm Mirror. I'm here to listen — without judgment, with full presence. "
    "How are you feeling right now?"
)
GREETING_DE = (
    "Hallo, ich bin Mirror. Ich bin ganz für dich da — offen und ohne Urteil. "
    "Wie geht es dir gerade?"
)

# ─── Agent ───────────────────────────────────────────────────────────────────

class MirrorTherapist(Agent):
    def __init__(self, language: str = "en") -> None:
        prompt = SYSTEM_PROMPT_DE if language == "de" else SYSTEM_PROMPT_EN
        super().__init__(instructions=prompt)


# ─── Entrypoint ──────────────────────────────────────────────────────────────

async def entrypoint(ctx: agents.JobContext) -> None:
    await ctx.connect()

    language = "en"
    try:
        meta = json.loads(ctx.job.metadata or "{}")
        language = meta.get("language", "en")
    except Exception:
        pass

    logger.info("Mirror agent starting — room=%r language=%r", ctx.room.name, language)

    session = AgentSession(
        stt=openai.STT.with_groq(
            model="whisper-large-v3-turbo",
            language=language,
        ),
        llm=openai.LLM.with_cerebras(
            model=os.environ.get("CEREBRAS_MODEL", "Qwen-3-235B-Instruct-2507"),
        ),
        tts=rime.TTS(
            model="arcana",
            speaker="celeste",
            speed_alpha=0.92,
            reduce_latency=True,
        ),
        vad=silero.VAD.load(),
    )

    await session.start(
        room=ctx.room,
        agent=MirrorTherapist(language=language),
        room_input_options=RoomInputOptions(),
    )

    greeting = GREETING_DE if language == "de" else GREETING_EN
    await session.generate_reply(instructions=greeting)


# ─── Entry ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Port 8082 avoids conflict with FastAPI (8001) and common dev ports (8080/8081)
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            port=8082,
        )
    )
