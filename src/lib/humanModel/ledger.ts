/**
 * LEDGER — one outcome, two ledgers.
 * ─────────────────────────────────
 * A real sitting updates the Human Model (state + evidence) and, when it
 * belongs to an arc, the arc progress. Both writes are best-effort; the UI
 * never waits on them.
 */

import { applyOutcome } from "./update";
import { readHumanModel } from "./read";
import { saveHumanModelSnapshot } from "./snapshot";
import type { HumanModel, HumanLayerId } from "./types";
import { recordArcSit } from "@/lib/arcs";

export interface SessionOutcomeRecord {
  userId: string;
  concept?: string;
  layer?: HumanLayerId;
  completed?: boolean;
  /** Accepts 0..1 or 0..100; normalised here. */
  qualityScore?: number;
  feltShift?: "lighter" | "same" | "heavier";
  arcId?: string;
  sitIndex?: number;
  note?: string;
}

export function normalizeQualityScore(score: number | undefined): number | undefined {
  if (typeof score !== "number" || !Number.isFinite(score)) return undefined;
  const normalised = score > 1 ? score / 100 : score;
  return Math.max(0, Math.min(1, normalised));
}

export function applySessionToModel(model: HumanModel, input: SessionOutcomeRecord): HumanModel {
  return applyOutcome(model, {
    concept: input.concept,
    layer: input.layer,
    completed: input.completed,
    qualityScore: normalizeQualityScore(input.qualityScore),
    feltShift: input.feltShift,
    note: input.note,
  });
}

export async function recordSessionToHumanModel(
  input: SessionOutcomeRecord,
): Promise<HumanModel | null> {
  if (!input.userId) return null;
  try {
    const model = await readHumanModel(input.userId);
    const next = applySessionToModel(model, input);
    await saveHumanModelSnapshot(next);

    if (input.arcId && typeof input.sitIndex === "number") {
      await recordArcSit({
        userId: input.userId,
        arcId: input.arcId,
        sitIndex: input.sitIndex,
        quality: normalizeQualityScore(input.qualityScore),
        feltShift: input.feltShift,
        evidence: { concept: input.concept ?? null },
      });
    }

    return next;
  } catch {
    return null;
  }
}
