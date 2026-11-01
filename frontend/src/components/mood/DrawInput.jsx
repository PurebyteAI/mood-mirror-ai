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
  Mic,
  MicOff,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { speechLocale } from "@/lib/languages";

const PALETTE = [
  { id: "amber", label: "Warm Ochre", color: "#D4A373" },
  { id: "terracotta", label: "Terracotta", color: "#E07A5F" },
  { id: "sage", label: "Botanical Sage", color: "#81B29A" },
  { id: "cerulean", label: "Cerulean Slate", color: "#7CA1C4" },
  { id: "violet", label: "Twilight Iris", color: "#9F7AEA" },
  { id: "sun", label: "Sunlit Gold", color: "#E9C46A" },
  { id: "charcoal", label: "Graphite", color: "#64748B" },
];

const STROKE_SIZES = [
  { id: "fine", label: "Fine", value: 3 },
  { id: "medium", label: "Med", value: 6 },
  { id: "bold", label: "Bold", value: 11 },
];

export const DrawInput = ({ onAnalyze, isAnalyzing, t, language = "en" }) => {
  const { theme = "dark" } = useTheme();
  const canvasBg =
    theme === "light" ? "#FAF6EE" : theme === "romantic" ? "#FFF6F8" : "#11131A";

  const canvasRef = useRef(null);
  const [tool, setTool] = useState("brush");
  const [brushColor, setBrushColor] = useState("#D4A373");
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

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
        // Safe fallback in test environment
      }
    }
  }, [canvasBg]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

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
        recognition.lang = speechLocale(language);

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
    ctx.shadowBlur = 0;
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

    if (tool === "eraser") {
      ctx.strokeStyle = canvasBg;
      ctx.lineWidth = brushSize * 4.5;
      ctx.shadowBlur = 0;
    } else if (tool === "pen") {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = Math.max(1.5, brushSize * 0.45);
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize * 1.4;
      ctx.shadowColor = brushColor;
      ctx.shadowBlur = 3;
    }

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
      onAnalyze("fusion", dataUrl, spokenTranscript.trim());
    } else {
      onAnalyze("drawing", dataUrl);
    }
  };

  return (
    <div className="space-y-4 w-full" data-testid="draw-input-component">
      {/* Atelier Instrument Toolbar */}
      <div
        className="p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        {/* Tool & Stroke Weight Selectors */}
        <div className="flex items-center flex-wrap gap-1.5">
          {[
            { id: "brush", label: "Brush", icon: Brush },
            { id: "pen", label: "Fine Nib", icon: Pen },
            { id: "eraser", label: "Eraser", icon: Eraser },
          ].map((item) => {
            const Icon = item.icon;
            const active = tool === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setTool(item.id)}
                className="p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs"
                style={{
                  background: active ? "var(--chip-active-bg)" : "var(--control-bg)",
                  border: active ? "1px solid var(--border-strong)" : "1px solid var(--border-subtle)",
                  color: active ? "var(--aura-gold)" : "var(--text-secondary)",
                }}
                title={item.label}
                aria-label={item.label}
              >
                <Icon size={15} />
              </button>
            );
          })}

          <div className="w-[1px] h-5 mx-1" style={{ background: "var(--border-subtle)" }} />

          {/* Stroke Weight Selector */}
          <div
            className="flex items-center p-0.5 rounded-xl"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {STROKE_SIZES.map((sz) => {
              const active = brushSize === sz.value;
              return (
                <button
                  type="button"
                  key={sz.id}
                  onClick={() => setBrushSize(sz.value)}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono transition-all"
                  style={{
                    background: active ? "var(--chip-active-bg)" : "transparent",
                    color: active ? "var(--aura-gold)" : "var(--text-muted)",
                  }}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>

          <div className="w-[1px] h-5 mx-1" style={{ background: "var(--border-subtle)" }} />

          {/* Undo / Redo / Clear */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndexRef.current <= 0}
            className="p-2 rounded-xl disabled:opacity-30 transition-all"
            style={{ color: "var(--text-secondary)" }}
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
            className="p-2 rounded-xl disabled:opacity-30 transition-all"
            style={{ color: "var(--text-secondary)" }}
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 size={15} />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-2 rounded-xl transition-all"
            style={{ color: "var(--aura-terracotta)" }}
            title="Clear Canvas"
            aria-label="Clear Canvas"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Pigment Swatches */}
        <div className="flex items-center gap-2">
          {PALETTE.map((p) => {
            const selected = brushColor === p.color && tool !== "eraser";
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  setBrushColor(p.color);
                  if (tool === "eraser") setTool("brush");
                }}
                title={p.label}
                aria-label={p.label}
                className="w-6 h-6 rounded-full transition-transform"
                style={{
                  background: p.color,
                  transform: selected ? "scale(1.2)" : "scale(1)",
                  boxShadow: selected ? "0 0 0 2px var(--bg-base), 0 0 0 4px var(--aura-gold)" : "none",
                }}
              />
            );
          })}
        </div>

        {/* Cross-Modal Voice Recording Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: isVoiceRecording ? "rgba(224, 122, 95, 0.18)" : "var(--control-bg)",
              border: isVoiceRecording
                ? "1px solid var(--aura-terracotta)"
                : "1px solid var(--border-subtle)",
              color: isVoiceRecording ? "var(--aura-terracotta)" : "var(--text-secondary)",
            }}
          >
            {isVoiceRecording ? <Mic size={14} /> : <MicOff size={14} />}
            <span>{isVoiceRecording ? "Recording Voice..." : "Speak While Drawing"}</span>
          </button>
        </div>
      </div>

      {/* Voice Transcription Floating Bar (If active or transcript exists) */}
      <AnimatePresence>
        {(isVoiceRecording || spokenTranscript.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl flex items-center justify-between gap-3"
            style={{
              background: "var(--chip-active-bg)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Zap size={14} style={{ color: "var(--aura-gold)" }} className="shrink-0" />
              <p className="text-xs truncate font-mono" style={{ color: "var(--text-primary)" }}>
                {spokenTranscript || "Listening as you sketch... Speak your thoughts freely."}
              </p>
            </div>
            <span
              className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded shrink-0"
              style={{
                background: "var(--control-bg)",
                color: "var(--aura-gold)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Cross-Modal Fusion
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive HTML5 Drawing Canvas Container */}
      <div
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border"
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
            <Brush size={22} style={{ color: "var(--aura-gold)", opacity: 0.55 }} />
            <p
              className="font-display text-base sm:text-lg font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Sketch gestures, lines, or color fields that mirror your inner state
            </p>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              Toggle ‘Speak While Drawing’ above to fuse spoken cadence with visual gesture
            </p>
          </div>
        )}
      </div>

      {/* Bottom Submit Action */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {spokenTranscript.length > 0
            ? "✦ Multimodal Fusion Active (Visual + Spoken)"
            : "Atelier Canvas // Visual Affect Mode"}
        </div>

        <motion.button
          type="button"
          data-testid="draw-submit-btn"
          disabled={!hasDrawn || isAnalyzing}
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-mirror-me flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{t("analyzing")}</span>
            </>
          ) : (
            <>
              <span>{spokenTranscript ? "Synthesize Fusion" : t("mirrorMe")}</span>
              <ArrowUpRight size={16} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default DrawInput;
