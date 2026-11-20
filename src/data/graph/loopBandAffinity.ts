/**
 * Loop × Band Affinity — which consciousness bands each behavioral loop lives in.
 * ─────────────────────────────────────────────────────────────────────────────
 * The 400+ loop library carries no band information; the gap audit found 386
 * loops claimed by no band at all. Left unclaimed, they are invisible to the
 * band-aware layer (stage profiles, onboarding band hints, session seeding).
 *
 * Two-tier mapping, deliberately weaker than curated data:
 *
 *   1. CATEGORY_BAND_AFFINITY — every loop category maps to the band range
 *      where that category of pattern typically dominates (weight 0.4).
 *   2. LOOP_BAND_OVERRIDES — hand-narrowed ranges for the loops already cited
 *      by BAND_GUIDEBOOK or marker curation, so marker-linked loops sit at the
 *      bands the content actually names (weight 0.5).
 *
 * Category-level edges are a floor, not a ceiling: curated bandGuidebook edges
 * (0.7) always win over these.
 */

import type { LoopCategory } from '@/data/loops';

export const CATEGORY_BAND_AFFINITY: Record<LoopCategory, number[]> = {
  validation: [0, 1, 2, 3, 4],
  control: [0, 1, 2, 3, 4, 5],
  avoidance: [0, 1, 2, 3, 4, 5],
  attachment: [1, 2, 3, 4, 5],
  comparison: [0, 1, 2, 3, 4],
  narrative: [1, 2, 3, 4, 5],
  survival: [0, 1, 2],
  body: [0, 1, 2, 3],
  energy: [0, 1, 2, 3],
  emotional: [0, 1, 2, 3, 4],
  mental: [0, 1, 2, 3, 4, 5],
  behavioral: [0, 1, 2],
  habit: [0, 1, 2],
  social: [0, 1, 2, 3],
  relationship: [0, 1, 2, 3, 4],
  identity: [0, 1, 2, 3, 4, 5],
  ego: [1, 2, 3, 4, 5, 6],
  belief: [1, 2, 3, 4, 5],
  cognitive_bias: [0, 1, 2, 3],
  attention: [0, 1, 2, 3],
  motivation: [0, 1, 2, 3],
  decision: [0, 1, 2, 3, 4],
  learning: [0, 1, 2, 3, 4, 5],
  productivity: [0, 1, 2, 3, 4],
  creativity: [1, 2, 3, 4, 5],
  purpose: [1, 2, 3, 4, 5, 6],
  spiritual: [1, 2, 3, 4, 5, 6],
  scarcity: [0, 1, 2, 3],
};

/**
 * Hand-narrowed ranges for the loops the corpus explicitly ties to bands:
 * BAND_GUIDEBOOK commonLoops, marker curation overrides, and the loops our
 * kundalini-sign layer flags as commonly confused with energetic signs.
 */
export const LOOP_BAND_OVERRIDES: Record<string, number[]> = {
  // Band 0 staples (bandGuidebook + sleeper markers)
  VAL001: [0, 1, 2, 3],
  VAL002: [0, 1, 2],
  VAL003: [0, 1, 2],
  VAL004: [0, 1, 2],
  VAL036: [0, 1, 2, 3],
  VAL008: [0, 1, 2, 3],
  ATT168: [0, 1],
  AVD147: [0, 1],
  ATT155: [0, 1, 2],
  SRV320: [0, 1, 2],
  CTL087: [0, 1],
  HAB013: [0, 1],
  PRD001: [0, 1, 2],
  NAR266: [0, 1, 2],
  NAR285: [0, 1, 2],
  // Seeker / Questioner band staples
  EMO009: [0, 1, 2],
  MEN001: [0, 1, 2, 3],
  RUM001: [0, 1, 2, 3],
  RUM002: [0, 1, 2, 3],
  AVD132: [1, 2, 3],
  ATT200: [1, 2, 3],
  SRV331: [1, 2, 3],
  VAL038: [1, 2, 3],
  VAL009: [1, 2, 3],
  SPR007: [1, 2, 3],
  CTL064: [0, 1, 2],
  VAL018: [2, 3, 4],
  VAL021: [1, 2, 3],
  VAL025: [0, 1, 2, 3],
  VAL026: [0, 1, 2],
  VAL017: [0, 1, 2],
  AVD121: [0, 1, 2],
  AVD113: [0, 1, 2],
  AVD118: [1, 2, 3, 4],
};

export function bandsForLoop(loopId: string, category: LoopCategory): number[] {
  return LOOP_BAND_OVERRIDES[loopId] ?? CATEGORY_BAND_AFFINITY[category] ?? [0, 1, 2, 3, 4, 5];
}
