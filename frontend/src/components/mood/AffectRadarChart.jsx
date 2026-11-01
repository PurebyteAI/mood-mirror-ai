import React from "react";
import { Activity } from "lucide-react";

export const AffectRadarChart = ({ history = [], currentAnalysis = null }) => {
  const points = [];

  if (history && history.length > 0) {
    history.forEach((h, idx) => {
      points.push({
        id: h.id || idx,
        valence:
          typeof h.valence === "number"
            ? h.valence
            : h.emotions?.[0]?.emotion === "stress"
            ? -0.6
            : 0.5,
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

  const displayPoints =
    points.length > 0
      ? points.slice(-8)
      : [
          { id: 1, valence: -0.4, arousal: 0.7, mood: "stress", date: "3 days ago", isCurrent: false },
          { id: 2, valence: 0.2, arousal: 0.3, mood: "reflective", date: "Yesterday", isCurrent: false },
          { id: 3, valence: 0.75, arousal: 0.45, mood: "calmness", date: "Now", isCurrent: true },
        ];

  const size = 280;
  const center = size / 2;
  const radius = center - 24;

  const toCoords = (v, a) => {
    const x = center + v * radius * 0.88;
    const y = center - (a * 2 - 1) * radius * 0.88;
    return { x, y };
  };

  const currentPoint =
    displayPoints.find((p) => p.isCurrent) || displayPoints[displayPoints.length - 1];

  return (
    <div
      data-testid="affect-radar-chart"
      className="p-5 sm:p-6 rounded-2xl transition-all space-y-4 h-full flex flex-col justify-between"
      style={{
        background: "var(--card-glass-bg)",
        border: "1px solid var(--card-glass-border)",
        boxShadow: "var(--card-glass-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--aura-gold)",
            }}
          >
            <Activity size={15} />
          </div>
          <div>
            <h4
              className="font-display text-base font-medium tracking-tight flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span>2D Russell Circumplex Affect Radar</span>
              <span
                className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded"
                style={{
                  background: "var(--chip-active-bg)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--aura-gold)",
                }}
              >
                Affect Science
              </span>
            </h4>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Mapping emotional Valence (Pleasure) vs. Arousal (Energy Activation).
            </p>
          </div>
        </div>

        {currentPoint && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--aura-gold)",
            }}
          >
            <span>V: {currentPoint.valence.toFixed(2)}</span>
            <span>·</span>
            <span>A: {currentPoint.arousal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Radar SVG Canvas */}
      <div className="relative w-full max-w-[300px] aspect-square mx-auto flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Circular Orbit Rings */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.9}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.55}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.25}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />

          {/* Quadrant Background Shading */}
          <rect
            x={center}
            y={center - radius * 0.9}
            width={radius * 0.9}
            height={radius * 0.9}
            fill="rgba(212, 163, 115, 0.05)"
            rx="8"
          />
          <rect
            x={center - radius * 0.9}
            y={center - radius * 0.9}
            width={radius * 0.9}
            height={radius * 0.9}
            fill="rgba(224, 122, 95, 0.05)"
            rx="8"
          />
          <rect
            x={center - radius * 0.9}
            y={center}
            width={radius * 0.9}
            height={radius * 0.9}
            fill="rgba(124, 161, 196, 0.05)"
            rx="8"
          />
          <rect
            x={center}
            y={center}
            width={radius * 0.9}
            height={radius * 0.9}
            fill="rgba(129, 178, 154, 0.05)"
            rx="8"
          />

          {/* Axis Crosshairs */}
          <line
            x1={center - radius}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
          <line
            x1={center}
            y1={center - radius}
            x2={center}
            y2={center + radius}
            stroke="var(--border-strong)"
            strokeWidth="1"
          />

          {/* Quadrant Labels */}
          <text
            x={center + radius * 0.48}
            y={center - radius * 0.72}
            fill="#D4A373"
            fontSize="8.5"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
            EUSTRESS (JOY)
          </text>
          <text
            x={center - radius * 0.48}
            y={center - radius * 0.72}
            fill="#E07A5F"
            fontSize="8.5"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
            DISTRESS (TENSION)
          </text>
          <text
            x={center - radius * 0.48}
            y={center + radius * 0.82}
            fill="#7CA1C4"
            fontSize="8.5"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
            FATIGUE (REST)
          </text>
          <text
            x={center + radius * 0.48}
            y={center + radius * 0.82}
            fill="#81B29A"
            fontSize="8.5"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
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
              stroke="var(--aura-gold)"
              strokeOpacity="0.55"
              strokeWidth="1.75"
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
                  <circle
                    cx={x}
                    cy={y}
                    r="13"
                    fill="rgba(212, 163, 115, 0.25)"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isLatest ? "6.5" : "4.5"}
                  fill={isLatest ? "#D4A373" : "#81B29A"}
                  stroke="var(--bg-base)"
                  strokeWidth={isLatest ? "2" : "1.5"}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Quadrant Summary */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div
          className="p-2.5 rounded-xl flex items-center gap-2"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--aura-sage)" }} />
          <span style={{ color: "var(--text-secondary)" }}>Right: Positive Valence</span>
        </div>
        <div
          className="p-2.5 rounded-xl flex items-center gap-2"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--aura-gold)" }} />
          <span style={{ color: "var(--text-secondary)" }}>Top: High Activation</span>
        </div>
      </div>
    </div>
  );
};

export default AffectRadarChart;
