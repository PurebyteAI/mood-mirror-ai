import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind, Volume2, VolumeX, CheckCircle2 } from "lucide-react";

const BREATH_MODES = {
  box: {
    id: "box",
    nameKey: "breathBox",
    descriptionKey: "breathBoxDesc",
    phases: [
      { nameKey: "breathInhale", duration: 4, textKey: "breathInSlow", scale: 1.32, color: "#81B29A" },
      { nameKey: "breathHold", duration: 4, textKey: "breathHoldGentle", scale: 1.32, color: "#D4A373" },
      { nameKey: "breathExhale", duration: 4, textKey: "breathReleaseEase", scale: 0.9, color: "#E07A5F" },
      { nameKey: "breathRest", duration: 4, textKey: "breathRestQuiet", scale: 0.9, color: "#7CA1C4" },
    ],
  },
  relax: {
    id: "relax",
    nameKey: "breathRelax",
    descriptionKey: "breathRelaxDesc",
    phases: [
      { nameKey: "breathInhale", duration: 4, textKey: "breathInPeace", scale: 1.36, color: "#81B29A" },
      { nameKey: "breathHold", duration: 7, textKey: "breathHoldStill", scale: 1.36, color: "#D4A373" },
      { nameKey: "breathExhale", duration: 8, textKey: "breathLetGo", scale: 0.85, color: "#E07A5F" },
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

    return () => clearInterval(timer);
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
          background: "rgba(9, 10, 14, 0.78)",
          backdropFilter: "blur(24px)",
        }}
        onClick={onClose}
      >
        <motion.div
          data-testid="breathing-modal"
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative w-full max-w-lg rounded-3xl p-6 md:p-10 text-center overflow-hidden"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--card-glass-shadow)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Background Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${currentPhase.color}25 0%, transparent 65%)`,
              transition: "background 1.5s ease",
            }}
          />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span
                className="p-2 rounded-full"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Wind size={15} style={{ color: currentPhase.color }} />
              </span>
              <span
                className="text-xs uppercase font-mono tracking-[0.16em]"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("breathTitle")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full transition-colors"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: soundEnabled ? "var(--aura-gold)" : "var(--text-muted)",
                }}
                aria-label={t("toggleSound")}
                title={soundEnabled ? t("muteCues") : t("enableCues")}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
                aria-label={t("close")}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Breathing Mode Selector */}
          <div
            className="relative z-10 inline-flex p-1 rounded-full mb-8"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {Object.values(BREATH_MODES).map((mode) => (
              <button
                type="button"
                key={mode.id}
                onClick={() => {
                  setModeKey(mode.id);
                  setPhaseIndex(0);
                  setSecondsLeft(mode.phases[0].duration);
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: modeKey === mode.id ? "var(--chip-active-bg)" : "transparent",
                  color: modeKey === mode.id ? "var(--text-primary)" : "var(--text-muted)",
                  border:
                    modeKey === mode.id
                      ? "1px solid var(--border-strong)"
                      : "1px solid transparent",
                }}
              >
                {t(mode.nameKey)}
              </button>
            ))}
          </div>

          {/* Main Breathing Orb */}
          <div className="relative z-10 flex items-center justify-center my-6 h-56">
            <motion.div
              animate={{
                scale: currentPhase.scale * 1.25,
                opacity: [0.22, 0.45, 0.22],
              }}
              transition={{
                duration: currentPhase.duration,
                ease: "easeInOut",
              }}
              className="absolute w-44 h-44 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${currentPhase.color}38 0%, transparent 70%)`,
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
                background: `radial-gradient(circle at 35% 30%, #F2CC8F, ${currentPhase.color} 55%, #1A1D26 100%)`,
                boxShadow: `0 0 46px ${currentPhase.color}50, inset 0 0 20px rgba(255,255,255,0.3)`,
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              <span className="font-display text-3xl font-semibold text-white">
                {secondsLeft}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/90">
                {t(currentPhase.nameKey)}
              </span>
            </motion.div>
          </div>

          {/* Phase Guidance Text */}
          <div className="relative z-10 my-4">
            <h3
              className="font-display text-2xl md:text-3xl font-medium mb-2 transition-colors duration-700"
              style={{ color: "var(--text-primary)" }}
            >
              {t(currentPhase.textKey)}
            </h3>
            <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {t("breathCycle").replace("{n}", String(cyclesCompleted + 1))} ·{" "}
              {t(currentMode.descriptionKey)}
            </p>
          </div>

          {/* Completion check */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 mt-6 p-4 rounded-xl flex items-center justify-center gap-2"
              style={{
                background: "var(--chip-active-bg)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <CheckCircle2 size={18} style={{ color: "var(--aura-sage)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--aura-sage)" }}>
                {t("breathDone")}
              </p>
            </motion.div>
          )}

          {/* Footer Action */}
          <div className="relative z-10 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn-mirror-me px-8 py-3 rounded-full text-sm font-semibold transition-all"
            >
              {t("breathFinish")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
