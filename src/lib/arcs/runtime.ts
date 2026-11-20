/**
 * ARC RUNTIME — pure progression rules.
 * ─────────────────────────────────────
 * Sits complete in order. There is no skipping: the arc is a sequence, not a
 * menu. All functions are pure so progress can be replayed from evidence.
 */

import type { ArcDefinition, ArcProgress, ArcSit } from "./types";

export function createProgress(arcId: string, completed: number[] = []): ArcProgress {
  return {
    arcId,
    completed: normalizeCompleted(completed),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCompleted(completed: number[]): number[] {
  return Array.from(new Set(completed.filter((n) => Number.isInteger(n) && n > 0))).sort(
    (a, b) => a - b,
  );
}

export function nextSitIndex(arc: ArcDefinition, progress: ArcProgress): number | null {
  const done = new Set(progress.completed);
  for (const sit of arc.sits) {
    if (!done.has(sit.index)) return sit.index;
  }
  return null;
}

export function nextSit(arc: ArcDefinition, progress: ArcProgress): ArcSit | null {
  const index = nextSitIndex(arc, progress);
  return index == null ? null : arc.sits.find((sit) => sit.index === index) ?? null;
}

export function canCompleteSit(arc: ArcDefinition, progress: ArcProgress, index: number): boolean {
  return nextSitIndex(arc, progress) === index;
}

export function completeArcSit(
  arc: ArcDefinition,
  progress: ArcProgress,
  index: number,
): ArcProgress {
  if (!canCompleteSit(arc, progress, index)) return progress;
  const completed = normalizeCompleted([...progress.completed, index]).filter(
    (n) => n <= arc.sits.length,
  );
  return {
    arcId: arc.id,
    completed,
    updatedAt: new Date().toISOString(),
  };
}

export function arcPercent(arc: ArcDefinition, progress: ArcProgress): number {
  if (!arc.sits.length) return 0;
  return Math.round((progress.completed.length / arc.sits.length) * 100);
}

export function isArcComplete(arc: ArcDefinition, progress: ArcProgress): boolean {
  return arc.sits.every((sit) => progress.completed.includes(sit.index));
}

export function arcStatusLabel(arc: ArcDefinition, progress: ArcProgress): string {
  if (isArcComplete(arc, progress)) return "Complete";
  const next = nextSitIndex(arc, progress);
  return next == null ? "Complete" : `Sit ${next} of ${arc.sits.length}`;
}
