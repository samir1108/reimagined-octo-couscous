/**
 * ConsciousnessTicker — full-width news-channel style flowing card.
 * Surfaces short awakening reminders that cut through resistance.
 * Pure presentation. No backend.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const REMINDERS: string[] = [
  "You don't want to do it — that's your mind & body resisting. Do it anyway.",
  "Say it: I am not my body.",
  "Say it: I am not my thoughts.",
  "The resistance you feel is the doorway, not the wall.",
  "Whatever you avoid, owns you. Whatever you face, frees you.",
  "You are the witness — not the storm passing through.",
  "Discomfort is not danger. Sit with it 60 seconds longer.",
  "The voice saying 'later' is the same voice saying 'never'.",
  "Say it: I am awareness watching this thought.",
  "Your breath is the only thing that is always now.",
  "Pain wants to be felt. Suppression makes it louder.",
  "The mind that resists practice is the mind that needs it most.",
  "Say it: This feeling is not me — it is moving through me.",
  "Every time you choose presence over reaction, you rewire.",
  "Say it: I am not my story.",
  "Say it: I am not my past.",
  "Say it: I am not my fear.",
  "Say it: I am not my anger.",
  "Say it: I am not my role.",
  "Say it: I am not my name.",
  "The thought is not the thinker. Step back.",
  "You are older than your wounds.",
  "Notice who is noticing — that's home.",
  "Boredom is the first door. Don't run from it.",
  "Anxiety is energy without direction. Breathe it down.",
  "If you can watch it, you are not it.",
  "Stillness is not absence — it is full presence.",
  "Your scrolling is a prayer to forget. Put it down.",
  "Sit with what you don't want to feel — it dissolves.",
  "The ego dies a thousand times before it surrenders. Let it.",
  "Silence is the loudest teacher. Listen.",
  "Don't fix the wave. Become the ocean.",
  "Awareness without judgment heals what effort cannot.",
  "Say it: I am the space in which all this appears.",
  "Your body keeps score. Your breath keeps balance.",
  "The shortcut is sitting still longer than your discomfort.",
  "Loneliness is just aloneness misread by the mind.",
  "Every craving is a question disguised as an answer.",
  "You are not behind. There is no race.",
  "Worry is using imagination against yourself.",
  "Forgiveness is dropping the rope, not winning the war.",
  "Say it: This too is awareness.",
  "Your wound is your doorway, not your identity.",
  "The future you fear is happening only in this moment's mind.",
  "Death is the great editor of trivia. Live accordingly.",
  "What you resist persists. What you witness, dissolves.",
  "The path is not somewhere else. It is this breath.",
  "Comparison is violence. Return to your own ground.",
  "Say it: I am free, even now, especially now.",
];

export default function ConsciousnessTicker() {
  // duplicate the list so the marquee loops seamlessly (desktop)
  const items = useMemo(() => [...REMINDERS, ...REMINDERS], []);

  // Mobile: rotate one reminder at a time so the full text is always readable.
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % REMINDERS.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  // Desktop: each unique reminder needs ~2.5s of screen time so ALL texts are
  // readable before the seamless loop restarts. 50 items × 2.5s = 125s cycle.
  const secondsPerItem = 2.5;
  const desktopDuration = REMINDERS.length * secondsPerItem;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-100/70 via-orange-100/60 to-amber-100/70 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 backdrop-blur-sm mb-4 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
      role="marquee"
      aria-label="Consciousness reminders"
    >
      <div className="flex items-stretch">
        {/* Live label — solid, and never overlapped by the scrolling text */}
        <div className="z-10 flex shrink-0 items-center bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-3 text-black text-[10px] font-bold uppercase tracking-wider">
          <span>Awaken</span>
        </div>

        {/* Mobile: per-item fade carousel — full text always visible, then next */}
        <div className="sm:hidden flex-1 min-w-0 pl-3 pr-3 py-2.5 min-h-[40px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-[13px] leading-snug text-amber-900 dark:text-amber-100/90 font-medium flex items-start gap-2"
            >
              <span className="text-amber-600 dark:text-amber-400/70 mt-0.5">◆</span>
              <span className="flex-1">{REMINDERS[idx]}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop: continuous marquee */}
        <div className="hidden sm:block flex-1 min-w-0 py-2.5 relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-100/90 dark:from-amber-950/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-100/90 dark:from-amber-950/80 to-transparent z-10" />
          <div
            className="flex gap-10 whitespace-nowrap animate-ticker-scroll hover:[animation-play-state:paused]"
            style={{ '--ticker-duration': `${desktopDuration}s` }}
          >
            {items.map((text, i) => (
              <span
                key={i}
                className="text-sm text-amber-900 dark:text-amber-100/90 font-medium flex items-center gap-2"
              >
                <span className="text-amber-600 dark:text-amber-400/60">◆</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
