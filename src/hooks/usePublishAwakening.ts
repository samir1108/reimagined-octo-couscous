/**
 * usePublishAwakening — persists the finished capability map into the
 * user's consciousness profile.
 *
 * Read-modify-write so the Foundation's assessment_data is never clobbered,
 * and a publishedAt guard so the write happens once, not on every visit.
 * Offline-safe: failure is silent — the local map still renders.
 */
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { AwakeningProgress, CapabilityMap } from "@/lib/onboarding/awakening";
import { loopsFromAnswers } from "@/lib/onboarding/awakening";

export function usePublishAwakening(
  userId: string | null,
  map: CapabilityMap,
  progress: AwakeningProgress,
  enabled: boolean
) {
  const completedCount = progress.completed_session_ids.length;

  useEffect(() => {
    if (!userId || !enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase
          .from("user_consciousness_profile")
          .select("assessment_data")
          .eq("user_id", userId)
          .maybeSingle();
        const existing = (data?.assessment_data ?? {}) as Record<string, unknown>;
        if (
          (existing as { awakening_map?: { publishedAt?: string } }).awakening_map?.publishedAt
        ) {
          return; // already published
        }
        if (cancelled) return;

        await supabase.from("user_consciousness_profile").upsert(
          {
            user_id: userId,
            assessment_data: {
              ...existing,
              awakening_map: {
                scores: map.scores,
                levels: map.levels,
                loops: loopsFromAnswers(progress.answers),
                answeredCount: progress.answers.length,
                completedSessions: completedCount,
                publishedAt: new Date().toISOString(),
              },
            },
          },
          { onConflict: "user_id" }
        );
      } catch {
        /* offline-safe: local map still shows */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, map, progress.answers, completedCount]);
}
