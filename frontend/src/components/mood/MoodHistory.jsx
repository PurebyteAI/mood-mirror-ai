import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Brush, Mic, Clock, Sparkles, Search, Filter, Calendar, ChevronDown, Flame, Bookmark } from "lucide-react";

const TYPE_ICONS = { text: Pen, drawing: Brush, speech: Mic, fusion: Sparkles };

const MOOD_FILTERS = ["all", "joy", "calmness", "stress", "exhaustion", "sadness", "reflective", "curiosity"];

export const MoodHistory = ({ history, t }) => {
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
      <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="empty-history">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.08] mb-4">
          <Clock size={28} className="text-white/40" />
        </div>
        <p className="text-lg font-medium text-white/80">{t("noHistory") || "No reflections recorded yet"}</p>
        <p className="text-xs text-white/40 mt-1 max-w-sm">
          {t("historyHint") || "Express your thoughts in Mirror Me to build your emotional journey."}
        </p>
      </div>
    );
  }

  // Group by date (Today, Yesterday, or Date string)
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12 flex flex-col h-full" data-testid="mood-history">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={20} className="text-violet-400" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              {t("yourReflections") || "Your Reflections"}
            </h2>
            <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {history.length} Memories
            </span>
          </div>
          <p className="text-xs text-white/60">
            A chronological timeline of your moments of authentic self-expression.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-violet-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] font-mono text-white/40 uppercase mr-1 flex items-center gap-1">
          <Filter size={11} />
          Mood:
        </span>
        {MOOD_FILTERS.map((mood) => {
          const active = selectedMood === mood;
          return (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                active
                  ? "bg-violet-500/30 text-violet-200 border border-violet-400/50 shadow-md"
                  : "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {mood}
            </button>
          );
        })}
      </div>

      {/* Main Scrollable Timeline Viewport */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-2 space-y-6 custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-white/50 space-y-2">
            <p className="text-sm font-medium">No reflections match your search or filter.</p>
            <button
              onClick={() => {
                setSelectedMood("all");
                setSearchQuery("");
              }}
              className="text-xs text-violet-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([groupName, items], gIdx) => (
            <div key={groupName} className="space-y-4">
              {/* Section Date Header */}
              <div className="flex items-center gap-3 sticky top-0 z-10 py-1 backdrop-blur-md bg-slate-950/60">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                  <Calendar size={12} className="text-violet-400" />
                  {groupName}
                </span>
                <div className="flex-1 h-[1px] bg-white/[0.08]" />
              </div>

              {/* Timeline Cards Grid */}
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
                      transition={{ delay: i * 0.03 }}
                      className="p-5 rounded-3xl border border-white/[0.08] relative group flex flex-col justify-between hover:border-violet-500/35 transition-all"
                      style={{
                        background: "linear-gradient(160deg, rgba(12, 23, 48, 0.8), rgba(7, 17, 38, 0.95))",
                        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-3 py-0.5 rounded-full text-xs font-semibold capitalize"
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

                        {/* Reflection Quote */}
                        <p className="font-display text-sm md:text-[15px] leading-relaxed text-white/90 mb-3 font-serif italic">
                          "{item.response_text}"
                        </p>
                      </div>

                      {item.input_preview && item.input_type !== "drawing" && (
                        <p className="text-xs text-white/40 italic line-clamp-1 border-t border-white/[0.06] pt-2 mt-auto">
                          Expressed: "{item.input_preview}"
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
              onClick={() => setVisibleCount((c) => c + 6)}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.1] transition-all flex items-center gap-2 shadow-lg"
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
