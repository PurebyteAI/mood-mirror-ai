import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Quote, Sparkles, BookmarkPlus, Check, Download, Image as ImageIcon } from "lucide-react";
import { MoodChart } from "@/components/mood/MoodChart";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import { useTheme } from "next-themes";

const MOOD_COLORS_DARK = {
  happiness: "#FCD34D", happy: "#FCD34D",
  sadness: "#60A5FA", sad: "#60A5FA",
  anger: "#F87171", angry: "#F87171",
  calmness: "#34D399", calm: "#34D399",
  stress: "#F97316", stressed: "#F97316",
  curiosity: "#C084FC", curious: "#C084FC",
};

const MOOD_COLORS_LIGHT = {
  happiness: "#d4a840", happy: "#d4a840",
  sadness: "#6898d0", sad: "#6898d0",
  anger: "#c86858", angry: "#c86858",
  calmness: "#5aaa78", calm: "#5aaa78",
  stress: "#c87840", stressed: "#c87840",
  curiosity: "#9870c0", curious: "#9870c0",
};

const RESPONSE_TYPE_KEYS = {
  poem: "poem", motivation: "motivation", joke: "joke",
};

const INPUT_TYPE_KEYS = {
  text: "textInput", drawing: "drawingInput", speech: "speechInput",
};

export const MoodResult = ({ analysis, onReset, t, language }) => {
  const { resolvedTheme } = useTheme();
  const MOOD_COLORS = resolvedTheme === "light" ? MOOD_COLORS_LIGHT : MOOD_COLORS_DARK;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [journalNote, setJournalNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const dominantColor = MOOD_COLORS[analysis.dominant_mood?.toLowerCase()] || "#C084FC";
  const dominantLabel = t(analysis.dominant_mood?.toLowerCase()) || analysis.dominant_mood;
  const responseLabel = t(RESPONSE_TYPE_KEYS[analysis.response_type] || analysis.response_type);
  const inputLabel = t(INPUT_TYPE_KEYS[analysis.input_type] || analysis.input_type);

  const saveToJournal = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/journal/save`, { analysis_id: analysis.id, note: journalNote });
      setSaved(true);
      setShowNoteInput(false);
    } catch (err) { console.error("Failed to save:", err); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    let active = true;
    const generateImage = async () => {
      setIsImageLoading(true);
      setImageError("");
      setImageData(null);
      try {
        const res = await axios.post(`${API_BASE}/image/generate`, {
          user_input: analysis.input_preview || "",
          response_text: analysis.response_text,
          dominant_mood: analysis.dominant_mood,
          response_type: analysis.response_type,
          language: language || "en",
        });
        if (!active) return;
        if (res.data?.generated && (res.data?.image_url || res.data?.image_base64)) {
          setImageData(res.data);
        } else {
          setImageError(t("imageUnavailable"));
        }
      } catch (err) {
        if (!active) return;
        setImageError(t("imageUnavailable"));
      } finally {
        if (active) setIsImageLoading(false);
      }
    };
    generateImage();
    return () => {
      active = false;
    };
  }, [analysis, language, t]);

  const downloadImage = async () => {
    if (!imageData || isDownloading) return;
    const source = imageData.image_url || imageData.image_base64;
    if (!source) return;
    setIsDownloading(true);
    try {
      const response = await fetch(source);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `mood-mirror-${analysis.id}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setImageError(t("imageDownloadFailed"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl" data-testid="mood-result">
      <motion.button
        data-testid="back-to-mirror-btn" onClick={onReset}
        whileHover={{ scale: 1.05, x: -4 }} whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 mb-8 text-sm font-medium transition-all"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        {t("newExpression")}
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="glass-card p-8 text-center" style={{ boxShadow: `0 0 60px ${dominantColor}22` }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>{t("dominantMood")}</p>
            <h3 data-testid="dominant-mood" className="font-display text-4xl font-bold mb-2" style={{ color: dominantColor }}>{dominantLabel}</h3>
            <div className="w-16 h-1 mx-auto rounded-full mt-4" style={{ background: dominantColor }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>{t("emotionBreakdown")}</p>
            <MoodChart emotions={analysis.emotions} t={t} />
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="glass-card p-8 flex flex-col" style={{ boxShadow: `0 0 40px ${dominantColor}11` }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} strokeWidth={1.5} style={{ color: dominantColor }} />
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{responseLabel}</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className="relative">
                <Quote size={32} strokeWidth={1} className="absolute -top-2 -left-2 opacity-20" style={{ color: dominantColor }} />
                <p data-testid="ai-response-text" className="font-display text-xl md:text-2xl font-normal leading-relaxed pl-8" style={{ color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                  {analysis.response_text}
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4" style={{ borderTop: "1px solid var(--divider-subtle)" }}>
              <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {t("analyzedFrom")}: {inputLabel}
                {analysis.input_preview && analysis.input_type !== "drawing" && (
                  <span className="ml-2 italic opacity-60">— "{analysis.input_preview}"</span>
                )}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
            {saved ? (
              <div className="flex items-center gap-3" data-testid="journal-saved">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}>
                  <Check size={16} strokeWidth={2} color="#34D399" />
                </div>
                <p className="text-sm font-medium" style={{ color: "#34D399" }}>{t("savedToJournal")}</p>
              </div>
            ) : showNoteInput ? (
              <div className="space-y-3">
                <textarea
                  data-testid="journal-note-input" value={journalNote} onChange={(e) => setJournalNote(e.target.value)}
                  placeholder={t("addNote")} rows={2}
                  className="w-full bg-transparent resize-none outline-none text-sm font-light"
                  style={{ color: "var(--text-primary)" }}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button data-testid="cancel-save-btn" onClick={() => setShowNoteInput(false)} className="px-4 py-2 rounded-full text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("cancel")}</button>
                  <motion.button
                    data-testid="confirm-save-btn" onClick={saveToJournal} disabled={saving}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 rounded-full text-xs font-medium"
                    style={{ background: dominantColor, color: "var(--gradient-button-text)" }}
                  >
                    {saving ? t("saving") : t("saveEntry")}
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                data-testid="save-to-journal-btn" onClick={() => setShowNoteInput(true)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all"
                style={{ border: `1px solid ${dominantColor}33`, color: dominantColor }}
              >
                <BookmarkPlus size={16} strokeWidth={1.5} />
                {t("saveToJournal")}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="glass-card p-5 mt-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} strokeWidth={1.5} style={{ color: dominantColor }} />
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {t("moodImage")}
            </p>
          </div>
          {imageData && (
            <motion.button
              onClick={downloadImage}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
              style={{ border: `1px solid ${dominantColor}33`, color: dominantColor }}
            >
              <Download size={14} strokeWidth={1.5} />
              {isDownloading ? t("downloadingImage") : t("downloadImage")}
            </motion.button>
          )}
        </div>

        <div
          className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ height: "500px", background: "var(--bg-surface-soft)" }}
        >
          {isImageLoading ? (
            <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{t("generatingImage")}</p>
          ) : imageData ? (
            <img
              src={imageData.image_url || imageData.image_base64}
              alt={t("generatedMoodImageAlt")}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center px-6">
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t("imageFallbackTitle")}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{imageError || t("imageFallbackHint")}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
