/**
 * The Fusion Engine.
 * Pulls the last 30 min of bio/work/device signals for every user, normalizes
 * them to [0..1], scores stress/focus/burnout-risk, picks a recommended action,
 * and writes one row to fused_signals.
 *
 * Designed to run from pg_cron every 5 minutes.
 */
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function clamp(x: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, x));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const since = new Date(Date.now() - 30 * 60_000).toISOString();

  // Pull recent activity per user across all 3 layers
  const [{ data: bio }, { data: work }, { data: dev }] = await Promise.all([
    admin
      .from("bio_signals")
      .select("user_id, metric, value, recorded_at")
      .gte("recorded_at", since),
    admin
      .from("work_signals")
      .select("user_id, signal_type, value, text_value, occurred_at")
      .gte("occurred_at", since),
    admin
      .from("device_signals")
      .select("user_id, signal_type, category, value, bucket_start")
      .gte("bucket_start", since),
  ]);

  const users = new Set<string>();
  (bio ?? []).forEach((r: any) => users.add(r.user_id));
  (work ?? []).forEach((r: any) => users.add(r.user_id));
  (dev ?? []).forEach((r: any) => users.add(r.user_id));

  const rows: any[] = [];
  for (const uid of users) {
    const userBio = (bio ?? []).filter((r: any) => r.user_id === uid);
    const userWork = (work ?? []).filter((r: any) => r.user_id === uid);
    const userDev = (dev ?? []).filter((r: any) => r.user_id === uid);

    const hrv = userBio.find((r: any) => r.metric === "hrv_rmssd")?.value as number | undefined;
    const rhr = userBio.find((r: any) => r.metric === "rhr")?.value as number | undefined;
    const sleep = userBio.find((r: any) => r.metric === "sleep_score")?.value as
      | number
      | undefined;

    const hrv_norm = hrv ? clamp((hrv - 10) / 90) : null;
    const charged = userWork.filter((r: any) => r.text_value === "charged").length;
    const calm = userWork.filter((r: any) => r.text_value === "calm").length;
    const workloadRow = userWork.find((r: any) => r.signal_type === "workload");
    const workload = workloadRow ? Math.max(0, Math.min(1, workloadRow.value ?? 0)) : 0;
    const lateNightRow = userWork.find((r: any) => r.signal_type === "late_night_commits");
    const lateNight = lateNightRow ? Math.max(0, Math.min(1, lateNightRow.value ?? 0)) : 0;
    const tone_load = clamp((charged - calm) / 5 + 0.5);
    const pickups = userDev
      .filter((r: any) => r.signal_type === "phone_pickups")
      .reduce((a: number, b: any) => a + (b.value ?? 0), 0);
    const restlessness = clamp(pickups / 30);
    const jitter = userDev.find((r: any) => r.category === "anxious") ? 0.7 : 0.3;

    const stress_norm = clamp(
      (1 - (hrv_norm ?? 0.5)) * 0.35 + tone_load * 0.25 + restlessness * 0.15 + jitter * 0.1 + workload * 0.15,
    );
    const focus_norm = clamp(
      (sleep ? sleep / 100 : 0.5) * 0.35 + (1 - restlessness) * 0.25 + (1 - tone_load) * 0.2 + (1 - workload) * 0.2,
    );
    const burnout_risk = clamp(stress_norm * 0.5 + (1 - focus_norm) * 0.25 + workload * 0.15 + lateNight * 0.1);

    const detected_loops: string[] = [];
    if (restlessness > 0.6) detected_loops.push("RES003");
    if (tone_load > 0.7) detected_loops.push("EMO012");
    if (hrv_norm !== null && hrv_norm < 0.25) detected_loops.push("BIO005");
    if (sleep !== undefined && sleep < 60) detected_loops.push("REC001");
    if (workload > 0.7) detected_loops.push("WRK001");
    if (lateNight > 0.5) detected_loops.push("REC002");
    if (burnout_risk > 0.75) detected_loops.push("BUR001");

    let recommended_action = "witness_5min";
    if (burnout_risk > 0.75) recommended_action = "rest_protocol";
    else if (lateNight > 0.6) recommended_action = "sleep_anchor";
    else if (workload > 0.75) recommended_action = "boundary_breath";
    else if (restlessness > 0.6) recommended_action = "walking_meditation";
    else if (tone_load > 0.7) recommended_action = "cooling_breath";
    else if (focus_norm > 0.7) recommended_action = "deep_work_block";

    rows.push({
      user_id: uid,
      hrv_norm,
      stress_norm,
      focus_norm,
      burnout_risk,
      recommended_action,
      detected_loops,
      inputs_summary: {
        bio_count: userBio.length,
        work_count: userWork.length,
        dev_count: userDev.length,
        hrv,
        rhr,
        sleep,
        pickups,
        charged,
        calm,
        workload,
        lateNight,
      },
    });
  }

  if (rows.length) await admin.from("fused_signals").insert(rows);

  // Fire instant-pulse-detector to queue acute nudges (best-effort, fire-and-forget)
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/instant-pulse-detector`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
      body: JSON.stringify({}),
    });
  } catch (_) { /* swallow */ }

  return new Response(JSON.stringify({ ok: true, fused: rows.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
