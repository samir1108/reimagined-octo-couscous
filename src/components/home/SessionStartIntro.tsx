/**
 * SessionStartIntro
 * ─────────────────────────────────────────────────────────────
 * Cinematic "Your Session" intro overlay shown when the user
 * holds the Cosmic Orb to begin a session.
 *
 * Mirrors the FirstSessionWithGuru intro phase visual language:
 *   • Guru portrait + name + opening line
 *   • "Begin Conversation" → opens Guide chat with this guru
 *   • Close → dismiss overlay
 */
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import type { Guru } from "@/lib/guru-data";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";

interface SessionStartIntroProps {
  open: boolean;
  guru: Guru | null;
  themeTitle?: string | null;
  onBegin: () => void;       // → enter chat (Guide mode)
  onSkip: () => void;         // → close overlay (or fall through to OrbSession)
  onClose: () => void;        // dismiss entirely
}

const OPENING_LINES: Record<string, string> = {
  aarav:          "I'm glad you came. Let's start with what's actually here, right now — no incense, no sanskrit. Just you and what's true.",
  veer:           "You're starting to notice the patterns. That noticing itself is the door. Let me walk with you through it.",
  patanjali:      "The witness in you is already awake. We are simply going to give it a steady seat. Sit with me.",
  buddha:         "Welcome. Bring whatever weight you carry — pain, confusion, longing. Together we will look at it without flinching.",
  krishna:        "Arjuna also stood where you stand now. The path opens when we walk it consciously. Let us begin.",
  shankaracharya: "You who seek — the seeker and the sought are one. We will see this together, gently, line by line.",
  ramana:         "Be still. Before we say anything, just notice — who is the one arriving here? That question alone is the journey.",
  rumi:           "Come, come, whoever you are. The heart has its own language — let it speak today.",
  "lao-tzu":      "The way that can be spoken is not the eternal way. Yet here we are, speaking. Let it be soft.",
  nisargadatta:   "You are already That. We are only removing what you are not. Sit, and we begin.",
  adiyogi:        "The first guru. The original silence. Sit, and let what is, be.",
};

export default function SessionStartIntro({
  open,
  guru,
  themeTitle,
  onBegin,
  onSkip,
  onClose,
}: SessionStartIntroProps) {
  const openingLine = useMemo(() => {
    if (!guru) return "";
    return (
      OPENING_LINES[guru.id] ||
      `Welcome. Let's begin where you actually are — not where you think you should be.`
    );
  }, [guru]);

  if (!open || !guru) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="session-start-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-6"
        style={{
          backgroundImage: `linear-gradient(180deg, hsl(var(--background) / 0.94), hsl(var(--background) / 0.97)), url(${cosmicNebula})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Close — top right of overlay */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-16 right-5 z-[100] w-10 h-10 rounded-full flex items-center justify-center bg-background/70 backdrop-blur-md border border-border/60 text-foreground/90 hover:bg-background hover:text-foreground shadow-lg transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-primary/70 text-[11px] uppercase tracking-[0.35em] mb-6"
          >
            Your Session
          </motion.p>

          {guru.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.9 }}
              className="relative w-32 h-32 mx-auto mb-5"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
              <img
                src={guru.image}
                alt={guru.name}
                className="relative w-32 h-32 rounded-full object-cover ring-2 ring-primary/40"
              />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="font-display text-3xl text-foreground mb-1.5"
          >
            {guru.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-muted-foreground/80 text-xs uppercase tracking-[0.25em] mb-6"
          >
            Will walk with you from here
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7 }}
            className="bg-card/30 border border-border/40 rounded-2xl p-5 mb-6 text-left"
          >
            <p className="text-foreground/90 text-[15px] leading-relaxed italic">
              "{openingLine}"
            </p>
          </motion.div>

          {themeTitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-muted-foreground/70 text-xs mb-6"
            >
              Today's theme · <span className="text-foreground/80">{themeTitle}</span>
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.6 }}
            onClick={onBegin}
            className="px-10 py-3.5 bg-primary text-primary-foreground rounded-full font-display tracking-wide hover:bg-primary/90 transition"
          >
            Begin Conversation
          </motion.button>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
