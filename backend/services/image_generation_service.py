import asyncio
import base64
import logging
import os
import time
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)


class ImageGenerationError(Exception):
    pass


class ImageGenerationService:
    def __init__(self) -> None:
        self.cf_account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "ac118124b02ed877ef2cb9a4f609100f").strip()
        self.cf_api_token = os.environ.get("CLOUDFLARE_API_KEY", "").strip()
        self.cf_model = os.environ.get("CLOUDFLARE_IMAGE_MODEL", "@cf/black-forest-labs/flux-1-schnell").strip()

        self.api_url = os.environ.get("IMAGE_API_URL", "https://image-api.aanuragtrivedi007.workers.dev").strip()
        self.api_token = os.environ.get("IMAGE_API_BEARER_TOKEN", "").strip()
        self.timeout_seconds = float(os.environ.get("IMAGE_API_TIMEOUT_SECONDS", "60"))
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
        return (
            f"A breathtaking, cinematic surreal landscape artwork capturing the emotion of {dominant_mood}. "
            f"Atmospheric luminous twilight lighting, gentle bioluminescent aurora glow, serene tranquil horizons, "
            f"ethereal clouds, dreamy cosmic colors, high-end digital art masterpiece, 4k wallpaper, no text, no watermarks."
        )

    def _format_b64_data_uri(self, raw_b64: str) -> str:
        if raw_b64.startswith("data:"):
            return raw_b64
        try:
            sample = base64.b64decode(raw_b64[:32])
            if sample.startswith(b"\x89PNG\r\n\x1a\n"):
                mime = "image/png"
            elif sample.startswith(b"\xff\xd8\xff"):
                mime = "image/jpeg"
            elif sample.startswith(b"RIFF") and b"WEBP" in sample:
                mime = "image/webp"
            else:
                mime = "image/jpeg"
        except Exception:
            mime = "image/jpeg"
        return f"data:{mime};base64,{raw_b64}"

    async def generate(
        self,
        user_input: str,
        response_text: str,
        dominant_mood: str,
        response_type: str,
        language: str = "en",
    ) -> Dict[str, Optional[str]]:
        prompt = self._build_prompt(
            user_input=user_input,
            response_text=response_text,
            dominant_mood=dominant_mood,
            response_type=response_type,
            language=language,
        )

        await self._rate_limit()

        # Method 1: Cloudflare Workers AI (Direct FLUX-1 Schnell)
        if self.cf_account_id and self.cf_api_token:
            try:
                cf_url = f"https://api.cloudflare.com/client/v4/accounts/{self.cf_account_id}/ai/run/{self.cf_model}"
                logger.info(f"Generating Living Tapestry via Cloudflare FLUX ({self.cf_model})...")
                res = await self._client.post(
                    cf_url,
                    headers={"Authorization": f"Bearer {self.cf_api_token}"},
                    json={"prompt": prompt},
                )
                if res.status_code == 200:
                    data = res.json()
                    img_b64 = data.get("result", {}).get("image")
                    if img_b64:
                        data_uri = self._format_b64_data_uri(img_b64)
                        logger.info("Cloudflare FLUX image generation succeeded!")
                        return {
                            "prompt": prompt,
                            "image_url": None,
                            "image_base64": data_uri,
                        }
            except Exception as e:
                logger.warning(f"Direct Cloudflare FLUX failed: {e}; falling back to worker endpoint...")

        # Method 2: Worker Endpoint
        if self.api_token:
            try:
                headers = {"Authorization": f"Bearer {self.api_token}", "Content-Type": "application/json"}
                res = await self._client.post(self.api_url, headers=headers, json={"prompt": prompt})
                if res.status_code == 200:
                    content_type = res.headers.get("content-type", "")
                    if content_type.startswith("image/"):
                        mime = content_type.split(";")[0].strip()
                        raw_b64 = base64.b64encode(res.content).decode("ascii")
                        return {
                            "prompt": prompt,
                            "image_url": None,
                            "image_base64": f"data:{mime};base64,{raw_b64}",
                        }
                    body = res.json()
                    if isinstance(body, dict):
                        url = body.get("image_url") or body.get("url")
                        b64 = body.get("image_base64") or body.get("b64_json")
                        if url:
                            return {"prompt": prompt, "image_url": url, "image_base64": None}
                        if b64:
                            return {"prompt": prompt, "image_url": None, "image_base64": self._format_b64_data_uri(b64)}
            except Exception as e:
                logger.warning(f"Worker endpoint generation failed: {e}")

        raise ImageGenerationError("All image generation providers failed")
