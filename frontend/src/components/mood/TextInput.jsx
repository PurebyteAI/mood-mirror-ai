import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Smile, Sparkles, Type, ShieldCheck, ArrowRight } from "lucide-react";

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
    setText((prev) => prev + " " + emoji);
    setEmojiPickerOpen(false);
  };

  const MOOD_EMOJIS = ["🌿", "🌊", "✨", "😌", "💭", "🌧️", "☀️", "🌙", "🔥", "💫"];

  return (
    <div className="space-y-6 w-full" data-testid="text-input-section">
      {/* Main Glass Workspace Card */}
      <div
        className="relative rounded-3xl p-6 md:p-8 transition-all duration-300"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        {/* Spacious Textarea */}
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
            fontFamily: "'Manrope', sans-serif",
            color: "var(--text-primary)",
          }}
          disabled={isAnalyzing}
        />

        {/* Toolbar Inside Textarea (Emojis, Type, Sparkle, Char Counter) */}
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <div className="flex items-center gap-2 relative">
            {/* Emoji Button */}
            <button
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              className="p-2 rounded-xl transition-all hover:scale-105"
              style={{
                color: "var(--text-secondary)",
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
              }}
              title="Add mood emoji"
              aria-label="Add emoji"
            >
              <Smile size={18} />
            </button>

            {/* Emoji Quick Picker Popup */}
            <AnimatePresence>
              {emojiPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-12 left-0 z-30 flex items-center gap-1.5 p-2 rounded-2xl shadow-2xl"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-highlight)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {MOOD_EMOJIS.map((emoji) => (
                    <button
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
                onClick={() => setText("")}
                className="p-2 rounded-xl text-xs transition-all hover:scale-105"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
                title="Clear text"
              >
                <Type size={16} />
              </button>
            )}

            {/* Sparkle Inspiration */}
            <button
              onClick={() => onPickPrompt && onPickPrompt("If my mood could speak right now, it would say...")}
              className="p-2 rounded-xl transition-all hover:scale-105 text-violet-500 dark:text-violet-400"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
              }}
              title="Inspiration prompt"
            >
              <Sparkles size={16} />
            </button>
          </div>

          <div
            className="text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {text.length}/1000
          </div>
        </div>

        {/* Bottom Submission Action Bar */}
        <div
          className="flex items-center justify-between mt-5 pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <p
            className="text-xs font-light hidden sm:block"
            style={{ color: "var(--text-muted)" }}
          >
            {t("ctrlEnter")}
          </p>

          <motion.button
            data-testid="analyze-text-btn"
            onClick={handleSubmit}
            disabled={!text.trim() || isAnalyzing}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-mirror-me ml-auto flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("analyzing")}</span>
              </>
            ) : (
              <>
                <span>{t("mirrorMe")}</span>
                <Sparkles size={15} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Bottom Info Bar: "How it works" + "Your safe space" card */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 items-stretch">
        {/* How It Works 3-Step Pill Card */}
        <div
          className="p-4 rounded-2xl flex flex-col justify-between"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-violet-500 dark:text-violet-400" />
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              How it works
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-violet-500 dark:text-violet-300">1. Express</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Write, draw, or speak what's on your mind.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-300">2. Reflect</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Our AI mirror uncovers your emotional patterns.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-pink-500 dark:text-pink-300">3. Understand</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Gain insights and clarity about yourself.
              </p>
            </div>
          </div>
        </div>

        {/* Your Safe Space Privacy Card */}
        <div
          className="p-4 rounded-2xl flex flex-col justify-between"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Your safe space
              </span>
            </div>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Everything you share is private, secure, and never shared.
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-medium text-violet-500 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer">
              Learn more <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
