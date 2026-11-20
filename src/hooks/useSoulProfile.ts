/**
 * useSoulProfile
 * ──────────────
 * Reads/writes the 60-min "Meet Yourself" onboarding profile.
 *
 * - Signed-in user: persists to ConsciousOS Cloud (`soul_profile` table).
 * - Not signed in: persists to localStorage under `soul_profile:v1`.
 *   On next sign-in, `syncLocalToCloud()` migrates it up.
 *
 * Progress saves after every question. Nothing is ever lost.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PathSlug } from "@/data/onboarding/soulChambers";
import { TOTAL_CHAMBER_COUNT } from "@/data/onboarding/soulChambers";
import type { ArchetypeSlug } from "@/data/onboarding/archetypes";
import type { LoopFamilySlug } from "@/data/onboarding/loopFamilies";
import type { CouncilSlug } from "@/data/onboarding/innerCouncil";

export interface SoulProfileState {
  answers: Record<string, any>;
  derived: {
    surface?: Record<string, any>;
    somatic?: Record<string, any>;
    psychological?: Record<string, any>;
    karmic?: Record<string, any>;
    doorway?: {
      scores?: Partial<Record<PathSlug, number>>;
      primary?: PathSlug;
      entry_level?: number;
    };
    shadow?: Record<string, any>;
    prohibitions?: Record<string, any>;
    archetype?: Record<string, any>;
    loops?: Record<string, any>;
    band?: Record<string, any>;
    council?: Record<string, any>;
    witness?: Record<string, any>;
  };
  chambers_completed: number[];        // 1..12
  primary_path_slug?: PathSlug | null;
  primary_path_level?: number | null;
  vow_text?: string | null;
  vow_set_at?: string | null;
  vow_expires_at?: string | null;
  fully_completed_at?: string | null;
  archetype_primary?: ArchetypeSlug | null;
  archetype_shadow?: ArchetypeSlug | null;
  active_loop_families?: { slug: LoopFamilySlug; severity: number }[];
  practice_band?: "gentle" | "moderate" | "fierce" | "monastic" | null;
  practice_minutes_per_day?: number | null;
  inner_council?: CouncilSlug[];
  witness_baseline?: number | null;
}

const LOCAL_KEY = "soul_profile:v1";

const empty = (): SoulProfileState => ({
  answers: {},
  derived: {},
  chambers_completed: [],
});

function loadLocal(): SoulProfileState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch { return empty(); }
}
function saveLocal(s: SoulProfileState) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

function rowToState(row: any): SoulProfileState {
  const completed: number[] = [];
  for (let i = 1; i <= TOTAL_CHAMBER_COUNT; i++) {
    if (row?.[`chamber_${i}_completed_at`]) completed.push(i);
  }
  return {
    answers: row?.answers ?? {},
    derived: row?.derived ?? {},
    chambers_completed: completed,
    primary_path_slug: row?.primary_path_slug ?? null,
    primary_path_level: row?.primary_path_level ?? null,
    vow_text: row?.vow_text ?? null,
    vow_set_at: row?.vow_set_at ?? null,
    vow_expires_at: row?.vow_expires_at ?? null,
    fully_completed_at: row?.fully_completed_at ?? null,
    archetype_primary: row?.archetype_primary ?? null,
    archetype_shadow: row?.archetype_shadow ?? null,
    active_loop_families: row?.active_loop_families ?? [],
    practice_band: row?.practice_band ?? null,
    practice_minutes_per_day: row?.practice_minutes_per_day ?? null,
    inner_council: row?.inner_council ?? [],
    witness_baseline: row?.witness_baseline ?? null,
  };
}

export function useSoulProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<SoulProfileState>(() => loadLocal());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (user) await pullFromCloud(user.id);
      else setLoading(false);
      const sub = supabase.auth.onAuthStateChange(async (_e, session) => {
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        if (uid) await pullFromCloud(uid);
      });
      unsub = sub.data.subscription;
    })();
    return () => { unsub?.unsubscribe?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pullFromCloud = async (uid: string) => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("soul_profile").select("*").eq("user_id", uid).maybeSingle();
    if (data) {
      setState(rowToState(data));
    } else {
      // First cloud read for this user — if we have local data, seed the row.
      const local = loadLocal();
      if (Object.keys(local.answers).length > 0) {
        await pushToCloud(uid, local);
        setState(local);
      } else {
        setState(empty());
      }
    }
    setLoading(false);
  };

  const pushToCloud = async (uid: string, s: SoulProfileState) => {
    // Preserve existing timestamps rather than overwriting to now every save.
    const { data: existing } = await (supabase as any)
      .from("soul_profile").select("*").eq("user_id", uid).maybeSingle();
    const merged: any = {
      user_id: uid,
      answers: s.answers,
      derived: s.derived,
      primary_path_slug: s.primary_path_slug ?? null,
      primary_path_level: s.primary_path_level ?? null,
      vow_text: s.vow_text ?? null,
      vow_set_at: s.vow_set_at ?? null,
      vow_expires_at: s.vow_expires_at ?? null,
      fully_completed_at: s.fully_completed_at ?? null,
      archetype_primary: s.archetype_primary ?? null,
      archetype_shadow: s.archetype_shadow ?? null,
      active_loop_families: s.active_loop_families ?? [],
      practice_band: s.practice_band ?? null,
      practice_minutes_per_day: s.practice_minutes_per_day ?? null,
      inner_council: s.inner_council ?? [],
      witness_baseline: s.witness_baseline ?? null,
    };
    for (let i = 1; i <= TOTAL_CHAMBER_COUNT; i++) {
      const key = `chamber_${i}_completed_at`;
      merged[key] = s.chambers_completed.includes(i)
        ? (existing?.[key] ?? new Date().toISOString())
        : null;
    }
    await (supabase as any).from("soul_profile").upsert(merged, { onConflict: "user_id" });
  };

  const persist = useCallback(async (next: SoulProfileState) => {
    setState(next);
    saveLocal(next);
    if (userId) await pushToCloud(userId, next);
  }, [userId]);

  const saveAnswer = useCallback((qid: string, value: any, derivedPatch?: { layer: string; key: string; value: any }) => {
    setState(prev => {
      const next: SoulProfileState = {
        ...prev,
        answers: { ...prev.answers, [qid]: value },
        derived: derivedPatch
          ? {
              ...prev.derived,
              [derivedPatch.layer]: {
                ...((prev.derived as any)?.[derivedPatch.layer] ?? {}),
                [derivedPatch.key]: derivedPatch.value,
              },
            }
          : prev.derived,
      };
      saveLocal(next);
      if (userId) void pushToCloud(userId, next);
      return next;
    });
  }, [userId]);

  const completeChamber = useCallback((n: number, patch?: Partial<SoulProfileState>) => {
    setState(prev => {
      const chambers = Array.from(new Set([...prev.chambers_completed, n])).sort();
      const fully = chambers.length === TOTAL_CHAMBER_COUNT ? new Date().toISOString() : prev.fully_completed_at ?? null;
      const next: SoulProfileState = { ...prev, ...(patch ?? {}), chambers_completed: chambers, fully_completed_at: fully };
      saveLocal(next);
      if (userId) void pushToCloud(userId, next);
      return next;
    });
  }, [userId]);

  const reset = useCallback(async () => {
    const e = empty();
    saveLocal(e);
    setState(e);
    if (userId) await pushToCloud(userId, e);
  }, [userId]);

  return {
    userId, loading, state,
    saveAnswer, completeChamber, persist, reset,
    isCloud: !!userId,
  };
}
