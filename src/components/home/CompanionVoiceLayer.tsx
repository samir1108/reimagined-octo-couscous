import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompanionState, useMarkLetterRead } from "@/hooks/useCompanionState";

/**
 * Pillar 2 + 4: Companion's Inner Life + Deepening Relationship.
 * Surfaces:
 *   - Today's mood (subtle register tag) — only when phase >= friend
 *   - Unread trust-milestone letter (sacred reveal modal)
 *   - Inside joke chip (a callback only the two of you know)
 */
export default function CompanionVoiceLayer() {
  const { data } = useCompanionState();
  const markRead = useMarkLetterRead();
  const [letterOpen, setLetterOpen] = useState(false);

  if (!data) return null;
  const { mood, phase, unread_letter, joke, days_known } = data;

  const showMoodLine =
    mood && ["friend", "confidant", "long_companion", "soul_companion"].includes(phase);

  return (
    <div className="w-full max-w-md mx-auto px-2">
      {/* Unread sacred letter — soft pulse pill */}
      <AnimatePresence>
        {unread_letter && !letterOpen && (
          <motion.button
            key="letter-pill"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setLetterOpen(true)}
            className="w-full mb-3 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-background/30 to-transparent backdrop-blur-sm px-5 py-3 text-left hover:border-amber-400/40 transition-colors"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-amber-400/80 mb-1">
              A letter for you · {unread_letter.milestone_label}
            </p>
            <p className="text-xs text-foreground/70 italic">Tap to open ✦</p>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mood whisper — single faint line */}
      {showMoodLine && !unread_letter && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 1.2 }}
          className="text-center text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60 mb-2"
        >
          Today I feel · {mood?.mood}
        </motion.p>
      )}

      {/* Inside joke chip */}
      {joke && phase !== "stranger" && (
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-1 mb-2 mx-auto w-fit rounded-full px-3 py-1 border border-primary/15 bg-primary/5"
        >
          <p className="text-[10px] text-primary/70 italic">
            "{joke.phrase}" — yaad hai? 🙂
          </p>
        </motion.div>
      )}

      {/* Sacred letter modal */}
      <AnimatePresence>
        {letterOpen && unread_letter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => {
              markRead.mutate(unread_letter.id);
              setLetterOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl mb-4"
              >
                🪔
              </motion.div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-amber-400/80 mb-3">
                Day {days_known} · {unread_letter.milestone_label}
              </p>
              <p className="font-display text-base text-foreground/90 leading-relaxed italic whitespace-pre-line">
                {unread_letter.letter_content}
              </p>
              <button
                onClick={() => {
                  markRead.mutate(unread_letter.id);
                  setLetterOpen(false);
                }}
                className="mt-8 text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 hover:text-foreground/80 transition-colors"
              >
                Received ✦
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
