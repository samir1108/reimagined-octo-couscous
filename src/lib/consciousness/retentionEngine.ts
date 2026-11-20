/**
 * RETENTION ARCHITECTURE (Batch 14)
 * Detects disengagement and prescribes the right re-engagement gesture.
 * Composes with the existing health-score system but specifies *what* to do.
 */

export type RetentionRisk = 'thriving' | 'stable' | 'drifting' | 'disengaged' | 'lost';

export interface RetentionInput {
  daysSinceLastSession: number;
  consecutiveSkippedDays: number;
  recentQualityAvg: number; // 0-1
  totalSessions: number;
}

export interface RetentionPrescription {
  risk: RetentionRisk;
  recommendedGesture:
    | 'silent_celebration'
    | 'micro_pulse'
    | 'gentle_nudge'
    | 'reflect_invite'
    | 'arya_returns'
    | 'witness_only';
  copy: string;
}

export function computeRetention(input: RetentionInput): RetentionPrescription {
  const { daysSinceLastSession: gap, consecutiveSkippedDays: skips, recentQualityAvg: q, totalSessions } = input;

  if (gap <= 1 && q >= 0.7) {
    return { risk: 'thriving', recommendedGesture: 'silent_celebration', copy: 'You showed up. That is everything.' };
  }
  if (gap <= 3) {
    return { risk: 'stable', recommendedGesture: 'micro_pulse', copy: 'Three breaths. That is enough today.' };
  }
  if (gap <= 7 || skips >= 3) {
    return { risk: 'drifting', recommendedGesture: 'gentle_nudge', copy: 'No guilt. Just notice you are back.' };
  }
  if (gap <= 21) {
    return { risk: 'disengaged', recommendedGesture: 'reflect_invite', copy: 'A while since we sat. What pulled you away?' };
  }
  if (gap > 21 && totalSessions >= 10) {
    return { risk: 'lost', recommendedGesture: 'arya_returns', copy: 'Welcome home. The spiral kept turning while you were gone.' };
  }
  return { risk: 'lost', recommendedGesture: 'witness_only', copy: '' };
}
