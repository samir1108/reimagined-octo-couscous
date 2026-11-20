/**
 * Resolves the interactive widget that completes a session step.
 *
 * Priority:
 *   1. `step.params.widgetId` — the composer named a catalog widget explicitly.
 *   2. Kind default — every step kind that has no bespoke renderer maps to a
 *      catalog practice (body scan, gratitude, mantra, movement, ...).
 *   3. Practice family default — `practice` steps resolve by their
 *      (family × level) cell, e.g. `bhakti` → japa, `tantra` → chakra scan.
 *
 * Steps that already run a bespoke widget (breath orb, witness timer, journal,
 * micro-act, reading, chat) return null so GuidedFlowShell keeps its existing
 * path.
 */

import { getStepWidget } from "./widgets/catalog";
import type { StepWidgetDefinition } from "./widgets/types";
import type { SessionStep, StepKind } from "./types";

export type StepWidgetSource = "explicit" | "kind" | "family";

export interface ResolvedStepWidget {
  definition: StepWidgetDefinition;
  /** Step-driven config merged over the catalog defaults. */
  overrides: Record<string, unknown>;
  source: StepWidgetSource;
}

/** Kinds whose current renderer is a non-interactive card — give them a widget. */
const KIND_DEFAULT_WIDGET: Partial<Record<StepKind, string>> = {
  silent_sit: "just_sitting",
  body_scan: "body_scan_full",
  gratitude: "gratitude_three",
  loving_kindness: "metta_self",
  forgiveness: "forgiveness_self",
  movement: "gentle_stretch",
  walking: "walking_meditation",
  yoga_asana: "sun_salutation",
  stretching: "gentle_stretch",
  tai_chi: "tai_chi_flow",
  balance: "balance_tree",
  sound_bath: "sound_bath_10",
  mantra: "japa_108",
  affirmation: "affirmation_loop",
  visualization: "inner_imagery",
  scripture: "scripture_lectio",
  contemplation: "contemplation_sit",
  noticing: "mental_noting",
  free_write: "free_page",
  plan: "daily_plan",
};

/** Practice families emitted by the composer → catalog widget. */
const FAMILY_DEFAULT_WIDGET: Record<string, string> = {
  observation: "open_awareness",
  witnessing: "witness_count",
  breath_awareness: "coherent_breath",
  body_awareness: "body_scan_full",
  bhakti: "japa_108",
  karma: "connection_call",
  jnana: "neti_neti",
  raja: "just_sitting",
  kriya: "kapalbhati",
  tantra: "chakra_scan",
  // The deterministic ingredient bank names its families differently. These
  // aliases are what stop every local practice step from falling through to
  // the generic witness timer.
  breath: "coherent_breath",
  body: "body_scan_full",
  witness: "witness_count",
  inquiry: "neti_neti",
  self_inquiry: "neti_neti",
  mantra: "japa_108",
  devotion: "japa_108",
  loving_kindness: "metta_self",
  gratitude: "gratitude_three",
  contemplation: "contemplation_sit",
  selfless_action: "connection_call",
  movement: "gentle_stretch",
  walking: "walking_meditation",
  trataka: "open_awareness",
  kapalbhati: "bellows_breath",
};

/** "Breath Awareness" / "self-inquiry" → "breath_awareness" / "self_inquiry". */
function familyKey(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const COPY_KEYS = [
  "pattern",
  "prompts",
  "questions",
  "question",
  "items",
  "minSelections",
  "mantra",
  "phrase",
  "targetCount",
  "phases",
  "script",
  "background",
  "placeholder",
  "minChars",
  "guidedQuestions",
  "tone",
  "focus",
  "categories",
  "intervalSeconds",
  "mode",
  "showOrb",
  "showTimer",
  "showPhaseText",
  "autoStart",
] as const;

function stepDurationSeconds(step: SessionStep): number {
  const params = (step.params ?? {}) as Record<string, unknown>;
  const explicit =
    Number(params.durationSeconds) || Number(step.durationSeconds) || 0;
  if (explicit > 0) return explicit;
  return Math.max(60, Math.round((Number(step.est_minutes) || 1) * 60));
}

function buildOverrides(
  step: SessionStep,
  definition: StepWidgetDefinition,
): Record<string, unknown> {
  const params = (step.params ?? {}) as Record<string, unknown>;
  const overrides: Record<string, unknown> = {
    ...((params.config as Record<string, unknown> | undefined) ?? {}),
    durationSeconds: stepDurationSeconds(step),
  };

  for (const key of COPY_KEYS) {
    const value = params[key];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    overrides[key] = value;
  }

  // `exercise` is the composer's instruction for a practice cell.
  if (typeof params.exercise === "string" && params.exercise.trim()) {
    overrides.prompt = params.exercise.trim();
  }

  // Step content wins over catalog copy where the engine displays text.
  const passage =
    typeof params.passage === "string" ? params.passage : step.prompt || "";
  if (step.kind === "scripture" && passage.trim()) {
    overrides.prompt = passage.trim();
  }

  if (overrides.script === undefined) {
    const scenes = Array.isArray(params.scenes)
      ? (params.scenes as unknown[]).filter((scene): scene is string => typeof scene === "string")
      : [];
    if (scenes.length) {
      const slice = Math.max(1, Math.round(stepDurationSeconds(step) / scenes.length));
      overrides.script = scenes.map((text) => ({ text, durationSeconds: slice }));
    }
  }

  if (definition.engine === "jap" && overrides.mantra === undefined) {
    const phrase = params.mantra || params.phrase || params.text;
    overrides.mantra =
      typeof phrase === "string" && phrase.trim() ? phrase.trim() : step.title;
  }

  if (definition.engine === "inquiry" && overrides.question === undefined) {
    overrides.question = params.exercise || step.prompt || step.title;
  }

  if (definition.engine === "writing" && overrides.prompts === undefined) {
    const prompts = Array.isArray(params.questions)
      ? (params.questions as unknown[]).map(String)
      : (step.script ?? []).slice(0, 3);
    if (prompts.length) overrides.prompts = prompts;
  }

  if (definition.engine === "reflection" && overrides.guidedQuestions === undefined) {
    const questions = Array.isArray(params.questions)
      ? (params.questions as unknown[]).map(String)
      : (step.script ?? []).slice(0, 3);
    if (questions.length) overrides.guidedQuestions = questions;
  }

  return overrides;
}

export function resolveStepWidget(step: SessionStep): ResolvedStepWidget | null {
  // Conversational steps always run inside the Guide chat surface.
  if (step.kind === "guide-chat" || step.kind === "temple-chat") return null;

  const params = (step.params ?? {}) as Record<string, unknown>;

  const explicitId = typeof params.widgetId === "string" ? params.widgetId : null;
  if (explicitId) {
    const named = getStepWidget(explicitId);
    if (named) {
      return { definition: named, overrides: buildOverrides(step, named), source: "explicit" };
    }
  }

  const kindId = KIND_DEFAULT_WIDGET[step.kind];
  if (kindId) {
    const definition = getStepWidget(kindId);
    if (definition) {
      return { definition, overrides: buildOverrides(step, definition), source: "kind" };
    }
  }

  if (step.kind === "practice") {
    const family = familyKey(params.family);
    const familyId = FAMILY_DEFAULT_WIDGET[family];
    if (familyId) {
      const definition = getStepWidget(familyId);
      if (definition) {
        return { definition, overrides: buildOverrides(step, definition), source: "family" };
      }
    }
  }

  return null;
}
