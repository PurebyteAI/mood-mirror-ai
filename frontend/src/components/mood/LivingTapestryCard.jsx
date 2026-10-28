import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Maximize2, X, RefreshCw, Wand2 } from "lucide-react";
import { API_BASE } from "@/lib/api";
import axios from "axios";
import { useTranslation } from "@/i18n";

export const LivingTapestryCard = ({ analysis, language = "en" }) => {
  const { t } = useTranslation(language);
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const moodKey = (analysis?.dominant_mood || "joy").toLowerCase();
  const scene = (analysis?.input_preview || analysis?.tapestry_prompt || "this moment")
    .replace(/\s+/g, " ")
    .trim();

  const generate = async () => {
    setIsGenerating(true);
    setFailed(false);
    try {
      const res = await axios.post(`${API_BASE}/image/generate`, {
        user_input: analysis?.input_preview || analysis?.tapestry_prompt || "Emotional reflection",
        response_text: analysis?.response_text || "",
        dominant_mood: analysis?.dominant_mood || "joy",
        response_type: analysis?.response_type || "poem",
        language,
        tapestry_prompt: analysis?.tapestry_prompt || "",
      });

      if (res.data?.generated === false) {
        setFailed(true);
        return;
      }
      if (res.data?.image_url) {
        setImageUrl(res.data.image_url);
        setGenerationCount((c) => c + 1);
        return;
      }
      if (res.data?.image_base64) {
        const b64 = res.data.image_base64;
        setImageUrl(b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`);
        setGenerationCount((c) => c + 1);
        return;
      }
      setFailed(true);
    } catch (err) {
      console.warn("Image generation failed:", err);
      setFailed(true);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!analysis?.id) return undefined;
    setImageUrl(null);
    setGenerationCount(0);
    let cancelled = false;
    const run = async () => {
      setIsGenerating(true);
      setFailed(false);
      try {
        const res = await axios.post(`${API_BASE}/image/generate`, {
          user_input: analysis.input_preview || analysis.tapestry_prompt || "Emotional reflection",
          response_text: analysis.response_text || "",
          dominant_mood: analysis.dominant_mood || "joy",
          response_type: analysis.response_type || "poem",
          language,
          tapestry_prompt: analysis.tapestry_prompt || "",
        });
        if (cancelled) return;
        if (res.data?.image_url) {
          setImageUrl(res.data.image_url);
          setGenerationCount(1);
        } else if (res.data?.image_base64) {
          const b64 = res.data.image_base64;
          setImageUrl(b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`);
          setGenerationCount(1);
        } else {
          setFailed(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Image generation failed:", err);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // Regenerate only when a new reflection arrives. The scene fields are read from that snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis?.id, language]);

  return (
    <>
      <div
        data-testid="living-tapestry-card"
        className="h-full flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: "var(--card-glass-bg)",
          border: "1px solid var(--card-glass-border)",
          boxShadow: "var(--card-glass-shadow)",
        }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            From your words
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => imageUrl && setLightboxOpen(true)}
              disabled={!imageUrl}
              className="p-1.5 rounded-full disabled:opacity-40"
              style={{ color: "var(--text-secondary)" }}
              aria-label={t("museumFullscreen")}
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!imageUrl) return;
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = `mood-mirror-${moodKey}.jpg`;
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              disabled={!imageUrl}
              className="p-1.5 rounded-full disabled:opacity-40"
              style={{ color: "var(--text-secondary)" }}
              aria-label={t("downloadImage")}
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-[240px] mx-3 mb-3 rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface-soft)" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={scene ? `${t("generatedMoodImageAlt")}: ${scene}` : t("generatedMoodImageAlt")}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {failed ? t("imageFailedLead") : t("imageDrawing")}
              </p>
              <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-primary)" }}>
                {scene}
              </p>
            </div>
          )}

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                style={{ background: "color-mix(in srgb, var(--bg-base) 55%, transparent)" }}
              >
                <RefreshCw size={18} className="animate-spin" style={{ color: "var(--aura-violet)" }} />
                <span className="text-[11px] font-mono" style={{ color: "var(--text-primary)" }}>
                  {t("paintingWords")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-2 right-2">
            <button
              type="button"
              onClick={generate}
              disabled={isGenerating}
              className="on-fill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Wand2 size={12} />
              <span>{generationCount > 0 ? t("redraw") : t("drawScene")}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={imageUrl} alt={scene} className="w-full max-h-[85vh] object-contain rounded-2xl" />
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white"
                aria-label={t("close")}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LivingTapestryCard;
