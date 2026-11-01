import React from "react";
import { motion } from "framer-motion";

const MOOD_COLORS = {
  joy: "#D4A373",
  happiness: "#D4A373",
  happy: "#D4A373",
  sadness: "#7CA1C4",
  sad: "#7CA1C4",
  anger: "#E07A5F",
  angry: "#E07A5F",
  fear: "#A78BFA",
  surprise: "#E9C46A",
  disgust: "#81B29A",
  neutral: "#A1A1AA",
  calmness: "#81B29A",
  calm: "#81B29A",
  stress: "#E07A5F",
  stressed: "#E07A5F",
  curiosity: "#D4A373",
  curious: "#D4A373",
};

const getOrbColor = (mood) => {
  if (!mood) return "#D4A373";
  const key = mood.toLowerCase();
  return MOOD_COLORS[key] || "#D4A373";
};

export const MoodOrb = ({ mood }) => {
  const color = getOrbColor(mood);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <motion.div
        data-testid="mood-orb"
        className="absolute animate-breathe"
        style={{
          top: "28%",
          left: "50%",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}2E 0%, ${color}10 42%, transparent 72%)`,
          filter: "blur(84px)",
          mixBlendMode: "var(--orb-blend-mode)",
          opacity: "var(--orb-primary-opacity)",
        }}
        animate={{
          background: `radial-gradient(circle, ${color}2E 0%, ${color}10 42%, transparent 72%)`,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute"
        style={{
          top: "48%",
          left: "36%",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}20 0%, transparent 62%)`,
          filter: "blur(64px)",
          mixBlendMode: "var(--orb-blend-mode)",
          opacity: "var(--orb-secondary-opacity)",
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
