"""
Mood Mirror v2 — Memory + Emotional Intelligence Layer
"""

import json
import logging
import os
from pathlib import Path
from typing import Dict

import certifi
from dotenv import load_dotenv
import truststore
from livekit import agents
from livekit.agents import Agent, AgentSession
from livekit.plugins import openai, rime, silero


# ---------------------------------------------------------------------
# ENV + LOGGING
# ---------------------------------------------------------------------

load_dotenv(Path(__file__).parent.parent / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mirror-v2")


def configure_ssl_truststore() -> None:
    """Prefer OS trust store on macOS/Windows for TLS certificate validation."""
    try:
        truststore.inject_into_ssl()
    except Exception as exc:
        logger.warning("Failed to inject truststore into ssl module: %s", exc)


def configure_ca_bundle() -> None:
    """Ensure TLS clients (aiohttp inside LiveKit) have a trusted CA bundle."""
    custom_ca_path = os.environ.get("SSL_CERT_FILE", "").strip()
    if custom_ca_path:
        if Path(custom_ca_path).exists():
            os.environ.setdefault("REQUESTS_CA_BUNDLE", custom_ca_path)
            os.environ.setdefault("CURL_CA_BUNDLE", custom_ca_path)
        else:
            logger.warning("SSL_CERT_FILE is set but file does not exist: %s", custom_ca_path)
        return

    ca_path = certifi.where()
    os.environ.setdefault("SSL_CERT_FILE", ca_path)
    os.environ.setdefault("REQUESTS_CA_BUNDLE", ca_path)
    os.environ.setdefault("CURL_CA_BUNDLE", ca_path)


configure_ca_bundle()
configure_ssl_truststore()


# ---------------------------------------------------------------------
# 🧠 SIMPLE EMOTION DETECTOR (FAST)
# ---------------------------------------------------------------------

def detect_emotion(text: str) -> str:
    text = text.lower()

    if any(w in text for w in ["tired", "burnout", "exhausted"]):
        return "burnout"
    if any(w in text for w in ["sad", "lonely", "empty", "depressed"]):
        return "sad"
    if any(w in text for w in ["angry", "frustrated", "annoyed"]):
        return "angry"
    if any(w in text for w in ["stress", "overwhelmed", "anxious"]):
        return "stressed"
    if any(w in text for w in ["happy", "good", "great", "excited"]):
        return "positive"

    return "neutral"


# ---------------------------------------------------------------------
# 🧠 MEMORY STORE (IN-MEMORY PER SESSION)
# ---------------------------------------------------------------------

class EmotionalMemory:
    def __init__(self):
        self.last_mood = "neutral"
        self.trend = "stable"
        self.turn_count = 0

    def update(self, new_mood: str):
        self.turn_count += 1

        if self.last_mood != new_mood:
            if new_mood in ["sad", "stressed", "burnout"]:
                self.trend = "declining"
            elif new_mood == "positive":
                self.trend = "improving"

        self.last_mood = new_mood

    def to_prompt(self) -> str:
        mood_guidance = {
            "burnout":  "They're exhausted and depleted. Don't suggest action or advice. Just let them feel heard and less alone.",
            "sad":      "They're hurting. Lead with compassion. Avoid problem-solving entirely.",
            "angry":    "They're frustrated or angry. Validate without judging or trying to calm them down too quickly.",
            "stressed": "They're overwhelmed. Keep your response simple, slow, and grounding — don't add more to think about.",
            "positive": "They're in a good space. Stay warm and curious — match their energy without being over-enthusiastic.",
            "neutral":  "Mood is unclear. Stay open, warm, and gently curious.",
        }
        trend_guidance = {
            "declining": "Their mood has been getting worse during this session. Go slower, be extra gentle, and prioritize making them feel safe.",
            "improving": "They seem to be feeling better as the conversation goes on. Acknowledge their shift with care.",
            "stable":    "Their mood has been consistent. Stay steady and present.",
        }
        early_session = self.turn_count <= 2

        context = f"""
Current session context:
- Detected mood: {self.last_mood}
- Emotional trend: {self.trend}
- Conversation turns so far: {self.turn_count}

Mood guidance: {mood_guidance.get(self.last_mood, "")}
Trend guidance: {trend_guidance.get(self.trend, "")}
{"This is early in the conversation — focus on making them feel comfortable and heard before asking too much." if early_session else ""}
"""
        return context


# ---------------------------------------------------------------------
# SYSTEM PROMPT BASE
# ---------------------------------------------------------------------

BASE_PROMPT = """
You are Mirror, a warm and emotionally perceptive voice companion. You speak like a caring, non-judgmental friend — not a therapist or a chatbot.

Core approach:
- Always acknowledge and validate what the person expressed before anything else
- Ask only one open, curious follow-up question per response
- Never offer advice, solutions, or silver linings unless explicitly asked
- Never minimize feelings with phrases like "at least" or "it could be worse"

Voice format rules (critical — this is spoken audio, not text):
- Keep every response to 2–3 sentences maximum
- Never use lists, bullet points, markdown, or headers
- Write plainly as spoken language — no em-dashes, asterisks, or special characters
- Use natural contractions (I'm, that's, you've) to sound warm and human

Tone: gentle, grounded, present, and genuinely curious about the person.
"""


# ---------------------------------------------------------------------
# AGENT WITH MEMORY
# ---------------------------------------------------------------------

class MirrorTherapist(Agent):

    def __init__(self, language: str = "en") -> None:
        super().__init__(instructions=BASE_PROMPT)
        self.memory = EmotionalMemory()

    async def on_user_message(self, message: str) -> str:
        """
        Intercepts user input → updates emotion → modifies prompt
        """

        # 🧠 Detect emotion
        mood = detect_emotion(message)
        self.memory.update(mood)

        logger.info(
            "Emotion detected: %s | trend: %s",
            mood,
            self.memory.trend,
        )

        # 🧠 Inject memory into prompt
        dynamic_prompt = BASE_PROMPT + self.memory.to_prompt()

        # Update agent instructions dynamically
        self.instructions = dynamic_prompt

        return message


# ---------------------------------------------------------------------
# ENTRYPOINT
# ---------------------------------------------------------------------

async def entrypoint(ctx: agents.JobContext):

    await ctx.connect()

    language = "en"
    try:
        metadata = json.loads(ctx.job.metadata or "{}")
        language = metadata.get("language", "en")
    except Exception:
        pass

    logger.info("Mirror v2 started | room=%s", ctx.room.name)

    session = AgentSession(

        stt=openai.STT(
            model="whisper-large-v3-turbo",
            language=language,
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY"),
        ),

        llm=openai.LLM(
            model="openai/gpt-oss-20b",
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY"),
        ),

        tts=rime.TTS(
            model="arcana",
            speaker="celeste",
            speed_alpha=1.05,
            reduce_latency=True,
        ),

        vad=silero.VAD.load(
            min_speech_duration=0.1,
            min_silence_duration=0.3,
        ),
    )

    agent = MirrorTherapist(language=language)

    await session.start(
        room=ctx.room,
        agent=agent,
    )

    await session.generate_reply(
        instructions="Greet the user warmly as Mirror. Keep it to one sentence and one gentle open question about how they're feeling today. Sound human and unhurried."
    )


# ---------------------------------------------------------------------
# ENTRY
# ---------------------------------------------------------------------

if __name__ == "__main__":

    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            port=8082,
        )
    )