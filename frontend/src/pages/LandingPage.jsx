import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  PenTool,
  Type,
  Brain,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { getLanguage, setStoredLanguage, speechLocale } from "@/lib/languages";
import { LanguageSwitcher } from "@/components/mood/LanguageSwitcher";

const FRAME_COUNT = 240;

export const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [language, setLanguage] = useState(getLanguage);
  const { t } = useTranslation(language);

  const changeLanguage = (lang) => {
    setLanguage(setStoredLanguage(lang));
  };

  useEffect(() => {
    document.documentElement.lang = speechLocale(language);
  }, [language]);

  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const animFrameIdRef = useRef(null);

  const handleLaunch = () => {
    navigate("/app");
  };

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
    const imgs = [];
    let firstLoaded = false;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const numStr = String(i).padStart(6, "0");
      img.src = `/frames/frame_${numStr}.jpg`;

      img.onload = () => {
        if (!firstLoaded) {
          firstLoaded = true;
          drawFrame(0);
        }
      };

      imgs.push(img);
    }

    imagesRef.current = imgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth frame interpolation loop
  useEffect(() => {
    const animate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * 0.18;
        const frameIdx = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.round(currentFrameRef.current))
        );
        drawFrame(frameIdx);
      }
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [drawFrame]);

  // Window resize handler for canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(Math.round(currentFrameRef.current));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Scroll listener tracking window scroll percentage and mapping to frames
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const currentScroll = window.scrollY;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScroll));

      setScrollPercent(Math.round(progress * 100));
      targetFrameRef.current = progress * (FRAME_COUNT - 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [1, 2, 3, 4].map((n) => ({
    q: t(`landFaq${n}q`),
    a: t(`landFaq${n}a`),
  }));

  return (
    <div
      className="relative min-h-screen overflow-x-hidden flex flex-col selection:bg-purple-500 selection:text-white"
      style={{
        background: "#020817",
        color: "var(--text-primary)",
      }}
    >
      {/* ========================================================================= */}
      {/* FULL-PAGE FIXED SCROLLING CANVAS BACKGROUND                               */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "brightness(0.9) contrast(1.1) saturate(1.1)",
          }}
        />

        {/* Ambient Dark Cosmic Vignette Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(2, 8, 23, 0.2) 0%, rgba(2, 8, 23, 0.85) 100%)",
          }}
        />
      </div>

      {/* Floating Scroll Progress Pill */}
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full shadow-2xl transition-all pointer-events-auto"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          boxShadow: "var(--card-glass-shadow)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="w-16 h-1 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${scrollPercent}%`,
              background: "linear-gradient(90deg, #FFB49D, #C084FC, #66B7FF)",
            }}
          />
        </div>
        <span
          className="text-[11px] font-mono font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {scrollPercent}%
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: "var(--sidebar-bg)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Brand + Institutional Partner Logos */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 text-left group"
            >
              <div className="relative w-9 h-9 rounded-full flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #FFB49D, #8C63FF 50%, #66B7FF 100%)",
                    boxShadow: "0 0 20px rgba(155, 108, 255, 0.6)",
                  }}
                />
                <div className="w-4 h-4 rounded-full" style={{ background: "var(--bg-base)" }} />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-tight text-gradient block leading-tight">
                  Mood Mirror AI
                </span>
                <span className="text-[10px] tracking-wider uppercase font-mono" style={{ color: "var(--text-muted)" }}>
                  {t("landBrandSub")}
                </span>
              </div>
            </button>

            {/* Institutional Logos (ScaDS.AI & TU Dresden) */}
            <div className="hidden lg:flex items-center gap-3 pl-4 ml-2 border-l border-white/10">
              <img
                src="/logo.png"
                alt="ScaDS.AI"
                style={{ height: "20px", width: "auto" }}
                className="object-contain opacity-90 hover:opacity-100 transition-opacity"
                title="ScaDS.AI - Center for Scalable Data Analytics and Artificial Intelligence"
              />
              <div className="w-[1px] h-4" style={{ background: "var(--border-subtle)" }} />
              <img
                src="/TU_Dresden.png"
                alt="TU Dresden"
                style={{ height: "20px", width: "auto" }}
                className="object-contain opacity-90 hover:opacity-100 transition-opacity brightness-200 contrast-125"
                title="TU Dresden"
              />
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-purple-400 transition-colors">
              {t("landExperience")}
            </button>
            <button onClick={() => document.getElementById("modalities")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-purple-400 transition-colors">
              {t("landModalities")}
            </button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-purple-400 transition-colors">
              {t("landHow")}
            </button>
            <button onClick={() => document.getElementById("research")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-purple-400 transition-colors">
              {t("landResearch")}
            </button>
            <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-purple-400 transition-colors">
              {t("landFaq")}
            </button>
          </nav>

          {/* Right: Launch App CTA */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher language={language} onChange={changeLanguage} label={t("settingsLanguage")} testId="landing-language-switcher" />
            <motion.button
              data-testid="launch-app-btn"
              onClick={handleLaunch}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-mirror-me flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg"
            >
              <span>{t("landEnter")}</span>
              <Sparkles size={14} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FLOATING SCROLL SECTIONS (Overlaying Fullscreen Scroll Canvas)             */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex flex-col items-center w-full">
        {/* ======================================================================= */}
        {/* SECTION 1: OPEN CINEMATIC HERO SCENE                                    */}
        {/* ======================================================================= */}
        <section className="min-h-screen w-full flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-24 pb-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center max-w-4xl space-y-6"
          >
            {/* Institutional Research Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide shadow-lg backdrop-blur-xl"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid rgba(155, 108, 255, 0.4)",
                color: "var(--text-primary)",
              }}
            >
              <Sparkles size={14} className="text-violet-400" />
              <span>{t("landBadge")}</span>
            </div>

            {/* Open, Majestic Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.08] tracking-tight drop-shadow-2xl">
              {t("landHeroBefore")}{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FFB49D 0%, #C084FC 45%, #66B7FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("landHeroAccent")}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("landHeroBody")}
            </p>

            {/* Interactive Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <motion.button
                onClick={handleLaunch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="btn-mirror-me flex items-center justify-center gap-3 px-9 py-4 rounded-full text-base font-semibold shadow-2xl"
              >
                <span>{t("landEnterApp")}</span>
                <ArrowRight size={18} />
              </motion.button>

              <button
                onClick={() => document.getElementById("modalities")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-medium transition-all backdrop-blur-xl shadow-lg hover:border-violet-500/40"
                style={{
                  background: "var(--card-glass-bg)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>{t("landScroll")}</span>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Trust Badges */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium backdrop-blur-md px-5 py-2 rounded-full"
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                color: "var(--text-muted)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{t("landTrustLogin")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={14} className="text-violet-400" />
                <span>{t("landTrustPrivate")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-blue-400" />
                <span>{t("landTrustEngine")}</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION 2: 4 MULTIMODAL MODALITIES                                      */}
        {/* ======================================================================= */}
        <section id="modalities" className="min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase text-violet-400 tracking-wider block mb-2">
              {t("landModalKicker")}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-3">
              {t("landModalTitle")}
            </h2>
            <p className="text-sm sm:text-base font-light" style={{ color: "var(--text-secondary)" }}>
              {t("landModalBody")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Text */}
            <div
              className="p-7 rounded-3xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
                boxShadow: "var(--card-glass-shadow)",
              }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-violet-500/15 text-violet-400 border border-violet-500/30">
                  <Type size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {t("landWriteTitle")}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {t("landWriteBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-violet-400">{t("landWriteMeta")}</span>
                <button onClick={handleLaunch} className="text-xs font-semibold flex items-center gap-1 hover:underline">
                  {t("landTryWrite")} <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* Card 2: Draw */}
            <div
              className="p-7 rounded-3xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
                boxShadow: "var(--card-glass-shadow)",
              }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  <PenTool size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {t("landDrawTitle")}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {t("landDrawBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-pink-400">{t("landDrawMeta")}</span>
                <button onClick={handleLaunch} className="text-xs font-semibold flex items-center gap-1 hover:underline">
                  {t("landTryDraw")} <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* Card 3: Speak */}
            <div
              className="p-7 rounded-3xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
                boxShadow: "var(--card-glass-shadow)",
              }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <Mic size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {t("landSpeakTitle")}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {t("landSpeakBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-400">{t("landSpeakMeta")}</span>
                <button onClick={handleLaunch} className="text-xs font-semibold flex items-center gap-1 hover:underline">
                  {t("landTrySpeak")} <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* Card 4: Talk Beta */}
            <div
              className="p-7 rounded-3xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
                boxShadow: "var(--card-glass-shadow)",
              }}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <MessageSquare size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {t("landTalkTitle")}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {t("landTalkBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400">{t("landTalkMeta")}</span>
                <button onClick={handleLaunch} className="text-xs font-semibold flex items-center gap-1 hover:underline">
                  {t("landTryTalk")} <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION 3: THE 3-STEP INTROSPECTION JOURNEY                             */}
        {/* ======================================================================= */}
        <section id="how-it-works" className="min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase text-violet-400 tracking-wider block mb-2">
              {t("landLoopKicker")}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-3">
              {t("landLoopTitle")}
            </h2>
            <p className="text-sm sm:text-base font-light" style={{ color: "var(--text-secondary)" }}>
              {t("landLoopBody")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="p-8 rounded-3xl backdrop-blur-2xl text-center flex flex-col items-center space-y-4"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20">
                1
              </div>
              <h3 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("landStep1Title")}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {t("landStep1Body")}
              </p>
            </div>

            <div
              className="p-8 rounded-3xl backdrop-blur-2xl text-center flex flex-col items-center space-y-4"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20">
                2
              </div>
              <h3 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("landStep2Title")}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {t("landStep2Body")}
              </p>
            </div>

            <div
              className="p-8 rounded-3xl backdrop-blur-2xl text-center flex flex-col items-center space-y-4"
              style={{
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20">
                3
              </div>
              <h3 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("landStep3Title")}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {t("landStep3Body")}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION 5: RESEARCH & INSTITUTIONAL AFFILIATIONS                        */}
        {/* ======================================================================= */}
        <section id="research" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div
            className="p-8 md:p-12 rounded-3xl backdrop-blur-2xl flex flex-col lg:flex-row items-center justify-between gap-10"
            style={{
              background: "var(--card-glass-bg)",
              border: "1px solid var(--card-glass-border)",
              boxShadow: "var(--card-glass-shadow)",
            }}
          >
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <span className="text-xs font-mono font-semibold uppercase text-violet-400 tracking-wider">
                {t("landResearchKicker")}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                {t("landResearchTitle")}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {t("landResearchBody")}
              </p>
            </div>

            <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <img
                src="/logo.png"
                alt="ScaDS.AI Logo"
                style={{ height: "38px", width: "auto" }}
                className="object-contain"
              />
              <div className="w-[1px] h-8 bg-white/20" />
              <img
                src="/TU_Dresden.png"
                alt="TU Dresden Logo"
                style={{ height: "38px", width: "auto" }}
                className="object-contain brightness-200 contrast-125"
              />
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION 6: FAQ ACCORDION                                                */}
        {/* ======================================================================= */}
        <section id="faq" className="py-24 px-4 sm:px-8 max-w-4xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold uppercase text-violet-400 tracking-wider block mb-2">
              {t("landFaqKicker")}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold">{t("landFaqTitle")}</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden backdrop-blur-2xl transition-colors"
                  style={{
                    background: "var(--card-glass-bg)",
                    border: "1px solid var(--card-glass-border)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 text-violet-400 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs sm:text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* SECTION 7: FINAL CALL TO ACTION BANNER                                  */}
        {/* ======================================================================= */}
        <section className="py-24 px-4 sm:px-8 max-w-5xl mx-auto w-full text-center">
          <div
            className="p-10 sm:p-16 rounded-3xl backdrop-blur-2xl relative overflow-hidden flex flex-col items-center space-y-6"
            style={{
              background: "linear-gradient(135deg, rgba(155, 108, 255, 0.18) 0%, rgba(102, 183, 255, 0.18) 100%)",
              border: "1px solid rgba(155, 108, 255, 0.35)",
              boxShadow: "0 20px 60px rgba(155, 108, 255, 0.2)",
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-300">
              <Sparkles size={24} />
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-xl">
              {t("landCtaTitle")}
            </h2>

            <p className="text-sm sm:text-base font-light max-w-lg" style={{ color: "var(--text-secondary)" }}>
              {t("landCtaBody")}
            </p>

            <motion.button
              onClick={handleLaunch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="btn-mirror-me px-10 py-4 rounded-full text-base font-semibold shadow-2xl flex items-center gap-3"
            >
              <span>{t("landCtaButton")}</span>
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer
        className="relative z-10 mt-auto py-12 px-4 sm:px-8 border-t"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--sidebar-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #FFB49D, #8C63FF 50%, #66B7FF 100%)",
                }}
              />
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: "var(--bg-base)" }} />
            </div>
            <div>
              <span className="font-display text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Mood Mirror AI
              </span>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {t("landFooterTag")}
              </p>
            </div>
          </div>

          {/* Institutional Logos in Footer */}
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="ScaDS.AI"
              style={{ height: "20px", width: "auto" }}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <img
              src="/TU_Dresden.png"
              alt="TU Dresden"
              style={{ height: "20px", width: "auto" }}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity brightness-200 contrast-125"
            />
          </div>

          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Mood Mirror AI · {t("landFooterCopy")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
