from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone
import json
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Models
class MoodAnalysisRequest(BaseModel):
    input_type: Literal["text", "drawing", "speech"]
    content: str  # text/speech content or base64 data URL for drawings
    
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

JSON_FORMAT = """{
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
}"""

TEXT_PROMPT = """You are an advanced AI Mood Mirror. Analyze the emotional state behind the user's input and respond with a JSON object.

The user expressed themselves through {input_type}. Here is their input:
"{content}"

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
""" + JSON_FORMAT + """

Rules:
- Scores must be between 0.0 and 1.0 and sum to approximately 1.0
- Be creative and empathetic in your response
- If poem: a short 4-6 line poem. If motivation: an uplifting message. If joke: a lighthearted joke
- The response should directly reflect or react to the detected emotions"""

DRAWING_PROMPT = """You are an advanced AI Mood Mirror with vision capabilities. You are looking at a hand-drawn image created by a user as an emotional expression.

Analyze the visual elements of this drawing — colors used, shapes, patterns, intensity of strokes, and overall composition — to determine the emotional state of the artist.

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
""" + JSON_FORMAT + """

Rules:
- Scores must be between 0.0 and 1.0 and sum to approximately 1.0
- Interpret the drawing's visual language: dark heavy strokes may indicate stress, bright colors happiness, flowing lines calmness, sharp angles anger, etc.
- Be creative and empathetic in your response
- If poem: a short 4-6 line poem. If motivation: an uplifting message. If joke: a lighthearted joke
- The response should reflect what you see in the drawing"""


def clean_json_response(text):
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    if cleaned.startswith("json"):
        cleaned = cleaned[4:].strip()
    return cleaned


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
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an AI emotion analyst. Always respond with valid JSON only."
        ).with_model("gemini", "gemini-3-flash-preview")

        if request.input_type == "drawing" and request.content.startswith("data:image"):
            # Vision-based analysis: send the actual image
            header, b64data = request.content.split(",", 1)
            content_type = header.split(";")[0].split(":")[1]  # e.g. image/png
            
            file_content = FileContent(
                content_type=content_type,
                file_content_base64=b64data
            )
            user_message = UserMessage(
                text=DRAWING_PROMPT,
                file_contents=[file_content]
            )
        else:
            prompt = TEXT_PROMPT.format(
                input_type=request.input_type,
                content=request.content
            )
            user_message = UserMessage(text=prompt)

        response_text = await chat.send_message(user_message)
        cleaned = clean_json_response(response_text)
        
        try:
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.error(f"JSON parse error, raw: {response_text[:500]}")
            result = make_fallback()

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
        await db.mood_analyses.insert_one(doc)
        return analysis

    except Exception as e:
        logger.error(f"Analysis error: {e}")
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
        await db.mood_analyses.insert_one(doc)
        return fallback


@api_router.get("/history")
async def get_history():
    analyses = await db.mood_analyses.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).to_list(20)
    return analyses


@api_router.delete("/history")
async def clear_history():
    await db.mood_analyses.delete_many({})
    return {"message": "History cleared"}


# === JOURNAL ENDPOINTS ===

@api_router.post("/journal/save")
async def save_to_journal(request: SaveToJournalRequest):
    analysis = await db.mood_analyses.find_one(
        {"id": request.analysis_id}, {"_id": 0}
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    journal_entry = {
        **analysis,
        "journal_note": request.note,
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    # Check if already saved
    existing = await db.mood_journal.find_one({"id": request.analysis_id})
    if existing:
        await db.mood_journal.update_one(
            {"id": request.analysis_id},
            {"$set": {"journal_note": request.note}}
        )
    else:
        await db.mood_journal.insert_one(journal_entry)

    # Mark as saved in analyses
    await db.mood_analyses.update_one(
        {"id": request.analysis_id},
        {"$set": {"saved_to_journal": True}}
    )

    return {"message": "Saved to journal", "id": request.analysis_id}


@api_router.get("/journal")
async def get_journal(days: int = 30):
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    entries = await db.mood_journal.find(
        {"timestamp": {"$gte": cutoff}}, {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    return entries


@api_router.get("/journal/trends")
async def get_mood_trends(days: int = 30):
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    entries = await db.mood_journal.find(
        {"timestamp": {"$gte": cutoff}}, {"_id": 0}
    ).sort("timestamp", 1).to_list(200)

    trends = []
    for entry in entries:
        emotion_map = {}
        for em in entry.get("emotions", []):
            emotion_map[em["emotion"]] = em["score"]
        trends.append({
            "timestamp": entry["timestamp"],
            "dominant_mood": entry.get("dominant_mood", ""),
            "happiness": emotion_map.get("happiness", 0),
            "sadness": emotion_map.get("sadness", 0),
            "stress": emotion_map.get("stress", 0),
            "calmness": emotion_map.get("calmness", 0),
            "anger": emotion_map.get("anger", 0),
            "curiosity": emotion_map.get("curiosity", 0),
        })
    return trends


@api_router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: str):
    result = await db.mood_journal.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.mood_analyses.update_one(
        {"id": entry_id},
        {"$set": {"saved_to_journal": False}}
    )
    return {"message": "Removed from journal"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
