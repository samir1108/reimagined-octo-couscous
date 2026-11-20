/**
 * sittingRecorder — converts shell step payloads back into First Eleven
 * mapping answers (Gate 2 → normal flow bridge).
 *
 * Kept out of the component file so fast-refresh stays clean and the
 * conversion is unit-testable on its own.
 */
import type { CompletedStepRecord } from "@/lib/session-shell/types";
import type { SEAnswer, SEDimension } from "@/lib/onboarding/firstElevenTypes";
import type { SittingStepParams } from "@/lib/onboarding/composeSittingPlan";

/**
 * A completed step in a sitting → its mapping answer, or null when the beat
 * carries no answer (teaching, empty silence, skipped reflection).
 */
export function toAnswer(
  record: CompletedStepRecord,
  planSteps: { title?: string; params?: Record<string, unknown> }[]
): SEAnswer | null {
  const idxByTitle = planSteps.findIndex((s) => s.title === record.title);
  const step = planSteps[idxByTitle];
  const params = (step?.params ?? {}) as Partial<SittingStepParams> & Record<string, unknown>;
  const questionId = (params.feQuestionId as string) ?? "";
  const sessionId = (params.feSessionId as string) ?? "";
  const payload = record.payload ?? {};

  if (!sessionId) return null;

  // Witness silence — only an answer when the user wrote a line.
  if (record.kind === "witness") {
    const line = (payload as { thoughts?: string }).thoughts;
    if (typeof line !== "string" || line.trim().length < 2) return null;
    return {
      questionId: questionId || `silence-${idxByTitle}`,
      sessionId,
      value: line.trim(),
      band: 5,
      dimension: "body",
    };
  }

  // Reflection choice — option id → band from feOptionBands.
  if (record.kind === "reflection") {
    const optionId = (payload as { option?: string }).option;
    const bands = (params.feOptionBands ?? {}) as Record<string, number>;
    if (optionId && optionId in bands) {
      const loops = ((params.feOptionLoops ?? {}) as Record<string, string[]>)[optionId] ?? [];
      return {
        questionId,
        sessionId,
        value: optionId,
        band: Number(bands[optionId]),
        dimension: (params.feDimension as SEDimension) ?? "thought",
        loops,
      };
    }
    // Scale (chips 1–5) — interpolate between feLowBand and feHighBand.
    if (optionId && params.feLowBand !== undefined && params.feHighBand !== undefined) {
      const s = Number(optionId);
      const band =
        Math.round((params.feLowBand + ((params.feHighBand - params.feLowBand) * (s - 1)) / 4) * 10) / 10;
      return {
        questionId,
        sessionId,
        value: s,
        band,
        dimension: (params.feDimension as SEDimension) ?? "thought",
        loops: (params.feLoops as string[]) ?? [],
      };
    }
    return null;
  }

  // Journal / text — the written line is the answer.
  if (record.kind === "journal") {
    const text = (payload as { text?: string }).text;
    if (typeof text !== "string" || text.trim().length < 2) return null;
    return {
      questionId,
      sessionId,
      value: text.trim(),
      band: Number(params.feBand ?? 3),
      dimension: (params.feDimension as SEDimension) ?? "emotion",
      loops: (params.feLoops as string[]) ?? [],
    };
  }

  // Micro-act — the vow itself is the answer.
  if (record.kind === "micro-act") {
    const vow = (params.vowLabel as string) ?? "";
    if (!vow) return null;
    return {
      questionId: questionId || `act-${idxByTitle}`,
      sessionId,
      value: vow,
      band: Number(params.feBand ?? 8),
      dimension: (params.feDimension as SEDimension) ?? "awareness",
    };
  }

  return null;
}
