import React, { useState } from "react";
import { Moon, Sun, Heart, Shield, Download, Trash2, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import { APPEARANCES, REFLECTION_STYLES, getReflectionStyle, setReflectionStyle } from "@/lib/preferences";
import { LanguageSwitcher } from "@/components/mood/LanguageSwitcher";

const APPEARANCE_ICONS = { dark: Moon, light: Sun, romantic: Heart };

export const SettingsPage = ({ t, language, onLanguageChange }) => {
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
        user: "Anurag",
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
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
          {t("settingsTitle")}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {t("settingsIntro")}
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <section
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Moon size={18} className="text-violet-400" />
          <h3 className="font-display text-lg font-semibold text-white">{t("settingsAppearance")}</h3>
        </div>

        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {t("appearanceHint")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="appearance-picker">
          {APPEARANCES.map((option) => {
            const Icon = APPEARANCE_ICONS[option.id];
            const selected = appearance === option.id;
            return (
              <button
                key={option.id}
                type="button"
                data-testid={`appearance-${option.id}`}
                onClick={() => setTheme(option.id)}
                className="text-left p-4 rounded-2xl transition-all"
                style={{
                  background: selected ? "var(--chip-active-bg)" : "var(--control-bg)",
                  border: selected ? "1px solid var(--aura-violet)" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <Icon size={16} style={{ color: option.id === "romantic" ? "var(--aura-rose)" : "var(--aura-violet)" }} />
                <p className="text-sm font-semibold mt-2">{t(`appearance_${option.id}`)}</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{t(`appearance_${option.id}_hint`)}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. AI Reflection Style & Tone */}
      <section
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles size={18} className="text-violet-400" />
          <h3 className="font-display text-lg font-semibold text-white">{t("reflectionStyleTitle")}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">{t("reflectionLanguage")}</p>
              <p className="text-xs text-white/50">{t("reflectionLanguageHint")}</p>
            </div>
            <LanguageSwitcher
              language={language}
              onChange={onLanguageChange}
              label={t("settingsLanguage")}
              variant="pills"
              testId="settings-language-switcher"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-white">{t("reflectionTone")}</p>
              <p className="text-xs text-white/50">{t("reflectionToneHint")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:max-w-xl" data-testid="reflection-style-picker">
              {REFLECTION_STYLES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  data-testid={`style-${tone.id}`}
                  onClick={() => {
                    setReflectionTone(tone.id);
                    setReflectionStyle(tone.id);
                  }}
                  className="text-left px-3.5 py-2 rounded-2xl text-xs transition-all"
                  style={{
                    background: reflectionTone === tone.id ? "var(--chip-active-bg)" : "var(--control-bg)",
                    border: reflectionTone === tone.id ? "1px solid var(--aura-violet)" : "1px solid var(--border-subtle)",
                    color: reflectionTone === tone.id ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  <span className="block font-semibold">{t(`style_${tone.id}`)}</span>
                  <span className="block mt-0.5" style={{ color: "var(--text-muted)" }}>{t(`style_${tone.id}_hint`)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Privacy, Data & Export */}
      <section
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Shield size={18} className="text-emerald-400" />
          <h3 className="font-display text-lg font-semibold text-white">{t("settingsPrivacy")}</h3>
        </div>

        <p className="text-xs text-white/70 leading-relaxed mb-6">
          {t("privacyBody")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={exportReflections}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white transition-all"
          >
            <Download size={14} />
            <span>{exporting ? t("exporting") : t("exportReflections")}</span>
          </button>

          <button
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all ml-auto"
          >
            <Trash2 size={14} />
            <span>{dataCleared ? t("historyCleared") : t("clearHistory")}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

