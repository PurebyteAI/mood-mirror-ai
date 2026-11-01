import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Split } from "lucide-react";

export const ContradictionDetector = ({ alignment, dominantMood = "calmness", t }) => {
  if (!alignment) return null;

  const translate = typeof t === "function" ? t : (k) => k;

  const {
    score = 0.52,
    has_mismatch = true,
    words_alignment = 68,
    voice_alignment = 84,
    visual_alignment = 87,
    contradiction_notice = "Your words sound calm, but your voice and drawing carry more tension.",
    subconscious_insight = "Relief + excitement + underlying exhaustion",
  } = alignment;

  const accentColor = has_mismatch ? "var(--aura-terracotta)" : "var(--aura-sage)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      data-testid="contradiction-detector-card"
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all"
      style={{
        background: "var(--card-glass-bg)",
        border: "1px solid var(--card-glass-border)",
        boxShadow: "var(--card-glass-shadow)",
      }}
    >
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
              color: accentColor,
            }}
          >
            {has_mismatch ? <Split size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h4
                className="font-display text-base sm:text-lg font-medium tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {has_mismatch
                  ? translate("alignmentMismatchTitle")
                  : translate("alignmentHarmoniousTitle")}
              </h4>
              <span
                className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded"
                style={{
                  background: "var(--chip-active-bg)",
                  border: "1px solid var(--border-strong)",
                  color: accentColor,
                }}
              >
                {has_mismatch
                  ? translate("alignmentMismatchBadge")
                  : translate("alignmentAlignedBadge")}
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {translate("alignmentSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Notice Callout */}
      <div
        className="p-4 rounded-xl mb-5"
        style={{
          background: "var(--chip-active-bg)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <p
          className="font-display text-sm sm:text-base leading-relaxed italic"
          style={{ color: "var(--text-primary)" }}
        >
          “{contradiction_notice}”
        </p>
      </div>

      {/* 3-Way Expression Alignment Breakdown Meters */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-xs">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-muted)" }}
          >
            {translate("alignmentSignalsLabel")}
          </span>
          <span className="font-mono text-xs font-medium" style={{ color: "var(--aura-gold)" }}>
            {translate("alignmentCoherenceLabel")} {Math.round(score * 100)}%
          </span>
        </div>

        {/* Words Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>{translate("alignmentWordsLabel")}</span>
            <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
              {words_alignment}%
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{
              background: "var(--bg-surface-soft)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${words_alignment}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--aura-sky, #3B7A9E)" }}
            />
          </div>
        </div>

        {/* Voice Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>{translate("alignmentVoiceLabel")}</span>
            <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
              {voice_alignment}%
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{
              background: "var(--bg-surface-soft)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${voice_alignment}%` }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--aura-gold, #D4A373)" }}
            />
          </div>
        </div>

        {/* Visual / Drawing Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-secondary)" }}>{translate("alignmentVisualLabel")}</span>
            <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>
              {visual_alignment}%
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{
              background: "var(--bg-surface-soft)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${visual_alignment}%` }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--aura-terracotta, #E07A5F)" }}
            />
          </div>
        </div>
      </div>

      {/* Subconscious Insight Interpretation */}
      <div
        className="flex flex-wrap items-center gap-2 pt-3 border-t"
        style={{ borderColor: "var(--divider-subtle)" }}
      >
        <span
          className="text-[10px] font-mono uppercase tracking-[0.16em]"
          style={{ color: "var(--text-muted)" }}
        >
          {translate("alignmentSubsurfaceLabel")}
        </span>
        <span
          className="text-xs font-mono font-medium px-3 py-1 rounded-full"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-strong)",
            color: "var(--aura-gold)",
          }}
        >
          {subconscious_insight}
        </span>
      </div>
    </motion.div>
  );
};

export default ContradictionDetector;
