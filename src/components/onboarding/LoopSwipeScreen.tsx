/**
 * LoopSwipeScreen — onboarding step
 * ─────────────────────────────────
 * Tinder/Snapchat-style swipe deck. We show 12 of the most universal loops
 * from the real LOOP_CATALOG (VAL001 etc.). For each card the user picks:
 *
 *   ❌  Not me        →  do nothing
 *   🤔  Sometimes     →  push to maybe[] (weight 0.5)
 *   ✅  Yes, this me  →  activate (weight 1.0)
 *
 * Swipe right = yes. Swipe left = no. Swipe up = sometimes.
 * Result is returned as a list of real loop IDs so detection / engine work day-1.
 *
 * This replaces abstract band ratings with grounded self-recognition.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { LOOP_CATALOG, LOOP_CATEGORIES, type LoopCategoryKey } from "@/lib/loopLibraryCatalog";

interface Props {
  name: string;
  onComplete: (result: {
    activeLoopIds: string[];     // strong yes
    maybeLoopIds: string[];      // sometimes
    freeText: string;            // anything else?
  }) => void;
  onSkip: () => void;
}

// 12 most universal loops — touches everyone, no jargon
const DECK_IDS = [
  "VAL001", // People-Pleasing
  "VAL002", // Perfectionism
  "VAL025", // Comparison
  "CTL003", // Overthinking
  "CTL002", // Catastrophizing
  "HAB001", // Doom-scrolling (if exists, else first HAB)
  "MEN001", // Rumination (if exists)
  "EMO001", // Guilt
  "AVD001", // Avoidance
  "BLF001", // Not enough
  "PRD001", // Busy-ness
  "REL001", // Attachment
];

function buildDeck() {
  const found = DECK_IDS.map((id) => LOOP_CATALOG.find((l) => l.id === id)).filter(Boolean) as typeof LOOP_CATALOG;
  // Backfill from category if a specific id is missing
  const usedCats = new Set(found.map((l) => l!.category));
  if (found.length < 12) {
    for (const cat of ["HAB", "MEN", "EMO", "AVD", "BLF", "PRD", "REL"] as LoopCategoryKey[]) {
      if (found.length >= 12) break;
      if (usedCats.has(cat)) continue;
      const candidate = LOOP_CATALOG.find((l) => l.category === cat);
      if (candidate) {
        found.push(candidate);
        usedCats.add(cat);
      }
    }
  }
  return found.slice(0, 12);
}

export default function LoopSwipeScreen({ name, onComplete, onSkip }: Props) {
  const deck = useMemo(buildDeck, []);
  const [index, setIndex] = useState(0);
  const [yes, setYes] = useState<string[]>([]);
  const [maybe, setMaybe] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [showText, setShowText] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const yesOpacity = useTransform(x, [40, 140], [0, 1]);
  const noOpacity = useTransform(x, [-140, -40], [1, 0]);
  const maybeOpacity = useTransform(y, [-140, -40], [1, 0]);

  const current = deck[index];
  const remaining = deck.length - index;

  const advance = (decision: "yes" | "no" | "maybe") => {
    if (!current) return;
    if (decision === "yes") setYes((prev) => [...prev, current.id]);
    if (decision === "maybe") setMaybe((prev) => [...prev, current.id]);
    x.set(0);
    y.set(0);
    if (index + 1 >= deck.length) setShowText(true);
    else setIndex((i) => i + 1);
  };

  const handleDragEnd = (_e: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > 100 || velocity.x > 500) return advance("yes");
    if (offset.x < -100 || velocity.x < -500) return advance("no");
    if (offset.y < -100 || velocity.y < -500) return advance("maybe");
    x.set(0); y.set(0);
  };

  if (showText) {
    return (
      <motion.div
        key="loop_freetext"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black p-5 overflow-y-auto"
      >
        <div className="w-full max-w-xl py-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-display tracking-[0.3em] uppercase text-amber-400/70">
              Almost there
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-white leading-snug">
              Anything I should know?
            </h2>
            <p className="text-sm font-body text-white/60 max-w-md mx-auto leading-relaxed">
              A pattern you swipe through that I didn't ask about. A loop only
              you would name. In your own words — short or long, both okay.
            </p>
          </div>

          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            autoFocus
            rows={6}
            placeholder="e.g. I shut down whenever someone raises their voice. Or I keep starting things and never finishing. Whatever lives loudest in you right now."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-sm font-body text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/40 resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onComplete({ activeLoopIds: yes, maybeLoopIds: maybe, freeText: "" })}
              className="text-xs font-display tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => onComplete({ activeLoopIds: yes, maybeLoopIds: maybe, freeText: freeText.trim() })}
              className="px-6 py-3 rounded-full text-sm font-display tracking-wide bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all"
            >
              Continue →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="loop_swipe"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-between bg-black p-5 overflow-hidden"
    >
      {/* Header */}
      <div className="w-full max-w-xl pt-4 text-center space-y-1.5 z-10">
        <p className="text-xs font-display tracking-[0.3em] uppercase text-amber-400/70">
          Step · Loops you live in
        </p>
        <h2 className="font-display text-xl sm:text-2xl text-white leading-snug">
          {name ? `${name}, which of these is you?` : "Which of these is you?"}
        </h2>
        <p className="text-[11px] font-body text-white/40">
          Swipe → yes · ← not me · ↑ sometimes · {remaining} left
        </p>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[420px] flex items-center justify-center">
        {/* Background card (peek of next) */}
        {deck[index + 1] && (
          <div
            key={`bg-${deck[index + 1].id}`}
            className="absolute inset-x-4 inset-y-4 rounded-3xl border border-white/5 bg-white/[0.02]"
            style={{ transform: "scale(0.95) translateY(8px)" }}
          />
        )}

        <AnimatePresence>
          {current && (
            <motion.div
              key={current.id}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              style={{ x, y, rotate }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ x: x.get() > 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 shadow-2xl shadow-amber-500/5 p-7 flex flex-col cursor-grab active:cursor-grabbing"
            >
              {/* Decision overlays */}
              <motion.div
                style={{ opacity: yesOpacity }}
                className="absolute top-6 left-6 px-3 py-1 rounded-lg border-2 border-emerald-400 text-emerald-400 font-display text-sm tracking-widest uppercase rotate-[-12deg]"
              >
                That's me
              </motion.div>
              <motion.div
                style={{ opacity: noOpacity }}
                className="absolute top-6 right-6 px-3 py-1 rounded-lg border-2 border-rose-400 text-rose-400 font-display text-sm tracking-widest uppercase rotate-[12deg]"
              >
                Not me
              </motion.div>
              <motion.div
                style={{ opacity: maybeOpacity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-lg border-2 border-amber-400 text-amber-400 font-display text-sm tracking-widest uppercase"
              >
                Sometimes
              </motion.div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <span className="text-3xl">
                  {LOOP_CATEGORIES.find((c) => c.key === current.category)?.emoji ?? "🌀"}
                </span>
                <h3 className="mt-5 font-display text-2xl sm:text-3xl text-white leading-tight">
                  {current.name}
                </h3>
                <p className="mt-3 text-sm font-body text-white/70 leading-relaxed">
                  {current.hint}
                </p>
              </div>

              <div className="text-[10px] font-display tracking-[0.25em] uppercase text-white/30">
                {LOOP_CATEGORIES.find((c) => c.key === current.category)?.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm pb-6 space-y-4 z-10">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => advance("no")}
            className="h-14 w-14 rounded-full bg-white/5 border border-white/10 hover:bg-rose-500/15 hover:border-rose-400/40 flex items-center justify-center text-2xl transition-all active:scale-95"
            aria-label="Not me"
          >
            ❌
          </button>
          <button
            onClick={() => advance("maybe")}
            className="h-12 w-12 rounded-full bg-white/5 border border-white/10 hover:bg-amber-500/15 hover:border-amber-400/40 flex items-center justify-center text-xl transition-all active:scale-95"
            aria-label="Sometimes"
          >
            🤔
          </button>
          <button
            onClick={() => advance("yes")}
            className="h-14 w-14 rounded-full bg-white/5 border border-white/10 hover:bg-emerald-500/15 hover:border-emerald-400/40 flex items-center justify-center text-2xl transition-all active:scale-95"
            aria-label="That's me"
          >
            ✅
          </button>
        </div>
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-[11px] font-display tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors"
          >
            Skip this step
          </button>
        </div>
      </div>
    </motion.div>
  );
}
