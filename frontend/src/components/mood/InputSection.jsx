import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Brush, Mic } from "lucide-react";
import { TextInput } from "@/components/mood/TextInput";
import { DrawInput } from "@/components/mood/DrawInput";
import { SpeechInput } from "@/components/mood/SpeechInput";

const TABS = [
  { id: "text", labelKey: "tabWrite", icon: Pen },
  { id: "draw", labelKey: "tabDraw", icon: Brush },
  { id: "speech", labelKey: "tabSpeak", icon: Mic },
];

export const InputSection = ({ onAnalyze, isAnalyzing, t, language }) => {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="w-full max-w-2xl">
      <div
        data-testid="input-tabs"
        className="flex items-center justify-center mb-8"
      >
        <div
          className="inline-flex items-center gap-1 p-1 rounded-full"
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
                {t(tab.labelKey)}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
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
      </AnimatePresence>
    </div>
  );
};
