import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Play, Pause, RotateCcw, ShieldCheck, Zap, PenTool, Mic, Type, MessageSquare } from "lucide-react";

const FRAME_COUNT = 240;

export const ScrollFrameCanvas = ({ onLaunch }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const imagesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const playIntervalRef = useRef(null);

  // Story milestones matching frame progression
  const storyMilestones = [
    {
      frameRange: [0, 60],
      badge: "ScaDS.AI · Multimodal AI",
      title: "Look into the mirror that truly listens.",
      desc: "An ambient consciousness designed for emotional introspection, mindful breathing, and clarity.",
      icon: Sparkles,
      color: "#C084FC",
    },
    {
      frameRange: [61, 120],
      badge: "4 Rich Modalities",
      title: "Write. Draw. Speak. Connect.",
      desc: "Express how you feel without barriers — via freeform text, sketches on canvas, speech, or live talk.",
      icon: PenTool,
      color: "#F472B6",
    },
    {
      frameRange: [121, 180],
      badge: "Groq AI Speed",
      title: "Deep Emotional Understanding.",
      desc: "Multi-vision and language intelligence extracts dominant feeling tones and crafts personalized poetic resonance.",
      icon: Zap,
      color: "#60A5FA",
    },
    {
      frameRange: [181, 239],
      badge: "100% Confidential",
      title: "Zero Login. Pure Reflection.",
      desc: "No password, no sign-up wall. Your thoughts remain entirely private to your local browser session.",
      icon: ShieldCheck,
      color: "#34D399",
    },
  ];

  // Draw frame to canvas with object-fit cover
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Preload all 240 frames
  useEffect(() => {
    let loaded = 0;
    const imgs = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const numStr = String(i).padStart(6, "0");
      img.src = `/frames/frame_${numStr}.jpg`;

      img.onload = () => {
        loaded++;
        if (loaded === 1) {
          drawFrame(0);
        }
        if (loaded >= 20) {
          setIsLoaded(true);
        }
      };

      imgs.push(img);
    }

    imagesRef.current = imgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      return;
    }

    playIntervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev >= FRAME_COUNT - 1 ? 0 : prev + 1;
        drawFrame(next);

        // Update active story milestone
        if (next < 60) setActiveStoryIdx(0);
        else if (next < 120) setActiveStoryIdx(1);
        else if (next < 180) setActiveStoryIdx(2);
        else setActiveStoryIdx(3);

        return next;
      });
    }, 1000 / 24); // 24 FPS

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, drawFrame]);

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      drawFrame(currentFrame);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame, currentFrame]);

  const handleSeek = (e) => {
    const frame = parseInt(e.target.value, 10);
    setCurrentFrame(frame);
    drawFrame(frame);
    if (frame < 60) setActiveStoryIdx(0);
    else if (frame < 120) setActiveStoryIdx(1);
    else if (frame < 180) setActiveStoryIdx(2);
    else setActiveStoryIdx(3);
  };

  const activeMilestone = storyMilestones[activeStoryIdx];
  const Icon = activeMilestone.icon;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300"
      style={{
        background: "var(--card-glass-bg)",
        borderColor: "var(--card-glass-border)",
        boxShadow: "var(--card-glass-shadow)",
        minHeight: "520px",
        height: "68vh",
        maxHeight: "720px",
      }}
    >
      {/* Canvas Video Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          filter: "brightness(0.92) contrast(1.08)",
        }}
      />

      {/* Cinematic Dark Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(2, 8, 23, 0.25) 0%, rgba(2, 8, 23, 0.82) 100%)",
        }}
      />

      {/* Left/Center Story Card Overlay */}
      <div className="absolute inset-0 z-10 p-6 sm:p-10 md:p-14 flex flex-col justify-between pointer-events-none">
        {/* Top Tag */}
        <div className="flex items-center justify-between w-full">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider pointer-events-auto"
            style={{
              background: "var(--control-bg)",
              border: "1px solid var(--border-subtle)",
              backdropFilter: "blur(16px)",
              color: activeMilestone.color,
            }}
          >
            <Icon size={14} />
            <span>{activeMilestone.badge}</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onLaunch}
            className="btn-mirror-me hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold shadow-lg pointer-events-auto"
          >
            <span>Enter Mirror</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Center Animated Narrative */}
        <div className="max-w-xl space-y-3 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStoryIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <h2
                className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 leading-tight"
                style={{
                  background: "linear-gradient(135deg, #FFB49D 0%, #C084FC 45%, #66B7FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {activeMilestone.title}
              </h2>
              <p
                className="text-xs sm:text-base font-light leading-relaxed max-w-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                {activeMilestone.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Video Scrubber Controls */}
        <div
          className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl max-w-xl w-full pointer-events-auto"
          style={{
            background: "var(--control-bg)",
            border: "1px solid var(--border-subtle)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform active:scale-95 shrink-0"
            style={{
              background: isPlaying ? "rgba(155, 108, 255, 0.25)" : "var(--chip-active-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
            }}
            aria-label={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          {/* Reset Frame */}
          <button
            onClick={() => {
              setCurrentFrame(0);
              drawFrame(0);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform active:scale-95 shrink-0"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
            title="Reset Frame"
          >
            <RotateCcw size={13} />
          </button>

          {/* Range Slider Scrubber */}
          <input
            type="range"
            min="0"
            max={FRAME_COUNT - 1}
            value={currentFrame}
            onChange={handleSeek}
            className="flex-1 accent-purple-500 cursor-pointer h-1.5 rounded-full bg-white/20"
          />

          {/* Frame Counter / Percentage */}
          <span
            className="text-[11px] font-mono font-medium shrink-0 px-2 py-1 rounded-md"
            style={{
              background: "rgba(0,0,0,0.2)",
              color: "var(--text-muted)",
            }}
          >
            {Math.round((currentFrame / (FRAME_COUNT - 1)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScrollFrameCanvas;
