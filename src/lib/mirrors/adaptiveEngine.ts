/**
 * ADAPTIVE MIRROR ENGINE
 *
 * Decides how deep a mirror should go for THIS user, on THIS attempt, and
 * which questions to actually ask. This is the piece that replaces a static
 * question set: the same mirror asks different things depending on what the
 * user has already answered elsewhere in the journey.
 *
 * ── How depth is chosen ─────────────────────────────────────────────────
 * Three tiers, gated by confidence rather than by mirror number alone:
 *
 *   surface  — situational, external, low ego risk
 *   deep     — names the mechanism
 *   core     — names the structure, turns the lens inward
 *
 * A user with low cumulative confidence stays on `surface` for longer, because
 * deeper phrasing lands badly when the reading underneath it is still thin.
 * A user who has re-taken a mirror and landed on the same primary result twice
 * is escalated — agreement is the signal that they can hold more.
 *
 * ── How questions are pruned ────────────────────────────────────────────
 * If a sub-score has been answered to the same ceiling three or more times,
 * asking again adds nothing. Those questions are dropped and the savings are
 * spent on dimensions the user has never actually been measured on. A floor of
 * MIN_QUESTIONS is always kept so a reading stays trustworthy.
 *
 * ── Bands ───────────────────────────────────────────────────────────────
 * `preliminary` — first reading, thin evidence behind it
 * `inferred`    — carried by adjacent mirrors more than by this one
 * `read`        — directly read from this mirror's own answers, at depth
 * `locked`      — not yet taken
 */

import type { MirrorBank, MirrorQuestion, MirrorTier } from '@/data/mirrors/types';
import { promptFor, questionMeasures } from '@/data/mirrors/types';

// ─── History ───

export interface MirrorHistoryEntry {
  slug: string;
  /** 1..100 checkpoint number the attempt belonged to. */
  mirrorNumber: number;
  completedAt: string;
  primaryId: string;
  /** Sub-score percentage per bank dimension, 0..100. */
  percentages: Record<string, number>;
  /** 0..1 confidence the engine assigned to that reading. */
  confidence: number;
  /** Band the engine assigned when the reading was taken. */
  band: MirrorBand;
  tags: string[];
}

export type MirrorBand = 'preliminary' | 'inferred' | 'read' | 'locked';

// ─── Tuning ───

export const ADAPTIVE = {
  /** Never ask fewer than this many questions in a mirror. */
  MIN_QUESTIONS: 5,
  /** A dimension measured this many times is considered covered. */
  SATURATION_SAMPLES: 3,
  /** Percentage at or above which a dimension counts as saturated. */
  SATURATION_CEILING: 82,
  /** Cumulative confidence needed before `deep` unlocks. */
  DEEP_THRESHOLD: 0.34,
  /** Cumulative confidence needed before `core` unlocks. */
  CORE_THRESHOLD: 0.66,
  /** Attempts of the same mirror needed before escalation is considered. */
  ESCALATION_ATTEMPTS: 2,
  /** Agreement required across those attempts before escalating. */
  ESCALATION_AGREEMENT: 0.9,
} as const;

// ─── Planning ───

export interface PrunedQuestion {
  id: string;
  reason: 'saturated' | 'duplicate';
}

export interface AdaptivePlan {
  tier: MirrorTier;
  /** Questions to ask, in the order they should be asked. */
  questions: MirrorQuestion[];
  /** What was dropped and why — surfaced in the reveal so the drop is honest. */
  pruned: PrunedQuestion[];
  /** Predicted confidence in the resulting reading, 0..1. */
  confidence: number;
  band: MirrorBand;
  /** One line, for the mirror intro. No diagnosis, no labels. */
  rationale: string;
}

/** Questions the user has effectively already answered, by sub-score key. */
function saturatedDimensions(history: MirrorHistoryEntry[], bank: MirrorBank): Set<string> {
  const peaks = new Map<string, { count: number; best: number }>();
  for (const entry of history) {
    for (const [key, pct] of Object.entries(entry.percentages ?? {})) {
      if (!bank.dimensions.includes(key)) continue;
      const prev = peaks.get(key) ?? { count: 0, best: 0 };
      peaks.set(key, { count: prev.count + 1, best: Math.max(prev.best, pct) });
    }
  }
  const saturated = new Set<string>();
  peaks.forEach(({ count, best }, key) => {
    if (count >= ADAPTIVE.SATURATION_SAMPLES && best >= ADAPTIVE.SATURATION_CEILING) {
      saturated.add(key);
    }
  });
  return saturated;
}

/** How often a given slug has been read, and whether the reads agree. */
function agreementFor(history: MirrorHistoryEntry[], slug: string): {
  attempts: number;
  agreement: number;
} {
  const attempts = history.filter((h) => h.slug === slug);
  if (attempts.length === 0) return { attempts: 0, agreement: 0 };
  const top = attempts.filter((a) => a.primaryId === attempts[0].primaryId).length;
  return { attempts: attempts.length, agreement: top / attempts.length };
}

/** Mean confidence across the whole journey — the gate for tier depth. */
export function cumulativeConfidence(history: MirrorHistoryEntry[]): number {
  if (history.length === 0) return 0;
  const sum = history.reduce((acc, h) => acc + (h.confidence ?? 0), 0);
  return sum / history.length;
}

/**
 * Choose the depth tier for this attempt.
 * Escalation is earned by repeating a mirror and landing on the same reading
 * with high confidence — agreement, not mirror count, is what unlocks depth.
 */
export function chooseTier(
  history: MirrorHistoryEntry[],
  bank: MirrorBank,
): { tier: MirrorTier; reason: string } {
  const base = cumulativeConfidence(history);
  const { attempts, agreement } = agreementFor(history, bank.slug);

  const escalating =
    attempts >= ADAPTIVE.ESCALATION_ATTEMPTS && agreement >= ADAPTIVE.ESCALATION_AGREEMENT;

  if (escalating) {
    if (attempts >= ADAPTIVE.ESCALATION_ATTEMPTS + 1) {
      return {
        tier: 'core',
        reason:
          'You have read this mirror more than once and landed in the same place. It is asking a harder question now.',
      };
    }
    return {
      tier: 'deep',
      reason:
        'The last two readings of this mirror agreed. It is going a layer further than last time.',
    };
  }

  if (base >= ADAPTIVE.CORE_THRESHOLD && history.length >= 12) {
    return {
      tier: 'core',
      reason: 'You have enough behind you now to be asked this directly.',
    };
  }

  if (base >= ADAPTIVE.DEEP_THRESHOLD && history.length >= 4) {
    return {
      tier: 'deep',
      reason: 'A little more of the picture is settled, so this can go one layer deeper.',
    };
  }

  if (history.length === 0) {
    return { tier: 'surface', reason: 'Starting with the surface. The rest comes later.' };
  }

  return {
    tier: 'surface',
    reason: 'Kept simple for now. It will ask for more once there is more underneath it.',
  };
}

/** Dimensions the user has genuinely never been measured on, worst-covered first. */
function uncoveredFirst(
  bank: MirrorBank,
  history: MirrorHistoryEntry[],
): string[] {
  const covered = new Map<string, number>();
  for (const entry of history) {
    for (const key of Object.keys(entry.percentages ?? {})) {
      if (bank.dimensions.includes(key)) {
        covered.set(key, (covered.get(key) ?? 0) + 1);
      }
    }
  }
  return [...bank.dimensions]
    .map((d) => ({ d, samples: covered.get(d) ?? 0 }))
    .sort((a, b) => a.samples - b.samples || a.d.localeCompare(b.d))
    .map((x) => x.d);
}

/**
 * Build the full plan: tier, the questions to ask, and the band this reading
 * will land in.
 */
export function planMirror(
  bank: MirrorBank,
  history: MirrorHistoryEntry[],
): AdaptivePlan {
  const { tier, reason } = chooseTier(history, bank);
  const saturated = saturatedDimensions(history, bank);

  // Drop questions whose measured dimension is already pinned, but never go
  // under MIN_QUESTIONS — a reading that is too thin is worse than a repeat.
  const room = Math.max(0, bank.questions.length - ADAPTIVE.MIN_QUESTIONS);
  const dropped = new Set<string>();
  const pruned: PrunedQuestion[] = [];

  for (const question of bank.questions) {
    if (dropped.size >= room) break;
    // The measured dimension is derived from the option weights, not from
    // `question.domain` — that field is the display sub-theme.
    if (saturated.has(questionMeasures(question, bank.dimensions))) {
      dropped.add(question.id);
      pruned.push({ id: question.id, reason: 'saturated' });
    }
  }

  const kept = bank.questions.filter((q) => !dropped.has(q.id));

  // Order by least-covered dimension so the savings buy new information.
  const priority = uncoveredFirst(bank, history);
  const ordered = [...kept].sort((a, b) => {
    const pa = priority.indexOf(a.domain);
    const pb = priority.indexOf(b.domain);
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id);
  });

  const depthBonus = tier === 'core' ? 0.18 : tier === 'deep' ? 0.09 : 0;
  const coverageBonus = Math.min(0.2, ordered.length / bank.questions.length / 2);
  const confidence = clamp01(
    0.28 + depthBonus + coverageBonus + Math.min(cumulativeConfidence(history), 0.4),
  );

  return {
    tier,
    questions: ordered,
    pruned,
    confidence,
    band: bandFor(confidence, history.length, pruned.length),
    rationale: reason,
  };
}

/** Which band a reading of this confidence, history size and pruning lands in. */
export function bandFor(
  confidence: number,
  historyLength: number,
  prunedCount = 0,
): MirrorBand {
  if (historyLength === 0) return 'preliminary';
  if (confidence >= 0.62) return 'read';
  if (confidence >= 0.42 || historyLength >= 6) return 'inferred';
  if (prunedCount > 0 || historyLength >= 2) return 'preliminary';
  return 'inferred';
}

// ─── Scoring ───

export interface AdaptiveScore {
  /** Raw weighted totals per sub-score key. */
  rawScores: Record<string, number>;
  /** Normalised 0..100 per sub-score key. */
  percentages: Record<string, number>;
  primaryId: string;
  secondaryId: string;
  /** Fraction of the available weight the user actually engaged with. */
  completion: number;
  /** Every dimension the answers gave zero signal to. */
  silentDimensions: string[];
}

/**
 * Score a completed mirror. Mirrors `lib/library/scoring.ts` so the registry
 * and the DB agree on how a result is derived, but additionally reports which
 * dimensions went unanswered — a silent dimension is information.
 */
export function scoreMirror(
  bank: MirrorBank,
  questions: MirrorQuestion[],
  answers: Record<string, string>,
): AdaptiveScore {
  const raw: Record<string, number> = {};
  for (const d of bank.dimensions) raw[d] = 0;

  let available = 0;
  let engaged = 0;

  for (const question of questions) {
    const answer = answers[question.id];
    available += 1;
    if (!answer) continue;
    const option = question.options.find((o) => o.value === answer);
    if (!option) continue;
    engaged += 1;
    for (const [key, weight] of Object.entries(option.weights)) {
      raw[key] = (raw[key] ?? 0) + weight;
    }
  }

  const total = Object.values(raw).reduce((s, v) => s + v, 0) || 1;
  const percentages: Record<string, number> = {};
  const silentDimensions: string[] = [];
  for (const d of bank.dimensions) {
    percentages[d] = Math.round(((raw[d] ?? 0) / total) * 100);
    if (!raw[d]) silentDimensions.push(d);
  }

  const ranked = [...bank.dimensions].sort((a, b) => (raw[b] ?? 0) - (raw[a] ?? 0));

  return {
    rawScores: raw,
    percentages,
    primaryId: ranked[0],
    secondaryId: ranked[1] ?? ranked[0],
    completion: available ? engaged / available : 0,
    silentDimensions,
  };
}

// ─── Presentation ───

/** The prompt text for a question at the planned tier. */
export function questionPrompt(question: MirrorQuestion, tier: MirrorTier): string {
  return promptFor(question, tier);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
