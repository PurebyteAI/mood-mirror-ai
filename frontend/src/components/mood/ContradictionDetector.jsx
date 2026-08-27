import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, AlertCircle, CheckCircle2, Split } from "lucide-react";

export const ContradictionDetector = ({ alignment, dominantMood = "calmness", t }) => {
  if (!alignment) return null;

  const {
    score = 0.52,
    has_mismatch = true,
    words_alignment = 68,
    voice_alignment = 84,
    visual_alignment = 87,
    contradiction_notice = "Your words sound calm, but your voice and drawing carry more tension.",
    subconscious_insight = "Relief + excitement + underlying exhaustion",
  } = alignment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-testid="contradiction-detector-card"
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all"
      style={{
        background: has_mismatch
          ? "linear-gradient(160deg, rgba(30, 20, 50, 0.85) 0%, rgba(15, 12, 35, 0.95) 100%)"
          : "linear-gradient(160deg, rgba(16, 28, 50, 0.85) 0%, rgba(8, 15, 32, 0.95) 100%)",
        border: has_mismatch
          ? "1px solid rgba(244, 114, 182, 0.35)"
          : "1px solid rgba(155, 108, 255, 0.3)",
        boxShadow: has_mismatch
          ? "0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(244, 114, 182, 0.12)"
          : "0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(155, 108, 255, 0.1)",
      }}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              has_mismatch
                ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                : "bg-violet-500/20 text-violet-300 border-violet-500/40"
            }`}
          >
            {has_mismatch ? <Split size={15} /> : <CheckCircle2 size={15} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
                {has_mismatch ? "Your mirror noticed something interesting" : "Harmonious Expression Alignment"}
              </h4>
              <span
                className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
                  has_mismatch
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {has_mismatch ? "Signal Mismatch" : "Aligned"}
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Cross-comparing what you said vs. how you sounded vs. how you drew.
            </p>
          </div>
        </div>
      </div>

      {/* Main Notice Callout */}
      <div
        className="p-4 rounded-2xl mb-5"
        style={{
          background: has_mismatch ? "rgba(244, 114, 182, 0.08)" : "rgba(155, 108, 255, 0.08)",
          border: has_mismatch ? "1px solid rgba(244, 114, 182, 0.2)" : "1px solid rgba(155, 108, 255, 0.2)",
        }}
      >
        <p className="text-sm font-medium text-white/95 leading-relaxed">
          {contradiction_notice}
        </p>
      </div>

      {/* 3-Way Expression Alignment Breakdown Meters */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-xs text-white/70 font-medium">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
            Expression Alignment Signals
          </span>
          <span className="font-mono text-[11px] text-violet-300">
            Overall Coherence: {Math.round(score * 100)}%
          </span>
        </div>

        {/* Words Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/80">Words (Language Semantics)</span>
            <span className="font-mono font-semibold text-white/90">{words_alignment}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${words_alignment}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
            />
          </div>
        </div>

        {/* Voice Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/80">Voice (Prosody & Pitch Energy)</span>
            <span className="font-mono font-semibold text-white/90">{voice_alignment}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${voice_alignment}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
            />
          </div>
        </div>

        {/* Visual / Drawing Meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/80">Visual (Stroke Rhythm & Density)</span>
            <span className="font-mono font-semibold text-white/90">{visual_alignment}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${visual_alignment}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-amber-300"
            />
          </div>
        </div>
      </div>

      {/* Subconscious Insight Interpretation */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Possible Layering:</span>
        <span className="text-xs font-semibold text-violet-200 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
          {subconscious_insight}
        </span>
      </div>
    </motion.div>
  );
};

export default ContradictionDetector;
