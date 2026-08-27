import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Cloud, Heart, ArrowRight, Sparkles } from "lucide-react";

const PROMPTS = [
  {
    key: "promptNote",
    icon: Moon,
    badgeBg: "linear-gradient(135deg, rgba(155, 108, 255, 0.25), rgba(101, 120, 255, 0.15))",
    iconColor: "#C084FC",
    glow: "rgba(155, 108, 255, 0.2)",
    border: "rgba(155, 108, 255, 0.3)",
  },
  {
    key: "promptSmile",
    icon: Sun,
    badgeBg: "linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(245, 158, 11, 0.15))",
    iconColor: "#FCD34D",
    glow: "rgba(249, 115, 22, 0.2)",
    border: "rgba(249, 115, 22, 0.3)",
  },
  {
    key: "promptHeavier",
    icon: Cloud,
    badgeBg: "linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(56, 189, 248, 0.15))",
    iconColor: "#66B7FF",
    glow: "rgba(14, 165, 233, 0.2)",
    border: "rgba(14, 165, 233, 0.3)",
  },
  {
    key: "promptLetter",
    icon: Heart,
    badgeBg: "linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(236, 72, 153, 0.15))",
    iconColor: "#F472B6",
    glow: "rgba(244, 63, 94, 0.2)",
    border: "rgba(244, 63, 94, 0.3)",
  },
];

export const PromptCarousel = ({ t, onPick }) => {
  return (
    <section className="w-full mt-6 max-w-5xl mx-auto px-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Sparkles size={14} className="text-violet-500 dark:text-violet-400" />
        <h4
          className="text-xs sm:text-sm font-semibold tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
          {t("needInspiration")}
        </h4>
      </div>

      {/* Responsive Grid: All 4 Cards Clearly Visible and Balanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {PROMPTS.map((item) => {
          const Icon = item.icon;
          const text = t(item.key);
          return (
            <motion.button
              key={item.key}
              onClick={() => onPick(text)}
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="prompt-card w-full p-4 rounded-2xl text-left group flex flex-col justify-between transition-all duration-300"
              style={{
                boxShadow: `0 4px 20px ${item.glow}`,
              }}
            >
              <div>
                {/* Colored Icon Square */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-inner"
                  style={{
                    background: item.badgeBg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} style={{ color: item.iconColor }} />
                </div>

                {/* Prompt Text */}
                <p
                  className="text-xs sm:text-[13px] font-light leading-relaxed mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {text}
                </p>
              </div>

              {/* Arrow Action Button */}
              <div className="flex justify-end pt-1">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-violet-500/20 group-hover:translate-x-0.5"
                  style={{
                    background: "var(--control-bg)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <ArrowRight
                    size={12}
                    style={{ color: "var(--text-secondary)" }}
                  />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
