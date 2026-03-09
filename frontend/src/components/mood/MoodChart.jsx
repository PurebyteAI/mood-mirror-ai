import React from "react";
import { motion } from "framer-motion";

const MOOD_COLORS = {
  happiness: "#FCD34D",
  sadness: "#60A5FA",
  anger: "#F87171",
  calmness: "#34D399",
  stress: "#F97316",
  curiosity: "#C084FC",
};

export const MoodChart = ({ emotions, t }) => {
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
            <div className="flex-1 h-6 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.03)" }}>
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
            <span className="text-xs font-mono w-10" style={{ color }}>{pct}%</span>
          </motion.div>
        );
      })}
    </div>
  );
};
