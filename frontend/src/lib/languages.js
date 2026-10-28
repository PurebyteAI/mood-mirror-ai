const LANG_KEY = "mm-language";

export const LANGUAGES = [
  { id: "en", label: "English", speech: "en-US" },
  { id: "de", label: "Deutsch", speech: "de-DE" },
  { id: "fr", label: "Français", speech: "fr-FR" },
  { id: "it", label: "Italiano", speech: "it-IT" },
  { id: "es", label: "Español", speech: "es-ES" },
  { id: "zh", label: "中文", speech: "zh-CN" },
];

const LANGUAGE_IDS = new Set(LANGUAGES.map((lang) => lang.id));

export function isSupportedLanguage(lang) {
  return LANGUAGE_IDS.has(lang);
}

export function speechLocale(lang) {
  return LANGUAGES.find((item) => item.id === lang)?.speech || "en-US";
}

export function getLanguage() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    return isSupportedLanguage(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

export function setStoredLanguage(lang) {
  const next = isSupportedLanguage(lang) ? lang : "en";
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch {
    /* private mode */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = speechLocale(next);
  }
  return next;
}
