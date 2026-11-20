/**
 * Mirror Session — free 2-min AI loop diagnostic.
 * Onboarding-style chat: asks 6 questions, then reveals 3 loops + insight.
 * Public (no auth required).
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
}

const QUESTIONS: string[] = [
  "What's the one thought that loops in your head most days?",
  "When you wake up in the morning, what's the first feeling you notice in your body?",
  "What do you keep avoiding — even though you know you 'should' do it?",
  "Who or what triggers you the fastest right now?",
  "If nobody was watching, what would you actually want to do with your life?",
  "What lie do you tell yourself the most?",
];

interface Analysis {
  archetype: string;
  loops: { name: string; why: string }[];
  insight: string;
  next_step: string;
}

export default function MirrorSessionModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..QUESTIONS.length
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setStep(0); setAnswers([]); setDraft(""); setResult(null); setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && !result) inputRef.current?.focus();
  }, [open, step, result]);

  const submitAnswer = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = [...answers, trimmed];
    setAnswers(next);
    setDraft("");

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // run analysis
      setLoading(true);
      setError(null);
      try {
        const payload = next.map((a, i) => ({ q: QUESTIONS[i], a }));
        const { data, error: fnErr } = await supabase.functions.invoke("mirror-session", {
          body: { answers: payload },
        });
        if (fnErr) throw new Error(fnErr.message);
        if (data?.error) throw new Error(data.error);
        setResult(data as Analysis);
      } catch (e) {
        setError((e as Error).message || "Mirror is offline. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  if (!open) return null;
  const progress = result ? 100 : Math.round((step / QUESTIONS.length) * 100);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg bg-gradient-to-b from-amber-950/60 to-black border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-100 font-semibold text-sm tracking-wide">THE MIRROR</span>
            </div>
            <button onClick={onClose} className="text-amber-200/60 hover:text-amber-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-amber-500/10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Body */}
          <div className="p-6 min-h-[360px] flex flex-col">
            {!result && !loading && (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col"
              >
                <p className="text-xs text-amber-300/60 mb-2">Question {step + 1} of {QUESTIONS.length}</p>
                <h2 className="text-xl text-amber-50 font-medium leading-snug mb-5">
                  {QUESTIONS[step]}
                </h2>
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKey}
                  rows={4}
                  placeholder="Type honestly. No one is watching."
                  className="flex-1 w-full bg-black/40 border border-amber-500/20 rounded-xl p-3 text-amber-50 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-400/60 resize-none text-sm"
                />
                <button
                  onClick={submitAnswer}
                  disabled={!draft.trim()}
                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  {step + 1 === QUESTIONS.length ? "Reveal my mirror" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-amber-100 text-sm">The Mirror is reading you…</p>
                <p className="text-amber-200/40 text-xs">Detecting loops · 5-10 seconds</p>
              </div>
            )}

            {error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-red-300 text-sm">{error}</p>
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-100 text-sm">
                  Close
                </button>
              </div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[60vh]"
              >
                <div>
                  <p className="text-xs text-amber-300/60 uppercase tracking-wider">You are</p>
                  <h2 className="text-2xl bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold">
                    {result.archetype}
                  </h2>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-amber-300/60 uppercase tracking-wider">Loops detected</p>
                  {result.loops?.map((l, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 text-xs mt-1">◆</span>
                        <div>
                          <p className="text-amber-100 font-medium text-sm">{l.name}</p>
                          <p className="text-amber-200/70 text-xs mt-0.5 leading-relaxed">{l.why}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-amber-300/60 uppercase tracking-wider mb-1">Mirror</p>
                  <p className="text-amber-50 text-sm leading-relaxed italic">"{result.insight}"</p>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-3">
                  <p className="text-xs text-amber-300/60 uppercase tracking-wider mb-1">Start today</p>
                  <p className="text-amber-100 text-sm">{result.next_step}</p>
                </div>

                <button
                  onClick={() => { onClose(); navigate("/auth"); }}
                  className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  Begin your journey
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-amber-200/40 text-[11px]">
                  Free · This was just the surface. The full system goes 100x deeper.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
