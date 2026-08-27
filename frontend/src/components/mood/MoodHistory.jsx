import React from "react";
import { motion } from "framer-motion";
import { Pen, Brush, Mic, Clock, Sparkles } from "lucide-react";

const TYPE_ICONS = { text: Pen, drawing: Brush, speech: Mic };

export const MoodHistory = ({ history, t }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="empty-history">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.08] mb-4">
          <Clock size={28} className="text-white/40" />
        </div>
        <p className="text-lg font-medium text-white/80">{t("noHistory")}</p>
        <p className="text-xs text-white/40 mt-1 max-w-sm">{t("historyHint")}</p>
      </div>
    );
  }

  // Group by date (Today, Yesterday, or Date string)
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped = history.reduce((acc, item) => {
    const itemDate = item.timestamp ? new Date(item.timestamp).toDateString() : "Previous";
    let groupKey = itemDate;
    if (itemDate === today) groupKey = "Today";
    else if (itemDate === yesterday) groupKey = "Yesterday";
    else {
      groupKey = new Date(item.timestamp).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    }

    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12" data-testid="mood-history">
      {/* Title */}
      <div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
          {t("yourReflections")}
        </h2>
        <p className="text-sm text-white/60 mt-1">
          A gentle chronological timeline of your moments of self-expression.
        </p>
      </div>

      {/* Timeline Groups */}
      {Object.entries(grouped).map(([groupName, items], gIdx) => (
        <div key={groupName} className="space-y-4">
          {/* Section Date Header */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-violet-400">
              {groupName}
            </span>
            <div className="flex-1 h-[1px] bg-white/[0.08]" />
          </div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, i) => {
              const Icon = TYPE_ICONS[item.input_type] || Pen;
              const timeStr = item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <motion.div
                  key={item.id || `${gIdx}-${i}`}
                  data-testid={`history-item-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-3xl border border-white/[0.08] relative group"
                  style={{
                    background: "linear-gradient(160deg, rgba(12, 23, 48, 0.8), rgba(7, 17, 38, 0.95))",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{
                          background: "rgba(155, 108, 255, 0.16)",
                          color: "#D8B4FE",
                          border: "1px solid rgba(155, 108, 255, 0.3)",
                        }}
                      >
                        {t(item.dominant_mood?.toLowerCase()) || item.dominant_mood}
                      </span>
                      <span className="text-xs font-mono text-white/50">{timeStr}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <Icon size={13} />
                    </div>
                  </div>

                  <p className="font-display text-sm md:text-[15px] leading-relaxed text-white/90 mb-3">
                    "{item.response_text}"
                  </p>

                  {item.input_preview && item.input_type !== "drawing" && (
                    <p className="text-xs text-white/40 italic line-clamp-1 border-t border-white/[0.06] pt-2">
                      Expressed: "{item.input_preview}"
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

