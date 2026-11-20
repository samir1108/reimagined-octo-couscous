/**
 * post-event-reflection
 * Cron every 5 min. Finds calendar events that ended in the last 5–15 min,
 * queues a 'post_event' reflection card seeded with context.
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
  const lo = new Date(now.getTime() - 15 * 60_000);
  const hi = new Date(now.getTime() - 5 * 60_000);

  // Use signal_type='calendar_event_end' if your watcher writes ends, else fallback to events that started 30-60 min ago
  const { data: events } = await admin
    .from("work_signals")
    .select("user_id, source, text_value, value, occurred_at, signal_type")
    .in("source", ["google_calendar", "outlook_calendar", "calendar"])
    .gte("occurred_at", new Date(now.getTime() - 90 * 60_000).toISOString())
    .lte("occurred_at", hi.toISOString());

  const nudges: any[] = [];
  for (const ev of events ?? []) {
    // Heuristic: assume 30 min meeting, end = start + 30
    const start = new Date(ev.occurred_at).getTime();
    const end = start + 30 * 60_000;
    if (end < lo.getTime() || end > hi.getTime()) continue;

    nudges.push({
      user_id: ev.user_id,
      kind: "post_event",
      priority: 50,
      title: `That meeting just ended — what's left in your body?`,
      body: ev.text_value ? `Reflecting on "${ev.text_value}". Notice your chest, jaw, breath.` : `Notice your chest, jaw, breath.`,
      cta_label: "Reflect 60s",
      cta_action: "open_reflection",
      cta_payload: { seed: ev.text_value ?? "meeting", duration_sec: 60 },
      attribution: { sources: ["calendar"] },
      source: { from: "post-event-reflection", event_at: ev.occurred_at, event_title: ev.text_value },
      dedupe_key: `post_event:${ev.user_id}:${ev.occurred_at}`,
      expires_at: new Date(now.getTime() + 60 * 60_000).toISOString(),
    });
  }

  if (nudges.length) {
    await admin.from("nudge_queue").upsert(nudges, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
  }

  return new Response(JSON.stringify({ ok: true, queued: nudges.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
