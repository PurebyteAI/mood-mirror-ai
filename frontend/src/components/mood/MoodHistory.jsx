import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Pen,
  Brush,
  Mic,
  Clock,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Layers,
  ArrowUpRight,
} from "lucide-react";

const TYPE_ICONS = { text: Pen, drawing: Brush, speech: Mic, fusion: Layers };

const MOOD_FILTERS = ["all", "joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"];

export const MoodHistory = ({ history, t, onSelectReflection, onStartReflection }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    return history.filter((item) => {
      const matchesMood =
        selectedMood === "all" ||
        (item.dominant_mood && item.dominant_mood.toLowerCase() === selectedMood.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (item.response_text && item.response_text.toLowerCase().includes(query)) ||
        (item.input_preview && item.input_preview.toLowerCase().includes(query)) ||
        (item.dominant_mood && item.dominant_mood.toLowerCase().includes(query));

      return matchesMood && matchesSearch;
    });
  }, [history, selectedMood, searchQuery]);

  if (!history || history.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        data-testid="empty-history"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-strong)",
            color: "var(--aura-gold)",
          }}
        >
          <Clock size={26} />
        </div>
        <p className="font-display text-2xl font-medium" style={{ color: "var(--text-primary)" }}>
          {t("noHistory") || "No reflections recorded yet"}
        </p>
        <p className="text-xs mt-1.5 max-w-sm" style={{ color: "var(--text-muted)" }}>
          {t("historyHint") || "Express your thoughts in Mirror Me to build your emotional journey."}
        </p>
        {onStartReflection && (
          <button
            type="button"
            onClick={onStartReflection}
            className="btn-mirror-me mt-6 px-6 py-2.5 rounded-full text-xs font-semibold"
          >
            {t("heroTitle") || "Begin First Reflection"}
          </button>
        )}
      </div>
    );
  }

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const visibleItems = filteredHistory.slice(0, visibleCount);

  const grouped = visibleItems.reduce((acc, item) => {
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
    <div
      className="max-w-6xl mx-auto space-y-6 pb-12 flex flex-col h-full"
      data-testid="mood-history"
    >
      {/* Header & Controls */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b shrink-0"
        style={{ borderColor: "var(--divider-subtle)" }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Clock size={18} style={{ color: "var(--aura-gold)" }} />
            <h2
              className="font-display text-2xl md:text-3xl font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("yourReflections") || "Your Reflections"}
            </h2>
            <span
              className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full"
              style={{
                background: "var(--chip-active-bg)",
                border: "1px solid var(--border-strong)",
                color: "var(--aura-gold)",
              }}
            >
              {history.length} Specimens
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Chronological archive of your emotional expressions. Click any entry to reopen its full reflection.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchReflections")}
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs focus:outline-none transition-colors"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span
          className="text-[11px] font-mono uppercase mr-1 flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          <Filter size={11} />
          Mood:
        </span>
        {MOOD_FILTERS.map((mood) => {
          const active = selectedMood === mood;
          return (
            <button
              type="button"
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className="px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all"
              style={{
                background: active ? "var(--chip-active-bg)" : "var(--control-bg)",
                color: active ? "var(--aura-gold)" : "var(--text-secondary)",
                border: active
                  ? "1px solid var(--border-strong)"
                  : "1px solid var(--border-subtle)",
              }}
            >
              {mood === "all" ? "All" : t(mood) || mood}
            </button>
          );
        })}
      </div>

      {/* Main Scrollable Timeline Viewport */}
      <div className="flex-1 space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 space-y-2" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm font-medium">No reflections match your search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedMood("all");
                setSearchQuery("");
              }}
              className="text-xs underline"
              style={{ color: "var(--aura-gold)" }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([groupName, items], gIdx) => (
            <div key={groupName} className="space-y-4">
              {/* Section Date Header */}
              <div
                className="flex items-center gap-3 sticky top-0 z-10 py-1.5 backdrop-blur-md"
                style={{ background: "color-mix(in srgb, var(--bg-base) 85%, transparent)" }}
              >
                <span
                  className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: "var(--aura-gold)" }}
                >
                  <Calendar size={12} />
                  {groupName}
                </span>
                <div className="flex-1 h-[1px]" style={{ background: "var(--divider-subtle)" }} />
              </div>

              {/* Timeline Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, i) => {
                  const Icon = TYPE_ICONS[item.input_type] || Pen;
                  const timeStr = item.timestamp
                    ? new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <motion.div
                      key={item.id || `${gIdx}-${i}`}
                      data-testid={`history-item-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => onSelectReflection && onSelectReflection(item)}
                      role={onSelectReflection ? "button" : undefined}
                      tabIndex={onSelectReflection ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (onSelectReflection && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onSelectReflection(item);
                        }
                      }}
                      className="p-5 rounded-2xl relative group flex flex-col justify-between transition-all cursor-pointer"
                      style={{
                        background: "var(--card-glass-bg)",
                        border: "1px solid var(--card-glass-border)",
                        boxShadow: "var(--card-glass-shadow)",
                      }}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-3 py-0.5 rounded-full text-xs font-mono font-medium capitalize"
                              style={{
                                background: "var(--chip-active-bg)",
                                color: "var(--aura-gold)",
                                border: "1px solid var(--border-strong)",
                              }}
                            >
                              {t(item.dominant_mood?.toLowerCase()) || item.dominant_mood}
                            </span>
                            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              {timeStr}
                            </span>
                          </div>

                          <div
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Icon size={13} />
                            {onSelectReflection && (
                              <ArrowUpRight
                                size={13}
                                style={{ color: "var(--aura-gold)" }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        </div>

                        {/* Reflection Quote */}
                        <p
                          className="font-display text-base leading-relaxed mb-3 italic whitespace-pre-line"
                          style={{ color: "var(--text-primary)" }}
                        >
                          “{String(item.response_text || "").replace(/\\n/g, "\n")}”
                        </p>
                      </div>

                      {item.input_preview && item.input_type !== "drawing" && (
                        <p
                          className="text-xs italic line-clamp-1 pt-2.5 mt-auto border-t"
                          style={{
                            color: "var(--text-muted)",
                            borderColor: "var(--divider-subtle)",
                          }}
                        >
                          Expressed: “{item.input_preview}”
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {filteredHistory.length > visibleCount && (
          <div className="flex justify-center pt-4 pb-2">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 6)}
              className="px-6 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
              }}
            >
              <span>Load More Reflections</span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodHistory;
