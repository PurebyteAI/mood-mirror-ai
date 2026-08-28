import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Maximize2, Download, Sparkles, Calendar, Heart, Eye } from "lucide-react";

const MUSEUM_PIECES = [
  {
    id: "m1",
    date: "Today",
    day: "Thursday",
    mood: "Relief & Excitement",
    valence: "+0.62",
    arousal: "0.81",
    title: "Celestial Horizon Emerging from Tempest",
    image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85",
    description: "A luminous cosmic landscape emerging from a turbulent storm, transitioning into warm golden light.",
  },
  {
    id: "m2",
    date: "Yesterday",
    day: "Wednesday",
    mood: "Reflective Stillness",
    valence: "+0.40",
    arousal: "0.28",
    title: "Twilight Mountain Mirror Lake",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85",
    description: "Quiet lake at dusk beneath celestial violet nebulae, honoring gentle restoration.",
  },
  {
    id: "m3",
    date: "3 days ago",
    day: "Monday",
    mood: "Vibrant Curiosity",
    valence: "+0.85",
    arousal: "0.75",
    title: "Prismatic Aurora Cascades",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    description: "Luminescent crystalline valley awash in morning sunlight and flowing waterfalls.",
  },
  {
    id: "m4",
    date: "Last week",
    day: "Friday",
    mood: "Calm Serenity",
    valence: "+0.72",
    arousal: "0.22",
    title: "Whispering Dune Solitude",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    description: "Tranquil shoreline with undulating pastel ripples and distant glowing lighthouses.",
  },
];

export const LivingMuseum = ({ onStartReflection, t }) => {
  const [selectedPiece, setSelectedPiece] = useState(null);

  return (
    <div data-testid="living-museum-page" className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Palette size={16} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              My Living Museum
            </h2>
            <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Generative Timeline
            </span>
          </div>
          <p className="text-xs md:text-sm text-white/60">
            Every emotional reflection evolves into a unique piece of living digital art in your private gallery.
          </p>
        </div>

        <button
          onClick={onStartReflection}
          className="btn-mirror-me self-start md:self-auto px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>New Expression Art</span>
        </button>
      </div>

      {/* Museum Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MUSEUM_PIECES.map((piece, idx) => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="group relative rounded-3xl overflow-hidden backdrop-blur-2xl border border-white/15 bg-slate-950/70 shadow-2xl transition-all hover:border-violet-500/40"
          >
            {/* Image Canvas */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src={piece.image}
                alt={piece.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Date Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1.5">
                  <Calendar size={11} className="text-violet-400" />
                  {piece.day} ({piece.date})
                </span>
              </div>

              {/* Top Right Lightbox Trigger */}
              <button
                onClick={() => setSelectedPiece(piece)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10 hover:scale-105 transition-all"
                title="View Fullscreen"
              >
                <Maximize2 size={14} />
              </button>

              {/* Bottom Canvas Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300 font-semibold">
                    ● {piece.mood}
                  </span>
                  <h4 className="font-display text-base font-bold text-white leading-snug">
                    {piece.title}
                  </h4>
                </div>
              </div>
            </div>

            {/* Description & Affect Coordinates */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-white/70 leading-relaxed font-serif italic">
                "{piece.description}"
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-2 border-t border-white/10">
                <span>Valence: {piece.valence}</span>
                <span>Arousal: {piece.arousal}</span>
                <span className="text-violet-300 font-semibold">SDXL Lightning Art</span>
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
              className="relative max-w-5xl w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPiece.image}
                alt={selectedPiece.title}
                className="w-full max-h-[80vh] object-contain rounded-3xl"
              />

              <div className="p-6 bg-black/80 backdrop-blur-md flex items-center justify-between text-white border-t border-white/10">
                <div>
                  <h3 className="font-display text-lg font-bold">{selectedPiece.title}</h3>
                  <p className="text-xs text-white/60">{selectedPiece.description}</p>
                </div>

                <a
                  href={selectedPiece.image}
                  download={`museum-${selectedPiece.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-mirror-me px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>Download 4K Art</span>
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
