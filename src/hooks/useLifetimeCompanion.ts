/**
 * useLifetimeCompanion — wires Batch 9 + 14 engines into a single hook
 * Surfaces lifetime phase, relationship depth, life-stage tone hint,
 * and retention prescription. Pure client-side computation over profile data.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { computeLifetimePhase, phaseProgress, shouldUseSilentMode } from "@/lib/consciousness/lifetimeSpiral";
import { computeRelationship } from "@/lib/consciousness/relationshipDepth";
import { detectLifeStage, getLifeStageProfile } from "@/lib/consciousness/lifeStageDetector";
import { computeRetention } from "@/lib/consciousness/retentionEngine";

export function useLifetimeCompanion(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["lifetime-companion", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      if (!userId) return null;

      const [profileRes, sessionsCountRes, journalsCountRes, lastSessionRes, breakthroughsRes, recentSessionsRes] =
        await Promise.all([
          supabase
            .from("user_consciousness_profile")
            .select("v_level_current,journey_day,total_sessions,total_journal_entries,last_session_at")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase.from("daily_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase
            .from("daily_sessions")
            .select("created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("arc_history")
            .select("breakthroughs_detected")
            .eq("user_id", userId),
          supabase
            .from("sessions")
            .select("type_payload,created_at")
            .eq("user_id", userId)
            .eq("type", "practice")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      const profile = profileRes.data;
      const totalSessions = sessionsCountRes.count ?? profile?.total_sessions ?? 0;
      const totalJournals = journalsCountRes.count ?? profile?.total_journal_entries ?? 0;
      const breakthroughs =
        (breakthroughsRes.data || []).reduce((sum, r: any) => sum + (r.breakthroughs_detected || 0), 0) || 0;

      const firstSeen =
        lastSessionRes.data?.created_at ||
        new Date().toISOString();

      // recentSessionsRes now returns rows from unified `sessions` table; v2 fields live in type_payload.
      const recent = recentSessionsRes.data || [];
      const recentQualityAvg =
        recent.length > 0
          ? recent.reduce((s: number, r: any) => s + ((r.type_payload?.quality_score) ?? 0.5), 0) / recent.length
          : 0.5;

      const lastAt = profile?.last_session_at ? new Date(profile.last_session_at).getTime() : Date.now();
      const daysSinceLastSession = Math.max(0, Math.floor((Date.now() - lastAt) / 86_400_000));

      // Phase
      const vLevel = profile?.v_level_current ?? 0;
      const daysActive = profile?.journey_day ?? 0;
      const phase = computeLifetimePhase({ vLevel, daysActive, breakthroughs });
      const phaseProg = phaseProgress({ vLevel, daysActive, breakthroughs });
      const silentMode = shouldUseSilentMode(phase.phase);

      // Relationship
      const relationship = computeRelationship({
        firstSeenAt: firstSeen,
        totalSessions,
        totalJournals,
      });

      // Life stage (best-effort; no age column today → undefined → "student")
      const lifeStage = detectLifeStage(undefined);
      const lifeStageProfile = getLifeStageProfile(lifeStage);

      // Retention
      const retention = computeRetention({
        daysSinceLastSession,
        consecutiveSkippedDays: daysSinceLastSession,
        recentQualityAvg,
        totalSessions,
      });

      return {
        phase,
        phaseProgress: phaseProg,
        silentMode,
        relationship,
        lifeStage,
        lifeStageProfile,
        retention,
        vLevel,
      };
    },
  });
}
