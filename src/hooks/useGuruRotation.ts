/**
 * useGuruRotation — Wires the Master Rotation Engine into the app lifecycle.
 *
 * Call `checkRotation()` after a session completes (or on app load) to evaluate
 * whether the user should be paired with a different guru. If so, a row is
 * inserted into `guru_rotations` and the user is notified.
 */
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { selectMasterForRotation, type RotationContext, type RotationDecision } from "@/lib/consciousness/shared/masterSelector";
import { toast } from "@/hooks/use-toast";

export function useGuruRotation() {
  const checkRotation = useCallback(async (opts?: { silent?: boolean }): Promise<RotationDecision | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 1. Most recent rotation = current guru
      const { data: lastRot } = await supabase
        .from("guru_rotations" as any)
        .select("to_guru_id, started_at, created_at, reason")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const rotations = (lastRot as any[]) ?? [];
      const current = rotations[0] ?? null;
      const currentGuruId: string | null = current?.to_guru_id ?? null;
      const lastAt = current?.started_at ?? current?.created_at ?? null;
      const daysSinceLastRotation = lastAt
        ? Math.floor((Date.now() - new Date(lastAt).getTime()) / 86400000)
        : 999;

      // 2. Lifetime phase + progress signals from consciousness profile
      const { data: profile } = await supabase
        .from("user_consciousness_profile" as any)
        .select("journey_phase, overall_band, dominant_path, journey_day, v_level_current, v_level_updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      const p: any = profile ?? {};
      const lifetimePhase = Math.max(1, Math.min(10, Math.ceil((p.overall_band ?? 1))));
      const vUpdated = p.v_level_updated_at ? new Date(p.v_level_updated_at).getTime() : Date.now();
      const progressStalled = Date.now() - vUpdated > 14 * 86400000;

      // 3. Active loops → dominant loop & severity
      const { data: loops } = await supabase
        .from("active_loops")
        .select("loop_id, severity")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("severity", { ascending: false })
        .limit(1);

      const dominant = (loops as any[])?.[0] ?? null;
      const dominantLoop: string | null = dominant?.loop_id ?? null;
      const loopSeverity: number = dominant?.severity ?? 0;

      // 4. Avg quality (last 7 days) — used as soft signal
      const { data: recent } = await supabase
        .from("daily_sessions")
        .select("quality_score")
        .eq("user_id", user.id)
        .gte("session_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
      const qualities = ((recent as any[]) ?? []).map((r) => r.quality_score).filter((q) => typeof q === "number");
      const avgQuality = qualities.length ? qualities.reduce((a, b) => a + b, 0) / qualities.length : 0.5;

      const ctx: RotationContext = {
        userId: user.id,
        currentGuruId,
        daysSinceLastRotation,
        lifetimePhase,
        dominantLoop,
        loopSeverity,
        avgQualityLast7Days: avgQuality,
        progressStalled,
        rotationsHistory: rotations.map((r: any) => ({
          guruId: r.to_guru_id,
          startedAt: r.started_at ?? r.created_at,
          reason: r.reason ?? "scheduled",
        })),
      };

      const decision = selectMasterForRotation(ctx);
      if (!decision.shouldRotate) return decision;

      // 5. Persist rotation
      await supabase.from("guru_rotations" as any).insert({
        user_id: user.id,
        from_guru_id: currentGuruId ?? "none",
        to_guru_id: decision.newGuruId,
        rotation_type: decision.reason,
        reason: decision.message,
        duration_days: decision.durationDays,
        started_at: new Date().toISOString(),
        expected_end_date: new Date(Date.now() + decision.durationDays * 86400000).toISOString(),
        user_notified: !opts?.silent,
      });

      // Toast intentionally suppressed — rotation is reflected silently in the UI.


      return decision;
    } catch (err) {
      console.error("[useGuruRotation] failed:", err);
      return null;
    }
  }, []);

  return { checkRotation };
}
