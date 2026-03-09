import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, BookOpen, TrendingUp, Calendar, StickyNote } from "lucide-react";
import { MoodChart } from "@/components/mood/MoodChart";
import { MoodTrendChart } from "@/components/mood/MoodTrendChart";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MOOD_COLORS = {
  happiness: "#FCD34D", happy: "#FCD34D",
  sadness: "#60A5FA", sad: "#60A5FA",
  anger: "#F87171", angry: "#F87171",
  calmness: "#34D399", calm: "#34D399",
  stress: "#F97316", stressed: "#F97316",
  curiosity: "#C084FC", curious: "#C084FC",
};

const JournalPage = ({ onBack, t }) => {
  const [entries, setEntries] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("entries");
  const [days, setDays] = useState(30);
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, trendsRes] = await Promise.all([
        axios.get(`${API}/journal?days=${days}`),
        axios.get(`${API}/journal/trends?days=${days}`),
      ]);
      setEntries(entriesRes.data);
      setTrends(trendsRes.data);
    } catch (err) { console.error("Journal fetch error:", err); }
    finally { setLoading(false); }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteEntry = async (entryId) => {
    try {
      await axios.delete(`${API}/journal/${entryId}`);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) { console.error("Delete error:", err); }
  };

  return (
    <div className="max-w-5xl mx-auto" data-testid="journal-page">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button data-testid="journal-back-btn" onClick={onBack} whileHover={{ scale: 1.05, x: -4 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={16} strokeWidth={1.5} />
          </motion.button>
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("moodJournal")}</h2>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>
              {entries.length} {entries.length !== 1 ? t("reflectionsSaved") : t("reflectionSaved")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {[7, 30, 90].map((d) => (
              <button key={d} data-testid={`filter-${d}d`} onClick={() => setDays(d)} className="px-3 py-1.5 rounded-full text-xs font-mono transition-all"
                style={{ background: days === d ? "rgba(255,255,255,0.1)" : "transparent", color: days === d ? "var(--text-primary)" : "var(--text-muted)" }}>
                {d}d
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <button data-testid="view-entries-btn" onClick={() => setActiveView("entries")} className="p-2 rounded-full transition-all"
              style={{ background: activeView === "entries" ? "rgba(255,255,255,0.1)" : "transparent", color: activeView === "entries" ? "var(--text-primary)" : "var(--text-muted)" }}>
              <BookOpen size={16} strokeWidth={1.5} />
            </button>
            <button data-testid="view-trends-btn" onClick={() => setActiveView("trends")} className="p-2 rounded-full transition-all"
              style={{ background: activeView === "trends" ? "rgba(255,255,255,0.1)" : "transparent", color: activeView === "trends" ? "var(--text-primary)" : "var(--text-muted)" }}>
              <TrendingUp size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeView === "trends" ? (
            <motion.div key="trends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {trends.length > 0 ? (
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <p className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>{t("emotionTrends")}</p>
                    <MoodTrendChart data={trends} t={t} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getMoodStats(trends).map((stat) => (
                      <div key={stat.mood} className="glass-card-light p-4 text-center" data-testid={`stat-${stat.mood}`}>
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: MOOD_COLORS[stat.mood] || "#A1A1AA" }} />
                        <p className="text-xs font-mono capitalize" style={{ color: "var(--text-muted)" }}>{t(stat.mood)}</p>
                        <p className="text-lg font-bold font-mono mt-1" style={{ color: MOOD_COLORS[stat.mood] || "#A1A1AA" }}>{stat.avgPct}%</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("avg")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <EmptyState t={t} />}
            </motion.div>
          ) : (
            <motion.div key="entries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.map((entry, i) => {
                    const color = MOOD_COLORS[entry.dominant_mood?.toLowerCase()] || "#C084FC";
                    const isExpanded = expandedId === entry.id;
                    return (
                      <motion.div key={entry.id || i} data-testid={`journal-entry-${i}`}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="glass-card overflow-hidden cursor-pointer transition-all duration-300"
                        style={{ borderLeft: `3px solid ${color}` }}
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}22` }}>
                                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                              </div>
                              <div>
                                <span className="text-sm font-medium capitalize" style={{ color }}>{t(entry.dominant_mood?.toLowerCase()) || entry.dominant_mood}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Calendar size={10} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                                    {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button data-testid={`delete-entry-${i}`} onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                              className="p-2 rounded-full hover:bg-white/5 transition-all" style={{ color: "var(--text-muted)" }}>
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className={`text-sm font-display leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`} style={{ color: "var(--text-secondary)" }}>{entry.response_text}</p>
                          {entry.journal_note && (
                            <div className="flex items-start gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                              <StickyNote size={12} strokeWidth={1.5} className="mt-0.5" style={{ color: "var(--text-muted)" }} />
                              <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>{entry.journal_note}</p>
                            </div>
                          )}
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                              <div className="px-5 pb-5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>{t("emotionBreakdown")}</p>
                                <MoodChart emotions={entry.emotions} t={t} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              ) : <EmptyState t={t} />}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

const EmptyState = ({ t }) => (
  <div className="flex flex-col items-center justify-center py-24" data-testid="empty-journal">
    <BookOpen size={48} strokeWidth={1} className="mb-4" style={{ color: "var(--text-muted)" }} />
    <p className="text-lg font-light" style={{ color: "var(--text-secondary)" }}>{t("emptyJournal")}</p>
    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("emptyJournalHint")}</p>
  </div>
);

const getMoodStats = (trends) => {
  const moods = ["happiness", "sadness", "stress", "calmness", "anger", "curiosity"];
  return moods.map((mood) => {
    const values = trends.map((t) => t[mood] || 0);
    const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    return { mood, avgPct: Math.round(avg * 100) };
  }).sort((a, b) => b.avgPct - a.avgPct);
};

export default JournalPage;
