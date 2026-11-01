import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Compass } from "lucide-react";
import { MoodOrb } from "@/components/mood/MoodOrb";
import { InputSection } from "@/components/mood/InputSection";
import { MoodResult, LiveReflectionPreview } from "@/components/mood/MoodResult";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { Header } from "@/components/mood/Header";
import { AppSidebar, MobileNav } from "@/components/mood/AppSidebar";
import { MirrorStage } from "@/components/mood/MirrorStage";
import { PromptCarousel } from "@/components/mood/PromptCarousel";
import { InsightsPage } from "@/components/mood/InsightsPage";
import { SettingsPage } from "@/components/mood/SettingsPage";
import LivingMuseum from "@/components/mood/LivingMuseum";
import { BreathingModal } from "@/components/mood/BreathingModal";
import JournalPage from "@/pages/JournalPage";
import { useTranslation } from "@/i18n";
import { API_BASE } from "@/lib/api";
import { getReflectionStyle, setReflectionStyle as storeReflectionStyle } from "@/lib/preferences";
import { getLanguage, setStoredLanguage, speechLocale } from "@/lib/languages";
import axios from "axios";
import { useTheme } from "next-themes";

const VALID_MODES = new Set(["portal", "text", "draw", "speech", "talk"]);

const MoodMirror = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dominantMood, setDominantMood] = useState(null);
  const [currentView, setCurrentView] = useState("mirror");
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState(getLanguage);
  const [analysisError, setAnalysisError] = useState("");
  const [activeMode, setActiveMode] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const requestedMode = params.get("mode");
      if (requestedMode && VALID_MODES.has(requestedMode)) {
        return requestedMode;
      }
    }
    return "portal";
  });
  const [seedText, setSeedText] = useState("");
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [reflectionStyle, setReflectionStyleState] = useState(getReflectionStyle);
  const lastSubmissionRef = useRef(null);
  const { theme } = useTheme();

  const { t } = useTranslation(language);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      if (Array.isArray(res?.data) && res.data.length > 0) {
        setHistory(res.data);
      }
    } catch (err) {
      // Quietly ignore history fetch errors during initial load or offline mode
    }
  }, []);

  const analyzeMood = useCallback(async (inputType, content, spokenText = null, langOverride = null) => {
    const targetLanguage = langOverride || language;
    lastSubmissionRef.current = { inputType, content, spokenText };
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError("");
    try {
      const res = await axios.post(`${API_BASE}/analyze`, {
        input_type: inputType,
        content: content,
        spoken_text: spokenText,
        language: targetLanguage,
        response_speed: "fast",
        reflection_style: reflectionStyle,
      }, {
        timeout: 30000,
      });
      setAnalysis(res.data);
      setDominantMood(res.data.dominant_mood);
      fetchHistory();
    } catch (err) {
      console.error("Analysis failed:", err);
      if (!err?.response) {
        setAnalysisError(t("networkErrorCalm"));
      } else {
        setAnalysisError(t("aiErrorCalm"));
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [language, t, fetchHistory, reflectionStyle]);

  const changeLanguage = useCallback((lang) => {
    const nextLang = setStoredLanguage(lang);
    setLanguage(nextLang);
    // If a reflection is currently displayed on screen, automatically re-reflect in the newly selected language
    if (analysis) {
      const inputType = lastSubmissionRef.current?.inputType || analysis.input_type || "text";
      const content = lastSubmissionRef.current?.content || analysis.content || "";
      const spokenText = lastSubmissionRef.current?.spokenText || null;
      if (content) {
        analyzeMood(inputType, content, spokenText, nextLang);
      }
    }
  }, [analysis, analyzeMood]);

  const handleReflectionStyleChange = useCallback((styleId) => {
    const next = storeReflectionStyle(styleId);
    setReflectionStyleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = speechLocale(language);
  }, [language]);

  useEffect(() => {
    const sync = () => setReflectionStyleState(getReflectionStyle());
    window.addEventListener("mm-preferences", sync);
    return () => window.removeEventListener("mm-preferences", sync);
  }, []);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API_BASE}/history`)
      .then((res) => {
        if (mounted && Array.isArray(res?.data) && res.data.length > 0) {
          setHistory(res.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleNav = useCallback((view) => {
    if (view === "history") fetchHistory();
    if (view === "mirror") {
      setAnalysis(null);
      setActiveMode("portal");
      setCurrentView("mirror");
      return;
    }
    if (view === "talk") {
      setAnalysis(null);
      setActiveMode("talk");
      setCurrentView("mirror");
      return;
    }
    setCurrentView(view);
  }, [fetchHistory]);

  const resetMirror = useCallback(() => {
    setAnalysis(null);
    setDominantMood(null);
    setAnalysisError("");
    setActiveMode("portal");
    setCurrentView("mirror");
  }, []);

  const pickPrompt = useCallback((text) => {
    setSeedText(text);
    setAnalysis(null);
    setActiveMode("text");
    setCurrentView("mirror");
  }, []);

  const handleSelectReflection = useCallback((item) => {
    if (!item) return;
    setAnalysis(item);
    setDominantMood(item.dominant_mood || "calmness");
    setCurrentView("mirror");
  }, []);

  const handleExitToLanding = useCallback(() => {
    window.location.href = "/";
  }, []);

  return (
    <div
      data-testid="mood-mirror-app"
      className="relative min-h-screen overflow-x-clip theme-transition"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background Mood Ambient Aura */}
      <MoodOrb mood={dominantMood} />

      {/* Atmospheric gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--page-gradient)",
          zIndex: 1,
        }}
      />
      {theme === "romantic" && <div className="romantic-hearts" aria-hidden="true" />}

      <div className="relative z-10 flex min-h-screen">
        {/* Left Fixed Desktop Sidebar */}
        <AppSidebar
          currentView={currentView}
          activeMode={activeMode}
          onNav={handleNav}
          onExit={handleExitToLanding}
          onOpenBreathing={() => setBreathingOpen(true)}
          t={t}
          mood={dominantMood}
          historyCount={history.length}
        />

        {/* Main Application Content Container (offset by 256px fixed sidebar on xl+) */}
        <div className="flex-1 min-w-0 xl:ml-[256px] flex flex-col px-4 md:px-8 xl:px-12 pb-24 xl:pb-10 max-w-[1600px] mx-auto w-full">
          {/* Top Bar with Theme & Language Controls */}
          <Header
            currentView={currentView}
            activeMode={activeMode}
            onNav={handleNav}
            onExit={handleExitToLanding}
            language={language}
            onLanguageChange={changeLanguage}
            t={t}
            dominantMood={dominantMood}
            historyCount={history.length}
          />

          <AnimatePresence mode="wait">
            {currentView === "museum" ? (
              <motion.div
                key="museum"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 pt-2"
              >
                <LivingMuseum
                  history={history}
                  onSelectReflection={handleSelectReflection}
                  onStartReflection={() => handleNav("mirror")}
                  t={t}
                />
              </motion.div>
            ) : currentView === "journal" ? (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <JournalPage onBack={() => handleNav("mirror")} t={t} language={language} embedded />
              </motion.div>
            ) : currentView === "history" ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <MoodHistory
                  history={history}
                  t={t}
                  onSelectReflection={handleSelectReflection}
                  onStartReflection={() => handleNav("mirror")}
                />
              </motion.div>
            ) : currentView === "insights" ? (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <InsightsPage t={t} onStart={() => handleNav("mirror")} />
              </motion.div>
            ) : currentView === "settings" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <SettingsPage
                  t={t}
                  language={language}
                  onLanguageChange={changeLanguage}
                  onHistoryCleared={() => setHistory([])}
                />
              </motion.div>
            ) : analysis ? (
              /* ========================================================================= */
              /* Dedicated Editorial Reflection View (Full Width Multi-Column Dashboard)   */
              /* ========================================================================= */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="flex-1 w-full pt-2"
              >
                <MoodResult
                  analysis={analysis}
                  onReset={resetMirror}
                  t={t}
                  language={language}
                  onExploreInsights={() => handleNav("insights")}
                  onOpenBreathing={() => setBreathingOpen(true)}
                  onNavigateMode={(mode) => {
                    setActiveMode(mode);
                    setAnalysis(null);
                    if (typeof window !== "undefined" && window.scrollTo) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  onStartTalk={() => {
                    setActiveMode("talk");
                    setAnalysis(null);
                    if (typeof window !== "undefined" && window.scrollTo) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  onFollowUp={(question) => {
                    const prior = analysis?.input_preview && !String(analysis.input_preview).startsWith("[")
                      ? analysis.input_preview
                      : "";
                    const content = prior
                      ? `Earlier they shared: ${prior}\nFollow-up inquiry: ${question}`
                      : question;
                    if (typeof window !== "undefined" && window.scrollTo) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    analyzeMood("text", content);
                  }}
                />
              </motion.div>
            ) : (
              /* ========================================================================= */
              /* Input & Intake Workspace (Observatory Portal + Live Calibration Aside)    */
              /* ========================================================================= */
              <motion.div
                key="intake"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start mt-2"
              >
                {/* Center Column Workspace */}
                <div className="flex flex-col min-w-0">
                  {/* Editorial Header on Portal Mode */}
                  {activeMode === "portal" && (
                    <div className="text-center mb-6 max-w-2xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 border"
                        style={{
                          background: "var(--control-bg)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Compass size={12} style={{ color: "var(--aura-gold)" }} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                          Affective Resonance Observatory
                        </span>
                      </div>
                      <h2
                        data-testid="hero-title"
                        className="font-display text-4xl md:text-5xl font-medium mb-3 leading-[1.12] tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {t("heroTitle")}
                      </h2>
                      <p
                        data-testid="hero-subtitle"
                        className="text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {t("heroSubtitle")}
                      </p>
                    </div>
                  )}

                  {/* Main Mode Workspace */}
                  <div className="w-full">
                    {activeMode === "portal" ? (
                      <div className="flex flex-col items-center">
                        <MirrorStage
                          t={t}
                          isAnalyzing={isAnalyzing}
                          onModeChange={setActiveMode}
                          onMirrorClick={() => setActiveMode("text")}
                        />
                        <PromptCarousel t={t} onPick={pickPrompt} />
                      </div>
                    ) : (
                      <InputSection
                        onAnalyze={analyzeMood}
                        isAnalyzing={isAnalyzing}
                        t={t}
                        language={language}
                        activeTab={activeMode}
                        onTabChange={setActiveMode}
                        seedText={seedText}
                        onPickPrompt={pickPrompt}
                        onBackToPortal={() => setActiveMode("portal")}
                        reflectionStyle={reflectionStyle}
                        onReflectionStyleChange={handleReflectionStyleChange}
                      />
                    )}
                  </div>
                </div>

                {/* Right Column: Live Observatory Calibration & Prompt Specimen */}
                <aside className="xl:sticky xl:top-6 w-full">
                  <LiveReflectionPreview
                    isAnalyzing={isAnalyzing}
                    activeMode={activeMode}
                    onPickPrompt={pickPrompt}
                    reflectionStyle={reflectionStyle}
                    onReflectionStyleChange={handleReflectionStyleChange}
                    t={t}
                  />
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav
        currentView={currentView}
        activeMode={activeMode}
        onNav={handleNav}
        t={t}
      />

      {/* Global Breathing Meditation Modal */}
      <BreathingModal
        isOpen={breathingOpen}
        onClose={() => setBreathingOpen(false)}
        t={t}
      />

      {/* Error Notification Toast */}
      <AnimatePresence>
        {analysisError && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 xl:bottom-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl"
            style={{
              left: "50%",
              x: "-50%",
              background: "var(--card-glass-bg)",
              border: "1px solid var(--card-glass-border)",
              backdropFilter: "blur(20px)",
              maxWidth: "480px",
              width: "calc(100vw - 48px)",
            }}
          >
            <AlertCircle size={18} strokeWidth={1.8} style={{ color: "var(--aura-terracotta)" }} className="shrink-0 mt-0.5" />
            <p className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{analysisError}</p>
            <button
              onClick={() => setAnalysisError("")}
              className="hover:scale-105 shrink-0"
              style={{ color: "var(--text-muted)" }}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodMirror;
