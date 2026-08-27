import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2, Sparkles, User, Heart, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/lib/api";

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
      const barWidth = 3;
      const gap = (rect.width - barCount * barWidth) / (barCount - 1);
      const centerY = rect.height / 2;

      let freqData = new Uint8Array(32);
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(freqData);
      }

      for (let i = 0; i < barCount; i += 1) {
        const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
        const curve = Math.cos(distFromCenter * Math.PI * 0.5);

        let height = 4;
        if (isRecording) {
          const freqIndex = Math.min(freqData.length - 1, Math.floor((i / barCount) * freqData.length));
          const amp = freqData[freqIndex] / 255;
          const wave = Math.sin(t * 8 + i * 0.4) * 0.3 + 0.7;
          height = Math.max(4, (amp * 50 + wave * 14) * curve);
        } else {
          height = Math.max(3, (Math.sin(t * 2 + i * 0.2) * 3 + 4) * curve);
        }

        const x = i * (barWidth + gap);
        const gradient = ctx.createLinearGradient(0, centerY - height, 0, centerY + height);
        gradient.addColorStop(0, "#C084FC");
        gradient.addColorStop(0.5, "#60A5FA");
        gradient.addColorStop(1, "#34D399");

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
      formData.append("language", language === "de" ? "de" : "en");
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
    <div className="space-y-6 w-full" data-testid="speech-input-section">
      {/* Main Glass Voice Card */}
      <div
        className="relative rounded-3xl p-6 md:p-8 transition-all duration-300"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        {/* Title & Guidance */}
        <div className="text-center mb-6">
          <h3
            className="font-display text-xl md:text-2xl font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {isRecording ? "I'm listening..." : isTranscribing ? "Transcribing speech..." : "Speak from your heart"}
          </h3>
          <p className="text-xs md:text-sm font-light" style={{ color: "var(--text-muted)" }}>
            There's no right or wrong here. Express how you feel.
          </p>
        </div>

        {/* Central Audio Waveform & Mic Button */}
        <div className="relative flex flex-col items-center justify-center my-4 py-4">
          <div className="w-full max-w-md px-4">
            <ReactiveWaveform isRecording={isRecording} analyserRef={analyserRef} />
          </div>

          {/* Central Pulsing Mic Button */}
          <div className="relative mt-2 flex flex-col items-center">
            {isRecording && (
              <>
                <div
                  className="absolute inset-0 rounded-full animate-pulse-ring"
                  style={{ background: "rgba(155, 108, 255, 0.35)", transform: "scale(1.4)" }}
                />
                <div
                  className="absolute inset-0 rounded-full animate-pulse-ring"
                  style={{ background: "rgba(96, 165, 250, 0.2)", transform: "scale(1.8)", animationDelay: "0.4s" }}
                />
              </>
            )}

            <motion.button
              data-testid="record-btn"
              onClick={toggleRecording}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 z-10"
              style={{
                background: isRecording
                  ? "radial-gradient(circle, #EC4899 0%, #8B5CF6 100%)"
                  : "linear-gradient(135deg, rgba(155, 108, 255, 0.25), rgba(101, 120, 255, 0.15))",
                border: isRecording ? "2px solid rgba(255, 255, 255, 0.6)" : "1.5px solid rgba(155, 108, 255, 0.4)",
                boxShadow: isRecording
                  ? "0 0 50px rgba(236, 72, 153, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)"
                  : "0 0 24px rgba(155, 108, 255, 0.2)",
              }}
              disabled={isBusy && !isRecording}
            >
              {isRecording ? (
                <MicOff size={28} className="text-white" />
              ) : isTranscribing ? (
                <Loader2 size={28} className="animate-spin text-violet-500 dark:text-violet-300" />
              ) : (
                <Mic size={28} className="text-violet-500 dark:text-violet-300" />
              )}
            </motion.button>

            {/* Timer Readout */}
            <div className="mt-3 text-center">
              <span
                className="font-mono text-sm font-semibold tracking-wider"
                style={{ color: "var(--text-primary)" }}
              >
                {formatTimer(seconds)}
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {isRecording ? "Tap to stop" : isTranscribing ? "Processing..." : "Tap to speak"}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl mb-4 bg-red-500/10 border border-red-500/20 text-center text-xs text-red-500">
            {error}
          </div>
        )}

        {/* Live Transcript / Result Text Area */}
        {transcript && (
          <div
            className="mt-4 p-4 rounded-2xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p className="text-xs text-violet-500 dark:text-violet-400 font-semibold mb-1">Transcribed words:</p>
            <p
              data-testid="speech-transcript"
              className="text-sm md:text-base font-light italic"
              style={{ color: "var(--text-primary)" }}
            >
              "{transcript}"
            </p>
          </div>
        )}

        {/* 3 Guidance Pills */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-6 pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <User size={13} className="text-violet-500 dark:text-violet-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>Speak naturally</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>No need to be perfect</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Heart size={13} className="text-pink-500 dark:text-pink-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>We're here for you</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Safe. Private. Non-judgmental.</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Clock size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>Take your time</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>There's no rush</p>
            </div>
          </div>
        </div>

        {/* Bottom Submission Action Bar */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--divider-subtle)" }}
        >
          <p
            className="text-xs font-light hidden sm:block"
            style={{ color: "var(--text-muted)" }}
          >
            {transcript ? `${transcript.split(" ").length} words recorded` : "Press Enter to submit"}
          </p>

          <motion.button
            data-testid="analyze-speech-btn"
            onClick={handleSubmit}
            disabled={!transcript.trim() || isBusy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-mirror-me ml-auto flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("analyzing")}</span>
              </>
            ) : (
              <>
                <span>{t("mirrorMe")}</span>
                <Sparkles size={15} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Bottom Info Bar: "How it works" + "Your safe space" */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 items-stretch">
        <div
          className="p-4 rounded-2xl flex flex-col justify-between"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-violet-500 dark:text-violet-400" />
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              How it works
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-violet-500 dark:text-violet-300">1. Express</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Speak freely about what's in your heart.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-300">2. Reflect</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                I analyze your words, tone & emotions.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-pink-500 dark:text-pink-300">3. Understand</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Gain insights and clarity about yourself.
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl flex flex-col justify-between"
          style={{
            background: "var(--card-glass-bg)",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "var(--card-glass-shadow)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Your safe space
              </span>
            </div>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Everything you share is private, secure, and never shared.
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-medium text-violet-500 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer">
              Learn more <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
