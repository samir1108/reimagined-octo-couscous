/**
 * useAwakening — progress persistence for THE AWAKENING JOURNEY.
 * ─────────────────────────────────
 * Local-first: an in-memory + localStorage draft is the source of truth
 * during a session (offline-safe), synced to `awakening_progress` in
 * Supabase after every answer and on session close. The personal order of
 * sessions re-shuffles itself as the capability map sharpens — two users
 * walk the same eleven sessions in different sequences.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  AwakeningProgress,
  AwakeningAnswer,
  AwakeningSession,
  CapabilityMap,
  VowResult,
} from "@/lib/onboarding/awakening";
import {
  analyzeCapabilities,
  personalOrder,
  emptyProgress,
  AWAKENING_SESSION_BY_ID,
  AWAKENING_SESSION_BY_N,
  AWAKENING_TOTAL,
} from "@/lib/onboarding/awakening";
import type { Json } from "@/integrations/supabase/types";

const draftKey = (uid: string) => `awakening_draft_${uid}`;

function readDraft(uid: string): AwakeningProgress | null {
  try {
    const raw = localStorage.getItem(draftKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AwakeningProgress;
    if (!Array.isArray(parsed.completed_session_ids) || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface UseAwakening {
  progress: AwakeningProgress;
  map: CapabilityMap;
  loading: boolean;
  /** The next session to walk, in the user's personal order. */
  nextSession: AwakeningSession | null;
  /** 1-based position of the next session in the personal order. */
  nextPosition: number;
  answerQuestion: (answer: AwakeningAnswer) => void;
  /** Record the vow the user phrased, mark the session complete, store the carry-seed. */
  completeSession: (session: AwakeningSession, vow: string) => void;
  /** Record what happened to a previous session's vow (asked at the next threshold). */
  recordVowResult: (sessionId: string, result: VowResult) => void;
  setGoal: (goal: string | null) => void;
  resetAll: () => void;
}

export function useAwakening(userId: string | null, goalSeed?: string | null): UseAwakening {
  const [progress, setProgress] = useState<AwakeningProgress>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  // ── load: remote first, local draft as fallback ──
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("awakening_progress")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (cancelled) return;
        if (!error && data) {
          setProgress(normalize(data as unknown as Record<string, unknown>));
        } else {
          setProgress(readDraft(userId) ?? emptyProgress());
        }
      } catch {
        if (!cancelled) setProgress(readDraft(userId) ?? emptyProgress());
      } finally {
        if (!cancelled) {
          hydrated.current = true;
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ── the capability map, recomputed from every answer ──
  const map = useMemo(() => analyzeCapabilities(progress), [progress]);

  // ── the personal order re-shuffles as the map sharpens ──
  useEffect(() => {
    if (!hydrated.current) return;
    if (progress.answers.length === 0) return;
    setProgress((prev) => {
      const nextOrder = personalOrder(map).map((o) => o.id);
      if (nextOrder.length === prev.order.length && nextOrder.every((id, i) => id === prev.order[i])) {
        return prev;
      }
      return { ...prev, order: nextOrder, updated_at: new Date().toISOString() };
    });
  }, [map, progress.answers.length]);

  // ── seed the goal once, from the threshold question ──
  useEffect(() => {
    if (!hydrated.current) return;
    if (progress.goal || !goalSeed) return;
    setProgress((prev) => (prev.goal ? prev : { ...prev, goal: goalSeed, updated_at: new Date().toISOString() }));
  }, [goalSeed, progress.goal]);

  // ── persist: local draft every change (sync), remote every change (debounced) ──
  useEffect(() => {
    if (!userId || !hydrated.current) return;
    try {
      localStorage.setItem(draftKey(userId), JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress, userId]);

  const syncRemote = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!userId || !hydrated.current) return;
    if (syncRemote.current) clearTimeout(syncRemote.current);
    syncRemote.current = setTimeout(() => {
      (async () => {
        try {
          await supabase.from("awakening_progress").upsert(
            {
              user_id: userId,
              current_session_id: progress.current_session_id,
              completed_session_ids: progress.completed_session_ids,
              answers: progress.answers as unknown as Json,
              vows: progress.vows as unknown as Json,
              vow_results: progress.vow_results as unknown as Json,
              carry_seeds: progress.carry_seeds as unknown as Json,
              session_order: progress.order,
              goal: progress.goal,
              completed_at: progress.completed_at,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } catch {
          /* offline-safe: local draft already saved */
        }
      })();
    }, 800);
    return () => {
      if (syncRemote.current) clearTimeout(syncRemote.current);
    };
  }, [progress, userId]);

  const answerQuestion = useCallback((answer: AwakeningAnswer) => {
    setProgress((prev) => ({
      ...prev,
      answers: [...prev.answers.filter((a) => a.questionId !== answer.questionId), answer],
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const completeSession = useCallback((session: AwakeningSession, vow: string) => {
    setProgress((prev) => {
      if (prev.completed_session_ids.includes(session.id)) return prev;
      const completed = [...prev.completed_session_ids, session.id];
      const allDone = completed.length >= AWAKENING_TOTAL;
      return {
        ...prev,
        completed_session_ids: completed,
        current_session_id: nextInOrder(prev.order, completed),
        vows: { ...prev.vows, [session.id]: vow },
        carry_seeds: { ...prev.carry_seeds, [session.id]: session.carrySeed },
        completed_at: allDone ? new Date().toISOString() : prev.completed_at,
        updated_at: new Date().toISOString(),
      };
    });
  }, []);

  const recordVowResult = useCallback((sessionId: string, result: VowResult) => {
    setProgress((prev) => ({
      ...prev,
      vow_results: { ...prev.vow_results, [sessionId]: result },
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const setGoal = useCallback((goal: string | null) => {
    setProgress((prev) => ({ ...prev, goal, updated_at: new Date().toISOString() }));
  }, []);

  const resetAll = useCallback(() => {
    setProgress(emptyProgress());
  }, []);

  const nextSession = useMemo(() => {
    const nextId = nextInOrder(
      progress.order.length ? progress.order : personalOrder(map).map((o) => o.id),
      progress.completed_session_ids
    );
    return nextId ? AWAKENING_SESSION_BY_ID(nextId) ?? null : null;
  }, [progress.order, progress.completed_session_ids, map]);

  const nextPosition = useMemo(() => {
    const order = progress.order.length ? progress.order : AWAKENING_TOTAL_ORDER();
    const nextId = nextInOrder(order, progress.completed_session_ids);
    return nextId ? order.indexOf(nextId) + 1 : 0;
  }, [progress.order, progress.completed_session_ids]);

  return {
    progress,
    map,
    loading,
    nextSession,
    nextPosition,
    answerQuestion,
    completeSession,
    recordVowResult,
    setGoal,
    resetAll,
  };
}

function AWAKENING_TOTAL_ORDER(): string[] {
  return Array.from({ length: AWAKENING_TOTAL }, (_, i) => AWAKENING_SESSION_BY_N(i + 1)?.id ?? "");
}

/** First session in the personal order that is not yet complete. */
function nextInOrder(order: string[], completed: string[]): string {
  for (const id of order) {
    if (id && !completed.includes(id)) return id;
  }
  return completed.length >= AWAKENING_TOTAL ? "" : (order[0] ?? "");
}

function normalize(row: Record<string, unknown>): AwakeningProgress {
  const base = emptyProgress();
  return {
    ...base,
    current_session_id: typeof row.current_session_id === "string" ? row.current_session_id : base.current_session_id,
    completed_session_ids: Array.isArray(row.completed_session_ids)
      ? (row.completed_session_ids as string[])
      : [],
    answers: Array.isArray(row.answers) ? (row.answers as AwakeningAnswer[]) : [],
    vows: row.vows && typeof row.vows === "object" ? (row.vows as Record<string, string>) : {},
    vow_results:
      row.vow_results && typeof row.vow_results === "object"
        ? (row.vow_results as Record<string, VowResult>)
        : {},
    carry_seeds:
      row.carry_seeds && typeof row.carry_seeds === "object" ? (row.carry_seeds as Record<string, string>) : {},
    order: Array.isArray(row.session_order) && row.session_order.length ? (row.session_order as string[]) : base.order,
    goal: typeof row.goal === "string" ? row.goal : null,
    completed_at: typeof row.completed_at === "string" ? row.completed_at : null,
    updated_at: new Date().toISOString(),
  };
}
