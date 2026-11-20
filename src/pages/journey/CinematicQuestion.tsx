/**
 * CinematicQuestion — renders a single question in the cinematic journey.
 *
 * Features:
 *  - Full-screen layout with cinematic gradient
 *  - Category + cinematic label with typewriter effect
 *  - Choice / scale / multi / text input variants
 *  - Smooth exit animation on answer
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { JourneyQuestion, JourneyAnswer, JourneyOption } from "@/lib/journey/journeyQuestions";

interface CinematicQuestionProps {
  question: JourneyQuestion;
  questionIndex: number;
  totalQuestions: number;
  gradient: string;
  onAnswer: (questionIndex: number, answer: JourneyAnswer) => void;
  onSkip: () => void;
}

export default function CinematicQuestion({
  question,
  questionIndex,
  totalQuestions,
  gradient,
  onAnswer,
  onSkip,
}: CinematicQuestionProps) {
  const [displayedLabel, setDisplayedLabel] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [answered, setAnswered] = useState(false);
  const labelRef = useRef(question.cinematicLabel);
  const typeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Typewriter effect
  useEffect(() => {
    setDisplayedLabel("");
    setIsTyping(true);
    labelRef.current = question.cinematicLabel;
    const full = question.cinematicLabel;
    let idx = 0;
    const speed = full.length > 80 ? 18 : 28;
    const tick = () => {
      if (idx < full.length) {
        setDisplayedLabel(full.slice(0, idx + 1));
        idx++;
        typeTimerRef.current = setTimeout(tick, speed);
      } else {
        setIsTyping(false);
      }
    };
    const startDelay = setTimeout(tick, 400);
    return () => {
      clearTimeout(startDelay);
      clearTimeout(typeTimerRef.current);
    };
  }, [question.cinematicLabel]);

  const handleChoice = useCallback(
    (option: JourneyOption) => {
      if (answered) return;
      setAnswered(true);
      const answer: JourneyAnswer = {
        questionId: question.id,
        questionIndex,
        kind: question.kind === "multi" ? "multi" : "choice",
        value: question.multi ? [option.id] : option.id,
        rawOptionId: option.id,
        scoreTags: option.scoreTags,
        answeredAt: new Date().toISOString(),
      };
      setTimeout(() => onAnswer(questionIndex, answer), 600);
    },
    [answered, onAnswer, question, questionIndex],
  );

  const handleMultiToggle = useCallback(
    (option: JourneyOption, current: string[]) => {
      if (answered) return;
      const has = current.includes(option.id);
      const next = has ? current.filter((x) => x !== option.id) : [...current, option.id];
      if (question.maxSelect && next.length > question.maxSelect) return;
      if (next.length === 0) return;
      if (next.length >= (question.maxSelect || Infinity)) {
        setAnswered(true);
        const answer: JourneyAnswer = {
          questionId: question.id,
          questionIndex,
          kind: "multi",
          value: next,
          scoreTags: option.scoreTags,
          answeredAt: new Date().toISOString(),
        };
        setTimeout(() => onAnswer(questionIndex, answer), 600);
      }
    },
    [answered, onAnswer, question, questionIndex],
  );

  const handleScale = useCallback(
    (val: number) => {
      if (answered) return;
      setAnswered(true);
      const answer: JourneyAnswer = {
        questionId: question.id,
        questionIndex,
        kind: "scale",
        value: val,
        scoreTags: [{ band: val / 10 }],
        answeredAt: new Date().toISOString(),
      };
      setTimeout(() => onAnswer(questionIndex, answer), 600);
    },
    [answered, onAnswer, question, questionIndex],
  );

  const handleText = useCallback(
    (val: string) => {
      if (answered) return;
      if (val.length < 5) return;
      setAnswered(true);
      const answer: JourneyAnswer = {
        questionId: question.id,
        questionIndex,
        kind: "text",
        value: val,
        scoreTags: [{ purposeClarity: val.length / 100 }],
        answeredAt: new Date().toISOString(),
      };
      setTimeout(() => onAnswer(questionIndex, answer), 600);
    },
    [answered, onAnswer, question, questionIndex],
  );

  const categoryColor =
    question.category === "consciousness" ? "text-indigo-300"
    : question.category === "loops" ? "text-red-300"
    : question.category === "witness" ? "text-amber-300"
    : question.category === "paths" ? "text-purple-300"
    : question.category === "archetype" ? "text-fuchsia-300"
    : question.category === "shadow" ? "text-orange-300"
    : question.category === "purpose" ? "text-emerald-300"
    : "text-white/50";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Category label */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`text-[11px] tracking-[0.35em] uppercase font-body ${categoryColor}`}>
            {question.categoryLabel}
          </span>
        </motion.div>

        {/* Question text with typewriter */}
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white text-center leading-relaxed mb-4 min-h-[4rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {displayedLabel}
          {isTyping && (
            <motion.span
              className="inline-block w-[2px] h-6 md:h-8 bg-white/70 ml-1 align-middle"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </motion.h2>

        {/* Subtitle */}
        {question.cinematicSubtitle && (
          <motion.p
            className="text-white/40 text-center font-body text-sm mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {question.cinematicSubtitle}
          </motion.p>
        )}

        {/* Answer area — revealed after label is typed */}
        <AnimatePresence>
          {!isTyping && !answered && (
            <motion.div
              className="mt-8 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Choice / Multi */}
              {(question.kind === "choice" || question.kind === "multi") && question.options && (
                <div className="space-y-2.5">
                  {question.options?.map((opt, i) => (
                    <motion.button
                      key={opt.id}
                      onClick={() =>
                        question.multi
                          ? handleMultiToggle(opt, [])
                          : handleChoice(opt)
                      }
                      className="w-full text-left px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-white/80 hover:text-white font-body text-sm transition-all group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="group-hover:text-white transition-colors">{opt.label}</span>
                      {opt.hint && (
                        <span className="block text-white/30 text-xs mt-0.5">{opt.hint}</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Scale */}
              {question.kind === "scale" && (
                <ScaleInput
                  min={question.min || 0}
                  max={question.max || 10}
                  minLabel={question.minLabel || ""}
                  maxLabel={question.maxLabel || ""}
                  onSelect={handleScale}
                />
              )}

              {/* Text */}
              {question.kind === "text" && (
                <TextInput
                  placeholder={question.placeholder || ""}
                  maxLength={question.maxLength || 500}
                  onSubmit={handleText}
                />
              )}

              {/* Skip */}
              <div className="text-center pt-4">
                <button
                  onClick={onSkip}
                  className="text-white/25 hover:text-white/50 text-xs font-body transition-colors"
                >
                  Skip this question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer confirmation flash */}
        <AnimatePresence>
          {answered && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.svg
                  className="w-8 h-8 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScaleInput({
  min,
  max,
  minLabel,
  maxLabel,
  onSelect,
}: {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onSelect: (val: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (val: number) => {
    setSelected(val);
    onSelect(val);
  };

  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] text-white/30 font-body tracking-wider uppercase">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <div className="flex justify-between gap-2">
        {values.map((val) => {
          const isActive = val === (hovered ?? selected);
          return (
            <motion.button
              key={val}
              onClick={() => handleSelect(val)}
              onMouseEnter={() => setHovered(val)}
              onMouseLeave={() => setHovered(null)}
              className={`flex-1 py-3 rounded-xl text-xs font-display font-semibold transition-all ${
                isActive
                  ? "bg-white/15 border border-white/30 text-white shadow-lg shadow-white/10"
                  : "bg-white/5 border border-white/5 text-white/40 hover:bg-white/10"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {val}
            </motion.button>
          );
        })}
      </div>
      {selected !== null && (
        <motion.p
          className="text-center text-white/50 text-xs font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selected} — confirmed
        </motion.p>
      )}
    </div>
  );
}

function TextInput({
  placeholder,
  maxLength,
  onSubmit,
}: {
  placeholder: string;
  maxLength: number;
  onSubmit: (val: string) => void;
}) {
  const [val, setVal] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-3">
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value.slice(0, maxLength))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white/80 font-body text-sm placeholder:text-white/20 resize-none transition-all outline-none"
      />
      <div className="flex justify-between items-center">
        <span className="text-white/20 text-[10px] font-body">
          {val.length} / {maxLength}
        </span>
        <button
          onClick={() => onSubmit(val)}
          disabled={val.length < 5}
          className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 text-xs font-display hover:bg-white/20 disabled:opacity-30 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
