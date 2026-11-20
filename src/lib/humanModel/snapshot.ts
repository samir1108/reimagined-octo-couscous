/**
 * HUMAN MODEL SNAPSHOT — local first, database when signed in.
 * ───────────────────────────────────────────────────────────
 * The model is a living document. We do not rebuild it from scratch on every
 * read (that would discard session deltas); we load the snapshot, apply the
 * next outcome, and save it back.
 */

import { supabase } from "@/lib/supabase";
import type { HumanModel } from "./types";

const KEY_PREFIX = "satyug:human-model";

function key(userId: string): string {
  return `${KEY_PREFIX}:${userId}`;
}

export function loadLocalHumanModel(userId: string): HumanModel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HumanModel;
    return parsed && parsed.layers ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocalHumanModel(model: HumanModel): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(model.userId), JSON.stringify(model));
  } catch {
    /* private mode — model stays in memory */
  }
}

export async function loadHumanModelSnapshot(userId: string): Promise<HumanModel | null> {
  const local = loadLocalHumanModel(userId);
  try {
    const db = supabase as unknown as { from: (table: string) => any };
    const { data, error } = await db
      .from("human_model_snapshots")
      .select("model,updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data?.model) return local;

    const remote = data.model as HumanModel;
    if (!remote?.layers) return local;
    if (local && new Date(local.builtAt) > new Date(remote.builtAt)) return local;

    saveLocalHumanModel(remote);
    return remote;
  } catch {
    return local;
  }
}

export async function saveHumanModelSnapshot(model: HumanModel): Promise<void> {
  saveLocalHumanModel(model);
  try {
    const db = supabase as unknown as { from: (table: string) => any };
    await db.from("human_model_snapshots").upsert(
      {
        user_id: model.userId,
        model,
        version: model.version,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    /* offline / migration not applied — local snapshot remains */
  }
}

export function clearLocalHumanModel(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(userId));
  } catch {
    /* ignore */
  }
}
