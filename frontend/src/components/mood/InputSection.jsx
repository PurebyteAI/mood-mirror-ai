import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Brush, Mic, MessageSquare, ArrowLeft, Feather } from "lucide-react";
import { TextInput } from "@/components/mood/TextInput";
import { DrawInput } from "@/components/mood/DrawInput";
import { SpeechInput } from "@/components/mood/SpeechInput";
import { TalkToMirror } from "@/components/mood/TalkToMirror";
import { REFLECTION_STYLES } from "@/lib/preferences";

export const InputSection = ({
  onAnalyze,
  isAnalyzing,
  t,
  language,
  activeTab,
  onTabChange,
  seedText,
  onPickPrompt,
  onBackToPortal,
  reflectionStyle = "warm",
  onReflectionStyleChange,
}) => {
  const tabs = [
    { id: "text", labelKey: "tabWrite", icon: Pen, accent: "var(--aura-gold)" },
    { id: "draw", labelKey: "tabDraw", icon: Brush, accent: "var(--aura-terracotta)" },
    { id: "speech", labelKey: "tabSpeak", icon: Mic, accent: "var(--aura-sage)" },
    { id: "talk", labelKey: "tabTalk", icon: MessageSquare, badge: "Live", accent: "var(--aura-sky)" },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Back to Portal button + Mode Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        {onBackToPortal && (
          <motion.button
            type="button"
            onClick={onBackToPortal}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={14} />
            <span>{t("navHome") || "Back to Mirror"}</span>
          </motion.button>
        )}

        {/* Mode Selector Tabs */}
        <div
          className="flex items-center p-1 rounded-full gap-1 ml-auto"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
            backdropFilter: "blur(16px)",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  background: active ? "var(--chip-active-bg)" : "transparent",
                  border: active
                    ? "1px solid var(--border-strong)"
                    : "1px solid transparent",
                }}
              >
                <Icon size={13} style={{ color: active ? "var(--aura-gold)" : tab.accent }} />
                <span>{t(tab.labelKey)}</span>
                {tab.badge && (
                  <span
                    className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded"
                    style={{
                      background: "var(--control-bg)",
                      color: active ? "var(--aura-gold)" : "var(--text-muted)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Poetic Voice / Register Selector (for Write, Draw, Speak) */}
      {activeTab !== "talk" && onReflectionStyleChange && (
        <div
          className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2 rounded-2xl"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2">
            <Feather size={13} style={{ color: "var(--aura-gold)" }} />
            <span
              className="text-[11px] font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {t("settingsReflectionStyle") || "Poetic Register"}:
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {REFLECTION_STYLES.map((style) => {
              const active = reflectionStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onReflectionStyleChange(style.id)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: active ? "var(--chip-active-bg)" : "transparent",
                    color: active ? "var(--aura-gold)" : "var(--text-secondary)",
                    border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
                  }}
                >
                  {t(style.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Mode Workspace */}
      <AnimatePresence mode="wait">
        {activeTab === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <TextInput
              onAnalyze={onAnalyze}
              isAnalyzing={isAnalyzing}
              t={t}
              seedText={seedText}
              onPickPrompt={onPickPrompt}
            />
          </motion.div>
        )}
        {activeTab === "draw" && (
          <motion.div
            key="draw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <DrawInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} language={language} />
          </motion.div>
        )}
        {activeTab === "speech" && (
          <motion.div
            key="speech"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <SpeechInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} language={language} />
          </motion.div>
        )}
        {activeTab === "talk" && (
          <motion.div
            key="talk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <TalkToMirror t={t} language={language} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
