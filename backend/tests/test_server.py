import pytest
from fastapi.testclient import TestClient
from server import app, make_fallback, build_text_prompt, build_drawing_prompt, SUPPORTED_LANGUAGES, LANG_INSTRUCTIONS
from services.image_generation_service import build_scene_prompt

client = TestClient(app)


def test_health_endpoints():
    for path in ("/health", "/api/health"):
        response = client.get(path)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "mood-mirror-ai"


def test_fallback_structure_all_languages():
    for lang in SUPPORTED_LANGUAGES:
        fallback = make_fallback(content="I spilled coffee on the train", language=lang)
        assert fallback["dominant_mood"] in {"joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"}
        names = [item["emotion"] for item in fallback["emotions"]]
        assert names == ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]
        lines = [line for line in fallback["response_text"].splitlines() if line.strip()]
        assert len(lines) == 8
        assert "alignment" in fallback
        assert fallback["alignment"]["contradiction_notice"]
        assert fallback["alignment"]["subconscious_insight"]
        assert "cognitive_reframing" in fallback
        assert fallback["cognitive_reframing"]["distortion_detected"]
        assert fallback["cognitive_reframing"]["grounding_affirmation"]


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


def test_scads_failover_when_groq_errors(monkeypatch):
    """Verify that when Groq errors or is unavailable, ScaDS.AI (Qwen/Qwen3.8-27B -> zai-org/GLM-5.3-Flash -> zai-org/GLM-5.3) returns a real LLM reflection."""
    import server
    from services.groq_service import GroqService

    # Force Groq key to be invalid so Groq returns 401 and GroqService fails over to ScaDS.AI
    monkeypatch.setenv("GROQ_API_KEY", "invalid_groq_key_to_trigger_scads_failover")
    server.groq_service = GroqService()

    try:
        res = client.post("/api/analyze", json={
            "input_type": "text",
            "content": "Walking home under autumn chestnut trees after a long lecture in Dresden.",
            "language": "en",
            "response_speed": "fast",
            "reflection_style": "warm",
        })
        assert res.status_code == 200
        data = res.json()
        # Verify it is a real LLM response and NOT the static make_fallback poem
        fallback_poem = make_fallback("Walking home under autumn chestnut trees after a long lecture in Dresden.", "en")["response_text"]
        assert data["response_text"] != fallback_poem
        assert len(data["emotions"]) == 7
    finally:
        server.groq_service = None


def test_analyze_endpoint_across_languages_and_modalities():
    for lang in ("en", "de", "fr", "it", "es", "zh"):
        response = client.post("/api/analyze", json={
            "input_type": "text",
            "content": "Looking at the stars tonight and feeling at peace.",
            "language": lang,
            "response_speed": "fast",
            "reflection_style": "warm",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["dominant_mood"] in {"joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"}
        assert len(data["emotions"]) == 7
        assert data["response_text"]
        assert data["alignment"] is not None
        assert "contradiction_notice" in data["alignment"]
        assert data["cognitive_reframing"] is not None
        assert "distortion_detected" in data["cognitive_reframing"]
        assert "grounding_affirmation" in data["cognitive_reframing"]
        assert data["tapestry_prompt"]

    # Drawing modality
    draw_res = client.post("/api/analyze", json={
        "input_type": "drawing",
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "language": "en",
        "reflection_style": "fairy",
    })
    assert draw_res.status_code == 200
    assert draw_res.json()["input_preview"] == "[Drawing]"

    # Fusion modality (Drawing + Spoken text)
    fusion_res = client.post("/api/analyze", json={
        "input_type": "fusion",
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "spoken_text": "Everything is fine, just a long week.",
        "language": "en",
        "reflection_style": "lotr",
    })
    assert fusion_res.status_code == 200
    assert "Fusion" in fusion_res.json()["input_preview"]

    # Speech modality & remaining styles
    for style in ("warm", "instructions", "animals", "fairy", "lotr", "matrix"):
        sp_res = client.post("/api/analyze", json={
            "input_type": "speech",
            "content": "Taking a slow walk through the park after rain.",
            "language": "en",
            "reflection_style": style,
        })
        assert sp_res.status_code == 200


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

    # 7. Image generation endpoint
    img_res = client.post("/api/image/generate", json={
        "user_input": "Test reflection for history and journal.",
        "response_text": "Quiet light settles along the windowsill.",
        "dominant_mood": "joy",
        "response_type": "poem",
        "language": "en",
    })
    assert img_res.status_code == 200
    assert "prompt" in img_res.json()

    # 8. Clear history endpoint
    clear_res = client.delete("/api/history")
    assert clear_res.status_code == 200
    assert clear_res.json()["message"] == "History cleared"
