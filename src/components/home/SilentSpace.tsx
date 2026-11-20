"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MoonStar, X } from "lucide-react";

interface SilentSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  orb: React.ReactNode;
  onStartSession: () => void;
  activeSession: boolean;
  onResumeSession: () => void;
  regenerating: boolean;
}

export default function SilentSpace({
  isOpen,
  onClose,
  orb,
  onStartSession,
  activeSession,
  onResumeSession,
  regenerating,
}: SilentSpaceProps) {
  const reducedMotion = useReducedMotion();

  if (!isOpen) return null;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Silent space"
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center py-10 text-center bg-background/98 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="silent-space-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-xs text-foreground/70 transition hover:border-primary/30 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Leave silent space"
      >
        <X className="h-4 w-4" aria-hidden="true" /> Leave stillness
      </button>

      <h2 id="silent-space-title" className="sr-only">Silent Space</h2>

      <p className="text-[9px] uppercase tracking-[0.32em] text-primary/65">A quiet place to arrive</p>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="my-5 w-full max-w-[min(74vw,390px)]"
      >
        {orb}
      </motion.div>

      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm text-sm leading-relaxed text-muted-foreground"
      >
        Nothing to complete. Stay for a moment, or begin whenever you are ready.
      </motion.p>

      <motion.button
        type="button"
        onClick={activeSession ? onResumeSession : onStartSession}
        disabled={regenerating}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/25 px-5 text-xs text-accent transition hover:bg-primary/[0.08] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {activeSession ? "Return to your session" : "Begin when ready"} <MoonStar className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.button>
    </motion.section>
  );
}