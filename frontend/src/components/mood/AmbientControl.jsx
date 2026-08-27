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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: isPlaying ? "rgba(155,108,255,0.22)" : "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: isPlaying ? "#C4B5FD" : "var(--text-primary)",
          }}
          aria-label={label}
        >
          {isPlaying ? <Volume2 size={18} strokeWidth={1.5} /> : <VolumeX size={18} strokeWidth={1.5} />}
        </motion.button>
        <input
          type="range"
          min="0"
          max="40"
          value={volume}
          onChange={handleVolume}
          className="w-20"
          style={{ accentColor: "#9B6CFF" }}
        />
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
              style={{ accentColor: "var(--text-secondary)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        data-testid="ambient-toggle-btn"
        onClick={togglePlay}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isPlaying
            ? "rgba(192,132,252,0.15)"
            : "var(--control-bg)",
          border: isPlaying
            ? "1px solid rgba(192,132,252,0.3)"
            : "1px solid var(--control-border)",
          boxShadow: isPlaying ? "0 0 20px rgba(192,132,252,0.2)" : "none",
          color: isPlaying ? "#C084FC" : "var(--text-muted)",
        }}
      >
        {isPlaying ? (
          <Volume2 size={18} strokeWidth={1.5} />
        ) : (
          <VolumeX size={18} strokeWidth={1.5} />
        )}
      </motion.button>
    </div>
  );
};
