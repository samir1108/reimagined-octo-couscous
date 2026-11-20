import { supabase } from "@/lib/supabase";
import type { Json } from "@/integrations/supabase/types";
import { normalizeDayPlanConfig, type DayPlanConfig } from "@/lib/dayPlan";

export interface StoredDayPlanProfile {
  userId: string;
  wakeTime: string | null;
  sleepTime: string | null;
  lifestyle: Record<string, unknown>;
}

const configKey = (userId: string) => `day_plan_${userId}`;
const doneKey = (userId: string, dateKey: string) => `day_plan_done_${userId}_${dateKey}`;

export function readLocalDayPlan(userId: string): DayPlanConfig | null {
  try {
    const raw = localStorage.getItem(configKey(userId));
    if (!raw) return null;
    return normalizeDayPlanConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function loadDayPlanProfile(): Promise<StoredDayPlanProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("wake_time, sleep_time, lifestyle")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) throw error;

  return {
    userId: auth.user.id,
    wakeTime: (data?.wake_time as string | null) ?? null,
    sleepTime: (data?.sleep_time as string | null) ?? null,
    lifestyle: (data?.lifestyle as Record<string, unknown>) ?? {},
  };
}

export async function saveDayPlanConfig(userId: string, config: DayPlanConfig): Promise<DayPlanConfig> {
  const normalized = normalizeDayPlanConfig(config);

  const { data, error: readError } = await supabase
    .from("profiles")
    .select("lifestyle, display_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;

  const lifestyle = (data?.lifestyle as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("profiles")
    .update({ lifestyle: { ...lifestyle, day_plan: normalized } as unknown as Json })
    .eq("user_id", userId);
  if (error) throw error;

  try {
    localStorage.setItem(configKey(userId), JSON.stringify(normalized));
  } catch {
    /* local mirror is best-effort */
  }

  return normalized;
}

export function readDoneItemIds(userId: string | null, dateKey: string): string[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(doneKey(userId, dateKey));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function writeDoneItemIds(userId: string | null, dateKey: string, ids: string[]): void {
  if (!userId) return;
  try {
    localStorage.setItem(doneKey(userId, dateKey), JSON.stringify(Array.from(new Set(ids))));
  } catch {
    /* completion mirror is best-effort */
  }
}
