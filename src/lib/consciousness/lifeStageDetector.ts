/**
 * LIFE-STAGE DETECTOR (Batch 14)
 * Detects which life stage a user is in based on age + life signals.
 * Adapts engine tone, practice depth, and language.
 */

export type LifeStage =
  | 'student'      // 13-22: identity formation
  | 'seeker'       // 22-32: searching, careering
  | 'builder'      // 32-45: family, ambition, integration
  | 'integrator'   // 45-60: meaning, legacy, depth
  | 'elder';       // 60+: wisdom, surrender, presence

export interface LifeStageProfile {
  stage: LifeStage;
  label: string;
  toneHint: string;
  practiceBias: string;
}

export const LIFE_STAGE_DEFS: Record<LifeStage, LifeStageProfile> = {
  student:    { stage: 'student',    label: 'Student',    toneHint: 'Playful, curious, exploratory',     practiceBias: 'short, varied, identity-aware' },
  seeker:     { stage: 'seeker',     label: 'Seeker',     toneHint: 'Direct, ambitious, depth-hungry',   practiceBias: 'fast tracks, intellectual + body' },
  builder:    { stage: 'builder',    label: 'Builder',    toneHint: 'Practical, integration-focused',    practiceBias: 'micro-practices that fit busy life' },
  integrator: { stage: 'integrator', label: 'Integrator', toneHint: 'Meaning-seeking, legacy-aware',     practiceBias: 'longer sits, deeper inquiry' },
  elder:      { stage: 'elder',      label: 'Elder',      toneHint: 'Soft, surrendered, presence-first', practiceBias: 'silence, devotion, witnessing' },
};

export function detectLifeStage(age?: number | null): LifeStage {
  if (!age || age < 13) return 'student';
  if (age < 22) return 'student';
  if (age < 32) return 'seeker';
  if (age < 45) return 'builder';
  if (age < 60) return 'integrator';
  return 'elder';
}

export function getLifeStageProfile(stage: LifeStage): LifeStageProfile {
  return LIFE_STAGE_DEFS[stage];
}
