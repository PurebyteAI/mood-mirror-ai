import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, PhoneOff, Wifi } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
} from "@livekit/components-react";

// ─── Audio Aura Visualizer ────────────────────────────────────────────────────

const STATE_ANIMATION = {
  disconnected: { speed: 0.007, intensity: 0.25, rings: 2 },
  connecting:   { speed: 0.018, intensity: 0.45, rings: 3 },
  initializing: { speed: 0.022, intensity: 0.55, rings: 3 },
  idle:          { speed: 0.008, intensity: 0.28, rings: 2 },
  listening:    { speed: 0.028, intensity: 0.75, rings: 4 },
  thinking:     { speed: 0.038, intensity: 0.65, rings: 4 },
  speaking:     { speed: 0.045, intensity: 1.00, rings: 5 },
};

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const AudioAuraVisualizer = ({
  state = "idle",
  color = "#1FD5F9",
  size = 320,
}) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const phaseRef  = useRef(0);
  const cfgRef    = useRef(STATE_ANIMATION[state] || STATE_ANIMATION.idle);
  const stateRef  = useRef(state); // read inside rAF without re-mounting canvas

  // Keep refs in sync with state without restarting the draw loop
  useEffect(() => {
    stateRef.current = state;
    cfgRef.current   = STATE_ANIMATION[state] || STATE_ANIMATION.idle;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W  = canvas.width;
    const H  = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const [cr, cg, cb] = hexToRgb(color);

    const draw = () => {
      const cfg = cfgRef.current;
      phaseRef.current += cfg.speed;
      const ph = phaseRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── Core glow ─────────────────────────────────────
      const coreR = W * 0.13;
      const grd   = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.2);
      grd.addColorStop(0,   `rgba(${cr},${cg},${cb},${0.38 * cfg.intensity})`);
      grd.addColorStop(0.5, `rgba(${cr},${cg},${cb},${0.12 * cfg.intensity})`);
      grd.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // ── Main ring ─────────────────────────────────────
      const mainR  = W * 0.28;
      const mainPx = Math.sin(ph * 2.4) * W * 0.012 * cfg.intensity;
      ctx.beginPath();
      ctx.arc(cx, cy, mainR + mainPx, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.92 * cfg.intensity})`;
      ctx.lineWidth   = 2.5;
      ctx.shadowBlur  = 22;
      ctx.shadowColor = `rgba(${cr},${cg},${cb},0.85)`;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // ── Wave rings ────────────────────────────────────
      for (let i = 0; i < cfg.rings; i++) {
        const rph    = ph + i * 0.55;
        const pulse  = Math.sin(rph * (1.8 + i * 0.4)) * W * 0.016 * cfg.intensity;
        const ringR  = mainR + (i + 1) * W * 0.07 + pulse;
        const alpha  = ((cfg.rings - i) / (cfg.rings + 1)) * 0.45 * cfg.intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.lineWidth   = Math.max(0.8, 2 - i * 0.35);
        ctx.shadowBlur  = 5;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},${alpha * 0.5})`;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      // ── Orbit particles (speaking / thinking) ─────────
      if (stateRef.current === "speaking" || stateRef.current === "thinking") {
        const n = stateRef.current === "speaking" ? 10 : 6;
        for (let i = 0; i < n; i++) {
          const angle = ph * (0.7 + i * 0.08) + (i / n) * Math.PI * 2;
          const dist  = mainR + W * 0.05 + Math.sin(ph * 2.5 + i) * W * 0.025;
          const px    = cx + Math.cos(angle) * dist;
          const py    = cy + Math.sin(angle) * dist;
          const pa    = (0.35 + Math.sin(ph * 1.8 + i) * 0.3) * cfg.intensity;
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fillStyle   = `rgba(${cr},${cg},${cb},${pa})`;
          ctx.shadowBlur  = 10;
          ctx.shadowColor = `rgba(${cr},${cg},${cb},0.7)`;
          ctx.fill();
          ctx.shadowBlur  = 0;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [color]); // colour only; state is read from cfgRef each frame

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
    />
  );
};

// ─── State label map ─────────────────────────────────────────────────────────

const STATE_LABEL = {
  disconnected:  { en: "Disconnected",            de: "Getrennt" },
  connecting:    { en: "Connecting…",             de: "Verbinde…" },
  initializing:  { en: "Mirror is waking up…",    de: "Mirror erwacht…" },
  idle:           { en: "Mirror is ready",         de: "Mirror ist bereit" },
  listening:     { en: "Listening to you…",       de: "Ich höre dir zu…" },
  thinking:      { en: "Mirror is reflecting…",   de: "Mirror reflektiert…" },
  speaking:      { en: "Mirror is speaking…",     de: "Mirror spricht…" },
};

// ─── Inner voice session (must be inside LiveKitRoom context) ────────────────

const VoiceSession = ({ onEnd, t, language }) => {
  const { state } = useVoiceAssistant();
  const lang  = language === "de" ? "de" : "en";
  const label = STATE_LABEL[state]?.[lang] ?? (STATE_LABEL[state]?.en ?? state);

  return (
    <motion.div
      key="session"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="flex flex-col items-center gap-8 py-4"
    >
      {/* Aura visualizer */}
      <div className="relative">
        <AudioAuraVisualizer state={state} color="#1FD5F9" size={300} />
        {/* Center icon badge */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(31,213,249,0.1)",
              border: "1px solid rgba(31,213,249,0.25)",
            }}
          >
            <Brain size={22} strokeWidth={1.5} style={{ color: "#1FD5F9" }} />
          </div>
        </div>
      </div>

      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-mono tracking-widest uppercase"
          style={{ color: "rgba(31,213,249,0.85)" }}
        >
          {label}
        </motion.p>
      </AnimatePresence>

      {/* End session button */}
      <motion.button
        onClick={onEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-8 py-3 rounded-full text-sm font-medium transition-all"
        style={{
          background: "rgba(248,113,113,0.12)",
          border: "1px solid rgba(248,113,113,0.4)",
          color: "#F87171",
        }}
      >
        <PhoneOff size={16} strokeWidth={1.5} />
        {t("endSession") || "End Session"}
      </motion.button>
    </motion.div>
  );
};

// ─── Idle / start prompt ─────────────────────────────────────────────────────

const IdlePrompt = ({ onStart, t, language }) => (
  <motion.div
    key="idle"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    className="flex flex-col items-center gap-8 py-4 text-center"
  >
    {/* Idle aura — dim pulse */}
    <div className="relative">
      <AudioAuraVisualizer state="idle" color="#1FD5F9" size={280} />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(31,213,249,0.08)",
            border: "1.5px solid rgba(31,213,249,0.2)",
          }}
        >
          <Brain size={26} strokeWidth={1.3} style={{ color: "rgba(31,213,249,0.7)" }} />
        </div>
      </div>
    </div>

    <div>
      <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        {t("talkTitle") || "Talk to Mirror"}
      </p>
      <p className="text-sm font-light max-w-xs mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {t("talkHint") ||
          "Speak freely — Mirror listens, senses your emotions, and responds with empathy."}
      </p>
    </div>

    <motion.button
      onClick={onStart}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-3 px-9 py-3.5 rounded-full text-sm font-semibold tracking-wide"
      style={{
        background: "linear-gradient(135deg, rgba(31,213,249,0.25) 0%, rgba(31,213,249,0.1) 100%)",
        border: "1.5px solid rgba(31,213,249,0.45)",
        color: "#1FD5F9",
        boxShadow: "0 0 30px rgba(31,213,249,0.15)",
      }}
    >
      <Wifi size={16} strokeWidth={1.5} />
      {t("startMirrorSession") || "Start Mirror Session"}
    </motion.button>
  </motion.div>
);

// ─── Connecting state ────────────────────────────────────────────────────────

const ConnectingView = ({ t, language }) => (
  <motion.div
    key="connecting"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center gap-6 py-10"
  >
    <AudioAuraVisualizer state="connecting" color="#1FD5F9" size={280} />
    <div className="flex items-center gap-3">
      <Loader2 size={16} strokeWidth={1.5} className="animate-spin" style={{ color: "#1FD5F9" }} />
      <p className="text-sm font-mono" style={{ color: "rgba(31,213,249,0.8)" }}>
        {language === "de" ? "Verbinde mit Mirror…" : "Connecting to Mirror…"}
      </p>
    </div>
  </motion.div>
);

// ─── Error state ─────────────────────────────────────────────────────────────

const ErrorView = ({ msg, onRetry, t }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center gap-5 py-10 text-center"
  >
    <p className="text-sm font-medium" style={{ color: "#F87171" }}>
      {msg || t("talkConnectFailed") || "Connection failed"}
    </p>
    <motion.button
      onClick={onRetry}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="px-7 py-2.5 rounded-full text-sm font-medium"
      style={{ border: "1px solid rgba(248,113,113,0.45)", color: "#F87171" }}
    >
      {t("tryAgain") || "Try Again"}
    </motion.button>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const TalkToMirror = ({ t, language }) => {
  const [sessionState, setSessionState] = useState("idle");
  const [token, setToken]       = useState("");
  const [wsUrl, setWsUrl]       = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const startSession = useCallback(async () => {
    setSessionState("connecting");
    setErrorMsg("");
    try {
      const roomName = `mood-mirror-${Date.now()}`;
      const res = await axios.post(`${API_BASE}/livekit/token`, {
        room_name: roomName,
        participant_name: "user",
        language,
      });
      setToken(res.data.token);
      setWsUrl(res.data.url);
      setSessionState("active");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.detail ||
          t("talkConnectFailed") ||
          "Could not connect. Please check your LiveKit configuration."
      );
      setSessionState("error");
    }
  }, [language, t]);

  const endSession = useCallback(() => {
    setToken("");
    setWsUrl("");
    setSessionState("idle");
  }, []);

  return (
    <div className="glass-card p-6 md:p-10" data-testid="talk-section">
      <AnimatePresence mode="wait">
        {sessionState === "idle" && (
          <IdlePrompt key="idle" onStart={startSession} t={t} language={language} />
        )}

        {sessionState === "connecting" && (
          <ConnectingView key="connecting" t={t} language={language} />
        )}

        {sessionState === "error" && (
          <ErrorView
            key="error"
            msg={errorMsg}
            onRetry={() => setSessionState("idle")}
            t={t}
          />
        )}

        {sessionState === "active" && token && wsUrl && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LiveKitRoom
              token={token}
              serverUrl={wsUrl}
              connect={true}
              audio={true}
              video={false}
              onDisconnected={endSession}
            >
              <VoiceSession onEnd={endSession} t={t} language={language} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
