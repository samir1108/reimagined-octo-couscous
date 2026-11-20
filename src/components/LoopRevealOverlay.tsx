/**
 * LoopRevealOverlay
 * ─────────────────
 * Cinematic interstitial that fires the FIRST time a user encounters a
 * specific loop ID. Subsequent encounters use the regular chip — we don't
 * want to interrupt the flow every time.
 *
 * Stateless presentational component — the parent decides when to mount it.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, ChevronRight } from "lucide-react";
import type { DetectedLoop } from "@/hooks/useLiveDetection";

interface Props {
  loop: DetectedLoop | null;
  onClose: () => void;
  onLearnMore?: (loop: DetectedLoop) => void;
}

// Approximate, illustrative "% of knowledge workers" stats per loop family.
// These are heuristics, not measured — kept as static UI copy.
const PREVALENCE: Record<string, number> = {
  VAL: 73,
  ATT: 61,
  EGO: 58,
  REC: 67,
  WRK: 71,
  BUR: 49,
  EMO: 55,
  BIO: 44,
  RES: 52,
};

function prevalenceFor(loopId: string): number {
  const prefix = (loopId.match(/^[A-Z]+/)?.[0] || "").slice(0, 3);
  return PREVALENCE[prefix] ?? 50;
}

export default function LoopRevealOverlay({ loop, onClose, onLearnMore }: Props) {
  return (
    <AnimatePresence>
      {loop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[95] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={onClose}
        >
          {/* Pulsing aura */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              background:
                "radial-gradient(ellipse at center, hsl(var(--destructive)/0.15) 0%, transparent 70%)",
            }}
          />

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full text-center"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute -top-2 -right-2 text-muted-foreground hover:text-foreground p-2"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-16 h-16 mx-auto rounded-full bg-destructive/15 border border-destructive/30
                         flex items-center justify-center mb-6"
            >
              <RefreshCw className="w-6 h-6 text-destructive" />
            </motion.div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-destructive/80 mb-3">
              Loop revealed
            </p>

            <h2 className="font-display text-2xl text-foreground mb-2">
              {loop.name}
            </h2>
            <p className="text-xs text-muted-foreground tracking-widest mb-6">
              {loop.id}
            </p>

            <p className="text-[15px] text-foreground/85 leading-relaxed mb-4">
              {loop.why || loop.evidence}
            </p>

            <p className="text-sm text-muted-foreground mb-8">
              ~{prevalenceFor(loop.id)}% of knowledge workers run this loop daily.
              You just caught yours. That is the work.
            </p>

            <div className="flex flex-col gap-2">
              {onLearnMore && (
                <button
                  onClick={() => onLearnMore(loop)}
                  className="w-full py-3 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30
                             text-primary font-display text-sm tracking-wide transition
                             flex items-center justify-center gap-1.5"
                >
                  Understand this loop
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-border/40 text-muted-foreground
                           hover:text-foreground hover:border-border/70 font-display text-sm tracking-wide transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SEEN_KEY = "loop-revealed-seen-v1";

export function getSeenLoops(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function markLoopSeen(id: string) {
  if (typeof window === "undefined") return;
  const seen = getSeenLoops();
  seen.add(id);
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}
