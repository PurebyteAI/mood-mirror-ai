import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Quote, Sparkles } from "lucide-react";
import { MoodChart } from "@/components/mood/MoodChart";

const MOOD_COLORS = {
  happiness: "#FCD34D",
  happy: "#FCD34D",
  sadness: "#60A5FA",
  sad: "#60A5FA",
  anger: "#F87171",
  angry: "#F87171",
  calmness: "#34D399",
  calm: "#34D399",
  stress: "#F97316",
  stressed: "#F97316",
  curiosity: "#C084FC",
  curious: "#C084FC",
};

const MOOD_LABELS = {
  happiness: "Happiness",
  happy: "Happiness",
  sadness: "Sadness",
  sad: "Sadness",
  anger: "Anger",
  angry: "Anger",
  calmness: "Calmness",
  calm: "Calmness",
  stress: "Stress",
  stressed: "Stress",
  curiosity: "Curiosity",
  curious: "Curiosity",
};

const RESPONSE_LABELS = {
  poem: "AI Poem",
  motivation: "Motivational",
  joke: "Lighthearted",
};

export const MoodResult = ({ analysis, onReset }) => {
  const dominantColor = MOOD_COLORS[analysis.dominant_mood?.toLowerCase()] || "#C084FC";
  const dominantLabel = MOOD_LABELS[analysis.dominant_mood?.toLowerCase()] || analysis.dominant_mood;
  const responseLabel = RESPONSE_LABELS[analysis.response_type] || analysis.response_type;

  return (
    <div className="w-full max-w-3xl" data-testid="mood-result">
      {/* Back button */}
      <motion.button
        data-testid="back-to-mirror-btn"
        onClick={onReset}
        whileHover={{ scale: 1.05, x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 mb-8 text-sm font-medium transition-all"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        New Expression
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dominant mood + Chart */}
        <div className="space-y-6">
          {/* Dominant mood card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 text-center"
            style={{ boxShadow: `0 0 60px ${dominantColor}22` }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Dominant Mood
            </p>
            <h3
              data-testid="dominant-mood"
              className="font-display text-4xl font-bold mb-2"
              style={{ color: dominantColor }}
            >
              {dominantLabel}
            </h3>
            <div
              className="w-16 h-1 mx-auto rounded-full mt-4"
              style={{ background: dominantColor }}
            />
          </motion.div>

          {/* Emotion chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
              Emotion Breakdown
            </p>
            <MoodChart emotions={analysis.emotions} />
          </motion.div>
        </div>

        {/* Right: AI Response */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 flex flex-col"
          style={{ boxShadow: `0 0 40px ${dominantColor}11` }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} strokeWidth={1.5} style={{ color: dominantColor }} />
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {responseLabel}
            </p>
          </div>

          <div className="flex-1 flex items-center">
            <div className="relative">
              <Quote
                size={32}
                strokeWidth={1}
                className="absolute -top-2 -left-2 opacity-20"
                style={{ color: dominantColor }}
              />
              <p
                data-testid="ai-response-text"
                className="font-display text-xl md:text-2xl font-normal leading-relaxed pl-8"
                style={{
                  color: "var(--text-primary)",
                  whiteSpace: "pre-line",
                }}
              >
                {analysis.response_text}
              </p>
            </div>
          </div>

          {/* Input type indicator */}
          <div className="mt-8 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              Analyzed from: {analysis.input_type} input
              {analysis.input_preview && analysis.input_type !== "drawing" && (
                <span className="ml-2 italic opacity-60">— "{analysis.input_preview}"</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
