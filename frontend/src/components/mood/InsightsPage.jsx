import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import { MoodTrendChart } from "@/components/mood/MoodTrendChart";
import { AffectRadarChart } from "@/components/mood/AffectRadarChart";
import { Sparkles, Heart, Compass, Clock, ArrowRight, TrendingUp, Activity } from "lucide-react";

export const InsightsPage = ({ t, onStart }) => {
  const [trends, setTrends] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [trendRes, journalRes] = await Promise.all([
          axios.get(`${API_BASE}/journal/trends?days=30`),
          axios.get(`${API_BASE}/journal?days=30`),
        ]);
        if (!live) return;
        setTrends(trendRes.data || []);
        setEntries(journalRes.data || []);
      } catch (err) {
        console.error("Insights fetch failed:", err);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const moodCounts = entries.reduce((acc, entry) => {
    const key = entry.dominant_mood || "calmness";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const themes = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (!loading && entries.length === 0) {
    return (
      <div className="max-w-2xl py-16 px-4 mx-auto text-center" data-testid="insights-page">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "var(--chip-active-bg)",
            border: "1px solid var(--border-highlight)",
          }}
        >
          <Compass size={28} className="text-violet-400" />
        </div>
        <h2
          className="font-display text-3xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          {t("insightsTitle")}
        </h2>
        <p className="text-base max-w-md mx-auto mb-2" style={{ color: "var(--text-secondary)" }}>
          {t("insightsEmpty")}
        </p>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          {t("insightsEmptyHint")}
        </p>
        <button
          onClick={onStart}
          className="mt-8 px-8 py-3 rounded-full text-sm font-semibold shadow-lg transition-transform hover:scale-105 btn-mirror-me"
        >
          {t("heroTitle")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12" data-testid="insights-page">
      {/* Page Title */}
      <div className="flex flex-col gap-1 mb-2">
        <h2
          className="font-display text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {t("insightsTitle")}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Discover multi-dimensional affect trajectories and long-term emotional themes over time.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-3xl"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center gap-2.5 text-violet-400 mb-2">
            <Sparkles size={16} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Reflections Logged
            </span>
          </div>
          <p
            className="font-display text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {entries.length}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Moments of mindful awareness
          </p>
        </div>

        <div
          className="p-5 rounded-3xl"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center gap-2.5 text-blue-400 mb-2">
            <Activity size={16} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Circumplex Orbit
            </span>
          </div>
          <p
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Serenity Zone
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Primary affect quadrant
          </p>
        </div>

        <div
          className="p-5 rounded-3xl"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center gap-2.5 text-pink-400 mb-2">
            <Heart size={16} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Primary State
            </span>
          </div>
          <p
            className="font-display text-2xl font-bold capitalize"
            style={{ color: "var(--text-primary)" }}
          >
            {themes[0] ? (t(themes[0][0].toLowerCase()) || themes[0][0]) : "Calm"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Your most frequent emotional anchor
          </p>
        </div>
      </div>

      {/* Feature 4: 2D Russell Circumplex Affect Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AffectRadarChart history={entries} />
        </div>

        {/* Emotional Landscape Area Chart Card */}
        <div
          className="lg:col-span-6 p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="font-display text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {t("emotionalLandscape")}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Evolution of emotional frequencies
              </p>
            </div>
            <span
              className="text-xs font-mono px-3 py-1 rounded-full"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              30 Days
            </span>
          </div>
          <MoodTrendChart data={trends} t={t} />
        </div>
      </div>

      {/* Recurring Themes */}
      <div
        className="p-6 md:p-8 rounded-3xl"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        <h3
          className="font-display text-xl font-semibold mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          {t("recurringThemes")}
        </h3>
        <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          Key emotional spaces you have explored recently
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map(([mood, count]) => (
            <div
              key={mood}
              className="p-4 rounded-2xl flex items-center justify-between transition-transform hover:scale-[1.02]"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <p
                  className="text-sm font-medium capitalize"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t(mood.toLowerCase()) || mood}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {count} {count === 1 ? "reflection" : "reflections"}
                </p>
              </div>
              <span className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/15 text-violet-300 font-mono text-xs font-semibold">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
