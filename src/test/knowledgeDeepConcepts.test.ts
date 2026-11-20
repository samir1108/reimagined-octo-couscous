import { describe, expect, it } from 'vitest';
import { DEEP_CONCEPTS } from '@/data/knowledge/deepConcepts';
import { validateDeepConcept, validateDeepConcepts } from '@/lib/knowledge/deepConceptGate';

describe('deep concept gold set', () => {
  it('passes the quality gate', () => {
    const result = validateDeepConcepts(DEEP_CONCEPTS);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('carries explanation, not labels', () => {
    for (const concept of DEEP_CONCEPTS) {
      expect(concept.mechanism.length).toBeGreaterThanOrEqual(3);
      expect(concept.signs.length).toBeGreaterThanOrEqual(3);
      expect(concept.citations.length).toBeGreaterThanOrEqual(1);
      expect(concept.definition.length).toBeGreaterThan(60);
      expect(concept.counterExample.length).toBeGreaterThan(40);
      expect(concept.measure.length).toBeGreaterThan(20);
      expect(concept.practice.dose.length).toBeGreaterThan(5);
    }
  });

  it('has unique ids and resolvable relation targets', () => {
    const ids = new Set(DEEP_CONCEPTS.map((c) => c.id));
    expect(ids.size).toBe(DEEP_CONCEPTS.length);
    for (const concept of DEEP_CONCEPTS) {
      for (const relation of concept.relations) {
        if (relation.target.startsWith('deep:')) {
          expect(ids.has(relation.target)).toBe(true);
        } else {
          expect(relation.target.startsWith('kb::')).toBe(true);
        }
      }
    }
  });

  it('rejects a weak record', () => {
    const weak = {
      ...DEEP_CONCEPTS[0],
      id: 'deep:weak-record',
      mechanism: ['one step'],
      signs: ['one sign'],
      citations: [],
      confidence: 0.1,
    };
    const result = validateDeepConcept(weak);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('covers the seed questions from the brief', () => {
    const ids = new Set(DEEP_CONCEPTS.map((c) => c.id));
    for (const required of [
      'deep:sleeper-cannot-meditate',
      'deep:gut-brain-axis',
      'deep:dmn-overactivity',
      'deep:vagal-tone',
    ]) {
      expect(ids.has(required)).toBe(true);
    }
  });
});
