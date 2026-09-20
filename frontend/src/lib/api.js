const DEFAULT_REMOTE_BACKEND = "https://purebyteai-backend-mood-mirror-ai.hf.space";

function normalizeBackendUrl(url) {
  if (!url) {
    return "";
  }
  const cleaned = url.trim().replace(/\/+$/, "");
  if (cleaned === "/api") {
    return "/api";
  }
  return cleaned.replace(/\/api$/i, "");
}

const envBackend = normalizeBackendUrl(process.env.REACT_APP_BACKEND_URL);
const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

// Same-origin "/api" is only valid behind the nginx proxy. A static SPA host
// (Vercel/Render/etc.) has no /api, so fall back to the Hugging Face Space.
const resolvedBackend =
  envBackend || (isLocalhost ? "http://localhost:8001" : DEFAULT_REMOTE_BACKEND);

export const API_BASE = resolvedBackend === "/api" ? "/api" : `${resolvedBackend}/api`;
