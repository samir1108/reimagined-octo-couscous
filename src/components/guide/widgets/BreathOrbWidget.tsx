import { useEffect, useRef, useState } from "react";
import { Wind, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/design-system";
import HomeOrb from "@/components/orb/HomeOrb";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, BreathOrbSpec } from "./types";

type Phase = "in" | "hold" | "out" | "holdOut";

function parsePattern(raw: string): { in: number; hold: number; out: number; holdOut?: number; phases: Phase[] } {
  const p = (raw || "natural").trim().toLowerCase();
  if (p === "box") return { in: 4, hold: 4, out: 4, holdOut: 4, phases: ["in", "hold", "out", "holdOut"] };
  if (p === "4-7-8") return { in: 4, hold: 7, out: 8, phases: ["in", "hold", "out"] };
  if (p === "coherent") return { in: 5, hold: 0, out: 5, phases: ["in", "out"] };
  if (p === "4-4-6") return { in: 4, hold: 4, out: 6, phases: ["in", "hold", "out"] };
  if (p === "fire") return { in: 1, hold: 0, out: 1, phases: ["in", "out"] };
  if (p === "natural") return { in: 4, hold: 0, out: 4, phases: ["in", "out"] };

  const parts = p.split(/[-\s]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0);
  if (parts.length >= 3) {
    const [a, b, c] = parts;
    const phases: Phase[] = ["in"];
    if (b > 0) phases.push("hold");
    phases.push("out");
    if (parts.length >= 4 && parts[3] > 0) phases.push("holdOut");
    return { in: a, hold: b, out: c, holdOut: parts[3] || undefined, phases };
  }
  return { in: 4, hold: 0, out: 4, phases: ["in", "out"] };
}

const PATTERN_INFO: Record<string, { title: string; description: string; why: string }> = {
  "natural": {
    title: "Natural Breath",
    description: "Observe your natural breathing rhythm without changing it.",
    why: "Awareness of the natural breath is the foundation of all pranayama. Before changing anything, you must first know what is.",
  },
  "box": {
    title: "Box Breathing",
    description: "Inhale 4 · Hold 4 · Exhale 4 · Hold 4.",
    why: "Used by Navy SEALs, first responders, and elite performers to regulate the nervous system under pressure. The equal phases create a sense of control and calm.",
  },
  "4-7-8": {
    title: "4-7-8 Breathing",
    description: "Inhale 4 · Hold 7 · Exhale 8.",
    why: "The extended exhale activates the parasympathetic nervous system — the body's rest-and-digest mode. Dr. Andrew Weil calls it a 'natural tranquilizer for the nervous system.'",
  },
  "coherent": {
    title: "Coherent Breathing",
    description: "Inhale 5 · Exhale 5. Smooth continuous flow.",
    why: "At ~6 breaths per minute, heart rate variability synchronizes — this is the resonance frequency of the cardiovascular system. HeartMath research shows this state reduces stress and improves clarity.",
  },
  "4-4-6": {
    title: "Calming Breath",
    description: "Inhale 4 · Hold 4 · Exhale 6.",
    why: "The extended exhale (6 counts) gently stimulates the vagus nerve, shifting you from sympathetic arousal to parasympathetic calm. Ideal for settling the nervous system before rest or meditation.",
  },
  "fire": {
    title: "Breath of Fire",
    description: "Rapid, equal inhale and exhale through the nose. Belly pumps.",
    why: "Energizing pranayama that activates the solar plexus, builds internal heat, and sharpens focus. Clears mental fog and releases stored tension. Start with 1 minute, build to 10.",
  },
};

function getPatternInfo(patternKey: string, specDescription?: string, specWhy?: string) {
  const key = (patternKey || "natural").toLowerCase();
  const base = PATTERN_INFO[key] || {
    title: patternKey || "Breath Practice",
    description: `Pattern: ${patternKey || "natural"}`,
    why: "Follow the orb. Let the breath regulate your nervous system.",
  };
  return {
    title: base.title,
    description: specDescription || base.description,
    why: specWhy || base.why,
  };
}

function phaseLabel(phase: Phase, patternKey: string): string {
  if (phase === "in") return "Breathe in";
  if (phase === "out") return "Breathe out";
  if (phase === "hold" || phase === "holdOut") {
    const key = (patternKey || "").toLowerCase();
    if (key === "fire") return "Still";
    return "Hold";
  }
  return "Breathe";
}

function patternDuration(patternKey: string, phase: Phase): number {
  const p = parsePattern(patternKey);
  const dur = p[phase];
  return typeof dur === "number" ? Math.max(dur, 1) : 1;
}

export function BreathOrbWidget({ spec, onComplete, onSkip, done }: WidgetProps<BreathOrbSpec>) {
  const patternKey = spec.pattern || "natural";
  const pattern = parsePattern(patternKey);
  const info = getPatternInfo(patternKey, spec.description, spec.why);

  // durationSeconds is authoritative: derive the cycle count from it so a
  // 3-minute "calming breath" step actually lasts three minutes.
  const cycleSeconds = pattern.phases.reduce((sum, ph) => sum + patternDuration(patternKey, ph), 0);
  const durationTarget = Number(spec.duration) > 0 ? Number(spec.duration) : 0;
  const target = Math.max(
    2,
    spec.breaths ??
      (durationTarget > 0 ? Math.round(durationTarget / Math.max(4, cycleSeconds)) : 5),
  );

  const [phase, setPhase] = useState<Phase>("in");
  const [count, setCount] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done || count >= target) return;
    const dur = patternDuration(patternKey, phase);
    const t = setTimeout(() => {
      const idx = pattern.phases.indexOf(phase);
      const next = pattern.phases[(idx + 1) % pattern.phases.length];
      if (phase === "out" || next === "in") {
        setCount((c) => c + 1);
      }
      setPhase(next);
    }, dur * 1000);
    return () => clearTimeout(t);
  }, [phase, count, target, patternKey, pattern.phases, done]);

  useEffect(() => {
    if (count >= target && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "breath_orb",
        data: { breaths: target, pattern: patternKey, durationSec: Math.round(target * cycleSeconds) },
        summary: `Breath · ${target} ${patternKey} cycles · ~${Math.round((target * cycleSeconds) / 60)} min`,
      });
    }
  }, [count, target, patternKey, onComplete, done]);

  const isDone = done || count >= target;
  const label = phaseLabel(phase, patternKey);

  const orbScale = isDone ? 1 : phase === "in" ? 1.18 : phase === "out" ? 0.86 : phase === "hold" || phase === "holdOut" ? 1.08 : 1;
  const animDuration = patternDuration(patternKey, phase);

  const cycleLabel = pattern.phases
    .map((ph) => {
      const dur = patternDuration(patternKey, ph);
      return `${dur}s ${phaseLabel(ph, patternKey).toLowerCase()}`;
    })
    .join(" → ");

  const orbVisual = (size: "inline" | "immersive") => (
    <motion.div
      animate={{ scale: orbScale }}
      transition={{ duration: animDuration, ease: "easeInOut" }}
      className={`relative rounded-full ${
        size === "immersive" ? "h-80 w-80" : "h-40 w-40"
      } [mask-image:radial-gradient(circle,black_68%,transparent_86%)] [-webkit-mask-image:radial-gradient(circle,black_68%,transparent_86%)]`}
    >
      <HomeOrb className="absolute inset-0" />
    </motion.div>
  );

  return (
    <>
    <WidgetShell
      icon={<Wind className="h-3.5 w-3.5" />}
      title={spec.title || info.title}
      prompt={spec.prompt || `${target} ${patternKey} cycles`}
      done={isDone}
    >
      <div className="relative flex flex-col items-center py-6">
        {/* Pattern info */}
        {!isDone && (
          <div className="mb-4 max-w-sm text-center">
            <p className="text-sm font-medium text-foreground/90">{info.description}</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{info.why}</p>
          </div>
        )}

        {/* Orb stage */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.42), hsl(var(--primary) / 0.12) 42%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          {orbVisual("inline")}
        </div>
        <p className="mt-6 text-base font-display tracking-[0.18em] uppercase text-foreground/90">
          {isDone ? "Complete" : label}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
          {count} / {target}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/70 tracking-wide">{cycleLabel}</p>
        {durationTarget > 0 && (
          <p className="mt-0.5 text-[10px] text-muted-foreground/60 tracking-wide">
            ~{Math.max(1, Math.round((target * cycleSeconds) / 60))} min total
          </p>
        )}
        {!isDone && (
          <div className="mt-2 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImmersive(true)}
              className="text-xs text-muted-foreground"
            >
              <Maximize2 className="h-3 w-3" /> Immerse
            </Button>
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
              Skip
            </Button>
          </div>
        )}
      </div>
    </WidgetShell>

    <ImmersivePractice
      open={immersive}
      title={spec.title || info.title}
      prompt={info.description}
      onClose={() => setImmersive(false)}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.42), hsl(var(--primary) / 0.12) 42%, transparent 70%)",
              filter: "blur(32px)",
            }}
          />
          {orbVisual("immersive")}
        </div>
        <p className="text-lg text-foreground/85 font-display tracking-[0.18em] uppercase">{isDone ? "Complete" : label}</p>
        <p className="text-xs text-muted-foreground tabular-nums tracking-[0.2em]">
          {count} / {target} · {cycleLabel}
        </p>
      </div>
    </ImmersivePractice>
    </>
  );
}
