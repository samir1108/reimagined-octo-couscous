/**
 * ArrivalRitual — Pre-session State-Skill Matrix capture.
 *
 * Three swift inputs (body / mind / intention) re-balance the 30/50/20 mix
 * before the practice is composed. This is the bidirectional layer that
 * turns the app from a "broadcast" into a "conversation".
 *
 * UX notes:
 *  - Satyayuga aesthetic: dark, breathing orb, primary/accent gradients.
 *  - One screen, three stacked steps. Auto-advances on tap.
 *  - "Skip — let AI sense" path always available (defaults to ai_decide).
 *  - Animates in over the orb so it feels like a natural arrival, not a form.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import type { ArrivalState } from "@/hooks/useTodayPractice";

interface ArrivalRitualProps {
  onComplete: (arrival: ArrivalState) => void;
  /** Called when user skips — composer will infer state from recent context. */
  onSkip: () => void;
}

type Step = "body" | "mind" | "intention";

const BODY_OPTIONS: Array<{ value: ArrivalState["body_state"]; label: string; hint: string }> = [
  { value: "tight", label: "Tight", hint: "holding, contracted" },
  { value: "neutral", label: "Neutral", hint: "neither here nor there" },
  { value: "open", label: "Open", hint: "spacious, available" },
  { value: "heavy", label: "Heavy", hint: "weighted, slow" },
];

const MIND_OPTIONS: Array<{ value: ArrivalState["mind_state"]; label: string; hint: string }> = [
  { value: "racing", label: "Racing", hint: "thoughts moving fast" },
  { value: "foggy", label: "Foggy", hint: "unclear, dull" },
  { value: "calm", label: "Calm", hint: "steady, quiet" },
  { value: "scattered", label: "Scattered", hint: "pulled in directions" },
];

const INTENTION_OPTIONS: Array<{ value: ArrivalState["intention"]; label: string; hint: string }> = [
  { value: "ground", label: "Ground", hint: "land in the body" },
  { value: "clarity", label: "Clarity", hint: "see what's true" },
  { value: "release", label: "Release", hint: "let something move" },
  { value: "energy", label: "Energy", hint: "wake up, activate" },
  { value: "ai_decide", label: "Let AI sense", hint: "you choose for me" },
];

export default function ArrivalRitual({ onComplete, onSkip }: ArrivalRitualProps) {
  const [step, setStep] = useState<Step>("body");
  const [body, setBody] = useState<ArrivalState["body_state"] | null>(null);
  const [mind, setMind] = useState<ArrivalState["mind_state"] | null>(null);

  const handleBody = (v: ArrivalState["body_state"]) => {
    setBody(v);
    setTimeout(() => setStep("mind"), 220);
  };
  const handleMind = (v: ArrivalState["mind_state"]) => {
    setMind(v);
    setTimeout(() => setStep("intention"), 220);
  };
  const handleIntention = (v: ArrivalState["intention"]) => {
    if (!body || !mind) return;
    onComplete({ body_state: body, mind_state: mind, intention: v });
  };

  const stepIndex = step === "body" ? 0 : step === "mind" ? 1 : 2;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col bg-background overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cosmic backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.04]" />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.18), transparent 65%)",
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Breathing orb */}
      <div className="relative z-10 mx-auto w-full max-w-2xl flex flex-col items-center pt-10 pb-2 px-6">
        <motion.div
          className="relative w-20 h-20 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary) / 0.55), hsl(var(--accent) / 0.25) 60%, transparent 75%)",
            boxShadow:
              "0 0 60px -10px hsl(var(--primary) / 0.5), 0 0 120px -20px hsl(var(--accent) / 0.4)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="mt-6 text-muted-foreground/70 text-[10px] font-display tracking-[0.35em] uppercase">
          Aaj Ka Halchal · Arrival
        </p>
        <h1 className="mt-1 text-foreground text-xl md:text-2xl font-display text-center">
          {step === "body" && "Pause. How is the body right now?"}
          {step === "mind" && "And the mind?"}
          {step === "intention" && "What does today need?"}
        </h1>
        <p className="mt-1 text-[11px] text-muted-foreground/70 text-center max-w-xs">
          {step === "body" && "There's no right answer. Just notice what's true for you in this moment."}
          {step === "mind" && "Notice the quality of your thoughts — not the content."}
          {step === "intention" && "Choose the direction that feels most needed right now."}
        </p>

        {/* Step rail */}
        <div className="mt-5 flex items-center gap-1.5 w-32">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={[
                "h-0.5 flex-1 rounded-full transition-all duration-500",
                i < stepIndex
                  ? "bg-primary/80"
                  : i === stepIndex
                    ? "bg-gradient-to-r from-primary to-accent"
                    : "bg-border/40",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="relative z-10 flex-1 mx-auto w-full max-w-2xl flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          {step === "body" && (
            <motion.div
              key="body"
              className="w-full max-w-md grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {BODY_OPTIONS.map((o) => (
                <OptionTile
                  key={o.value}
                  label={o.label}
                  hint={o.hint}
                  selected={body === o.value}
                  onClick={() => handleBody(o.value)}
                />
              ))}
            </motion.div>
          )}

          {step === "mind" && (
            <motion.div
              key="mind"
              className="w-full max-w-md grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {MIND_OPTIONS.map((o) => (
                <OptionTile
                  key={o.value}
                  label={o.label}
                  hint={o.hint}
                  selected={mind === o.value}
                  onClick={() => handleMind(o.value)}
                />
              ))}
            </motion.div>
          )}

          {step === "intention" && (
            <motion.div
              key="intention"
              className="w-full max-w-md flex flex-col gap-2.5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {INTENTION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => handleIntention(o.value)}
                  className="group w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-card/50 backdrop-blur-md border border-border/40 hover:border-primary/50 hover:bg-card/70 transition-all text-left"
                >
                  <div>
                    <p className="text-foreground text-sm font-display">{o.label}</p>
                    <p className="text-muted-foreground/70 text-[11px] font-body mt-0.5">{o.hint}</p>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip — gentle escape hatch (AI infers from recent sessions + time) */}
        <button
          onClick={onSkip}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-card/40 backdrop-blur-md text-muted-foreground hover:text-foreground hover:border-primary/40 text-[11px] font-display tracking-[0.18em] uppercase transition-colors"
        >
          <Wand2 className="w-3 h-3" />
          Skip · Let AI sense for me
        </button>
        <p className="text-[10px] text-muted-foreground/60 mt-2">
          No need to overthink it. The AI can read your recent patterns if you'd rather jump in.
        </p>
      </div>
    </motion.div>
  );
}

function OptionTile({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={[
        "px-4 py-5 rounded-2xl backdrop-blur-md border text-center transition-all",
        selected
          ? "bg-primary/15 border-primary/60 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)]"
          : "bg-card/50 border-border/40 hover:border-primary/40 hover:bg-card/70",
      ].join(" ")}
    >
      <p className="text-foreground text-sm font-display">{label}</p>
      <p className="text-muted-foreground/70 text-[11px] font-body mt-1">{hint}</p>
    </motion.button>
  );
}
