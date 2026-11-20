/**
 * UPDATE — one outcome, one layer, one honest delta.
 * ─────────────────────────────────────────────────
 * Every completed (or abandoned) sitting writes evidence back into the model.
 * Deltas are small on purpose: one session moves a layer, it does not transform
 * a person in a day.
 */

import { summarizeLayers, finalizeLayer, trajectoryFromDelta } from "./build";
import { CONCEPT_LAYER, type HumanLayerId, type HumanModel } from "./types";

export interface OutcomeInput {
  concept?: string;
  layer?: HumanLayerId;
  completed?: boolean;
  qualityScore?: number;
  feltShift?: "lighter" | "same" | "heavier";
  note?: string;
  at?: string;
}

export function applyOutcome(model: HumanModel, outcome: OutcomeInput): HumanModel {
  const layerId =
    outcome.layer ??
    (outcome.concept ? CONCEPT_LAYER[outcome.concept] : undefined) ??
    "thought";
  const layer = model.layers[layerId];
  const at = outcome.at ?? new Date().toISOString();

  let delta = outcome.completed === false ? -0.02 : 0.02;
  if (outcome.feltShift === "lighter") delta += 0.03;
  else if (outcome.feltShift === "heavier") delta -= 0.02;
  if (typeof outcome.qualityScore === "number") {
    if (outcome.qualityScore >= 0.8) delta += 0.02;
    else if (outcome.qualityScore < 0.4) delta -= 0.01;
  }
  delta = Math.max(-0.05, Math.min(0.06, delta));

  const nextState = Math.max(0, Math.min(1, layer.state + delta));
  const next = finalizeLayer({
    ...layer,
    state: nextState,
    confidence: Math.min(0.9, layer.confidence + 0.04),
    trajectory: trajectoryFromDelta(delta),
    evidence: [
      ...layer.evidence,
      {
        layer: layerId,
        signal: outcome.note ?? `session:${outcome.concept ?? layerId}`,
        value: nextState,
        source: "session",
        at,
        confidence: 0.6,
      },
    ],
  });

  const layers = { ...model.layers, [layerId]: next };

  return {
    ...model,
    version: model.version + 1,
    builtAt: at,
    layers,
    summary: summarizeLayers(layers),
  };
}

export function applyOutcomes(model: HumanModel, outcomes: OutcomeInput[]): HumanModel {
  return outcomes.reduce((acc, outcome) => applyOutcome(acc, outcome), model);
}
