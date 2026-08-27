import React, { useState } from "react";
import { Moon, Shield, Sliders, Download, Trash2, Check, Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/api";
import axios from "axios";

export const SettingsPage = ({ t, language, onLanguageChange }) => {
  const [reflectionTone, setReflectionTone] = useState("poetic");
  const [motionReduced, setMotionReduced] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);
  const [exporting, setExporting] = useState(false);

  const clearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your reflection history? This cannot be undone.")) {
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
        <p className="text-sm text-white/60 mt-1">
          Manage your personal sanctuary preferences, AI reflection styles, and privacy.
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <section
        className="p-6 rounded-3xl border border-white/[0.08]"
        style={{
          background: "linear-gradient(160deg, rgba(12, 23, 48, 0.8), rgba(7, 17, 38, 0.95))",
        }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Moon size={18} className="text-violet-400" />
          <h3 className="font-display text-lg font-semibold text-white">{t("settingsAppearance")}</h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-medium text-white">Atmosphere</p>
            <p className="text-xs text-white/50">Cosmic Celestial Dark Glassmorphism with harmonic living particles.</p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs font-semibold text-violet-300">
            <Moon size={13} className="text-violet-400" />
            <span>Dark Cosmic Sanctuary</span>
          </div>
        </div>
      </section>

      {/* 2. AI Reflection Style & Tone */}
      <section
        className="p-6 rounded-3xl border border-white/[0.08]"
        style={{
          background: "linear-gradient(160deg, rgba(12, 23, 48, 0.8), rgba(7, 17, 38, 0.95))",
        }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles size={18} className="text-violet-400" />
          <h3 className="font-display text-lg font-semibold text-white">AI Reflection Style</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Reflection Language</p>
              <p className="text-xs text-white/50">Language used for prompt analysis and AI voice reflections.</p>
            </div>
            <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
              {["en", "de"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className="px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase transition-all"
                  style={{
                    background: language === lang ? "rgba(155, 108, 255, 0.25)" : "transparent",
                    color: language === lang ? "#F7F7FF" : "var(--text-muted)",
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-white">Reflection Tone</p>
              <p className="text-xs text-white/50">Choose the emotional style of AI mirror responses.</p>
            </div>
            <div className="flex items-center gap-2">
              {[
                { id: "poetic", label: "Poetic & Warm" },
                { id: "grounding", label: "Grounding" },
                { id: "lighthearted", label: "Lighthearted" },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setReflectionTone(tone.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: reflectionTone === tone.id ? "rgba(155, 108, 255, 0.22)" : "rgba(255, 255, 255, 0.03)",
                    border: reflectionTone === tone.id ? "1px solid rgba(155, 108, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.08)",
                    color: reflectionTone === tone.id ? "#F7F7FF" : "var(--text-muted)",
                  }}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Privacy, Data & Export */}
      <section
        className="p-6 rounded-3xl border border-white/[0.08]"
        style={{
          background: "linear-gradient(160deg, rgba(12, 23, 48, 0.8), rgba(7, 17, 38, 0.95))",
        }}
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
            <span>{exporting ? "Exporting..." : "Export Reflections (JSON)"}</span>
          </button>

          <button
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all ml-auto"
          >
            <Trash2 size={14} />
            <span>{dataCleared ? "History Cleared" : "Clear Reflection History"}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

