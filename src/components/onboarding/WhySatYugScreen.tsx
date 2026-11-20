/**
 * WhySatYugScreen — "Why this app" cinematic intro (Gate 0)
 * ─────────────────────────────────
 * Four full-bleed background-image slides that answer, for a 2026 user,
 * the only question that matters before any practice: why this app?
 *
 *   1. The 2026 condition   — every app fights for your attention
 *   2. What they installed  — conditioning is assembled, so it can be taken apart
 *   3. What this app is     — a mirror, not a habit tracker
 *   4. What happens next    — the promise of the eleven sittings
 *
 * Style follows PhilosophyPrologue: eyebrow label, display headline with one
 * amber highlight, body copy, italic close, particles, progress dots, Skip,
 * tap-to-advance, auto-advance scaled to reading time.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImagePreload } from "@/hooks/useImagePreload";
import cosmicCage from "@/assets/cosmic-cage.jpg";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import cosmicMirror from "@/assets/cosmic-mirror.jpg";
import cosmicJourneyMap from "@/assets/cosmic-journey-map.jpg";

interface Slide {
  eyebrow?: string;
  preLine?: string;
  headline: { text: string; highlight?: string }[];
  body?: { text: string; bold?: string[] }[];
  italic?: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "THE 2026 CONDITION",
    preLine: "Before anything else — know this…",
    headline: [
      { text: "Every app on your phone is fighting for" },
      { text: "one thing.", highlight: "one thing" },
    ],
    body: [
      { text: "Your attention. And it is winning — by design, by billions, by algorithms", bold: ["by design"] },
      { text: "that know your nervous system better than you do." },
      { text: "You didn't choose this battlefield. You were born into it." },
    ],
    italic: "The question was never how to focus harder.\nIt's who is choosing where your mind goes.",
    bg: cosmicCage,
  },
  {
    eyebrow: "WHAT THEY INSTALLED",
    preLine: "Here is what nobody tells you…",
    headline: [
      { text: "You were" },
      { text: "not born", highlight: "not born" },
      { text: "conditioned." },
    ],
    body: [
      { text: "The comparing. The reaching. The 2am restlessness." },
      { text: "None of it is your nature — it was assembled: by feeds, by fear, by repetition.", bold: ["assembled"] },
    ],
    italic: "And what was assembled can be taken apart.",
    bg: cosmicNebula,
  },
  {
    eyebrow: "WHAT THIS APP IS",
    headline: [
      { text: "This is" },
      { text: "not", highlight: "not" },
      { text: "another habit tracker." },
    ],
    body: [
      { text: "No streaks to feed. No scores to chase. No notifications to fight." },
      { text: "This is a mirror — it shows you what is actually running the show.", bold: ["a mirror"] },
    ],
    italic: "You don't need to become someone better.\nYou need to see who you already are.",
    bg: cosmicMirror,
  },
  {
    eyebrow: "WHAT HAPPENS NEXT",
    headline: [
      { text: "Eleven sittings.", highlight: "Eleven sittings" },
      { text: "Then you'll see yourself." },
    ],
    body: [
      { text: "Eleven short sessions about everything a 2026 human should be told —", bold: ["Eleven short sessions"] },
      { text: "attention, fear, desire, identity, money, death, freedom." },
      { text: "Answer lightly. The questions do the work." },
    ],
    italic: "Shall we begin?",
    bg: cosmicJourneyMap,
  },
];

interface Props {
  onComplete: () => void;
}

export default function WhySatYugScreen({ onComplete }: Props) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;

  useImagePreload(SLIDES.map((s) => s.bg), i);

  const next = () => (isLast ? onComplete() : setI(i + 1));

  // Auto-advance based on reading time (≈3.5 words/sec, clamped 4–9s)
  useEffect(() => {
    if (isLast) return;
    const text = [
      slide.eyebrow ?? "",
      slide.preLine ?? "",
      slide.headline.map((h) => h.text).join(" "),
      slide.body?.map((b) => b.text).join(" ") ?? "",
      slide.italic ?? "",
    ].join(" ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const ms = Math.min(9000, Math.max(4000, Math.round((words / 3.5) * 1000) + 1200));
    const timer = setTimeout(() => {
      setI((prev) => (prev === SLIDES.length - 1 ? prev : prev + 1));
    }, ms);
    return () => clearTimeout(timer);
  }, [i, isLast, slide]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black overflow-hidden cursor-pointer select-none"
      onClick={next}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {/* Ken Burns background */}
          <motion.div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.bg})` }}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.14 }}
            transition={{ duration: 11, ease: "linear" }}
          />
          {/* Vignette + readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/90" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Floating particles */}
          {Array.from({ length: 18 }).map((_, n) => (
            <motion.div
              key={n}
              className="absolute w-0.5 h-0.5 rounded-full bg-amber-200/40"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 0.7, 0], y: [0, -30] }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 md:px-10 text-center">
            <div className="max-w-2xl w-full">
              {slide.eyebrow && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-amber-400/80 text-xs md:text-sm tracking-[0.4em] uppercase font-display mb-8"
                >
                  {slide.eyebrow}
                </motion.p>
              )}

              {slide.preLine && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-white/55 text-base md:text-lg font-display mb-6"
                >
                  {slide.preLine}
                </motion.p>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 1 }}
                className="text-white text-4xl md:text-6xl font-display font-bold leading-[1.12] tracking-tight"
              >
                {slide.headline.map((line, idx) => (
                  <span key={idx} className="block">
                    {line.highlight ? renderWithHighlight(line.text, line.highlight) : line.text}
                  </span>
                ))}
              </motion.h1>

              {slide.body && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.9 }}
                  className="mt-8 space-y-3 text-white/65 text-base md:text-lg leading-relaxed font-body"
                >
                  {slide.body.map((p, idx) => (
                    <p key={idx}>{renderWithBold(p.text, p.bold)}</p>
                  ))}
                </motion.div>
              )}

              {slide.italic && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 1 }}
                  className="mt-8 text-amber-300/75 italic text-base md:text-lg leading-relaxed font-display whitespace-pre-line"
                >
                  {slide.italic}
                </motion.p>
              )}

              {isLast && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2, duration: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="mt-10 px-10 py-3.5 rounded-full bg-amber-400 text-black font-display tracking-wide text-base hover:bg-amber-300 transition-colors shadow-[0_0_40px_hsl(43_96%_56%/0.35)]"
                >
                  Begin →
                </motion.button>
              )}
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {SLIDES.map((_, n) => (
                <div
                  key={n}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    n === i ? "w-8 bg-amber-400/80" : n < i ? "w-2 bg-amber-400/40" : "w-2 bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {!isLast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="absolute bottom-8 right-6 md:right-10 z-20 text-white/50 hover:text-amber-300 text-sm font-display tracking-wider transition-colors"
        >
          Skip →
        </button>
      )}

      {/* Tap hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 3, delay: 2, repeat: Infinity, repeatDelay: 4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs font-display tracking-[0.3em] uppercase pointer-events-none hidden md:block"
      >
        tap to continue
      </motion.p>
    </div>
  );
}

function renderWithHighlight(text: string, highlight: string) {
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      {before}
      <span className="text-amber-400">{match}</span>
      {after}
    </>
  );
}

function renderWithBold(text: string, bolds?: string[]) {
  if (!bolds || bolds.length === 0) return text;
  let parts: (string | { b: string })[] = [text];
  for (const b of bolds) {
    const next: typeof parts = [];
    for (const part of parts) {
      if (typeof part !== "string") {
        next.push(part);
        continue;
      }
      const idx = part.indexOf(b);
      if (idx === -1) {
        next.push(part);
      } else {
        if (idx > 0) next.push(part.slice(0, idx));
        next.push({ b });
        if (idx + b.length < part.length) next.push(part.slice(idx + b.length));
      }
    }
    parts = next;
  }
  return parts.map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <strong key={i} className="text-white font-semibold">{p.b}</strong>
  );
}