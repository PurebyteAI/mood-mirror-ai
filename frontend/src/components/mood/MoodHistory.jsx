import React from "react";
import { motion } from "framer-motion";
import { Pen, Brush, Mic, Clock } from "lucide-react";

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

const TYPE_ICONS = {
  text: Pen,
  drawing: Brush,
  speech: Mic,
};

export const MoodHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24" data-testid="empty-history">
        <Clock size={48} strokeWidth={1} className="mb-4" style={{ color: "var(--text-muted)" }} />
        <p className="text-lg font-light" style={{ color: "var(--text-secondary)" }}>
          No mood analyses yet
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Express yourself and the mirror will remember.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="mood-history">
      <h2 className="font-display text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
        Your Reflections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, i) => {
          const color = MOOD_COLORS[item.dominant_mood?.toLowerCase()] || "#C084FC";
          const Icon = TYPE_ICONS[item.input_type] || Pen;
          const timeStr = item.timestamp
            ? new Date(item.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <motion.div
              key={item.id || i}
              data-testid={`history-item-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:border-white/10 transition-all duration-300"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs font-mono uppercase" style={{ color }}>
                    {item.dominant_mood}
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {timeStr}
                </span>
              </div>
              <p
                className="text-sm font-light leading-relaxed line-clamp-3"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.response_text}
              </p>
              {item.input_preview && item.input_type !== "drawing" && (
                <p className="text-xs mt-3 italic opacity-40" style={{ color: "var(--text-muted)" }}>
                  "{item.input_preview}"
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
