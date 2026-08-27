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

  return (
    <div className="relative flex flex-col items-center justify-center w-full my-4">
      {/* Central Emotional Mirror with Orbital Buttons Container */}
      <div className="relative flex items-center justify-center w-[360px] h-[360px] md:w-[440px] md:h-[440px]">
        
        {/* Orbital Track Curved Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 440 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="220"
            cy="220"
            r="176"
            stroke="url(#orbitalGradient)"
            strokeWidth="1.6"
            strokeDasharray="5 7"
            className="opacity-60"
          />
          <defs>
            <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9B6CFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#66B7FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFB39C" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Outer Aura Glow */}
        <div
          className="absolute inset-[-12%] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(140, 99, 255, 0.28) 0%, rgba(102, 183, 255, 0.12) 45%, transparent 70%)",
            filter: "blur(32px)",
          }}
        />

        {/* The Living Glass Sphere Mirror */}
        <motion.div
          onClick={onMirrorClick || (() => onModeChange("text"))}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full flex flex-col items-center justify-center cursor-pointer select-none group mirror-breathe"
          style={{
            background: "var(--mirror-sphere-bg)",
            boxShadow: "0 0 60px rgba(155, 108, 255, 0.25), inset 0 0 35px rgba(155, 108, 255, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            border: "1.5px solid var(--border-highlight)",
          }}
        >
          {/* Inner Particle Ribbon Field */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-85">
            <ParticleBlob state={isAnalyzing ? "thinking" : "idle"} size={320} />
          </div>

          {/* Cosmic Light Ribbon Overlay */}
          <div
            className="absolute inset-2 rounded-full pointer-events-none opacity-35 group-hover:opacity-55 transition-opacity duration-700"
            style={{
              background: "radial-gradient(ellipse at bottom, rgba(255, 179, 156, 0.3) 0%, rgba(101, 120, 255, 0.15) 40%, transparent 70%)",
            }}
          />

          {/* Central Invitation Text */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
            <h3
              className="font-display text-2xl md:text-3xl font-medium tracking-wide mb-2"
              style={{ color: "var(--mirror-sphere-text)" }}
            >
              {isAnalyzing ? t("reflecting") : t("onYourMind")}
            </h3>
            <p
              className="text-xs md:text-sm font-light leading-relaxed max-w-[210px]"
              style={{ color: "var(--mirror-sphere-subtext)" }}
            >
              {t("noRightWrong")}
            </p>
            
            {!isAnalyzing && (
              <div className="mt-3 flex items-center justify-center">
                <span className="w-[2px] h-5 bg-violet-400 cursor-blink shadow-[0_0_10px_#9B6CFF]" />
              </div>
            )}
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* Orbital Action Buttons (Write, Speak, Draw, Talk) */}
        {/* ========================================================================= */}

        {/* 1. WRITE BUTTON (Left) */}
        <div
          className="absolute left-1 md:left-2 top-[44%] -translate-y-12 z-20 flex flex-col items-center gap-1.5"
        >
          <motion.button
            data-testid="orbital-write-btn"
            onClick={() => onModeChange("text")}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="orbital-btn w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center"
            style={{
              boxShadow: "0 0 20px rgba(155, 108, 255, 0.3)",
            }}
            aria-label="Write Expression"
          >
            <Pen
              size={19}
              strokeWidth={1.8}
              className="text-violet-500 dark:text-violet-300"
            />
          </motion.button>
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {t("tabWrite")}
          </span>
        </div>

        {/* 2. SPEAK BUTTON (Bottom Center-Left) */}
        <div
          className="absolute left-10 md:left-14 bottom-2 md:bottom-3 z-20 flex flex-col items-center gap-1.5"
        >
          <motion.button
            data-testid="orbital-speak-btn"
            onClick={() => onModeChange("speech")}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="orbital-btn w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center"
            style={{
              boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)",
            }}
            aria-label="Speak Expression"
          >
            <Mic
              size={19}
              strokeWidth={1.8}
              className="text-emerald-500 dark:text-emerald-300"
            />
          </motion.button>
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {t("tabSpeak")}
          </span>
        </div>

        {/* 3. DRAW BUTTON (Right) */}
        <div
          className="absolute right-1 md:right-2 top-[44%] -translate-y-12 z-20 flex flex-col items-center gap-1.5"
        >
          <motion.button
            data-testid="orbital-draw-btn"
            onClick={() => onModeChange("draw")}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="orbital-btn w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center"
            style={{
              boxShadow: "0 0 20px rgba(255, 179, 156, 0.3)",
            }}
            aria-label="Draw Expression"
          >
            <Brush
              size={19}
              strokeWidth={1.8}
              className="text-pink-500 dark:text-pink-300"
            />
          </motion.button>
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {t("tabDraw")}
          </span>
        </div>

        {/* 4. TALK BUTTON (Bottom Center-Right) */}
        <div
          className="absolute right-10 md:right-14 bottom-2 md:bottom-3 z-20 flex flex-col items-center gap-1.5"
        >
          <motion.button
            data-testid="orbital-talk-btn"
            onClick={() => onModeChange("talk")}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="orbital-btn w-13 h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center"
            style={{
              boxShadow: "0 0 20px rgba(102, 183, 255, 0.3)",
            }}
            aria-label="Talk Live"
          >
            <MessageSquare
              size={19}
              strokeWidth={1.8}
              className="text-blue-500 dark:text-blue-300"
            />
          </motion.button>
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {t("tabTalk")}
          </span>
        </div>

      </div>

      {/* Privacy Indicator Badge */}
      <button
        onClick={() => setPrivacyOpen(true)}
        className="mt-6 flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/5"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--border-subtle)",
          background: "var(--control-bg)",
        }}
      >
        <Lock size={12} strokeWidth={1.8} className="text-violet-500 dark:text-violet-400" />
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
            style={{ background: "rgba(2,8,23,0.75)", backdropFilter: "blur(16px)" }}
            onClick={() => setPrivacyOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 relative rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-full bg-violet-500/15 text-violet-400">
                    <ShieldCheck size={18} />
                  </div>
                  <h3
                    className="font-display text-xl font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t("privacyTitle")}
                  </h3>
                </div>
                <button
                  onClick={() => setPrivacyOpen(false)}
                  className="p-1 rounded-full text-white/50 hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("privacyBody")}
              </p>
              <div
                className="p-3.5 rounded-2xl text-xs space-y-1.5"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                }}
              >
                <p>✦ All emotional expressions remain exclusively on your device session and private database.</p>
                <p>✦ Reflections are poetic reflections — never clinical diagnostics or therapeutic evaluations.</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setPrivacyOpen(false)}
                  className="btn-mirror-me px-6 py-2 rounded-full text-xs font-medium"
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
