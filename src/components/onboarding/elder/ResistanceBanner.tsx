/**
 * ResistanceBanner — shown inside Elder onboarding to name the evolutionary
 * resistance the user is likely feeling ("this is boring", "I'll do it later",
 * "why so long"). Tapping it opens a breath orb overlay: 60 seconds of slow
 * breathing with the invitation to just observe the mind + body before
 * returning to the dialogue.
 *
 * Purpose: converts drop-off pressure into a micro-practice moment. The user
 * doesn't leave the flow — they meet the resistance, then continue.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X } from "lucide-react";
const MESSAGES = [
  "Your mind is resisting right now. It's evolutionary — the nervous system was built to conserve energy, not to sit with itself.",
  "Notice the pull to close this. That pull is 200,000 years old. It isn't you — it's inherited machinery.",
  "The body is bracing. The mind is generating reasons to stop. This is exactly the moment worth staying for.",
  "Ancient survival wiring reads 'stillness' as danger. Breathe once. You'll see the resistance soften.",
];

export default function ResistanceBanner({ turnCount }: { turnCount: number }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate message every ~6 user turns so it doesn't feel static.
  useEffect(() => {
    setMsgIndex(Math.floor(turnCount / 6) % MESSAGES.length);
  }, [turnCount]);

  if (dismissed) return null;

  return (
    <>
      <div className="max-w-2xl mx-auto mt-3">
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] backdrop-blur-sm px-4 py-3 flex items-start gap-3">
          <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
              Evolutionary memory
            </p>
            <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
              {MESSAGES[msgIndex]}
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Let's observe →
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="shrink-0 text-muted-foreground/60 hover:text-foreground transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center px-6"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_70%)]" />

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative text-[10px] uppercase tracking-[0.4em] text-primary/80 mb-8"
            >
              Observe
            </motion.p>

            <div className="relative">
              
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative mt-10 max-w-sm text-center space-y-3"
            >
              <p className="text-base font-display text-foreground/90 leading-relaxed">
                Watch the breath. Watch the mind wanting to leave.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Both are happening at once. Neither is you. Stay for one minute — then we continue.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              onClick={() => setOpen(false)}
              className="relative mt-10 px-6 py-2.5 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/15 text-sm text-foreground/90 transition"
            >
              I'm ready — continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
