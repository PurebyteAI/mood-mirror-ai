import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/lib/api";

const WaveformCanvas = ({ analyserRef, isRecording }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "var(--bg-surface-soft)";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#F87171";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#F87171";
      ctx.beginPath();
      const sliceWidth = rect.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * rect.height) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      analyser.getByteFrequencyData(dataArray);
      const barCount = 32;
      const barWidth = rect.width / barCount;
      const step = Math.floor(bufferLength / barCount);
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = (value / 255) * rect.height * 0.6;
        const hue = (value / 255) * 60 + 340;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.4)`;
        ctx.fillRect(i * barWidth + 1, rect.height - barHeight, barWidth - 2, barHeight);
      }
    };
    draw();
  }, [analyserRef]);

  useEffect(() => {
    if (isRecording) drawWaveform();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isRecording, drawWaveform]);

  useEffect(() => {
    if (!isRecording) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--wave-bg").trim() || "#0A0A0A";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--divider-subtle").trim() || "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();
    }
  }, [isRecording]);

  return <canvas ref={canvasRef} data-testid="waveform-canvas" className="w-full rounded-lg" style={{ height: "80px", background: "var(--wave-bg)" }} />;
};

export const SpeechInput = ({ onAnalyze, isAnalyzing, t, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), []);

  const stopAudio = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
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
      // Stop recording — MediaRecorder.onstop will fire and transcribe
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

      // Set up waveform analyser
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine best supported MIME type
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

      recorder.start(100); // collect data every 100ms
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
    <div className="glass-card p-6 md:p-8" data-testid="speech-input-section">
      <div className="mb-6 rounded-lg overflow-hidden" style={{ border: "1px solid var(--divider-subtle)" }}>
        <WaveformCanvas analyserRef={analyserRef} isRecording={isRecording} />
      </div>

      <div className="flex flex-col items-center py-4">
        <div className="relative">
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: "rgba(248, 113, 113, 0.3)", transform: "scale(1.5)" }} />
              <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: "rgba(248, 113, 113, 0.15)", transform: "scale(2)", animationDelay: "0.3s" }} />
            </>
          )}
          <motion.button
            data-testid="record-btn" onClick={toggleRecording} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: isRecording ? "linear-gradient(135deg, #F87171 0%, #EF4444 100%)" : "var(--control-bg)",
              border: isRecording ? "2px solid rgba(248,113,113,0.5)" : "2px solid var(--control-border)",
              boxShadow: isRecording ? "0 0 40px rgba(248,113,113,0.4)" : "none",
            }}
            disabled={isBusy && !isRecording}
          >
            {isRecording
              ? <MicOff size={28} strokeWidth={1.5} color="var(--gradient-button-text)" />
              : isTranscribing
                ? <Loader2 size={28} strokeWidth={1.5} className="animate-spin" style={{ color: "var(--text-secondary)" }} />
                : <Mic size={28} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />}
          </motion.button>
        </div>
        <p className="mt-4 text-sm font-mono" style={{ color: isRecording ? "#F87171" : "var(--text-muted)" }} data-testid="recording-status">
          {isRecording ? (t("listening") || "Listening…") : isTranscribing ? (t("transcribing") || "Transcribing…") : (t("tapToSpeak") || "Tap to speak")}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-xl" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
          <p className="text-sm" style={{ color: "#F87171" }}>{error}</p>
        </motion.div>
      )}

      {transcript && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-xl" style={{ background: "var(--bg-surface-soft)", border: "1px solid var(--divider-subtle)" }}>
          <p data-testid="speech-transcript" className="text-lg font-light leading-relaxed italic" style={{ color: "var(--text-primary)" }}>"{transcript}"</p>
        </motion.div>
      )}

      <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--divider-subtle)" }}>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {transcript ? `${transcript.split(" ").length} ${t("wordsCaptured") || "words captured"}` : t("expressVoice") || "Express yourself with your voice"}
        </p>
        <motion.button
          data-testid="analyze-speech-btn" onClick={handleSubmit} disabled={!transcript.trim() || isBusy}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-primary)", color: "var(--gradient-button-text)" }}
        >
          {isAnalyzing ? (<><Loader2 size={16} strokeWidth={1.5} className="animate-spin" />{t("analyzing") || "Analyzing…"}</>) : (<><Send size={16} strokeWidth={1.5} />{t("mirrorMe") || "Mirror Me"}</>)}
        </motion.button>
      </div>
    </div>
  );
};
