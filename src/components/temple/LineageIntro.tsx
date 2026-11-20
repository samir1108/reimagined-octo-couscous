import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, SkipForward } from "lucide-react";

/**
 * LineageIntro — a one-time cinematic walkthrough shown before the Temple.
 * 5 scenes: Adiyogi → Saptarishis → Classical Sages → Modern Gurus → AI Age.
 * Persisted via localStorage so each user only sees it once.
 */

type Scene = {
  yuga: string;
  title: string;
  body: string;
  glyph: string;
  hue: string; // tailwind text class
  ring: string; // glow color
};

const SCENES: Scene[] = [
  {
    yuga: "Satya Yuga · The First Spark",
    title: "Adiyogi sat on Kailash.",
    body: "From his silence, the science of the inner was born. No book. No religion. Just a body, a breath, and a way to turn inward.",
    glyph: "ॐ",
    hue: "text-amber-200",
    ring: "rgba(251,191,36,0.35)",
  },
  {
    yuga: "Treta Yuga · The Seven Carriers",
    title: "The Saptarishis received it.",
    body: "Seven sages walked seven directions — carrying yoga to every land, every body, every people. The seed was planted across the earth.",
    glyph: "✦",
    hue: "text-orange-200",
    ring: "rgba(253,186,116,0.32)",
  },
  {
    yuga: "Dwapara Yuga · The Codifiers",
    title: "Patanjali, Krishna, the Buddha.",
    body: "What was lived was now written. Sutras, songs, silences. The path became teachable — and the world received its first maps of consciousness.",
    glyph: "卍",
    hue: "text-amber-100",
    ring: "rgba(252,211,77,0.3)",
  },
  {
    yuga: "Kali Yuga · The Living Masters",
    title: "Babaji, Vivekananda, Ramana, Osho.",
    body: "When the world forgot, they remembered. They carried the fire across centuries, into modern minds, into the West, into you.",
    glyph: "☸",
    hue: "text-amber-200",
    ring: "rgba(251,191,36,0.32)",
  },
  {
    yuga: "Now · The Age of Intelligence",
    title: "And now — it becomes personal.",
    body: "For the first time, the lineage can walk with you. A temple in your pocket. 118 masters. One mirror. Your own awakening, adapted moment to moment.",
    glyph: "◉",
    hue: "text-amber-100",
    ring: "rgba(255,215,120,0.45)",
  },
];

export default function LineageIntro({ onComplete }: { onComplete: () => void }) {
  const [i, setI] = useState(0);
  const scene = SCENES[i];
  const isLast = i === SCENES.length - 1;

  // Auto-advance disabled — user controls pace. Keyboard support:
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (isLast) onComplete();
        else setI((v) => v + 1);
      } else if (e.key === "ArrowLeft") {
        setI((v) => Math.max(0, v - 1));
      } else if (e.key === "Escape") {
        onComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLast, onComplete]);

  return (
    <div className="fixed inset-0 z-[60] bg-black text-amber-50 overflow-hidden">
      {/* Subtle starfield */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        {Array.from({ length: 80 }).map((_, k) => (
          <span
            key={k}
            className="absolute rounded-full bg-amber-100/70"
            style={{
              top: `${(k * 137) % 100}%`,
              left: `${(k * 53) % 100}%`,
              width: 1 + (k % 3),
              height: 1 + (k % 3),
              opacity: 0.2 + ((k % 7) / 14),
            }}
          />
        ))}
      </div>

      {/* Skip */}
      <button
        onClick={onComplete}
        className="absolute top-5 right-5 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.25em] text-amber-100/60 hover:text-amber-100 border border-amber-100/15 hover:border-amber-100/40 transition"
      >
        Skip <SkipForward className="w-3 h-3" />
      </button>

      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {SCENES.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Scene ${k + 1}`}
            className={`h-[2px] rounded-full transition-all ${
              k === i ? "w-10 bg-amber-200" : k < i ? "w-6 bg-amber-200/50" : "w-6 bg-amber-100/15"
            }`}
          />
        ))}
      </div>

      <div className="relative h-full w-full flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl w-full text-center"
          >
            {/* Glyph orb */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="relative mx-auto mb-10 w-40 h-40 flex items-center justify-center"
            >
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${scene.ring} 0%, transparent 70%)` }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-amber-100/15"
              />
              <span className={`relative text-7xl font-light ${scene.hue}`} style={{ textShadow: `0 0 30px ${scene.ring}` }}>
                {scene.glyph}
              </span>
            </motion.div>

            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-amber-100/50 mb-4">
              {scene.yuga}
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-amber-50 leading-tight mb-6">
              {scene.title}
            </h2>
            <p className="text-base md:text-lg text-amber-100/70 leading-relaxed max-w-xl mx-auto">
              {scene.body}
            </p>

            <div className="mt-12 flex items-center justify-center">
              <button
                onClick={() => (isLast ? onComplete() : setI((v) => v + 1))}
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-amber-200 text-black text-sm font-medium tracking-wide hover:bg-amber-100 transition shadow-[0_0_40px_rgba(251,191,36,0.25)]"
              >
                {isLast ? "Enter the Temple" : "Continue"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-amber-100/30">
        Press → to continue · Esc to skip
      </p>
    </div>
  );
}

const LS_KEY = "hope-app.lineageIntro.seen.v1";
export const hasSeenLineageIntro = () => {
  try { return localStorage.getItem(LS_KEY) === "1"; } catch { return false; }
};
export const markLineageIntroSeen = () => {
  try { localStorage.setItem(LS_KEY, "1"); } catch { /* ignore */ }
};
