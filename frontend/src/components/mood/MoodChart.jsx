import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const MOOD_COLORS_DARK = {
  joy: "#FCD34D",
  sadness: "#60A5FA",
  anger: "#F87171",
  fear: "#C084FC",
  surprise: "#FB923C",
  disgust: "#34D399",
  neutral: "#A1A1AA",
  happiness: "#FCD34D",
  calmness: "#A1A1AA",
  stress: "#C084FC",
  curiosity: "#FB923C",
};

const MOOD_COLORS_LIGHT = {
  joy: "#d4a840",
  sadness: "#6898d0",
  anger: "#c86858",
  fear: "#9870c0",
  surprise: "#c87840",
  disgust: "#5aaa78",
  neutral: "#7a7388",
  happiness: "#d4a840",
  calmness: "#7a7388",
  stress: "#9870c0",
  curiosity: "#c87840",
};

export const MoodChart = ({ emotions, t }) => {
  const { resolvedTheme } = useTheme();
  const MOOD_COLORS = resolvedTheme === "dark" ? MOOD_COLORS_DARK : MOOD_COLORS_LIGHT;
  if (!emotions || emotions.length === 0) return null;

  const sorted = [...emotions].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...sorted.map((e) => e.score), 0.01);

  return (
    <div className="space-y-3" data-testid="mood-chart">
      {sorted.map((em, i) => {
        const color = MOOD_COLORS[em.emotion] || "#A1A1AA";
        const label = t ? t(em.emotion) : em.emotion;
        const pct = Math.round(em.score * 100);
        const barWidth = (em.score / maxScore) * 100;

        return (
          <motion.div
            key={em.emotion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
            data-testid={`emotion-bar-${em.emotion}`}
          >
            <span className="text-xs font-mono w-16 text-right" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
            <div className="flex-1 h-6 rounded-full overflow-hidden relative" style={{ background: "var(--bg-surface-soft)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color}CC, ${color})`,
                  boxShadow: `0 0 16px ${color}44`,
                }}
              />
            </div>
            <span className="sr-only">{pct}%</span>
          </motion.div>
        );
      })}
    </div>
  );
};
