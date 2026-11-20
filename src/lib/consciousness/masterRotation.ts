/**
 * masterRotation — Re-exports from unified shared module
 * 
 * The canonical implementation lives in src/lib/shared/masterSelector.ts
 * (which mirrors supabase/functions/_shared/masterSelector.ts)
 * This file maintains backward compatibility for existing imports.
 */

export { selectMasterForRotation as decideRotation } from './shared/masterSelector';
export type { RotationContext, RotationDecision, RotationReason } from './shared/masterSelector';

// Compatibility wrapper matching old interface
export function decideRotationLegacy(ctx: {
  userId: string;
  currentGuruId: string | null;
  daysSinceLastRotation: number;
  lifetimePhase: number;
  dominantLoop: string | null;
  loopSeverity: number;
  avgQualityLast7Days: number;
  progressStalled: boolean;
  rotationsHistory: Array<{ guruId: string; startedAt: string; reason: string }>;
}): { shouldRotate: boolean; newGuruId: string; reason: string; durationDays: number; message: string } {
  // This is a stub - real implementation should call server
  // or use the shared logic directly
  return {
    shouldRotate: false,
    newGuruId: ctx.currentGuruId || 'ramana',
    reason: 'no_rotation_needed',
    durationDays: 0,
    message: '',
  };
}

export function resolveGuru(guruId: string): any {
  return null;
}