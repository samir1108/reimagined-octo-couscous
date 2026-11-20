/**
 * useFirstEleven — progress persistence for The First Eleven.
 * ─────────────────────────────────
 * Local-first: an in-memory + localStorage draft is the source of truth
 * during a sitting (offline-safe), synced to `first_eleven_progress` in
 * Supabase after every answer and on sitting close. If the table is not
 * reachable the sitting keeps working — the mapping still computes locally.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FirstElevenProgress, SEAnswer, FirstElevenMapping } from "@/lib/onboarding/firstElevenTypes";
import { analyzeFirstEleven } from "@/lib/onboarding/firstElevenEngine";
import type { ConditioningResult } from "@/lib/onboarding/conditioningQuestions";
import type { FoundationAnswers } from "@/lib/onboarding/foundationAnalyzer";
import type { Json } from "@/integrations/supabase/types";

const draftKey = (uid: string) => `first_eleven_draft_${uid}`;

function emptyProgress(): FirstElevenProgress {
  return {
    current_session: 1,
    completed_sessions: [],
    answers: [],
    carry_seeds: {},
    skipped: false,
    completed_at: null,
    updated_at: new Date().toISOString(),
  };
}

function readDraft(uid: string): FirstElevenProgress | null {
  try {
    const raw = localStorage.getItem(draftKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirstElevenProgress;
    // basic shape guard
    if (!Array.isArray(parsed.completed_sessions) || !Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface UseFirstEleven {
  progress: FirstElevenProgress;
  mapping: FirstElevenMapping;
  loading: boolean;
  answerQuestion: (answer: SEAnswer) => void;
  completeSession: (n: number, carrySeed: string) => void;
  skipSession: (n: number) => void;
  finishAll: () => void;
  resetAll: () => void;
  nextSession: () => number; // session n to start next (1-11)
}

export function useFirstEleven(
  userId: string | null,
  seeds?: { conditioning?: ConditioningResult | null; foundationAnswers?: FoundationAnswers | null }
): UseFirstEleven {
  const [progress, setProgress] = useState<FirstElevenProgress>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  // ── load: remote first, local draft as fallback ──
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("first_eleven_progress")
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

    return () => { cancelled = true; };
  }, [userId]);

  // ── persist: local draft every change (sync), remote every change (debounced) ──
  useEffect(() => {
    if (!userId || !hydrated.current) return;
    try { localStorage.setItem(draftKey(userId), JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress, userId]);

  const syncRemote = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!userId || !hydrated.current) return;
    if (syncRemote.current) clearTimeout(syncRemote.current);
    syncRemote.current = setTimeout(() => {
      (async () => {
        try {
          await supabase.from("first_eleven_progress").upsert(
            {
              user_id: userId,
              current_session: progress.current_session,
              completed_sessions: progress.completed_sessions,
              answers: progress.answers as unknown as Json,
              carry_seeds: progress.carry_seeds as unknown as Json,
              skipped: progress.skipped,
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

  const mapping = useMemo(
    () =>
      analyzeFirstEleven({
        progress,
        conditioning: seeds?.conditioning ?? null,
        foundationAnswers: seeds?.foundationAnswers ?? null,
      }),
    [progress, seeds?.conditioning, seeds?.foundationAnswers]
  );

  const answerQuestion = useCallback((answer: SEAnswer) => {
    setProgress((prev) => ({
      ...prev,
      answers: [...prev.answers.filter((a) => a.questionId !== answer.questionId), answer],
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const completeSession = useCallback((n: number, carrySeed: string) => {
    setProgress((prev) => {
      if (prev.completed_sessions.includes(n)) return prev;
      const completed = [...prev.completed_sessions, n].sort((a, b) => a - b);
      const allDone = completed.length >= 11;
      return {
        ...prev,
        completed_sessions: completed,
        current_session: Math.min(11, n + 1),
        carry_seeds: { ...prev.carry_seeds, [n]: carrySeed },
        completed_at: allDone ? new Date().toISOString() : prev.completed_at,
        updated_at: new Date().toISOString(),
      };
    });
  }, []);

  const skipSession = useCallback((n: number) => {
    setProgress((prev) => ({
      ...prev,
      current_session: Math.min(11, n + 1),
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const finishAll = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      skipped: true,
      completed_at: prev.completed_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const resetAll = useCallback(() => {
    setProgress(emptyProgress());
  }, []);

  const nextSession = useCallback(() => {
    return progress.completed_sessions.length >= 11 ? 0 : Math.min(11, progress.current_session);
  }, [progress]);

  return {
    progress,
    mapping,
    loading,
    answerQuestion,
    completeSession,
    skipSession,
    finishAll,
    resetAll,
    nextSession,
  };
}

function normalize(row: Record<string, unknown>): FirstElevenProgress {
  const base = emptyProgress();
  return {
    ...base,
    current_session: typeof row.current_session === "number" ? row.current_session : 1,
    completed_sessions: Array.isArray(row.completed_sessions) ? (row.completed_sessions as number[]) : [],
    answers: Array.isArray(row.answers) ? (row.answers as SEAnswer[]) : [],
    carry_seeds: row.carry_seeds && typeof row.carry_seeds === "object" ? (row.carry_seeds as Record<number, string>) : {},
    skipped: row.skipped === true,
    completed_at: typeof row.completed_at === "string" ? row.completed_at : null,
    updated_at: new Date().toISOString(),
  };
}
