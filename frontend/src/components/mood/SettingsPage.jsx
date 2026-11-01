import React, { useState } from "react";
import { Moon, Sun, Heart, Shield, Download, Trash2, Feather } from "lucide-react";
import { useTheme } from "next-themes";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import {
  APPEARANCES,
  REFLECTION_STYLES,
  getReflectionStyle,
  setReflectionStyle,
} from "@/lib/preferences";
import { LanguageSwitcher } from "@/components/mood/LanguageSwitcher";

const APPEARANCE_ICONS = { dark: Moon, light: Sun, romantic: Heart };

export const SettingsPage = ({ t, language, onLanguageChange, onHistoryCleared }) => {
  const { theme, setTheme } = useTheme();
  const appearance = theme === "light" || theme === "romantic" ? theme : "dark";
  const [reflectionTone, setReflectionTone] = useState(getReflectionStyle);
  const [dataCleared, setDataCleared] = useState(false);
  const [exporting, setExporting] = useState(false);

  const clearAllHistory = async () => {
    if (!window.confirm(t("clearHistoryConfirm"))) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/history`);
      if (onHistoryCleared) onHistoryCleared();
      setDataCleared(true);
      setTimeout(() => setDataCleared(false), 3000);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const exportReflections = async () => {
    setExporting(true);
    try {
      const [historyRes, journalRes] = await Promise.all([
        axios.get(`${API_BASE}/history`),
        axios.get(`${API_BASE}/journal?days=365`),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        user: "Mood Mirror Sanctuary",
        history: historyRes.data || [],
        collections: journalRes.data || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mirror-me-reflections-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12" data-testid="settings-page">
      {/* Title */}
      <div
        className="pb-3 border-b"
        style={{ borderColor: "var(--divider-subtle)" }}
      >
        <h2
          className="font-display text-3xl md:text-4xl font-medium tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {t("settingsTitle")}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("settingsIntro")}
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <section className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Moon size={16} style={{ color: "var(--aura-gold)" }} />
          <h3
            className="font-display text-xl font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {t("settingsAppearance")}
          </h3>
        </div>

        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          {t("appearanceHint")}
        </p>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          data-testid="appearance-picker"
        >
          {APPEARANCES.map((option) => {
            const Icon = APPEARANCE_ICONS[option.id];
            const selected = appearance === option.id;
            return (
              <button
                key={option.id}
                type="button"
                data-testid={`appearance-${option.id}`}
                onClick={() => setTheme(option.id)}
                className="text-left p-4 rounded-xl transition-all"
                style={{
                  background: selected ? "var(--chip-active-bg)" : "var(--control-bg)",
                  border: selected
                    ? "1px solid var(--border-strong)"
                    : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color:
                      option.id === "romantic"
                        ? "var(--aura-terracotta)"
                        : "var(--aura-gold)",
                  }}
                />
                <p className="text-sm font-semibold mt-2">
                  {t(`appearance_${option.id}`)}
                </p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                  {t(`appearance_${option.id}_hint`)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. AI Reflection Style & Tone */}
      <section className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2.5 mb-4">
          <Feather size={16} style={{ color: "var(--aura-gold)" }} />
          <h3
            className="font-display text-xl font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {t("reflectionStyleTitle")}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t("reflectionLanguage")}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("reflectionLanguageHint")}
              </p>
            </div>
            <LanguageSwitcher
              language={language}
              onChange={onLanguageChange}
              label={t("settingsLanguage")}
              variant="pills"
              testId="settings-language-switcher"
            />
          </div>

          <div
            className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-4 border-t"
            style={{ borderColor: "var(--divider-subtle)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t("reflectionTone")}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t("reflectionToneHint")}
              </p>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:max-w-xl"
              data-testid="reflection-style-picker"
            >
              {REFLECTION_STYLES.map((tone) => {
                const selected = reflectionTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    data-testid={`style-${tone.id}`}
                    onClick={() => {
                      setReflectionTone(tone.id);
                      setReflectionStyle(tone.id);
                    }}
                    className="text-left px-3.5 py-2.5 rounded-xl text-xs transition-all"
                    style={{
                      background: selected ? "var(--chip-active-bg)" : "var(--control-bg)",
                      border: selected
                        ? "1px solid var(--border-strong)"
                        : "1px solid var(--border-subtle)",
                      color: selected ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    <span className="block font-semibold">{t(`style_${tone.id}`)}</span>
                    <span
                      className="block mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {t(`style_${tone.id}_hint`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Privacy, Data & Export */}
      <section className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2.5 mb-3">
          <Shield size={16} style={{ color: "var(--aura-sage)" }} />
          <h3
            className="font-display text-xl font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {t("settingsPrivacy")}
          </h3>
        </div>

        <p
          className="text-xs leading-relaxed mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("privacyBody")}
        </p>

        <div
          className="flex flex-wrap items-center gap-3 pt-4 border-t"
          style={{ borderColor: "var(--divider-subtle)" }}
        >
          <button
            type="button"
            onClick={exportReflections}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
            }}
          >
            <Download size={14} style={{ color: "var(--aura-gold)" }} />
            <span>{exporting ? t("exporting") : t("exportReflections")}</span>
          </button>

          <button
            type="button"
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ml-auto"
            style={{
              background: "rgba(224, 122, 95, 0.12)",
              border: "1px solid rgba(224, 122, 95, 0.35)",
              color: "var(--aura-terracotta)",
            }}
          >
            <Trash2 size={14} />
            <span>{dataCleared ? t("historyCleared") : t("clearHistory")}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
