import { describe, it, expect } from 'vitest';
import {
  ADAPTIVE,
  chooseTier,
  planMirror,
  scoreMirror,
  cumulativeConfidence,
  bandFor,
  type MirrorHistoryEntry,
} from '@/lib/mirrors/adaptiveEngine';
import { WELCOME_BANKS } from '@/data/mirrors/welcome';
import { getBank } from '@/data/mirrors/registry';
import { buildMirrorInsight } from '@/lib/mirrors/insightBuilder';
import { getMirrorByNumber } from '@/data/pre-journey/mirrors';
import type { MirrorBank } from '@/data/mirrors/types';

/**
 * The adaptive loop is the part of this system with real logic in it, so it
 * gets tested against the three properties the design depends on:
 *
 *   1. A first-time user is never asked the deep phrasing.
 *   2. Depth is earned by agreement, not by mirror count alone.
 *   3. Already-covered dimensions stop consuming questions.
 *
 * Plus the scoring invariants, because a bug there silently corrupts every
 * reading and every calibration downstream.
 */

// Use the registry bank, not the raw module export. The registry is the only
// place normaliseBank() runs, and scoring reads the normalised weights — going
// straight to WELCOME_BANKS would score against stray keys the registry strips.
const BANK = getBank('life-season')!;
const BANK_SLUG = BANK.slug;

function entry(over: Partial<MirrorHistoryEntry> = {}): MirrorHistoryEntry {
  return {
    slug: 'some-other-mirror',
    mirrorNumber: 1,
    completedAt: new Date(2026, 0, 1).toISOString(),
    primaryId: 'x',
    percentages: {},
    confidence: 0.5,
    band: 'inferred',
    tags: [],
    ...over,
  };
}

/** n history entries all measuring one dimension of BANK at the ceiling. */
function saturating(n: number, dimension: string): MirrorHistoryEntry[] {
  const percentages: Record<string, number> = {};
  for (const d of BANK.dimensions) percentages[d] = d === dimension ? 95 : 5;
  return Array.from({ length: n }, (_, i) =>
    entry({
      slug: `filler-${i}`,
      mirrorNumber: i + 1,
      percentages,
      primaryId: dimension,
    }),
  );
}

describe('chooseTier', () => {
  it('keeps a first-time user at the surface', () => {
    const { tier } = chooseTier([], BANK);
    expect(tier).toBe('surface');
  });

  it('does not escalate on a long history of low confidence', () => {
    // Twenty mirrors, none of them this bank, all thin. Length must not buy
    // depth on its own — the gate is cumulative confidence, and a thin
    // history of readings does not produce it.
    const history = Array.from({ length: 20 }, (_, i) =>
      entry({ mirrorNumber: i + 1, confidence: 0.15, primaryId: 'emergence' }),
    );
    expect(cumulativeConfidence(history)).toBeLessThan(ADAPTIVE.DEEP_THRESHOLD);
    const { tier } = chooseTier(history, BANK);
    expect(tier).toBe('surface');
  });

  it('reaches core for a new mirror once the journey is well established', () => {
    // The flip side: a user deep in the journey SHOULD get the core phrasing
    // on a mirror they have never taken. Depth is meant to grow with the
    // journey, not only with re-takes.
    const history = Array.from({ length: 12 }, (_, i) =>
      entry({ mirrorNumber: i + 1, confidence: 0.9, primaryId: 'emergence' }),
    );
    expect(cumulativeConfidence(history)).toBeGreaterThan(ADAPTIVE.CORE_THRESHOLD);
    expect(chooseTier(history, BANK).tier).toBe('core');
  });

  it('escalates to deep when two attempts agree', () => {
    const history = [
      entry({ slug: BANK_SLUG, mirrorNumber: 5, primaryId: 'emergence', confidence: 0.8 }),
      entry({ slug: BANK_SLUG, mirrorNumber: 12, primaryId: 'emergence', confidence: 0.8 }),
    ];
    const { tier } = chooseTier(history, BANK);
    expect(tier).toBe('deep');
  });

  it('does not escalate when attempts disagree', () => {
    const history = [
      entry({ slug: BANK_SLUG, mirrorNumber: 5, primaryId: 'emergence', confidence: 0.8 }),
      entry({ slug: BANK_SLUG, mirrorNumber: 12, primaryId: 'dissolution', confidence: 0.8 }),
    ];
    const { tier } = chooseTier(history, BANK);
    expect(tier).toBe('surface');
  });

  it('reaches core only after repeated agreement', () => {
    const history = [
      entry({ slug: BANK_SLUG, mirrorNumber: 5, primaryId: 'emergence', confidence: 0.8 }),
      entry({ slug: BANK_SLUG, mirrorNumber: 12, primaryId: 'emergence', confidence: 0.8 }),
      entry({ slug: BANK_SLUG, mirrorNumber: 19, primaryId: 'emergence', confidence: 0.8 }),
    ];
    const { tier } = chooseTier(history, BANK);
    expect(tier).toBe('core');
  });
});

describe('planMirror', () => {
  it('asks every question when there is no history', () => {
    const plan = planMirror(BANK, []);
    expect(plan.questions).toHaveLength(BANK.questions.length);
    expect(plan.pruned).toHaveLength(0);
    expect(plan.band).toBe('preliminary');
  });

  it('never drops below the question floor', () => {
    // Saturate three of four dimensions, which would otherwise prune most of
    // the bank.
    const history = [
      ...saturating(4, BANK.dimensions[0]),
      ...saturating(4, BANK.dimensions[1]),
      ...saturating(4, BANK.dimensions[2]),
    ];
    const plan = planMirror(BANK, history);
    expect(plan.questions.length).toBeGreaterThanOrEqual(ADAPTIVE.MIN_QUESTIONS);
  });

  it('prunes a dimension that has been measured to the ceiling repeatedly', () => {
    const saturatedDim = BANK.dimensions[0];
    const history = saturating(ADAPTIVE.SATURATION_SAMPLES + 1, saturatedDim);
    const plan = planMirror(BANK, history);
    expect(plan.pruned.length).toBeGreaterThan(0);
    expect(plan.pruned.every((p) => p.reason === 'saturated')).toBe(true);
  });

  it('does not prune on fewer samples than the threshold', () => {
    const history = saturating(ADAPTIVE.SATURATION_SAMPLES - 1, BANK.dimensions[0]);
    const plan = planMirror(BANK, history);
    expect(plan.pruned).toHaveLength(0);
  });

  it('raises confidence with depth and coverage', () => {
    const shallow = planMirror(BANK, []);
    const deep = planMirror(BANK, saturating(4, BANK.dimensions[0]));
    expect(deep.confidence).toBeGreaterThan(shallow.confidence);
  });
});

describe('scoreMirror', () => {
  const answerAll = (pick: (domain: string) => number) => {
    const out: Record<string, string> = {};
    for (const question of BANK.questions) {
      out[question.id] = question.options[Math.min(pick(question.domain), question.options.length - 1)].value;
    }
    return out;
  };

  it('reports full completion when every question is answered', () => {
    const score = scoreMirror(BANK, BANK.questions, answerAll(() => 0));
    expect(score.completion).toBe(1);
  });

  it('reports partial completion and a lower ratio when questions are skipped', () => {
    const answers = answerAll(() => 0);
    delete answers[BANK.questions[0].id];
    const score = scoreMirror(BANK, BANK.questions, answers);
    expect(score.completion).toBeLessThan(1);
    expect(score.completion).toBeGreaterThan(0);
  });

  it('normalises percentages to roughly 100', () => {
    const score = scoreMirror(BANK, BANK.questions, answerAll(() => 0));
    const total = Object.values(score.percentages).reduce((s, v) => s + v, 0);
    expect(total).toBeGreaterThanOrEqual(95);
    expect(total).toBeLessThanOrEqual(105);
  });

  it('names the dimensions the answers said nothing about', () => {
    // A bank with one dimension that nothing can ever reach.
    const lopsided: MirrorBank = {
      ...BANK,
      dimensions: ['emergence', 'unreachable'],
      resultTypes: [
        ...BANK.resultTypes.filter((r) => r.id === 'emergence'),
        {
          id: 'unreachable',
          label: 'Unreachable',
          short: 'never',
          description: 'Never selected by any option in this bank.',
        },
      ],
    };
    const questions = lopsided.questions.slice(0, 2).map((question) => ({
      ...question,
      domain: 'emergence',
      options: [
        { label: 'a', value: 'a', weights: { emergence: 1 } },
        { label: 'b', value: 'b', weights: { emergence: 1 } },
      ],
    }));

    const answers: Record<string, string> = {};
    for (const question of questions) answers[question.id] = 'a';

    const score = scoreMirror(lopsided, questions, answers);
    expect(score.silentDimensions).toContain('unreachable');
    expect(score.percentages.unreachable).toBe(0);
  });

  it('picks the same primary as the highest sub-score', () => {
    const score = scoreMirror(BANK, BANK.questions, answerAll(() => 0));
    const best = Object.entries(score.percentages).sort((a, b) => b[1] - a[1])[0];
    expect(score.primaryId).toBe(best[0]);
  });
});

describe('bandFor', () => {
  it('reads as preliminary with no history at any confidence', () => {
    expect(bandFor(0.99, 0)).toBe('preliminary');
  });

  it('reaches read only above the confidence gate', () => {
    expect(bandFor(0.7, 20)).toBe('read');
    expect(bandFor(0.3, 20)).not.toBe('read');
  });
});

describe('buildMirrorInsight', () => {
  const checkpoint = getMirrorByNumber(4)!;

  it('produces a reading without a history', () => {
    const plan = planMirror(BANK, []);
    const answers: Record<string, string> = {};
    for (const question of plan.questions) {
      answers[question.id] = question.options[0].value;
    }
    const score = scoreMirror(BANK, plan.questions, answers);
    const insight = buildMirrorInsight({ checkpoint, bank: BANK, plan, score, history: [] });

    expect(insight.headline).toBeTruthy();
    expect(insight.reading).toBeTruthy();
    expect(insight.nextAction).toBeTruthy();
    expect(insight.confidenceNote).toMatch(/first reading/i);
    expect(insight.cards.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same answers', () => {
    const plan = planMirror(BANK, []);
    const answers: Record<string, string> = {};
    for (const question of plan.questions) {
      answers[question.id] = question.options[question.options.length - 1].value;
    }
    const score = scoreMirror(BANK, plan.questions, answers);

    const a = buildMirrorInsight({ checkpoint, bank: BANK, plan, score, history: [] });
    const b = buildMirrorInsight({ checkpoint, bank: BANK, plan, score, history: [] });
    expect(a).toEqual(b);
  });

  it('never labels the user in the reading', () => {
    const plan = planMirror(BANK, []);
    const answers: Record<string, string> = {};
    for (const question of plan.questions) {
      answers[question.id] = question.options[0].value;
    }
    const score = scoreMirror(BANK, plan.questions, answers);
    const insight = buildMirrorInsight({ checkpoint, bank: BANK, plan, score, history: [] });

    const text = [
      insight.headline,
      insight.reading,
      insight.nextAction,
      ...insight.cards.map((c) => `${c.title} ${c.body}`),
    ]
      .join(' ')
      .toLowerCase();

    // The app's voice rule from consciousness/agents/insightLayer.ts.
    expect(text).not.toMatch(/\byou are (a|an|the)\b/);
    expect(text).not.toMatch(/\byou will\b/);
    expect(text).not.toMatch(/\bdiagnosed\b|\bdisorder\b|\bdiagnos/);
  });

  it('reports the number of skipped questions honestly', () => {
    const history = saturating(ADAPTIVE.SATURATION_SAMPLES + 1, BANK.dimensions[0]);
    const plan = planMirror(BANK, history);
    const answers: Record<string, string> = {};
    for (const question of plan.questions) {
      answers[question.id] = question.options[0].value;
    }
    const score = scoreMirror(BANK, plan.questions, answers);
    const insight = buildMirrorInsight({ checkpoint, bank: BANK, plan, score, history });

    expect(insight.skippedForCoverage).toBe(plan.pruned.length);
  });
});

describe('registry', () => {
  it('has no structural issues', async () => {
    const { registryIssues } = await import('@/data/mirrors/registry');
    expect(registryIssues).toEqual([]);
  });

  it('resolves every checkpoint slug to a real bank', async () => {
    const { UNRESOLVED_SLUGS, CHECKPOINT_SLUGS, DB_RESIDENT_SLUGS } = await import(
      '@/data/mirrors/registry'
    );
    expect(CHECKPOINT_SLUGS).toHaveLength(93);
    expect(UNRESOLVED_SLUGS).toEqual([]);
    expect(DB_RESIDENT_SLUGS).toHaveLength(0);
  });
});

describe('scoring overrides', () => {
  it('every override names a real question and a declared dimension', async () => {
    const { SCORING_OVERRIDES } = await import('@/data/mirrors/types');
    const { MIRROR_BY_SLUG } = await import('@/data/mirrors/registry');
    for (const [key, override] of Object.entries(SCORING_OVERRIDES)) {
      const [slug, questionId] = key.split('/');
      const bank = MIRROR_BY_SLUG.get(slug);
      expect(bank, `${key} — no such bank`).toBeDefined();
      expect(
        bank!.questions.some((q) => q.id === questionId),
        `${key} — no such question`,
      ).toBe(true);
      if (override.dimension) {
        expect(
          bank!.dimensions,
          `${key} — dimension not declared`,
        ).toContain(override.dimension);
      }
      expect(
        override.reverse && override.dimension,
        `${key} — reverse and dimension are mutually exclusive`,
      ).toBeFalsy();
    }
  });

  it('pins a category question to exactly one dimension', async () => {
    const { MIRROR_BY_SLUG } = await import('@/data/mirrors/registry');
    const bank = MIRROR_BY_SLUG.get('trust-baseline')!;
    const question = bank.questions.find((q) => q.id === 'trust-earn')!;
    // Both ends of this scale are "closed" — a U-shape, not a line — so it is
    // pinned rather than projected. Every option must score the same dimension.
    for (const option of question.options) {
      expect(Object.keys(option.weights)).toEqual(['guarded']);
    }
  });

  it('reverses a continuum so its far end scores the first dimension', async () => {
    const { MIRROR_BY_SLUG } = await import('@/data/mirrors/registry');
    const bank = MIRROR_BY_SLUG.get('anger-signature')!;
    const question = bank.questions.find((q) => q.id === 'anger-inward')!;
    // "I am my own harshest critic" is the suppressed end, so with the list
    // flipped it must score the FIRST dimension at full weight.
    const first = question.options[0];
    expect(first.weights[bank.dimensions[0]]).toBe(1);
  });

  it('leaves no option in the library scoring nothing', async () => {
    const { MIRROR_BANKS } = await import('@/data/mirrors/registry');
    const dead: string[] = [];
    for (const bank of MIRROR_BANKS) {
      for (const question of bank.questions) {
        for (const option of question.options) {
          const keys = Object.keys(option.weights);
          if (keys.length === 0) {
            dead.push(`${bank.slug}/${question.id}:"${option.value}"`);
          } else {
            for (const key of keys) {
              if (!bank.dimensions.includes(key)) {
                dead.push(`${bank.slug}/${question.id} -> "${key}"`);
              }
            }
          }
        }
      }
    }
    expect(dead).toEqual([]);
  });
});
