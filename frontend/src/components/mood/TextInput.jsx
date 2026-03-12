import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

export const TextInput = ({ onAnalyze, isAnalyzing, t }) => {
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
        placeholder={t("textPlaceholder")}
        rows={5}
        className="w-full bg-transparent resize-none outline-none text-lg font-light leading-relaxed placeholder-opacity-30"
        style={{
          color: "var(--text-primary)",
          fontFamily: "'Manrope', sans-serif",
        }}
        disabled={isAnalyzing}
      />
      <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--divider-subtle)" }}>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {text.length > 0 ? `${text.length} ${t("characters")}` : t("ctrlEnter")}
        </p>
        <motion.button
          data-testid="analyze-text-btn"
          onClick={handleSubmit}
          disabled={!text.trim() || isAnalyzing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "var(--gradient-primary)",
            color: "var(--gradient-button-text)",
          }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <Send size={16} strokeWidth={1.5} />
              {t("mirrorMe")}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
