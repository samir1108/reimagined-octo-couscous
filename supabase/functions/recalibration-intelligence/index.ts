// recalibration-intelligence
// The "brain" that decides WHEN, WHAT MAGNITUDE, and WHY to recalibrate.
// Reads multi-source signals → computes drift score → picks decision →
// optionally invokes recalibrate-constellation, and always logs to
// recalibration_events for audit + UI surfacing.
//
// Modes:
//   POST { user_id }              → decide for one user
//   POST { all: true }            → decide for all active users (cron)
//   POST { user_id, force: true } → user-triggered "recalibrate me now"
//
// Decision matrix:
//   drift < 0.20  → none
//   0.20 - 0.50   → minor   (blend 0.85/0.15)
//   0.50 - 0.80   → major   (blend 0.60/0.40)
//   > 0.80        → reassess (UI prompt; do not auto-blend)
//   dark_night flag → dark_night (no aggressive change; protective hold)

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Decision = "none" | "minor" | "major" | "reassess" | "dark_night";

interface DriftSignals {
  dimensionVariance: number;     // 0-1
  witnessGapDelta: number;       // 0-1
  bypassingSpike: number;        // 0-1
  regressionDelta: number;       // 0-1
  plateauScore: number;          // 0-1 (1 = stuck)
  darkNightActive: boolean;
  longPause: boolean;            // > 14d gap
  predictiveRisk: number;        // 0-1 from predictive_signals
  effectivenessDrop: number;     // 0-1 on dominant path
  daysSinceLast: number;
}

const WEIGHTS = {
  dimensionVariance: 0.18,
  witnessGapDelta:   0.14,
  bypassingSpike:    0.14,
  regressionDelta:   0.18,
  plateauScore:      0.12,
  predictiveRisk:    0.12,
  effectivenessDrop: 0.12,
};

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

async function gatherSignals(supabase: any, userId: string): Promise<{
  signals: DriftSignals;
  reasons: string[];
  snapshot: Record<string, unknown>;
}> {
  const reasons: string[] = [];
  const since14 = new Date(Date.now() - 14 * 86400_000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();

  // Profile
  const { data: profile } = await supabase
    .from("user_consciousness_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Last recalibration
  const { data: lastEvent } = await supabase
    .from("recalibration_events")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const daysSinceLast = lastEvent?.created_at
    ? Math.floor((Date.now() - new Date(lastEvent.created_at).getTime()) / 86400_000)
    : 999;

  // Dimension variance: compare current bands to baseline (assessment_data.baseline_bands)
  const currentBands = (profile?.dimension_bands ?? {}) as Record<string, number>;
  const baselineBands = ((profile?.assessment_data ?? {}) as any)?.baseline_bands
    ?? currentBands;
  let varianceSum = 0; let n = 0;
  for (const k of Object.keys(currentBands)) {
    const cur = Number(currentBands[k]) || 0;
    const base = Number(baselineBands[k]) || 0;
    varianceSum += Math.abs(cur - base);
    n++;
  }
  const dimensionVariance = clamp01(n ? (varianceSum / n) / 4 : 0); // /4 normalises ~max delta
  if (dimensionVariance > 0.4) reasons.push("dimension_drift");

  // Witness gap delta
  const witnessGap = Number(profile?.witness_gap) || 0;
  const witnessGapDelta = clamp01(witnessGap);
  if (witnessGap > 0.5) reasons.push("witness_gap_high");

  // Bypassing risk spike
  const bypassingSpike = clamp01(Number(profile?.bypassing_risk) || 0);
  if (bypassingSpike > 0.5) reasons.push("spiritual_bypassing");

  // Regression
  const regression = (profile?.regression ?? {}) as any;
  const regressionDelta = clamp01(Math.abs(Number(regression?.current_delta) || 0));
  const darkNightActive = Number(regression?.dark_night_count) > 0
    && regressionDelta > 0.4;
  if (regressionDelta > 0.3) reasons.push("regression");
  if (darkNightActive) reasons.push("dark_night");

  // Long pause
  const lastSession = profile?.last_session_at ? new Date(profile.last_session_at).getTime() : 0;
  const daysSinceSession = lastSession
    ? Math.floor((Date.now() - lastSession) / 86400_000)
    : 999;
  const longPause = daysSinceSession > 14;
  if (longPause) reasons.push("long_pause");

  // Plateau: no level changes in last 21 days on active practices
  const { data: speedHist } = await supabase
    .from("speed_profile_history")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 21 * 86400_000).toISOString())
    .limit(1);
  const plateauScore = (!speedHist || speedHist.length === 0) && (profile?.total_sessions ?? 0) > 10
    ? 0.7 : 0.0;
  if (plateauScore > 0.5) reasons.push("plateau");

  // Predictive risk
  const { data: predictive } = await supabase
    .from("predictive_signals")
    .select("urgency, signal_type")
    .eq("user_id", userId)
    .gte("created_at", since14)
    .order("created_at", { ascending: false })
    .limit(20);
  const predictiveRisk = predictive && predictive.length
    ? clamp01(predictive.reduce((s: number, r: any) => s + Number(r.urgency || 0), 0) / predictive.length)
    : 0;
  if (predictiveRisk > 0.5) reasons.push("predictive_risk");

  // Effectiveness drop on dominant path practices
  const dominant = profile?.dominant_path as string | null;
  let effectivenessDrop = 0;
  if (dominant) {
    const { data: eff } = await supabase
      .from("practice_effectiveness")
      .select("effectiveness_score, practice")
      .eq("user_id", userId)
      .gte("last_used_at", since30);
    if (eff && eff.length) {
      const matched = eff.filter((r: any) =>
        (r.practice || "").toLowerCase().includes(dominant.toLowerCase()));
      if (matched.length) {
        const avg = matched.reduce((s: number, r: any) => s + Number(r.effectiveness_score || 0), 0) / matched.length;
        effectivenessDrop = clamp01(1 - avg);
        if (effectivenessDrop > 0.4) reasons.push("path_effectiveness_drop");
      }
    }
  }

  const signals: DriftSignals = {
    dimensionVariance,
    witnessGapDelta,
    bypassingSpike,
    regressionDelta,
    plateauScore,
    darkNightActive,
    longPause,
    predictiveRisk,
    effectivenessDrop,
    daysSinceLast,
  };

  return {
    signals,
    reasons,
    snapshot: {
      currentBands, baselineBands, witnessGap, bypassingSpike,
      regression, daysSinceSession, dominant, predictiveCount: predictive?.length ?? 0,
    },
  };
}

function decide(signals: DriftSignals): { decision: Decision; drift: number } {
  if (signals.darkNightActive) return { decision: "dark_night", drift: 0.9 };

  const drift = clamp01(
    signals.dimensionVariance * WEIGHTS.dimensionVariance +
    signals.witnessGapDelta   * WEIGHTS.witnessGapDelta   +
    signals.bypassingSpike    * WEIGHTS.bypassingSpike    +
    signals.regressionDelta   * WEIGHTS.regressionDelta   +
    signals.plateauScore      * WEIGHTS.plateauScore      +
    signals.predictiveRisk    * WEIGHTS.predictiveRisk    +
    signals.effectivenessDrop * WEIGHTS.effectivenessDrop
  );

  // Cooldown: don't recalibrate the same user more than once per 3 days
  // unless drift is severe.
  if (signals.daysSinceLast < 3 && drift < 0.7) return { decision: "none", drift };

  if (drift < 0.20) return { decision: "none", drift };
  if (drift < 0.50) return { decision: "minor", drift };
  if (drift < 0.80) return { decision: "major", drift };
  return { decision: "reassess", drift };
}

async function processUser(supabase: any, userId: string, force = false) {
  const { signals, reasons, snapshot } = await gatherSignals(supabase, userId);
  let { decision, drift } = decide(signals);

  if (force && decision === "none") decision = "minor";

  let applied = false;
  let appliedAt: string | null = null;

  // Auto-apply minor / major via existing recalibrate-constellation.
  // reassess + dark_night are user-facing prompts — never auto-mutate the path.
  if (decision === "minor" || decision === "major") {
    try {
      const { error } = await supabase.functions.invoke("recalibrate-constellation", {
        body: { user_id: userId, mode: decision },
      });
      if (!error) {
        applied = true;
        appliedAt = new Date().toISOString();
      }
    } catch (_e) { /* swallow — still log decision */ }
  }

  await supabase.from("recalibration_events").insert({
    user_id: userId,
    decision,
    drift_score: Number(drift.toFixed(3)),
    reasons,
    signals_snapshot: { ...snapshot, signals },
    applied,
    applied_at: appliedAt,
  });

  return { user_id: userId, decision, drift, reasons, applied };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("apikey");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller's JWT. This function writes recalibration_events for
    // arbitrary user ids via the service-role key — without this check any
    // anonymous caller could drive every user's recalibration state.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    const supabase = createClient(supabaseUrl, serviceRole);

    const body = await req.json().catch(() => ({}));

    if (body?.all === true) {
      // Cron path: process users with a session in the last 30 days.
      // Internal only — admitted via CRON_SECRET, not anon access.
      const cronSecret = Deno.env.get("CRON_SECRET");
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: "Forbidden — bulk recalibration requires CRON_SECRET" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data: users } = await supabase
        .from("user_consciousness_profile")
        .select("user_id")
        .gte("last_session_at", since)
        .limit(500);
      const results = [];
      for (const u of users ?? []) {
        try { results.push(await processUser(supabase, u.user_id)); }
        catch (e) { results.push({ user_id: u.user_id, error: String(e) }); }
      }
      return new Response(JSON.stringify({ processed: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = body?.user_id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single-user path: a valid user session may only target itself.
    if (authError || !user || String(userId) !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden — cannot decide for another user" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await processUser(supabase, userId, !!body?.force);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
