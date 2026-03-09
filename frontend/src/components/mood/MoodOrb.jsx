import React from "react";
import { motion } from "framer-motion";

const MOOD_COLORS = {
  happiness: "#FCD34D",
  happy: "#FCD34D",
  sadness: "#60A5FA",
  sad: "#60A5FA",
  anger: "#F87171",
  angry: "#F87171",
  calmness: "#34D399",
  calm: "#34D399",
  stress: "#F97316",
  stressed: "#F97316",
  curiosity: "#C084FC",
  curious: "#C084FC",
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
          mixBlendMode: "screen",
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
          mixBlendMode: "screen",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
