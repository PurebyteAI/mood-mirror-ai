import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PhoneOff, Wifi, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useVoiceAssistant,
} from "@livekit/components-react";
import ParticleBlob from "@/components/mood/ParticleBlob";

const MirrorBlob = ({ state, audioLevelRef, size = 260 }) => (
  <ParticleBlob state={state} audioLevelRef={audioLevelRef} size={size} />
);

const STATE_KEYS = {
  disconnected: "talkDisconnected",
  connecting: "talkConnectingState",
  initializing: "talkInitializing",
  idle: "talkIdle",
  listening: "talkListening",
  thinking: "talkThinking",
  speaking: "talkSpeaking",
};

const resolveMediaStream = (track) => {
  if (!track) return null;
  if (track.mediaStream) return track.mediaStream;
  if (track.mediaStreamTrack) return new MediaStream([track.mediaStreamTrack]);
  return null;
};

const useRmsFromTrack = (track) => {
  const rmsRef = React.useRef(0);

  React.useEffect(() => {
    const stream = resolveMediaStream(track);
    if (!stream) {
      rmsRef.current = 0;
      return undefined;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.38;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let raf = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i += 1) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        rmsRef.current = Math.sqrt(sum / buf.length);
        raf = requestAnimationFrame(tick);
      };

      audioCtx.resume?.();
      tick();

      return () => {
        cancelAnimationFrame(raf);
        source.disconnect();
        analyser.disconnect();
        audioCtx.close();
        rmsRef.current = 0;
      };
    } catch (e) {
      return undefined;
    }
  }, [track]);

  return rmsRef;
};

const VoiceSession = ({ onEnd, t }) => {
  const { state, audioTrack } = useVoiceAssistant();
  const { microphoneTrack } = useLocalParticipant();
  const label = t(STATE_KEYS[state] || "") || state;

  const liveTrack =
    state === "listening"
      ? microphoneTrack?.track
      : state === "speaking"
        ? audioTrack?.publication?.track
        : null;
  const audioLevelRef = useRmsFromTrack(liveTrack);

  return (
    <motion.div
      key="session"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="flex flex-col items-center gap-6 py-4"
    >
      <MirrorBlob state={state} audioLevelRef={audioLevelRef} size={270} />

      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-xs font-mono tracking-[0.2em] uppercase font-semibold"
          style={{ color: "var(--aura-gold)" }}
        >
          {label}
        </motion.p>
      </AnimatePresence>

      {/* End session button */}
      <motion.button
        type="button"
        onClick={onEnd}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 px-7 py-3 rounded-full text-sm font-medium transition-all"
        style={{
          background: "rgba(224, 122, 95, 0.14)",
          border: "1px solid rgba(224, 122, 95, 0.4)",
          color: "var(--aura-terracotta)",
        }}
      >
        <PhoneOff size={16} strokeWidth={1.6} />
        <span>{t("endSession") || "End Session"}</span>
      </motion.button>
    </motion.div>
  );
};

const IdlePrompt = ({ onStart, t }) => (
  <motion.div
    key="idle"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="flex flex-col items-center gap-6 py-4 text-center"
  >
    <MirrorBlob state="idle" size={270} />

    <div>
      <span
        className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-2"
        style={{ color: "var(--aura-gold)" }}
      >
        Real-Time Conversational Sanctuary
      </span>
      <h3
        className="font-display text-2xl md:text-3xl font-medium mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {t("talkTitle") || "Voice Reflection with Mirror"}
      </h3>
      <p
        className="text-xs md:text-sm font-light max-w-sm mx-auto leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {t("talkHint") ||
          "Speak freely — Mirror listens in real-time, senses your tone, and responds with empathy."}
      </p>
    </div>

    <motion.button
      type="button"
      onClick={onStart}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="btn-mirror-me flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide"
    >
      <Wifi size={16} strokeWidth={1.8} />
      <span>{t("startMirrorSession") || "Start Live Voice Session"}</span>
    </motion.button>
  </motion.div>
);

const ConnectingView = ({ t }) => (
  <motion.div
    key="connecting"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center gap-6 py-10"
  >
    <MirrorBlob state="connecting" size={270} />
    <div className="flex items-center gap-3">
      <Loader2 size={18} strokeWidth={1.8} className="animate-spin" style={{ color: "var(--aura-gold)" }} />
      <p className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
        {t("talkConnecting")}
      </p>
    </div>
  </motion.div>
);

const ErrorView = ({ msg, onRetry, t }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center gap-5 py-10 text-center"
  >
    <div
      className="p-3 rounded-full"
      style={{
        background: "rgba(224, 122, 95, 0.14)",
        color: "var(--aura-terracotta)",
      }}
    >
      <AlertCircle size={24} />
    </div>
    <div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--aura-terracotta)" }}>
        {msg || t("talkConnectFailed") || "Live voice session could not connect."}
      </p>
      <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
        {t("talkLiveKitHint")}
      </p>
    </div>
    <motion.button
      type="button"
      onClick={onRetry}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="px-7 py-2.5 rounded-full text-sm font-medium"
      style={{
        border: "1px solid var(--border-strong)",
        color: "var(--text-primary)",
        background: "var(--control-bg)",
      }}
    >
      {t("tryAgain") || "Try Again"}
    </motion.button>
  </motion.div>
);

export const TalkToMirror = ({ t, language }) => {
  const [sessionState, setSessionState] = useState("idle");
  const [token, setToken] = useState("");
  const [wsUrl, setWsUrl] = useState("");
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
          "Could not connect to LiveKit voice service."
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
    <div
      className="glass-card p-6 md:p-10 w-full rounded-2xl"
      data-testid="talk-section"
      style={{
        background: "var(--card-glass-bg)",
        border: "1px solid var(--card-glass-border)",
        boxShadow: "var(--card-glass-shadow)",
      }}
    >
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
