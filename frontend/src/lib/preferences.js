const STYLE_KEY = "mm-reflection-style";

export const REFLECTION_STYLES = [
  { id: "warm", label: "Warm", hint: "Affectionate, close, like a friend" },
  { id: "instructions", label: "More instructions", hint: "One doable nudge inside the lines" },
  { id: "animals", label: "Animals", hint: "Funny creatures in your exact scene" },
  { id: "fairy", label: "Fairy tales", hint: "A tiny hopeful once-upon-a-time" },
  { id: "lotr", label: "Lord of the Rings", hint: "Small courage on a brighter road" },
  { id: "matrix", label: "Matrix", hint: "A playful waking-up, your choice" },
];

export const APPEARANCES = [
  { id: "dark", label: "Dark", hint: "Cosmic night" },
  { id: "light", label: "Light", hint: "Warm paper daylight" },
  { id: "romantic", label: "Romantic", hint: "Pink, with hearts" },
];

const STYLE_IDS = new Set(REFLECTION_STYLES.map((style) => style.id));

export function getReflectionStyle() {
  try {
    const stored = localStorage.getItem(STYLE_KEY);
    return STYLE_IDS.has(stored) ? stored : "warm";
  } catch {
    return "warm";
  }
}

export function setReflectionStyle(styleId) {
  const next = STYLE_IDS.has(styleId) ? styleId : "warm";
  localStorage.setItem(STYLE_KEY, next);
  window.dispatchEvent(new CustomEvent("mm-preferences"));
  return next;
}
