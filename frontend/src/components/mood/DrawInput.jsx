import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, RotateCcw } from "lucide-react";

export const DrawInput = ({ onAnalyze, isAnalyzing }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [brushColor, setBrushColor] = useState("#EDEDED");
  const [brushSize, setBrushSize] = useState(3);

  const COLORS = ["#EDEDED", "#FCD34D", "#60A5FA", "#F87171", "#34D399", "#C084FC", "#F97316"];

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (!hasDrawn || isAnalyzing) return;
    const canvas = canvasRef.current;
    // Send the full base64 data URL to the backend for vision analysis
    const dataUrl = canvas.toDataURL("image/png");
    onAnalyze("drawing", dataUrl);
  };

  return (
    <div className="glass-card p-6 md:p-8" data-testid="draw-input-section">
      {/* Color palette */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              data-testid={`color-${color.replace("#", "")}`}
              onClick={() => setBrushColor(color)}
              className="w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: color,
                border: brushColor === color ? "2px solid white" : "2px solid transparent",
                boxShadow: brushColor === color ? `0 0 12px ${color}66` : "none",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            data-testid="brush-size-slider"
            type="range"
            min="1"
            max="12"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-white opacity-50"
          />
          <button
            data-testid="clear-canvas-btn"
            onClick={clearCanvas}
            className="p-2 rounded-full transition-all hover:bg-white/10"
            style={{ color: "var(--text-muted)" }}
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <canvas
          ref={canvasRef}
          data-testid="drawing-canvas"
          className="drawing-canvas w-full"
          style={{ height: "300px", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm font-light" style={{ color: "var(--text-muted)" }}>
              Draw how you feel...
            </p>
          </div>
        )}
      </div>

      {/* Vision analysis badge */}
      <div className="flex items-center gap-2 mt-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          AI Vision enabled — your drawing will be visually analyzed
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          Express through shapes and colors
        </p>
        <motion.button
          data-testid="analyze-draw-btn"
          onClick={handleSubmit}
          disabled={!hasDrawn || isAnalyzing}
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
