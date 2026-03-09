import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

export const SpeechInput = ({ onAnalyze, isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = () => {
    if (!transcript.trim() || isAnalyzing) return;
    onAnalyze("speech", transcript.trim());
  };

  if (!supported) {
    return (
      <div className="glass-card p-8 text-center" data-testid="speech-not-supported">
        <MicOff size={40} strokeWidth={1.5} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <p className="text-lg font-light" style={{ color: "var(--text-secondary)" }}>
          Speech recognition is not supported in your browser.
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Try using Chrome or Edge for voice input.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8" data-testid="speech-input-section">
      {/* Microphone button */}
      <div className="flex flex-col items-center py-8">
        <div className="relative">
          {isRecording && (
            <>
              <div
                className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{
                  background: "rgba(248, 113, 113, 0.3)",
                  transform: "scale(1.5)",
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{
                  background: "rgba(248, 113, 113, 0.15)",
                  transform: "scale(2)",
                  animationDelay: "0.3s",
                }}
              />
            </>
          )}
          <motion.button
            data-testid="record-btn"
            onClick={toggleRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: isRecording
                ? "linear-gradient(135deg, #F87171 0%, #EF4444 100%)"
                : "rgba(255,255,255,0.06)",
              border: isRecording
                ? "2px solid rgba(248,113,113,0.5)"
                : "2px solid rgba(255,255,255,0.1)",
              boxShadow: isRecording ? "0 0 40px rgba(248,113,113,0.4)" : "none",
            }}
            disabled={isAnalyzing}
          >
            {isRecording ? (
              <MicOff size={28} strokeWidth={1.5} color="#030303" />
            ) : (
              <Mic size={28} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
            )}
          </motion.button>
        </div>

        <p
          className="mt-6 text-sm font-mono"
          style={{ color: isRecording ? "#F87171" : "var(--text-muted)" }}
          data-testid="recording-status"
        >
          {isRecording ? "Listening..." : "Tap to start speaking"}
        </p>
      </div>

      {/* Transcript display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p
            data-testid="speech-transcript"
            className="text-lg font-light leading-relaxed italic"
            style={{ color: "var(--text-primary)" }}
          >
            "{transcript}"
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {transcript ? `${transcript.split(" ").length} words captured` : "Express through voice"}
        </p>
        <motion.button
          data-testid="analyze-speech-btn"
          onClick={handleSubmit}
          disabled={!transcript.trim() || isAnalyzing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #C084FC 0%, #60A5FA 100%)",
            color: "#030303",
          }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send size={16} strokeWidth={1.5} />
              Mirror Me
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
