import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Smile, Feather, RotateCcw, ArrowUpRight, Compass } from "lucide-react";

const SEED_PROMPTS = [
  "If my mood could speak right now, it would say...",
  "Beneath the surface of today's routine, I am carrying...",
  "A small moment that shifted my energy today was...",
];

export const TextInput = ({ onAnalyze, isAnalyzing, t, seedText = "", onPickPrompt }) => {
  const [text, setText] = useState(seedText);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    if (seedText) setText(seedText);
  }, [seedText]);

  const handleSubmit = () => {
    if (!text.trim() || isAnalyzing) return;
    onAnalyze("text", text.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => (prev ? `${prev} ${emoji}` : emoji));
    setEmojiPickerOpen(false);
  };

  const MOOD_EMOJIS = ["🌿", "🌊", "✨", "😌", "💭", "🌧️", "☀️", "🌙", "🔥", "🕊️"];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4 w-full" data-testid="text-input-section">
      {/* Main Editorial Notebook Card */}
      <div
        className="relative rounded-2xl p-6 md:p-8 transition-all duration-300"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        {/* Notebook Folio Header */}
        <div
          className="flex items-center justify-between pb-3.5 mb-4 border-b"
          style={{ borderColor: "var(--divider-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Feather size={13} style={{ color: "var(--aura-gold)" }} />
            <span
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              Folio Entry // Written Reflection
            </span>
          </div>
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {wordCount} {wordCount === 1 ? "word" : "words"} · {text.length}/1000
          </span>
        </div>

        {/* Spacious Editorial Textarea */}
        <textarea
          data-testid="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("textPlaceholder")}
          rows={7}
          maxLength={1000}
          className="w-full bg-transparent resize-none outline-none text-base md:text-lg font-light leading-relaxed transition-colors"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "var(--text-primary)",
          }}
          disabled={isAnalyzing}
        />

        {/* Quick Inquiry Seeds */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span
            className="text-[10px] font-mono uppercase tracking-wider mr-1 flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            <Compass size={11} style={{ color: "var(--aura-gold)" }} />
            Seeds:
          </span>
          {SEED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setText(prompt);
                if (onPickPrompt) onPickPrompt(prompt);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full transition-colors truncate max-w-[260px]"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Action & Instrument Bar */}
        <div
          className="flex items-center justify-between flex-wrap gap-3 mt-5 pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <div className="flex items-center gap-2 relative">
            {/* Tone Marker Button */}
            <button
              type="button"
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition-all"
              style={{
                color: "var(--text-secondary)",
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
              }}
              title="Add mood symbol"
              aria-label="Add emoji"
            >
              <Smile size={15} />
              <span className="text-[11px] font-mono hidden sm:inline">Symbol</span>
            </button>

            {/* Emoji Quick Picker Popup */}
            <AnimatePresence>
              {emojiPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute bottom-11 left-0 z-30 flex items-center gap-1.5 p-2 rounded-xl shadow-2xl"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-strong)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {MOOD_EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="p-1.5 text-base hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clear Text button if text exists */}
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => setText("")}
                className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs transition-all"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
                title="Clear text"
              >
                <RotateCcw size={13} />
                <span className="text-[11px] font-mono">Clear</span>
              </button>
            )}

            <span
              className="text-[11px] font-mono hidden md:inline ml-2"
              style={{ color: "var(--text-muted)" }}
            >
              {t("ctrlEnter")}
            </span>
          </div>

          <motion.button
            type="button"
            data-testid="analyze-text-btn"
            onClick={handleSubmit}
            disabled={!text.trim() || isAnalyzing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-mirror-me ml-auto flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("analyzing")}</span>
              </>
            ) : (
              <>
                <span>{t("mirrorMe")}</span>
                <ArrowUpRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
