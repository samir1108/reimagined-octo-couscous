/**
 * BUILD — assemble the twelve-layer model from existing signals.
 * ─────────────────────────────────────────────────────────────
 * Nothing here is invented: every layer state is derived from a named input
 * (dimension band, capability level, loop, sleep, pain, adherence) and the
 * evidence is stored beside the number.
 */

import {
  CONCEPT_LAYER,
  HUMAN_LAYER_IDS,
  HUMAN_LAYERS,
  type HumanLayer,
  type HumanLayerId,
  type HumanModel,
  type HumanObservation,
  type HumanTrajectory,
} from "./types";
import { projectLayer } from "./trajectory";

const clamp01 = (n: number): number => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const round2 = (n: number): number => Math.round(clamp01(n) * 100) / 100;
const daysSince = (iso: string | null | undefined, now: Date): number => {
  if (!iso) return 999;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 999;
  return Math.max(0, (now.getTime() - t) / 86_400_000);
};

const DIMENSION_TO_LAYER: Record<string, HumanLayerId> = {
  body: "body",
  emotion: "emotion",
  thought: "thought",
  awareness: "identity",
  relational: "relational",
  work: "work",
  money: "work",
  meaning: "meaning",
  time: "time",
  environment: "environment",
};

export const LAYER_KEYWORDS: Record<HumanLayerId, string[]> = {
  body: ["body", "health", "pain", "sleep", "energy", "breath", "somatic"],
  emotion: ["emotion", "anger", "fear", "shame", "grief", "mood", "anxiety"],
  thought: ["mind", "mental", "thought", "rumination", "cognitive", "attention"],
  identity: ["identity", "ego", "self", "validation", "comparison", "mask"],
  behavior: ["habit", "avoidance", "procrastination", "impulse", "control", "action"],
  relational: ["relationship", "family", "social", "approval", "partner", "conflict"],
  work: ["work", "career", "money", "finance", "purpose", "mastery"],
  time: ["time", "urgency", "regret", "future", "past", "delay"],
  meaning: ["meaning", "faith", "doubt", "devotion", "ethics", "death"],
  environment: ["place", "noise", "light", "digital", "context"],
  history: ["history", "loss", "win", "trauma", "memory", "turning"],
  potential: ["capability", "readiness", "edge", "ceiling"],
};

export interface HumanModelInput {
  userId: string;
  overallBand?: number;
  dimensionBands?: Record<string, number>;
  capabilityLevels?: Partial<Record<string, number>>;
  activeLoops?: string[];
  stressedDomains?: string[];
  sessionCount?: number;
  lastSessionAt?: string | null;
  sleepHours?: number;
  painLevel?: number;
  now?: Date;
  previous?: HumanModel;
}

function emptyLayer(id: HumanLayerId): HumanLayer {
  const meta = HUMAN_LAYERS.find((l) => l.id === id);
  return {
    id,
    state: 0.5,
    trajectory: "stable",
    confidence: 0.25,
    evidence: [],
    interventions: meta ? [meta.intervention] : [],
    predicted: {
      y1: { low: 0.5, mid: 0.5, high: 0.5 },
      y3: { low: 0.5, mid: 0.5, high: 0.5 },
      y10: { low: 0.5, mid: 0.5, high: 0.5 },
    },
  };
}

function push(
  layer: HumanLayer,
  observation: Omit<HumanObservation, "layer" | "at"> & { at?: string },
  now: Date,
): void {
  layer.evidence.push({
    layer: layer.id,
    at: observation.at ?? now.toISOString(),
    ...observation,
  });
  layer.confidence = clamp01(layer.confidence + 0.08);
}

function matchingLayers(text: string): HumanLayerId[] {
  const lower = text.toLowerCase();
  return HUMAN_LAYER_IDS.filter((id) =>
    LAYER_KEYWORDS[id].some((keyword) => lower.includes(keyword)),
  );
}

export function summarizeLayers(layers: Record<HumanLayerId, HumanLayer>): HumanModel["summary"] {
  const entries = HUMAN_LAYER_IDS.map((id) => layers[id]);
  const sorted = [...entries].sort((a, b) => a.state - b.state);
  const avgState = entries.reduce((sum, l) => sum + l.state, 0) / entries.length;
  const avgConfidence = entries.reduce((sum, l) => sum + l.confidence, 0) / entries.length;
  return {
    weakest: sorted[0].id,
    strongest: sorted[sorted.length - 1].id,
    readiness: round2(avgState * 0.6 + avgConfidence * 0.4),
    observedLayers: entries.filter((l) => l.evidence.length > 0 && l.confidence >= 0.35).map((l) => l.id),
  };
}

export function finalizeLayer(layer: HumanLayer): HumanLayer {
  const projection = projectLayer(layer, "practice");
  return {
    ...layer,
    state: round2(layer.state),
    confidence: round2(layer.confidence),
    predicted: {
      y1: projection.y1,
      y3: projection.y3,
      y10: projection.y10,
    },
  };
}

export function buildHumanModel(input: HumanModelInput): HumanModel {
  const now = input.now ?? new Date();
  const layers = {} as Record<HumanLayerId, HumanLayer>;
  for (const id of HUMAN_LAYER_IDS) layers[id] = emptyLayer(id);

  // Dimension bands are the strongest existing signal.
  for (const [dimension, value] of Object.entries(input.dimensionBands ?? {})) {
    const layerId = DIMENSION_TO_LAYER[dimension];
    if (!layerId || !Number.isFinite(value)) continue;
    const layer = layers[layerId];
    layer.state = clamp01(value / 10);
    push(layer, {
      signal: `dimension:${dimension}`,
      value: layer.state,
      source: "profile",
      confidence: 0.65,
    }, now);
  }

  // Capability levels map onto their concept's home layer.
  const capabilityValues = Object.values(input.capabilityLevels ?? {}).filter(
    (v): v is number => typeof v === "number",
  );
  for (const [concept, level] of Object.entries(input.capabilityLevels ?? {})) {
    const layerId = CONCEPT_LAYER[concept];
    if (!layerId || typeof level !== "number") continue;
    const layer = layers[layerId];
    layer.state = clamp01(layer.state * 0.7 + (level / 5) * 0.3);
    push(layer, {
      signal: `capability:${concept}`,
      value: clamp01(level / 5),
      source: "profile",
      confidence: 0.7,
    }, now);
  }

  const averageCapability =
    capabilityValues.length > 0
      ? capabilityValues.reduce((sum, v) => sum + v, 0) / capabilityValues.length / 5
      : 0.5;
  layers.potential.state = clamp01(averageCapability * 0.8 + 0.1);

  if (typeof input.overallBand === "number") {
    const band = clamp01(input.overallBand / 10);
    for (const id of HUMAN_LAYER_IDS) {
      layers[id].state = clamp01(layers[id].state * 0.94 + band * 0.06);
    }
    push(layers.potential, {
      signal: "overallBand",
      value: band,
      source: "profile",
      confidence: 0.6,
    }, now);
  }

  if (typeof input.sleepHours === "number") {
    const delta = (input.sleepHours - 7) * 0.03;
    layers.body.state = clamp01(layers.body.state + delta);
    push(layers.body, {
      signal: "sleepHours",
      value: clamp01(input.sleepHours / 9),
      source: "manual",
      confidence: 0.7,
    }, now);
    if (input.sleepHours < 5) {
      layers.body.interventions = Array.from(new Set([...layers.body.interventions, "rest_protocol"]));
    }
  }

  if (typeof input.painLevel === "number" && input.painLevel > 0) {
    layers.body.state = clamp01(layers.body.state - input.painLevel * 0.03);
    layers.emotion.state = clamp01(layers.emotion.state - input.painLevel * 0.015);
    push(layers.body, {
      signal: "painLevel",
      value: clamp01(1 - input.painLevel / 10),
      source: "manual",
      confidence: 0.75,
    }, now);
  }

  const loops = [...(input.activeLoops ?? []), ...(input.stressedDomains ?? [])];
  for (const loop of loops) {
    for (const layerId of matchingLayers(loop)) {
      const layer = layers[layerId];
      layer.state = clamp01(layer.state - 0.06);
      layer.trajectory = "declining";
      push(layer, {
        signal: `loop:${loop}`,
        value: layer.state,
        source: "loop",
        confidence: 0.6,
      }, now);
    }
  }

  if (typeof input.sessionCount === "number") {
    const count = Math.max(0, input.sessionCount);
    layers.history.state = clamp01(layers.history.state + Math.min(0.2, count / 200));
    layers.behavior.state = clamp01(layers.behavior.state + Math.min(0.15, count / 300));
    push(layers.history, {
      signal: "sessionCount",
      value: clamp01(count / 200),
      source: "session",
      confidence: 0.55,
    }, now);
  }

  const gap = daysSince(input.lastSessionAt ?? null, now);
  if (gap > 14 && gap < 900) {
    layers.behavior.state = clamp01(layers.behavior.state - 0.05);
    layers.time.state = clamp01(layers.time.state - 0.03);
  }

  for (const id of HUMAN_LAYER_IDS) {
    const layer = layers[id];
    if (layer.trajectory !== "declining") {
      if (layer.state < 0.6 && (input.sessionCount ?? 0) >= 3) layer.trajectory = "rising";
      else if (layer.state >= 0.7) layer.trajectory = "stable";
      else layer.trajectory = "stable";
    }
    layers[id] = finalizeLayer(layer);
  }

  const version = input.previous ? input.previous.version + 1 : 1;

  return {
    userId: input.userId,
    version,
    builtAt: now.toISOString(),
    layers,
    summary: summarizeLayers(layers),
  };
}

export function trajectoryFromDelta(delta: number): HumanTrajectory {
  if (delta > 0.01) return "rising";
  if (delta < -0.01) return "declining";
  return "stable";
}
