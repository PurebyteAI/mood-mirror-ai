import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Brush, Mic, Brain } from "lucide-react";
import { TextInput } from "@/components/mood/TextInput";
import { DrawInput } from "@/components/mood/DrawInput";
import { SpeechInput } from "@/components/mood/SpeechInput";
import { TalkToMirror } from "@/components/mood/TalkToMirror";

const TABS = [
  { id: "text",   labelKey: "tabWrite", icon: Pen   },
  { id: "draw",   labelKey: "tabDraw",  icon: Brush },
  { id: "speech", labelKey: "tabSpeak", icon: Mic   },
  { id: "talk",   labelKey: "tabTalk",  icon: Brain },
];

export const InputSection = ({ onAnalyze, isAnalyzing, t, language }) => {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="w-full max-w-2xl">
      <div data-testid="input-tabs" className="flex items-center justify-center mb-8">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-full"
          style={{
            background: "var(--chip-bg)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--control-border)",
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isTalk = tab.id === "talk";
            return (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  color: isActive
                    ? isTalk ? "#1FD5F9" : "var(--text-primary)"
                    : "var(--text-muted)",
                  background: isActive ? "var(--chip-active-bg)" : "transparent",
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
                {t(tab.labelKey)}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: isTalk
                        ? "1px solid rgba(31,213,249,0.45)"
                        : "1px solid var(--border-highlight)",
                      background: isTalk
                        ? "rgba(31,213,249,0.06)"
                        : "var(--bg-surface-soft)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "text" && (
          <motion.div key="text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <TextInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} />
          </motion.div>
        )}
        {activeTab === "draw" && (
          <motion.div key="draw" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <DrawInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} />
          </motion.div>
        )}
        {activeTab === "speech" && (
          <motion.div key="speech" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <SpeechInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} t={t} language={language} />
          </motion.div>
        )}
        {activeTab === "talk" && (
          <motion.div key="talk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <TalkToMirror t={t} language={language} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
