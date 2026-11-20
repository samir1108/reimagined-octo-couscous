// Personalization Engine
// Selects a framework based on context, preferences, history.

import type { SessionFramework, FrameworkContext, FrameworkCandidate, FrameworkSelection } from "../types";
import { getFrameworkRegistry } from "../frameworks";

export interface PersonalizationWeights {
  intentionMatch: number;
  durationFit: number;
  novelty: number;
  energyFit: number;
  gateFit: number;
}

const DEFAULT_WEIGHTS: PersonalizationWeights = {
  intentionMatch: 0.35,
  durationFit: 0.25,
  novelty: 0.15,
  energyFit: 0.15,
  gateFit: 0.10,
};

function scoreFramework(fw: SessionFramework, ctx: FrameworkContext, weights: PersonalizationWeights): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // duration fit
  const budget = ctx.timeBudgetMin;
  const min = Math.min(...fw.preferredDurations);
  const max = Math.max(...fw.preferredDurations);
  if (budget >= min && budget <= max) {
    score += weights.durationFit;
    reasons.push("duration fits");
  } else if (budget >= min) {
    score += weights.durationFit * 0.5;
    reasons.push("duration acceptable");
  }

  // energy fit
  if (fw.suitableEnergy?.includes(ctx.energy)) {
    score += weights.energyFit;
    reasons.push("energy matches");
  }

  // gate fit
  if (fw.suitableGates?.includes(ctx.gate)) {
    score += weights.gateFit;
    reasons.push("gate matches");
  }

  // intention match (based on suitableIntentions vs preferences)
  const intent = (ctx.preferences?.intention as string) || "";
  if (intent && fw.suitableIntentions.some((i) => i.toLowerCase().includes(intent.toLowerCase()))) {
    score += weights.intentionMatch;
    reasons.push("intention matches");
  }

  // loop match: frameworks whose steps target active loops
  if (ctx.activeLoops?.length) {
    const loopHit = ctx.activeLoops.some((l) => fw.suitableIntentions.some((i) => i.toLowerCase().includes(l.toLowerCase())));
    if (loopHit) { score += 0.2; reasons.push("loop match"); }
  }
  // weakest dimension bonus
  if (ctx.weakestDimension && fw.suitableIntentions.some((i) => i.toLowerCase().includes(ctx.weakestDimension!.toLowerCase()))) {
    score += 0.15; reasons.push("weakness targeted");
  }
  // recency gap: prefer novel after a gap
  if (ctx.daysSinceLastSession >= 4) {
    if (!ctx.recentFrameworkIds?.includes(fw.id)) { score += 0.1; reasons.push("re-entry novelty"); }
  }
  // journey day gating
  if (fw.minJourneyDay !== undefined && ctx.journeyDay < fw.minJourneyDay) return { score: -1, reasons: ["journey day too early"] };
  if (fw.maxJourneyDay !== undefined && ctx.journeyDay > fw.maxJourneyDay) { score -= 0.2; }
  // novelty: avoid recently used
  if (!ctx.recentFrameworkIds?.includes(fw.id)) {
    score += weights.novelty;
    reasons.push("novel");
  } else {
    score += weights.novelty * 0.2;
  }

  return { score, reasons };
}

export function rankFrameworks(ctx: FrameworkContext, weights: PersonalizationWeights = DEFAULT_WEIGHTS): FrameworkCandidate[] {
  const reg = getFrameworkRegistry();
  const candidates: FrameworkCandidate[] = [];
  for (const fw of reg.frameworks.values()) {
    const { score, reasons } = scoreFramework(fw, ctx, weights);
    candidates.push({ framework: fw, score, reasons });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

export function selectFramework(ctx: FrameworkContext, weights?: PersonalizationWeights): FrameworkSelection {
  const ranked = rankFrameworks(ctx, weights);
  const top = ranked[0];
  const alternatives = ranked.slice(1, 4);
  return {
    selected: top.framework,
    score: top.score,
    reasons: top.reasons,
    alternatives,
  };
}

export function buildContext(partial: Partial<FrameworkContext> & { userId: string }): FrameworkContext {
  return {
    userId: partial.userId,
    gate: partial.gate ?? "morning",
    energy: partial.energy ?? "medium",
    timeBudgetMin: partial.timeBudgetMin ?? 15,
    journeyDay: partial.journeyDay ?? 1,
    activeLoops: partial.activeLoops ?? [],
    recentFrameworkIds: partial.recentFrameworkIds ?? [],
    recentStepIds: partial.recentStepIds ?? [],
    preferences: partial.preferences ?? {},
    daysSinceLastSession: partial.daysSinceLastSession ?? 1,
    ...partial,
  } as FrameworkContext;
}

export default { rankFrameworks, selectFramework, buildContext };
