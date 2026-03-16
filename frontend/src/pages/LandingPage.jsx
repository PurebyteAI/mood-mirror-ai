import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Mic,
  PenTool,
  Type,
  Brain,
  Sparkles,
  BarChart2,
  BookOpen,
  Music,
  ChevronDown,
  ArrowRight,
  PlayCircle,
  X,
  Moon,
  Sun,
  Smile,
  Frown,
  Zap,
  Leaf,
  HelpCircle,
  Flame,
} from "lucide-react";

/* ─── tiny helpers ─────────────────────────────────────── */
const STEPS = [
  {
    icon: Type,
    iconAlt: "Input icon",
    colour: "#C084FC",
    step: "01",
    title: "Express Your Mood",
    desc: "Share what you're feeling through text, a hand-drawn sketch, or a spoken message — any medium, any language.",
    subItems: ["Text journal entry", "Free-hand drawing canvas", "Voice / speech recording"],
  },
  {
    icon: Brain,
    iconAlt: "AI analysis icon",
    colour: "#60A5FA",
    step: "02",
    title: "Multimodal AI Analysis",
    desc: "Multi-model (vision + language model) reads your input and pinpoints the dominant emotion with nuanced sub-scores.",
    subItems: ["Vision + language fusion", "6-emotion taxonomy", "Confidence scores per mood"],
  },
  {
    icon: Sparkles,
    iconAlt: "Response icon",
    colour: "#34D399",
    step: "03",
    title: "Personalised Response",
    desc: "The AI crafts a unique poem, motivational message, or light-hearted joke — calibrated to your detected emotional state.",
    subItems: ["Poem · Motivation · Joke", "Multilingual (EN / DE)", "Tone matched to mood intensity"],
  },
  {
    icon: Music,
    iconAlt: "Ambient experience icon",
    colour: "#F97316",
    step: "04",
    title: "Ambient Experience",
    desc: "A living Mood Orb pulses with your emotion while procedurally generated music shifts in real-time to match your inner world.",
    subItems: ["Animated Mood Orb", "Procedural ambient music", "Theme adapts to emotion"],
  },
  {
    icon: BarChart2,
    iconAlt: "Tracking icon",
    colour: "#FCD34D",
    step: "05",
    title: "Track & Reflect",
    desc: "Every check-in is logged. Visualise 90-day mood trends, journal your entries with notes, and spot recurring emotional patterns.",
    subItems: ["90-day trend chart", "Journal with custom notes", "Full mood history"],
  },
];

const EMOTIONS = [
  { icon: Smile, label: "Happiness", colour: "#FCD34D" },
  { icon: Frown, label: "Sadness", colour: "#60A5FA" },
  { icon: Flame, label: "Anger", colour: "#F87171" },
  { icon: Leaf, label: "Calmness", colour: "#34D399" },
  { icon: Zap, label: "Stress", colour: "#F97316" },
  { icon: HelpCircle, label: "Curiosity", colour: "#C084FC" },
];

/* ─── sticky header ─────────────────────────────────────── */
const LandingHeader = ({ onHowItWorks, onNewExpression }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isLight = mounted && theme === "light";

  return (
    <motion.header
      role="banner"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--bg-elevated)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* ── Left: app logo ── */}
        <a
          href="#hero"
          className="flex items-center gap-3 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg"
          aria-label="Mood Mirror AI — home"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          <img
            src="/logo.png"
            alt="Mood Mirror AI logo"
            className="h-9 sm:h-11 w-auto object-contain"
            loading="eager"
          />
        </a>

        {/* ── Right: nav + TU Dresden logo ── */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop nav */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="hidden sm:flex items-center gap-2"
          >
            <button
              onClick={onHowItWorks}
              aria-label="Scroll to How it Works section"
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--control-border)",
                background: "var(--chip-bg)",
              }}
            >
              How it Works
            </button>
            <button
              onClick={onNewExpression}
              aria-label="Start a new mood expression"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style={{
                background: "var(--gradient-primary)",
                color: "var(--gradient-button-text)",
              }}
            >
              <Sparkles size={14} strokeWidth={2} />
              New Expression
            </button>
          </nav>

          {/* Theme toggle — desktop */}
          <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{
              background: "var(--chip-bg)",
              border: "1px solid var(--control-border)",
              color: "var(--text-secondary)",
            }}
          >
            {isLight ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
          </button>

          {/* TU Dresden logo */}
          <img
            src="/TU_Dresden.png"
            alt="TU Dresden logo"
            className="h-7 sm:h-9 w-auto object-contain flex-shrink-0 opacity-80"
            loading="eager"
          />

          {/* Theme toggle — mobile */}
          <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{
              background: "var(--chip-bg)",
              border: "1px solid var(--control-border)",
              color: "var(--text-secondary)",
            }}
          >
            {isLight ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
          </button>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--text-secondary)",
                transform: mobileOpen ? "translateY(5px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--text-secondary)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--text-secondary)",
                transform: mobileOpen ? "translateY(-5px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex flex-col gap-3 px-6 py-5">
              <button
                onClick={() => { onHowItWorks(); setMobileOpen(false); }}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                How it Works
              </button>
              <button
                onClick={() => { onNewExpression(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--gradient-primary)",
                  color: "var(--gradient-button-text)",
                }}
              >
                <Sparkles size={14} strokeWidth={2} />
                New Expression
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

/* ─── Demo modal ─────────────────────────────────────────── */
const DemoModal = ({ open, onClose, onLaunch }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="relative w-full max-w-lg rounded-3xl p-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-highlight)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close demo modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} strokeWidth={2} />
          </button>

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "var(--gradient-primary)" }}
          >
            <PlayCircle size={28} strokeWidth={1.5} style={{ color: "var(--gradient-button-text)" }} />
          </div>

          <h2
            id="demo-modal-title"
            className="text-2xl font-bold mb-3"
            style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', serif" }}
          >
            Try Mood Mirror AI
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            Experience how the app analyses your emotional state, generates a personalised response,
            and creates an ambient visual &amp; audio atmosphere — all in under 10 seconds.
          </p>

          {/* Feature highlights */}
          <ul className="space-y-3 mb-8">
            {[
              { colour: "#C084FC", text: "Type, draw, or speak your current feeling" },
              { colour: "#60A5FA", text: "AI detects emotion with nuanced scoring" },
              { colour: "#34D399", text: "Receive a tailored poem, quote, or joke" },
              { colour: "#F97316", text: "Ambient orb & music shift to match you" },
            ].map(({ colour, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: colour }}
                  aria-hidden="true"
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onLaunch}
            aria-label="Launch the live demo"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--gradient-button-text)",
            }}
          >
            <Sparkles size={16} strokeWidth={2} />
            Launch Live Demo
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Main component ─────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef(null);
  const demoRef = useRef(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const goToApp = () => navigate("/app");

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(192,132,252,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(96,165,250,0.08) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <LandingHeader onHowItWorks={scrollToHowItWorks} onNewExpression={goToApp} />

      {/* ════════════════════════════ HERO ════════════════════════════ */}
      <section
        id="hero"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-20"
        aria-label="Hero section"
      >
        {/* Floating emotion pills */}
        <div aria-hidden="true" className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {EMOTIONS.map(({ icon: Icon, label, colour }, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium"
              style={{
                background: `${colour}18`,
                border: `1px solid ${colour}40`,
                color: colour,
              }}
            >
              <Icon size={12} strokeWidth={2} />
              {label}
            </motion.span>
          ))}
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-bold leading-tight mb-6 max-w-4xl"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.6rem, 6vw, 5rem)",
            color: "var(--text-primary)",
          }}
        >
          Your emotions,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #C084FC 0%, #60A5FA 60%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            understood.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Mood Mirror AI is an emotionally intelligent reflection tool. Express yourself
          via text, drawing, or voice — and receive a personalised poem,
          motivation, or a smile, wrapped in ambient visuals and music.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
        >
          <button
            onClick={goToApp}
            aria-label="Start using Mood Mirror AI"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 shadow-lg"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--gradient-button-text)",
              boxShadow: "0 8px 32px rgba(192,132,252,0.35)",
            }}
          >
            <Sparkles size={16} strokeWidth={2} />
            New Expression
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button
            onClick={scrollToHowItWorks}
            aria-label="Learn how Mood Mirror AI works"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--control-border)",
              background: "var(--chip-bg)",
            }}
          >
            How it Works
            <ChevronDown size={16} strokeWidth={1.5} />
          </button>
        </motion.div>

        {/* Input mode badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-4 sm:gap-6 mt-14"
          aria-label="Supported input modes"
        >
          {[
            { Icon: Type, label: "Text" },
            { Icon: PenTool, label: "Draw" },
            { Icon: Mic, label: "Voice" },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2"
              aria-label={`${label} input mode`}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Icon size={20} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToHowItWorks}
          aria-label="Scroll down to learn more"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity, repeatType: "loop" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
        >
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.button>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="relative z-10 py-24 sm:py-32 px-4 sm:px-8"
        aria-labelledby="how-it-works-title"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-widest mb-5"
              style={{
                background: "rgba(192,132,252,0.12)",
                border: "1px solid rgba(192,132,252,0.3)",
                color: "#C084FC",
              }}
            >
              Pipeline
            </span>
            <h2
              id="how-it-works-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)" }}
            >
              How it Works
            </h2>
            <p
              className="text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Five seamlessly connected stages transform raw emotion into a rich,
              personalised experience — in under 10 seconds.
            </p>
          </motion.div>

          {/* Pipeline diagram – vertical connector */}
          <div className="relative">
            {/* Vertical line (desktop only) */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(192,132,252,0.25) 8%, rgba(96,165,250,0.25) 50%, rgba(52,211,153,0.25) 92%, transparent 100%)",
                transform: "translateX(-50%)",
              }}
            />

            <div className="space-y-8 sm:space-y-12 lg:space-y-0">
              {STEPS.map(({ icon: Icon, colour, step, title, desc, subItems }, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className={`relative flex flex-col lg:flex-row ${
                      isEven ? "lg:pr-[52%]" : "lg:pl-[52%] lg:flex-row-reverse"
                    } lg:mb-16`}
                  >
                    {/* Node on the centre line */}
                    <div
                      aria-hidden="true"
                      className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full items-center justify-center z-10"
                      style={{
                        background: "var(--bg-base)",
                        border: `2px solid ${colour}`,
                        boxShadow: `0 0 20px ${colour}40`,
                      }}
                    >
                      <Icon size={20} strokeWidth={1.5} style={{ color: colour }} />
                    </div>

                    {/* Card */}
                    <article
                      className="w-full rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: "var(--bg-surface)",
                        border: `1px solid ${colour}22`,
                        boxShadow: `0 4px 32px rgba(0,0,0,0.3)`,
                      }}
                      aria-label={`Step ${step}: ${title}`}
                    >
                      {/* Step indicator */}
                      <div className="flex items-center gap-3 mb-4">
                        {/* Mobile icon */}
                        <div
                          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `${colour}18`,
                            border: `1px solid ${colour}40`,
                          }}
                        >
                          <Icon size={18} strokeWidth={1.5} style={{ color: colour }} />
                        </div>
                        <span
                          className="font-mono text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: `${colour}18`,
                            border: `1px solid ${colour}30`,
                            color: colour,
                          }}
                        >
                          Step {step}
                        </span>
                      </div>

                      <h3
                        className="text-xl sm:text-2xl font-bold mb-3"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {title}
                      </h3>
                      <p
                        className="text-sm sm:text-base leading-relaxed mb-5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {desc}
                      </p>

                      {/* Sub-items */}
                      <ul className="space-y-2" role="list">
                        {subItems.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: colour }}
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Emotion taxonomy grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-20 text-center"
          >
            <p
              className="text-sm font-mono uppercase tracking-widest mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              Detectable Emotions
            </p>
            <div
              role="list"
              aria-label="Six detectable emotions"
              className="flex flex-wrap justify-center gap-3"
            >
              {EMOTIONS.map(({ icon: Icon, label, colour }) => (
                <div
                  key={label}
                  role="listitem"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm"
                  style={{
                    background: `${colour}14`,
                    border: `1px solid ${colour}35`,
                    color: colour,
                  }}
                >
                  <Icon size={14} strokeWidth={2} aria-hidden="true" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ FEATURES STRIP ════════════════════ */}
      <section
        className="relative z-10 py-16 px-4 sm:px-8"
        aria-label="Key features"
        style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { icon: Brain, label: "Vision + Language AI", colour: "#C084FC" },
              { icon: Music, label: "Generative Ambient Music", colour: "#60A5FA" },
              { icon: BookOpen, label: "Mood Journal & History", colour: "#34D399" },
              { icon: BarChart2, label: "90-day Trend Charts", colour: "#FCD34D" },
            ].map(({ icon: Icon, label, colour }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${colour}18`, border: `1px solid ${colour}35` }}
                  aria-hidden="true"
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: colour }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ DEMO / CTA FOOTER ════════════════════ */}
      <section
        id="demo"
        ref={demoRef}
        className="relative z-10 py-28 sm:py-36 px-4 sm:px-8 text-center"
        aria-labelledby="demo-section-title"
      >
        {/* Glow blob */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div
            className="w-[600px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(192,132,252,0.1) 0%, rgba(96,165,250,0.06) 50%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Logos row */}
          <div className="flex items-center justify-center gap-6 mb-12" aria-label="Project partners">
            <img
              src="/logo.png"
              alt="Mood Mirror AI logo"
              className="h-12 sm:h-16 w-auto object-contain"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="w-px h-10"
              style={{ background: "var(--border-subtle)" }}
            />
            <img
              src="/TU_Dresden.png"
              alt="TU Dresden logo"
              className="h-10 sm:h-12 w-auto object-contain opacity-70"
              loading="lazy"
            />
          </div>

          <h2
            id="demo-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)" }}
          >
            Ready to meet your mirror?
          </h2>
          <p
            className="text-base sm:text-lg font-light leading-relaxed mb-12 max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            No account required. Express yourself and receive a personalised
            emotional reflection in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary: Demo modal */}
            <button
              onClick={() => setDemoOpen(true)}
              aria-label="Open interactive demo"
              className="flex items-center gap-2.5 px-10 py-4 rounded-full text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style={{
                background: "var(--gradient-primary)",
                color: "var(--gradient-button-text)",
                boxShadow: "0 12px 40px rgba(192,132,252,0.4)",
              }}
            >
              <PlayCircle size={20} strokeWidth={2} />
              Demo
            </button>

            {/* Secondary: Jump straight to app */}
            <button
              onClick={goToApp}
              aria-label="Go directly to the application"
              className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--control-border)",
                background: "var(--chip-bg)",
              }}
            >
              <Sparkles size={16} strokeWidth={1.5} />
              New Expression
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scroll-to-demo button (anchored to demo section) */}
          <button
            onClick={scrollToDemo}
            aria-label="Scroll to demo section"
            className="mt-10 mx-auto flex items-center gap-2 text-xs font-mono transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          >
            <ChevronDown size={14} strokeWidth={1.5} />
            scroll to demo
          </button>
        </motion.div>
      </section>

      {/* ════════════════════ SITE FOOTER ════════════════════ */}
      <footer
        className="relative z-10 py-8 px-6 sm:px-8"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mood Mirror AI" className="h-6 w-auto object-contain" loading="lazy" />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              Mood Mirror AI © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              A project by
            </span>
            <img
              src="/TU_Dresden.png"
              alt="TU Dresden"
              className="h-5 w-auto object-contain opacity-60"
              loading="lazy"
            />
          </div>
        </div>
      </footer>

      {/* Demo modal */}
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} onLaunch={goToApp} />
    </div>
  );
};

export default LandingPage;
