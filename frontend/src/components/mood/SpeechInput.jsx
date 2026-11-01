import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2, User, Heart, Clock, ArrowUpRight, Radio } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import { isSupportedLanguage } from "@/lib/languages";

const ReactiveWaveform = ({ isRecording, analyserRef }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return undefined;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let t = 0;
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const barCount = 48;
      const barWidth = 2.5;
      const gap = (rect.width - barCount * barWidth) / (barCount - 1);
      const centerY = rect.height / 2;

      let freqData = new Uint8Array(32);
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(freqData);
      }

      for (let i = 0; i < barCount; i += 1) {
        const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
        const curve = Math.cos(distFromCenter * Math.PI * 0.5);

        let height = 3.5;
        if (isRecording) {
          const freqIndex = Math.min(freqData.length - 1, Math.floor((i / barCount) * freqData.length));
          const amp = freqData[freqIndex] / 255;
          const wave = Math.sin(t * 8 + i * 0.4) * 0.3 + 0.7;
          height = Math.max(4, (amp * 48 + wave * 12) * curve);
        } else {
          height = Math.max(2.5, (Math.sin(t * 2 + i * 0.2) * 2.5 + 3.5) * curve);
        }

        const x = i * (barWidth + gap);
        const gradient = ctx.createLinearGradient(0, centerY - height, 0, centerY + height);
        gradient.addColorStop(0, "#D4A373");
        gradient.addColorStop(0.5, "#E07A5F");
        gradient.addColorStop(1, "#81B29A");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, centerY - height, barWidth, height * 2, 2);
        } else {
          ctx.rect(x, centerY - height, barWidth, height * 2);
        }
        ctx.fill();
      }

      t += 0.04;
    };

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording, analyserRef]);

  return <canvas ref={canvasRef} className="w-full h-24 block" />;
};

export const SpeechInput = ({ onAnalyze, isAnalyzing, t, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((trk) => trk.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const transcribeBlob = useCallback(async (blob) => {
    setIsTranscribing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("language", isSupportedLanguage(language) ? language : "en");
      const res = await axios.post(`${API_BASE}/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscript(res.data.text || "");
    } catch (err) {
      console.error("Transcription failed:", err);
      setError(t("transcriptionFailed") || "Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  }, [language, t]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      stopAudio();
      return;
    }

    setTranscript("");
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"]
        .find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        chunksRef.current = [];
        transcribeBlob(blob);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access failed:", err);
      setError(t("micAccessFailed") || "Microphone access denied. Please allow mic access and try again.");
    }
  };

  const handleSubmit = () => {
    if (!transcript.trim() || isAnalyzing) return;
    onAnalyze("speech", transcript.trim());
  };

  const isBusy = isAnalyzing || isTranscribing;

  return (
    <div className="space-y-4 w-full" data-testid="speech-input-section">
      {/* Main Acoustic Studio Card */}
      <div
        className="relative rounded-2xl p-6 md:p-8 transition-all duration-300"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        {/* Studio Header */}
        <div
          className="flex items-center justify-between pb-3.5 mb-5 border-b"
          style={{ borderColor: "var(--divider-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Radio size={13} style={{ color: isRecording ? "var(--aura-terracotta)" : "var(--aura-sage)" }} />
            <span
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--text-muted)" }}
            >
              Acoustic Capture // Vocal Cadence
            </span>
          </div>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: isRecording ? "var(--aura-terracotta)" : "var(--text-muted)" }}
          >
            {formatTimer(seconds)}
          </span>
        </div>

        {/* Title & Guidance */}
        <div className="text-center mb-4">
          <h3
            className="font-display text-2xl md:text-3xl font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {isRecording
              ? "Listening to your voice..."
              : isTranscribing
              ? "Transcribing vocal cadence..."
              : "Speak from your heart"}
          </h3>
          <p className="text-xs md:text-sm font-light" style={{ color: "var(--text-secondary)" }}>
            Speak unhurriedly; pauses and shifts in tone are part of your reflection.
          </p>
        </div>

        {/* Central Audio Waveform & Mic Button */}
        <div className="relative flex flex-col items-center justify-center my-4 py-2">
          <div className="w-full max-w-md px-4">
            <ReactiveWaveform isRecording={isRecording} analyserRef={analyserRef} />
          </div>

          {/* Central Pulsing Mic Button */}
          <div className="relative mt-2 flex flex-col items-center">
            {isRecording && (
              <>
                <div
                  className="absolute inset-0 rounded-full animate-pulse-ring"
                  style={{ background: "rgba(224, 122, 95, 0.28)", transform: "scale(1.35)" }}
                />
                <div
                  className="absolute inset-0 rounded-full animate-pulse-ring"
                  style={{ background: "rgba(212, 163, 115, 0.16)", transform: "scale(1.7)", animationDelay: "0.4s" }}
                />
              </>
            )}

            <motion.button
              type="button"
              data-testid="record-btn"
              onClick={toggleRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 z-10"
              style={{
                background: isRecording
                  ? "linear-gradient(135deg, #E07A5F 0%, #D4A373 100%)"
                  : "var(--chip-active-bg)",
                border: isRecording
                  ? "2px solid rgba(255, 255, 255, 0.55)"
                  : "1.5px solid var(--border-strong)",
                boxShadow: isRecording
                  ? "0 12px 36px rgba(224, 122, 95, 0.45)"
                  : "var(--card-glass-shadow)",
                color: isRecording ? "#FFFFFF" : "var(--aura-gold)",
              }}
              disabled={isBusy && !isRecording}
            >
              {isRecording ? (
                <MicOff size={26} />
              ) : isTranscribing ? (
                <Loader2 size={26} className="animate-spin" />
              ) : (
                <Mic size={26} />
              )}
            </motion.button>

            <p className="text-[11px] font-mono mt-3" style={{ color: "var(--text-muted)" }}>
              {isRecording ? "Tap to finish recording" : isTranscribing ? "Processing audio..." : "Tap microphone to begin"}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="p-3 rounded-xl mb-4 text-center text-xs"
            style={{
              background: "rgba(224, 122, 95, 0.12)",
              border: "1px solid rgba(224, 122, 95, 0.35)",
              color: "var(--aura-terracotta)",
            }}
          >
            {error}
          </div>
        )}

        {/* Live Transcript / Result Text Area */}
        {transcript && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <p
              className="text-[10px] font-mono uppercase tracking-wider mb-1.5"
              style={{ color: "var(--aura-gold)" }}
            >
              Transcribed Utterance:
            </p>
            <p
              data-testid="speech-transcript"
              className="font-display text-base md:text-lg italic leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              “{transcript}”
            </p>
          </div>
        )}

        {/* 3 Studio Notes */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5 pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <User size={14} style={{ color: "var(--aura-gold)" }} className="shrink-0" />
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Speak naturally</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Unscripted thoughts welcome</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Heart size={14} style={{ color: "var(--aura-terracotta)" }} className="shrink-0" />
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Non-judgmental</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Private acoustic session</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Clock size={14} style={{ color: "var(--aura-sage)" }} className="shrink-0" />
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Unhurried pace</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Take all the time you need</p>
            </div>
          </div>
        </div>

        {/* Bottom Submission Action Bar */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <p
            className="text-xs font-mono hidden sm:block"
            style={{ color: "var(--text-muted)" }}
          >
            {transcript ? `${transcript.split(/\s+/).length} words captured` : "Record a voice note to reflect"}
          </p>

          <motion.button
            type="button"
            data-testid="analyze-speech-btn"
            onClick={handleSubmit}
            disabled={!transcript.trim() || isBusy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-mirror-me ml-auto flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("analyzing")}</span>
              </>
            ) : (
              <>
                <span>{t("mirrorMe")}</span>
                <ArrowUpRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
