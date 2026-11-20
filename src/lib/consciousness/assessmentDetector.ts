/**
 * ASSESSMENT-TO-LEVEL MAPPING — Detect starting levels from onboarding
 * NOT everyone starts at L0 — respect existing experience
 */

import type { PracticeId, CorePracticeId, PathPracticeId } from '@/types/practices';

// ─── Assessment Answer Types ───

export interface AssessmentAnswer {
  questionId: string;
  answer: string;
  followUp?: string;
}

export interface AssessmentResults {
  answers: AssessmentAnswer[];
  detectedLevels: Partial<Record<PracticeId, number>>;
  anchorPath: PathPracticeId;
  growthPath: PathPracticeId;
  overallBand: number;
  brainDominance: 'head' | 'heart' | 'gut';
}

// ─── Detection Functions ───

/**
 * Detect observation level from assessment answers
 * Elder: "When anger comes — do you notice it or react immediately?"
 */
export function detectObservationLevel(answers: AssessmentAnswer[]): number {
  const reactionAnswer = findAnswer(answers, 'reaction-test');
  if (!reactionAnswer) return 0;

  const text = reactionAnswer.answer.toLowerCase();
  if (text.includes('always notice') || text.includes('watch it')) return 4;
  if (text.includes('usually notice') || text.includes('before reacting')) return 3;
  if (text.includes('sometimes notice')) return 2;
  if (text.includes('notice after')) return 1;
  return 0;
}

/**
 * Detect self-inquiry level
 * Elder: "Have you ever asked 'Who am I?'"
 */
export function detectSelfInquiryLevel(answers: AssessmentAnswer[]): number {
  const siAnswer = findAnswer(answers, 'self-inquiry-experience');
  if (!siAnswer) return 0;

  const text = siAnswer.answer.toLowerCase();
  if (text.includes('silence') || text.includes('dissolve')) return 3;
  if (text.includes('tried') || text.includes('searched')) return 2;
  if (text.includes('yes') || text.includes('wondered')) return 1;
  return 0;
}

/**
 * Detect breath awareness level
 */
export function detectBreathLevel(answers: AssessmentAnswer[]): number {
  const breathAnswer = findAnswer(answers, 'breath-experience');
  if (!breathAnswer) return 0;

  const text = breathAnswer.answer.toLowerCase();
  if (text.includes('pranayama') || text.includes('energy')) return 3;
  if (text.includes('counting') || text.includes('4-7-8') || text.includes('box')) return 2;
  if (text.includes('sometimes') || text.includes('tried')) return 1;
  return 0;
}

/**
 * Detect witnessing level
 * Elder: "Close your eyes. Watch breath for 1 min. What happened?"
 */
export function detectWitnessingLevel(answers: AssessmentAnswer[]): number {
  const witnessAnswer = findAnswer(answers, 'witnessing-test');
  if (!witnessAnswer) return 0;

  const text = witnessAnswer.answer.toLowerCase();
  if (text.includes('stillness') || text.includes('peace') || text.includes('just watched')) return 3;
  if (text.includes('noticed') || text.includes('came back')) return 2;
  if (text.includes('wandered') || text.includes('couldn')) return 1;
  return 0;
}

/**
 * Detect body awareness level
 * Elder: "Where in your body do you feel tension?"
 */
export function detectBodyLevel(answers: AssessmentAnswer[]): number {
  const bodyAnswer = findAnswer(answers, 'body-awareness');
  if (!bodyAnswer) return 0;

  const text = bodyAnswer.answer.toLowerCase();
  if (text.includes('energy') || text.includes('prana') || text.includes('flow')) return 3;
  if (text.includes('shoulders') || text.includes('stomach') || text.includes('chest') || text.includes('know immediately')) return 2;
  if (text.includes('not sure') || text.includes('sometimes')) return 1;
  return 0;
}

/**
 * Detect bhakti level
 * Elder: "Have you ever done bhajan/kirtan?"
 */
export function detectBhaktiLevel(answers: AssessmentAnswer[]): number {
  const bhaktiAnswer = findAnswer(answers, 'bhakti-experience');
  if (!bhaktiAnswer) return 0;

  const text = bhaktiAnswer.answer.toLowerCase();
  if (text.includes('surrender') || text.includes('divine love') || text.includes('para bhakti')) return 5;
  if (text.includes('devotion') || text.includes('heart open') || text.includes('cry')) return 4;
  if (text.includes('regularly') || text.includes('still do') || text.includes('with mom')) return 3;
  if (text.includes('sometimes') || text.includes('enjoy')) return 2;
  if (text.includes('tried') || text.includes('listened')) return 1;
  return 0;
}

/**
 * Detect karma yoga level
 * Elder: "Have you worked for others without expecting reward?"
 */
export function detectKarmaLevel(answers: AssessmentAnswer[]): number {
  const karmaAnswer = findAnswer(answers, 'karma-experience');
  if (!karmaAnswer) return 0;

  const text = karmaAnswer.answer.toLowerCase();
  if (text.includes('stillness') || text.includes('action from being')) return 4;
  if (text.includes('sacrifice') || text.includes('left job') || text.includes('no regret')) return 3;
  if (text.includes('volunteer') || text.includes('help')) return 2;
  if (text.includes('sometimes') || text.includes('try to')) return 1;
  return 0;
}

/**
 * Detect jnana yoga level
 */
export function detectJnanaLevel(answers: AssessmentAnswer[]): number {
  const jnanaAnswer = findAnswer(answers, 'knowledge-experience');
  if (!jnanaAnswer) return 0;

  const text = jnanaAnswer.answer.toLowerCase();
  if (text.includes('direct seeing') || text.includes('no mediator')) return 4;
  if (text.includes('neti') || text.includes('not this') || text.includes('discrimination')) return 3;
  if (text.includes('read') || text.includes('study') || text.includes('vedanta')) return 2;
  if (text.includes('curious') || text.includes('thinking')) return 1;
  return 0;
}

/**
 * Detect raja yoga level
 */
export function detectRajaLevel(answers: AssessmentAnswer[]): number {
  const rajaAnswer = findAnswer(answers, 'discipline-experience');
  if (!rajaAnswer) return 0;

  const text = rajaAnswer.answer.toLowerCase();
  if (text.includes('samadhi') || text.includes('absorption')) return 5;
  if (text.includes('dhyana') || text.includes('deep meditation')) return 4;
  if (text.includes('pranayama') || text.includes('concentration')) return 3;
  if (text.includes('discipline') || text.includes('routine') || text.includes('ethics')) return 2;
  if (text.includes('trying') || text.includes('want to')) return 1;
  return 0;
}

// ─── Aggregate Functions ───

/**
 * Run all detection functions and return complete level map
 */
export function detectAllLevels(answers: AssessmentAnswer[]): Partial<Record<PracticeId, number>> {
  return {
    'observation': detectObservationLevel(answers),
    'self-inquiry': detectSelfInquiryLevel(answers),
    'breath': detectBreathLevel(answers),
    'witnessing': detectWitnessingLevel(answers),
    'body': detectBodyLevel(answers),
    'bhakti': detectBhaktiLevel(answers),
    'karma': detectKarmaLevel(answers),
    'jnana': detectJnanaLevel(answers),
    'raja': detectRajaLevel(answers),
  };
}

/**
 * Determine anchor (strongest) and growth (weakest) paths
 */
export function detectPaths(levels: Partial<Record<PracticeId, number>>): {
  anchorPath: PathPracticeId;
  growthPath: PathPracticeId;
} {
  const pathPractices: PathPracticeId[] = ['bhakti', 'karma', 'jnana', 'raja'];
  const sorted = pathPractices
    .map(id => ({ id, level: levels[id] ?? 0 }))
    .sort((a, b) => b.level - a.level);

  return {
    anchorPath: sorted[0].id,
    growthPath: sorted[sorted.length - 1].id,
  };
}

/**
 * Detect brain dominance from answers
 */
export function detectBrainDominance(answers: AssessmentAnswer[]): 'head' | 'heart' | 'gut' {
  const happinessAnswer = findAnswer(answers, 'happiness-source');
  if (!happinessAnswer) return 'head';

  const text = happinessAnswer.answer.toLowerCase();
  if (text.includes('love') || text.includes('connection') || text.includes('family') || text.includes('heart')) return 'heart';
  if (text.includes('instinct') || text.includes('gut') || text.includes('feel') || text.includes('body')) return 'gut';
  return 'head';
}

/**
 * Full assessment processing — returns complete results
 */
export function processAssessment(answers: AssessmentAnswer[]): AssessmentResults {
  const detectedLevels = detectAllLevels(answers);
  const paths = detectPaths(detectedLevels);
  const brainDominance = detectBrainDominance(answers);

  // Calculate overall band (geometric mean of core levels)
  const coreIds: CorePracticeId[] = ['observation', 'self-inquiry', 'breath', 'witnessing', 'body'];
  const coreScores = coreIds.map(id => Math.max(0.01, detectedLevels[id] ?? 0));
  const product = coreScores.reduce((acc, s) => acc * s, 1);
  const geometricMean = Math.pow(product, 1 / coreScores.length);

  // Cap at 1.0 for calibration
  const overallBand = Math.min(geometricMean, 1.0);

  return {
    answers,
    detectedLevels,
    anchorPath: paths.anchorPath,
    growthPath: paths.growthPath,
    overallBand: Math.round(overallBand * 10) / 10,
    brainDominance,
  };
}

// ─── Helpers ───

function findAnswer(answers: AssessmentAnswer[], questionId: string): AssessmentAnswer | undefined {
  return answers.find(a => a.questionId === questionId);
}
