import React, { useState } from "react";
import { Brain, CheckCircle2, Compass, Feather, ArrowRight } from "lucide-react";

export const CognitiveReframer = ({ cognitiveData, onFollowUp, t = (key) => key }) => {
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [reframeReply, setReframeReply] = useState("");

  if (!cognitiveData) return null;

  const {
    distortion_detected = "Cognitive Tension",
    explanation = "Your mind is currently holding high internal pressure.",
    reframing_prompts = [],
    grounding_affirmation = "You are permitted to pause and breathe.",
  } = cognitiveData;

  return (
    <div
      id="cognitive-reframer-section"
      data-testid="cognitive-reframer-card"
      className="rounded-2xl p-5 sm:p-6 transition-all space-y-4 scroll-mt-6"
      style={{
        background: "var(--card-glass-bg)",
        border: "1px solid var(--card-glass-border)",
        boxShadow: "var(--card-glass-shadow)",
      }}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--aura-sky)",
            }}
          >
            <Compass size={16} />
          </div>
          <div>
            <h4
              className="font-display text-base sm:text-lg font-medium tracking-tight flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span>{t("reframeTitle")}</span>
              <span
                className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--aura-sky)",
                }}
              >
                {t("reframeBadge")}
              </span>
            </h4>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t("reframeHint")}
            </p>
          </div>
        </div>

        {/* Distortion Pill */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium"
          style={{
            background: "var(--chip-active-bg)",
            border: "1px solid var(--border-strong)",
            color: "var(--aura-gold)",
          }}
        >
          <Brain size={13} />
          <span>{distortion_detected}</span>
        </div>
      </div>

      {/* Explanation Box */}
      <div
        className="p-4 rounded-xl text-xs sm:text-sm leading-relaxed"
        style={{
          background: "var(--control-bg)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
      >
        <span className="font-semibold" style={{ color: "var(--aura-gold)" }}>
          {t("mindPattern")}:{" "}
        </span>
        <span>{explanation}</span>
      </div>

      {/* Interactive Reframing Prompts */}
      {reframing_prompts.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <span
            className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] block"
            style={{ color: "var(--text-muted)" }}
          >
            {t("reframeInquiries")}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {reframing_prompts.map((prompt, idx) => {
              const isActive = activePromptIdx === idx;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActivePromptIdx(idx)}
                  className="p-3.5 rounded-xl text-left text-xs transition-all flex flex-col justify-between gap-2"
                  style={{
                    background: isActive ? "var(--chip-active-bg)" : "var(--control-bg)",
                    border: isActive
                      ? "1px solid var(--border-strong)"
                      : "1px solid var(--border-subtle)",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="text-[10px] font-mono font-semibold uppercase"
                      style={{ color: isActive ? "var(--aura-gold)" : "var(--text-muted)" }}
                    >
                      {t("reframePrompt")} 0{idx + 1}
                    </span>
                    {isActive && (
                      <CheckCircle2 size={13} style={{ color: "var(--aura-sage)" }} />
                    )}
                  </div>
                  <p className="leading-snug font-display text-sm">
                    “{prompt}”
                  </p>
                </button>
              );
            })}
          </div>

          {/* Interactive Response / Follow-up Bar for Selected Prompt */}
          {onFollowUp && reframing_prompts[activePromptIdx] && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const selectedQ = reframing_prompts[activePromptIdx];
                const userReply = reframeReply.trim();
                const query = userReply
                  ? `Prompt: "${selectedQ}" — My reflection: ${userReply}`
                  : selectedQ;
                onFollowUp(query);
              }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <input
                type="text"
                value={reframeReply}
                onChange={(e) => setReframeReply(e.target.value)}
                placeholder={reframing_prompts[activePromptIdx]}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs focus:outline-none"
                style={{
                  background: "var(--control-bg)",
                  border: "1px solid var(--control-border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="submit"
                data-testid="reframe-reflect-btn"
                className="btn-mirror-me px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>{t("followUpReflect") || "Reflect"}</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Grounding Affirmation Banner */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{
          background: "var(--chip-active-bg)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <Feather size={15} style={{ color: "var(--aura-gold)" }} className="shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.16em] font-semibold block"
            style={{ color: "var(--aura-gold)" }}
          >
            {t("groundingAnchor")}
          </span>
          <p
            className="font-display text-sm sm:text-base italic leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            “{grounding_affirmation}”
          </p>
        </div>
      </div>
    </div>
  );
};

export default CognitiveReframer;
