import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Brush, Mic, Lock, X, ShieldCheck, MessageSquare } from "lucide-react";
import ParticleBlob from "@/components/mood/ParticleBlob";

export const MirrorStage = ({
  t,
  isAnalyzing,
  onModeChange,
  onMirrorClick,
}) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const modalities = [
    {
      id: "text",
      testId: "orbital-write-btn",
      numeral: "I",
      label: t("tabWrite"),
      sub: "Journal & Prose",
      icon: Pen,
      accent: "var(--aura-gold)",
      ariaLabel: "Write Expression",
    },
    {
      id: "speech",
      testId: "orbital-speak-btn",
      numeral: "II",
      label: t("tabSpeak"),
      sub: "Voice Cadence",
      icon: Mic,
      accent: "var(--aura-sage)",
      ariaLabel: "Speak Expression",
    },
    {
      id: "draw",
      testId: "orbital-draw-btn",
      numeral: "III",
      label: t("tabDraw"),
      sub: "Visual Gesture",
      icon: Brush,
      accent: "var(--aura-terracotta)",
      ariaLabel: "Draw Expression",
    },
    {
      id: "talk",
      testId: "orbital-talk-btn",
      numeral: "IV",
      label: t("tabTalk"),
      sub: "Live Dialogue",
      icon: MessageSquare,
      accent: "var(--aura-sky)",
      ariaLabel: "Talk Live",
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full my-2">
      {/* Optical Resonance Mirror Sphere */}
      <div className="relative flex items-center justify-center w-[310px] h-[310px] sm:w-[350px] sm:h-[350px]">
        {/* Precision Calibration Reticle SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 360 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer fine solid calibration ring */}
          <circle
            cx="180"
            cy="180"
            r="172"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          {/* Inner dashed harmonic ring */}
          <circle
            cx="180"
            cy="180"
            r="158"
            stroke="url(#orbitalGradient)"
            strokeWidth="1.2"
            strokeDasharray="3 7"
            className="opacity-75"
          />
          {/* Cardinal axis ticks */}
          <line x1="180" y1="2" x2="180" y2="12" stroke="var(--aura-gold)" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="180" y1="348" x2="180" y2="358" stroke="var(--aura-gold)" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="2" y1="180" x2="12" y2="180" stroke="var(--aura-gold)" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="348" y1="180" x2="358" y2="180" stroke="var(--aura-gold)" strokeWidth="1.2" strokeOpacity="0.6" />
          <defs>
            <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--aura-gold)" stopOpacity="0.75" />
              <stop offset="50%" stopColor="var(--aura-terracotta)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--aura-sage)" stopOpacity="0.75" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle Warm Atmospheric Halo */}
        <div
          className="absolute inset-[-8%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(212, 163, 115, 0.16) 0%, rgba(224, 122, 95, 0.08) 45%, transparent 70%)",
            filter: "blur(28px)",
          }}
        />

        {/* Convex Optical Mirror Lens */}
        <motion.div
          onClick={onMirrorClick || (() => onModeChange("text"))}
          whileHover={{ scale: 1.018 }}
          whileTap={{ scale: 0.985 }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (onMirrorClick || (() => onModeChange("text")))();
            }
          }}
          className="relative w-[264px] h-[264px] sm:w-[292px] sm:h-[292px] rounded-full flex flex-col items-center justify-center cursor-pointer select-none group mirror-breathe"
          style={{
            background: "var(--mirror-sphere-bg)",
            boxShadow:
              "0 24px 60px rgba(0, 0, 0, 0.28), inset 0 0 40px rgba(212, 163, 115, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.35)",
            border: "1.5px solid var(--border-highlight)",
          }}
        >
          {/* Inner Particle Resonance Field */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-80 flex items-center justify-center">
            <ParticleBlob state={isAnalyzing ? "thinking" : "idle"} size={292} />
          </div>

          {/* Warm Specular Highlight Overlay */}
          <div
            className="absolute inset-2 rounded-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700"
            style={{
              background:
                "radial-gradient(ellipse at 50% 85%, rgba(212, 163, 115, 0.25) 0%, rgba(224, 122, 95, 0.1) 45%, transparent 72%)",
            }}
          />

          {/* Central Invitation Text */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-7 pointer-events-none">
            <span
              className="text-[9px] font-mono uppercase tracking-[0.22em] mb-2 px-2.5 py-0.5 rounded-full"
              style={{
                color: "var(--aura-gold)",
                background: "var(--control-bg)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {isAnalyzing ? "Calibrating Affect" : "Tap Lens to Begin"}
            </span>
            <h3
              className="font-display text-2xl sm:text-3xl font-medium tracking-tight mb-2 leading-tight"
              style={{ color: "var(--mirror-sphere-text)" }}
            >
              {isAnalyzing ? t("reflecting") : t("onYourMind")}
            </h3>
            <p
              className="text-xs font-light leading-relaxed max-w-[200px]"
              style={{ color: "var(--mirror-sphere-subtext)" }}
            >
              {t("noRightWrong")}
            </p>

            {!isAnalyzing && (
              <div className="mt-3 flex items-center justify-center">
                <span
                  className="w-[1.5px] h-4 cursor-blink"
                  style={{
                    background: "var(--aura-gold)",
                    boxShadow: "0 0 8px var(--aura-gold)",
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* Tactile 4-Modality Instrument Dock (Write, Speak, Draw, Talk)             */}
      {/* ========================================================================= */}
      <div
        className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl px-1"
        role="group"
        aria-label="Expression modalities"
      >
        {modalities.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              type="button"
              data-testid={item.testId}
              onClick={() => onModeChange(item.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label={item.ariaLabel}
              className="orbital-btn flex items-center gap-3 p-3 rounded-2xl text-left group transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: item.accent,
                }}
              >
                <Icon size={17} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="text-xs font-semibold tracking-tight truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-[9px] font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.numeral}
                  </span>
                </div>
                <p
                  className="text-[10px] font-mono truncate mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.sub}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Privacy & Epistemic Safety Indicator Badge */}
      <button
        type="button"
        onClick={() => setPrivacyOpen(true)}
        className="mt-4 flex items-center gap-2 text-[11px] font-mono px-3.5 py-1.5 rounded-full transition-all"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--border-subtle)",
          background: "var(--control-bg)",
        }}
      >
        <Lock size={11} strokeWidth={1.8} style={{ color: "var(--aura-sage)" }} />
        <span>{t("privateSecure")}</span>
      </button>

      {/* Privacy Explanation Modal */}
      <AnimatePresence>
        {privacyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(9, 10, 14, 0.72)", backdropFilter: "blur(16px)" }}
            onClick={() => setPrivacyOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 relative rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-xl"
                    style={{
                      background: "var(--control-bg)",
                      border: "1px solid var(--border-strong)",
                      color: "var(--aura-sage)",
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <h3
                    className="font-display text-xl font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t("privacyTitle")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(false)}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("privacyBody")}
              </p>
              <div
                className="p-3.5 rounded-xl text-xs space-y-1.5 font-mono"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                <p>✦ All emotional expressions remain exclusively on your device session and private archive.</p>
                <p>✦ Reflections are poetic mirrors — never clinical diagnostics or medical evaluations.</p>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(false)}
                  className="btn-mirror-me px-5 py-2 rounded-full text-xs font-medium"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
