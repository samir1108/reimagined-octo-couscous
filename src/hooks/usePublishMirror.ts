/**
 * usePublishMirror — persists the finished First-Eleven mapping into the
 * user's consciousness profile (Gate 4).
 *
 * Read-modify-write so the Foundation's assessment_data is never clobbered,
 * and a publishedAt guard so the write happens once, not on every visit.
 * Offline-safe: failure is silent — the local mapping still renders.
 */
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { FirstElevenMapping } from "@/lib/onboarding/firstElevenTypes";

export function usePublishMirror(
  userId: string | null,
  mapping: FirstElevenMapping,
  enabled: boolean
) {
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
          (existing as { first_eleven_mapping?: { publishedAt?: string } }).first_eleven_mapping
            ?.publishedAt
        ) {
          return; // already published
        }
        if (cancelled) return;

        await supabase.from("user_consciousness_profile").upsert(
          {
            user_id: userId,
            assessment_data: {
              ...existing,
              first_eleven_mapping: {
                band: mapping.band,
                bandMicro: mapping.bandMicro,
                bandLabel: mapping.bandLabel,
                dimensions: mapping.dimensions,
                loops: mapping.loops,
                archetype: mapping.archetypeHint,
                summaryLines: mapping.summaryLines,
                answeredCount: mapping.answeredCount,
                readyForJourneys: mapping.readyForJourneys,
                publishedAt: new Date().toISOString(),
              },
            },
          },
          { onConflict: "user_id" }
        );
      } catch {
        /* offline-safe: local mapping still shows */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, mapping]);
}
