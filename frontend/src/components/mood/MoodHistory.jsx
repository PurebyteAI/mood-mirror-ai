import React from "react";
import { motion } from "framer-motion";
import { Pen, Brush, Mic, Clock } from "lucide-react";
import { useTheme } from "next-themes";

const MOOD_COLORS_DARK = {
  happiness: "#FCD34D", happy: "#FCD34D",
  sadness: "#60A5FA", sad: "#60A5FA",
  anger: "#F87171", angry: "#F87171",
  calmness: "#34D399", calm: "#34D399",
  stress: "#F97316", stressed: "#F97316",
  curiosity: "#C084FC", curious: "#C084FC",
};

const MOOD_COLORS_LIGHT = {
  happiness: "#d4a840", happy: "#d4a840",
  sadness: "#6898d0", sad: "#6898d0",
  anger: "#c86858", angry: "#c86858",
  calmness: "#5aaa78", calm: "#5aaa78",
  stress: "#c87840", stressed: "#c87840",
  curiosity: "#9870c0", curious: "#9870c0",
};

const TYPE_ICONS = { text: Pen, drawing: Brush, speech: Mic };

export const MoodHistory = ({ history, t }) => {
  const { resolvedTheme } = useTheme();
  const MOOD_COLORS = resolvedTheme === "light" ? MOOD_COLORS_LIGHT : MOOD_COLORS_DARK;

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="empty-history">
        <Clock size={48} strokeWidth={1} className="mb-4" style={{ color: "var(--text-muted)" }} />
        <p className="text-lg font-light" style={{ color: "var(--text-secondary)" }}>{t("noHistory")}</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("historyHint")}</p>
      </div>
    );
  }

  return (
    <div data-testid="mood-history">
      <h2 className="font-display text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>{t("yourReflections")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, i) => {
          const color = MOOD_COLORS[item.dominant_mood?.toLowerCase()] || "#C084FC";
          const Icon = TYPE_ICONS[item.input_type] || Pen;
          const timeStr = item.timestamp
            ? new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            : "";

          return (
            <motion.div
              key={item.id || i}
              data-testid={`history-item-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 transition-all duration-300"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs font-mono uppercase" style={{ color }}>{t(item.dominant_mood?.toLowerCase()) || item.dominant_mood}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{timeStr}</span>
              </div>
              <p className="text-sm font-light leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>{item.response_text}</p>
              {item.input_preview && item.input_type !== "drawing" && (
                <p className="text-xs mt-3 italic opacity-40" style={{ color: "var(--text-muted)" }}>"{item.input_preview}"</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
