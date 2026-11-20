// Deep concept contract — Phase 1 of the world-class knowledge base.
//
// A "deep concept" is the unit that carries explanation, not just a label.
// Every record must answer: what is it, how does it work, why does it happen,
// how do I recognise it, what is it NOT, what do I do, and how do I know it
// changed. Anything that cannot answer all of those stays out of the corpus.

import type { KnowledgeDomain, KnowledgeEdgeType } from './knowledgeGraph';

export type DeepConceptFamily =
  | 'mechanism'
  | 'blocker'
  | 'physiology'
  | 'practice_variant'
  | 'myth'
  | 'measurement'
  | 'band_map';

export type DeepCitationKind = 'text' | 'research' | 'tradition' | 'product';

export interface DeepCitation {
  label: string;
  kind: DeepCitationKind;
  url?: string;
  note?: string;
}

export interface DeepRelation {
  type: KnowledgeEdgeType;
  /** `deep:<slug>` for another deep concept, or a raw kb id. */
  target: string;
  note?: string;
}

export interface DeepPractice {
  name: string;
  /** Concrete dose: "3 min, twice daily, for 14 days". */
  dose: string;
  instructions: string;
}

export type DeepReviewStatus = 'draft' | 'reviewed' | 'verified';

export interface DeepConcept {
  /** Stable slug, becomes kb::deep::<slug>. */
  id: string;
  name: string;
  family: DeepConceptFamily;
  domain: KnowledgeDomain;
  /** One precise sentence. Shown on cards. */
  definition: string;
  /** Ordered causal steps. Minimum 3. */
  mechanism: string[];
  /** Root cause in plain language, tied to the mechanism. */
  whyItHappens: string;
  /** Observable markers, minimum 3. */
  signs: string[];
  /** What this concept is commonly mistaken for. */
  counterExample: string;
  practice: DeepPractice;
  /** How the reader can tell it changed. */
  measure: string;
  citations: DeepCitation[];
  relations: DeepRelation[];
  bandFit: { min: number; max: number; note?: string };
  caution?: string;
  confidence: number;
  reviewStatus: DeepReviewStatus;
  aliases: string[];
}

export const DEEP_CONCEPT_MIN_MECHANISM_STEPS = 3;
export const DEEP_CONCEPT_MIN_SIGNS = 3;
export const DEEP_CONCEPT_MIN_CITATIONS = 1;
export const DEEP_CONCEPT_MIN_CONFIDENCE = 0.6;

export const DEEP_CONCEPT_FAMILY_NODE_TYPE: Record<
  DeepConceptFamily,
  'concept' | 'theory' | 'body-system' | 'practice' | 'claim' | 'assessment' | 'model' | 'challenge'
> = {
  mechanism: 'theory',
  blocker: 'challenge',
  physiology: 'body-system',
  practice_variant: 'practice',
  myth: 'claim',
  measurement: 'assessment',
  band_map: 'model',
};
