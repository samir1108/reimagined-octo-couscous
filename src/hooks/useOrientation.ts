/**
 * useOrientation — single source of truth for the 30-session Orientation Path.
 *
 * Reads/writes `user_orientation_progress` and exposes the current session,
 * act, and completion helpers. Components branch on `inOrientation` to render
 * the orientation player in place of the normal home slot.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ORIENTATION_SESSIONS,
  ORIENTATION_TOTAL,
  getOrientationSession,
  getActForSession,
  type OrientationSession,
} from "@/data/programs/v2/orientation";

interface OrientationRow {
  user_id: string;
  current_session: number;
  completed_sessions: number[];
  current_act: number;
  completed_at: string | null;
  skipped: boolean;
}

interface UseOrientationResult {
  loading: boolean;
  inOrientation: boolean;
  currentIndex: number;
  currentAct: number;
  totalSessions: number;
  currentSession: OrientationSession | null;
  completedCount: number;
  actMilestoneJustHit: boolean;
  completeCurrent: (qualityScore?: number) => Promise<void>;
  skip: () => Promise<void>;
  acknowledgeMilestone: () => void;
}

export function useOrientation(userId: string | undefined): UseOrientationResult {
  const [row, setRow] = useState<OrientationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestoneFlag, setMilestoneFlag] = useState(false);

  // Load (or create) the user's orientation row.
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_orientation_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setRow(data as unknown as OrientationRow);
      } else {
        // First-time user — create the row at session 1.
        const { data: created } = await supabase
          .from("user_orientation_progress")
          .insert({ user_id: userId })
          .select()
          .single();
        if (!cancelled && created) setRow(created as unknown as OrientationRow);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const inOrientation =
    !!row && !row.completed_at && !row.skipped && row.current_session <= ORIENTATION_TOTAL;

  const currentIndex = row?.current_session ?? 1;
  const currentSession = inOrientation ? getOrientationSession(currentIndex) ?? null : null;
  const currentAct = row?.current_act ?? 1;

  const completeCurrent = useCallback(
    async (_qualityScore?: number) => {
      if (!row || !userId) return;
      const next = row.current_session + 1;
      const nextAct = next > ORIENTATION_TOTAL ? 6 : getActForSession(next).id;
      const justCrossedAct = nextAct !== row.current_act;
      const isLast = row.current_session >= ORIENTATION_TOTAL;

      const update: Partial<OrientationRow> = {
        current_session: next,
        completed_sessions: [...new Set([...row.completed_sessions, row.current_session])],
        current_act: nextAct,
        ...(isLast ? { completed_at: new Date().toISOString() } : {}),
      };

      const { data } = await supabase
        .from("user_orientation_progress")
        .update({
          ...update,
          last_session_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (data) setRow(data as unknown as OrientationRow);
      if (justCrossedAct || isLast) setMilestoneFlag(true);
    },
    [row, userId],
  );

  const skip = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("user_orientation_progress")
      .update({
        skipped: true,
        completed_at: new Date().toISOString(),
        current_session: ORIENTATION_TOTAL + 1,
        current_act: 6,
      })
      .eq("user_id", userId)
      .select()
      .single();
    if (data) setRow(data as unknown as OrientationRow);
  }, [userId]);

  const acknowledgeMilestone = useCallback(() => setMilestoneFlag(false), []);

  return {
    loading,
    inOrientation,
    currentIndex,
    currentAct,
    totalSessions: ORIENTATION_TOTAL,
    currentSession,
    completedCount: row?.completed_sessions.length ?? 0,
    actMilestoneJustHit: milestoneFlag,
    completeCurrent,
    skip,
    acknowledgeMilestone,
  };
}

// Convenience: count for UI components without re-fetching.
export const ORIENTATION_LENGTH = ORIENTATION_SESSIONS.length;
