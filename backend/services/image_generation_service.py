import asyncio
import base64
import os
import time
from typing import Any, Dict, Optional

import httpx


class ImageGenerationError(Exception):
    pass


class ImageGenerationService:
    def __init__(self) -> None:
        self.api_url = os.environ.get("IMAGE_API_URL", "https://image-api.aanuragtrivedi007.workers.dev").strip()
        self.api_token = os.environ.get("IMAGE_API_BEARER_TOKEN", "").strip()
        self.timeout_seconds = float(os.environ.get("IMAGE_API_TIMEOUT_SECONDS", "120"))
        self.max_retries = int(os.environ.get("IMAGE_API_MAX_RETRIES", "2"))
        self.min_interval_seconds = float(os.environ.get("IMAGE_API_MIN_INTERVAL_SECONDS", "0.5"))

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

    def _build_prompt(
        self,
        user_input: str,
        response_text: str,
        dominant_mood: str,
        response_type: str,
        language: str,
    ) -> str:
        language_style = "German" if language == "de" else "English"
        return (
            "Create a funny, cinematic, emotionally supportive illustration prompt.\n"
            f"Language style for embedded text signs: {language_style}.\n"
            f"User expression: {user_input}\n"
            f"AI response: {response_text}\n"
            f"Dominant mood: {dominant_mood}\n"
            f"Response style: {response_type}\n"
            "Requirements:\n"
            "- humorous but kind, no mocking\n"
            "- exaggerate the mood in a playful, cartoonish way\n"
            "- include one surprising visual metaphor tied to the mood\n"
            "- colorful lighting, high detail, expressive faces\n"
            "- safe-for-work, no violence, no horror, no brand logos\n"
            "- single scene, 4k digital art, wide composition"
        )

    def _extract_image(self, data: Any) -> Dict[str, Optional[str]]:
        if isinstance(data, dict):
            image_url = data.get("image_url") or data.get("url")
            image_b64 = data.get("image_base64") or data.get("b64_json")
            if image_url:
                return {"image_url": image_url, "image_base64": None}
            if image_b64:
                return {"image_url": None, "image_base64": image_b64}

            for key in ("result", "data", "output"):
                nested = data.get(key)
                if isinstance(nested, list) and nested:
                    first = nested[0]
                    if isinstance(first, str):
                        if first.startswith("http://") or first.startswith("https://") or first.startswith("data:image"):
                            return {"image_url": first, "image_base64": None}
                    if isinstance(first, dict):
                        url = first.get("url") or first.get("image_url")
                        b64 = first.get("b64_json") or first.get("image_base64")
                        if url:
                            return {"image_url": url, "image_base64": None}
                        if b64:
                            return {"image_url": None, "image_base64": b64}
                if isinstance(nested, str):
                    if nested.startswith("http://") or nested.startswith("https://") or nested.startswith("data:image"):
                        return {"image_url": nested, "image_base64": None}
        raise ImageGenerationError("Image API response did not contain an image payload")

    async def generate(
        self,
        user_input: str,
        response_text: str,
        dominant_mood: str,
        response_type: str,
        language: str = "en",
    ) -> Dict[str, Optional[str]]:
        if not self.api_token:
            raise ImageGenerationError("IMAGE_API_BEARER_TOKEN is not configured")

        prompt = self._build_prompt(
            user_input=user_input,
            response_text=response_text,
            dominant_mood=dominant_mood,
            response_type=response_type,
            language=language,
        )

        payload = {"prompt": prompt}
        headers = {"Authorization": f"Bearer {self.api_token}", "Content-Type": "application/json"}

        await self._rate_limit()
        last_error = "unknown"
        for attempt in range(1, self.max_retries + 1):
            try:
                response = await self._client.post(self.api_url, headers=headers, json=payload)
                if response.status_code == 429:
                    await asyncio.sleep(min(2 ** attempt, 8))
                    last_error = "rate_limited"
                    continue
                if response.status_code >= 500:
                    await asyncio.sleep(min(2 ** attempt, 8))
                    last_error = f"server_error_{response.status_code}"
                    continue
                response.raise_for_status()
                content_type = response.headers.get("content-type", "")
                if content_type.startswith("image/"):
                    mime = content_type.split(";")[0].strip()
                    img_b64 = base64.b64encode(response.content).decode("ascii")
                    parsed: Dict[str, Optional[str]] = {
                        "image_url": None,
                        "image_base64": f"data:{mime};base64,{img_b64}",
                    }
                else:
                    body = response.json()
                    parsed = self._extract_image(body)
                    image_b64 = parsed.get("image_base64")
                    if image_b64 and not image_b64.startswith("data:image"):
                        parsed["image_base64"] = f"data:image/png;base64,{image_b64}"
                return {"prompt": prompt, **parsed}
            except (httpx.TimeoutException, httpx.HTTPError, ValueError, ImageGenerationError) as exc:
                last_error = str(exc)
                if attempt == self.max_retries:
                    break
                await asyncio.sleep(min(2 ** attempt, 8))

        raise ImageGenerationError(f"Image generation failed after retries: {last_error}")
