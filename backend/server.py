from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
    input_type: str  # "text", "drawing", "speech"
    content: str  # text content or base64 drawing image or transcribed speech
    
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
    response_type: str  # "poem", "motivation", "joke"
    timestamp: str

MOOD_ANALYSIS_PROMPT = """You are an advanced AI Mood Mirror. Analyze the emotional state behind the user's input and respond with a JSON object.

The user expressed themselves through {input_type}. Here is their input:
"{content}"

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
{{
  "emotions": [
    {{"emotion": "happiness", "score": 0.0}},
    {{"emotion": "sadness", "score": 0.0}},
    {{"emotion": "stress", "score": 0.0}},
    {{"emotion": "calmness", "score": 0.0}},
    {{"emotion": "anger", "score": 0.0}},
    {{"emotion": "curiosity", "score": 0.0}}
  ],
  "dominant_mood": "the strongest detected emotion",
  "response_type": "poem or motivation or joke (pick the most appropriate for the mood)",
  "response_text": "A creative, personalized response. If poem: a short 4-6 line poem. If motivation: an uplifting message. If joke: a lighthearted joke related to the mood. Make it warm, human, and empathetic."
}}

Rules:
- Scores must be between 0.0 and 1.0 and sum to approximately 1.0
- For drawings, interpret the description of the drawing's visual elements
- Be creative and empathetic in your response
- The response should directly reflect or react to the detected emotions"""

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
        
        prompt = MOOD_ANALYSIS_PROMPT.format(
            input_type=request.input_type,
            content=request.content
        )
        
        user_message = UserMessage(text=prompt)
        response_text = await chat.send_message(user_message)
        
        # Clean response - remove markdown code blocks if present
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        
        result = json.loads(cleaned)
        
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
        
        # Store in MongoDB
        doc = analysis.model_dump()
        await db.mood_analyses.insert_one(doc)
        
        return analysis
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}, raw: {response_text[:500]}")
        # Fallback response
        fallback = MoodAnalysisResponse(
            input_type=request.input_type,
            input_preview=request.content[:100],
            emotions=[
                EmotionScore(emotion="curiosity", score=0.4),
                EmotionScore(emotion="calmness", score=0.3),
                EmotionScore(emotion="happiness", score=0.15),
                EmotionScore(emotion="sadness", score=0.05),
                EmotionScore(emotion="stress", score=0.05),
                EmotionScore(emotion="anger", score=0.05),
            ],
            dominant_mood="curiosity",
            response_text="Your expression is a beautiful puzzle. Like a prism catching light, every angle reveals something new. Keep exploring the depths of your feelings.",
            response_type="motivation",
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        doc = fallback.model_dump()
        await db.mood_analyses.insert_one(doc)
        return fallback
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise

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
