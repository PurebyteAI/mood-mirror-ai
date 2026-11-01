import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  BookOpen,
  Calendar,
  StickyNote,
  Star,
  Search,
  Heart,
  Compass,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import axios from "axios";

const CATEGORIES = [
  { id: "all", labelKey: "journalAll", icon: Star },
  { id: "calm", labelKey: "journalCalm", icon: Heart },
  { id: "letters", labelKey: "journalLetters", icon: BookOpen },
  { id: "insights", labelKey: "journalInsights", icon: Compass },
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
      return ["neutral", "calmness", "calm", "joy"].includes(
        entry.dominant_mood?.toLowerCase()
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
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b"
        style={{ borderColor: "var(--divider-subtle)" }}
      >
        <div>
          <div className="flex items-center gap-3">
            {!embedded && (
              <button
                type="button"
                data-testid="journal-back-btn"
                onClick={onBack}
                className="p-2 rounded-full transition-colors"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h2
              className="font-display text-3xl md:text-4xl font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("collectionsTitle")}
            </h2>
          </div>
          <p className="text-xs md:text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Your personal sanctuary of saved reflections, poems, and private margin notes.
          </p>
        </div>

        {/* Search Input */}
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-full w-full md:w-64"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchJournal")}
            className="w-full bg-transparent outline-none text-xs"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = activeCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0"
              style={{
                background: active ? "var(--chip-active-bg)" : "var(--control-bg)",
                border: active
                  ? "1px solid var(--border-strong)"
                  : "1px solid var(--border-subtle)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              <Icon
                size={13}
                style={{ color: active ? "var(--aura-gold)" : "var(--text-muted)" }}
              />
              <span>{t(cat.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--aura-gold)", borderTopColor: "transparent" }}
          />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-testid="empty-journal"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--aura-gold)",
            }}
          >
            <BookOpen size={24} />
          </div>
          <p className="font-display text-2xl font-medium" style={{ color: "var(--text-primary)" }}>
            {t("emptyJournal")}
          </p>
          <p className="text-xs mt-1 max-w-sm" style={{ color: "var(--text-muted)" }}>
            {t("emptyJournalHint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry, idx) => {
            const isExpanded = expandedId === entry.id;
            return (
              <motion.div
                key={entry.id || idx}
                data-testid={`journal-entry-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-5 rounded-2xl transition-all duration-300 relative group cursor-pointer"
                style={{
                  background: "var(--card-glass-bg)",
                  border: "1px solid var(--card-glass-border)",
                  boxShadow: "var(--card-glass-shadow)",
                }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                {/* Top Row: Mood Badge, Date, Delete */}
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
                      {t(entry.dominant_mood?.toLowerCase()) || entry.dominant_mood}
                    </span>
                    <div
                      className="flex items-center gap-1.5 text-[11px] font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
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
                    type="button"
                    data-testid={`delete-entry-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title={t("removeFromCollections")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Reflection Text */}
                <div className="relative mb-3">
                  <p
                    className={`font-display text-base leading-relaxed italic whitespace-pre-line ${
                      isExpanded ? "" : "line-clamp-4"
                    }`}
                    style={{ color: "var(--text-primary)" }}
                  >
                    {String(entry.response_text || "").replace(/\\n/g, "\n")}
                  </p>
                </div>

                {/* Personal Note (if added) */}
                {entry.journal_note && (
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5 mt-3"
                    style={{
                      background: "var(--control-bg)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <StickyNote
                      size={13}
                      style={{ color: "var(--aura-gold)" }}
                      className="shrink-0 mt-0.5"
                    />
                    <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
                      “{entry.journal_note}”
                    </p>
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
