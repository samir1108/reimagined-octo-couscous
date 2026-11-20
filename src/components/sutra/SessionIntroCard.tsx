/**
 * SessionIntroCard — pre-session reveal driven by whatNext().
 * Shows: session theme, block list (single OR compound), "Why this?" reasoning,
 * and Begin / Skip / Surprise me actions.
 *
 * Renders as a full-screen overlay. Same atmosphere as the rest of the app
 * (uses semantic tokens, no hard-coded colors).
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Sparkles, X, Shuffle, Clock, Layers, ArrowRight, Leaf, Flame, Mountain } from "lucide-react";
import type { NextSessionPlan, SessionBlock } from "@/lib/sutra/orchestrator";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";
import ArrivalRitual from "@/components/practice/ArrivalRitual";
import { useComposeTodayPractice, useLogArrivalState, type ArrivalState } from "@/hooks/useTodayPractice";

function detectTimeSlot(): string {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 16) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

type Intensity = "gentle" | "standard" | "deep";
const INTENSITY_OPTS: { id: Intensity; label: string; sub: string; icon: typeof Leaf }[] = [
  { id: "gentle",   label: "Gentle",   sub: "soft & easy",  icon: Leaf },
  { id: "standard", label: "Standard", sub: "balanced",     icon: Flame },
  { id: "deep",     label: "Deep",     sub: "go further",   icon: Mountain },
];

interface Props {
  open: boolean;
  plan: NextSessionPlan | null;
  guruId?: string | null;
  onClose: () => void;
  onSkip?: () => void;
  onSurprise?: () => void;
  /** When true, Begin proceeds straight to the session — no Arrival ritual. */
  skipArrival?: boolean;
  /** When true, hides the "What to expect" reasoning pill (used by Foundation/pre-journey). */
  hideExpect?: boolean;
}

function fmtMin(sec: number) {
  const m = Math.round(sec / 60);
  return m <= 1 ? "1m" : `${m}m`;
}

export default function SessionIntroCard({ open, plan, guruId, onClose, onSkip, onSurprise, skipArrival = false, hideExpect = false }: Props) {
  const navigate = useNavigate();
  const { submit: submitFeedback } = useSessionFeedback();
  const { start: startSpiral } = useSessionOrchestrator();
  const [showWhy, setShowWhy] = useState(false);
  const [showExpect, setShowExpect] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [intensity, setIntensity] = useState<Intensity>("standard");

  const [showArrival, setShowArrival] = useState(false);
  const composeArrival = useComposeTodayPractice();
  const logArrival = useLogArrivalState();

  // Open directly on the reveal step. Intensity will move to Settings later
  // (per-practice duration & depth preferences), so we skip the picker here.
  useEffect(() => {
    if (open) {
      setStep(2);
      setIntensity("standard");
      setShowWhy(false);
      setShowExpect(false);
      setShowArrival(false);
    }
  }, [open]);

  if (typeof document === "undefined") return null;

  const proceedAfterArrival = () => {
    if (!plan?.blocks?.length) return;
    onClose();
    if (plan.blocks.length === 1) {
      const block = plan.blocks[0];
      let route = block.route;
      const sep = route.includes("?") ? "&" : "?";
      const params: string[] = [];
      if (guruId) params.push(`guruId=${encodeURIComponent(guruId)}`);
      params.push(`intensity=${intensity}`);

      // Pass full block context to the Guide so the AI auto-greets with the
      // actual teaching instead of an empty "what would you like to do?".
      const ctxParts = [
        `SESSION_THEME: ${plan.sessionTheme.title}${plan.sessionTheme.micro ? ` — ${plan.sessionTheme.micro}` : ""}`,
        `BLOCK: ${block.label} (${block.practice}, ~${Math.round(block.durationSec / 60)}m)`,
        block.intro ? `TEACHING: ${block.intro}` : "",
        plan.why ? `WHY THIS NOW: ${plan.why}` : "",
        plan.observationTail ? `OBSERVATION TAIL: ${plan.observationTail}` : "",
        `Your role: open this session by warmly delivering the TEACHING in 1–2 short sentences, then guide the user step-by-step through the practice. Do not ask "what would you like to do" — you already know. Move one step at a time.`,
      ].filter(Boolean).join("\n");
      params.push(`aiContext=${encodeURIComponent(ctxParts)}`);

      route = `${route}${sep}${params.join("&")}`;
      navigate(route, { state: { sutraBlock: block, plan, intensity } });
      return;
    }
    startSpiral(plan, guruId ?? null);
  };


  // Begin always goes straight into the session — no Arrival check-in.
  // Composer will infer arrival state from recent context.
  const beginBlock = (_block: SessionBlock) => {
    try { composeArrival.mutate({ force: true }); } catch {}
    proceedAfterArrival();
  };

  const beginAll = () => {
    if (!plan?.blocks?.length) return;
    try { composeArrival.mutate({ force: true }); } catch {}
    proceedAfterArrival();
  };

  const handleArrivalComplete = (arrival: ArrivalState) => {
    // Fire-and-forget: log + recompose with state-skill matrix overrides.
    // Also nudge today's theme to evolve toward the user's arrival state.
    try {
      logArrival.mutate({ ...arrival, time_slot: detectTimeSlot() });
      composeArrival.mutate({ force: true, arrival });
      // Async theme refresh — non-blocking, swallow errors.
      import("@/lib/supabase").then(({ supabase }) => {
        supabase.functions.invoke("evolve-theme", {
          body: { trigger: "arrival", arrival },
        }).catch(() => {});
      }).catch(() => {});
    } catch {}
    setShowArrival(false);
    proceedAfterArrival();
  };

  const handleArrivalSkip = () => {
    // User skipped — composer will infer arrival state from recent context.
    try {
      composeArrival.mutate({ force: true });
    } catch {}
    setShowArrival(false);
    proceedAfterArrival();
  };

  const handleSkip = () => {
    if (plan?.blocks?.[0]?.practice) {
      submitFeedback({ practice: plan.blocks[0].practice, kind: "skip" });
    }
    onSkip?.();
  };

  const handleSurprise = () => {
    if (plan?.blocks?.[0]?.practice) {
      submitFeedback({ practice: plan.blocks[0].practice, kind: "skip" });
    }
    onSurprise?.();
  };

  const whyText =
    plan?.why?.trim() ||
    plan?.sessionTheme.micro?.trim() ||
    plan?.blocks?.[0]?.intro?.trim() ||
    plan?.observationTail?.trim() ||
    "This session is the most aligned next step for where you are right now.";

  return createPortal(
    <AnimatePresence>
      {open && plan && (
        <motion.div
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-xl flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="w-full max-w-md"
          >
            {/* step indicator removed — single reveal screen.
                Future: per-practice duration & depth live in Settings → Practice preferences. */}

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: What to expect */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] mb-4">
                      <Sparkles className="w-3 h-3" />
                      <span>What to expect</span>
                    </div>
                    <h1 className="text-2xl font-light text-foreground mb-2">
                      {plan.sessionTheme.title}
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed px-3">
                      A short, guided practice tuned to where you are right now. No experience needed — just curiosity.
                    </p>
                  </div>

                  {/* expectation chips */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-foreground/90">
                      <Clock className="w-3 h-3 text-primary" />
                      {fmtMin(plan.totalDurationSec)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-foreground/90">
                      <Layers className="w-3 h-3 text-primary" />
                      {plan.blocks.length === 1 ? "1 step" : `${plan.blocks.length} steps`}
                    </span>
                    {plan.blocks.slice(0, 3).map((b, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
                        {b.surface || b.label}
                      </span>
                    ))}
                  </div>

                  {/* intensity */}
                  <div className="mb-6">
                    <div className="text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 mb-3">
                      Choose your depth
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {INTENSITY_OPTS.map((o) => {
                        const Icon = o.icon;
                        const active = intensity === o.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setIntensity(o.id)}
                            className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border transition ${
                              active
                                ? "bg-primary/15 border-primary/60 text-foreground"
                                : "bg-card border-border text-muted-foreground hover:bg-primary/5 hover:border-primary/30"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                            <span className="text-sm font-display">{o.label}</span>
                            <span className="text-[9px] uppercase tracking-[0.15em] opacity-70">{o.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* next */}
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* theme */}
                  <div className="text-center mb-7">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] mb-4">
                      <Sparkles className="w-3 h-3" />
                      <span>This session · {INTENSITY_OPTS.find((o) => o.id === intensity)?.label}</span>
                    </div>
                    <h1 className="text-3xl font-light text-foreground mb-2">
                      {plan.sessionTheme.title}
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed px-3">
                      {plan.sessionTheme.micro}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-2 italic">
                      Show up exactly as you are. There's no "perfect" way to practice.
                    </p>
                  </div>

                  {/* What to expect — opens the rich ThemeReasoning modal.
                      Hidden for Foundation / pre-journey sessions (76-session
                      literacy course): the agenda + steps below already say
                      everything; the Elder reasoning isn't relevant there. */}
                  {!hideExpect && (
                    <div className="mb-5 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            window.dispatchEvent(new CustomEvent("home:open-reasoning"));
                          } catch {}
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] uppercase tracking-[0.18em] hover:bg-primary/15 transition"
                      >
                        <Sparkles className="w-3 h-3" />
                        What to expect
                      </button>
                    </div>
                  )}

                  {/* blocks */}
                  <div className="space-y-2 mb-5">
                    {plan.blocks.map((b, i) => (
                      <div
                        key={`${b.modeId}-${i}`}
                        className="w-full text-left p-4 rounded-2xl bg-card border border-border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {plan.blocks.length > 1 ? `Step ${i + 1}` : b.surface}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70">·</span>
                            <span className="text-[10px] text-muted-foreground">{fmtMin(b.durationSec)}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-foreground">{b.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{b.intro}</div>
                        {b.intro && (
                          <p className="text-[11px] text-primary/70 mt-1.5 italic">
                            Tip: Stay with whatever arises. Even distraction is data.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* observation tail */}
                  <div className="text-center text-[11px] italic text-muted-foreground/80 mb-5 px-2">
                    {plan.observationTail}
                  </div>

                  {/* primary action */}
                  <button
                    type="button"
                    onClick={beginAll}
                    className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition"
                  >
                    {plan.blocks.length > 1 ? `Begin · ${fmtMin(plan.totalDurationSec)} total` : "Begin"}
                  </button>
                  <p className="text-[10px] text-muted-foreground/60 text-center mt-2.5">
                    You can always pause or end early. This is your practice, not a performance.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
      {showArrival && (
        <motion.div
          key="arrival-gate"
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrivalRitual onComplete={handleArrivalComplete} onSkip={handleArrivalSkip} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
