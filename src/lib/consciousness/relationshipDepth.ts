/**
 * APP RELATIONSHIP DEPTH (Batch 14)
 * Tracks how deep the user's relationship with the app has become.
 * 7 phases — adapts UI familiarity, AI tone, and feature unlocks.
 */

export type RelationshipPhase =
  | 'stranger'      // 0-3 days
  | 'acquaintance'  // 4-14 days
  | 'companion'     // 15-45 days
  | 'confidant'     // 46-120 days
  | 'partner'       // 121-365 days
  | 'kin'           // 366-730 days
  | 'witness';      // 730+ days

export interface RelationshipState {
  phase: RelationshipPhase;
  daysKnown: number;
  trustScore: number; // 0-1
  toneHint: string;
}

const PHASE_THRESHOLDS: Array<{ max: number; phase: RelationshipPhase; tone: string }> = [
  { max: 3,   phase: 'stranger',     tone: 'Polite. Explain things. Earn trust.' },
  { max: 14,  phase: 'acquaintance', tone: 'Warmer. Reference yesterday.' },
  { max: 45,  phase: 'companion',    tone: 'Familiar. Shared shorthand.' },
  { max: 120, phase: 'confidant',    tone: 'Intimate. Speak truth without preamble.' },
  { max: 365, phase: 'partner',      tone: 'Trusted. Shared inside-jokes; deep callbacks.' },
  { max: 730, phase: 'kin',          tone: 'Family. No need to perform.' },
  { max: Infinity, phase: 'witness', tone: 'Silent presence. Few words.' },
];

export function computeRelationship(input: {
  firstSeenAt: string | Date;
  totalSessions: number;
  totalJournals: number;
}): RelationshipState {
  const first = new Date(input.firstSeenAt).getTime();
  const days = Math.max(0, Math.floor((Date.now() - first) / 86_400_000));
  const def = PHASE_THRESHOLDS.find((p) => days <= p.max)!;

  // Trust: days * activity. Capped 0..1.
  const activity = (input.totalSessions + input.totalJournals * 1.5) / Math.max(days, 1);
  const trust = Math.min(1, days / 365 * 0.7 + Math.min(activity, 1) * 0.3);

  return { phase: def.phase, daysKnown: days, trustScore: Number(trust.toFixed(3)), toneHint: def.tone };
}
