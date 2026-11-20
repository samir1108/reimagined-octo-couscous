/**
 * EXPORT — the encyclopedia must be portable.
 * ───────────────────────────────────────────
 * JSON for machines, Markdown for humans. No hidden state, no lock-in.
 */

import type { HumanLayerId, HumanModel } from "./types";
import { HUMAN_LAYERS, HUMAN_MODEL_DISCLAIMER } from "./types";
import type { LayerProjection } from "./trajectory";

export const HUMAN_MODEL_EXPORT_VERSION = 1;

export function humanModelToJson(model: HumanModel): string {
  return JSON.stringify(
    {
      format: "satyug-human-model",
      version: HUMAN_MODEL_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      model,
      disclaimer: HUMAN_MODEL_DISCLAIMER,
    },
    null,
    2,
  );
}

const pct = (n: number): string => `${Math.round(n * 100)}`;

export function humanModelToMarkdown(
  model: HumanModel,
  projection?: Record<HumanLayerId, LayerProjection>,
): string {
  const rows = HUMAN_LAYERS.map((meta) => {
    const layer = model.layers[meta.id];
    const future = projection?.[meta.id];
    const futureText = future
      ? `${pct(future.y1.mid)} / ${pct(future.y3.mid)} / ${pct(future.y10.mid)}`
      : "—";
    return `| ${meta.label} | ${pct(layer.state)} | ${layer.trajectory} | ${pct(layer.confidence)}% | ${layer.evidence.length} | ${futureText} |`;
  });

  return [
    "# My 12-layer model",
    "",
    `Generated: ${new Date(model.builtAt).toLocaleString()}`,
    `Version: ${model.version}`,
    `Readiness: ${pct(model.summary.readiness)}%`,
    `Weakest: ${model.summary.weakest} · Strongest: ${model.summary.strongest}`,
    "",
    "| Layer | State (0–100) | Trajectory | Confidence | Evidence | 1y / 3y / 10y |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
    "## What this is",
    "",
    "Each layer is derived from named evidence: dimension bands, capability levels, loops, sleep, pain, and completed sittings. A blank evidence count means the layer is a template, not a finding.",
    "",
    "## Evidence",
    "",
    ...HUMAN_LAYERS.flatMap((meta) => {
      const layer = model.layers[meta.id];
      if (!layer.evidence.length) return [`- **${meta.label}**: no evidence yet`];
      return [
        `- **${meta.label}**: ${layer.evidence
          .slice(-4)
          .map((item) => `${item.signal} (${pct(item.value)})`)
          .join(", ")}`,
      ];
    }),
    "",
    `> ${HUMAN_MODEL_DISCLAIMER}`,
    "",
  ].join("\n");
}

export function downloadText(filename: string, text: string, mime: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
