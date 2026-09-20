from datetime import datetime, timezone
from contextlib import asynccontextmanager
import asyncio
import json
import logging
import os
from pathlib import Path
import sys
from typing import Any, Dict, List, Literal, Optional
import uuid

from dotenv import load_dotenv
import certifi
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, UploadFile
from openai import AsyncOpenAI
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware
import uvicorn

from services.image_generation_service import ImageGenerationError, ImageGenerationService
from services.groq_service import GroqError, GroqService
from services.sqlite_store import SQLiteStore

try:
    from livekit.api import AccessToken, VideoGrants
    _LIVEKIT_AVAILABLE = True
except ImportError:
    _LIVEKIT_AVAILABLE = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


def configure_tls_env() -> None:
    """Ensure child processes inherit a valid CA bundle for HTTPS/TLS verification."""
    if os.environ.get("SSL_CERT_FILE", "").strip():
        return

    ca_path = certifi.where()
    os.environ.setdefault("SSL_CERT_FILE", ca_path)
    os.environ.setdefault("REQUESTS_CA_BUNDLE", ca_path)
    os.environ.setdefault("CURL_CA_BUNDLE", ca_path)


configure_tls_env()


def get_cors_origins() -> List[str]:
    raw_origins = os.environ.get('CORS_ORIGINS', '').strip()
    if not raw_origins or raw_origins == '*':
        return [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ]

    return [origin.strip() for origin in raw_origins.split(',') if origin.strip()]


def get_bool_env(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


CORS_ORIGINS = get_cors_origins()

store = SQLiteStore()
groq_service: Optional[GroqService] = None
image_generation_service: Optional[ImageGenerationService] = None
groq_client: Optional[AsyncOpenAI] = None
_agent_proc: Optional[asyncio.subprocess.Process] = None


def _livekit_configured() -> bool:
    return all(
        os.environ.get(k, "").strip()
        for k in ("LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_URL")
    )


def _init_groq_client() -> Optional[AsyncOpenAI]:
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        return None
    return AsyncOpenAI(api_key=api_key, base_url=os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    global groq_service, image_generation_service, groq_client, _agent_proc

    await store.init()
    try:
        groq_service = GroqService()
    except GroqError as e:
        groq_service = None
        logger.error(f"Groq service initialization failed: {e}")

    try:
        image_generation_service = ImageGenerationService()
    except Exception as e:
        image_generation_service = None
        logger.warning(f"Image generation service initialization failed: {e}")

    groq_client = _init_groq_client()

    auto_start_agent = get_bool_env("AUTO_START_LIVEKIT_AGENT", default=True)
    if auto_start_agent and _livekit_configured():
        agent_script = ROOT_DIR / "agent.py"
        if agent_script.exists():
            try:
                _agent_proc = await asyncio.create_subprocess_exec(
                    sys.executable,
                    str(agent_script),
                    "start",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                logger.info(f"LiveKit agent worker auto-started (PID {_agent_proc.pid})")
            except Exception as exc:
                logger.warning(f"Failed to auto-start LiveKit agent worker: {exc}")
        else:
            logger.warning("agent.py not found; skipping LiveKit worker auto-start")
    elif not auto_start_agent:
        logger.info("AUTO_START_LIVEKIT_AGENT is false; skipping agent worker start")
    else:
        logger.info("LiveKit credentials not fully set; skipping agent worker start")

    yield

    if _agent_proc is not None:
        try:
            _agent_proc.terminate()
            await asyncio.wait_for(_agent_proc.wait(), timeout=3.0)
            logger.info("LiveKit agent worker stopped cleanly")
        except (asyncio.TimeoutError, ProcessLookupError):
            try:
                _agent_proc.kill()
            except ProcessLookupError:
                pass
        _agent_proc = None

    if groq_service is not None:
        await groq_service.close()
        groq_service = None
    if image_generation_service is not None:
        await image_generation_service.close()
        image_generation_service = None


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# Models
class MoodAnalysisRequest(BaseModel):
    input_type: Literal["text", "drawing", "speech", "fusion"]
    content: str
    spoken_text: Optional[str] = None
    language: Literal["en", "de"] = "en"
    response_speed: Literal["fast", "balanced"] = "fast"


class EmotionScore(BaseModel):
    emotion: str
    score: float


class CognitiveReframing(BaseModel):
    distortion_detected: str
    explanation: str
    reframing_prompts: List[str]
    grounding_affirmation: str


class AlignmentData(BaseModel):
    score: float = 0.52
    has_mismatch: bool = False
    words_alignment: int = 75
    voice_alignment: int = 80
    visual_alignment: int = 85
    contradiction_notice: str = "Your expression suggests a gentle balance."
    subconscious_insight: str = "Emotional coherence"


class MoodAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    input_type: str
    input_preview: str
    emotions: List[EmotionScore]
    dominant_mood: str
    response_text: str
    response_type: str
    timestamp: str
    saved_to_journal: bool = False
    valence: float = 0.5
    arousal: float = 0.4
    affect_quadrant: str = "Serenity / Calm Glow"
    alignment: Optional[AlignmentData] = None
    cognitive_reframing: Optional[CognitiveReframing] = None
    tapestry_prompt: Optional[str] = None
    fusion_alignment: Optional[str] = None


class JournalEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    input_type: str
    input_preview: str
    emotions: List[EmotionScore]
    dominant_mood: str
    response_text: str
    response_type: str
    timestamp: str
    journal_note: str = ""
    valence: float = 0.5
    arousal: float = 0.4
    affect_quadrant: str = "Serenity / Calm Glow"


class SaveToJournalRequest(BaseModel):
    analysis_id: str
    note: str = ""


class ImageGenerationRequest(BaseModel):
    user_input: str
    response_text: str
    dominant_mood: str
    response_type: str
    language: Literal["en", "de"] = "en"


class ImageGenerationResponse(BaseModel):
    generated: bool
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    prompt: str
    message: str


class LiveKitTokenRequest(BaseModel):
    room_name: str
    participant_name: str = "user"
    language: str = "en"


JSON_FORMAT = """
{
  "emotions": [
    {"emotion": "calmness", "score": 0.35},
    {"emotion": "hopeful", "score": 0.30},
    {"emotion": "reflective", "score": 0.20},
    {"emotion": "curiosity", "score": 0.10},
    {"emotion": "stress", "score": 0.05}
  ],
  "dominant_mood": "calmness",
  "response_type": "reflection",
  "response_text": "It sounds like you're carrying a lot, but you're still showing up. That takes quiet strength. Be gentle with yourself — you're doing better than you think.",
  "valence": 0.65,
  "arousal": 0.30,
  "cognitive_reframing": {
    "distortion_detected": "Quiet Overload",
    "explanation": "Carrying heavy expectations without recognizing current resilience.",
    "reframing_prompts": [
      "What is one small burden you can set down for tonight?",
      "What would you say to someone you care about who did all that you did today?",
      "How can you honor your need for rest as a strength?"
    ],
    "grounding_affirmation": "You are doing enough. You are allowed to rest and let the tide settle."
  },
  "tapestry_prompt": "A serene bioluminescent twilight ocean with gentle pastel auroras and reflective mountain silhouettes, 4k digital concept art"
}
"""

LANG_INSTRUCTIONS = {
    "en": "Respond entirely in English. Your reflection should be warm, human, empathetic, and poetic.",
    "de": "Antworte vollständig auf Deutsch. Die JSON-Schlüssel müssen auf Englisch bleiben, aber der Wert von response_text und cognitive_reframing muss auf Deutsch sein. Sei einfühlsam und poetisch.",
}

RULES_TEXT = """
Rules:
- Act as a gentle, thoughtful emotional mirror, NOT a therapist or clinical diagnostic system.
- Never use cold clinical terminology.
- The response_text must be warm, poetic, supportive, concise (60-120 words), and non-judgmental.
- Be gentle and validate the user's emotional experience.
- Emotional scores should be soft relative weights between 0.0 and 1.0.
- Output 2D affect coordinates: valence (-1.0 to 1.0) and arousal (0.0 to 1.0).
- Provide cognitive_reframing with gentle CBT perspective-shift prompts and grounding affirmation."""

RULES_DRAWING = """
Rules:
- Act as a gentle, thoughtful emotional mirror interpreting the visual language of a drawing.
- Look at colors, stroke intensity, flow, density, and composition to perceive the emotional energy.
- Never be clinical or diagnostic.
- The response_text must be warm, poetic, supportive, concise (60-120 words), reflecting what you see and feel in their expression.
- Output valence (-1.0 to 1.0), arousal (0.0 to 1.0), cognitive_reframing, and tapestry_prompt."""

RULES_FUSION = """
Rules:
- Act as a multimodal emotional intelligence mirror synthesizing both visual drawing and spoken voice narration simultaneously.
- Detect the deeper harmony or unspoken contrast between what the user drew and what they spoke.
- Provide a brief fusion_alignment note (e.g., 'Harmonious flow between words and colors' or 'Visual strokes reveal tension not spoken aloud').
- The response_text must be compassionate, poetic, and unifying."""


def build_text_prompt(input_type, content, lang_instruction):
    return (
        "You are Mirror Me — a cinematic, intimate, and emotionally intelligent AI Mood Mirror.\n"
        "Your role is to reflect the user's inner world with gentle clarity, warmth, and empathy.\n\n"
        f"The user shared this expression through {input_type}:\n"
        f'"{content}"\n\n'
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object matching this exact structure (no markdown fences, no code blocks):\n"
        f"{JSON_FORMAT}\n"
        f"{RULES_TEXT}"
    )


def build_drawing_prompt(lang_instruction):
    return (
        "You are Mirror Me — an emotionally intelligent AI Mood Mirror with vision capabilities.\n"
        "You are viewing a hand-drawn expression created by a user in their private digital sanctuary.\n\n"
        "Analyze the visual rhythms, colors, flowing lines, and composition to sense their underlying emotional state.\n\n"
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object matching this exact structure (no markdown fences, no code blocks):\n"
        f"{JSON_FORMAT}\n"
        f"{RULES_DRAWING}"
    )


def build_fusion_prompt(speech_content, lang_instruction):
    return (
        "You are Mirror Me — a cross-modal emotional intelligence engine synthesizing both a hand-drawn visual sketch and simultaneous spoken voice narration.\n"
        f"Spoken Voice Narration: \"{speech_content}\"\n\n"
        "Analyze both the drawing (colors, stroke intensity, chaotic or smooth lines) and spoken words to sense their complete emotional truth.\n\n"
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object matching this structure:\n"
        f"{JSON_FORMAT}\n"
        f"{RULES_FUSION}"
    )


def make_fallback(dominant_mood: str = "calmness"):
    return {
        "emotions": [
            {"emotion": "calmness", "score": 0.40},
            {"emotion": "hopeful", "score": 0.35},
            {"emotion": "reflective", "score": 0.25},
        ],
        "dominant_mood": dominant_mood,
        "response_text": "It sounds like you're carrying a lot, but you're still showing up. That takes quiet strength. Be gentle with yourself — you're doing better than you think.",
        "response_type": "reflection",
        "valence": 0.65,
        "arousal": 0.25,
        "affect_quadrant": "Serenity / Calm Glow",
        "alignment": {
            "score": 0.52,
            "has_mismatch": True,
            "words_alignment": 68,
            "voice_alignment": 84,
            "visual_alignment": 87,
            "contradiction_notice": "Your words sound relieved, but your voice and drawing carry more tension.",
            "subconscious_insight": "Relief + excitement + underlying exhaustion"
        },
        "cognitive_reframing": {
            "distortion_detected": "Quiet Resilience",
            "explanation": "Carrying significant weight with grace while seeking space to breathe.",
            "reframing_prompts": [
                "What is one realistic step you can take today without forcing perfection?",
                "How can you acknowledge your courage for simply showing up?",
                "What peaceful memory can anchor you right now?"
            ],
            "grounding_affirmation": "You are more capable and resilient than the temporary storms around you."
        },
        "tapestry_prompt": "A serene bioluminescent twilight ocean with gentle pastel auroras and reflective mountain silhouettes, 4k digital concept art",
        "fusion_alignment": "Synchronous alignment between inner intention and authentic expression."
    }


@app.api_route("/", methods=["GET", "HEAD"])
@app.api_route("/health", methods=["GET", "HEAD"])
@api_router.api_route("/", methods=["GET", "HEAD"])
@api_router.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok", "service": "mood-mirror-ai"}


@api_router.post("/analyze")
async def analyze_mood(request: MoodAnalysisRequest):
    try:
        lang_instruction = LANG_INSTRUCTIONS.get(request.language, LANG_INSTRUCTIONS["en"])

        image_data_url = None
        if request.input_type == "fusion":
            prompt = build_fusion_prompt(
                speech_content=request.spoken_text or request.content,
                lang_instruction=lang_instruction,
            )
            if request.content.startswith("data:image"):
                image_data_url = request.content
        elif request.input_type == "drawing":
            prompt = build_drawing_prompt(lang_instruction)
            if request.content.startswith("data:image"):
                image_data_url = request.content
        else:
            prompt = build_text_prompt(
                input_type=request.input_type,
                content=request.content,
                lang_instruction=lang_instruction,
            )

        if groq_service is None:
            raise GroqError("Groq service is not available")
        result = await groq_service.generate_analysis(
            prompt=prompt,
            image_data_url=image_data_url,
            language=request.language,
            response_speed=request.response_speed,
        )

        input_preview = request.content[:100] + "..." if len(request.content) > 100 else request.content
        if request.input_type == "drawing":
            input_preview = "[Drawing]"
        elif request.input_type == "fusion":
            input_preview = f"[Fusion: Drawing + Voice '{request.spoken_text or 'Audio'[:30]}']"

        analysis = MoodAnalysisResponse(
            input_type=request.input_type,
            input_preview=input_preview,
            emotions=[EmotionScore(**e) for e in result["emotions"]],
            dominant_mood=result["dominant_mood"],
            response_text=result["response_text"],
            response_type=result["response_type"],
            timestamp=datetime.now(timezone.utc).isoformat(),
            valence=result.get("valence", 0.5),
            arousal=result.get("arousal", 0.4),
            affect_quadrant=result.get("affect_quadrant", "Serenity / Calm Glow"),
            alignment=AlignmentData(**result["alignment"]) if result.get("alignment") else None,
            cognitive_reframing=CognitiveReframing(**result["cognitive_reframing"]) if result.get("cognitive_reframing") else None,
            tapestry_prompt=result.get("tapestry_prompt"),
            fusion_alignment=result.get("fusion_alignment"),
        )

        doc = analysis.model_dump()
        await store.save_analysis(doc)
        return analysis

    except Exception as e:
        logger.error(f"Analysis error type={type(e).__name__}: {e}")
        import traceback
        logger.error(traceback.format_exc())
        result = make_fallback()
        input_preview = "[Drawing]" if request.input_type == "drawing" else request.content[:100]
        fallback = MoodAnalysisResponse(
            input_type=request.input_type,
            input_preview=input_preview,
            emotions=[EmotionScore(**e) for e in result["emotions"]],
            dominant_mood=result["dominant_mood"],
            response_text=result["response_text"],
            response_type=result["response_type"],
            timestamp=datetime.now(timezone.utc).isoformat(),
            valence=result["valence"],
            arousal=result["arousal"],
            affect_quadrant=result["affect_quadrant"],
            cognitive_reframing=CognitiveReframing(**result["cognitive_reframing"]),
            tapestry_prompt=result["tapestry_prompt"],
            fusion_alignment=result["fusion_alignment"],
        )
        doc = fallback.model_dump()
        await store.save_analysis(doc)
        return fallback


@api_router.post("/livekit/token")
async def get_livekit_token(req: LiveKitTokenRequest):
    if not _LIVEKIT_AVAILABLE:
        raise HTTPException(status_code=503, detail="livekit SDK not installed")
    api_key = os.environ.get("LIVEKIT_API_KEY", "").strip()
    api_secret = os.environ.get("LIVEKIT_API_SECRET", "").strip()
    livekit_url = os.environ.get("LIVEKIT_URL", "").strip()
    if not all([api_key, api_secret, livekit_url]):
        raise HTTPException(status_code=503, detail="LiveKit not configured — set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL in .env")
    token = (
        AccessToken(api_key, api_secret)
        .with_identity(req.participant_name)
        .with_name(req.participant_name)
        .with_grants(VideoGrants(room_join=True, room=req.room_name))
        .with_metadata(json.dumps({"language": req.language}))
        .to_jwt()
    )
    return {"token": token, "url": livekit_url}


@api_router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
):
    if groq_client is None:
        raise HTTPException(status_code=503, detail="Transcription service not configured — set GROQ_API_KEY")
    audio_bytes = await file.read()
    try:
        result = await groq_client.audio.transcriptions.create(
            file=(file.filename or "audio.webm", audio_bytes, file.content_type or "audio/webm"),
            model="whisper-large-v3-turbo",
            language=language if language in ("en", "de") else "en",
            response_format="text",
        )
        text = result if isinstance(result, str) else getattr(result, "text", str(result))
        return {"text": text}
    except Exception as e:
        logger.error(f"Groq transcription error: {e}")
        raise HTTPException(status_code=502, detail="Transcription failed")


@api_router.get("/history")
async def get_history():
    return await store.get_history(limit=20)


@api_router.delete("/history")
async def clear_history():
    await store.clear_history()
    return {"message": "History cleared"}


# === JOURNAL ENDPOINTS ===

@api_router.post("/journal/save")
async def save_to_journal(request: SaveToJournalRequest):
    analysis = await store.get_analysis(request.analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    await store.save_to_journal(analysis, request.note)
    return {"message": "Saved to journal", "id": request.analysis_id}


@api_router.get("/journal")
async def get_journal(days: int = 30):
    return await store.get_journal(days=days, limit=100)


@api_router.get("/journal/trends")
async def get_mood_trends(days: int = 30):
    return await store.get_journal_trends(days=days, limit=200)


@api_router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: str):
    deleted = await store.delete_journal_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Removed from journal"}


@api_router.post("/image/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    fallback_prompt = (
        f"Atmospheric ethereal concept artwork for {request.dominant_mood}: "
        f"inspired by '{request.user_input[:80]}', cinematic lighting, tranquil cosmic calm, 4k digital art"
    )
    if image_generation_service is None:
        return ImageGenerationResponse(
            generated=False,
            prompt=fallback_prompt,
            message="Image service unavailable",
        )
    try:
        result = await image_generation_service.generate(
            user_input=request.user_input,
            response_text=request.response_text,
            dominant_mood=request.dominant_mood,
            response_type=request.response_type,
            language=request.language,
        )
        return ImageGenerationResponse(
            generated=True,
            image_url=result.get("image_url"),
            image_base64=result.get("image_base64"),
            prompt=result["prompt"],
            message="Image generated",
        )
    except ImageGenerationError as e:
        logger.error(f"Image generation error: {e}")
        return ImageGenerationResponse(
            generated=False,
            prompt=fallback_prompt,
            message="Image generation failed",
        )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host=os.environ.get("BACKEND_HOST", "127.0.0.1"),
        port=int(os.environ.get("BACKEND_PORT", "8001")),
        reload=get_bool_env("BACKEND_RELOAD", default=False),
    )
