/**
 * AwakeningStepCard — renders one beat of an Awakening Journey session.
 * ─────────────────────────────────
 * The six beats of every session:
 *   question     → choice / scale / text (answered into the capability map)
 *   practice     → breath pacer, timed silence, or a real game from the
 *                  library (completed as measured evidence)
 *   experiment   → the real-world act, phrased as a vow in the user's words
 *
 * Progress is local-first; the journey screen owns the answers.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Gamepad2, Wind } from "lucide-react";
import type {
  AwakeningAnswer,
  AwakeningPractice,
  AwakeningSession,
  PlannedStep,
} from "@/lib/onboarding/awakening";
import { signalsFor, loopsFor, type CapabilityId } from "@/lib/onboarding/awakening";

const BEAT_LABELS: Record<string, string> = {
  arrival: "Arrival",
  observation: "Observation",
  investigation: "Investigation",
  practice: "Practice",
  application: "Application",
  reflection: "Reflection",
};

interface Props {
  step: PlannedStep;
  session: AwakeningSession;
  index: number;
  total: number;
  canBack: boolean;
  onAnswer: (answer: AwakeningAnswer) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AwakeningStepCard({
  step, session, index, total, canBack, onAnswer, onNext, onBack,
}: Props) {
  const [pending, setPending] = useState<AwakeningAnswer | null>(null);

  const advance = () => {
    if (pending) onAnswer(pending);
    onNext();
  };

  return (
    <motion.div
      key={`${session.id}-${index}-${step.kind}`}
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
          {step.kind === "question" && (
            <QuestionBody step={step} session={session} onAnswer={setPending} />
          )}
          {step.kind === "practice" && (
            <PracticeBody practice={step.practice} session={session} onAnswer={setPending} />
          )}
          {step.kind === "experiment" && (
            <ExperimentBody session={session} onAnswer={setPending} />
          )}
        </div>
      </div>

      {/* CTA — the practice and experiment beats gate on a recorded answer */}
      <div className="px-5 pb-7 pt-2 flex flex-col items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={advance}
          disabled={
            (step.kind === "question" || step.kind === "experiment") && !pending
          }
          className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none hover:bg-primary/90 transition"
        >
          {index === total - 1 ? "Close the session" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── question ───────────────────────────────────────────────────────────

function QuestionBody({
  step, session, onAnswer,
}: {
  step: Extract<PlannedStep, { kind: "question" }>;
  session: AwakeningSession;
  onAnswer: (a: AwakeningAnswer) => void;
}) {
  const q = step.question;
  const [text, setText] = useState("");

  const answer = (value: string | number) => {
    onAnswer({
      questionId: q.id,
      sessionId: session.id,
      beat: q.beat,
      value,
      capabilities: signalsFor(q, value),
      loops: loopsFor(q, value),
      evidence: "self_reported",
    });
  };

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-4 text-center font-display">
        {BEAT_LABELS[q.beat]}
      </p>
      <h2 className="font-display text-[22px] sm:text-2xl text-foreground leading-snug text-center mb-2">
        {q.title}
      </h2>
      {q.subtitle && <p className="text-[13px] text-muted-foreground text-center mb-7">{q.subtitle}</p>}
      {!q.subtitle && <div className="h-5" />}

      {q.kind === "choice" && (
        <div className="space-y-2.5">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => answer(opt.id)}
              className="w-full text-left px-4 py-3.5 rounded-2xl border border-border/30 bg-card/40 hover:border-primary/60 hover:bg-card/60 transition-all"
            >
              <p className="font-display text-[15px] text-foreground">{opt.label}</p>
              {opt.hint && <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{opt.hint}</p>}
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
                onClick={() => answer(s)}
                className="h-14 rounded-2xl border border-border/30 bg-card/40 text-foreground/70 hover:border-primary/60 hover:text-foreground transition-all font-display text-base"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10.5px] text-muted-foreground/70">
            <span className="max-w-[45%]">{q.minLabel}</span>
            <span className="max-w-[45%] text-right">{q.maxLabel}</span>
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
              if (v.trim().length >= 2) answer(v);
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

// ─── practice ───────────────────────────────────────────────────────────

function PracticeBody({
  practice, session, onAnswer,
}: {
  practice: AwakeningPractice;
  session: AwakeningSession;
  onAnswer: (a: AwakeningAnswer) => void;
}) {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const record = (completed: boolean, line?: string) => {
    setDone(true);
    const capabilities: Partial<Record<CapabilityId, number>> = {};
    for (const c of practice.trains) capabilities[c] = completed ? 8 : 4;
    onAnswer({
      questionId: `${session.id}_practice`,
      sessionId: session.id,
      beat: "practice",
      value: line && line.trim().length >= 2 ? line.trim() : completed ? "completed" : "skipped",
      capabilities,
      evidence: "measured",
    });
  };

  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-4 font-display">Practice</p>
      <h2 className="font-display text-2xl text-foreground leading-snug mb-4">{practice.title}</h2>
      <p className="text-[14.5px] text-muted-foreground leading-relaxed mb-7 max-w-sm mx-auto">
        {practice.instruction}
      </p>

      {practice.kind === "breath" && (
        <BreathPacer practice={practice} onDone={() => record(true)} />
      )}

      {practice.kind === "silence" && (
        <SilencePacer practice={practice} onDone={(line) => record(true, line)} />
      )}

      {practice.kind === "game" && practice.gameId && (
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/app/games/${practice.gameId}`)}
            className="w-full px-6 py-4 rounded-2xl border border-primary/40 bg-primary/[0.07] hover:bg-primary/[0.12] transition flex items-center justify-center gap-3"
          >
            <Gamepad2 className="h-5 w-5 text-primary/80" />
            <span className="font-display text-[15px] text-foreground">Open the practice</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => record(true)}
              className="flex-1 px-4 py-2.5 rounded-full text-[12.5px] font-display border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition"
            >
              I practiced — continue
            </button>
            <button
              onClick={() => record(false)}
              className="px-4 py-2.5 rounded-full text-[12.5px] font-display border border-border/30 text-muted-foreground/70 hover:text-foreground transition"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {(practice.kind === "body_scan" || practice.kind === "gaze") && practice.gameId && (
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/app/games/${practice.gameId}`)}
            className="w-full px-6 py-4 rounded-2xl border border-primary/40 bg-primary/[0.07] hover:bg-primary/[0.12] transition flex items-center justify-center gap-3"
          >
            <Gamepad2 className="h-5 w-5 text-primary/80" />
            <span className="font-display text-[15px] text-foreground">Open the practice</span>
          </button>
          <button
            onClick={() => record(true)}
            className="px-4 py-2.5 rounded-full text-[12.5px] font-display border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition"
          >
            I practiced — continue
          </button>
        </div>
      )}

      {practice.note && (
        <p className="text-[12px] text-muted-foreground/80 mt-7 leading-relaxed max-w-sm mx-auto italic">
          {practice.note}
        </p>
      )}
      {done && (
        <p className="text-[11px] text-primary/80 mt-4 font-display tracking-wide">Recorded</p>
      )}
    </div>
  );
}

// ─── breath pacer (4·4·6 style) ─────────────────────────────────────────

function BreathPacer({ practice, onDone }: { practice: AwakeningPractice; onDone: () => void }) {
  const phases = useMemo(
    () => (practice.pattern ?? "4·4·6").split("·").map((p) => parseInt(p.trim(), 10)).filter((n) => !Number.isNaN(n)),
    [practice.pattern]
  );
  const rounds = practice.rounds ?? 6;
  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [left, setLeft] = useState(phases[0] ?? 4);
  const complete = round > rounds;

  useEffect(() => {
    if (complete) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        setPhaseIdx((pi) => {
          const nextPi = pi + 1;
          if (nextPi < phases.length) return nextPi;
          setRound((r) => r + 1);
          return 0;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [complete, phases.length]);

  useEffect(() => {
    setLeft(phases[phaseIdx] ?? 4);
  }, [phaseIdx, round, phases]);

  const phaseNames = ["Inhale", "Hold", "Exhale", "Rest"];
  const phaseName = phaseNames[phaseIdx] ?? "Breathe";

  if (complete) {
    return (
      <div className="mt-6">
        <p className="font-display text-[15px] text-foreground/85 mb-4">Six rounds complete.</p>
        <button
          onClick={onDone}
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="text-center mt-2">
      <motion.div
        className="mx-auto w-32 h-32 rounded-full bg-primary/15 border border-primary/40 grid place-items-center mb-5"
        animate={{ scale: phaseName === "Inhale" ? 1.15 : phaseName === "Exhale" ? 0.9 : 1 }}
        transition={{ duration: Math.max(1, phases[phaseIdx] ?? 4), ease: "easeInOut" }}
      >
        <div>
          <p className="font-display text-lg text-foreground">{phaseName}</p>
          <p className="font-display text-2xl text-foreground tabular-nums">{left}</p>
        </div>
      </motion.div>
      <p className="text-[12px] text-muted-foreground/80 tabular-nums">
        Round {Math.min(round, rounds)} of {rounds} · {practice.pattern}
      </p>
      <button
        onClick={onDone}
        className="mt-5 text-[11.5px] text-muted-foreground/70 hover:text-foreground transition font-display"
      >
        Skip the pacer
      </button>
    </div>
  );
}

// ─── silence pacer ──────────────────────────────────────────────────────

function SilencePacer({ practice, onDone }: { practice: AwakeningPractice; onDone: (line?: string) => void }) {
  const total = practice.seconds ?? 60;
  const [left, setLeft] = useState(total);
  const [line, setLine] = useState("");
  const complete = left <= 0;

  useEffect(() => {
    if (complete) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [complete]);

  return (
    <div className="text-center">
      <motion.div
        className="mx-auto w-28 h-28 rounded-full border border-primary/30 grid place-items-center mb-6"
        animate={{ scale: [1, 1.05, 1], opacity: complete ? 0.7 : 1 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "0 0 60px -20px hsl(var(--primary)/0.5)" }}
      >
        <span className="font-display text-2xl text-foreground tabular-nums">
          {complete ? "◦" : `${left}s`}
        </span>
      </motion.div>

      {practice.speakInto && (
        <div className="text-left space-y-2 max-w-sm mx-auto">
          <p className="text-[11px] text-muted-foreground/80 italic">{practice.speakInto}</p>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value.slice(0, 120))}
            placeholder="One line. Optional."
            className="w-full px-4 py-3 rounded-2xl bg-card/40 border border-border/30 focus:border-primary/60 focus:outline-none text-foreground text-[15px]"
          />
        </div>
      )}

      {(complete || line.trim().length >= 2) && (
        <button
          onClick={() => onDone(line)}
          className="mt-7 px-8 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
        >
          Continue
        </button>
      )}
      {!complete && !line && (
        <button
          onClick={() => onDone()}
          className="mt-6 block mx-auto text-[11.5px] text-muted-foreground/70 hover:text-foreground transition font-display"
        >
          End the silence
        </button>
      )}
    </div>
  );
}

// ─── experiment (the real-world act) ────────────────────────────────────

function ExperimentBody({
  session, onAnswer,
}: {
  session: AwakeningSession;
  onAnswer: (a: AwakeningAnswer) => void;
}) {
  const [vow, setVow] = useState("");
  const exp = session.experiment;

  const commit = (v: string) => {
    if (v.trim().length < 2) return;
    onAnswer({
      questionId: `${session.id}_vow`,
      sessionId: session.id,
      beat: "application",
      value: v.trim(),
      capabilities: { discipline: 7, intention: 7 },
      evidence: "self_reported",
    });
  };

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-4 text-center font-display">
        Application
      </p>
      <h2 className="font-display text-[22px] sm:text-2xl text-foreground leading-snug text-center mb-5">
        {exp.title}
      </h2>
      <p className="text-[14.5px] text-muted-foreground leading-relaxed mb-7">{exp.body}</p>

      <label className="block text-[11px] text-muted-foreground/80 italic mb-2">
        Phrase it in your own words — a vow, not a task:
      </label>
      <input
        value={vow}
        onChange={(e) => {
          const v = e.target.value.slice(0, 120);
          setVow(v);
          commit(v);
        }}
        placeholder={exp.vowLabel}
        className="w-full px-4 py-3 rounded-2xl bg-card/40 border border-border/30 focus:border-primary/60 focus:outline-none text-foreground text-[15px]"
      />
      <div className="flex items-center gap-2 mt-3 text-[11.5px] text-muted-foreground/70">
        <Wind className="h-3.5 w-3.5" />
        <span>You will be asked about this at the start of the next session.</span>
      </div>
    </div>
  );
}
