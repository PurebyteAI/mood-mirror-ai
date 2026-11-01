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

const forceRemote = process.env.REACT_APP_FORCE_REMOTE_BACKEND === "true";

// When running locally on localhost/127.0.0.1, always route to the local FastAPI
// backend on port 8001 unless REACT_APP_FORCE_REMOTE_BACKEND=true is explicitly set.
const resolvedBackend =
  isLocalhost && !forceRemote
    ? "http://localhost:8001"
    : envBackend || DEFAULT_REMOTE_BACKEND;

export const API_BASE = resolvedBackend === "/api" ? "/api" : `${resolvedBackend}/api`;
