import pytest
from fastapi.testclient import TestClient
from server import app, make_fallback, build_text_prompt, build_drawing_prompt
from services.image_generation_service import build_scene_prompt

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "mood-mirror-ai"

def test_fallback_structure():
    fallback = make_fallback(content="I spilled coffee on the train")
    assert fallback["dominant_mood"] in {"joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"}
    names = [item["emotion"] for item in fallback["emotions"]]
    assert names == ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]
    lines = [line for line in fallback["response_text"].splitlines() if line.strip()]
    assert len(lines) == 8
    assert "coffee" in fallback["response_text"]
    assert "coffee" in fallback["tapestry_prompt"]

def test_prompts_are_non_clinical():
    prompt_en = build_text_prompt("text", "Feeling overwhelmed with work", "Respond in English", "animals")
    assert "Never use cold clinical terminology" in prompt_en
    assert "two stanzas" in prompt_en
    assert "joy, sadness, anger, fear, surprise, disgust, neutral" in prompt_en
    assert "original animals" in prompt_en

    drawing_prompt = build_drawing_prompt("Respond in English")
    assert "hand-drawn" in drawing_prompt

def test_image_prompt_uses_the_input():
    prompt = build_scene_prompt(
        user_input="I missed the last tram and ate cold pizza on the curb",
        response_text="A poem about pizza",
        dominant_mood="surprise",
        tapestry_prompt="ignore this if the input is usable",
    )
    assert "cold pizza" in prompt
    assert "last tram" in prompt
    assert "generic ocean" in prompt

def test_new_languages_shape_the_poem_and_fallback():
    from server import LANG_INSTRUCTIONS, SUPPORTED_LANGUAGES
    assert SUPPORTED_LANGUAGES == {"en", "de", "fr", "it", "es", "zh"}
    for code in ("fr", "it", "es", "zh"):
        prompt = build_text_prompt("text", "the missed tram", LANG_INSTRUCTIONS[code], "warm")
        assert "JSON" in prompt or "json" in prompt.lower()
    french = make_fallback(content="pizza froide", language="fr")
    assert "pizza froide" in french["response_text"]
    assert "miroir" in french["response_text"]
    mandarin = make_fallback(content="冷披萨", language="zh")
    assert "冷披萨" in mandarin["response_text"]
    assert "镜子" in mandarin["response_text"]

def test_analyze_endpoint_fallback():
    # Test analyze endpoint with valid payload
    response = client.post("/api/analyze", json={
        "input_type": "text",
        "content": "Looking at the stars tonight and feeling at peace.",
        "language": "en",
        "response_speed": "fast"
    })
    assert response.status_code == 200
    data = response.json()
    assert "dominant_mood" in data
    assert "emotions" in data
    assert "response_text" in data
    assert len(data["emotions"]) > 0

def test_history_and_journal_flow():
    # 1. Analyze
    analyze_res = client.post("/api/analyze", json={
        "input_type": "text",
        "content": "Test reflection for history and journal.",
        "language": "en"
    })
    assert analyze_res.status_code == 200
    analysis_id = analyze_res.json()["id"]

    # 2. Check in history
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    hist_items = hist_res.json()
    assert any(h["id"] == analysis_id for h in hist_items)

    # 3. Save to journal/collections
    save_res = client.post("/api/journal/save", json={
        "analysis_id": analysis_id,
        "note": "A note for my personal collection"
    })
    assert save_res.status_code == 200

    # 4. Fetch journal
    journal_res = client.get("/api/journal?days=30")
    assert journal_res.status_code == 200
    journal_items = journal_res.json()
    saved_entry = next((j for j in journal_items if j["id"] == analysis_id), None)
    assert saved_entry is not None
    assert saved_entry["journal_note"] == "A note for my personal collection"

    # 5. Fetch journal trends
    trends_res = client.get("/api/journal/trends?days=30")
    assert trends_res.status_code == 200
    assert isinstance(trends_res.json(), list)

    # 6. Delete from journal
    del_res = client.delete(f"/api/journal/{analysis_id}")
    assert del_res.status_code == 200
