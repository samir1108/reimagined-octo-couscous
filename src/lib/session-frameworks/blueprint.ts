import type {
  FrameworkAdaptationRule,
  FrameworkCompletionCriterion,
  FrameworkOutcome,
  SessionBlueprint,
  SessionBlueprintMission,
  SessionBlueprintStage,
  SessionBlueprintTechnique,
  SessionFramework,
} from "./types";
import { SESSION_STAGES } from "./types";

const STAGE_WEIGHT: Record<string, number> = Object.fromEntries(SESSION_STAGES.map((stage) => [stage.id, stage.defaultWeight]));

const STAGE_COMPONENT: Record<string, string> = {
  arrival: "arrival",
  baseline: "check_in",
  orientation: "orientation",
  settling: "settling",
  induction: "anchor",
  core_experience: "core_practice",
  deepening: "variation",
  observation: "reflection",
  insight: "insight",
  application: "application",
  integration: "reflection",
  reflection: "reflection",
  adaptation: "closure",
};

const STAGE_INTERACTION: Record<string, string> = Object.fromEntries(SESSION_STAGES.map((stage) => [stage.id, stage.interaction]));

function roundMinutes(value: number): number {
  return Math.max(0.25, Math.round(value * 100) / 100);
}

function allocateDurations(stages: string[], totalMinutes: number): number[] {
  const weights = stages.map((stage) => STAGE_WEIGHT[stage] || 1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const raw = weights.map((weight) => (weight / totalWeight) * totalMinutes);
  const rounded = raw.map(roundMinutes);
  const difference = totalMinutes - rounded.reduce((sum, value) => sum + value, 0);
  if (rounded.length && Math.abs(difference) > 0.001) {
    rounded[rounded.length - 1] = roundMinutes(rounded[rounded.length - 1] + difference);
  }
  return rounded;
}

function stageTitle(stage: string): string {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildMission(framework: SessionFramework, durationMinutes: number): SessionBlueprintMission | undefined {
  const hasApplication = framework.stageSequence.includes("application");
  if (!hasApplication) return undefined;
  return {
    id: `${framework.id}_mission`,
    instruction: `Apply one insight from this session during ${framework.primaryGoal.toLowerCase()} in daily life today.`,
    successCriteria: "The user reports one concrete moment of application.",
    timeframe: durationMinutes <= 8 ? "today" : "this_week",
  };
}

export function buildSessionBlueprint(
  framework: SessionFramework,
  durationMinutes?: number,
  selectionReasons: string[] = [],
): SessionBlueprint {
  const totalMinutes = durationMinutes ?? framework.durationMinutes.default;
  const clampedMinutes = Math.min(framework.durationMinutes.max, Math.max(framework.durationMinutes.min, totalMinutes));
  const durations = allocateDurations(framework.stageSequence, clampedMinutes);

  const stages: SessionBlueprintStage[] = framework.stageSequence.map((stageId, index) => ({
    id: `${framework.id}_${stageId}_${index + 1}`,
    stageId,
    componentId: STAGE_COMPONENT[stageId] as SessionComponentId,
    title: stageTitle(stageId),
    instruction: `${stageTitle(stageId)}: ${SESSION_STAGES.find((stage) => stage.id === stageId)?.purpose || ""}`.trim(),
    interaction: (STAGE_INTERACTION[stageId] || "read") as SessionInteraction,
    durationMinutes: durations[index],
    techniqueIds: framework.compatibleTechniques.slice(0, Math.max(1, Math.min(2, framework.compatibleTechniques.length))),
    optional: stageId === "deepening" || stageId === "variation",
  }));

  const techniques: SessionBlueprintTechnique[] = framework.compatibleTechniques.map((techniqueId) => ({
    id: techniqueId,
    name: techniqueId.replace(/_/g, " "),
    durationMinutes: roundMinutes(clampedMinutes / Math.max(1, framework.compatibleTechniques.length)),
  }));

  return {
    id: `${framework.id}_blueprint`,
    frameworkId: framework.id,
    frameworkVersion: framework.version,
    title: framework.name,
    intent: framework.primaryGoal,
    modality: framework.deliveryModes[0],
    durationMinutes: clampedMinutes,
    stages,
    techniques,
    outcomes: framework.outcomes,
    mission: buildMission(framework, clampedMinutes),
    adaptations: framework.adaptations,
    completionCriteria: framework.completionCriteria,
    provenance: framework.provenance,
    selectionReasons,
  };
}

export function adaptBlueprint(
  blueprint: SessionBlueprint,
  event: { type: string; state?: string; minutes?: number },
  framework: SessionFramework,
): { blueprint: SessionBlueprint; action: string; reason: string } {
  if (event.type === "discomfort") {
    const shortened = buildSessionBlueprint(framework, Math.max(framework.durationMinutes.min, blueprint.durationMinutes * 0.5), blueprint.selectionReasons);
    return { blueprint: shortened, action: "ground_and_close", reason: "User reported discomfort." };
  }

  if (event.type === "check_in" && event.state) {
    const rule = framework.adaptations.find((adaptation) => adaptation.condition === event.state);
    if (rule) {
      if (rule.action === "shorten") {
        const shortened = buildSessionBlueprint(framework, Math.max(framework.durationMinutes.min, blueprint.durationMinutes * 0.7), blueprint.selectionReasons);
        return { blueprint: shortened, action: rule.action, reason: rule.instruction };
      }
      if (rule.action === "simplify") {
        const simplified = {
          ...blueprint,
          stages: blueprint.stages.map((stage) => ({ ...stage, instruction: `Simplify: ${stage.instruction}` })),
        };
        return { blueprint: simplified, action: rule.action, reason: rule.instruction };
      }
      if (rule.action === "ground_and_close" || rule.action === "offer_stop") {
        const shortened = buildSessionBlueprint(framework, framework.durationMinutes.min, blueprint.selectionReasons);
        return { blueprint: shortened, action: rule.action, reason: rule.instruction };
      }
    }
  }

  if (event.type === "time_remaining" && typeof event.minutes === "number" && event.minutes < blueprint.durationMinutes) {
    const shortened = buildSessionBlueprint(framework, Math.max(framework.durationMinutes.min, event.minutes), blueprint.selectionReasons);
    return { blueprint: shortened, action: "shorten", reason: "Time remaining is shorter than planned." };
  }

  return { blueprint, action: "none", reason: "No adaptation needed." };
}



