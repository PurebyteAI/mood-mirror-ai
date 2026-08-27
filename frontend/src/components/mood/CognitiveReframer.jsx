import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronRight, CheckCircle2, HeartHandshake, Compass } from "lucide-react";

export const CognitiveReframer = ({ cognitiveData }) => {
  const [activePromptIdx, setActivePromptIdx] = useState(0);

  if (!cognitiveData) return null;

  const {
    distortion_detected = "Cognitive Tension",
    explanation = "Your mind is currently holding high internal pressure.",
    reframing_prompts = [],
    grounding_affirmation = "You are permitted to pause and breathe.",
  } = cognitiveData;

  return (
    <div
      data-testid="cognitive-reframer-card"
      className="rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all space-y-4"
      style={{
        background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
        border: "1px solid rgba(102, 183, 255, 0.25)",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(102, 183, 255, 0.1)",
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Compass size={16} />
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Cognitive Reframing</span>
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                CBT Insight
              </span>
            </h4>
            <p className="text-[11px] text-white/50">
              Gentle psychological perspective shifts to unhook from cognitive overload.
            </p>
          </div>
        </div>

        {/* Distortion Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/25 text-blue-300">
          <Brain size={13} />
          <span>{distortion_detected}</span>
        </div>
      </div>

      {/* Explanation Box */}
      <div
        className="p-3.5 rounded-2xl text-xs leading-relaxed text-white/80 border border-white/5"
        style={{ background: "rgba(0, 0, 0, 0.25)" }}
      >
        <span className="font-semibold text-blue-300">Mind Pattern: </span>
        <span>{explanation}</span>
      </div>

      {/* Interactive Reframing Prompts */}
      {reframing_prompts.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <span className="text-xs font-mono font-semibold uppercase text-blue-300 tracking-wider block">
            Gentle Perspective Shift Inquiries
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {reframing_prompts.map((prompt, idx) => {
              const isActive = activePromptIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePromptIdx(idx)}
                  className={`p-3 rounded-2xl text-left text-xs transition-all flex flex-col justify-between gap-2 border ${
                    isActive
                      ? "bg-blue-500/20 border-blue-500/50 text-white shadow-lg"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-semibold text-blue-400">
                      Prompt 0{idx + 1}
                    </span>
                    {isActive && <CheckCircle2 size={12} className="text-blue-300" />}
                  </div>
                  <p className="leading-snug font-medium line-clamp-3">
                    {prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grounding Affirmation Banner */}
      <div
        className="p-4 rounded-2xl flex items-start gap-3 border border-purple-500/30"
        style={{
          background: "linear-gradient(135deg, rgba(155, 108, 255, 0.12) 0%, rgba(102, 183, 255, 0.12) 100%)",
        }}
      >
        <Sparkles size={16} className="text-violet-300 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-violet-300 block">
            Grounding Anchor
          </span>
          <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed italic">
            "{grounding_affirmation}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default CognitiveReframer;
