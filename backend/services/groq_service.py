import asyncio
import ast
import json
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)


class GroqError(Exception):
    pass


# Backward compatibility alias
OpenRouterError = GroqError

# Russell's Circumplex baseline mappings
AFFECT_MAP = {
    "happiness": {"valence": 0.85, "arousal": 0.75, "quadrant": "Eustress / High Joy"},
    "joy": {"valence": 0.88, "arousal": 0.80, "quadrant": "Eustress / High Joy"},
    "joyful": {"valence": 0.88, "arousal": 0.80, "quadrant": "Eustress / High Joy"},
    "excitement": {"valence": 0.86, "arousal": 0.82, "quadrant": "Eustress / High Joy"},
    "calmness": {"valence": 0.72, "arousal": 0.22, "quadrant": "Serenity / Calm Glow"},
    "calm": {"valence": 0.72, "arousal": 0.22, "quadrant": "Serenity / Calm Glow"},
    "stillness": {"valence": 0.70, "arousal": 0.15, "quadrant": "Serenity / Calm Glow"},
    "peace": {"valence": 0.80, "arousal": 0.20, "quadrant": "Serenity / Calm Glow"},
    "hopeful": {"valence": 0.68, "arousal": 0.48, "quadrant": "Eustress / High Joy"},
    "reflective": {"valence": 0.40, "arousal": 0.28, "quadrant": "Serenity / Calm Glow"},
    "curiosity": {"valence": 0.62, "arousal": 0.65, "quadrant": "Eustress / High Joy"},
    "stress": {"valence": -0.68, "arousal": 0.82, "quadrant": "Distress / High Tension"},
    "anxiety": {"valence": -0.72, "arousal": 0.85, "quadrant": "Distress / High Tension"},
    "overwhelm": {"valence": -0.65, "arousal": 0.80, "quadrant": "Distress / High Tension"},
    "anger": {"valence": -0.78, "arousal": 0.90, "quadrant": "Distress / High Tension"},
    "sadness": {"valence": -0.70, "arousal": 0.25, "quadrant": "Fatigue / Melancholy"},
    "melancholy": {"valence": -0.55, "arousal": 0.28, "quadrant": "Fatigue / Melancholy"},
    "nostalgia": {"valence": 0.25, "arousal": 0.35, "quadrant": "Serenity / Calm Glow"},
    "fatigue": {"valence": -0.45, "arousal": 0.18, "quadrant": "Fatigue / Melancholy"},
    "exhaustion": {"valence": -0.50, "arousal": 0.20, "quadrant": "Fatigue / Melancholy"},
    "pride": {"valence": 0.75, "arousal": 0.60, "quadrant": "Eustress / High Joy"},
    "warmth": {"valence": 0.80, "arousal": 0.35, "quadrant": "Serenity / Calm Glow"},
}


class GroqService:
    def __init__(self) -> None:
        self.api_key = os.environ.get("GROQ_API_KEY", "").strip()
        if not self.api_key:
            raise GroqError("GROQ_API_KEY is not configured")

        self.base_url = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
        # High quality models
        self.model = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")
        self.text_fallback_models = [
            m.strip()
            for m in os.environ.get("GROQ_TEXT_FALLBACK_MODELS", "openai/gpt-oss-120b,openai/gpt-oss-20b").split(",")
            if m.strip()
        ]
        # Vision / Multimodal model
        self.vision_model = os.environ.get("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")

        self.timeout_seconds = float(os.environ.get("GROQ_TIMEOUT_SECONDS", "30"))
        self.max_retries = int(os.environ.get("GROQ_MAX_RETRIES", "2"))
        self.min_interval_seconds = float(os.environ.get("GROQ_MIN_INTERVAL_SECONDS", "0.0"))
        self.max_tokens_fast = int(os.environ.get("GROQ_MAX_TOKENS_FAST", "600"))
        self.max_tokens_balanced = int(os.environ.get("GROQ_MAX_TOKENS_BALANCED", "1000"))

        self._lock = asyncio.Lock()
        self._last_call = 0.0
        timeout = httpx.Timeout(self.timeout_seconds, connect=8.0, read=self.timeout_seconds)
        limits = httpx.Limits(max_connections=20, max_keepalive_connections=10, keepalive_expiry=30.0)
        self._client = httpx.AsyncClient(timeout=timeout, limits=limits)

    async def close(self) -> None:
        await self._client.aclose()

    async def _rate_limit(self) -> None:
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_call
            wait_for = self.min_interval_seconds - elapsed
            if wait_for > 0:
                await asyncio.sleep(wait_for)
            self._last_call = time.monotonic()

    async def generate_analysis(
        self,
        prompt: str,
        image_data_url: Optional[str] = None,
        language: str = "en",
        response_speed: str = "fast",
    ) -> Dict[str, Any]:
        await self._rate_limit()

        is_fast = response_speed == "fast"
        max_tokens = self.max_tokens_fast if is_fast else self.max_tokens_balanced
        temperature = 0.5 if is_fast else 0.7

        # Groq json_object format requires the word 'json' in the message text
        prompt_text = prompt
        if "json" not in prompt_text.lower():
            prompt_text = f"{prompt_text}\n\nRespond with a valid JSON object."

        content: List[Dict[str, Any]] = [{"type": "text", "text": prompt_text}]

        # Determine candidate models to attempt
        if image_data_url:
            content.append({"type": "image_url", "image_url": {"url": image_data_url}})
            candidate_models = [self.vision_model]
        else:
            candidate_models = [self.model] + [m for m in self.text_fallback_models if m != self.model]

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "MoodMirror/1.0",
        }

        last_error = "unknown"

        for model_name in candidate_models:
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": content}],
                "temperature": temperature,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
            }

            for attempt in range(1, self.max_retries + 1):
                try:
                    logger.info(f"Invoking model '{model_name}' (attempt {attempt})...")
                    response = await self._client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload,
                    )
                    if response.status_code == 429:
                        retry_after = response.headers.get("retry-after")
                        wait_time = float(retry_after) if retry_after else (2 ** attempt)
                        await asyncio.sleep(wait_time)
                        continue

                    if response.status_code >= 400:
                        last_error = f"HTTP {response.status_code} ({model_name}): {response.text[:200]}"
                        logger.warning(f"Groq API error on model {model_name}: {last_error}")
                        break  # Try next model

                    data = response.json()
                    logger.info(f"Model '{model_name}' returned successful response.")
                    return self._parse_response(data)

                except httpx.RequestError as exc:
                    last_error = f"RequestError ({model_name}): {exc}"
                    if attempt == self.max_retries:
                        break
                    await asyncio.sleep(min(2 ** attempt, 8))

        raise GroqError(f"All model attempts failed. Last error: {last_error} ({language})")

    def _parse_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        choices = data.get("choices", [])
        if not choices:
            raise GroqError("Groq response missing choices")
        message = choices[0].get("message", {})
        content = message.get("content")
        if isinstance(content, list):
            text_parts = [part.get("text", "") for part in content if isinstance(part, dict)]
            content = "".join(text_parts)
        if not isinstance(content, str) or not content.strip():
            raise GroqError("Groq response missing content")

        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned).strip()

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]

        parsed = self._load_json_loose(cleaned)
        if parsed is None:
            parsed = self._extract_required_fields(cleaned)

        if parsed is None:
            raise GroqError("Groq response is not valid JSON and could not be repaired")

        return self._normalize_result(parsed)

    def _load_json_loose(self, text: str) -> Optional[Dict[str, Any]]:
        candidates = [text]
        candidates.append(text.replace("\u201c", '"').replace("\u201d", '"').replace("\u2018", "'").replace("\u2019", "'"))

        for candidate in candidates:
            try:
                value = json.loads(candidate)
                if isinstance(value, dict):
                    return value
            except json.JSONDecodeError:
                pass

            try:
                no_trailing_commas = re.sub(r",\s*([}\]])", r"\1", candidate)
                value = json.loads(no_trailing_commas)
                if isinstance(value, dict):
                    return value
            except json.JSONDecodeError:
                pass

            try:
                value = ast.literal_eval(candidate)
                if isinstance(value, dict):
                    return value
            except (ValueError, SyntaxError):
                pass

        return None

    def _extract_required_fields(self, text: str) -> Optional[Dict[str, Any]]:
        dominant_mood = self._extract_string_field(text, "dominant_mood")
        response_type = self._extract_string_field(text, "response_type")
        response_text = self._extract_response_text(text)

        emotions = self._extract_emotions(text)
        if dominant_mood is None and response_text is None:
            return None

        return {
            "emotions": emotions,
            "dominant_mood": dominant_mood or "curiosity",
            "response_type": response_type or "reflection",
            "response_text": response_text or "I hear you. Thank you for sharing how you feel.",
        }

    def _extract_string_field(self, text: str, field: str) -> Optional[str]:
        pattern = rf'"{field}"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"'
        match = re.search(pattern, text, flags=re.DOTALL)
        if match:
            return bytes(match.group(1), "utf-8").decode("unicode_escape").strip()

        pattern_single = rf"'{field}'\s*:\s*'([^'\\]*(?:\\.[^'\\]*)*)'"
        match_single = re.search(pattern_single, text, flags=re.DOTALL)
        if match_single:
            return bytes(match_single.group(1), "utf-8").decode("unicode_escape").strip()

        return None

    def _extract_response_text(self, text: str) -> Optional[str]:
        marker = '"response_text"'
        idx = text.find(marker)
        if idx == -1:
            marker = "'response_text'"
            idx = text.find(marker)
        if idx == -1:
            return None

        colon = text.find(":", idx)
        if colon == -1:
            return None

        tail = text[colon + 1 :].lstrip()
        if not tail:
            return None

        quote = tail[0]
        if quote not in ('"', "'"):
            return None

        after_quote = tail[1:]
        key_boundary = re.search(rf"{quote}\s*,\s*['\"](?:response_type|timestamp|saved_to_journal|dominant_mood|emotions)['\"]\s*:", after_quote)
        if key_boundary:
            raw = after_quote[: key_boundary.start()]
            return raw.replace("\\n", "\n").strip()

        closing = after_quote.rfind(quote)
        if closing != -1:
            raw = after_quote[:closing]
            return raw.replace("\\n", "\n").strip()

        return None

    def _extract_emotions(self, text: str) -> List[Dict[str, Any]]:
        items: List[Dict[str, Any]] = []
        for match in re.finditer(
            r'"emotion"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*,\s*"score"\s*:\s*([0-9]*\.?[0-9]+)',
            text,
            flags=re.DOTALL,
        ):
            try:
                score = float(match.group(2))
            except ValueError:
                continue
            items.append({"emotion": match.group(1).strip(), "score": score})

        if items:
            return items

        return [
            {"emotion": "calmness", "score": 0.4},
            {"emotion": "reflective", "score": 0.3},
            {"emotion": "hopeful", "score": 0.2},
            {"emotion": "curiosity", "score": 0.1},
        ]

    def _normalize_result(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        emotions = parsed.get("emotions")
        if not isinstance(emotions, list) or not emotions:
            emotions = self._extract_emotions(json.dumps(parsed, ensure_ascii=False))

        normalized_emotions: List[Dict[str, Any]] = []
        for item in emotions:
            if not isinstance(item, dict):
                continue
            emotion = str(item.get("emotion", "calmness")).strip().lower() or "calmness"
            try:
                score = float(item.get("score", 0.0))
            except (TypeError, ValueError):
                score = 0.0
            normalized_emotions.append({"emotion": emotion, "score": max(0.0, min(1.0, score))})

        if not normalized_emotions:
            normalized_emotions = self._extract_emotions("{}")

        dominant_mood = str(parsed.get("dominant_mood", normalized_emotions[0]["emotion"])).lower()
        response_type = str(parsed.get("response_type", "reflection"))
        response_text = str(parsed.get("response_text", "I hear you. Thank you for sharing how you feel."))

        # Extract or Derive 2D Russell Circumplex Affect Coordinates
        affect_defaults = AFFECT_MAP.get(dominant_mood, {"valence": 0.5, "arousal": 0.4, "quadrant": "Serenity / Calm Glow"})
        try:
            valence = float(parsed.get("valence", affect_defaults["valence"]))
            valence = max(-1.0, min(1.0, valence))
        except (TypeError, ValueError):
            valence = affect_defaults["valence"]

        try:
            arousal = float(parsed.get("arousal", affect_defaults["arousal"]))
            arousal = max(0.0, min(1.0, arousal))
        except (TypeError, ValueError):
            arousal = affect_defaults["arousal"]

        # Determine Quadrant
        if valence >= 0 and arousal >= 0.5:
            affect_quadrant = "Eustress / High Joy"
        elif valence < 0 and arousal >= 0.5:
            affect_quadrant = "Distress / High Tension"
        elif valence < 0 and arousal < 0.5:
            affect_quadrant = "Fatigue / Melancholy"
        else:
            affect_quadrant = "Serenity / Calm Glow"

        # Extract or Derive Emotional Contradiction & Expression Alignment
        alignment_raw = parsed.get("alignment")
        if isinstance(alignment_raw, dict):
            words_align = int(alignment_raw.get("words_alignment", 75))
            voice_align = int(alignment_raw.get("voice_alignment", 80))
            visual_align = int(alignment_raw.get("visual_alignment", 85))
            score = float(alignment_raw.get("score", (words_align + voice_align + visual_align) / 300.0))
            has_mismatch = bool(alignment_raw.get("has_mismatch", score < 0.68 or abs(words_align - visual_align) > 18))
            contradiction_notice = str(alignment_raw.get("contradiction_notice", "Your words sound composed, but your voice and drawing carry more tension."))
            subconscious_insight = str(alignment_raw.get("subconscious_insight", f"{dominant_mood.capitalize()} with underlying subtle complexity"))
        else:
            # Derive based on dominant mood & emotion mix
            if dominant_mood in ("stress", "anxiety", "overwhelm", "exhaustion", "fatigue"):
                words_align = 68
                voice_align = 84
                visual_align = 87
                score = 0.52
                has_mismatch = True
                contradiction_notice = "Your words sound calm and controlled, but your voice and visual expression carry more intensity and tension."
                subconscious_insight = "Controlled exterior + internal urgency + physical fatigue"
            elif dominant_mood in ("sadness", "melancholy"):
                words_align = 70
                voice_align = 80
                visual_align = 86
                score = 0.58
                has_mismatch = True
                contradiction_notice = "You speak of moving forward, but your visual stroke rhythm holds a quiet yearning for rest."
                subconscious_insight = "Quiet endurance + emotional weight"
            else:
                words_align = 88
                voice_align = 85
                visual_align = 90
                score = 0.88
                has_mismatch = False
                contradiction_notice = "Your words, vocal tone, and visual strokes are in coherent harmony."
                subconscious_insight = "Coherent grounded presence"

        alignment = {
            "score": score,
            "has_mismatch": has_mismatch,
            "words_alignment": words_align,
            "voice_alignment": voice_align,
            "visual_alignment": visual_align,
            "contradiction_notice": contradiction_notice,
            "subconscious_insight": subconscious_insight,
        }

        # Extract or Derive Cognitive Reframing (CBT)
        cbt_raw = parsed.get("cognitive_reframing")
        if isinstance(cbt_raw, dict):
            distortion = str(cbt_raw.get("distortion_detected", "Cognitive Overload"))
            explanation = str(cbt_raw.get("explanation", "Experiencing intense internal expectations."))
            prompts = cbt_raw.get("reframing_prompts", [])
            if not isinstance(prompts, list) or not prompts:
                prompts = [
                    "What is one realistic outcome that is within your control?",
                    "If a close friend felt this way, what compassionate truth would you remind them of?",
                    "What evidence shows that this moment will also pass?",
                ]
            affirmation = str(cbt_raw.get("grounding_affirmation", "You are permitted to pause and breathe. You are enough in this moment."))
        else:
            # Generate compassionate CBT default tailored to dominant mood
            if dominant_mood in ("stress", "anxiety", "anger", "overwhelm"):
                distortion = "Catastrophizing & Urgency Pressure"
                explanation = "Your mind is projecting forward into worst-case scenarios, amplifying internal tension."
                prompts = [
                    "What is one concrete fact you know for sure right now versus what is fear projecting?",
                    "If you slowed down for just 10 minutes, what would truly happen?",
                    "What small boundary can you give yourself today to protect your energy?",
                ]
                affirmation = "You do not have to resolve everything today. Deep breath: you are safe in this moment."
            elif dominant_mood in ("sadness", "melancholy", "fatigue", "exhaustion"):
                distortion = "Emotional Weight & Over-Identification"
                explanation = "Heavy feelings make the present feel permanent, leading to low cognitive stamina."
                prompts = [
                    "Can you allow yourself to feel this without judging yourself for having it?",
                    "What is one tiny source of comfort (a warm cup of tea, silence) you can offer yourself?",
                    "How has past heavy weather in your life cleared before?",
                ]
                affirmation = "Even winter tree branches know the spring will come. Be infinitely gentle with your heart."
            else:
                distortion = "Quiet Self-Reflection"
                explanation = "Balanced contemplation with curiosity and openness to growth."
                prompts = [
                    "What spark of gratitude or wonder felt alive for you today?",
                    "How can you carry this grounded energy into tomorrow's challenges?",
                    "What is one thing you appreciate about your own journey?",
                ]
                affirmation = "Your awareness is a quiet superpower. Honor your ongoing evolution."

        cognitive_reframing = {
            "distortion_detected": distortion,
            "explanation": explanation,
            "reframing_prompts": prompts[:3],
            "grounding_affirmation": affirmation,
        }

        # Tapestry Prompt for Generative Art
        tapestry_prompt = str(parsed.get("tapestry_prompt", f"A breathtaking cinematic surreal landscape capturing {dominant_mood}, ethereal atmospheric lighting, luminous bioluminescent calm, 4k digital art masterpiece"))

        fusion_alignment = parsed.get("fusion_alignment")

        return {
            "emotions": normalized_emotions,
            "dominant_mood": dominant_mood.strip() or normalized_emotions[0]["emotion"],
            "response_type": response_type.strip() or "reflection",
            "response_text": response_text.strip() or "I hear you. Thank you for sharing how you feel.",
            "valence": valence,
            "arousal": arousal,
            "affect_quadrant": affect_quadrant,
            "alignment": alignment,
            "cognitive_reframing": cognitive_reframing,
            "tapestry_prompt": tapestry_prompt,
            "fusion_alignment": fusion_alignment,
        }


# Backward compatibility alias
OpenRouterService = GroqService
