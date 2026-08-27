import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Brush, Mic, MessageSquare, ArrowLeft } from "lucide-react";
import { TextInput } from "@/components/mood/TextInput";
import { DrawInput } from "@/components/mood/DrawInput";
import { SpeechInput } from "@/components/mood/SpeechInput";
import { TalkToMirror } from "@/components/mood/TalkToMirror";

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
}) => {
  const tabs = [
    { id: "text", labelKey: "tabWrite", icon: Pen, color: "#9B6CFF" },
    { id: "draw", labelKey: "tabDraw", icon: Brush, color: "#FFB39C" },
    { id: "speech", labelKey: "tabSpeak", icon: Mic, color: "#66B7FF" },
    { id: "talk", labelKey: "tabTalk", icon: MessageSquare, badge: "Beta", color: "#34D399" },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Top Bar: Back to Portal button + Mode Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        {/* Back to Portal Button */}
        {onBackToPortal && (
          <motion.button
            onClick={onBackToPortal}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
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
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  background: active ? "var(--chip-active-bg)" : "transparent",
                  border: active
                    ? "1px solid rgba(155, 108, 255, 0.5)"
                    : "1px solid transparent",
                  boxShadow: active
                    ? "0 0 16px rgba(155, 108, 255, 0.25)"
                    : "none",
                }}
              >
                <Icon size={14} style={{ color: active ? "#9333EA" : tab.color }} />
                <span>{t(tab.labelKey)}</span>
                {tab.badge && (
                  <span
                    className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded-full"
                    style={{
                      background: active
                        ? "rgba(155, 108, 255, 0.35)"
                        : "var(--chip-bg)",
                      color: active ? "var(--text-primary)" : "#A855F7",
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

      {/* Main Mode Workspace */}
      <AnimatePresence mode="wait">
        {activeTab === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <DrawInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} />
          </motion.div>
        )}
        {activeTab === "speech" && (
          <motion.div
            key="speech"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <SpeechInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} language={language} />
          </motion.div>
        )}
        {activeTab === "talk" && (
          <motion.div
            key="talk"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TalkToMirror t={t} language={language} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
