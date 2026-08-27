import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
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
import axios from "axios";

const MoodMirror = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dominantMood, setDominantMood] = useState(null);
  const [currentView, setCurrentView] = useState("mirror");
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("en");
  const [analysisError, setAnalysisError] = useState("");
  const [activeMode, setActiveMode] = useState("portal");
  const [seedText, setSeedText] = useState("");
  const [breathingOpen, setBreathingOpen] = useState(false);

  const { t } = useTranslation(language);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const analyzeMood = useCallback(async (inputType, content, spokenText = null) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError("");
    try {
      const res = await axios.post(`${API_BASE}/analyze`, {
        input_type: inputType,
        content: content,
        spoken_text: spokenText,
        language: language,
        response_speed: "fast",
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
  }, [language, t, fetchHistory]);

  const handleSelectDemoScenario = useCallback((scenario) => {
    analyzeMood(scenario.input_type, scenario.content);
    setActiveMode("portal");
  }, [analyzeMood]);

  const handleNav = useCallback((view) => {
    if (view === "history") fetchHistory();
    if (view === "mirror") {
      setActiveMode("portal");
      setCurrentView("mirror");
      return;
    }
    if (view === "talk") {
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
    setActiveMode("text");
    setCurrentView("mirror");
  }, []);

  const handleExitToLanding = useCallback(() => {
    window.location.href = "/";
  }, []);

  return (
    <div
      data-testid="mood-mirror-app"
      className="relative min-h-screen overflow-x-hidden theme-transition"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background Mood Ambient Aura */}
      <MoodOrb mood={dominantMood} />

      {/* Cosmic background gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--page-gradient)",
          zIndex: 1,
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Fixed Desktop Sidebar */}
        <AppSidebar
          currentView={currentView}
          onNav={handleNav}
          onExit={handleExitToLanding}
          t={t}
          mood={dominantMood}
          historyCount={history.length}
        />

        {/* Main Application Content Container */}
        <div className="flex-1 min-w-0 flex flex-col px-4 md:px-8 xl:px-10 pb-24 xl:pb-8">
          {/* Top Bar with integrated Demo Presets */}
          <Header
            currentView={currentView}
            onNav={handleNav}
            onExit={handleExitToLanding}
            language={language}
            onLanguageChange={setLanguage}
            t={t}
            dominantMood={dominantMood}
            onSelectScenario={handleSelectDemoScenario}
          />

          <AnimatePresence mode="wait">
            {currentView === "museum" ? (
              <motion.div
                key="museum"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 pt-2"
              >
                <LivingMuseum onStartReflection={() => handleNav("mirror")} t={t} />
              </motion.div>
            ) : currentView === "journal" ? (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <JournalPage onBack={() => handleNav("mirror")} t={t} language={language} embedded />
              </motion.div>
            ) : currentView === "history" ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <MoodHistory history={history} t={t} />
              </motion.div>
            ) : currentView === "insights" ? (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <InsightsPage t={t} onStart={() => handleNav("mirror")} />
              </motion.div>
            ) : currentView === "settings" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <SettingsPage t={t} language={language} onLanguageChange={setLanguage} />
              </motion.div>
            ) : analysis ? (
              /* ========================================================================= */
              /* Dedicated Cinematic Reflection View (Full Width Multi-Column Dashboard)   */
              /* ========================================================================= */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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
                  }}
                  onStartTalk={() => {
                    setActiveMode("talk");
                    setAnalysis(null);
                  }}
                />
              </motion.div>
            ) : (
              /* ========================================================================= */
              /* Input & Intake Workspace (Portal + Live Preview)                          */
              /* ========================================================================= */
              <motion.div
                key="intake"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start mt-2"
              >
                {/* Center Column Workspace */}
                <div className="flex flex-col min-w-0">
                  {/* Hero Header on Portal Mode */}
                  {activeMode === "portal" && (
                    <div className="text-center mb-6 max-w-2xl mx-auto">
                      <h2
                        data-testid="hero-title"
                        className="font-display text-4xl md:text-5xl font-bold mb-2.5 leading-tight tracking-tight"
                        style={{
                          background: "linear-gradient(135deg, #FFB49D 0%, #C084FC 45%, #66B7FF 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {t("heroTitle")}
                      </h2>
                      <p
                        data-testid="hero-subtitle"
                        className="text-xs md:text-sm font-light leading-relaxed max-w-lg mx-auto"
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
                      />
                    )}
                  </div>
                </div>

                {/* Right Column: Live Reflection Preview Particle Blob */}
                <aside className="xl:sticky xl:top-6 w-full">
                  <LiveReflectionPreview
                    isAnalyzing={isAnalyzing}
                    activeMode={activeMode}
                    onPickPrompt={pickPrompt}
                  />
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav currentView={currentView} onNav={handleNav} t={t} />

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
            <AlertCircle size={18} strokeWidth={1.8} className="text-pink-500 shrink-0 mt-0.5" />
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
