import React from "react";
import { motion } from "framer-motion";

const MOOD_COLORS = {
  joy: "#FCD34D",
  happiness: "#FCD34D",
  happy: "#FCD34D",
  sadness: "#60A5FA",
  sad: "#60A5FA",
  anger: "#F87171",
  angry: "#F87171",
  fear: "#C084FC",
  surprise: "#FB923C",
  disgust: "#34D399",
  neutral: "#A1A1AA",
  calmness: "#A1A1AA",
  calm: "#A1A1AA",
  stress: "#C084FC",
  stressed: "#C084FC",
  curiosity: "#FB923C",
  curious: "#FB923C",
};

const getOrbColor = (mood) => {
  if (!mood) return "#C084FC";
  const key = mood.toLowerCase();
  return MOOD_COLORS[key] || "#C084FC";
};

export const MoodOrb = ({ mood }) => {
  const color = getOrbColor(mood);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <motion.div
        data-testid="mood-orb"
        className="absolute animate-breathe"
        style={{
          top: "30%",
          left: "50%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}33 0%, ${color}11 40%, transparent 70%)`,
          filter: "blur(80px)",
          mixBlendMode: "var(--orb-blend-mode)",
          opacity: "var(--orb-primary-opacity)",
        }}
        animate={{
          background: `radial-gradient(circle, ${color}33 0%, ${color}11 40%, transparent 70%)`,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Secondary smaller orb */}
      <motion.div
        className="absolute"
        style={{
          top: "50%",
          left: "35%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}22 0%, transparent 60%)`,
          filter: "blur(60px)",
          mixBlendMode: "var(--orb-blend-mode)",
          opacity: "var(--orb-secondary-opacity)",
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
