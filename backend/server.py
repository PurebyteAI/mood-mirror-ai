from datetime import datetime, timezone
from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path
from typing import List, Literal, Optional
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware
import uvicorn

from services.openrouter_service import OpenRouterError, OpenRouterService
from services.sqlite_store import SQLiteStore

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


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
openrouter_service: Optional[OpenRouterService] = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global openrouter_service

    await store.init()
    try:
        openrouter_service = OpenRouterService()
    except OpenRouterError as e:
        openrouter_service = None
        logger.error(f"OpenRouter initialization failed: {e}")

    try:
        yield
    finally:
        if openrouter_service is not None:
            await openrouter_service.close()
            openrouter_service = None

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Models
class MoodAnalysisRequest(BaseModel):
    input_type: Literal["text", "drawing", "speech"]
    content: str
    language: Literal["en", "de"] = "en"
    
class EmotionScore(BaseModel):
    emotion: str
    score: float
    
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

class SaveToJournalRequest(BaseModel):
    analysis_id: str
    note: str = ""

JSON_FORMAT = """
{
  "emotions": [
    {"emotion": "happiness", "score": 0.0},
    {"emotion": "sadness", "score": 0.0},
    {"emotion": "stress", "score": 0.0},
    {"emotion": "calmness", "score": 0.0},
    {"emotion": "anger", "score": 0.0},
    {"emotion": "curiosity", "score": 0.0}
  ],
  "dominant_mood": "the strongest detected emotion",
  "response_type": "poem or motivation or joke",
  "response_text": "A creative personalized response"
}
"""

LANG_INSTRUCTIONS = {
    "en": "Respond entirely in English.",
    "de": "Antworte vollständig auf Deutsch. The JSON keys must remain in English, but the response_text value must be in German.",
}

RULES_TEXT = """
Rules:
- Scores must be between 0.0 and 1.0 and sum to approximately 1.0
- Be creative and empathetic in your response
- If poem: a short 4-6 line poem. If motivation: an uplifting message. If joke: a lighthearted joke
- The response should directly reflect or react to the detected emotions"""

RULES_DRAWING = """
Rules:
- Scores must be between 0.0 and 1.0 and sum to approximately 1.0
- Interpret the drawing's visual language: dark heavy strokes may indicate stress, bright colors happiness, flowing lines calmness, sharp angles anger, etc.
- Be creative and empathetic in your response
- If poem: a short 4-6 line poem. If motivation: an uplifting message. If joke: a lighthearted joke
- The response should reflect what you see in the drawing"""


def build_text_prompt(input_type, content, lang_instruction):
    return (
        "You are an advanced AI Mood Mirror. Analyze the emotional state behind the user's input and respond with a JSON object.\n\n"
        f"The user expressed themselves through {input_type}. Here is their input:\n"
        f'"{content}"\n\n'
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):\n"
        f"{JSON_FORMAT}\n"
        f"{RULES_TEXT}"
    )


def build_drawing_prompt(lang_instruction):
    return (
        "You are an advanced AI Mood Mirror with vision capabilities. You are looking at a hand-drawn image created by a user as an emotional expression.\n\n"
        "Analyze the visual elements of this drawing — colors used, shapes, patterns, intensity of strokes, and overall composition — to determine the emotional state of the artist.\n\n"
        f"{lang_instruction}\n\n"
        "Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):\n"
        f"{JSON_FORMAT}\n"
        f"{RULES_DRAWING}"
    )


def make_fallback():
    return {
        "emotions": [
            {"emotion": "curiosity", "score": 0.4},
            {"emotion": "calmness", "score": 0.3},
            {"emotion": "happiness", "score": 0.15},
            {"emotion": "sadness", "score": 0.05},
            {"emotion": "stress", "score": 0.05},
            {"emotion": "anger", "score": 0.05},
        ],
        "dominant_mood": "curiosity",
        "response_text": "Your expression is a beautiful puzzle. Like a prism catching light, every angle reveals something new. Keep exploring the depths of your feelings.",
        "response_type": "motivation",
    }


@api_router.get("/")
async def root():
    return {"message": "AI Mood Mirror API"}


@api_router.post("/analyze")
async def analyze_mood(request: MoodAnalysisRequest):
    try:
        lang_instruction = LANG_INSTRUCTIONS.get(request.language, LANG_INSTRUCTIONS["en"])

        image_data_url = None
        if request.input_type == "drawing":
            prompt = build_drawing_prompt(lang_instruction)
            if request.content.startswith("data:image"):
                image_data_url = request.content
        else:
            prompt = build_text_prompt(
                input_type=request.input_type,
                content=request.content,
                lang_instruction=lang_instruction,
            )

        if openrouter_service is None:
            raise OpenRouterError("OpenRouter service is not available")
        result = await openrouter_service.generate_analysis(
            prompt=prompt,
            image_data_url=image_data_url,
            language=request.language,
        )

        input_preview = request.content[:100] + "..." if len(request.content) > 100 else request.content
        if request.input_type == "drawing":
            input_preview = "[Drawing]"

        analysis = MoodAnalysisResponse(
            input_type=request.input_type,
            input_preview=input_preview,
            emotions=[EmotionScore(**e) for e in result["emotions"]],
            dominant_mood=result["dominant_mood"],
            response_text=result["response_text"],
            response_type=result["response_type"],
            timestamp=datetime.now(timezone.utc).isoformat()
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
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        doc = fallback.model_dump()
        await store.save_analysis(doc)
        return fallback


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
