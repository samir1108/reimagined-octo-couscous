// Quality gate for deep concepts.
//
// The gate is the contract: a record that fails any check never reaches a batch,
// and the test suite fails instead of shipping weaker knowledge.

import type { DeepConcept } from '@/types/knowledgeConcept';
import {
  DEEP_CONCEPT_MIN_CITATIONS,
  DEEP_CONCEPT_MIN_CONFIDENCE,
  DEEP_CONCEPT_MIN_MECHANISM_STEPS,
  DEEP_CONCEPT_MIN_SIGNS,
} from '@/types/knowledgeConcept';
import { BANNED_MEDICAL_TERMS } from '@/lib/knowledge/types';

export interface DeepConceptValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function allText(concept: DeepConcept): string {
  return [
    concept.name,
    concept.definition,
    concept.mechanism.join(' '),
    concept.whyItHappens,
    concept.signs.join(' '),
    concept.counterExample,
    concept.practice.name,
    concept.practice.dose,
    concept.practice.instructions,
    concept.measure,
    concept.caution ?? '',
    concept.citations.map((c) => c.label).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export function validateDeepConcept(concept: DeepConcept): DeepConceptValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!concept.id.startsWith('deep:')) errors.push(`${concept.id}: id must start with "deep:"`);
  if (!concept.name.trim()) errors.push(`${concept.id}: name required`);
  if (concept.definition.trim().length < 60) errors.push(`${concept.id}: definition too short`);
  if (concept.mechanism.length < DEEP_CONCEPT_MIN_MECHANISM_STEPS) {
    errors.push(`${concept.id}: needs >= ${DEEP_CONCEPT_MIN_MECHANISM_STEPS} mechanism steps`);
  }
  if (concept.signs.length < DEEP_CONCEPT_MIN_SIGNS) {
    errors.push(`${concept.id}: needs >= ${DEEP_CONCEPT_MIN_SIGNS} signs`);
  }
  if (concept.citations.length < DEEP_CONCEPT_MIN_CITATIONS) {
    errors.push(`${concept.id}: needs >= ${DEEP_CONCEPT_MIN_CITATIONS} citation`);
  }
  if (!concept.whyItHappens.trim()) errors.push(`${concept.id}: whyItHappens required`);
  if (!concept.counterExample.trim()) errors.push(`${concept.id}: counterExample required`);
  if (!concept.measure.trim()) errors.push(`${concept.id}: measure required`);
  if (!concept.practice.dose.trim()) errors.push(`${concept.id}: practice dose required`);
  if (concept.confidence < DEEP_CONCEPT_MIN_CONFIDENCE) {
    errors.push(`${concept.id}: confidence below ${DEEP_CONCEPT_MIN_CONFIDENCE}`);
  }
  if (concept.bandFit.min > concept.bandFit.max) errors.push(`${concept.id}: bandFit min > max`);
  if (concept.relations.length === 0) warnings.push(`${concept.id}: no relations`);

  const text = allText(concept);
  for (const term of BANNED_MEDICAL_TERMS) {
    // Word-boundary match: "retreat" or "treat each item" must not trip a
    // medical-claim gate, but a stand-alone "treat" claim must.
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) errors.push(`${concept.id}: contains medical claim term "${term}"`);
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function validateDeepConcepts(concepts: DeepConcept[]): DeepConceptValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const concept of concepts) {
    if (seen.has(concept.id)) errors.push(`${concept.id}: duplicate id`);
    seen.add(concept.id);
    const result = validateDeepConcept(concept);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  const ids = new Set(concepts.map((c) => c.id));
  for (const concept of concepts) {
    for (const relation of concept.relations) {
      if (relation.target.startsWith('deep:') && !ids.has(relation.target)) {
        warnings.push(`${concept.id}: relation target ${relation.target} not in the deep set`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
