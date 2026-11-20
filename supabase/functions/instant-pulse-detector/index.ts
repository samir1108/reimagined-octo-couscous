/**
 * instant-pulse-detector
 * Called by signal-fusion (or directly after ingest-signal) for a specific user.
 * Detects acute spikes in the last 15 min and queues an 'instant' nudge.
 */
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { LOOP_NAMES } from "../_shared/loopMap.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? req.headers.get("apikey");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // This function reads work_signals / bio_signals with the service-role key
  // for whatever user_id the body names. Require either a verified user
  // session that matches that id, or the internal CRON_SECRET used by
  // signal-fusion. Never accept anonymous body-supplied ids.
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const userClient = anonKey ? createClient(SUPABASE_URL, anonKey, {
    global: { headers: { Authorization: authHeader } },
  }) : null;

  let bodyUserId: string | null = null;
  try {
    const body = await req.json();
    bodyUserId = body?.user_id ?? null;
  } catch (_) {}

  const cronSecret = Deno.env.get("CRON_SECRET");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  // Internal callers (signal-fusion via pg_cron) authenticate with the
  // service-role key; CRON_SECRET is the alternative convention.
  const isInternal = (!!serviceKey && authHeader === `Bearer ${serviceKey}`)
    || (!!cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isInternal) {
    if (!bodyUserId) {
      return new Response(JSON.stringify({ error: "missing user_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!userClient) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (String(bodyUserId) !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden — cannot read another user's signals" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const user_id = bodyUserId;

  // If no specific user, scan all users with very recent signals.
  // The scan-all path is internal-only: it enumerates every user's signals.
  const since = new Date(Date.now() - 15 * 60_000).toISOString();
  let userIds: string[] = [];
  if (user_id) {
    userIds = [user_id];
  } else if (isInternal) {
    const { data } = await admin.from("work_signals").select("user_id").gte("occurred_at", since);
    userIds = Array.from(new Set((data ?? []).map((r: any) => r.user_id)));
  } else {
    return new Response(JSON.stringify({ error: "missing user_id" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const nudges: any[] = [];

  for (const uid of userIds) {
    const [{ data: work }, { data: bio }] = await Promise.all([
      admin.from("work_signals").select("signal_type,source,text_value,value,occurred_at").eq("user_id", uid).gte("occurred_at", since),
      admin.from("bio_signals").select("metric,value,recorded_at").eq("user_id", uid).gte("recorded_at", since),
    ]);

    const charged = (work ?? []).filter((r: any) => r.text_value === "charged").length;
    const sources = Array.from(new Set((work ?? []).filter((r: any) => r.text_value === "charged").map((r: any) => r.source ?? "channel")));

    if (charged >= 3) {
      const today = new Date().toISOString().slice(0, 10);
      nudges.push({
        user_id: uid,
        kind: "instant",
        priority: 75,
        title: `${charged} charged messages right now`,
        body: `Across ${sources.join(", ")}. A 60-second Witness can cool the system.`,
        cta_label: "Witness 60s",
        cta_action: "open_witness",
        cta_payload: { duration_sec: 60 },
        attribution: { sources, signals: [{ kind: "charged_15min", count: charged }] },
        source: { from: "instant-pulse-detector" },
        dedupe_key: `instant:charged:${today}:${Math.floor(Date.now() / (30 * 60_000))}`,
        expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
      });
    }

    const hrv = (bio ?? []).find((r: any) => r.metric === "hrv_rmssd")?.value;
    if (typeof hrv === "number" && hrv < 25) {
      nudges.push({
        user_id: uid,
        kind: "instant",
        priority: 70,
        title: "Nervous system spike detected",
        body: `HRV ${hrv.toFixed(0)} — your body is asking for a pause.`,
        cta_label: "Box Breath 90s",
        cta_action: "open_breath",
        cta_payload: { pattern: "box", duration_sec: 90 },
        attribution: { sources: ["wearable"], signals: [{ kind: "hrv_low", value: hrv }] },
        source: { from: "instant-pulse-detector" },
        dedupe_key: `instant:hrv:${uid}:${Math.floor(Date.now() / (60 * 60_000))}`,
        expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
      });
    }
  }

  if (nudges.length) {
    await admin.from("nudge_queue").upsert(nudges, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
  }

  return new Response(JSON.stringify({ ok: true, queued: nudges.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
