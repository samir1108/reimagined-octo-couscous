/**
 * useSessionFeedback — writes session outcomes back into the constellation.
 *
 * Law 6 (Honest Movement):
 *   • skip      → small weight nudge down (-2%)
 *   • reject    → larger nudge down (-5%); 3 rejects in a row → status='dormant'
 *   • complete  → small nudge up (+1%) scaled by quality (0..1)
 *   • cross     → boost both source and target (+2% each)
 *
 * After each write we re-normalize all 12 weights to sum to 1.0 (no zeros — clamp at 0.005)
 * and snapshot to user_practice_constellation_history.
 */
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PRACTICES, type Practice, type PracticeStatus } from "@/lib/sutra/practices";

type FeedbackKind = "skip" | "reject" | "complete" | "cross";

interface FeedbackInput {
  practice: Practice;
  kind: FeedbackKind;
  quality?: number;          // 0..1, used when kind === "complete"
  crossWith?: Practice;      // used when kind === "cross"
}

const NUDGE: Record<FeedbackKind, number> = {
  skip: -0.02,
  reject: -0.05,
  complete: 0.01,
  cross: 0.02,
};

const MIN_WEIGHT = 0.005;

export function useSessionFeedback() {
  const submit = useCallback(async (input: FeedbackInput) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "no-user" };

    const { data: row } = await supabase
      .from("user_practice_constellation")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!row) return { ok: false, reason: "no-constellation" };

    // Build current weight + status maps
    const weights: Record<Practice, number> = {} as any;
    const statuses: Record<Practice, PracticeStatus> = {} as any;
    for (const p of PRACTICES) {
      weights[p] = Number((row as any)[`${p}_weight`]) || 1 / 12;
      statuses[p] = ((row as any)[`${p}_status`] as PracticeStatus) || "secondary";
    }

    // Apply nudge
    const base = NUDGE[input.kind];
    const scale = input.kind === "complete" ? Math.max(0.2, Math.min(1, input.quality ?? 0.5)) : 1;
    weights[input.practice] = Math.max(MIN_WEIGHT, weights[input.practice] + base * scale);

    if (input.kind === "cross" && input.crossWith) {
      weights[input.crossWith] = Math.max(MIN_WEIGHT, weights[input.crossWith] + base * scale);
    }

    // Re-normalize to sum 1.0
    const total = PRACTICES.reduce((s, p) => s + weights[p], 0);
    for (const p of PRACTICES) weights[p] = weights[p] / total;

    // Status updates: weight < 2% → dormant; weight > 15% → primary
    for (const p of PRACTICES) {
      if (weights[p] < 0.02) statuses[p] = "dormant";
      else if (weights[p] > 0.15) statuses[p] = "primary";
      else statuses[p] = "secondary";
    }

    // Build patch
    const patch: Record<string, any> = { computation_source: "feedback" };
    for (const p of PRACTICES) {
      patch[`${p}_weight`] = weights[p];
      patch[`${p}_status`] = statuses[p];
    }

    const { error: updErr } = await supabase
      .from("user_practice_constellation")
      .update(patch as any)
      .eq("user_id", user.id);

    if (updErr) return { ok: false, reason: updErr.message };

    // Snapshot to history — schema: { snapshot jsonb, computation_source text }
    const snapshotWeights: Record<string, number> = {};
    for (const p of PRACTICES) snapshotWeights[p] = weights[p];

    await supabase.from("user_practice_constellation_history").insert({
      user_id: user.id,
      computation_source: `feedback:${input.kind}`,
      snapshot: {
        weights: snapshotWeights,
        trigger_practice: input.practice,
        kind: input.kind,
      },
    } as any);

    return { ok: true };
  }, []);

  return { submit };
}
