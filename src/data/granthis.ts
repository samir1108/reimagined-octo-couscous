/**
 * The Three Granthis — the psychic knots of the subtle body.
 * ─────────────────────────────────────────────────────────
 * Where a behavioral loop is a groove in the mind, a granthi is a knot in the
 * energy body: the place where prana meets resistance and the flow narrows.
 * The tradition names three (Hatha Yoga Pradipika, Ch. 4, vv. 70–76):
 *
 *   • Brahma Granthi — Muladhara — the knot of physical existence
 *   • Vishnu Granthi — Anahata — the knot of emotional attachment
 *   • Rudra Granthi  — Ajna — the knot of the knower
 *
 * Source-of-truth lives here. The graph (src/data/graph) wires these into
 * bands, chakras, loop families, and dissolution practices; the UI renders them.
 *
 * Corpus source: the granthi essay in the content corpus ("What the Rishis Saw"
 * section) and the Hatha Yoga Pradipika citations it carries.
 */

import type { DimensionId } from '@/types/consciousness';

export type GranthiId = 'brahma' | 'vishnu' | 'rudra';

export interface Granthi {
  id: GranthiId;
  name: string;                    // "Brahma Granthi"
  knotOf: string;                  // what it binds, in one line
  chakra: string;                  // chakra node id (src/data/graph/nodes.ts)
  dimension: DimensionId;          // primary consciousness dimension it lives in
  feltSense: string;               // what it feels like from inside
  tightensFamilies: string[];      // loop-family slugs (src/data/handbook/loopFamilies.ts)
  dominantAtBands: number[];       // bands where this knot is the primary obstacle
  dissolvedBy: string[];           // practice ids (src/types/practices.ts)
  dissolution: string;             // the one-line way out
  source: string;
}

export const GRANTHIS: Granthi[] = [
  {
    id: 'brahma',
    name: 'Brahma Granthi',
    knotOf: 'Physical existence and the fear of death — security, food, procreation.',
    chakra: 'muladhara',
    dimension: 'body',
    feltSense:
      'The world is a threat inventory. Safety is a number in an account, a locked door, a full fridge. Rest feels like falling behind; desire feels like danger.',
    tightensFamilies: ['scarcity', 'victim'],
    dominantAtBands: [0, 1, 2],
    dissolvedBy: ['breath', 'body'],
    dissolution:
      'Heat, not insight: pranayama and mula bandha. The knot is somatic, so the solvent is somatic — breath that reaches the base of the spine and signals the dorsal vagal complex that the emergency is over.',
    source: 'Hatha Yoga Pradipika 4.70–76 — dissolved by the heat of pranayama, letting prana enter Sushumna.',
  },
  {
    id: 'vishnu',
    name: 'Vishnu Granthi',
    knotOf: 'Emotional attachment and the desire to be loved, significant, psychically special.',
    chakra: 'anahata',
    dimension: 'emotion',
    feltSense:
      'The heart keeps a ledger. Love is something to be earned and defended; praise is food; rejection is physical. Even after the body is safe, the self remains a petition.',
    tightensFamilies: ['validation', 'savior'],
    dominantAtBands: [2, 3, 4],
    dissolvedBy: ['emotional-healing', 'bhakti'],
    dissolution:
      'Vagal re-opening: bhramari (humming), heartbeat counting without checking the pulse, and devotion that asks for nothing. The knot loosens when the heart is felt instead of managed.',
    source: 'Hatha Yoga Pradipika 4.70–76 — preserves the individual ego-personality at the Anahata centre.',
  },
  {
    id: 'rudra',
    name: 'Rudra Granthi',
    knotOf: 'The intellect and the siddhis — the final attachment to being the one who knows.',
    chakra: 'ajna',
    dimension: 'thought',
    feltSense:
      'The observer becomes an identity. Insight is collected instead of lived; maps are mistaken for territory; the witness quietly enjoys being the witness.',
    tightensFamilies: ['perfectionism', 'spiritual-bypass'],
    dominantAtBands: [4, 5, 6],
    dissolvedBy: ['self-inquiry', 'witnessing'],
    dissolution:
      'Stillness over accumulation: shambhavi with third-person self-talk ("Samir is experiencing tiredness"), and inquiry that ends the knower rather than feeding it.',
    source: 'Shiva Samhita — while this knot persists, the practitioner remains divided from the absolute.',
  },
];

export function getGranthiById(id: string): Granthi | undefined {
  return GRANTHIS.find(g => g.id === id);
}
