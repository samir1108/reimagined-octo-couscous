/**
 * WisdomArcCard
 * ─────────────
 * Cinematic first-7-days mini-lesson on Home. Shown only while journeyDay <= 7.
 * Dismissible per day via localStorage. Tap → full-screen modal with the day's lesson.
 * Purely additive frontend.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { WISDOM_ARC } from "@/data/wisdomArc";

interface Props {
  journeyDay: number;
}

const STORAGE_KEY = "wisdom-arc-dismissed-v1";

function getDismissed(): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function WisdomArcCard({ journeyDay }: Props) {
  const dayIdx = Math.max(1, Math.min(13, journeyDay || 1));
  const lesson = useMemo(() => WISDOM_ARC.find((d) => d.day === dayIdx), [dayIdx]);

  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Record<number, boolean>>(getDismissed);

  if (!lesson) return null;
  if (journeyDay > 13) return null;
  if (dismissed[dayIdx]) return null;

  const dismiss = () => {
    const next = { ...dismissed, [dayIdx]: true };
    setDismissed(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md mb-4 text-left rounded-2xl overflow-hidden
                   border border-primary/20 bg-gradient-to-br from-primary/10 via-background/40 to-background/80
                   backdrop-blur-sm p-4 group hover:border-primary/40 transition"
      >
        <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />

        <div className="relative flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
              {lesson.subtitle}
            </p>
            <h3 className="font-display text-base text-foreground leading-snug">
              {lesson.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {lesson.ancient}
            </p>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-primary/80">
              Read in 30s
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                dismiss();
              }
            }}
            aria-label="Dismiss today's lesson"
            className="text-muted-foreground/60 hover:text-foreground p-1"
          >
            <X className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-xl overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl mx-auto px-6 pt-24 pb-16 relative"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-20 right-6 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-3">
                {lesson.subtitle}
              </p>
              <h2 className="font-display text-3xl text-foreground leading-tight mb-8">
                {lesson.title}
              </h2>

              <Section label="The ancient" body={lesson.ancient} />
              <Section label="The modern" body={lesson.modern} />
              <Section label="Try this" body={lesson.practice} accent />

              <p className="mt-10 italic text-foreground/85 text-lg leading-relaxed border-l-2 border-primary/40 pl-4">
                {lesson.closing}
              </p>

              <button
                onClick={() => {
                  dismiss();
                  setOpen(false);
                }}
                className="mt-10 w-full py-3 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30
                           text-primary font-display text-sm tracking-wide transition"
              >
                Mark today complete
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </p>
      <p
        className={`text-[15px] leading-relaxed ${
          accent ? "text-foreground" : "text-foreground/85"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
