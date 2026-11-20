/**
 * pre-event-nudge
 * Cron every 5 min. Reads next 30 min of calendar events from work_signals
 * (signal_type='calendar_event'), cross-refs active loop_attributions,
 * queues a 'pre_event' nudge ~10 min before each event.
 */
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const now = new Date();
  const horizon = new Date(now.getTime() + 30 * 60_000);

  // Calendar events stored in work_signals where source='calendar' and value=epoch start
  const { data: events } = await admin
    .from("work_signals")
    .select("user_id, source, text_value, value, occurred_at")
    .in("source", ["google_calendar", "outlook_calendar", "calendar"])
    .gte("occurred_at", now.toISOString())
    .lte("occurred_at", horizon.toISOString());

  const nudges: any[] = [];
  const userIds = Array.from(new Set((events ?? []).map((r: any) => r.user_id)));

  // Pull active attributions for these users in one shot
  const { data: attrs } = userIds.length
    ? await admin.from("loop_attributions").select("user_id, loop_id, loop_name, confidence")
        .in("user_id", userIds).gt("expires_at", now.toISOString())
    : { data: [] as any[] };

  const attrByUser = new Map<string, any[]>();
  for (const a of attrs ?? []) {
    const arr = attrByUser.get(a.user_id) ?? [];
    arr.push(a);
    attrByUser.set(a.user_id, arr);
  }

  for (const ev of events ?? []) {
    const eventTime = new Date(ev.occurred_at);
    const minsUntil = Math.round((eventTime.getTime() - now.getTime()) / 60_000);
    const fireAt = new Date(eventTime.getTime() - 10 * 60_000); // 10 min before
    const userAttrs = (attrByUser.get(ev.user_id) ?? []).sort((a, b) => b.confidence - a.confidence);
    const top = userAttrs[0];

    const title = top
      ? `Before ${ev.text_value ?? "your meeting"}: ${top.loop_name} pattern active`
      : `Meeting in ${minsUntil} min: 90s grounding`;
    const body = top
      ? `90-second box breath can soften this loop before the room starts.`
      : `A short pause now sets the tone of the room.`;

    nudges.push({
      user_id: ev.user_id,
      kind: "pre_event",
      priority: top ? 80 : 55,
      fire_at: fireAt.toISOString(),
      expires_at: eventTime.toISOString(),
      title,
      body,
      cta_label: "Box Breath 90s",
      cta_action: "open_breath",
      cta_payload: { pattern: "box", duration_sec: 90 },
      attribution: top ? { sources: ["calendar"], loop_id: top.loop_id, confidence: top.confidence } : { sources: ["calendar"] },
      source: { from: "pre-event-nudge", event_at: ev.occurred_at, event_title: ev.text_value },
      dedupe_key: `pre_event:${ev.user_id}:${ev.occurred_at}`,
    });
  }

  if (nudges.length) {
    await admin.from("nudge_queue").upsert(nudges, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
  }

  return new Response(JSON.stringify({ ok: true, queued: nudges.length, scanned: events?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
