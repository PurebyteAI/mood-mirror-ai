import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bookmark,
  Check,
  Download,
  Info,
  TrendingUp,
  Volume2,
  VolumeX,
  Copy,
  Wand2,
  X,
  Moon,
  Cloud,
  Heart,
  Shuffle,
  ArrowRight,
  Activity,
  Zap,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import ParticleBlob from "@/components/mood/ParticleBlob";
import LivingTapestryCard from "@/components/mood/LivingTapestryCard";
import CognitiveReframer from "@/components/mood/CognitiveReframer";
import ContradictionDetector from "@/components/mood/ContradictionDetector";
import NextStepPanel from "@/components/mood/NextStepPanel";

export const MoodResult = ({
  analysis,
  onReset,
  t,
  language,
  onExploreInsights,
  onOpenBreathing,
  onNavigateMode,
  onStartTalk,
}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [journalNote, setJournalNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const topTags = (analysis?.emotions || [])
    .slice(0, 3)
    .map((item) => t(item.emotion?.toLowerCase()) || item.emotion);

  const tagString = topTags.length > 0 ? topTags.join(" • ") : "Calm • Hopeful • Reflective";

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
      utterance.lang = language === "de" ? "de-DE" : "en-US";
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div data-testid="mood-result" className="w-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all"
          >
            <RotateCcw size={13} />
            <span>{t("newExpression") || "New Reflection"}</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <h3 className="font-display text-base font-bold text-white">
              {t("mirrorReflection")}
            </h3>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2.5">
          <div
            data-testid="dominant-mood"
            className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
            style={{
              background: "linear-gradient(135deg, rgba(155, 108, 255, 0.25), rgba(101, 120, 255, 0.2))",
              border: "1px solid rgba(155, 108, 255, 0.4)",
              color: "#FFFFFF",
              boxShadow: "0 0 16px rgba(155, 108, 255, 0.15)",
            }}
          >
            {tagString}
          </div>

          {analysis?.affect_quadrant && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
              <Activity size={12} />
              <span>{analysis.affect_quadrant}</span>
            </div>
          )}

          {analysis?.alignment?.has_mismatch && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-pink-500/15 border border-pink-500/30 text-pink-300">
              <Zap size={12} />
              <span>Contradiction Detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Symmetrical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 of 12 cols): Visuals, Poetic Reflection & Cognitive Reframing */}
        <div className="lg:col-span-7 space-y-6">
          {/* Feature 03: Living Emotional Tapestry Generative Art */}
          <LivingTapestryCard analysis={analysis} language={language} />

          {/* AI Poetic Reflection Text Card */}
          <div
            className="relative rounded-3xl p-6 sm:p-7 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4"
            style={{
              background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase text-violet-300 tracking-wider">
                Intimate Reflection
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSpeech}
                  className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                  title={isSpeaking ? "Stop listening" : "Listen to reflection"}
                >
                  {isSpeaking ? <VolumeX size={14} className="text-violet-400" /> : <Volume2 size={14} />}
                  <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                  title="Copy reflection text"
                >
                  <Copy size={13} />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <p
              data-testid="ai-response-text"
              className="font-display text-base sm:text-lg leading-relaxed whitespace-pre-line text-white/95"
              style={{
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "0.01em",
              }}
            >
              {analysis.response_text}
            </p>
          </div>

          {/* Feature: Cognitive Distortion Reframer & CBT Perspective Shifts */}
          {analysis?.cognitive_reframing && (
            <CognitiveReframer cognitiveData={analysis.cognitive_reframing} />
          )}
        </div>

        {/* Right Column (5 of 12 cols): Contradiction Detector, Emotions Spectrum, Affect Zone & Journal Vault */}
        <div className="lg:col-span-5 space-y-6">
          {/* Feature 02: Emotional Contradiction Detector */}
          {analysis?.alignment && (
            <ContradictionDetector
              alignment={analysis.alignment}
              dominantMood={analysis.dominant_mood}
              t={t}
            />
          )}

          {/* Emotions Spectrum & Scores */}
          <div
            className="rounded-3xl p-5 sm:p-6 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4"
            style={{
              background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase text-violet-300 tracking-wider">
                Emotional Spectrum
              </span>
              <span className="text-[10px] font-mono text-white/40">Relative Weights</span>
            </div>

            <div className="space-y-3">
              {(analysis?.emotions || []).map((item, idx) => {
                const scorePercent = Math.round((item.score || 0) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="capitalize text-white/80">
                        {t(item.emotion?.toLowerCase()) || item.emotion}
                      </span>
                      <span className="font-mono text-violet-300 text-[11px]">{scorePercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scorePercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #9B6CFF 0%, #6578FF 50%, #FFB49D 100%)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Affect Circumplex Zone Summary */}
          {analysis?.affect_quadrant && (
            <div
              className="rounded-3xl p-5 backdrop-blur-2xl border border-blue-500/20 shadow-xl space-y-2.5"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(17, 29, 57, 0.8) 100%)",
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300">Affect Coordinates</span>
                <span className="font-mono text-white/60">
                  V: {typeof analysis.valence === "number" ? analysis.valence.toFixed(2) : "0.50"} · A:{" "}
                  {typeof analysis.arousal === "number" ? analysis.arousal.toFixed(2) : "0.40"}
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Operating within the <span className="text-blue-300 font-semibold">{analysis.affect_quadrant}</span>.
              </p>
            </div>
          )}

          {/* Journal Note & Sanctuary Saving */}
          <div
            className="rounded-3xl p-5 sm:p-6 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4"
            style={{
              background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
            }}
          >
            <div className="flex items-center gap-2 text-violet-300">
              <BookOpen size={16} />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                Private Journal Vault
              </span>
            </div>

            {saved ? (
              <div
                data-testid="journal-saved"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 shadow-lg"
              >
                <Check size={16} />
                <span>{t("savedToJournal")}</span>
              </div>
            ) : showNoteInput ? (
              <div className="space-y-3">
                <textarea
                  data-testid="journal-note-input"
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="Add a gentle note to this memory (optional)..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/15 outline-none text-xs text-white resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    data-testid="cancel-save-btn"
                    onClick={() => setShowNoteInput(false)}
                    className="px-3.5 py-1.5 rounded-full text-xs text-white/60 hover:text-white"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    data-testid="confirm-save-btn"
                    onClick={saveToJournal}
                    disabled={saving}
                    className="btn-mirror-me px-5 py-2 rounded-full text-xs font-semibold shadow-md"
                  >
                    {saving ? t("saving") : t("saveEntry")}
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                data-testid="save-to-journal-btn"
                onClick={() => setShowNoteInput(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-mirror-me w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold shadow-lg text-white"
              >
                <Bookmark size={15} />
                <span>{t("saveReflection")}</span>
              </motion.button>
            )}

            {/* Explore Insights Button */}
            {onExploreInsights && (
              <button
                onClick={onExploreInsights}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-medium text-white/70 hover:text-white bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all"
              >
                <TrendingUp size={14} />
                <span>{t("exploreInsights")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature 05: Next-Step Action Deck ("What do you need right now?") Spanning full width */}
      <NextStepPanel
        dominantMood={analysis.dominant_mood}
        onOpenBreathing={onOpenBreathing}
        onNavigateMode={onNavigateMode}
        onStartTalk={onStartTalk}
        t={t}
      />
    </div>
  );
};

// ─── Live Reflection Preview (When no analysis is present) ────────────────────

export const LiveReflectionPreview = ({ isAnalyzing, onPickPrompt, activeMode = "text" }) => {
  const SUGGESTIONS = [
    { id: "smile", text: "Something that made you smile today", icon: Moon, color: "#9333EA" },
    { id: "heavy", text: "What's been feeling heavy lately", icon: Cloud, color: "#2563EB" },
    { id: "thought", text: "A thought you can't stop thinking about", icon: Heart, color: "#DB2777" },
    { id: "surprise", text: "Surprise me with a question", icon: Shuffle, color: "#059669" },
  ];

  const modeTags = {
    text: ["Calm", "Thoughtful", "Hopeful"],
    draw: ["Dreamy", "Calm", "Nostalgic"],
    speech: ["Calm", "Thoughtful", "Hopeful"],
    talk: ["Intimate", "Open", "Grounded"],
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
            {isAnalyzing ? "Reflecting on your words..." : "Your mirror is ready"}
          </h3>
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {isAnalyzing ? "Sensing emotions & nuances..." : "The more you express, the deeper the reflection."}
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
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Progress bar if analyzing */}
        {isAnalyzing && (
          <div className="my-4">
            <div className="flex items-center justify-between text-[11px] text-violet-300 mb-1.5">
              <span>Analyzing tone, pace & words...</span>
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
          {activeMode === "draw" ? "Try drawing about..." : activeMode === "speech" ? "Try speaking about..." : "Try writing about..."}
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
