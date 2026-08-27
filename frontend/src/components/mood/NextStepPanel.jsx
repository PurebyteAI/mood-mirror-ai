import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Compass, Sparkles, Palette, MessageSquare, ArrowRight, Check, HelpCircle } from "lucide-react";
import { BreathingModal } from "@/components/mood/BreathingModal";

export const NextStepPanel = ({
  dominantMood = "calmness",
  onOpenBreathing,
  onNavigateMode,
  onStartTalk,
  t,
}) => {
  const [activeInquiry, setActiveInquiry] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [inquirySaved, setInquirySaved] = useState(false);
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySaved(true);
    setTimeout(() => {
      setInquirySaved(false);
      setActiveInquiry(false);
      setInquiryText("");
    }, 2000);
  };

  const steps = [
    {
      id: "release",
      icon: Wind,
      badge: "Release",
      title: "Let it out",
      desc: "A short 4-7-8 guided breathing and grounding pause.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      accent: "text-cyan-300",
      action: () => (onOpenBreathing ? onOpenBreathing() : setBreathingModalOpen(true)),
    },
    {
      id: "explore",
      icon: Compass,
      badge: "Explore",
      title: "Understand it",
      desc: "What part of today is still sitting with you?",
      gradient: "from-violet-500/20 to-purple-500/20",
      border: "border-violet-500/30",
      accent: "text-violet-300",
      action: () => setActiveInquiry(!activeInquiry),
    },
    {
      id: "create",
      icon: Palette,
      badge: "Create",
      title: "Express it",
      desc: "Channel this emotional frequency into the drawing canvas.",
      gradient: "from-pink-500/20 to-rose-500/20",
      border: "border-pink-500/30",
      accent: "text-pink-300",
      action: () => onNavigateMode && onNavigateMode("drawing"),
    },
    {
      id: "talk",
      icon: MessageSquare,
      badge: "Talk",
      title: "Talk about it",
      desc: "Converse gently with your live voice AI companion.",
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30",
      accent: "text-amber-300",
      action: () => onStartTalk && onStartTalk(),
    },
  ];

  return (
    <>
      <div
        data-testid="next-step-panel"
        className="mt-6 rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all"
        style={{
          background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
          border: "1px solid rgba(155, 108, 255, 0.25)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(155, 108, 255, 0.08)",
        }}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-violet-400" />
            <h4 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
              What do you need right now?
            </h4>
          </div>
          <p className="text-xs text-white/50">
            Mood Mirror is not just analysis — choose a gentle direction for your next step.
          </p>
        </div>

        {/* 4 Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.button
                key={step.id}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={step.action}
                className={`text-left p-4 rounded-2xl bg-gradient-to-br ${step.gradient} border ${step.border} transition-all duration-200 flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-black/40 ${step.accent} border border-white/10`}>
                      {step.badge}
                    </span>
                    <Icon size={16} className={`${step.accent} group-hover:rotate-6 transition-transform`} />
                  </div>
                  <h5 className="font-display text-sm font-bold text-white mb-1">
                    {step.title}
                  </h5>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-white/80 group-hover:text-white transition-colors">
                  <span>Start</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Inline Interactive Inquiry Dropdown */}
        <AnimatePresence>
          {activeInquiry && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleInquirySubmit}
              className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
            >
              <label className="block text-xs font-medium text-violet-200 mb-2">
                🪞 What part of today is still lingering or sitting with you?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="e.g., The feeling of rush during the team review..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-violet-500/30 text-xs text-white placeholder-white/40 focus:outline-none focus:border-violet-400"
                />
                <button
                  type="submit"
                  disabled={!inquiryText.trim() || inquirySaved}
                  className="btn-mirror-me px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {inquirySaved ? <Check size={14} /> : <span>Record</span>}
                </button>
              </div>
              {inquirySaved && (
                <p className="text-[11px] text-emerald-300 mt-2">
                  ✓ Recorded into your private reflective stream.
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Internal Breathing Modal */}
      <BreathingModal
        isOpen={breathingModalOpen}
        onClose={() => setBreathingModalOpen(false)}
        t={t}
      />
    </>
  );
};

export default NextStepPanel;
