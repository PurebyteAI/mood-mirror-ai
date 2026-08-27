import React from "react";
import { motion } from "framer-motion";
import { Compass, Sparkles, Activity } from "lucide-react";

export const AffectRadarChart = ({ history = [], currentAnalysis = null }) => {
  // Combine historical coordinates with current analysis
  const points = [];

  if (history && history.length > 0) {
    history.forEach((h, idx) => {
      points.push({
        id: h.id || idx,
        valence: typeof h.valence === "number" ? h.valence : (h.emotions?.[0]?.emotion === "stress" ? -0.6 : 0.5),
        arousal: typeof h.arousal === "number" ? h.arousal : 0.4,
        mood: h.dominant_mood || "calm",
        date: new Date(h.timestamp || Date.now()).toLocaleDateString(),
        isCurrent: false,
      });
    });
  }

  if (currentAnalysis) {
    points.push({
      id: currentAnalysis.id || "current",
      valence: typeof currentAnalysis.valence === "number" ? currentAnalysis.valence : 0.6,
      arousal: typeof currentAnalysis.arousal === "number" ? currentAnalysis.arousal : 0.35,
      mood: currentAnalysis.dominant_mood || "calmness",
      date: "Now",
      isCurrent: true,
    });
  }

  // If no points exist, add standard demo points
  const displayPoints = points.length > 0 ? points.slice(-8) : [
    { id: 1, valence: -0.4, arousal: 0.7, mood: "stress", date: "3 days ago", isCurrent: false },
    { id: 2, valence: 0.2, arousal: 0.3, mood: "reflective", date: "Yesterday", isCurrent: false },
    { id: 3, valence: 0.75, arousal: 0.45, mood: "calmness", date: "Now", isCurrent: true },
  ];

  const size = 280;
  const center = size / 2;
  const radius = center - 24;

  // Convert (valence [-1, 1], arousal [0, 1]) to (cx, cy)
  const toCoords = (v, a) => {
    // x maps valence from -1 -> 1
    const x = center + v * radius * 0.88;
    // y maps arousal from 1 (top) -> 0 (bottom)
    const y = center - (a * 2 - 1) * radius * 0.88;
    return { x, y };
  };

  const currentPoint = displayPoints.find((p) => p.isCurrent) || displayPoints[displayPoints.length - 1];

  return (
    <div
      data-testid="affect-radar-chart"
      className="p-5 sm:p-6 rounded-3xl backdrop-blur-2xl transition-all space-y-4"
      style={{
        background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
        border: "1px solid rgba(155, 108, 255, 0.2)",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Activity size={16} />
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>2D Russell Circumplex Affect Radar</span>
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Affect Science
              </span>
            </h4>
            <p className="text-[11px] text-white/50">
              Mapping emotional Valence (Pleasure) vs. Arousal (Energy Activation).
            </p>
          </div>
        </div>

        {currentPoint && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-violet-500/10 border border-violet-500/30 text-violet-300">
            <span>V: {currentPoint.valence.toFixed(2)}</span>
            <span>·</span>
            <span>A: {currentPoint.arousal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Radar SVG Canvas */}
      <div className="relative w-full max-w-[320px] aspect-square mx-auto flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Circular Orbit Rings */}
          <circle cx={center} cy={center} r={radius * 0.9} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.55} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={radius * 0.25} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Quadrant Background Shading */}
          {/* Top-Right: Eustress / High Joy */}
          <rect x={center} y={center - radius * 0.9} width={radius * 0.9} height={radius * 0.9} fill="rgba(252, 211, 77, 0.03)" rx="8" />
          {/* Top-Left: Distress */}
          <rect x={center - radius * 0.9} y={center - radius * 0.9} width={radius * 0.9} height={radius * 0.9} fill="rgba(248, 113, 113, 0.03)" rx="8" />
          {/* Bottom-Left: Fatigue */}
          <rect x={center - radius * 0.9} y={center} width={radius * 0.9} height={radius * 0.9} fill="rgba(96, 165, 250, 0.03)" rx="8" />
          {/* Bottom-Right: Serenity */}
          <rect x={center} y={center} width={radius * 0.9} height={radius * 0.9} fill="rgba(52, 211, 153, 0.03)" rx="8" />

          {/* Axis Crosshairs */}
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Quadrant Labels */}
          <text x={center + radius * 0.5} y={center - radius * 0.75} fill="#FCD34D" fontSize="9" fontFamily="'Space Mono', monospace" textAnchor="middle">
            EUSTRESS (JOY)
          </text>
          <text x={center - radius * 0.5} y={center - radius * 0.75} fill="#F87171" fontSize="9" fontFamily="'Space Mono', monospace" textAnchor="middle">
            DISTRESS (TENSION)
          </text>
          <text x={center - radius * 0.5} y={center + radius * 0.85} fill="#60A5FA" fontSize="9" fontFamily="'Space Mono', monospace" textAnchor="middle">
            FATIGUE (TIRED)
          </text>
          <text x={center + radius * 0.5} y={center + radius * 0.85} fill="#34D399" fontSize="9" fontFamily="'Space Mono', monospace" textAnchor="middle">
            SERENITY (CALM)
          </text>

          {/* Trajectory Connecting Path */}
          {displayPoints.length > 1 && (
            <polyline
              points={displayPoints
                .map((p) => {
                  const { x, y } = toCoords(p.valence, p.arousal);
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="rgba(155, 108, 255, 0.4)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Historical Points */}
          {displayPoints.map((p, idx) => {
            const { x, y } = toCoords(p.valence, p.arousal);
            const isLatest = p.isCurrent;
            return (
              <g key={p.id || idx}>
                {isLatest && (
                  <circle cx={x} cy={y} r="14" fill="rgba(192, 132, 252, 0.25)" className="animate-ping" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isLatest ? "7" : "4.5"}
                  fill={isLatest ? "#C084FC" : "#60A5FA"}
                  stroke="#FFFFFF"
                  strokeWidth={isLatest ? "2" : "1"}
                  className="shadow-lg cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Quadrant Summary */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white/70">Right: Positive Valence</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="text-white/70">Top: High Activation</span>
        </div>
      </div>
    </div>
  );
};

export default AffectRadarChart;
