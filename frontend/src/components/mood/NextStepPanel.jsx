import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Compass, Palette, MessageSquare, ArrowRight, Brain } from "lucide-react";
import { BreathingModal } from "@/components/mood/BreathingModal";

export const NextStepPanel = ({
  onOpenBreathing,
  onNavigateMode,
  onStartTalk,
  onFollowUp,
  t,
}) => {
  const [activeInquiry, setActiveInquiry] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);
  const [busyId, setBusyId] = useState("");
  const inputRef = useRef(null);

  const openBreathing = () => {
    if (onOpenBreathing) onOpenBreathing();
    else setBreathingModalOpen(true);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    const question = inquiryText.trim();
    if (!question) return;
    if (!onFollowUp) {
      setInquiryError(t("followUpError"));
      return;
    }
    setInquiryError("");
    setBusyId("explore");
    onFollowUp(question);
  };

  const handleScrollToReframer = () => {
    const el = document.getElementById("cognitive-reframer-section");
    if (!el) {
      setInquiryError(t("reframeError"));
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("reframer-flash");
    window.requestAnimationFrame(() => el.classList.add("reframer-flash"));
  };

  const steps = [
    {
      id: "release",
      icon: Wind,
      accent: "var(--aura-sage)",
      badge: t("stepRelease"),
      title: t("stepReleaseTitle"),
      desc: t("stepReleaseDesc"),
      action: openBreathing,
    },
    {
      id: "explore",
      icon: Compass,
      accent: "var(--aura-gold)",
      badge: t("stepExplore"),
      title: t("stepExploreTitle"),
      desc: t("stepExploreDesc"),
      action: () => {
        setActiveInquiry((open) => !open);
        setInquiryError("");
        setTimeout(() => inputRef.current?.focus(), 150);
      },
    },
    {
      id: "reframe",
      icon: Brain,
      accent: "var(--aura-sky)",
      badge: t("stepReframe"),
      title: t("stepReframeTitle"),
      desc: t("stepReframeDesc"),
      action: handleScrollToReframer,
    },
    {
      id: "create",
      icon: Palette,
      accent: "var(--aura-terracotta)",
      badge: t("stepCreate"),
      title: t("stepCreateTitle"),
      desc: t("stepCreateDesc"),
      action: () => onNavigateMode && onNavigateMode("draw"),
    },
    {
      id: "talk",
      icon: MessageSquare,
      accent: "var(--aura-violet)",
      badge: t("stepTalk"),
      title: t("stepTalkTitle"),
      desc: t("stepTalkDesc"),
      action: () => onStartTalk && onStartTalk(),
    },
  ];

  return (
    <>
      <div data-testid="next-step-panel" className="glass-card p-5 sm:p-6 rounded-2xl">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Compass size={15} style={{ color: "var(--aura-gold)" }} />
            <h4
              className="font-display text-lg font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("needNow")}
            </h4>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t("needNowHint")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = step.id === "explore" && activeInquiry;
            return (
              <motion.button
                key={step.id}
                type="button"
                data-testid={`next-step-${step.id}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={step.action}
                className="text-left p-4 rounded-xl transition-all duration-200 flex flex-col justify-between min-h-[148px]"
                style={{
                  background: active ? "var(--chip-active-bg)" : "var(--control-bg)",
                  border: active
                    ? "1px solid var(--border-strong)"
                    : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded"
                      style={{
                        color: step.accent,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {step.badge}
                    </span>
                    <Icon size={15} style={{ color: step.accent }} />
                  </div>
                  <h5 className="font-display text-base font-medium mb-1">{step.title}</h5>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.desc}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 mt-3 text-[11px] font-mono font-medium"
                  style={{ color: step.accent }}
                >
                  <span>{busyId === step.id ? t("opening") : t("start")}</span>
                  <ArrowRight size={12} />
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {activeInquiry && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleInquirySubmit}
              className="mt-4 pt-4 overflow-hidden"
              style={{ borderTop: "1px solid var(--divider-subtle)" }}
            >
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
                htmlFor="follow-up-inquiry"
              >
                {t("followUpLabel")}
              </label>
              <div className="flex gap-2">
                <input
                  id="follow-up-inquiry"
                  ref={inputRef}
                  type="text"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder={t("followUpPlaceholder")}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs focus:outline-none"
                  style={{
                    background: "var(--control-bg)",
                    border: "1px solid var(--control-border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="submit"
                  data-testid="follow-up-submit"
                  disabled={!inquiryText.trim()}
                  className="btn-mirror-me px-5 py-2.5 rounded-xl text-xs font-semibold"
                >
                  {t("followUpReflect")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        {inquiryError && (
          <p className="text-[11px] mt-2" style={{ color: "var(--aura-terracotta)" }}>
            {inquiryError}
          </p>
        )}
      </div>

      {!onOpenBreathing && (
        <BreathingModal
          isOpen={breathingModalOpen}
          onClose={() => setBreathingModalOpen(false)}
          t={t}
        />
      )}
    </>
  );
};

export default NextStepPanel;
