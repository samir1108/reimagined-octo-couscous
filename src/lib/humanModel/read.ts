/**
 * READ — build the model from what the app already knows.
 * ─────────────────────────────────────────────────────
 * Reuses the need engine's evidence reader (knowledge nodes, sessions, loops,
 * constellation, consciousness profile) so there is one collection path.
 */

import { readNeedSignals } from "@/lib/needEngine";
import { buildHumanModel } from "./build";
import { loadHumanModelSnapshot, saveHumanModelSnapshot } from "./snapshot";
import type { HumanModel } from "./types";

export interface ReadHumanModelOptions {
  now?: Date;
  /** Rebuild from raw signals, discarding session deltas. */
  force?: boolean;
}

export async function readHumanModel(
  userId: string | null | undefined,
  opts: ReadHumanModelOptions = {},
): Promise<HumanModel> {
  if (!userId) {
    return buildHumanModel({ userId: "anonymous", now: opts.now });
  }

  if (!opts.force) {
    const snapshot = await loadHumanModelSnapshot(userId);
    if (snapshot) return snapshot;
  }

  const signals = await readNeedSignals(userId);
  const sessionCount = Object.values(signals.concepts).reduce(
    (sum, evidence) => sum + evidence.exposureCount,
    0,
  );
  const derivedLevels = Object.fromEntries(
    Object.entries(signals.concepts).map(([concept, evidence]) => [
      concept,
      Math.round(evidence.familiarity * 5),
    ]),
  );

  const model = buildHumanModel({
    userId,
    dimensionBands: signals.dimensionBands,
    overallBand: signals.overallBand,
    capabilityLevels: { ...derivedLevels, ...signals.capabilityLevels },
    activeLoops: signals.activeLoops,
    sessionCount,
    now: opts.now,
  });

  await saveHumanModelSnapshot(model);
  return model;
}
