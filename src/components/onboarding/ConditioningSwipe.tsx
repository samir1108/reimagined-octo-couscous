/**
 * ConditioningSwipe — "The Light Six" (Gate 1)
 * ─────────────────────────────────
 * Tinder-style card deck: six very light multiple-choice questions about
 * human conditioning and consciousness, written for a 2026 user. No jargon,
 * no scoring shown to the user. Each option secretly carries a band signal
 * (0–10) that feeds the engine's initial conditioning read.
 *
 * The deck is deliberately playful — it earns the right to ask deeper
 * questions in the eleven sittings that follow.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CONDITIONING_QUESTIONS,
  computeConditioningResult,
  type ConditioningResult,
} from "@/lib/onboarding/conditioningQuestions";

interface Props {
  onComplete: (result: ConditioningResult) => void;
  onSkip: () => void;
}

export default function ConditioningSwipe({ onComplete, onSkip }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reveal, setReveal] = useState<ConditioningResult | null>(null);

  const current = CONDITIONING_QUESTIONS[index];
  const remaining = CONDITIONING_QUESTIONS.length - index;

  const choose = (band: number) => {
    const nextAnswers = { ...answers, [current.id]: band };
    setAnswers(nextAnswers);
    if (index + 1 >= CONDITIONING_QUESTIONS.length) {
      setReveal(computeConditioningResult(nextAnswers));
    } else {
      setIndex((i) => i + 1);
    }
  };

  // ─── Micro reveal — deliberately light, no scores, just one honest line ───
  if (reveal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black p-5 overflow-y-auto"
      >
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(212,165,116,0.10) 0%, transparent 55%)",
        }} />

        <div className="relative z-10 w-full max-w-md text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-amber-400/80 text-xs tracking-[0.4em] uppercase font-display"
          >
            Six light answers
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="font-display text-2xl sm:text-3xl text-white leading-snug"
          >
            Noted, quietly.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 1 }}
            className="text-white/60 text-base font-display italic leading-relaxed"
          >
            "{reveal.headline}"
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            onClick={() => onComplete(reveal)}
            className="px-8 py-3.5 rounded-full bg-amber-400 text-black font-display tracking-wide text-base hover:bg-amber-300 transition-colors shadow-[0_0_40px_hsl(43_96%_56%/0.35)]"
          >
            Continue →
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-black p-5 overflow-hidden"
    >
      {/* Header */}
      <div className="w-full max-w-xl pt-4 text-center space-y-1.5 z-10">
        <p className="text-xs font-display tracking-[0.3em] uppercase text-amber-400/70">
          Before we begin · The Light Six
        </p>
        <h2 className="font-display text-xl sm:text-2xl text-white leading-snug">
          Six light questions. No wrong answers.
        </h2>
        <p className="text-[11px] font-body text-white/40">
          Pick what's true today — {remaining} left
        </p>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[430px] flex items-center justify-center">
        {/* Peek of next card */}
        {CONDITIONING_QUESTIONS[index + 1] && (
          <div
            className="absolute inset-x-4 inset-y-4 rounded-3xl border border-white/5 bg-white/[0.02]"
            style={{ transform: "scale(0.95) translateY(8px)" }}
          />
        )}

        <AnimatePresence>
          <motion.div
            key={current.id}
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 shadow-2xl shadow-amber-500/5 p-7 flex flex-col"
          >
            <span className="text-3xl">{current.emoji}</span>

            <p className="mt-4 text-amber-400/70 text-[10px] font-display tracking-[0.3em] uppercase">
              {current.eyebrow}
            </p>

            <h3 className="mt-2 font-display text-2xl text-white leading-tight">
              {current.question}
            </h3>

            <div className="mt-6 space-y-3">
              {current.options.map((option, i) => (
                <motion.button
                  key={i}
                  onClick={() => choose(option.band)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full text-left p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-amber-500/[0.08] hover:border-amber-400/30 transition-all"
                >
                  <p className="text-sm font-display text-white/60 leading-relaxed">
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm pb-6 flex flex-col items-center gap-4 z-10">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {CONDITIONING_QUESTIONS.map((q, n) => (
            <div
              key={q.id}
              className={`h-1 rounded-full transition-all duration-500 ${
                n === index ? "w-8 bg-amber-400/80" : n < index ? "w-2 bg-amber-400/40" : "w-2 bg-white/15"
              }`}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="text-[11px] font-display tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors"
        >
          Skip this step
        </button>
      </div>
    </motion.div>
  );
}