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

from services.image_generation_service import (
    ImageGenerationError,
    ImageGenerationService,
    build_scene_prompt,
)
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
    language: Literal["en", "de", "fr", "it", "es", "zh"] = "en"
    response_speed: Literal["fast", "balanced"] = "fast"
    reflection_style: Literal["warm", "instructions", "animals", "fairy", "lotr", "matrix"] = "warm"


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
    language: Literal["en", "de", "fr", "it", "es", "zh"] = "en"
    tapestry_prompt: str = ""


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
    {"emotion": "joy", "score": 0.42},
    {"emotion": "sadness", "score": 0.08},
    {"emotion": "anger", "score": 0.04},
    {"emotion": "fear", "score": 0.12},
    {"emotion": "surprise", "score": 0.18},
    {"emotion": "disgust", "score": 0.02},
    {"emotion": "neutral", "score": 0.14}
  ],
  "dominant_mood": "joy",
  "response_type": "poem",
  "response_text": "The inbox grew a tiny paper hat,\\nthen sneezed confetti on the plan.\\nYou laughed, and half the worry sat\\ndown like a very polite fan.\\n\\nSo brew the tea, unclench the jaw,\\nthe plot twist likes you more than dread.\\nTomorrow's dragon is a straw\\none, and you already drew its bed.",
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
  "tapestry_prompt": "A funny hopeful illustration of the exact objects and place the person named, bright daylight, no text"
}
"""

SUPPORTED_LANGUAGES = {"en", "de", "fr", "it", "es", "zh"}

LANG_INSTRUCTIONS = {
    "en": "Respond entirely in English. The poem, cognitive_reframing text, and tapestry_prompt must be English.",
    "de": "Antworte in der Sprache des Gedichts auf Deutsch. Die JSON-Schlüssel bleiben Englisch. response_text, cognitive_reframing und tapestry_prompt sind auf Deutsch. Das Gedicht bleibt lustig und optimistisch.",
    "fr": "Réponds en français. Les clés JSON restent en anglais. response_text, cognitive_reframing et tapestry_prompt sont en français. Le poème reste drôle et optimiste.",
    "it": "Rispondi in italiano. Le chiavi JSON restano in inglese. response_text, cognitive_reframing e tapestry_prompt sono in italiano. La poesia resta divertente e ottimista.",
    "es": "Responde en español. Las claves JSON siguen en inglés. response_text, cognitive_reframing y tapestry_prompt van en español. El poema sigue siendo divertido y optimista.",
    "zh": "请用普通话回答。JSON 键名保持英文。response_text、cognitive_reframing 和 tapestry_prompt 使用简体中文。诗依然幽默、乐观，仍是两节、每节四行。",
}

STYLE_GUIDES = {
    "warm": "Voice: warm and affectionate, like a friend who already likes them. Everyday kindness. No lecture.",
    "instructions": "Voice: still a poem, and each stanza quietly offers one doable, optimistic instruction tied to what they actually said.",
    "animals": "Voice: funny, kind animals living through their exact situation. Invent original animals. Do not use famous characters.",
    "fairy": "Voice: a tiny original fairy tale about their exact situation, with a hopeful last stanza. Do not retell a published tale.",
    "lotr": "Voice: an original hopeful road poem — small courage, companionship, a burden that turns lighter. Do not name, quote, or copy The Lord of the Rings, its characters, places, or lines.",
    "matrix": "Voice: an original funny waking-up poem — a glitch, a real choice, an ordinary world that is brighter. Do not name, quote, or copy The Matrix, its characters, or its lines.",
}

POEM_RULES = """
Poem rules for response_text:
- Exactly two stanzas. Each stanza is exactly four lines. Put one blank line between the stanzas.
- Keep every line short, about six to ten words.
- Funny and optimistic, even when the feeling is heavy. Find the lighter turn without dismissing them.
- Very connected to their words: name the specific people, objects, places, and events they mentioned.
- No title, no intro sentence, no emoji, no quotation marks around the poem.
- response_type must be "poem".
Emotion rules:
- emotions must be exactly these seven: joy, sadness, anger, fear, surprise, disgust, neutral.
- Scores are between 0.0 and 1.0 and must reflect this specific input.
- dominant_mood must be one of those seven, the strongest one.
- tapestry_prompt describes a funny optimistic picture of THEIR scene (the objects and actions they named), not a generic landscape. No text in the image.
- Never use cold clinical terminology.
- Output valence (-1.0 to 1.0) and arousal (0.0 to 1.0).
- Provide cognitive_reframing with gentle perspective-shift prompts and a grounding affirmation."""

def _style_line(style: str) -> str:
    return STYLE_GUIDES.get(style, STYLE_GUIDES["warm"])


def build_text_prompt(input_type, content, lang_instruction, reflection_style="warm"):
    return (
        "You are Mirror Me — an emotionally intelligent mirror that answers with a short funny, optimistic poem.\n"
        "The poem must be about this exact inquiry, not a generic mood.\n\n"
        f"The user shared this through {input_type}:\n"
        f'"{content}"\n\n'
        f"{_style_line(reflection_style)}\n"
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object matching this exact structure (no markdown fences, no code blocks):\n"
        f"{JSON_FORMAT}\n"
        f"{POEM_RULES}"
    )


def build_drawing_prompt(lang_instruction, reflection_style="warm"):
    return (
        "You are Mirror Me — an emotionally intelligent mirror looking at a hand-drawn expression.\n"
        "Answer with a short funny, optimistic poem about the specific shapes, colors, and objects you see.\n\n"
        f"{_style_line(reflection_style)}\n"
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object matching this exact structure (no markdown fences, no code blocks):\n"
        f"{JSON_FORMAT}\n"
        f"{POEM_RULES}\n"
        "- tapestry_prompt must depict what is actually drawn, in a funny optimistic way."
    )


def build_fusion_prompt(speech_content, lang_instruction, reflection_style="warm"):
    return (
        "You are Mirror Me, reading a drawing and the words spoken with it as one inquiry.\n"
        f"Spoken words: \"{speech_content}\"\n\n"
        "Answer with a short funny, optimistic poem that uses both what they drew and what they said.\n"
        f"{_style_line(reflection_style)}\n"
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object matching this structure:\n"
        f"{JSON_FORMAT}\n"
        f"{POEM_RULES}\n"
        "- Add fusion_alignment: one sentence on whether the drawing and the words agree."
    )


def _snippet(content: str = "") -> str:
    snippet = " ".join((content or "").split()).strip(" .\"'")
    if snippet.startswith("data:") or snippet.startswith("["):
        return ""
    return snippet[:42]


def _fallback_poem(content: str = "", language: str = "en") -> str:
    snippet = _snippet(content)
    poems = {
        "en": (
            f"So, {snippet} — what a plot twist," if snippet else "The day put on a silly little hat,",
            "then tripped, and somehow stuck the landing.\n"
            "You showed up anyway, brave and rumpled —\n"
            "the mirror gives that move a standing.\n"
            "\n"
            "A pocket sun is negotiating peace\n"
            "with whatever tried to cloud your view.\n"
            "It offers you the brighter, funnier take:\n"
            "you are already making it through.",
        ),
        "de": (
            f"Also, {snippet} — was für ein Dreh," if snippet else "Der Tag setzte einen kleinen Hut auf,",
            "stolperte dann, und landete trotzdem.\n"
            "Du warst da, zerknittert und mutig —\n"
            "der Spiegel klatscht genau dafür.\n"
            "\n"
            "Eine Taschensonne verhandelt Frieden\n"
            "mit dem, was dir die Sicht nahm.\n"
            "Sie bietet die hellere, lustigere Fassung:\n"
            "du kommst schon hindurch.",
        ),
        "fr": (
            f"Alors, {snippet} — quel rebondissement," if snippet else "Le jour a mis un petit chapeau,",
            "puis a trébuché, et a tenu l'équilibre.\n"
            "Tu es venu quand même, froissé et brave —\n"
            "le miroir applaudit ce pas.\n"
            "\n"
            "Un soleil de poche négocie la paix\n"
            "avec ce qui voilait ta vue.\n"
            "Il t'offre la version plus claire, plus drôle :\n"
            "tu es déjà en train de t'en sortir.",
        ),
        "it": (
            f"Allora, {snippet} — che colpo di scena," if snippet else "Il giorno si è messo un cappellino,",
            "poi è inciampato, e ha tenuto l'equilibrio.\n"
            "Sei arrivato lo stesso, stropicciato e coraggioso —\n"
            "lo specchio applaude quel passo.\n"
            "\n"
            "Un sole tascabile tratta la pace\n"
            "con ciò che ti offuscava la vista.\n"
            "Ti offre la versione più chiara e più buffa:\n"
            "ci stai già passando attraverso.",
        ),
        "es": (
            f"Entonces, {snippet} — qué giro," if snippet else "El día se puso un sombrerito,",
            "luego tropezó, y aun así aterrizó.\n"
            "Apareciste igual, arrugado y valiente —\n"
            "el espejo aplaude ese paso.\n"
            "\n"
            "Un sol de bolsillo negocia la paz\n"
            "con lo que te nublaba la vista.\n"
            "Te ofrece la versión más clara y más graciosa:\n"
            "ya estás saliendo de esto.",
        ),
        "zh": (
            f"所以，{snippet}——真是个转折，" if snippet else "这一天给自己戴了顶小帽子，",
            "然后绊了一下，居然稳住了。\n"
            "你还是来了，皱巴巴的，也勇敢——\n"
            "镜子为这一步鼓掌。\n"
            "\n"
            "一枚口袋太阳正在讲和，\n"
            "跟那些挡住你视线的东西。\n"
            "它递来更亮、更好笑的版本：\n"
            "你已经在走过去。",
        ),
    }
    opening, rest = poems.get(language, poems["en"])
    return f"{opening}\n{rest}"


def make_fallback(dominant_mood: str = "joy", content: str = "", language: str = "en"):
    language = language if language in SUPPORTED_LANGUAGES else "en"
    scene = " ".join((content or "").split()).strip()
    if scene.startswith("data:") or scene.startswith("["):
        scene = ""
    scene = scene[:180] or {
        "en": "a person and the small everyday thing they just described",
        "de": "eine Person und die kleine alltägliche Sache, die sie gerade beschrieben hat",
        "fr": "une personne et la petite chose du quotidien qu'elle vient de décrire",
        "it": "una persona e la piccola cosa di tutti i giorni che ha appena descritto",
        "es": "una persona y la pequeña cosa cotidiana que acaba de describir",
        "zh": "一个人，以及他们刚刚说起的那件日常小事",
    }[language]
    reframes = {
        "en": {
            "distortion_detected": "Quiet Resilience",
            "explanation": "Carrying significant weight with grace while seeking space to breathe.",
            "reframing_prompts": [
                "What is one realistic step you can take today without forcing perfection?",
                "How can you acknowledge your courage for simply showing up?",
                "What peaceful memory can anchor you right now?",
            ],
            "grounding_affirmation": "You are more capable and resilient than the temporary storms around you.",
        },
        "de": {
            "distortion_detected": "Stille Widerstandskraft",
            "explanation": "Du trägst viel mit Anstand und suchst trotzdem Raum zum Atmen.",
            "reframing_prompts": [
                "Welchen realistischen Schritt kannst du heute tun, ohne Perfektion zu erzwingen?",
                "Wie kannst du deinen Mut anerkennen, einfach da gewesen zu sein?",
                "Welche ruhige Erinnerung kann dich gerade halten?",
            ],
            "grounding_affirmation": "Du bist tragfähiger als die vorübergehenden Stürme um dich herum.",
        },
        "fr": {
            "distortion_detected": "Résilience tranquille",
            "explanation": "Tu portes beaucoup avec grâce, tout en cherchant de l'air.",
            "reframing_prompts": [
                "Quel pas réaliste peux-tu faire aujourd'hui sans viser la perfection ?",
                "Comment reconnaître ton courage d'être simplement venu ?",
                "Quel souvenir paisible peut t'ancrer maintenant ?",
            ],
            "grounding_affirmation": "Tu es plus solide que les tempêtes passagères autour de toi.",
        },
        "it": {
            "distortion_detected": "Resilienza quieta",
            "explanation": "Stai portando molto con grazia, e cerchi comunque spazio per respirare.",
            "reframing_prompts": [
                "Quale passo realistico puoi fare oggi senza forzare la perfezione?",
                "Come puoi riconoscere il coraggio di esserci, semplicemente?",
                "Quale ricordo pacifico può ancorarti adesso?",
            ],
            "grounding_affirmation": "Sei più capace delle tempeste passeggere intorno a te.",
        },
        "es": {
            "distortion_detected": "Resiliencia quieta",
            "explanation": "Llevas mucho con gracia y aun así buscas espacio para respirar.",
            "reframing_prompts": [
                "¿Qué paso realista puedes dar hoy sin exigir perfección?",
                "¿Cómo puedes reconocer el valor de simplemente haber aparecido?",
                "¿Qué recuerdo tranquilo puede anclarte ahora?",
            ],
            "grounding_affirmation": "Eres más capaz que las tormentas pasajeras a tu alrededor.",
        },
        "zh": {
            "distortion_detected": "安静的韧性",
            "explanation": "你体面地扛着不少重量，同时也在找一口呼吸的空间。",
            "reframing_prompts": [
                "今天有哪一步是现实的，不必追求完美？",
                "你如何承认自己只是出现了，这件事本身就有勇气？",
                "哪一段平静的记忆现在可以稳住你？",
            ],
            "grounding_affirmation": "你比周围这些暂时的风暴更稳。",
        },
    }
    tapestries = {
        "en": f"A funny optimistic illustration of this exact moment: {scene}. Bright, specific, no text, no generic ocean or galaxy.",
        "de": f"Eine lustige optimistische Illustration genau dieses Moments: {scene}. Hell, konkret, ohne Text, kein generischer Ozean oder keine Galaxie.",
        "fr": f"Une illustration drôle et optimiste de ce moment précis : {scene}. Lumineuse, concrète, sans texte, sans océan ni galaxie génériques.",
        "it": f"Un'illustrazione buffa e ottimista di questo momento preciso: {scene}. Luminosa, concreta, senza testo, senza oceano o galassia generici.",
        "es": f"Una ilustración divertida y optimista de este momento exacto: {scene}. Brillante, concreta, sin texto, sin océano ni galaxia genéricos.",
        "zh": f"一幅有趣而乐观的插画，画的就是这一刻：{scene}。明亮、具体、没有文字，不要泛泛的海洋或星系。",
    }
    return {
        "emotions": [
            {"emotion": "joy", "score": 0.34},
            {"emotion": "sadness", "score": 0.12},
            {"emotion": "anger", "score": 0.05},
            {"emotion": "fear", "score": 0.08},
            {"emotion": "surprise", "score": 0.16},
            {"emotion": "disgust", "score": 0.03},
            {"emotion": "neutral", "score": 0.22},
        ],
        "dominant_mood": dominant_mood if dominant_mood in {"joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"} else "joy",
        "response_text": _fallback_poem(content, language),
        "response_type": "poem",
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
        "cognitive_reframing": reframes[language],
        "tapestry_prompt": tapestries[language],
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
                reflection_style=request.reflection_style,
            )
            if request.content.startswith("data:image"):
                image_data_url = request.content
        elif request.input_type == "drawing":
            prompt = build_drawing_prompt(lang_instruction, request.reflection_style)
            if request.content.startswith("data:image"):
                image_data_url = request.content
        else:
            prompt = build_text_prompt(
                input_type=request.input_type,
                content=request.content,
                lang_instruction=lang_instruction,
                reflection_style=request.reflection_style,
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
        result = make_fallback(
            content=request.content if request.input_type != "drawing" else "",
            language=request.language,
        )
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
            language=language if language in SUPPORTED_LANGUAGES else "en",
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
    fallback_prompt = build_scene_prompt(
        user_input=request.user_input,
        response_text=request.response_text,
        dominant_mood=request.dominant_mood,
        tapestry_prompt=request.tapestry_prompt,
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
            tapestry_prompt=request.tapestry_prompt,
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
