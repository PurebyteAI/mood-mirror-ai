import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

export const TextInput = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || isAnalyzing) return;
    onAnalyze("text", text.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="glass-card p-6 md:p-8" data-testid="text-input-section">
      <textarea
        data-testid="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="How are you feeling? Write anything that comes to mind..."
        rows={5}
        className="w-full bg-transparent resize-none outline-none text-lg font-light leading-relaxed placeholder-opacity-30"
        style={{
          color: "var(--text-primary)",
          fontFamily: "'Manrope', sans-serif",
        }}
        disabled={isAnalyzing}
      />
      <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {text.length > 0 ? `${text.length} characters` : "Ctrl+Enter to submit"}
        </p>
        <motion.button
          data-testid="analyze-text-btn"
          onClick={handleSubmit}
          disabled={!text.trim() || isAnalyzing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #C084FC 0%, #60A5FA 100%)",
            color: "#030303",
          }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send size={16} strokeWidth={1.5} />
              Mirror Me
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
