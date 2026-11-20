/**
 * TRAJECTORY — 1 / 3 / 10-year projections.
 * ────────────────────────────────────────
 * A simple, explainable growth model: each layer approaches a ceiling at a
 * rate set by the practice scenario. No black box, no diagnosis, and every
 * number carries a range and a confidence.
 */

import {
  HUMAN_MODEL_DISCLAIMER,
  type HumanLayer,
  type HumanLayerId,
  type HumanModel,
  type LayerPrediction,
} from "./types";

export type TrajectoryScenario = "default" | "practice" | "intensive";

const RATES: Record<TrajectoryScenario, number> = {
  default: 0.02,
  practice: 0.07,
  intensive: 0.11,
};

const CEILING = 0.9;

const clamp01 = (n: number): number => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const round2 = (n: number): number => Math.round(clamp01(n) * 100) / 100;

export interface LayerProjection {
  y1: LayerPrediction;
  y3: LayerPrediction;
  y10: LayerPrediction;
  confidence: number;
  drivers: string[];
}

function band(mid: number, spread: number): LayerPrediction {
  return {
    low: round2(mid - spread),
    mid: round2(mid),
    high: round2(mid + spread),
  };
}

export function projectLayer(
  layer: Pick<HumanLayer, "id" | "state" | "confidence" | "interventions">,
  scenario: TrajectoryScenario = "practice",
): LayerProjection {
  const state = clamp01(layer.state);
  const confidence = clamp01(layer.confidence);
  const rate =
    RATES[scenario] * (0.6 + 0.4 * confidence) * (layer.interventions.length ? 1 : 0.6);
  const spread = 0.04 + (1 - confidence) * 0.12;

  const at = (years: number): number => state + (CEILING - state) * (1 - Math.pow(1 - rate, years));

  return {
    y1: band(at(1), spread),
    y3: band(at(3), spread * 1.25),
    y10: band(at(10), spread * 1.6),
    confidence: round2(confidence * (scenario === "default" ? 0.9 : 1)),
    drivers: [
      ...layer.interventions.slice(0, 3),
      `current ${round2(state)}`,
      `dose ${scenario}`,
    ],
  };
}

export interface HumanProjection {
  layers: Record<HumanLayerId, LayerProjection>;
  scenario: TrajectoryScenario;
  disclaimer: string;
}

export function projectHumanModel(
  model: HumanModel,
  scenario: TrajectoryScenario = "practice",
): HumanProjection {
  const layers = {} as Record<HumanLayerId, LayerProjection>;
  for (const id of Object.keys(model.layers) as HumanLayerId[]) {
    layers[id] = projectLayer(model.layers[id], scenario);
  }
  return { layers, scenario, disclaimer: HUMAN_MODEL_DISCLAIMER };
}
