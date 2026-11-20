/**
 * StepFrame — cinematic wrapper for every non-Temple session step.
 * Provides:
 *   - kind-aware animated aurora backdrop
 *   - soft ambient soundscape (WebAudio, mutable)
 *   - eyebrow chip + big serif title + prompt
 *   - glass content card + polished CTA row
 *   - "why for you" whisper line
 * Presentational only. All step logic stays in the individual step files.
 */
import { ReactNode } from "react";
import { Button } from "@/design-system";
import { Volume2, VolumeX } from "lucide-react";
import {
  useOptionalSessionShell,
} from "@/lib/session-shell/SessionShellContext";
import { useStepAmbient } from "./useStepAmbient";
import { StepGuidance } from "./StepGuidance";
import type { StepGuidance as StepGuidanceModel, StepKind } from "@/lib/session-shell/types";

const KIND_META: Record<StepKind, { eyebrow: string; tint: string; accent: string }> = {
  "wisdom-read": { eyebrow: "Wisdom",       tint: "from-amber-500/25 via-orange-400/10 to-transparent", accent: "bg-amber-300/70" },
  breathwork:    { eyebrow: "Breath",       tint: "from-sky-500/25 via-cyan-400/10 to-transparent",     accent: "bg-sky-300/70" },
  journal:       { eyebrow: "Journal",      tint: "from-emerald-500/20 via-teal-400/10 to-transparent", accent: "bg-emerald-300/70" },
  "micro-act":   { eyebrow: "Micro-act",    tint: "from-rose-500/25 via-orange-400/10 to-transparent",  accent: "bg-rose-300/70" },
  reflection:    { eyebrow: "Reflection",   tint: "from-violet-500/25 via-indigo-400/10 to-transparent",accent: "bg-violet-300/70" },
  "guide-chat":  { eyebrow: "Guide",        tint: "from-indigo-500/25 via-purple-400/10 to-transparent",accent: "bg-indigo-300/70" },
  practice:      { eyebrow: "Practice",     tint: "from-fuchsia-500/25 via-rose-400/10 to-transparent", accent: "bg-fuchsia-300/70" },
  "temple-chat": { eyebrow: "Temple",       tint: "from-amber-600/25 via-yellow-500/10 to-transparent", accent: "bg-amber-300/70" },
  witness:       { eyebrow: "Witness",      tint: "from-slate-400/20 via-slate-600/10 to-transparent", accent: "bg-slate-200/70" },
  silent_sit:    { eyebrow: "Silence",      tint: "from-slate-300/15 via-slate-500/10 to-transparent", accent: "bg-slate-300/70" },
  body_scan:     { eyebrow: "Body Scan",    tint: "from-teal-500/20 via-emerald-400/10 to-transparent", accent: "bg-teal-300/70" },
  gratitude:     { eyebrow: "Gratitude",    tint: "from-pink-500/20 via-rose-400/10 to-transparent",   accent: "bg-pink-300/70" },
  loving_kindness:{ eyebrow: "Loving Kindness", tint: "from-rose-400/20 via-pink-300/10 to-transparent", accent: "bg-rose-200/70" },
  forgiveness:   { eyebrow: "Forgiveness",  tint: "from-sky-400/20 via-indigo-300/10 to-transparent",  accent: "bg-sky-200/70" },
  movement:      { eyebrow: "Movement",     tint: "from-orange-500/20 via-amber-400/10 to-transparent", accent: "bg-orange-300/70" },
  walking:       { eyebrow: "Walking",      tint: "from-green-500/20 via-emerald-400/10 to-transparent",accent: "bg-green-300/70" },
  yoga_asana:    { eyebrow: "Yoga Asana",   tint: "from-orange-600/25 via-red-400/10 to-transparent",  accent: "bg-orange-300/70" },
  sound_bath:    { eyebrow: "Sound Bath",   tint: "from-violet-400/20 via-indigo-300/10 to-transparent",accent: "bg-violet-200/70" },
  mantra:        { eyebrow: "Mantra",       tint: "from-purple-500/20 via-violet-400/10 to-transparent",accent: "bg-purple-300/70" },
  visualization: { eyebrow: "Visualization", tint: "from-cyan-400/20 via-blue-300/10 to-transparent",   accent: "bg-cyan-200/70" },
  scripture:     { eyebrow: "Wisdom",       tint: "from-amber-400/20 via-yellow-300/10 to-transparent",accent: "bg-amber-200/70" },
  affirmation:   { eyebrow: "Affirmation",  tint: "from-yellow-400/20 via-amber-300/10 to-transparent",accent: "bg-yellow-200/70" },
  contemplation: { eyebrow: "Contemplation",tint: "from-indigo-400/20 via-slate-300/10 to-transparent", accent: "bg-indigo-200/70" },
  noticing:      { eyebrow: "Noticing",     tint: "from-gray-400/20 via-slate-300/10 to-transparent",  accent: "bg-gray-200/70" },
  stretching:    { eyebrow: "Stretching",   tint: "from-lime-500/20 via-green-400/10 to-transparent",  accent: "bg-lime-300/70" },
  tai_chi:       { eyebrow: "Tai Chi",      tint: "from-emerald-500/20 via-teal-300/10 to-transparent",accent: "bg-emerald-200/70" },
  balance:       { eyebrow: "Balance",      tint: "from-cyan-500/20 via-sky-300/10 to-transparent",    accent: "bg-cyan-300/70" },
  "free_write":  { eyebrow: "Free Write",   tint: "from-sky-400/20 via-indigo-300/10 to-transparent",  accent: "bg-sky-200/70" },
  plan:          { eyebrow: "Plan",         tint: "from-emerald-400/20 via-teal-300/10 to-transparent",accent: "bg-emerald-200/70" },
};

interface Props {
  kind: StepKind;
  title: string;
  prompt?: string;
  whyForYou?: string;
  optional?: boolean;
  /** Override deep guidance; defaults to the current step's guidance. */
  guidance?: StepGuidanceModel;
  onSkip?: () => void;
  ctas: ReactNode;
  children?: ReactNode;
  /** Suppress the internal skip button (steps that render their own toolbar). */
  hideSkip?: boolean;
}

export function StepFrame({
  kind,
  title,
  prompt,
  whyForYou,
  optional,
  guidance,
  onSkip,
  ctas,
  children,
  hideSkip,
}: Props) {
  const meta = KIND_META[kind];
  const { muted, toggleMuted } = useStepAmbient(kind);
  const shell = useOptionalSessionShell();
  // Steps do not need to forward guidance themselves — pick it up from the
  // current step so deep guidance works for every kind automatically.
  const activeGuidance = guidance ?? shell?.currentStep?.guidance;

  return (
    <div className="relative mx-auto w-full max-w-2xl px-6 pb-10 lg:max-w-3xl xl:max-w-4xl">
      {/* Aurora backdrop for this step kind */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-1/3 left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full bg-gradient-to-br ${meta.tint} blur-3xl opacity-70 animate-[stepAurora_18s_ease-in-out_infinite]`} />
        <div className={`absolute bottom-[-30%] right-[-10%] h-[55vmax] w-[55vmax] rounded-full bg-gradient-to-tr ${meta.tint} blur-3xl opacity-40 animate-[stepAurora_24s_ease-in-out_infinite_reverse]`} />
      </div>

      {/* Eyebrow */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.accent} animate-pulse`} />
          {meta.eyebrow}
        </div>
        <button
          onClick={toggleMuted}
          aria-label={muted ? "Unmute ambient sound" : "Mute ambient sound"}
          className="rounded-full border border-border/40 bg-background/40 p-1.5 text-muted-foreground backdrop-blur transition hover:text-foreground"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Title + prompt */}
      <h2 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {prompt && (
        <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
          {prompt}
        </p>
      )}
      {whyForYou && (
        <p className="mt-2 text-xs italic text-foreground/60">— {whyForYou}</p>
      )}

      {activeGuidance && <StepGuidance guidance={activeGuidance} />}

      {/* Body */}
      <div className="mt-8 rounded-3xl border border-border/40 bg-card/80 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
        {children}
      </div>

      {/* CTAs */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {optional && !hideSkip ? (
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
            Skip
          </Button>
        ) : <span />}
        <div className="flex items-center gap-2">{ctas}</div>
      </div>

      <style>{`
        @keyframes stepAurora {
          0%,100% { transform: translate(-50%, 0) scale(1); }
          50%     { transform: translate(-48%, 4%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
