import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MOOD_CONFIG = {
  happiness: { color: "#FCD34D", label: "Happy" },
  sadness: { color: "#60A5FA", label: "Sad" },
  stress: { color: "#F97316", label: "Stress" },
  calmness: { color: "#34D399", label: "Calm" },
  anger: { color: "#F87171", label: "Anger" },
  curiosity: { color: "#C084FC", label: "Curious" },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: "rgba(10,10,10,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "10px 14px",
        backdropFilter: "blur(12px)",
      }}
    >
      <p style={{ color: "#A1A1AA", fontSize: "10px", fontFamily: "'Space Mono', monospace", marginBottom: "6px" }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
          <span style={{ color: "#EDEDED", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>
            {MOOD_CONFIG[p.dataKey]?.label}: {Math.round(p.value * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export const MoodTrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div data-testid="mood-trend-chart" style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#52525B", fontSize: 10, fontFamily: "'Space Mono', monospace" }}
            axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#52525B", fontSize: 10, fontFamily: "'Space Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={cfg.color}
              strokeWidth={2}
              fill={`url(#grad-${key})`}
              dot={false}
              activeDot={{ r: 4, fill: cfg.color, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
