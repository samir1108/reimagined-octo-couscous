/**
 * QuickQuestionsScreen — the 4-question quick band detector.
 *
 * Pure UI. Returns the computed QuickBandResult to the parent via onComplete.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectQuickBand, type QuickAnswers, type QuickBandResult } from "@/lib/consciousness/quickBandDetector";

interface Props {
  onComplete: (result: QuickBandResult, answers: QuickAnswers) => void;
}

type Key = keyof QuickAnswers;

interface Q {
  key: Key;
  prompt: string;
  options: string[];
}

const QUESTIONS: Q[] = [
  {
    key: "emotion_response",
    prompt: "When a difficult emotion arises…",
    options: [
      "I'm pulled in completely.",
      "I notice it after a while.",
      "I can watch it as it moves.",
      "I rest as the space it appears in.",
    ],
  },
  {
    key: "practice_history",
    prompt: "How familiar are you with watching your own thoughts?",
    options: [
      "Brand new to this.",
      "I've tried, on and off.",
      "I practice regularly.",
      "It's a steady part of my life.",
    ],
  },
  {
    key: "intent",
    prompt: "What brings you here?",
    options: [
      "Relief from the noise.",
      "I want to understand my patterns.",
      "I want to live more consciously.",
      "I want to dissolve who I think I am.",
    ],
  },
  {
    key: "belief",
    prompt: "Which feels most true?",
    options: [
      "Life happens to me.",
      "I have some choice in how I respond.",
      "Awareness shapes my reality.",
      "There is only awareness.",
    ],
  },
];

export default function QuickQuestionsScreen({ onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuickAnswers>>({});

  const q = QUESTIONS[idx];

  const pick = (value: 0 | 1 | 2 | 3) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (idx < QUESTIONS.length - 1) {
      setIdx(idx + 1);
    } else {
      const full = next as QuickAnswers;
      onComplete(detectQuickBand(full), full);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <p className="text-muted-foreground text-[11px] uppercase tracking-[0.4em] mb-3">
        Question {idx + 1} of {QUESTIONS.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.h2
          key={q.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="font-display text-xl sm:text-2xl text-foreground mb-7 leading-snug"
        >
          {q.prompt}
        </motion.h2>
      </AnimatePresence>

      <div className="grid gap-2.5">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i as 0 | 1 | 2 | 3)}
            className="text-left px-5 py-3.5 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/50 transition text-sm text-foreground"
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${
              i <= idx ? "w-6 bg-primary" : "w-3 bg-muted/30"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
