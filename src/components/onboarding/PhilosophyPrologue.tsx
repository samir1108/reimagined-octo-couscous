/**
 * PhilosophyPrologue — 5 cinematic intro screens shown before the Elder appears.
 * Style: full-bleed dark cosmic image, amber eyebrow label, large display headline
 * with selective amber highlights, supporting body text, italic close, "Skip →".
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImagePreload } from "@/hooks/useImagePreload";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import cosmicEye from "@/assets/cosmic-eye.jpg";
import cosmicTree from "@/assets/cosmic-tree.jpg";
import cosmicMirror from "@/assets/cosmic-mirror.jpg";
import cosmicSunrise from "@/assets/cosmic-sunrise.jpg";

interface Slide {
  eyebrow?: string;
  preLine?: string;
  headline: { text: string; highlight?: string }[]; // each entry is a line; highlight = which substring is amber
  body?: { text: string; bold?: string[] }[];
  italic?: string;
  bg: string;
  bgPosition?: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "WHAT THIS APP IS",
    preLine: "Before we begin, know this…",
    headline: [
      { text: "This app is built on" },
      { text: "yoga.", highlight: "yoga" },
    ],
    body: [
      { text: "Not the postures. Not the workout." },
      { text: "Yoga — the ancient science that says a human being, born ordinary,", bold: ["ancient science"] },
      { text: "can become a brahmin: one who has seen through the illusion.", bold: ["brahmin"] },
    ],
    italic: "You were not born to be who you are. You were born to become who you truly are.",
    bg: cosmicSunrise,
  },
  {
    eyebrow: "THE OLDEST PROMISE",
    headline: [
      { text: "Break free from the" },
      { text: "cycle", highlight: "cycle" },
      { text: "of birth and death." },
    ],
    body: [
      { text: "Every day, you are born and you die inside the same loops —", bold: ["same loops"] },
      { text: "the same fears, the same reactions, the same story on repeat." },
      { text: "Yoga is the technology to step out of that wheel.", bold: ["step out"] },
    ],
    italic: "Moksha is not somewhere else.\nIt is the end of being pulled by what you did not choose.",
    bg: cosmicEye,
  },
  {
    preLine: "We are based on a thought…",
    headline: [
      { text: "The mind is the" },
      { text: "most powerful" },
      { text: "technology ever", highlight: "technology" },
      { text: "created." },
    ],
    bg: cosmicNebula,
  },
  {
    preLine: "But the truth is…",
    headline: [{ text: "We are not free.", highlight: "not" }],
    body: [
      { text: "Every thought, every reaction, every desire — most of it is not yours." },
      { text: "It was installed. By culture, by parents, by trauma, by repetition." },
    ],
    italic: "Freedom is not the absence of chains. It is the awareness of them.",
    bg: cosmicEye,
  },
  {
    eyebrow: "THE BIOLOGICAL RESISTANCE",
    headline: [
      { text: "Your body doesn't" },
      { text: "want you", highlight: "want" },
      { text: "to wake up." },
    ],
    body: [
      { text: "Millions of years of evolution designed your nervous system for one thing:", bold: ["survival"] },
      { text: "survival, not awareness.", bold: ["survival"] },
      { text: "Fear, distraction, restlessness — these aren't bugs." },
      { text: "They are survival features fighting against your consciousness.", bold: ["survival features"] },
    ],
    italic:
      "To grow in awareness is to go against millions of years of programming.\nThat's why it's the hardest — and most important — thing you'll ever do.",
    bg: cosmicTree,
  },
  {
    eyebrow: "THE INVISIBLE TRAP",
    headline: [
      { text: "Identity — the", highlight: "Identity" },
      { text: "illusion" },
      { text: "we call truth." },
    ],
    body: [
      { text: '"I am anxious." "I am not good enough." "I am this kind of person."' },
      { text: "These are not facts. They are programs running in your mind —", bold: ["programs"] },
      { text: "installed by conditioning, repeated until they feel real." },
    ],
    italic: "You are not your identity. You are the awareness that can see it.",
    bg: cosmicMirror,
  },
  {
    eyebrow: "BUT THERE IS A WAY",
    headline: [
      { text: "You can" },
      { text: "wake up.", highlight: "wake up" },
    ],
    body: [
      { text: "Not through more thinking. Not through more doing." },
      { text: "Through seeing. Through remembering. Through the right mirror." },
    ],
    italic: "What follows is that mirror.",
    bg: cosmicSunrise,
  },
];

interface Props {
  onComplete: () => void;
}

export default function PhilosophyPrologue({ onComplete }: Props) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;

  // Preload all slide backgrounds; warm-prime the next 1–2 on every advance.
  useImagePreload(SLIDES.map((s) => s.bg), i);

  const next = () => (isLast ? onComplete() : setI(i + 1));

  // Auto-advance based on reading time of the current slide (≈3.5 words/sec)
  useEffect(() => {
    if (isLast) return; // last slide waits for explicit Begin tap
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


  // Tap anywhere to advance (except on Skip)
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
          {/* Background image */}
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${slide.bg})`,
              backgroundPosition: slide.bgPosition ?? "center",
            }}
          />
          {/* Vignette + readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/90" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Subtle floating particles */}
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
                    {line.highlight
                      ? renderWithHighlight(line.text, line.highlight)
                      : line.text}
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
        style={{ transform: "translateX(-50%) translateY(40px)" }}
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
  // Split at each bold occurrence preserving order
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
