/**
 * SittingStepCard — renders one planned step of a First Eleven sitting.
 * ─────────────────────────────────
 * Step kinds: teaching (the room's voice), question (choice / scale / text,
 * answered into the mapping), silence (timed, with an optional one-line
 * speak-into), breath (patterned pacer), act (a vow in the user's words).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PlannedStep, SEAnswer, SERole } from "@/lib/onboarding/firstElevenTypes";

const ROLE_LABELS: Record<SERole, string> = {
  open: "The opening",
  deepen: "Deeper",
  body: "The body",
  mirror: "The mirror",
  choice: "The turning",
};

interface Props {
  step: PlannedStep;
  sessionN: number;
  sessionId: string;
  index: number;
  total: number;
  canBack: boolean;
  onAnswer: (answer: SEAnswer) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SittingStepCard({
  step, sessionN, sessionId, index, total, canBack, onAnswer, onNext, onBack,
}: Props) {
  const [pending, setPending] = useState<SEAnswer | null>(null);

  const advance = () => {
    if (pending) onAnswer(pending);
    onNext();
  };

  return (
    <motion.div
      key={`${sessionN}-${index}-${step.kind}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-[100dvh] flex flex-col bg-background"
    >
      {/* Top bar: progress + back */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={!canBack}
          aria-label="Back"
          className="h-9 w-9 grid place-items-center rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i < index ? "bg-primary/70" : i === index ? "bg-primary" : "bg-border/30"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] tracking-widest text-muted-foreground/70 tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-start sm:items-center justify-center px-5 pt-4 pb-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {step.kind === "teaching" && <TeachingBody step={step} />}

          {step.kind === "question" && (
            <QuestionBody
              step={step}
              sessionN={sessionN}
              sessionId={sessionId}
              onAnswer={setPending}
            />
          )}

          {step.kind === "silence" && (
            <SilenceBody step={step} sessionN={sessionN} sessionId={sessionId} onAnswer={onAnswer} onNext={onNext} />
          )}

          {step.kind === "breath" && <BreathBody step={step} />}

          {step.kind === "act" && (
            <ActBody step={step} sessionN={sessionN} sessionId={sessionId} onAnswer={setPending} />
          )}
        </div>
      </div>

      {/* CTA */}
      {step.kind !== "silence" && (
        <div className="px-5 pb-7 pt-2 flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={advance}
            disabled={step.kind !== "teaching" && step.kind !== "breath" && !pending}
            className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none hover:bg-primary/90 transition"
          >
            {index === total - 1 ? "Close the sitting" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ─── teaching ───────────────────────────────────────────────────────────
function TeachingBody({ step }: { step: Extract<PlannedStep, { kind: "teaching" }> }) {
  return (
    <div>
      {step.master && (
        <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-4 text-center font-display">
          {step.master}
        </p>
      )}
      <h2 className="font-display text-[22px] sm:text-2xl text-foreground leading-snug text-center mb-5">
        {step.title}
      </h2>
      <p className="text-[14.5px] text-muted-foreground leading-relaxed">{step.body}</p>
      {step.quote && (
        <blockquote className="mt-6 border-l-2 border-primary/40 pl-4">
          <p className="font-display italic text-foreground/85 text-[15px] leading-relaxed">
            "{step.quote.text}"
          </p>
          <footer className="text-[11px] text-muted-foreground/70 mt-1">— {step.quote.source}</footer>
        </blockquote>
      )}
    </div>
  );
}

// ─── question ───────────────────────────────────────────────────────────
function QuestionBody({
  step, sessionN, sessionId, onAnswer,
}: {
  step: Extract<PlannedStep, { kind: "question" }>;
  sessionN: number;
  sessionId: string;
  onAnswer: (a: SEAnswer) => void;
}) {
  const q = step.question;
  const [text, setText] = useState("");

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-4 text-center font-display">
        {ROLE_LABELS[step.role]}
      </p>
      <h2 className="font-display text-[22px] sm:text-2xl text-foreground leading-snug text-center mb-2">
        {q.title}
      </h2>
      {q.subtitle && (
        <p className="text-[13px] text-muted-foreground text-center mb-7">{q.subtitle}</p>
      )}
      {!q.subtitle && <div className="h-5" />}

      {q.kind === "choice" && (
        <div className="space-y-2.5">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() =>
                onAnswer({
                  questionId: q.id,
                  sessionId,
                  value: opt.id,
                  band: opt.band,
                  dimension: opt.dimension,
                  loops: opt.loops,
                })
              }
              className="w-full text-left px-4 py-3.5 rounded-2xl border border-border/30 bg-card/40 hover:border-primary/60 hover:bg-card/60 transition-all"
            >
              <p className="font-display text-[15px] text-foreground">{opt.label}</p>
              {opt.hint && (
                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{opt.hint}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {q.kind === "scale" && (
        <div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() =>
                  onAnswer({
                    questionId: q.id,
                    sessionId,
                    value: s,
                    band: Math.round((q.lowBand + ((q.highBand - q.lowBand) * (s - 1)) / 4) * 10) / 10,
                    dimension: q.dimension,
                    loops: q.loops,
                  })
                }
                className="h-14 rounded-2xl border border-border/30 bg-card/40 text-foreground/70 hover:border-primary/60 hover:text-foreground transition-all font-display text-base"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10.5px] text-muted-foreground/70">
            <span>{q.minLabel}</span>
            <span>{q.maxLabel}</span>
          </div>
        </div>
      )}

      {q.kind === "text" && (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => {
              const v = e.target.value.slice(0, q.maxLength);
              setText(v);
              if (v.trim().length >= 2) {
                onAnswer({
                  questionId: q.id,
                  sessionId,
                  value: v,
                  band: q.bandHint,
                  dimension: q.dimension,
                  loops: q.loops,
                });
              }
            }}
            placeholder={q.placeholder}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-card/40 border border-border/30 focus:border-primary/60 focus:outline-none text-foreground text-[15px] resize-none leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground/60 text-right tabular-nums">
            {text.length}/{q.maxLength}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── silence ────────────────────────────────────────────────────────────
function SilenceBody({
  step, sessionN, sessionId, onAnswer, onNext,
}: {
  step: Extract<PlannedStep, { kind: "silence" }>;
  sessionN: number;
  sessionId: string;
  onAnswer: (a: SEAnswer) => void;
  onNext: () => void;
}) {
  const [left, setLeft] = useState(step.seconds);
  const [line, setLine] = useState("");
  const done = left <= 0;
  const questionId = `s${String(sessionN).padStart(2, "0")}_silence`;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [done]);

  // A spoken-into line is itself an answer; keep the parent's record fresh.
  const commitLine = (v: string) => {
    if (v.trim().length >= 2) {
      onAnswer({ questionId, sessionId, value: v.trim(), band: 5, dimension: "body" });
    }
  };

  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-6 font-display">
        The silence
      </p>

      <motion.div
        className="mx-auto w-32 h-32 rounded-full border border-primary/30 grid place-items-center mb-8"
        animate={{ scale: [1, 1.05, 1], opacity: done ? 0.7 : 1 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "0 0 60px -20px hsl(var(--primary)/0.5)" }}
      >
        <span className="font-display text-2xl text-foreground tabular-nums">
          {done ? "◦" : `${left}s`}
        </span>
      </motion.div>

      <p className="font-display text-[15px] text-foreground/85 leading-relaxed mb-8">
        {step.prompt}
      </p>

      {step.speakInto && (
        <div className="text-left space-y-2">
          <p className="text-[11px] text-muted-foreground/80 italic">{step.speakInto}</p>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value.slice(0, 120))}
            onBlur={() => commitLine(line)}
            placeholder="One line. Optional."
            className="w-full px-4 py-3 rounded-2xl bg-card/40 border border-border/30 focus:border-primary/60 focus:outline-none text-foreground text-[15px]"
          />
        </div>
      )}

      {(done || line.trim().length >= 2) && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            commitLine(line);
            onNext();
          }}
          className="mt-8 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

// ─── breath ─────────────────────────────────────────────────────────────
function BreathBody({ step }: { step: Extract<PlannedStep, { kind: "breath" }> }) {
  const phases = useMemo(
    () => step.pattern.split("·").map((p) => parseInt(p.trim(), 10)).filter((n) => !Number.isNaN(n)),
    [step.pattern]
  );
  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [left, setLeft] = useState(phases[0] ?? 4);
  const done = round > step.rounds;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        // move to next phase
        setPhaseIdx((pi) => {
          const nextPi = pi + 1;
          if (nextPi < phases.length) return nextPi;
          setRound((r) => r + 1);
          return 0;
        });
        return 0; // corrected on next tick by the effect below
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, phases.length]);

  // when phase/round changes, reset the counter to that phase's length
  useEffect(() => {
    setLeft(phases[phaseIdx] ?? 4);
  }, [phaseIdx, round, phases]);

  const phaseNames = ["Inhale", "Hold", "Exhale", "Rest"];
  const phaseName = phaseNames[phaseIdx] ?? "Breathe";

  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-6 font-display">
        The breath
      </p>

      <motion.div
        className="mx-auto w-36 h-36 rounded-full bg-primary/15 border border-primary/40 grid place-items-center mb-8"
        animate={{
          scale: done ? 1 : phaseName === "Inhale" ? 1.15 : phaseName === "Exhale" ? 0.9 : 1,
        }}
        transition={{ duration: Math.max(1, phases[phaseIdx] ?? 4), ease: "easeInOut" }}
      >
        <div>
          <p className="font-display text-lg text-foreground">{done ? "◦" : phaseName}</p>
          {!done && (
            <p className="font-display text-2xl text-foreground tabular-nums">{left}</p>
          )}
        </div>
      </motion.div>

      <p className="text-[12px] text-muted-foreground/80 mb-2 tabular-nums">
        {done ? "Complete" : `Round ${Math.min(round, step.rounds)} of ${step.rounds} · ${step.pattern}`}
      </p>
      <p className="font-display text-[14px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
        {step.note}
      </p>
    </div>
  );
}

// ─── act ────────────────────────────────────────────────────────────────
function ActBody({
  step, sessionN, sessionId, onAnswer,
}: {
  step: Extract<PlannedStep, { kind: "act" }>;
  sessionN: number;
  sessionId: string;
  onAnswer: (a: SEAnswer) => void;
}) {
  const [vow, setVow] = useState(step.vowLabel);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-4 text-center font-display">
        The small act
      </p>
      <h2 className="font-display text-[22px] sm:text-2xl text-foreground leading-snug text-center mb-5">
        {step.title}
      </h2>
      <p className="text-[14.5px] text-muted-foreground leading-relaxed mb-7">{step.body}</p>

      <label className="block text-[11px] text-muted-foreground/80 italic mb-2">
        Phrase it in your own words — a vow, not a task:
      </label>
      <input
        value={vow}
        onChange={(e) => {
          const v = e.target.value.slice(0, 120);
          setVow(v);
          if (v.trim().length >= 2) {
            onAnswer({
              questionId: `s${String(sessionN).padStart(2, "0")}_act`,
              sessionId,
              value: v.trim(),
              band: 8,
              dimension: "awareness",
            });
          }
        }}
        placeholder={step.vowLabel}
        className="w-full px-4 py-3 rounded-2xl bg-card/40 border border-border/30 focus:border-primary/60 focus:outline-none text-foreground text-[15px]"
      />
    </div>
  );
}
