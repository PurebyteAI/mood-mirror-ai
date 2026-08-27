import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Flame, Compass, Palette, ShieldAlert, ChevronDown, Check, Split } from "lucide-react";

export const DEMO_SCENARIOS = [
  {
    id: "pitch-story",
    badge: "Killer Feature Demo",
    title: "Multimodal Contradiction (The Pitch Story)",
    icon: Split,
    color: "#F472B6",
    input_type: "text",
    content:
      "I just finished a huge project. It went really well, but honestly... I'm exhausted. My body is completely drained even while I try to celebrate.",
    summary: "Words sound relieved, but signals reveal hidden exhaustion → Triggers Contradiction Detector!",
  },
  {
    id: "creative",
    badge: "Living Tapestry",
    title: "Flow State & Cosmic Art",
    icon: Palette,
    color: "#FCD34D",
    input_type: "text",
    content:
      "I stayed up late building and sketching. Everything is clicking together, luminous and alive, and I feel pure electric inspiration.",
    summary: "High joy & inspiration → Generates Luminous Living Tapestry Artwork",
  },
  {
    id: "founder",
    badge: "CBT Reframer",
    title: "Overwhelmed Founder Crisis",
    icon: Flame,
    color: "#F87171",
    input_type: "text",
    content:
      "We are launching in 3 hours. The build broke, investors are texting, and I haven't slept in 24 hours. My chest feels tight and my mind is racing with catastrophic scenarios.",
    summary: "High stress & urgency → Triggers CBT Catastrophizing Reframing & Breathing",
  },
  {
    id: "nostalgia",
    badge: "Poetic Mirror",
    title: "Balcony Solitude & Rain",
    icon: Compass,
    color: "#C084FC",
    input_type: "text",
    content:
      "Standing on the balcony in the rain looking at old polaroid photos. A quiet, tender wave of nostalgia and sweet ache for times that will never quite return.",
    summary: "Deep nostalgia & calm → Empathetic Poetic Metaphor & Grounding Affirmation",
  },
];

export const HackathonDemoBar = ({ onSelectScenario }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const handleSelect = (scenario) => {
    setActiveScenarioId(scenario.id);
    onSelectScenario(scenario);
    setIsOpen(false);
  };

  return (
    <div className="w-full flex justify-center pb-2 pointer-events-auto">
      <div className="relative">
        <motion.button
          data-testid="hackathon-demo-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(155, 108, 255, 0.25) 0%, rgba(102, 183, 255, 0.25) 100%)",
            border: "1px solid rgba(155, 108, 255, 0.45)",
            boxShadow: "0 0 20px rgba(155, 108, 255, 0.2)",
            color: "#FFFFFF",
          }}
        >
          <Sparkles size={13} className="text-violet-400 animate-pulse" />
          <span>⚡ Hackathon Judge Demo Presets</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </motion.button>

        {/* Dropdown Tray */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] sm:w-[500px] p-3 rounded-2xl backdrop-blur-2xl shadow-2xl z-50 border space-y-2"
              style={{
                background: "linear-gradient(160deg, rgba(17, 29, 57, 0.95) 0%, rgba(7, 17, 38, 0.98) 100%)",
                borderColor: "rgba(155, 108, 255, 0.35)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(155, 108, 255, 0.15)",
              }}
            >
              <div className="flex items-center justify-between px-2 pb-1 border-b border-white/10">
                <span className="text-[11px] font-mono font-semibold uppercase text-violet-300">
                  Select Judge Demo Scenario
                </span>
                <span className="text-[10px] text-white/40 font-mono">1-Click Live AI Run</span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {DEMO_SCENARIOS.map((scenario) => {
                  const Icon = scenario.icon;
                  const isSelected = activeScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleSelect(scenario)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 group ${
                        isSelected
                          ? "bg-violet-500/20 border-violet-400"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-violet-500/30"
                      }`}
                    >
                      <div
                        className="p-2 rounded-lg shrink-0 mt-0.5"
                        style={{
                          background: `${scenario.color}20`,
                          color: scenario.color,
                          border: `1px solid ${scenario.color}40`,
                        }}
                      >
                        <Icon size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-white tracking-tight truncate">
                            {scenario.title}
                          </span>
                          <span
                            className="text-[9px] font-mono font-semibold uppercase px-2 py-0.2 rounded-full shrink-0"
                            style={{
                              background: `${scenario.color}25`,
                              color: scenario.color,
                              border: `1px solid ${scenario.color}40`,
                            }}
                          >
                            {scenario.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 line-clamp-1 italic font-serif">
                          "{scenario.content}"
                        </p>
                        <p className="text-[10px] text-violet-300/80 font-mono mt-0.5">
                          ↳ {scenario.summary}
                        </p>
                      </div>

                      {isSelected && (
                        <Check size={14} className="text-emerald-400 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HackathonDemoBar;
