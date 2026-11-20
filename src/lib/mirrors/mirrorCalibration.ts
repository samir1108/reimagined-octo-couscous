/**
 * MIRROR CALIBRATION — the bridge from a completed mirror to the engine.
 *
 * A mirror reading is only useful if it changes something. This module turns
 * the `calibration` block authored on each result type into the three things
 * the consciousness engine actually consumes:
 *
 *   1. `DimensionSignal[]`   → fed to `dimensionTracker.applySignals`, which
 *                              moves the 6 banded dimensions and therefore
 *                              the V-Level.
 *   2. `practiceLevels`      → nudges a practice up or down a level.
 *   3. `practiceBias`        → an additive bonus inside `getNextPractice`, so
 *                              a mirror can win a recommendation without
 *                              overriding the weaker-core / anchor-path rules.
 *
 * ── Recency ─────────────────────────────────────────────────────────────
 * Calibration aggregates across the WHOLE history, not just the latest
 * reading, and older mirrors decay. A reading from mirror 3 should still
 * count, but a reading from mirror 94 should count several times more. Without
 * this the engine ends up averaging 100 mirrors into mush.
 *
 * ── Decay ───────────────────────────────────────────────────────────────
 * A mirror half a journey back carries weight `0.5^0.5 ≈ 0.71`. One from the
 * far end of the journey carries almost nothing. The curve is deliberate:
 * early mirrors are about landing, late mirrors are about the current shape.
 */

import type { DimensionId } from '@/types/consciousness';
import type { PracticeId } from '@/types/practices';
import type { DimensionSignal } from '@/lib/consciousness/dimensionTracker';
import type { MirrorBank } from '@/data/mirrors/types';
import type { MirrorHistoryEntry, MirrorBand } from './adaptiveEngine';

// ─── Shapes ───

export interface DomainStress {
  domain: string;
  practiceId: PracticeId;
}

export interface MirrorCalibration {
  /** The reading this calibration came from. */
  slug: string;
  mirrorNumber: number;
  primaryId: string;
  band: MirrorBand;
  signals: DimensionSignal[];
  practiceLevels: Partial<Record<PracticeId, number>>;
  practiceBias: Partial<Record<PracticeId, number>>;
  domainStress: DomainStress[];
  tags: string[];
  /** Recency weight applied, 0..1. 1 for the most recent reading. */
  weight: number;
}

/** The whole-journey picture, folded down to what the engine reads. */
export interface EngineCalibration {
  practiceLevels: Partial<Record<PracticeId, number>>;
  /** Additive bonuses keyed by practice id, summed across mirrors. */
  practiceBias: Partial<Record<PracticeId, number>>;
  domainStress: DomainStress[];
  tags: string[];
  /** Total recency weight behind the above — low means do not trust it yet. */
  totalWeight: number;
}

// ─── Decay ───

/** Recency weight of a reading `age` mirrors behind the latest. */
export function recencyWeight(age: number): number {
  if (age <= 0) return 1;
  return Math.pow(0.5, age / 20);
}

// ─── Single reading ───

/**
 * Turn one completed mirror into engine inputs.
 *
 * `confidence` is the adaptive engine's confidence in the reading. It scales
 * the whole calibration: an early thin reading nudges, a deep one moves.
 */
export function calibrateFromMirror(input: {
  bank: MirrorBank;
  history: MirrorHistoryEntry[];
  entry: MirrorHistoryEntry;
  confidence: number;
  band: MirrorBand;
}): MirrorCalibration {
  const { bank, history, entry, confidence, band } = input;

  const latest = history.length ? history[history.length - 1].mirrorNumber : entry.mirrorNumber;
  const weight = recencyWeight(Math.max(0, latest - entry.mirrorNumber));

  const result = bank.resultTypes.find((r) => r.id === entry.primaryId);
  const cal = result?.calibration;

  // Scale every nudge by confidence × recency, so a low-confidence reading
  // taken 40 mirrors ago contributes almost nothing.
  const gain = confidence * weight;
  const timestamp = entry.completedAt || new Date().toISOString();

  const signals: DimensionSignal[] = [];
  const practiceLevels: Partial<Record<PracticeId, number>> = {};
  const practiceBias: Partial<Record<PracticeId, number>> = {};
  const domainStress: DomainStress[] = [];

  for (const [dim, value] of Object.entries(cal?.dimensions ?? {})) {
    const id = dim as DimensionId;
    // Dimension bands are 0..7 (0..10 for spirit). A full-strength nudge is
    // worth about a third of a band, which is roughly one strong session.
    signals.push({
      dimension: id,
      delta: round3(value * 0.34 * gain),
      confidence: round3(0.5 + confidence * 0.4),
      source: 'assessment',
      sourceId: bank.slug,
      timestamp,
    });
  }

  for (const [practice, value] of Object.entries(cal?.practiceLevels ?? {})) {
    practiceLevels[practice as PracticeId] = round1(value * gain);
  }

  for (const [practice, value] of Object.entries(cal?.practiceBias ?? {})) {
    practiceBias[practice as PracticeId] = round1(value * gain);
  }

  for (const [domain, practice] of Object.entries(cal?.domainStress ?? {})) {
    domainStress.push({ domain, practiceId: practice as PracticeId });
  }

  return {
    slug: bank.slug,
    mirrorNumber: entry.mirrorNumber,
    primaryId: entry.primaryId,
    band,
    signals,
    practiceLevels,
    practiceBias,
    domainStress,
    tags: cal?.tags ?? [],
    weight: round3(weight),
  };
}

// ─── Whole journey ───

/**
 * Fold the entire mirror history into a single calibration.
 *
 * This is the function the engine calls when it assembles its context — it
 * answers "what has the whole set of mirrors together been saying?", which is
 * a different and more useful question than any single reading.
 */
export function aggregateCalibration(
  history: MirrorHistoryEntry[],
  banksBySlug: Map<string, MirrorBank>,
): EngineCalibration {
  const practiceLevels: Partial<Record<PracticeId, number>> = {};
  const practiceBias: Partial<Record<PracticeId, number>> = {};
  const domainStress: DomainStress[] = [];
  const tagCounts = new Map<string, number>();
  let totalWeight = 0;

  for (const entry of history) {
    const bank = banksBySlug.get(entry.slug);
    if (!bank) continue;

    const cal = calibrateFromMirror({
      bank,
      history,
      entry,
      confidence: entry.confidence,
      band: entry.band,
    });
    if (cal.weight <= 0.01) continue;

    totalWeight += cal.weight;

    for (const [id, value] of Object.entries(cal.practiceLevels)) {
      const key = id as PracticeId;
      practiceLevels[key] = round1((practiceLevels[key] ?? 0) + value);
    }
    for (const [id, value] of Object.entries(cal.practiceBias)) {
      const key = id as PracticeId;
      practiceBias[key] = round1((practiceBias[key] ?? 0) + value);
    }
    for (const stress of cal.domainStress) {
      if (!domainStress.some((d) => d.domain === stress.domain)) {
        domainStress.push(stress);
      }
    }
    for (const tag of cal.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + cal.weight);
    }
  }

  // Level nudges accumulate, then get normalised so 30 mirrors of a weak
  // signal cannot push a practice three levels up on their own.
  for (const [id, value] of Object.entries(practiceLevels)) {
    practiceLevels[id as PracticeId] = round1(Math.min(2, value * 0.6));
  }

  return {
    practiceLevels,
    practiceBias,
    domainStress,
    tags: [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag),
    totalWeight: round3(totalWeight),
  };
}

/**
 * Confidence that the aggregated picture is worth acting on.
 * Rises with total recency weight and plateaus — a handful of mirrors is a
 * starting point, not a constellation.
 */
export function calibrationConfidence(totalWeight: number): number {
  if (totalWeight <= 0) return 0;
  return round3(Math.min(1, totalWeight / 8));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
