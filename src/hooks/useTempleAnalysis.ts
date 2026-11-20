/**
 * useTempleAnalysis — Fires three-lens-analyzer after temple sessions
 * This feeds Witness practice + Master chat data into the Consciousness Engine
 * so analytics/mirror reflects ALL user activity, not just Guide sessions.
 */
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface AnalyzeParams {
  text: string;
  sourceType: "witness_practice" | "master_chat" | "temple_practice";
  sourceId?: string;
}

export function useTempleAnalysis() {
  const analyzeTempleSession = useCallback(async ({ text, sourceType, sourceId }: AnalyzeParams) => {
    if (!text || text.trim().length < 20) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Fire and forget — don't block UI
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/three-lens-analyzer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: text.slice(0, 3000),
            sourceType,
            sourceId: sourceId || null,
          }),
        }
      );

      if (!resp.ok) {
        // Don't throw — this is background analysis, shouldn't block user
        console.warn("Temple analysis failed:", resp.status);
        return null;
      }

      const result = await resp.json();
      console.log(`Temple analysis (${sourceType}) complete:`, result.signals?.chitta_vritti_classification);

      // After analysis, trigger daily dimension aggregation (fire and forget)
      triggerDailyAggregation(session.access_token);

      return result;
    } catch (e) {
      console.warn("Temple analysis error:", e);
      return null;
    }
  }, []);

  return { analyzeTempleSession };
}

/** Fire-and-forget daily dimension aggregation */
async function triggerDailyAggregation(accessToken: string) {
  try {
    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aggregate-daily-dimensions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      }
    );
    console.log("Daily dimension aggregation triggered");
  } catch (e) {
    console.warn("Daily aggregation trigger failed:", e);
  }
}
