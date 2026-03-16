import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { MoodOrb } from "@/components/mood/MoodOrb";
import { InputSection } from "@/components/mood/InputSection";
import { MoodResult } from "@/components/mood/MoodResult";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { Header } from "@/components/mood/Header";
import { AmbientControl } from "@/components/mood/AmbientControl";
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

  const { t } = useTranslation(language);

  const analyzeMood = useCallback(async (inputType, content) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError("");
    try {
      const res = await axios.post(`${API_BASE}/analyze`, {
        input_type: inputType,
        content: content,
        language: language,
      });
      setAnalysis(res.data);
      setDominantMood(res.data.dominant_mood);
    } catch (err) {
      console.error("Analysis failed:", err);
      const detail = err?.response?.data?.detail;
      const status = err?.response?.status;
      if (!err?.response) {
        setAnalysisError("Cannot reach the backend server. Check the deployed backend URL and CORS configuration.");
      } else {
        setAnalysisError(detail || `Analysis failed (${status || "unknown error"}). Please try again.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [language]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed:", err);
    }
  }, []);

  const handleNav = useCallback((view) => {
    if (view === "history") fetchHistory();
    setCurrentView(view);
  }, [fetchHistory]);

  const resetMirror = useCallback(() => {
    setAnalysis(null);
    setDominantMood(null);
    setAnalysisError("");
  }, []);

  return (
    <div
      data-testid="mood-mirror-app"
      className="relative min-h-screen overflow-hidden theme-transition"
      style={{ background: "var(--bg-base)" }}
    >
      <MoodOrb mood={dominantMood} />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--page-gradient)",
          zIndex: 1,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-8 min-h-screen flex flex-col">
        <Header
          currentView={currentView}
          onNav={handleNav}
          language={language}
          onLanguageChange={setLanguage}
          t={t}
        />

        <AnimatePresence mode="wait">
          {currentView === "journal" ? (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <JournalPage onBack={() => handleNav("mirror")} t={t} language={language} />
            </motion.div>
          ) : currentView === "history" ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <MoodHistory history={history} t={t} />
            </motion.div>
          ) : analysis ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex items-start justify-center pt-8"
            >
              <MoodResult analysis={analysis} onReset={resetMirror} t={t} language={language} />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                className="text-center mb-12 max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2
                  data-testid="hero-title"
                  className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("heroTitle")}
                </h2>
                <p
                  data-testid="hero-subtitle"
                  className="text-lg md:text-xl font-light leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("heroSubtitle")}
                </p>
              </motion.div>

              <InputSection
                onAnalyze={analyzeMood}
                isAnalyzing={isAnalyzing}
                t={t}
                language={language}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient music control */}
      <AmbientControl mood={dominantMood} label={t("ambientMusic")} />

      {/* Error toast */}
      <AnimatePresence>
        {analysisError && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl"
            style={{
              left: "50%",
              x: "-50%",
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.4)",
              backdropFilter: "blur(12px)",
              maxWidth: "480px",
              width: "calc(100vw - 48px)",
            }}
          >
            <AlertCircle size={18} strokeWidth={1.5} style={{ color: "#F87171", flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm flex-1" style={{ color: "#F87171" }}>{analysisError}</p>
            <button
              onClick={() => setAnalysisError("")}
              style={{ color: "rgba(248,113,113,0.6)", flexShrink: 0 }}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodMirror;
