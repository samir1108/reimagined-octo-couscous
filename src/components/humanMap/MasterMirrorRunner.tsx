/**
 * MasterMirrorRunner — full-screen cinematic discovery mirror.
 * - Resumable (uses mirror_progress.master_mirror_index)
 * - Mixed: scenario / slider / text
 * - On completion, triggers integrate-human-map silently.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { QUESTIONS, MirrorQuestion } from "@/data/humanMap/questions";
import { dimensionById } from "@/data/humanMap/dimensions";
import {
  useMirrorProgress,
  useSaveMirrorAnswer,
  useAdvanceMirror,
  triggerHumanMapIntegration,
} from "@/hooks/useHumanMap";
import { toast } from "sonner";

export default function MasterMirrorRunner({ onClose }: { onClose: () => void }) {
  const { data: progress } = useMirrorProgress();
  const startIdx = Math.min(progress?.master_mirror_index ?? 0, QUESTIONS.length - 1);
  const [idx, setIdx] = useState(startIdx);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // local input state per type
  const [choiceIdx, setChoiceIdx] = useState<number | null>(null);
  const [slider, setSlider] = useState(50);
  const [text, setText] = useState("");

  const save = useSaveMirrorAnswer();
  const advance = useAdvanceMirror();

  const q: MirrorQuestion | undefined = QUESTIONS[idx];
  const dim = q ? dimensionById(q.dimension_id) : undefined;
  const total = QUESTIONS.length;
  const pct = useMemo(() => Math.round((idx / total) * 100), [idx, total]);

  useEffect(() => {
    setChoiceIdx(null);
    setSlider(50);
    setText("");
  }, [idx]);

  if (!q) return null;

  const canContinue =
    q.type === "scenario" ? choiceIdx !== null :
    q.type === "slider"   ? true :
    text.trim().length > 0;

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);

    let value: any = null;
    if (q.type === "scenario" && choiceIdx !== null && q.choices) {
      value = { choice: choiceIdx, weight: q.choices[choiceIdx].weight };
    } else if (q.type === "slider") {
      value = { score: slider };
    } else {
      value = { text: text.trim() };
    }

    try {
      await save.mutateAsync({
        dimension_id: q.dimension_id,
        question_id: q.id,
        question_type: q.type,
        answer_value: value,
      });

      const next = idx + 1;
      const done = next >= total;
      await advance.mutateAsync({ index: next, completed: done });

      if (done) {
        setFinishing(true);
        const r = await triggerHumanMapIntegration();
        toast.success(
          r?.updated
            ? `Human Map updated — ${r.updated} dimensions discovered`
            : "Mirror complete. Integration will run with your next sessions."
        );
        onClose();
      } else {
        setIdx(next);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save answer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-background flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/30">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center"
          aria-label="Close mirror"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="text-[11px] font-display uppercase tracking-widest text-muted-foreground">
          Master Mirror · {idx + 1}/{total}
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted/20">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mx-auto max-w-md space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {dim && (
                <div className="text-[11px] uppercase tracking-widest text-primary/70">
                  {dim.label}
                </div>
              )}
              <h2 className="font-display text-2xl text-foreground leading-snug">
                {q.prompt}
              </h2>

              {q.type === "scenario" && q.choices && (
                <div className="space-y-2">
                  {q.choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setChoiceIdx(i)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                        choiceIdx === i
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/40 bg-card/40 text-foreground/80 hover:border-border"
                      }`}
                    >
                      <span className="text-sm font-body">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {q.type === "slider" && (
                <div className="space-y-3 pt-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={slider}
                    onChange={(e) => setSlider(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{q.sliderLabels?.low ?? "Low"}</span>
                    <span className="text-primary font-display">{slider}</span>
                    <span>{q.sliderLabels?.high ?? "High"}</span>
                  </div>
                </div>
              )}

              {q.type === "text" && (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={q.placeholder ?? "Your words…"}
                  rows={4}
                  className="w-full rounded-2xl bg-card/40 border border-border/40 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 pt-3 border-t border-border/30">
        <div className="mx-auto max-w-md flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-body text-muted-foreground"
          >
            Save & exit
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue || submitting || finishing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-display tracking-wide disabled:opacity-40 transition-opacity"
          >
            {submitting || finishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {idx + 1 === total ? "Reveal Map" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
