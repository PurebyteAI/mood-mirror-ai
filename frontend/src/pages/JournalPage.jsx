import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  BookOpen,
  Calendar,
  StickyNote,
  Star,
  Search,
  Heart,
  Sparkles,
  Quote,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import axios from "axios";

const CATEGORIES = [
  { id: "all", label: "All Reflections", icon: Star },
  { id: "calm", label: "Moments of Calm", icon: Heart },
  { id: "letters", label: "Future Letters", icon: BookOpen },
  { id: "insights", label: "Key Reflections", icon: Sparkles },
];

const JournalPage = ({ onBack, t, embedded = false }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/journal?days=90`);
      setEntries(res.data || []);
    } catch (err) {
      console.error("Journal fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const deleteEntry = async (entryId) => {
    try {
      await axios.delete(`${API_BASE}/journal/${entryId}`);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.response_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.journal_note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.dominant_mood?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === "calm") {
      return (
        entry.dominant_mood?.toLowerCase() === "calmness" ||
        entry.dominant_mood?.toLowerCase() === "calm"
      );
    }
    if (activeCategory === "letters") {
      return (
        entry.input_preview?.toLowerCase().includes("letter") ||
        entry.journal_note?.toLowerCase().includes("letter")
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12" data-testid="journal-page">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {!embedded && (
              <button
                data-testid="journal-back-btn"
                onClick={onBack}
                className="p-2 rounded-full text-white/60 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t("collectionsTitle")}
            </h2>
          </div>
          <p className="text-sm text-white/60 mt-1">
            Your personal digital sanctuary of saved reflections and meaningful moments.
          </p>
        </div>

        {/* Search Input */}
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 w-full md:w-64"
          style={{ background: "rgba(255, 255, 255, 0.04)" }}
        >
          <Search size={14} className="text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved reflections..."
            className="w-full bg-transparent outline-none text-xs text-white placeholder-white/40"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0"
              style={{
                background: active ? "rgba(155, 108, 255, 0.22)" : "rgba(255, 255, 255, 0.03)",
                border: active ? "1px solid rgba(155, 108, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.08)",
                color: active ? "#F7F7FF" : "var(--text-muted)",
              }}
            >
              <Icon size={14} className={active ? "text-violet-400" : "text-white/40"} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-journal">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.08] mb-4">
            <BookOpen size={24} className="text-white/40" />
          </div>
          <p className="text-lg font-medium text-white/80">{t("emptyJournal")}</p>
          <p className="text-xs text-white/40 mt-1 max-w-sm">{t("emptyJournalHint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry, idx) => {
            const isExpanded = expandedId === entry.id;
            const moodColor = "#9B6CFF";
            return (
              <motion.div
                key={entry.id || idx}
                data-testid={`journal-entry-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-5 rounded-3xl border border-white/[0.08] transition-all duration-300 relative group cursor-pointer"
                style={{
                  background: "linear-gradient(160deg, rgba(12, 23, 48, 0.8), rgba(7, 17, 38, 0.95))",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
                }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                {/* Top Row: Mood Badge, Date, Delete */}
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
                      {t(entry.dominant_mood?.toLowerCase()) || entry.dominant_mood}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-mono">
                      <Calendar size={11} />
                      <span>
                        {new Date(entry.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    data-testid={`delete-entry-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    className="p-1.5 rounded-full text-white/30 hover:text-red-400 transition-colors"
                    title="Remove from Collections"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Reflection Text */}
                <div className="relative mb-3">
                  <p
                    className={`font-display text-sm md:text-base leading-relaxed text-white/90 ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {entry.response_text}
                  </p>
                </div>

                {/* Personal Note (if added) */}
                {entry.journal_note && (
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5 mt-3">
                    <StickyNote size={13} className="text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 italic">"{entry.journal_note}"</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JournalPage;

