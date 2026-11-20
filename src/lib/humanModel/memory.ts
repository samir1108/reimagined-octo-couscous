/**
 * MEMORY DIGEST — what to keep for ten years.
 * ──────────────────────────────────────────
 * Not every event deserves memory. The digest keeps the strongest evidence
 * per layer, so the model can be reconstructed (or explained) without replaying
 * every sitting.
 */

import {
  HUMAN_LAYERS,
  HUMAN_MODEL_DISCLAIMER,
  type HumanLayerId,
  type HumanModel,
} from "./types";

export interface MemoryDigestEntry {
  layer: HumanLayerId;
  line: string;
  evidenceCount: number;
  confidence: number;
}

export interface MemoryDigest {
  userId: string;
  generatedAt: string;
  modelVersion: number;
  entries: MemoryDigestEntry[];
  disclaimer: string;
}

export function buildMemoryDigest(model: HumanModel): MemoryDigest {
  const entries = HUMAN_LAYERS.map((meta) => {
    const layer = model.layers[meta.id];
    const strongest = [...layer.evidence]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    return {
      layer: meta.id,
      line: strongest.length
        ? `${meta.label}: ${strongest.map((item) => item.signal).join("; ")}`
        : `${meta.label}: no evidence yet`,
      evidenceCount: layer.evidence.length,
      confidence: layer.confidence,
    };
  });

  return {
    userId: model.userId,
    generatedAt: new Date().toISOString(),
    modelVersion: model.version,
    entries,
    disclaimer: HUMAN_MODEL_DISCLAIMER,
  };
}

export function memoryDigestToMarkdown(digest: MemoryDigest): string {
  return [
    "# Memory digest",
    "",
    `Model version: ${digest.modelVersion}`,
    `Generated: ${digest.generatedAt}`,
    "",
    ...digest.entries.map(
      (entry) =>
        `- **${entry.layer}** (${entry.evidenceCount} evidence, ${Math.round(
          entry.confidence * 100,
        )}% confidence): ${entry.line}`,
    ),
    "",
    `> ${digest.disclaimer}`,
    "",
  ].join("\n");
}
