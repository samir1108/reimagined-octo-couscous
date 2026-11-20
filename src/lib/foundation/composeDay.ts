import { checkBypassingRisk } from "@/lib/shared/vLevel";
import type { SessionPlan, SessionStep } from "@/lib/session-shell/types";
import { getFoundationDayMeta } from "./curriculum";
import { DEPTH_PROFILES, depthFromBand, safeDepth, type DepthProfile } from "./depth";
import { ADAPTIVE_PATHS, resolveAdaptivePath } from "./paths";
import { DEFAULT_TUNING, normalizeTuning, type FoundationTuning } from "./tuning";
import type {
  AdaptivePath,
  FoundationComponent,
  FoundationDayInput,
  FoundationDayPlan,
  FoundationDepth,
  FoundationExploration,
} from "./types";
import { buildComponents } from "./variants";

const STEP_KIND: Record<FoundationComponent["kind"], SessionStep["kind"]> = {
  wisdom: "wisdom-read",
  guided: "practice",
  observation: "noticing",
  inquiry: "reflection",
  mission: "micro-act",
  night: "journal",
  integration: "plan",
};

const TONE_LINE: Record<FoundationTuning["tone"], string> = {
  plain: "Say it plainly. No tradition words unless defined.",
  warm: "Speak like a person sitting beside them, not above them.",
  philosophical: "Allow precision and paradox; do not resolve them too early.",
};

function paceShift(pace: FoundationTuning["pace"]): number {
  if (pace === "gentle") return -1;
  if (pace === "deep") return 1;
  return 0;
}

function clampDepth(depth: number): FoundationDepth {
  return Math.max(0, Math.min(3, depth)) as FoundationDepth;
}

function totalMinutes(components: FoundationComponent[]): number {
  return components.reduce((sum, c) => sum + c.minutes, 0);
}

function trimToBudget(
  components: FoundationComponent[],
  budget: number,
  inquiryEnabled: boolean
): FoundationComponent[] {
  let kept = components.filter((c) => c.kind !== "inquiry" || inquiryEnabled);
  kept = kept.filter((c) => !c.optional || c.minutes === 0);

  if (totalMinutes(kept) > budget) {
    kept = kept.filter((c) => c.kind !== "inquiry");
  }

  const guided = kept.find((c) => c.kind === "guided");
  if (guided) {
    const over = totalMinutes(kept) - budget;
    if (over > 0) {
      guided.minutes = Math.max(2, guided.minutes - over);
    }
  }

  if (totalMinutes(kept) > budget) {
    const wisdom = kept.find((c) => c.kind === "wisdom");
    if (wisdom) wisdom.minutes = 1;
  }
  if (totalMinutes(kept) > budget) {
    const night = kept.find((c) => c.kind === "night");
    if (night) night.minutes = 1;
  }
  if (guided && totalMinutes(kept) > budget) {
    guided.minutes = Math.max(1, guided.minutes - (totalMinutes(kept) - budget));
  }

  for (const extra of components) {
    if (!extra.optional || extra.minutes === 0) continue;
    if (extra.kind === "inquiry" && !inquiryEnabled) continue;
    if (totalMinutes(kept) + extra.minutes <= budget) kept.push(extra);
  }

  const order: FoundationComponent["kind"][] = [
    "wisdom",
    "guided",
    "observation",
    "inquiry",
    "mission",
    "night",
    "integration",
  ];
  return kept.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}

function depthLabel(profile: DepthProfile): string {
  return `Depth ${profile.depth} · ${profile.label}`;
}

function explorationFor(
  path: AdaptivePath,
  depth: FoundationDepth,
  minutes: number
): FoundationExploration | undefined {
  if (depth < 1 || minutes < 10) return undefined;
  return ADAPTIVE_PATHS[path].exploration;
}

function toSessionPlan(
  plan: Omit<FoundationDayPlan, "sessionPlan">,
  profile: DepthProfile,
  tuning: FoundationTuning,
  bypassRisk: boolean
): SessionPlan {
  const steps: SessionStep[] = plan.components
    .filter((component) => component.kind !== "mission")
    .map((component) => ({
      kind: STEP_KIND[component.kind],
      title: component.title,
      prompt: component.prompt,
      est_minutes: component.minutes,
      durationSeconds: component.minutes > 0 ? component.minutes * 60 : undefined,
      whyForYou: `${plan.chapterTitle} · day ${plan.day} · ${profile.label}.`,
      signalRef: component.evidenceTarget,
      optional: component.optional,
    }));

  return {
    id: `foundation:${plan.day}:d${plan.depth}:${plan.path}`,
    intent: `${plan.chapterTitle} · ${plan.theme}`,
    intro: `Day ${plan.day} of 118. ${plan.concept}. ${depthLabel(profile)}.`,
    steps,
    _meta: {
      composedBy: "foundation-path-v2",
      vLevelStart: plan.vLevelValue,
      policyVersion: "foundation-v2",
      safety: bypassRisk ? "adapt" : "clear",
      whyThisSession: `${plan.outcome}. ${TONE_LINE[tuning.tone]}`,
      brainMode: "local",
      brainReason: "Deterministic foundation plan",
    },
  } as SessionPlan;
}

export function getFoundationDay(input: FoundationDayInput): FoundationDayPlan {
  const meta = getFoundationDayMeta(input.day);
  const tuning = normalizeTuning({ ...DEFAULT_TUNING, ...input.tuning });

  const stateBand = input.stateBand ?? input.vLevel.band;
  const skillBand =
    input.vLevel.band + (input.vLevel.microLevel === "mastery" ? 1 : 0);
  const bypassRisk =
    input.bypassRisk ??
    (checkBypassingRisk(skillBand, stateBand).isBypassing ||
      (input.vLevel.band >= 5 && (input.vLevel.witnessQuality ?? 1) < 0.35));

  const requested = clampDepth(depthFromBand(input.vLevel.band) + paceShift(tuning.pace));
  const depth = safeDepth(requested, { day: meta.day, bypassRisk });
  const profile = DEPTH_PROFILES[depth];

  const energyCap = input.energy === "low" ? 10 : 40;
  const requestedMinutes = input.minutesAvailable ?? tuning.minutes;
  const budget = Math.max(3, Math.min(requestedMinutes, energyCap));

  const path = input.adaptivePath ?? tuning.path ?? resolveAdaptivePath(input.pathAffinity);
  const components = trimToBudget(
    buildComponents(meta, depth, path),
    budget,
    tuning.inquiry
  );

  const plan: Omit<FoundationDayPlan, "sessionPlan"> = {
    day: meta.day,
    chapter: meta.chapter,
    chapterTitle: meta.chapterTitle,
    theme: meta.theme,
    concept: meta.concept,
    outcome: meta.outcome,
    depth,
    path,
    minutes: totalMinutes(components),
    components,
    exploration: explorationFor(path, depth, budget),
    evidenceTargets: components.map((c) => c.evidenceTarget),
    vLevelValue: input.vLevel.value,
  };

  return {
    ...plan,
    sessionPlan: toSessionPlan(plan, profile, tuning, bypassRisk),
  };
}

export type { FoundationTuning };
