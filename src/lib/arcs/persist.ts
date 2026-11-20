/**
 * ARC PERSISTENCE — local first, database when possible.
 * ──────────────────────────────────────────────────────
 * `arc_progress` is the durable ledger; sessionStorage/localStorage keeps the
 * arc usable offline and for anonymous users. Both are merged on load.
 */

import { supabase } from "@/lib/supabase";
import { createProgress, normalizeCompleted } from "./runtime";
import type { ArcProgress } from "./types";

const KEY_PREFIX = "satyug:arc";

function key(arcId: string, userId: string | null | undefined): string {
  return `${KEY_PREFIX}:${arcId}:${userId ?? "anon"}`;
}

export function loadLocalArcProgress(
  arcId: string,
  userId: string | null | undefined,
): ArcProgress {
  if (typeof window === "undefined") return createProgress(arcId);
  try {
    const raw = window.localStorage.getItem(key(arcId, userId));
    if (!raw) return createProgress(arcId);
    const parsed = JSON.parse(raw) as Partial<ArcProgress>;
    return createProgress(arcId, normalizeCompleted(parsed.completed ?? []));
  } catch {
    return createProgress(arcId);
  }
}

export function saveLocalArcProgress(progress: ArcProgress, userId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(progress.arcId, userId), JSON.stringify(progress));
  } catch {
    /* private mode — progress stays in memory */
  }
}

export async function loadArcProgress(
  arcId: string,
  userId: string | null | undefined,
): Promise<ArcProgress> {
  const local = loadLocalArcProgress(arcId, userId);
  if (!userId) return local;

  try {
    const db = supabase as unknown as { from: (table: string) => any };
    const { data, error } = await db
      .from("arc_progress")
      .select("sit_index")
      .eq("user_id", userId)
      .eq("arc_id", arcId);
    if (error) return local;
    const remote = (data ?? []).map((row: { sit_index: number }) => Number(row.sit_index));
    const merged = createProgress(arcId, [...local.completed, ...remote]);
    saveLocalArcProgress(merged, userId);
    return merged;
  } catch {
    return local;
  }
}

export interface RecordArcSitInput {
  userId: string | null | undefined;
  arcId: string;
  sitIndex: number;
  quality?: number;
  feltShift?: "lighter" | "same" | "heavier";
  evidence?: Record<string, unknown>;
}

export async function recordArcSit(input: RecordArcSitInput): Promise<void> {
  const local = loadLocalArcProgress(input.arcId, input.userId);
  saveLocalArcProgress(
    createProgress(input.arcId, [...local.completed, input.sitIndex]),
    input.userId,
  );

  if (!input.userId) return;

  try {
    const db = supabase as unknown as { from: (table: string) => any };
    await db.from("arc_progress").upsert(
      {
        user_id: input.userId,
        arc_id: input.arcId,
        sit_index: input.sitIndex,
        quality: input.quality ?? null,
        felt_shift: input.feltShift ?? null,
        evidence: input.evidence ?? {},
      },
      { onConflict: "user_id,arc_id,sit_index" },
    );
  } catch {
    /* offline / migration not applied — local ledger remains */
  }
}

export function resetLocalArcProgress(arcId: string, userId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(arcId, userId));
  } catch {
    /* ignore */
  }
}
