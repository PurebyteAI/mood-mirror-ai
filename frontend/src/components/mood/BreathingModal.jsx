import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind, Volume2, VolumeX, CheckCircle2 } from "lucide-react";

const BREATH_MODES = {
  box: {
    id: "box",
    name: "Box Breathing",
    description: "4s Inhale · 4s Hold · 4s Exhale · 4s Rest",
    phases: [
      { name: "Inhale", duration: 4, text: "Breathe in slowly...", scale: 1.35, color: "#66B7FF" },
      { name: "Hold", duration: 4, text: "Hold gently...", scale: 1.35, color: "#9B6CFF" },
      { name: "Exhale", duration: 4, text: "Release with ease...", scale: 0.9, color: "#FFB39C" },
      { name: "Rest", duration: 4, text: "Rest in the quiet...", scale: 0.9, color: "#6578FF" },
    ],
  },
  relax: {
    id: "relax",
    name: "4-7-8 Deep Calm",
    description: "4s Inhale · 7s Hold · 8s Exhale",
    phases: [
      { name: "Inhale", duration: 4, text: "Inhale peace...", scale: 1.4, color: "#66B7FF" },
      { name: "Hold", duration: 7, text: "Hold the stillness...", scale: 1.4, color: "#9B6CFF" },
      { name: "Exhale", duration: 8, text: "Let everything go...", scale: 0.85, color: "#FFB39C" },
    ],
  },
};

export const BreathingModal = ({ isOpen, onClose, t }) => {
  const [modeKey, setModeKey] = useState("box");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioContextRef = useRef(null);

  const currentMode = BREATH_MODES[modeKey] || BREATH_MODES.box;
  const currentPhase = currentMode.phases[phaseIndex];

  // Gentle ambient chime synthesizer
  const playGentleTone = (freq = 432) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    } catch {
      // Ignore audio policy errors
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPhaseIndex(0);
      setSecondsLeft(currentMode.phases[0].duration);
      setCyclesCompleted(0);
      setIsCompleted(false);
      return;
    }

    playGentleTone(432);
    setSecondsLeft(currentPhase.duration);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseIndex + 1) % currentMode.phases.length;
          if (nextIndex === 0) {
            setCyclesCompleted((c) => {
              const newCount = c + 1;
              if (newCount >= 4) {
                setIsCompleted(true);
              }
              return newCount;
            });
          }
          setPhaseIndex(nextIndex);
          playGentleTone(nextIndex === 0 ? 528 : nextIndex === 2 ? 396 : 432);
          return currentMode.phases[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phaseIndex, modeKey]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
        style={{
          background: "rgba(2, 8, 23, 0.85)",
          backdropFilter: "blur(24px)",
        }}
        onClick={onClose}
      >
        <motion.div
          data-testid="breathing-modal"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative w-full max-w-lg rounded-3xl p-6 md:p-10 text-center overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(12, 23, 48, 0.95), rgba(7, 17, 38, 0.98))",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 0 80px rgba(101, 120, 255, 0.25)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Background Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${currentPhase.color}22 0%, transparent 65%)`,
              transition: "background 1.5s ease",
            }}
          />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Wind size={16} style={{ color: currentPhase.color }} />
              </span>
              <span className="text-xs uppercase font-mono tracking-wider" style={{ color: "var(--text-muted)" }}>
                Mindfulness Breathing
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: soundEnabled ? "var(--text-primary)" : "var(--text-muted)",
                }}
                aria-label="Toggle Sound"
                title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Breathing Mode Selector */}
          <div className="relative z-10 inline-flex p-1 rounded-full mb-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {Object.values(BREATH_MODES).map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setModeKey(mode.id);
                  setPhaseIndex(0);
                  setSecondsLeft(mode.phases[0].duration);
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: modeKey === mode.id ? "rgba(155,108,255,0.25)" : "transparent",
                  color: modeKey === mode.id ? "#F7F7FF" : "var(--text-muted)",
                  border: modeKey === mode.id ? "1px solid rgba(155,108,255,0.4)" : "1px solid transparent",
                }}
              >
                {mode.name}
              </button>
            ))}
          </div>

          {/* Main Breathing Orb */}
          <div className="relative z-10 flex items-center justify-center my-6 h-56">
            <motion.div
              animate={{
                scale: currentPhase.scale * 1.3,
                opacity: [0.2, 0.45, 0.2],
              }}
              transition={{
                duration: currentPhase.duration,
                ease: "easeInOut",
              }}
              className="absolute w-44 h-44 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${currentPhase.color}35 0%, transparent 70%)`,
                filter: "blur(24px)",
              }}
            />

            <motion.div
              animate={{
                scale: currentPhase.scale,
              }}
              transition={{
                duration: currentPhase.duration,
                ease: "easeInOut",
              }}
              className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center"
              style={{
                background: `radial-gradient(circle at 35% 30%, #FFB49D, ${currentPhase.color} 50%, #071126 100%)`,
                boxShadow: `0 0 50px ${currentPhase.color}55, inset 0 0 20px rgba(255,255,255,0.3)`,
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <span className="font-display text-3xl font-semibold text-white">
                {secondsLeft}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/80">
                {currentPhase.name}
              </span>
            </motion.div>
          </div>

          {/* Phase Guidance Text */}
          <div className="relative z-10 my-4">
            <h3
              className="font-display text-2xl md:text-3xl font-bold mb-2 transition-colors duration-700"
              style={{ color: "#F7F7FF" }}
            >
              {currentPhase.text}
            </h3>
            <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              Cycle {cyclesCompleted + 1} of 4 · {currentMode.description}
            </p>
          </div>

          {/* Completion check */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 mt-6 p-4 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: "rgba(52, 211, 153, 0.12)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
              }}
            >
              <CheckCircle2 size={18} className="text-emerald-400" />
              <p className="text-sm font-medium text-emerald-300">
                You've centered your mind. Return whenever you need a moment.
              </p>
            </motion.div>
          )}

          {/* Footer Action */}
          <div className="relative z-10 mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full text-sm font-medium transition-all"
              style={{
                background: "var(--gradient-primary)",
                color: "#F7F7FF",
                boxShadow: "0 0 28px rgba(155, 108, 255, 0.35)",
              }}
            >
              Done Reflecting
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
