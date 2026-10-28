import React from "react";
import { LANGUAGES } from "@/lib/languages";

export const LanguageSwitcher = ({ language, onChange, label = "Language", variant = "select", testId = "language-switcher" }) => {
  if (variant === "pills") {
    return (
      <div
        data-testid={testId}
        className="flex flex-wrap gap-1 p-1 rounded-2xl"
        style={{ background: "var(--control-bg)", border: "1px solid var(--border-subtle)" }}
      >
        {LANGUAGES.map((lang) => {
          const active = language === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              data-testid={`${testId}-${lang.id}`}
              onClick={() => onChange(lang.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? "var(--chip-active-bg)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <select
      data-testid={testId}
      aria-label={label}
      value={LANGUAGES.some((lang) => lang.id === language) ? language : "en"}
      onChange={(event) => onChange(event.target.value)}
      className="px-3 py-1.5 rounded-full text-xs font-semibold outline-none cursor-pointer"
      style={{
        background: "var(--control-bg)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-primary)",
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
