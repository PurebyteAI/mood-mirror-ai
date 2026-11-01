import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Check,
  TrendingUp,
  Volume2,
  VolumeX,
  Copy,
  Printer,
  Moon,
  Cloud,
  Heart,
  Shuffle,
  ArrowRight,
  RotateCcw,
  Compass,
} from "lucide-react";
import { speechLocale } from "@/lib/languages";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import ParticleBlob from "@/components/mood/ParticleBlob";
import LivingTapestryCard from "@/components/mood/LivingTapestryCard";
import CognitiveReframer from "@/components/mood/CognitiveReframer";
import ContradictionDetector from "@/components/mood/ContradictionDetector";
import NextStepPanel from "@/components/mood/NextStepPanel";

const EMOTION_ORDER = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"];
const EMOTION_COLORS = {
  joy: "#D4A373",
  sadness: "#7CA1C4",
  anger: "#E07A5F",
  fear: "#9F7AEA",
  surprise: "#E9C46A",
  disgust: "#81B29A",
  neutral: "#8E8D8A",
};

const EMOTION_ALIASES = {
  joy: "joy",
  happiness: "joy",
  happy: "joy",
  joyful: "joy",
  hopeful: "joy",
  hope: "joy",
  excitement: "joy",
  pride: "joy",
  warmth: "joy",
  gratitude: "joy",
  playful: "joy",
  tenderness: "joy",
  relief: "joy",
  sadness: "sadness",
  sad: "sadness",
  melancholy: "sadness",
  grief: "sadness",
  loneliness: "sadness",
  anger: "anger",
  angry: "anger",
  frustration: "anger",
  rage: "anger",
  fear: "fear",
  anxiety: "fear",
  stress: "fear",
  stressed: "fear",
  overwhelm: "fear",
  worry: "fear",
  tense: "fear",
  vulnerability: "fear",
  surprise: "surprise",
  curiosity: "surprise",
  curious: "surprise",
  wonder: "surprise",
  amazement: "surprise",
  disgust: "disgust",
  disgusted: "disgust",
  contempt: "disgust",
  neutral: "neutral",
  calm: "neutral",
  calmness: "neutral",
  peace: "neutral",
  reflective: "neutral",
  stillness: "neutral",
  fatigue: "neutral",
  exhaustion: "neutral",
  nostalgia: "neutral",
  determination: "neutral",
};

function normalizeClientEmotions(rawList, dominantMood) {
  const totals = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    neutral: 0,
  };

  for (const item of rawList || []) {
    if (!item || typeof item !== "object") continue;
    const rawName = String(item.emotion || "").trim().toLowerCase();
    const canonical = EMOTION_ALIASES[rawName];
    if (!canonical) continue;
    let num = Number(item.score);
    if (!Number.isFinite(num) || num < 0) num = 0;
    if (num > 1 && num <= 100) num = num / 100;
    totals[canonical] = Math.min(1, totals[canonical] + num);
  }

  const domRaw = String(dominantMood || "neutral").trim().toLowerCase();
  const domCanonical = EMOTION_ALIASES[domRaw] || "neutral";

  const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
  if (totalSum <= 0.01) {
    totals[domCanonical] = 0.64;
    totals.neutral = domCanonical === "neutral" ? 0.64 : 0.24;
    if (domCanonical !== "joy") totals.joy = 0.12;
  }

  return {
    dominant: domCanonical,
    emotions: EMOTION_ORDER.map((name) => ({
      emotion: name,
      score: totals[name] || 0,
    })),
  };
}

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

  const { emotions, dominant } = normalizeClientEmotions(
    analysis?.emotions,
    analysis?.dominant_mood
  );

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

  const handlePrint = () => {
    if (typeof window !== "undefined" && window.print) {
      window.print();
    }
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
    <div data-testid="mood-result" className="w-full space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Breadcrumb & Dominant Affect Pill */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 pb-3.5"
        style={{ borderBottom: "1px solid var(--divider-subtle)" }}
      >
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
            <Compass size={15} style={{ color: "var(--aura-gold)" }} />
            <h3
              className="font-display text-lg font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mirrorReflection")}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {t("dominantResonance")}
          </span>
          <div
            data-testid="dominant-mood"
            className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-mono font-semibold capitalize"
            style={{
              background: "var(--chip-active-bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--aura-gold)",
            }}
          >
            {t(dominant) || dominant}
          </div>
        </div>
      </div>

      {/* Primary 3-Column Exhibition Row: Letterpress Poem Slip (280px) | 7 Ekman Emotions | Living Tapestry */}
      <div className="result-print-row">
        <article className="poem-slip flex flex-col justify-between" data-testid="poem-slip">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-black/10">
              <span className="poem-slip-label text-[10px] font-mono uppercase tracking-[0.16em]">
                {t("forPrinter")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className="poem-slip-label p-1.5 rounded-full hover:bg-black/5 transition-colors"
                  aria-label={isSpeaking ? t("stopReading") : t("readAloud")}
                  title={isSpeaking ? t("stopReading") : t("readAloud")}
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="poem-slip-label p-1.5 rounded-full hover:bg-black/5 transition-colors"
                  aria-label={t("copyPoem")}
                  title={t("copyPoem")}
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="poem-slip-label p-1.5 rounded-full hover:bg-black/5 transition-colors"
                  aria-label="Print poem slip"
                  title="Print 80mm receipt slip"
                >
                  <Printer size={12} />
                </button>
              </div>
            </div>
            <p data-testid="ai-response-text" className="poem-slip-text">
              {analysis.response_text}
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-black/10 flex items-center justify-between">
            <p className="poem-slip-label text-[9px] font-mono uppercase tracking-wider">
              {copied ? t("copied") : t("poemMeta")}
            </p>
            <span className="poem-slip-label text-[9px] font-mono">80mm</span>
          </div>
        </article>

        <section
          data-testid="emotion-column"
          className="rounded-2xl p-5 flex flex-col justify-between gap-2.5"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: "var(--divider-subtle)" }}>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
              {t("emotionsLabel")}
            </span>
            <span className="text-[10px] font-mono" style={{ color: "var(--aura-gold)" }}>
              Ekman-7
            </span>
          </div>
          <div className="space-y-2.5 my-auto py-1">
            {emotions.map((item) => {
              const scorePercent = Math.round((item.score || 0) * 100);
              const color = EMOTION_COLORS[item.emotion] || "#8E8D8A";
              const isDom = item.emotion === dominant;
              return (
                <div key={item.emotion} className="space-y-1" data-testid={`emotion-bar-${item.emotion}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="capitalize tracking-tight"
                      style={{
                        color: isDom ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: isDom ? 600 : 400,
                      }}
                    >
                      {t(item.emotion) || item.emotion}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color }}>
                      {scorePercent}%
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-surface-soft)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercent}%` }}
                      transition={{ duration: 0.65 }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <LivingTapestryCard analysis={analysis} language={language} />
      </div>

      {/* Archive & Insights Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
        }}
      >
        {saved ? (
          <div
            data-testid="journal-saved"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--aura-sage)" }}
          >
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
              className="w-full p-3.5 rounded-xl outline-none text-xs resize-none"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--control-border)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                data-testid="cancel-save-btn"
                onClick={() => setShowNoteInput(false)}
                className="px-4 py-2 rounded-full text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                data-testid="confirm-save-btn"
                onClick={saveToJournal}
                disabled={saving}
                className="btn-mirror-me px-6 py-2 rounded-full text-xs font-semibold"
              >
                {saving ? t("saving") : t("saveEntry")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs font-light" style={{ color: "var(--text-secondary)" }}>
              {t("archiveReflectionHint")}
            </p>
            <div className="flex items-center gap-2.5 ml-auto">
              {onExploreInsights && (
                <button
                  type="button"
                  onClick={onExploreInsights}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--control-bg)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <TrendingUp size={13} style={{ color: "var(--aura-gold)" }} />
                  <span>{t("exploreInsights")}</span>
                </button>
              )}
              <button
                type="button"
                data-testid="save-to-journal-btn"
                onClick={() => setShowNoteInput(true)}
                className="btn-mirror-me flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold"
              >
                <Bookmark size={13} />
                <span>{t("saveReflection")}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Multimodal Signal Alignment / Contradiction Detector */}
      {analysis?.alignment && (
        <ContradictionDetector
          alignment={analysis.alignment}
          dominantMood={dominant}
          t={t}
        />
      )}

      {/* Cognitive Reframer (CBT Perspective Shift) */}
      {analysis?.cognitive_reframing && (
        <CognitiveReframer
          cognitiveData={analysis.cognitive_reframing}
          onFollowUp={onFollowUp}
          t={t}
        />
      )}

      {/* Next Step Sanctuary Panel */}
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

export const LiveReflectionPreview = ({
  isAnalyzing,
  onPickPrompt,
  activeMode = "text",
  t = (key) => key,
}) => {
  const SUGGESTIONS = [
    { id: "smile", text: t("suggestSmile"), icon: Moon, color: "var(--aura-gold)" },
    { id: "heavy", text: t("suggestHeavy"), icon: Cloud, color: "var(--aura-sky)" },
    { id: "thought", text: t("suggestThought"), icon: Heart, color: "var(--aura-terracotta)" },
    { id: "surprise", text: t("suggestSurprise"), icon: Shuffle, color: "var(--aura-sage)" },
  ];

  const modeTags = {
    portal: ["tagCalm", "tagThoughtful", "tagHopeful"],
    text: ["tagCalm", "tagThoughtful", "tagHopeful"],
    draw: ["tagDreamy", "tagCalm", "tagNostalgic"],
    speech: ["tagCalm", "tagThoughtful", "tagHopeful"],
    talk: ["tagIntimate", "tagOpen", "tagGrounded"],
  };

  const tags = modeTags[activeMode] || modeTags.text;

  return (
    <div
      className="relative rounded-2xl p-5 md:p-6 transition-all duration-300 w-full flex flex-col justify-between"
      style={{
        background: "var(--card-glass-bg)",
        border: "1px solid var(--card-glass-border)",
        backdropFilter: "blur(24px)",
        boxShadow: "var(--card-glass-shadow)",
      }}
    >
      <div>
        {/* Header */}
        <div
          className="pb-3 mb-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--divider-subtle)" }}
        >
          <div>
            <span
              className="text-[9px] font-mono uppercase tracking-[0.18em] block mb-0.5"
              style={{ color: "var(--aura-gold)" }}
            >
              Resonance Monitor
            </span>
            <h3
              className="font-display text-lg font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {isAnalyzing ? t("previewReflecting") : t("previewReady")}
            </h3>
          </div>
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: isAnalyzing ? "var(--aura-terracotta)" : "var(--aura-sage)",
              boxShadow: isAnalyzing
                ? "0 0 10px var(--aura-terracotta)"
                : "0 0 8px var(--aura-sage)",
            }}
          />
        </div>

        <p
          className="text-xs leading-relaxed mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {isAnalyzing ? t("previewSensing") : t("previewHint")}
        </p>

        {/* Central Luminous Particle Sphere */}
        <div className="relative flex flex-col items-center justify-center my-2 py-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(212, 163, 115, 0.22) 0%, rgba(224, 122, 95, 0.08) 50%, transparent 72%)",
                filter: "blur(18px)",
              }}
            />
            <ParticleBlob state={isAnalyzing ? "thinking" : "idle"} size={148} />
          </div>

          {/* Mood Preview Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wide"
                style={{
                  background: "var(--chip-active-bg)",
                  border: "1px solid var(--border-strong)",
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
            <div
              className="flex items-center justify-between text-[11px] font-mono mb-1.5"
              style={{ color: "var(--aura-gold)" }}
            >
              <span>{t("previewAnalyzing")}</span>
              <span>80mm Slip</span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--bg-surface-soft)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-primary)" }}
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* "Try writing/drawing about..." suggestions list */}
      <div
        className="mt-4 pt-4"
        style={{ borderTop: "1px solid var(--divider-subtle)" }}
      >
        <p
          className="text-[11px] font-mono uppercase tracking-wider mb-2.5"
          style={{ color: "var(--text-muted)" }}
        >
          {activeMode === "draw"
            ? t("tryDrawing")
            : activeMode === "speech" || activeMode === "talk"
            ? t("trySpeaking")
            : t("tryWriting")}
        </p>

        <div className="space-y-1.5">
          {SUGGESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onPickPrompt && onPickPrompt(item.text)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 group"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="p-1.5 rounded-lg shrink-0"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <Icon size={12} style={{ color: item.color }} />
                </div>
                <span
                  className="text-xs leading-tight flex-1 truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.text}
                </span>
                <ArrowRight
                  size={11}
                  style={{ color: "var(--aura-gold)" }}
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
