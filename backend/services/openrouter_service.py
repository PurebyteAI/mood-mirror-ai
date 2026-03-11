import asyncio
import json
import os
import time
from typing import Any, Dict, List, Optional

import httpx


class OpenRouterError(Exception):
    pass


class OpenRouterService:
    def __init__(self) -> None:
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        if not self.api_key:
            raise OpenRouterError("OPENROUTER_API_KEY is not configured")

        self.base_url = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
        self.model = os.environ.get("OPENROUTER_MODEL", "qwen/qwen3-vl-235b-a22b-thinking")
        self.timeout_seconds = float(os.environ.get("OPENROUTER_TIMEOUT_SECONDS", "45"))
        self.max_retries = int(os.environ.get("OPENROUTER_MAX_RETRIES", "3"))
        self.min_interval_seconds = float(os.environ.get("OPENROUTER_MIN_INTERVAL_SECONDS", "1.0"))
        self.app_name = os.environ.get("OPENROUTER_APP_NAME", "Mood Mirror AI")
        self.app_url = os.environ.get("OPENROUTER_APP_URL", "http://localhost")

        self._lock = asyncio.Lock()
        self._last_call = 0.0
        self._client = httpx.AsyncClient(timeout=self.timeout_seconds)

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
    ) -> Dict[str, Any]:
        await self._rate_limit()

        content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]
        if image_data_url:
            content.append({"type": "image_url", "image_url": {"url": image_data_url}})

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": content}],
            "temperature": 0.7,
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.app_url,
            "X-Title": self.app_name,
        }

        last_error = "unknown"
        for attempt in range(1, self.max_retries + 1):
            try:
                response = await self._client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code == 429:
                    retry_after = response.headers.get("retry-after")
                    delay = float(retry_after) if retry_after else min(2 ** attempt, 8)
                    await asyncio.sleep(delay)
                    last_error = "rate_limited"
                    continue

                if response.status_code >= 500:
                    await asyncio.sleep(min(2 ** attempt, 8))
                    last_error = f"server_error_{response.status_code}"
                    continue

                response.raise_for_status()
                data = response.json()
                return self._parse_response(data)
            except (httpx.TimeoutException, httpx.HTTPError, json.JSONDecodeError) as exc:
                last_error = str(exc)
                if attempt == self.max_retries:
                    break
                await asyncio.sleep(min(2 ** attempt, 8))

        raise OpenRouterError(f"OpenRouter request failed after retries: {last_error} ({language})")

    def _parse_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        choices = data.get("choices", [])
        if not choices:
            raise OpenRouterError("OpenRouter response missing choices")
        message = choices[0].get("message", {})
        content = message.get("content")
        if isinstance(content, list):
            text_parts = [part.get("text", "") for part in content if isinstance(part, dict)]
            content = "".join(text_parts)
        if not isinstance(content, str) or not content.strip():
            raise OpenRouterError("OpenRouter response missing content")

        cleaned = content.strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]

        parsed = json.loads(cleaned)
        if "emotions" not in parsed or "dominant_mood" not in parsed or "response_text" not in parsed:
            raise OpenRouterError("OpenRouter response missing required JSON fields")
        return parsed
