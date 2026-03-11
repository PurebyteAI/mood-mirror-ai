const rawBackendUrl = process.env.REACT_APP_BACKEND_URL?.trim();
const sanitizedBackendUrl = rawBackendUrl ? rawBackendUrl.replace(/\/+$/, "") : "";
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const fallbackBackendUrl = isLocalhost ? "http://localhost:8001" : browserOrigin;

export const API_BASE = `${(sanitizedBackendUrl || fallbackBackendUrl).replace(/\/+$/, "")}/api`;
