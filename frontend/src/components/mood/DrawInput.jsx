import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brush,
  Pen,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Loader2,
  Sparkles,
  Shield,
  Eye,
  Mic,
  MicOff,
  Zap,
  Volume2,
} from "lucide-react";

const PALETTE = [
  { id: "purple", color: "#A855F7" },
  { id: "pink", color: "#EC4899" },
  { id: "blue", color: "#3B82F6" },
  { id: "teal", color: "#10B981" },
  { id: "amber", color: "#F59E0B" },
  { id: "dark", color: "#1E1B4B" },
  { id: "slate", color: "#64748B" },
];

export const DrawInput = ({ onAnalyze, isAnalyzing, t }) => {
  const canvasBg = "#071126";

  const canvasRef = useRef(null);
  const [tool, setTool] = useState("brush");
  const [brushColor, setBrushColor] = useState("#A855F7");
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Cross-Modal Fusion voice state
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const recognitionRef = useRef(null);

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      try {
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        historyRef.current = [snapshot];
        historyIndexRef.current = 0;
      } catch (e) {
        // Safe fallback
      }
    }
  }, [canvasBg]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Handle Speech Recognition for Cross-Modal Fusion
  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Safari/Edge.");
      return;
    }

    if (isVoiceRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let fullText = "";
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + " ";
          }
          setSpokenTranscript(fullText.trim());
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition notice:", event.error);
        };

        recognition.onend = () => {
          setIsVoiceRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsVoiceRecording(true);
      } catch (err) {
        console.error("Speech recognition start failed:", err);
      }
    }
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    try {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(snapshot);
      if (newHistory.length > 20) newHistory.shift();
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
    } catch (e) {
      // Safe fallback
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      restoreHistoryState(historyIndexRef.current);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      restoreHistoryState(historyIndexRef.current);
    }
  };

  const restoreHistoryState = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const snapshot = historyRef.current[index];
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setSpokenTranscript("");
    if (isVoiceRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    }
    historyRef.current = [];
    historyIndexRef.current = -1;
    saveHistoryState();
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const pos = getCanvasPos(e);
    setIsDrawing(true);
    setHasDrawn(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getCanvasPos(e);

    ctx.strokeStyle = tool === "eraser" ? canvasBg : brushColor;
    ctx.lineWidth = tool === "eraser" ? brushSize * 4 : brushSize;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    if (spokenTranscript.trim().length > 0) {
      // Cross-Modal Fusion mode (Drawing + Spoken Voice)
      onAnalyze("fusion", dataUrl, spokenTranscript.trim());
    } else {
      // Standard drawing mode
      onAnalyze("drawing", dataUrl);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto" data-testid="draw-input-component">
      {/* Top Toolbar */}
      <div
        className="p-3.5 sm:p-4 rounded-3xl backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        {/* Tool Selectors */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("brush")}
            className={`p-2.5 rounded-2xl transition-all ${
              tool === "brush"
                ? "bg-violet-500/25 text-violet-300 border border-violet-500/40"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="Brush Tool"
          >
            <Brush size={16} />
          </button>
          <button
            onClick={() => setTool("pen")}
            className={`p-2.5 rounded-2xl transition-all ${
              tool === "pen"
                ? "bg-violet-500/25 text-violet-300 border border-violet-500/40"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="Fine Pen"
          >
            <Pen size={16} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2.5 rounded-2xl transition-all ${
              tool === "eraser"
                ? "bg-violet-500/25 text-violet-300 border border-violet-500/40"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="Eraser Tool"
          >
            <Eraser size={16} />
          </button>

          <div className="w-[1px] h-5 bg-white/10 mx-1" />

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndexRef.current <= 0}
            className="p-2 rounded-xl text-white/60 hover:text-white disabled:opacity-30 transition-all"
            title="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
            className="p-2 rounded-xl text-white/60 hover:text-white disabled:opacity-30 transition-all"
            title="Redo"
          >
            <Redo2 size={15} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-xl text-red-400/70 hover:text-red-400 transition-all"
            title="Clear Canvas"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          {PALETTE.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setBrushColor(p.color);
                if (tool === "eraser") setTool("brush");
              }}
              className={`w-6 h-6 rounded-full transition-transform ${
                brushColor === p.color && tool !== "eraser"
                  ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                  : "hover:scale-110"
              }`}
              style={{ background: p.color }}
            />
          ))}
        </div>

        {/* Cross-Modal Voice Recording Toggle */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleVoiceRecording}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isVoiceRecording
                ? "bg-red-500/20 border-red-500/50 text-red-300 shadow-lg animate-pulse"
                : "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {isVoiceRecording ? <Mic size={14} className="text-red-400" /> : <MicOff size={14} />}
            <span>{isVoiceRecording ? "Recording Voice..." : "Speak While Drawing"}</span>
          </motion.button>
        </div>
      </div>

      {/* Voice Transcription Floating Bar (If active or transcript exists) */}
      <AnimatePresence>
        {(isVoiceRecording || spokenTranscript.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 border border-violet-500/30"
            style={{
              background: "linear-gradient(135deg, rgba(155, 108, 255, 0.15) 0%, rgba(102, 183, 255, 0.15) 100%)",
            }}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Zap size={15} className="text-violet-400 shrink-0 animate-pulse" />
              <p className="text-xs text-white/90 truncate font-mono">
                {spokenTranscript || "Listening as you sketch... Speak your thoughts freely."}
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 shrink-0">
              Cross-Modal Fusion
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive HTML5 Drawing Canvas Container */}
      <div
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          background: canvasBg,
          borderColor: "var(--card-glass-border)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Empty Canvas Callout */}
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center space-y-2 text-center p-4">
            <Sparkles size={24} className="text-violet-400/40" />
            <p className="font-display text-sm sm:text-base text-white/30 font-medium">
              Draw shapes, textures, or chaotic colors that match your inner feeling
            </p>
            <p className="text-[11px] text-white/20">
              Toggle 'Speak While Drawing' above to narrate simultaneously
            </p>
          </div>
        )}
      </div>

      {/* Bottom Submit Action */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-white/50 font-mono">
          {spokenTranscript.length > 0 ? "⚡ Multimodal Fusion Active (Drawing + Speech)" : "Visual Metaphor Drawing Mode"}
        </div>

        <motion.button
          data-testid="draw-submit-btn"
          disabled={!hasDrawn || isAnalyzing}
          onClick={handleSubmit}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-mirror-me flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{t("analyzing")}</span>
            </>
          ) : (
            <>
              <span>{spokenTranscript ? "Synthesize Fusion ✨" : t("mirrorMe")}</span>
              <Sparkles size={15} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default DrawInput;
