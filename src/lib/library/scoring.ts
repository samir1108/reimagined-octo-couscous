/**
 * Generic assessment scoring engine.
 * Works for any assessment that uses `weighted_sum_percentage` scoring.
 */
export interface AssessmentQuestion {
  id: string;
  type: "choice" | "scale" | "text";
  prompt: string;
  domain?: string;
  options?: Array<{
    label: string;
    value: string;
    weights?: Record<string, number>;
  }>;
}

export interface ScoringLogic {
  method: string;
  dimensions: string[];
  primary_rule: string;
}

export interface ResultType {
  id: string;
  label: string;
  short: string;
  description: string;
  shadow?: string;
  color?: string;
  masters?: string[];
}

export interface ScoreResult {
  rawScores: Record<string, number>;
  percentages: Record<string, number>;
  primaryId: string;
  secondaryId: string;
  primaryType?: ResultType;
}

export function scoreAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, string>,
  scoringLogic: ScoringLogic,
  resultTypes: ResultType[],
): ScoreResult {
  const dimensions = scoringLogic.dimensions ?? [];
  const rawScores: Record<string, number> = {};
  dimensions.forEach((d) => (rawScores[d] = 0));

  for (const q of questions) {
    const ans = answers[q.id];
    if (!ans || !q.options) continue;
    const opt = q.options.find((o) => o.value === ans);
    if (!opt?.weights) continue;
    for (const [dim, w] of Object.entries(opt.weights)) {
      rawScores[dim] = (rawScores[dim] || 0) + (w as number);
    }
  }

  const total = Object.values(rawScores).reduce((s, v) => s + v, 0) || 1;
  const percentages: Record<string, number> = {};
  for (const d of dimensions) {
    percentages[d] = Math.round(((rawScores[d] || 0) / total) * 100);
  }

  // Sort to find primary + secondary
  const sorted = [...dimensions].sort((a, b) => (rawScores[b] || 0) - (rawScores[a] || 0));
  const primaryId = sorted[0];
  const secondaryId = sorted[1] ?? sorted[0];
  const primaryType = resultTypes.find((r) => r.id === primaryId);

  return { rawScores, percentages, primaryId, secondaryId, primaryType };
}
