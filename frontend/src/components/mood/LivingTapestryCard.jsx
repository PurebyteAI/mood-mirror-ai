import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, Maximize2, X, RefreshCw, Wand2, Palette } from "lucide-react";
import { API_BASE } from "@/lib/api";
import axios from "axios";

const CURATED_DREAMSCAPES = {
  calmness: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  calm: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85",
  hopeful: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85",
  reflective: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85",
  curiosity: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
  happiness: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=85",
  joy: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=85",
  joyful: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=85",
  excitement: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=85",
  stress: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=85",
  anxiety: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=85",
  overwhelm: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=85",
  sadness: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85",
  melancholy: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85",
  anger: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
  nostalgia: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85",
  stillness: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85",
  peace: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
};

export const LivingTapestryCard = ({ analysis, language = "en" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const moodKey = (analysis?.dominant_mood || "calmness").toLowerCase();
  const defaultArt = CURATED_DREAMSCAPES[moodKey] || CURATED_DREAMSCAPES.calmness;
  const currentImage = imageUrl || defaultArt;

  const handleGenerateTapestry = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_BASE}/image/generate`, {
        user_input: analysis.input_preview || "Emotional reflection",
        response_text: analysis.response_text || "",
        dominant_mood: analysis.dominant_mood || "calmness",
        response_type: analysis.response_type || "reflection",
        language: language,
      });

      if (res.data?.image_url) {
        setImageUrl(res.data.image_url);
      } else if (res.data?.image_base64) {
        const b64 = res.data.image_base64;
        const formatted = b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`;
        setImageUrl(formatted);
      }
      setGenerationCount((c) => c + 1);
    } catch (err) {
      console.warn("AI Tapestry live generation fallback:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `mood-mirror-tapestry-${moodKey}-${Date.now()}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        data-testid="living-tapestry-card"
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300"
        style={{
          background: "linear-gradient(160deg, rgba(17, 29, 57, 0.75) 0%, rgba(7, 17, 38, 0.95) 100%)",
          border: "1px solid rgba(155, 108, 255, 0.25)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(155, 108, 255, 0.1)",
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Palette size={15} />
            </div>
            <div>
              <h4 className="font-display text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Living Emotional Tapestry</span>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  AI Art
                </span>
              </h4>
              <p className="text-[11px] text-white/50">
                Visualizing your emotional frequency as an abstract surreal dreamscape.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLightboxOpen(true)}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen View"
              aria-label="Fullscreen View"
            >
              <Maximize2 size={15} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Download Wallpaper"
              aria-label="Download Wallpaper"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Art Canvas Display */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group shadow-2xl border border-white/10 bg-slate-950">
          <img
            src={currentImage}
            alt="Living Emotional Tapestry"
            onError={() => {
              if (imageUrl) {
                console.warn("Custom image failed to load, falling back to curated dreamscape");
                setImageUrl(null);
              }
            }}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isGenerating ? "scale-105 filter blur-sm" : "scale-100 filter-none"
            }`}
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Loading Shimmer State */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md space-y-3 z-10"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-10 h-10 rounded-full border-2 border-violet-400 border-t-transparent flex items-center justify-center"
                />
                <span className="text-xs font-mono text-violet-200 tracking-wider animate-pulse">
                  Synthesizing FLUX-1 Dreamscape...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Floating Info Pill inside artwork */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/80 border border-white/10 capitalize">
              ● {analysis?.dominant_mood || "Harmonic Glow"}
            </span>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleGenerateTapestry}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #8C63FF, #6D9CFF, #FFB49D)",
              }}
            >
              {isGenerating ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Wand2 size={13} />
              )}
              <span>{generationCount > 0 ? "Regenerate Art" : "Synthesize AI Art"}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-8"
          >
            <div
              className="relative max-w-5xl w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage}
                alt="Living Emotional Tapestry Lightbox"
                className="w-full max-h-[85vh] object-contain rounded-3xl"
              />

              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                <div>
                  <h4 className="font-display text-base font-bold capitalize">
                    {analysis?.dominant_mood} Emotional Tapestry
                  </h4>
                  <p className="text-xs text-white/60">
                    Mood Mirror AI Generative Art Engine
                  </p>
                </div>

                <button
                  onClick={handleDownload}
                  className="btn-mirror-me flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg"
                >
                  <Download size={14} />
                  <span>Save 4K Wallpaper</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LivingTapestryCard;
