/**
 * composeSittingPlan — compiles a First-Eleven sitting into the app's
 * canonical SessionPlan so it runs as a normal sitting (Gate 2 → normal flow).
 * ─────────────────────────────────
 * The eleven sittings are content; the Universal Session Shell is the
 * runtime. This is the seam:
 *
 *   teaching            → wisdom-read
 *   question (choice)   → reflection  (option chips, payload carries the option)
 *   question (scale)    → reflection  (5 chips, band interpolated in params)
 *   question (text)     → journal
 *   silence             → witness
 *   breath              → breathwork
 *   act (vow)           → micro-act
 *
 * Every question step carries its bank identity in params.fe*, so
 * SittingRecorder can turn the shell's step payloads back into mapping
 * answers without guessing.
 */
import type { SessionPlan, SessionStep } from "@/lib/session-shell/types";
import type { PlannedStep, SESession } from "./firstElevenTypes";

const SCALE_LABELS = ["1", "2", "3", "4", "5"];

/** The per-step metadata the recorder reads back from params. */
export interface SittingStepParams {
  /** bank question id ("" for non-question beats) */
  feQuestionId: string;
  feSessionId: string;
  feDimension?: "thought" | "emotion" | "body" | "awareness";
  feLoops?: string[];
  feBand?: number;          // known upfront (choice / act)
  feLowBand?: number;       // scale
  feHighBand?: number;
  options?: { id: string; label: string }[]; // choice chips
  durationSeconds?: number; // witness / breathwork
  vowLabel?: string;        // micro-act
  speakInto?: string;       // witness one-liner
  quote?: { text: string; source: string };
  master?: string;          // wisdom-read attribution
}

export function composeSittingPlan(args: {
  session: SESession;
  plannedSteps: PlannedStep[];
  intentExtra?: string;
}): SessionPlan {
  const { session, plannedSteps, intentExtra } = args;

  const steps: SessionStep[] = plannedSteps.map((step) => {
    const base: SessionStep = {
      kind: "wisdom-read",
      title: "",
      est_minutes: 1,
    };

    switch (step.kind) {
      case "teaching": {
        base.kind = "wisdom-read";
        base.title = step.title;
        base.prompt = [step.body, step.quote ? `"${step.quote.text}" — ${step.quote.source}` : ""]
          .filter(Boolean)
          .join("\n\n");
        base.params = {
          master: step.master ?? null,
          quote: step.quote ?? null,
          ...feBase(session.id, ""),
        } satisfies SittingStepParams as unknown as Record<string, unknown>;
        break;
      }

      case "question": {
        const q = step.question;
        base.title = q.title;
        base.prompt = q.subtitle;
        const fe = feBase(session.id, q.id);

        if (q.kind === "choice") {
          base.kind = "reflection";
          base.est_minutes = 1;
          // Dimension/loops live per-option for choice questions — the
          // recorder reads them from feOptionLoops / feOptionBands.
          base.params = {
            ...fe,
            options: q.options.map((o) => ({ id: o.id, label: o.label })),
          } satisfies SittingStepParams as unknown as Record<string, unknown>;
          (base.params as Record<string, unknown>).feOptionBands = Object.fromEntries(
            q.options.map((o) => [o.id, o.band])
          );
          (base.params as Record<string, unknown>).feOptionLoops = Object.fromEntries(
            q.options.map((o) => [o.id, o.loops ?? []])
          );
        } else if (q.kind === "scale") {
          base.kind = "reflection";
          base.est_minutes = 1;
          base.params = {
            ...fe,
            options: SCALE_LABELS.map((s) => ({ id: s, label: s })),
            feDimension: q.dimension,
            feLoops: q.loops ?? [],
            feLowBand: q.lowBand,
            feHighBand: q.highBand,
          } satisfies SittingStepParams as unknown as Record<string, unknown>;
          base.prompt = [q.title, q.subtitle, `${q.minLabel} → ${q.maxLabel}`]
            .filter(Boolean)
            .join(" · ");
        } else {
          base.kind = "journal";
          base.est_minutes = 2;
          base.params = {
            ...fe,
            feDimension: q.dimension,
            feLoops: q.loops ?? [],
            feBand: q.bandHint,
          } satisfies SittingStepParams as unknown as Record<string, unknown>;
          base.prompt = [q.title, q.subtitle].filter(Boolean).join(" ");
        }
        break;
      }

      case "silence": {
        base.kind = "witness";
        base.title = "The silence";
        base.prompt = step.prompt;
        base.est_minutes = Math.max(1, Math.round(step.seconds / 60));
        base.params = {
          ...feBase(session.id, ""),
          durationSeconds: step.seconds,
          speakInto: step.speakInto ?? null,
        } satisfies SittingStepParams as unknown as Record<string, unknown>;
        break;
      }

      case "breath": {
        base.kind = "breathwork";
        base.title = "The breath";
        const phases = step.pattern.split("·").map((p) => parseInt(p.trim(), 10)).filter((n) => !Number.isNaN(n));
        const cycle = phases.reduce((a, b) => a + b, 0) || 12;
        base.prompt = `${step.pattern} · ${step.rounds} rounds — ${step.note}`;
        base.est_minutes = Math.max(1, Math.round((cycle * step.rounds) / 60));
        base.params = {
          ...feBase(session.id, ""),
          durationSeconds: cycle * step.rounds,
        } satisfies SittingStepParams as unknown as Record<string, unknown>;
        break;
      }

      case "act": {
        base.kind = "micro-act";
        base.title = step.title;
        base.prompt = step.body;
        base.est_minutes = 1;
        base.params = {
          ...feBase(session.id, ""),
          vowLabel: step.vowLabel,
          feBand: 8,
          feDimension: "awareness",
        } satisfies SittingStepParams as unknown as Record<string, unknown>;
        break;
      }
    }

    return base;
  });

  return {
    id: `sitting-${session.n}`,
    intent: `The Eleven · Sitting ${session.n} — ${session.title}${intentExtra ? ` · ${intentExtra}` : ""}`,
    intro: session.purpose,
    steps,
    _meta: {
      composedBy: "first-eleven",
      whyThisSession: `${session.title} — ${session.essence}`,
      toneWords: [session.master],
    },
  };
}

function feBase(sessionId: string, questionId: string) {
  return { feQuestionId: questionId, feSessionId: sessionId };
}

export const SITTING_SCALE_LABELS = SCALE_LABELS;
