import React from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";

export const Header = ({ onToggleHistory, showHistory }) => {
  return (
    <motion.header
      data-testid="app-header"
      className="flex items-center justify-between py-4 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #C084FC 0%, #60A5FA 100%)",
          }}
        >
          <Sparkles size={18} strokeWidth={1.5} color="#030303" />
        </div>
        <div>
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
      </div>

      <button
        data-testid="toggle-history-btn"
        onClick={onToggleHistory}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: showHistory ? "rgba(255,255,255,0.1)" : "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--text-secondary)",
        }}
      >
        <Clock size={16} strokeWidth={1.5} />
        {showHistory ? "Back to Mirror" : "History"}
      </button>
    </motion.header>
  );
};
