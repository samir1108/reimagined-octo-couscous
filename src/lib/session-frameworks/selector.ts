import type {
  FrameworkCandidate,
  FrameworkSelection,
  FrameworkSelectionContext,
  SessionFramework,
} from "./types";
import { FRAMEWORK_CATALOG } from "./catalog";

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

function scoreFramework(framework: SessionFramework, context: FrameworkSelectionContext): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (context.timeBudgetMin >= framework.durationMinutes.min && context.timeBudgetMin <= framework.durationMinutes.max) {
    score += 20;
    reasons.push("fits_time_budget");
  } else if (context.timeBudgetMin >= framework.durationMinutes.min) {
    score += 8;
    reasons.push("can_be_shortened");
  } else {
    score -= 10;
    reasons.push("time_budget_too_short");
  }

  if (context.preferredFrameworkId && context.preferredFrameworkId === framework.id) {
    score += 100;
    reasons.push("explicitly_preferred");
  }

  if (context.preferredDifficulty && context.preferredDifficulty === framework.difficulty) {
    score += 12;
    reasons.push("difficulty_match");
  }

  if (context.experienceLevel === "beginner" && framework.difficulty === "beginner") score += 8;
  if (context.experienceLevel === "advanced" && framework.difficulty !== "beginner") score += 6;

  if (context.preferredModalities && context.preferredModalities.length) {
    const overlap = framework.deliveryModes.filter((m) => context.preferredModalities!.includes(m)).length;
    score += overlap * 6;
    if (overlap) reasons.push("modality_overlap");
  }

  if (context.checkIn) {
    const state = context.checkIn;
    const adaptationMatch = framework.adaptations.some((a) => a.condition === state);
    if (adaptationMatch) {
      score += 6;
      reasons.push("has_adaptation_for_state");
    }
    if (state === "short_on_time" && framework.durationMinutes.default <= 6) {
      score += 10;
      reasons.push("short_session");
    }
    if (state === "overwhelmed" && framework.category === "body_sensory_awareness") score += 8;
    if (state === "curious" && framework.category === "self_inquiry_witnessing") score += 8;
    if (state === "wants_practical_help" && (framework.category === "behavioral_change" || framework.category === "values_life_direction")) score += 8;
  }

  if (context.energy === "low" && framework.durationMinutes.default <= 8) {
    score += 8;
    reasons.push("low_energy_friendly");
  }
  if (context.energy === "high" && framework.durationMinutes.default >= 10) {
    score += 4;
    reasons.push("supports_deeper_practice");
  }

  if (context.goal) {
    const goal = normalize(context.goal);
    const text = normalize(`${framework.name} ${framework.primaryGoal} ${framework.category} ${framework.description}`);
    const tokens = goal.split(/\s+/).filter(Boolean);
    const matches = tokens.filter((token) => text.includes(token)).length;
    score += matches * 5;
    if (matches) reasons.push("goal_keyword_match");
  }

  if (context.activeGoalCategories && context.activeGoalCategories.includes(framework.category)) {
    score += 10;
    reasons.push("active_goal_category");
  }

  if (context.recentFrameworkIds && context.recentFrameworkIds.includes(framework.id)) {
    score -= 15;
    reasons.push("recently_used");
  }
  if (context.avoidFrameworkIds && context.avoidFrameworkIds.includes(framework.id)) {
    score -= 100;
    reasons.push("avoided");
  }
  if (context.completedFrameworkIds && context.completedFrameworkIds.includes(framework.id)) {
    score -= 5;
    reasons.push("already_completed");
  }

  return { score, reasons };
}

export function selectFramework(context: FrameworkSelectionContext): FrameworkSelection {
  const candidates: FrameworkCandidate[] = FRAMEWORK_CATALOG
    .filter((framework) => !(context.avoidFrameworkIds || []).includes(framework.id))
    .map((framework) => {
      const { score, reasons } = scoreFramework(framework, context);
      return { framework, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  const selected = candidates[0];
  if (!selected) {
    throw new Error("No framework available for selection");
  }

  return {
    selected: selected.framework,
    score: selected.score,
    reasons: selected.reasons,
    alternatives: candidates.slice(1, 4),
  };
}

export function selectFrameworks(context: FrameworkSelectionContext, count = 3): FrameworkCandidate[] {
  return selectFramework(context).alternatives.concat({
    framework: selectFramework(context).selected,
    score: selectFramework(context).score,
    reasons: selectFramework(context).reasons,
  }).slice(0, count);
}

export function getFrameworkById(id: string): SessionFramework | undefined {
  return FRAMEWORK_CATALOG.find((framework) => framework.id === id);
}
