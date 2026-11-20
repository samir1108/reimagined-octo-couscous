import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { FoundationQuestion } from "@/lib/onboarding/foundationQuestions";

interface Props {
  question: FoundationQuestion;
  index: number;
  total: number;
  value: string | number | string[] | undefined;
  canBack: boolean;
  canFinishEarly?: boolean;
  onAnswer: (v: string | number | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onFinishEarly?: () => void;
}

export default function QuestionCard({ question: q, index, total, value, canBack, canFinishEarly, onAnswer, onNext, onBack, onFinishEarly }: Props) {
  const [text, setText] = useState<string>(typeof value === "string" ? value : "");
  useEffect(() => {
    setText(typeof value === "string" ? value : "");
  }, [q.id, value]);

  const canAdvance =
    q.kind === "text"
      ? text.trim().length >= 2
      : q.kind === "choice" && q.multi
        ? Array.isArray(value) && value.length > 0
        : value !== undefined && value !== null && value !== "";

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-[100dvh] flex flex-col bg-background"
    >
      {/* Top bar: progress dots + back */}
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
          <h2 className="font-display text-[22px] sm:text-2xl text-foreground leading-snug text-center mb-2">
            {q.title}
          </h2>
          {("subtitle" in q && q.subtitle) && (
            <p className="text-[13px] text-muted-foreground text-center mb-7">{q.subtitle}</p>
          )}
          {!("subtitle" in q && q.subtitle) && <div className="h-5" />}

          {q.hint && (
            <p className="text-[11px] text-primary/80 text-center italic mb-5 leading-relaxed">
              {q.hint}
            </p>
          )}

          {q.kind === "choice" && !q.multi && (
            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const active = value === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onAnswer(opt.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                      active
                        ? "bg-primary/15 border-primary/60 shadow-[0_0_28px_-10px_hsl(var(--primary)/0.6)]"
                        : "bg-card/40 border-border/30 hover:border-border/60 hover:bg-card/60"
                    }`}
                  >
                    <p className={`font-display text-[15px] ${active ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                    {opt.hint && (
                      <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{opt.hint}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {q.kind === "choice" && q.multi && (
            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const active = Array.isArray(value) && value.includes(opt.id);
                const disabled = !active && Array.isArray(value) && value.length >= (q.maxSelect || 3);
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      const curr = Array.isArray(value) ? value : [];
                      if (active) {
                        onAnswer(curr.filter((v) => v !== opt.id));
                      } else if (!disabled) {
                        onAnswer([...curr, opt.id]);
                      }
                    }}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                      active
                        ? "bg-primary/15 border-primary/60 shadow-[0_0_28px_-10px_hsl(var(--primary)/0.6)]"
                        : "bg-card/40 border-border/30 hover:border-border/60 hover:bg-card/60"
                    } ${disabled && !active ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <p className={`font-display text-[15px] ${active ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {q.kind === "scale" && (
            <ScaleInput
              min={q.min}
              max={q.max}
              minLabel={q.minLabel}
              maxLabel={q.maxLabel}
              value={typeof value === "number" ? value : undefined}
              onChange={onAnswer}
            />
          )}

          {q.kind === "text" && (
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => {
                  const v = e.target.value.slice(0, q.maxLength);
                  setText(v);
                  onAnswer(v);
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
      </div>

      {/* CTA */}
      <div className="px-5 pb-7 pt-2 flex flex-col items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!canAdvance}
          className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none hover:bg-primary/90 transition"
        >
          {index === total - 1 ? "See what I see" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </motion.button>
        {canFinishEarly && onFinishEarly && index < total - 1 && (
          <button
            onClick={onFinishEarly}
            className="text-[11.5px] tracking-wide text-muted-foreground/80 hover:text-foreground transition mt-1"
          >
            Skip ahead — show my reading now
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ScaleInput({
  min, max, minLabel, maxLabel, value, onChange,
}: {
  min: number; max: number; minLabel: string; maxLabel: string;
  value: number | undefined; onChange: (v: number) => void;
}) {
  const steps = [];
  for (let i = min; i <= max; i++) steps.push(i);
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {steps.map((s) => {
          const active = value === s;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`h-14 rounded-2xl border transition-all font-display text-base ${
                active
                  ? "bg-primary/15 border-primary/60 text-primary shadow-[0_0_24px_-10px_hsl(var(--primary)/0.6)]"
                  : "bg-card/40 border-border/30 text-foreground/70 hover:border-border/60"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10.5px] text-muted-foreground/70">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
