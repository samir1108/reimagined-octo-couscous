/**
 * pattern-window-detector
 * Cron every 30 min. Reads last 3h + 7d of signals, applies the integration→loop
 * ruleset, writes loop_attributions and queues 'pattern' nudges.
 */
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { LOOP_NAMES } from "../_shared/loopMap.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Attr = {
  user_id: string;
  loop_id: string;
  loop_name: string;
  window_label: "3h" | "7d";
  confidence: number;
  sources: string[];
  contributing_signals: any[];
  rationale: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const now = Date.now();
  const since3h = new Date(now - 3 * 60 * 60_000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60_000).toISOString();

  const [{ data: bio7 }, { data: work7 }, { data: dev7 }] = await Promise.all([
    admin.from("bio_signals").select("user_id,metric,value,recorded_at").gte("recorded_at", since7d),
    admin.from("work_signals").select("user_id,signal_type,source,value,text_value,occurred_at").gte("occurred_at", since7d),
    admin.from("device_signals").select("user_id,signal_type,category,value,bucket_start").gte("bucket_start", since7d),
  ]);

  const userIds = new Set<string>();
  (bio7 ?? []).forEach((r: any) => userIds.add(r.user_id));
  (work7 ?? []).forEach((r: any) => userIds.add(r.user_id));
  (dev7 ?? []).forEach((r: any) => userIds.add(r.user_id));

  const attributions: Attr[] = [];
  const nudges: any[] = [];

  for (const uid of userIds) {
    const bio = (bio7 ?? []).filter((r: any) => r.user_id === uid);
    const work = (work7 ?? []).filter((r: any) => r.user_id === uid);
    const dev = (dev7 ?? []).filter((r: any) => r.user_id === uid);

    const work3h = work.filter((r: any) => r.occurred_at >= since3h);
    const bio3h = bio.filter((r: any) => r.recorded_at >= since3h);

    // ---- 3h window ----
    const charged3h = work3h.filter((r: any) => r.text_value === "charged").length;
    const calm3h = work3h.filter((r: any) => r.text_value === "calm").length;
    const totalTone3h = charged3h + calm3h;
    if (totalTone3h >= 5 && charged3h / totalTone3h > 0.4) {
      const sources = Array.from(new Set(work3h.filter((r: any) => r.text_value).map((r: any) => r.source ?? "unknown")));
      attributions.push({
        user_id: uid,
        loop_id: "VAL003",
        loop_name: LOOP_NAMES.VAL003,
        window_label: "3h",
        confidence: Math.min(1, 0.5 + (charged3h / totalTone3h) * 0.5),
        sources,
        contributing_signals: [{ kind: "tone_3h", charged: charged3h, calm: calm3h }],
        rationale: `${charged3h}/${totalTone3h} charged messages in 3h across ${sources.join(", ")}`,
      });
    }

    // ---- 7d window ----
    const lateNight = work.filter((r: any) => r.signal_type === "late_night_commits").reduce((a: number, b: any) => a + (b.value ?? 0), 0);
    const hrvVals = bio.filter((r: any) => r.metric === "hrv_rmssd").map((r: any) => r.value).filter((v: any) => typeof v === "number");
    const avgHrv = hrvVals.length ? hrvVals.reduce((a, b) => a + b, 0) / hrvVals.length : null;

    if (lateNight >= 3 && avgHrv !== null && avgHrv < 35) {
      attributions.push({
        user_id: uid,
        loop_id: "REC002",
        loop_name: LOOP_NAMES.REC002,
        window_label: "7d",
        confidence: 0.75,
        sources: ["github", "wearable"],
        contributing_signals: [{ kind: "late_night_7d", count: lateNight }, { kind: "avg_hrv_7d", value: avgHrv }],
        rationale: `${lateNight} late-night commits in 7d + low avg HRV (${avgHrv.toFixed(0)})`,
      });
    }

    const sleepVals = bio.filter((r: any) => r.metric === "sleep_score" || r.metric === "sleep_hours").map((r: any) => r.value);
    const shortNights = sleepVals.filter((v: any) => typeof v === "number" && v < (v < 12 ? 5 : 60)).length;
    if (shortNights >= 3) {
      attributions.push({
        user_id: uid,
        loop_id: "REC003",
        loop_name: LOOP_NAMES.REC003,
        window_label: "7d",
        confidence: 0.7,
        sources: ["health"],
        contributing_signals: [{ kind: "short_nights_7d", count: shortNights }],
        rationale: `${shortNights} short nights detected this week`,
      });
    }

    const meetingDensity = work.filter((r: any) => r.signal_type === "meeting" || r.source === "calendar").length;
    if (meetingDensity >= 30) {
      attributions.push({
        user_id: uid,
        loop_id: "EGO005",
        loop_name: LOOP_NAMES.EGO005,
        window_label: "7d",
        confidence: 0.65,
        sources: ["calendar"],
        contributing_signals: [{ kind: "meeting_density_7d", count: meetingDensity }],
        rationale: `${meetingDensity} meetings this week — performative pattern`,
      });
    }

    if (avgHrv !== null && avgHrv < 30 && hrvVals.length >= 5) {
      attributions.push({
        user_id: uid,
        loop_id: "REC001",
        loop_name: LOOP_NAMES.REC001,
        window_label: "7d",
        confidence: 0.7,
        sources: ["wearable"],
        contributing_signals: [{ kind: "avg_hrv_7d", value: avgHrv }],
        rationale: `Sustained low HRV trend over 7d (avg ${avgHrv.toFixed(0)})`,
      });
    }
  }

  // Deduplicate per (user, loop, window) — keep highest confidence
  const seen = new Map<string, Attr>();
  for (const a of attributions) {
    const k = `${a.user_id}:${a.loop_id}:${a.window_label}`;
    const prev = seen.get(k);
    if (!prev || a.confidence > prev.confidence) seen.set(k, a);
  }
  const finalAttrs = Array.from(seen.values());

  if (finalAttrs.length) {
    await admin.from("loop_attributions").insert(finalAttrs);

    // Queue pattern nudges (1 per user, top confidence)
    const byUser = new Map<string, Attr>();
    for (const a of finalAttrs) {
      const prev = byUser.get(a.user_id);
      if (!prev || a.confidence > prev.confidence) byUser.set(a.user_id, a);
    }
    for (const [uid, a] of byUser) {
      const dedupe = `pattern:${a.loop_id}:${a.window_label}:${new Date().toISOString().slice(0, 10)}`;
      nudges.push({
        user_id: uid,
        kind: "pattern",
        priority: 60,
        title: `Pattern noticed: ${a.loop_name}`,
        body: a.rationale,
        cta_label: "Open Guru",
        cta_action: "open_guru",
        cta_payload: { loop_id: a.loop_id },
        attribution: { sources: a.sources, signals: a.contributing_signals, window: a.window_label, confidence: a.confidence },
        source: { from: "pattern-window-detector" },
        dedupe_key: dedupe,
        expires_at: new Date(Date.now() + 12 * 60 * 60_000).toISOString(),
      });
    }
    if (nudges.length) {
      await admin.from("nudge_queue").upsert(nudges, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, attributions: finalAttrs.length, nudges: nudges.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
