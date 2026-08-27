import React, { useEffect, useRef } from "react";

const DOTS = 1800;
const PHI = Math.PI * (3 - Math.sqrt(5));
const DESIGN_SIZE = 420;

const BASE = {
  idle:         { freq: 0.4, amp: 0.08, speed: 0.008, pulse: 0.03, spread: 90, hueShift: 0 },
  connecting:   { freq: 0.55, amp: 0.12, speed: 0.014, pulse: 0.05, spread: 92, hueShift: 4 },
  initializing: { freq: 0.65, amp: 0.14, speed: 0.018, pulse: 0.06, spread: 93, hueShift: 8 },
  listening:    { freq: 0.8, amp: 0.18, speed: 0.022, pulse: 0.08, spread: 94, hueShift: 0 },
  thinking:     { freq: 1.05, amp: 0.24, speed: 0.032, pulse: 0.10, spread: 97, hueShift: 12 },
  speaking:     { freq: 1.2, amp: 0.28, speed: 0.038, pulse: 0.12, spread: 100, hueShift: 20 },
};
BASE.disconnected = BASE.idle;
BASE["pre-connect-buffering"] = BASE.connecting;
BASE.failed = BASE.idle;

function noise(x, y, z) {
  return (
    Math.sin(x * 1.3 + z) * Math.cos(y * 1.7 + z * 0.5) * 0.5 +
    Math.sin(x * 2.1 - z * 0.3) * Math.cos(y * 0.9 + z) * 0.3 +
    Math.sin(x * 0.7 + y * 1.1 + z * 1.5) * 0.2
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function makeSphere() {
  const pts = new Array(DOTS);
  for (let i = 0; i < DOTS; i += 1) {
    const y = 1 - 2 * (i / (DOTS - 1));
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = PHI * i;
    pts[i] = { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  }
  return pts;
}

function visualKind(state) {
  if (state === "speaking" || state === "thinking") return "speaking";
  if (state === "listening") return "listening";
  return "idle";
}

export default function ParticleBlob({
  state = "idle",
  audioLevelRef,
  size = 280,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const stateRef = useRef(state);
  const audioRef = useRef(audioLevelRef);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioRef.current = audioLevelRef;
  }, [audioLevelRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    const pts = makeSphere();
    const particles = pts.map(() => ({
      sx: 0, sy: 0, fz: 0, hue: 0, sat: 0, lit: 0, size: 0,
    }));
    const live = { ...BASE.idle };
    let micAmp = 0;
    let t = 0;
    let raf = 0;
    let running = true;
    let last = performance.now();
    let intersecting = true;
    let reduced = false;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reduced = media.matches;
    };
    syncMotion();
    media.addEventListener("change", syncMotion);

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    let io = null;
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          intersecting = entry.isIntersecting;
        },
        { threshold: 0.12 },
      );
      io.observe(wrap);
    }

    const draw = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);

      if (!intersecting || document.visibilityState !== "visible") {
        last = now;
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const frame = dt * 60;

      const current = stateRef.current;
      const kind = visualKind(current);
      const base = BASE[current] || BASE.idle;
      const mic = audioRef.current?.current ?? 0;
      let targetAmp = 0;
      if (kind !== "idle") {
        if (mic > 0.015) {
          targetAmp = Math.min(1, mic * 2.4);
        } else {
          targetAmp = 0.4 + Math.sin(t * 7) * 0.3 + Math.sin(t * 13) * 0.2;
        }
      }
      micAmp = lerp(micAmp, reduced ? targetAmp * 0.2 : targetAmp, 0.08);

      const want = {
        freq: base.freq,
        amp: base.amp + (kind === "listening" ? micAmp * 0.22 : kind === "speaking" ? micAmp * 0.3 : 0),
        speed: reduced ? base.speed * 0.2 : base.speed,
        pulse: reduced
          ? base.pulse * 0.25
          : base.pulse + (kind === "listening" ? micAmp * 0.12 : kind === "speaking" ? micAmp * 0.15 : 0),
        spread: base.spread + (kind === "listening" ? micAmp * 8 : kind === "speaking" ? micAmp * 12 : 0),
        hueShift: base.hueShift,
      };
      const k = 1 - Math.exp(-dt * 5);
      live.freq = lerp(live.freq, want.freq, k);
      live.amp = lerp(live.amp, want.amp, k);
      live.speed = lerp(live.speed, want.speed, k);
      live.pulse = lerp(live.pulse, want.pulse, k);
      live.spread = lerp(live.spread, want.spread, k);
      live.hueShift = lerp(live.hueShift, want.hueShift, k);

      const scale = size / DESIGN_SIZE;
      const spread = live.spread * scale;
      const cx = size / 2;
      const cy = size / 2;
      const cosR = Math.cos(t * 0.15);
      const sinR = Math.sin(t * 0.15);
      const breathe = Math.sin(t * 2.5) * live.pulse;

      for (let i = 0; i < DOTS; i += 1) {
        const pt = pts[i];
        const n = noise(pt.x * live.freq + t, pt.y * live.freq + t * 0.7, pt.z * live.freq + t * 0.5);
        const sway = 1 + n * live.amp + breathe;
        const rx = pt.x * sway;
        const ry = pt.y * sway;
        const rz = pt.z * sway;
        const fx = rx * cosR + rz * sinR;
        const fz = -rx * sinR + rz * cosR;
        const fy = ry;
        const depth = (fz + 1.5) / 3;
        const d = particles[i];
        d.sx = cx + fx * spread;
        d.sy = cy - fy * spread;
        d.fz = fz;
        d.hue = 185 + fy * 40 + n * 35 + live.hueShift;
        d.sat = 80 + depth * 20;
        d.lit = 45 + depth * 30;
        d.size = (0.6 + depth * 1.4 + (kind === "idle" ? 0 : 0.3 * micAmp)) * Math.max(0.85, scale);
      }

      particles.sort((a, b) => a.fz - b.fz);

      ctx.clearRect(0, 0, size, size);
      for (let i = 0; i < DOTS; i += 1) {
        const d = particles[i];
        ctx.beginPath();
        ctx.arc(d.sx, d.sy, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${d.hue},${d.sat}%,${d.lit}%)`;
        ctx.fill();
      }

      t += live.speed * frame;
    };

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
      media.removeEventListener("change", syncMotion);
    };
  }, [size]);

  return (
    <div
      ref={wrapRef}
      data-testid="particle-blob"
      aria-hidden="true"
      style={{ width: size, height: size, pointerEvents: "none" }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
