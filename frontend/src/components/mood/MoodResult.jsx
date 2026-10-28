import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bookmark,
  Check,
  TrendingUp,
  Volume2,
  VolumeX,
  Copy,
  Moon,
  Cloud,
  Heart,
  Shuffle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { speechLocale } from "@/lib/languages";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import ParticleBlob from "@/components/mood/ParticleBlob";
import LivingTapestryCard from "@/components/mood/LivingTapestryCard";
import CognitiveReframer from "@/components/mood/CognitiveReframer";
import NextStepPanel from "@/components/mood/NextStepPanel";

const EMOTION_ORDER = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"];
const EMOTION_COLORS = {
  joy: "#E3A008",
  sadness: "#3B82C4",
  anger: "#E11D48",
  fear: "#7C3AED",
  surprise: "#EA7A3A",
  disgust: "#3F8F6B",
  neutral: "#7A7388",
};

export const MoodResult = ({
  analysis,
  onReset,
  t,
  language,
  onExploreInsights,
  onOpenBreathing,
  onNavigateMode,
  onStartTalk,
  onFollowUp,
}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [journalNote, setJournalNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const emotionMap = Object.fromEntries(
    (analysis?.emotions || []).map((item) => [item.emotion?.toLowerCase(), item.score || 0])
  );
  const emotions = EMOTION_ORDER.map((name) => ({
    emotion: name,
    score: emotionMap[name] || 0,
  }));
  const dominant = (analysis?.dominant_mood || "neutral").toLowerCase();

  const saveToJournal = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/journal/save`, {
        analysis_id: analysis.id,
        note: journalNote,
      });
      setSaved(true);
      setShowNoteInput(false);
    } catch (err) {
      console.error("Failed to save reflection:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!analysis?.response_text) return;
    navigator.clipboard.writeText(analysis.response_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(analysis.response_text);
      utterance.rate = 0.9;
      utterance.pitch = 0.95;
      utterance.lang = speechLocale(language);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div data-testid="mood-result" className="w-full space-y-7 max-w-7xl mx-auto pb-16">
      {/* Top Header Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3" style={{ borderBottom: "1px solid var(--divider-subtle)" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              color: "var(--text-secondary)",
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <RotateCcw size={13} />
            <span>{t("newExpression") || "New Reflection"}</span>
          </button>
          <div className="h-4 w-[1px]" style={{ background: "var(--divider-subtle)" }} />
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: "var(--aura-violet)" }} />
            <h3 className="font-display text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {t("mirrorReflection")}
            </h3>
          </div>
        </div>
        <div
          data-testid="dominant-mood"
          className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize"
          style={{
            background: "var(--chip-active-bg)",
            border: "1px solid var(--border-highlight)",
            color: "var(--text-primary)",
          }}
        >
          {t(dominant) || dominant}
        </div>
      </div>

      <div className="result-print-row">
        <article className="poem-slip" data-testid="poem-slip">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="poem-slip-label text-[10px] font-mono uppercase tracking-[0.14em]">
              {t("forPrinter")}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={toggleSpeech} className="poem-slip-label p-1.5 rounded-full" aria-label={isSpeaking ? t("stopReading") : t("readAloud")}>
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button type="button" onClick={handleCopy} className="poem-slip-label p-1.5 rounded-full" aria-label={t("copyPoem")}>
                <Copy size={13} />
              </button>
            </div>
          </div>
          <p data-testid="ai-response-text" className="poem-slip-text">
            {analysis.response_text}
          </p>
          <p className="poem-slip-label mt-4 text-[10px] font-mono">
            {copied ? t("copied") : t("poemMeta")}
          </p>
        </article>

        <section
          data-testid="emotion-column"
          className="rounded-3xl p-4 flex flex-col justify-center gap-2.5"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
          }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {t("emotionsLabel")}
          </span>
          {emotions.map((item) => {
            const scorePercent = Math.round((item.score || 0) * 100);
            const color = EMOTION_COLORS[item.emotion] || "#7A7388";
            return (
              <div key={item.emotion} className="space-y-1" data-testid={`emotion-bar-${item.emotion}`}>
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span style={{ color: item.emotion === dominant ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: item.emotion === dominant ? 700 : 500 }}>
                    {t(item.emotion) || item.emotion}
                  </span>
                  <span className="font-mono" style={{ color }}>{scorePercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface-soft)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercent}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <LivingTapestryCard analysis={analysis} language={language} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {saved ? (
          <div data-testid="journal-saved" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#3F8F6B" }}>
            <Check size={16} />
            <span>{t("savedToJournal")}</span>
          </div>
        ) : showNoteInput ? (
          <div className="w-full space-y-3">
            <textarea
              data-testid="journal-note-input"
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              rows={3}
              className="w-full p-3.5 rounded-2xl outline-none text-xs resize-none"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--control-border)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button type="button" data-testid="cancel-save-btn" onClick={() => setShowNoteInput(false)} className="px-4 py-2 rounded-full text-xs" style={{ color: "var(--text-muted)" }}>
                {t("cancel")}
              </button>
              <button type="button" data-testid="confirm-save-btn" onClick={saveToJournal} disabled={saving} className="btn-mirror-me px-6 py-2 rounded-full text-xs font-semibold">
                {saving ? t("saving") : t("saveEntry")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Keep this poem with the rest of your reflections.
            </p>
            <div className="flex items-center gap-3">
              {onExploreInsights && (
                <button type="button" onClick={onExploreInsights} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium" style={{ color: "var(--text-secondary)", background: "var(--control-bg)", border: "1px solid var(--border-subtle)" }}>
                  <TrendingUp size={14} />
                  <span>{t("exploreInsights")}</span>
                </button>
              )}
              <button type="button" data-testid="save-to-journal-btn" onClick={() => setShowNoteInput(true)} className="btn-mirror-me flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white">
                <Bookmark size={14} />
                <span>{t("saveReflection")}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {analysis?.cognitive_reframing && (
        <CognitiveReframer cognitiveData={analysis.cognitive_reframing} t={t} />
      )}

      <NextStepPanel
        onOpenBreathing={onOpenBreathing}
        onNavigateMode={onNavigateMode}
        onStartTalk={onStartTalk}
        onFollowUp={onFollowUp}
        t={t}
      />
    </div>
  );
};

// ─── Live Reflection Preview (When no analysis is present) ────────────────────

export const LiveReflectionPreview = ({ isAnalyzing, onPickPrompt, activeMode = "text", t = (key) => key }) => {
  const SUGGESTIONS = [
    { id: "smile", text: t("suggestSmile"), icon: Moon, color: "#9333EA" },
    { id: "heavy", text: t("suggestHeavy"), icon: Cloud, color: "#2563EB" },
    { id: "thought", text: t("suggestThought"), icon: Heart, color: "#DB2777" },
    { id: "surprise", text: t("suggestSurprise"), icon: Shuffle, color: "#059669" },
  ];

  const modeTags = {
    text: ["tagCalm", "tagThoughtful", "tagHopeful"],
    draw: ["tagDreamy", "tagCalm", "tagNostalgic"],
    speech: ["tagCalm", "tagThoughtful", "tagHopeful"],
    talk: ["tagIntimate", "tagOpen", "tagGrounded"],
  };

  const tags = modeTags[activeMode] || modeTags.text;

  return (
    <div
      className="relative rounded-3xl p-5 md:p-6 transition-all duration-300 w-full flex flex-col justify-between"
      style={{
        background: "var(--card-glass-bg)",
        border: "1px solid var(--card-glass-border)",
        backdropFilter: "blur(24px)",
        boxShadow: "var(--card-glass-shadow)",
      }}
    >
      <div>
        {/* Header */}
        <div className="mb-4">
          <h3
            className="font-display text-base font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {isAnalyzing ? t("previewReflecting") : t("previewReady")}
          </h3>
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {isAnalyzing ? t("previewSensing") : t("previewHint")}
          </p>
        </div>

        {/* Central Luminous Particle Orb */}
        <div className="relative flex flex-col items-center justify-center my-3 py-2">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(155, 108, 255, 0.35) 0%, rgba(101, 120, 255, 0.12) 50%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <ParticleBlob state={isAnalyzing ? "thinking" : "idle"} size={160} />
          </div>

          {/* Mood Preview Tags */}
          <div className="flex items-center gap-1.5 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                style={{
                  background: "var(--chip-active-bg)",
                  border: "1px solid rgba(155, 108, 255, 0.35)",
                  color: "var(--text-primary)",
                }}
              >
                {t(tag)}
              </span>
            ))}
          </div>
        </div>

        {/* Progress bar if analyzing */}
        {isAnalyzing && (
          <div className="my-4">
            <div className="flex items-center justify-between text-[11px] text-violet-300 mb-1.5">
              <span>{t("previewAnalyzing")}</span>
              <Sparkles size={12} className="animate-spin text-violet-400" />
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #9B6CFF, #6578FF, #FFB39C)" }}
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* "Try writing/drawing about..." suggestions list */}
      <div
        className="mt-5 pt-4"
        style={{ borderTop: "1px solid var(--divider-subtle)" }}
      >
        <p
          className="text-xs font-semibold mb-2.5"
          style={{ color: "var(--text-primary)" }}
        >
          {activeMode === "draw" ? t("tryDrawing") : activeMode === "speech" || activeMode === "talk" ? t("trySpeaking") : t("tryWriting")}
        </p>

        <div className="space-y-1.5">
          {SUGGESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPickPrompt && onPickPrompt(item.text)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 group hover:translate-x-1"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="p-1 rounded-lg shrink-0"
                  style={{ background: "var(--chip-bg)" }}
                >
                  <Icon size={13} style={{ color: item.color }} />
                </div>
                <span
                  className="text-xs leading-tight flex-1 truncate font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.text}
                </span>
                <ArrowRight
                  size={11}
                  style={{ color: "var(--text-muted)" }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodResult;
