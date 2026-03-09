import React from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles, BookOpen } from "lucide-react";

export const Header = ({ currentView, onNav }) => {
  return (
    <motion.header
      data-testid="app-header"
      className="flex items-center justify-between py-4 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => onNav("mirror")}
        className="flex items-center gap-3 group"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #C084FC 0%, #60A5FA 100%)",
          }}
        >
          <Sparkles size={18} strokeWidth={1.5} color="#030303" />
        </div>
        <div className="text-left">
          <h1
            data-testid="app-title"
            className="font-display text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Mood Mirror
          </h1>
          <p
            className="text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            AI-Powered Emotion Analysis
          </p>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button
          data-testid="nav-journal-btn"
          onClick={() => onNav(currentView === "journal" ? "mirror" : "journal")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: currentView === "journal" ? "rgba(255,255,255,0.1)" : "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: currentView === "journal" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          <BookOpen size={16} strokeWidth={1.5} />
          Journal
        </button>

        <button
          data-testid="toggle-history-btn"
          onClick={() => onNav(currentView === "history" ? "mirror" : "history")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: currentView === "history" ? "rgba(255,255,255,0.1)" : "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: currentView === "history" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          <Clock size={16} strokeWidth={1.5} />
          History
        </button>
      </div>
    </motion.header>
  );
};
