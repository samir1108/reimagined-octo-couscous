/**
 * STAGE DETECTION ENGINE — Hidden 8-stage consciousness model
 * Stages are NEVER labeled to user. They drive AI behavior internally.
 *
 * 0 → Unaware (Sleeper)
 * 1 → Reactive
 * 2 → Noticing
 * 3 → Observer
 * 4 → Questioner
 * 5 → Self-Inquiry
 * 6 → Integrated
 * 7 → Stabilized Awareness
 */

export type ConsciousnessStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STAGE_LABELS: Record<ConsciousnessStage, string> = {
  0: 'Unaware',
  1: 'Reactive',
  2: 'Noticing',
  3: 'Observer',
  4: 'Questioner',
  5: 'Self-Inquiry',
  6: 'Integrated',
  7: 'Stabilized',
};

export interface StageScores {
  awareness: number;            // 0-100
  reactivity: number;           // 0-100
  patternRecognition: number;   // 0-100
  selfInquiry: number;          // 0-100
  consistency: number;          // 0-100
}

export interface StageInput {
  message: string;
  /** Cross-session signals */
  consistencyScore?: number;     // 0-100 from usage data
  patternReferenceCount?: number; // times user referenced own patterns
  previousStage?: ConsciousnessStage;
  /** Number of distinct signals detected in this turn */
  reactivityHistory?: number;    // 0-100 rolling
}

export interface StageDetection {
  stage: ConsciousnessStage;
  smoothedStage: ConsciousnessStage;
  scores: StageScores;
  confidence: number; // 0-1
  /** Subtle phrasing the AI can use INSTEAD of labeling — never says "Stage X" */
  narrativeHint: string;
}

// ─── Score Detection ───

export function computeStageScores(input: StageInput): StageScores {
  const msg = input.message.toLowerCase();

  // 1. Awareness — reflection, self-reference, non-blame
  let awareness = 30;
  if (/i (notice|noticed|observe|see that|realize|am aware)/.test(msg)) awareness += 20;
  if (/part of me|something in me|i find myself/.test(msg)) awareness += 15;
  if (/it'?s (their|his|her|the world'?s) fault|they made me/.test(msg)) awareness -= 20;
  if (/i (chose|choose|allowed|am responsible)/.test(msg)) awareness += 15;
  awareness = clamp(awareness);

  // 2. Reactivity
  let reactivity = input.reactivityHistory ?? 30;
  if (/(hate|furious|cannot stand|always|never|everyone|no one)/.test(msg)) reactivity += 20;
  if (/(their fault|made me|forced me|because of them)/.test(msg)) reactivity += 20;
  if (/calm|grounded|steady|peaceful|centered/.test(msg)) reactivity -= 25;
  reactivity = clamp(reactivity);

  // 3. Pattern recognition
  let pattern = 20;
  if (/this (always|keeps|again)|i (always|keep) doing|same (thing|pattern)/.test(msg)) pattern += 30;
  if (/last (time|week|month).*(same|similar)/.test(msg)) pattern += 25;
  pattern += Math.min(30, (input.patternReferenceCount ?? 0) * 10);
  pattern = clamp(pattern);

  // 4. Self-inquiry
  let inquiry = 10;
  if (/who (am i|is the one)|what is the (self|me|i)|am i (really )?/.test(msg)) inquiry += 40;
  if (/why am i (like this|this way)|what part of me/.test(msg)) inquiry += 25;
  if (/observer|witness|consciousness|awareness itself/.test(msg)) inquiry += 20;
  inquiry = clamp(inquiry);

  // 5. Consistency (from cross-session signal)
  const consistency = clamp(input.consistencyScore ?? 30);

  return {
    awareness,
    reactivity,
    patternRecognition: pattern,
    selfInquiry: inquiry,
    consistency,
  };
}

// ─── Stage Computation ───

export function computeStage(scores: StageScores): ConsciousnessStage {
  const { awareness: A, reactivity: R, patternRecognition: P, selfInquiry: S, consistency: C } = scores;

  if (A < 20 && R > 70) return 0;
  if (R > 60 && A < 30) return 1;
  if (A > 30 && P < 30) return 2;
  if (S > 60 && C > 50) return 6;
  if (C > 70 && R < 20) return 7;
  if (S > 50) return 5;
  if (P > 50 && S < 40) return 4;
  if (A > 40 && P > 40) return 3;
  return 2;
}

// ─── Smoothing (avoid stage jumping) ───

export function smoothStage(
  previous: ConsciousnessStage | undefined,
  current: ConsciousnessStage,
): ConsciousnessStage {
  if (previous === undefined) return current;
  // Weighted: 70% previous + 30% current, then round
  const smoothed = Math.round(previous * 0.7 + current * 0.3);
  // Cap movement to ±1 stage per turn
  const delta = smoothed - previous;
  if (delta > 1) return (previous + 1) as ConsciousnessStage;
  if (delta < -1) return (previous - 1) as ConsciousnessStage;
  return smoothed as ConsciousnessStage;
}

// ─── Narrative Hints (NEVER say "Stage X" to user) ───

export function getNarrativeHint(stage: ConsciousnessStage): string {
  const hints: Record<ConsciousnessStage, string> = {
    0: 'Things seem to be happening to the user automatically, without much awareness.',
    1: 'The user is reactive — emotions and circumstances are driving them.',
    2: 'The user is starting to notice things that earlier just happened automatically.',
    3: 'The user is beginning to observe their thoughts and reactions instead of just being them.',
    4: 'The user is starting to question — not just experiencing, but inquiring.',
    5: 'The user is engaged in genuine self-inquiry — looking at the looker.',
    6: 'The user is integrating — awareness is becoming lived, not just understood.',
    7: 'The user rests in awareness. Few words needed. Use silence and paradox.',
  };
  return hints[stage];
}

// ─── Main Entry ───

export function detectStage(input: StageInput): StageDetection {
  const scores = computeStageScores(input);
  const raw = computeStage(scores);
  const smoothed = smoothStage(input.previousStage, raw);

  // Confidence: count how many scores are non-baseline (>40)
  const distinctSignals = [scores.awareness, scores.reactivity, scores.patternRecognition, scores.selfInquiry, scores.consistency]
    .filter(s => s > 40).length;
  const confidence = Math.min(1, distinctSignals / 5);

  return {
    stage: raw,
    smoothedStage: smoothed,
    scores,
    confidence,
    narrativeHint: getNarrativeHint(smoothed),
  };
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}
