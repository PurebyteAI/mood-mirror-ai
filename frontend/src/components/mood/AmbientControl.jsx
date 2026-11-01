import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import ambientEngine from "@/ambientMusic";

export const AmbientControl = ({ mood, label, variant = "fab" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(15);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    if (isPlaying && mood) {
      ambientEngine.playMood(mood);
    }
  }, [mood, isPlaying]);

  useEffect(() => {
    return () => ambientEngine.destroy();
  }, []);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      ambientEngine.init();
      ambientEngine.setVolume(volume / 100);
      ambientEngine.playMood(mood || "calmness");
      setIsPlaying(true);
    } else {
      ambientEngine.stop();
      setIsPlaying(false);
    }
  }, [isPlaying, mood, volume]);

  const handleVolume = useCallback((e) => {
    const v = Number(e.target.value);
    setVolume(v);
    ambientEngine.setVolume(v / 100);
  }, []);

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3">
        <motion.button
          onClick={togglePlay}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: isPlaying ? "var(--chip-active-bg)" : "var(--control-bg)",
            border: isPlaying ? "1px solid var(--border-strong)" : "1px solid var(--border-subtle)",
            color: isPlaying ? "var(--aura-gold)" : "var(--text-primary)",
          }}
          aria-label={label || "Toggle ambient soundscape"}
        >
          {isPlaying ? <Volume2 size={17} strokeWidth={1.6} /> : <VolumeX size={17} strokeWidth={1.6} />}
        </motion.button>
        <input
          type="range"
          min="0"
          max="40"
          value={volume}
          onChange={handleVolume}
          className="w-24"
          style={{ accentColor: "var(--aura-gold)" }}
          aria-label="Ambient soundscape volume"
        />
      </div>
    );
  }

  if (variant === "header") {
    return (
      <div
        data-testid="ambient-control"
        className="relative flex items-center gap-1.5"
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        <button
          type="button"
          data-testid="ambient-toggle-btn"
          onClick={togglePlay}
          aria-label={label || "Ambient Soundscape"}
          title={label || "Ambient Soundscape"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: isPlaying ? "var(--chip-active-bg)" : "var(--control-bg)",
            border: isPlaying ? "1px solid var(--border-strong)" : "1px solid var(--border-subtle)",
            color: isPlaying ? "var(--aura-gold)" : "var(--text-secondary)",
          }}
        >
          {isPlaying ? (
            <Volume2 size={14} strokeWidth={1.8} />
          ) : (
            <VolumeX size={14} strokeWidth={1.6} />
          )}
          <span className="hidden lg:inline text-[11px] font-mono">
            {isPlaying ? "Audio On" : "Audio"}
          </span>
        </button>

        <AnimatePresence>
          {showSlider && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="
                absolute top-full right-0 mt-1.5 px-3 py-2 rounded-xl z-50
                flex items-center gap-2 shadow-xl
              "
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                Vol
              </span>
              <input
                data-testid="ambient-volume-slider"
                type="range"
                min="0"
                max="40"
                value={volume}
                onChange={handleVolume}
                className="w-20"
                style={{ accentColor: "var(--aura-gold)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      data-testid="ambient-control"
      className="fixed bottom-20 xl:bottom-6 right-6 z-50 flex items-center gap-2"
    >
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, x: 10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 10, width: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-full overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--control-border)",
            }}
          >
            <span className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
            <input
              data-testid="ambient-volume-slider"
              type="range"
              min="0"
              max="40"
              value={volume}
              onChange={handleVolume}
              className="w-20"
              style={{ accentColor: "var(--aura-gold)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        data-testid="ambient-toggle-btn"
        onClick={togglePlay}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isPlaying ? "var(--chip-active-bg)" : "var(--control-bg)",
          border: isPlaying ? "1px solid var(--border-strong)" : "1px solid var(--control-border)",
          color: isPlaying ? "var(--aura-gold)" : "var(--text-muted)",
        }}
      >
        {isPlaying ? (
          <Volume2 size={17} strokeWidth={1.6} />
        ) : (
          <VolumeX size={17} strokeWidth={1.6} />
        )}
      </motion.button>
    </div>
  );
};
