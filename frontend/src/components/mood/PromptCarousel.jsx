import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Cloud, Heart, ArrowUpRight } from "lucide-react";

const PROMPTS = [
  {
    key: "promptNote",
    index: "01",
    tag: "Solitude",
    icon: Moon,
    accent: "var(--aura-violet)",
  },
  {
    key: "promptSmile",
    index: "02",
    tag: "Warmth",
    icon: Sun,
    accent: "var(--aura-gold)",
  },
  {
    key: "promptHeavier",
    index: "03",
    tag: "Gravity",
    icon: Cloud,
    accent: "var(--aura-sky)",
  },
  {
    key: "promptLetter",
    index: "04",
    tag: "Unsent",
    icon: Heart,
    accent: "var(--aura-terracotta)",
  },
];

export const PromptCarousel = ({ t, onPick }) => {
  return (
    <section className="w-full mt-7 max-w-5xl mx-auto px-1">
      {/* Editorial Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--aura-gold)" }}
          />
          <h4
            className="text-xs font-mono uppercase tracking-[0.16em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("needInspiration")}
          </h4>
        </div>
        <span
          className="text-[10px] font-mono hidden sm:inline"
          style={{ color: "var(--text-muted)" }}
        >
          Select an inquiry to seed the notebook
        </span>
      </div>

      {/* Responsive 4-Column Editorial Inquiry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {PROMPTS.map((item) => {
          const Icon = item.icon;
          const text = t(item.key);
          return (
            <motion.button
              type="button"
              key={item.key}
              onClick={() => onPick(text)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="prompt-card w-full p-4 rounded-2xl text-left group flex flex-col justify-between transition-all duration-200"
            >
              <div>
                {/* Top Index & Tag Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono font-semibold"
                      style={{ color: item.accent }}
                    >
                      {item.index}
                    </span>
                    <span
                      className="text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      / {item.tag}
                    </span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--control-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: item.accent,
                    }}
                  >
                    <Icon size={13} strokeWidth={1.75} />
                  </div>
                </div>

                {/* Inquiry Text */}
                <p
                  className="font-display text-sm sm:text-[15px] leading-snug mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  “{text}”
                </p>
              </div>

              {/* Bottom Action Row */}
              <div
                className="flex items-center justify-between pt-2.5 border-t"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <span
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Open in Studio
                </span>
                <ArrowUpRight
                  size={13}
                  style={{ color: "var(--aura-gold)" }}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
