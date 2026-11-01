import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Maximize2, Download, Calendar, ArrowUpRight, X, Sparkles } from "lucide-react";

const CURATED_PIECES = [
  {
    id: "m1",
    n: 1,
    valence: "+0.62",
    arousal: "0.81",
    image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "m2",
    n: 2,
    valence: "+0.40",
    arousal: "0.28",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "m3",
    n: 3,
    valence: "+0.85",
    arousal: "0.75",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "m4",
    n: 4,
    valence: "+0.72",
    arousal: "0.22",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
];

const MOOD_IMAGES = {
  joy: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
  sadness: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85",
  anger: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85",
  fear: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
  surprise: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
  disgust: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85",
  neutral: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
};

export const LivingMuseum = ({ history = [], onSelectReflection, onStartReflection, t }) => {
  const [selectedPiece, setSelectedPiece] = useState(null);
  const text = (piece, field) => (piece.custom ? piece[field] : t(`museum${piece.n}${field}`));

  const livePieces = useMemo(() => {
    const userReflections = (Array.isArray(history) ? history : []).slice(0, 6).map((item, i) => {
      const mood = (item.dominant_mood || "neutral").toLowerCase();
      const firstLine = (item.response_text || "")
        .split("\n")
        .map((l) => l.trim())
        .find(Boolean) || item.input_preview || t("appTitle");
      const dateStr = item.timestamp
        ? new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `#${i + 1}`;
      return {
        id: item.id || `user-${i}`,
        custom: true,
        rawItem: item,
        Mood: t(mood) || mood,
        Title: item.input_preview && !String(item.input_preview).startsWith("[")
          ? item.input_preview
          : `${t(mood) || mood}`,
        Desc: firstLine,
        Day: t("navHistory"),
        Date: dateStr,
        valence: mood === "joy" || mood === "surprise" ? "+0.68" : mood === "neutral" ? "+0.25" : "-0.24",
        arousal: mood === "anger" || mood === "fear" || mood === "surprise" ? "0.74" : "0.34",
        image: MOOD_IMAGES[mood] || MOOD_IMAGES.neutral,
      };
    });
    return [...userReflections, ...CURATED_PIECES];
  }, [history, t]);

  return (
    <div data-testid="living-museum-page" className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b"
        style={{ borderColor: "var(--divider-subtle)" }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--control-bg)",
                border: "1px solid var(--border-strong)",
                color: "var(--aura-gold)",
              }}
            >
              <Palette size={15} />
            </div>
            <h2
              className="font-display text-2xl md:text-3xl font-medium tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("museumTitle")}
            </h2>
            <span
              className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full"
              style={{
                background: "var(--chip-active-bg)",
                border: "1px solid var(--border-strong)",
                color: "var(--aura-gold)",
              }}
            >
              {t("museumBadge")}
            </span>
          </div>
          <p className="text-xs md:text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("museumBody")}
          </p>
        </div>

        <button
          type="button"
          onClick={onStartReflection}
          className="btn-mirror-me self-start md:self-auto px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
        >
          <span>{t("museumNew")}</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Museum Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {livePieces.map((piece, idx) => (
          <motion.div
            key={piece.id}
            data-testid={`museum-card-${piece.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            className="group relative rounded-2xl overflow-hidden transition-all"
            style={{
              background: "var(--card-glass-bg)",
              border: "1px solid var(--card-glass-border)",
              boxShadow: "var(--card-glass-shadow)",
            }}
          >
            {/* Image Canvas */}
            <div className="relative aspect-[16/10] overflow-hidden bg-black">
              <img
                src={piece.image}
                alt={text(piece, "Title")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Date Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white/95 border border-white/15 flex items-center gap-1.5">
                  {piece.custom ? (
                    <Sparkles size={11} style={{ color: "var(--aura-gold)" }} />
                  ) : (
                    <Calendar size={11} style={{ color: "var(--aura-gold)" }} />
                  )}
                  {text(piece, "Day")} ({text(piece, "Date")})
                </span>
              </div>

              {/* Top Right Lightbox Trigger */}
              <button
                type="button"
                onClick={() => setSelectedPiece(piece)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/65 backdrop-blur-md text-white/85 hover:text-white border border-white/15 hover:scale-105 transition-all"
                title={t("museumFullscreen")}
                aria-label={t("museumFullscreen")}
              >
                <Maximize2 size={14} />
              </button>

              {/* Bottom Canvas Overlay */}
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                <div>
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                    style={{ color: "#E9C46A" }}
                  >
                    ● {text(piece, "Mood")}
                  </span>
                  <h4 className="font-display text-lg font-medium text-white leading-snug line-clamp-1">
                    {text(piece, "Title")}
                  </h4>
                </div>
              </div>
            </div>

            {/* Description & Affect Coordinates */}
            <div className="p-4 space-y-2.5">
              <p
                className="font-display text-sm leading-relaxed italic line-clamp-2"
                style={{ color: "var(--text-primary)" }}
              >
                “{text(piece, "Desc")}”
              </p>
              <div
                className="flex items-center justify-between text-[10px] font-mono pt-2.5 border-t"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--divider-subtle)",
                }}
              >
                <span>
                  {t("museumValence")}: {piece.valence}
                </span>
                <span>
                  {t("museumArousal")}: {piece.arousal}
                </span>
                {piece.custom && onSelectReflection ? (
                  <button
                    type="button"
                    onClick={() => onSelectReflection(piece.rawItem)}
                    className="font-semibold underline hover:opacity-80"
                    style={{ color: "var(--aura-gold)" }}
                  >
                    {t("museumArt")}
                  </button>
                ) : (
                  <span className="font-semibold" style={{ color: "var(--aura-gold)" }}>
                    {t("museumArt")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPiece && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPiece(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-8"
          >
            <div
              className="relative max-w-5xl w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPiece.image}
                alt={text(selectedPiece, "Title")}
                className="w-full max-h-[80vh] object-contain bg-black"
              />
              <button
                type="button"
                onClick={() => setSelectedPiece(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/65 text-white hover:bg-black/85"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="p-5 bg-black/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-white border-t border-white/10">
                <div>
                  <h3 className="font-display text-xl font-medium">
                    {text(selectedPiece, "Title")}
                  </h3>
                  <p className="text-xs text-white/70">{text(selectedPiece, "Desc")}</p>
                </div>

                <a
                  href={selectedPiece.image}
                  download={`museum-${selectedPiece.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-mirror-me px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>{t("museumDownload")}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LivingMuseum;
