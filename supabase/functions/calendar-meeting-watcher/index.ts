/**
 * Calendar meeting watcher (cron, every 5 min).
 * For each user with the google_calendar / outlook connector linked, look at
 * the next ~2h of events and create one "pre" nudge 90s before each meeting
 * and a "post" nudge ~3 min after each meeting ends. We dedupe via UNIQUE
 * (user_id, external_event_id, kind) on meeting_nudges.
 *
 * Reads Google Calendar via the ConsciousOS connector gateway. Outlook is a stub
 * for now (same shape — flip the URL when the user connects Outlook).
 */
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CONSCIOUSOS_API_KEY = Deno.env.get("CONSCIOUSOS_API_KEY");
const GCAL_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");

const GATEWAY = "https://connector-gateway.consciousos.dev/google_calendar";

async function fetchUpcoming() {
  if (!CONSCIOUSOS_API_KEY || !GCAL_KEY) return [];
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  const r = await fetch(
    `${GATEWAY}/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      timeMin,
    )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${CONSCIOUSOS_API_KEY}`,
        "X-Connection-Api-Key": GCAL_KEY,
      },
    },
  );
  if (!r.ok) return [];
  const j = await r.json();
  return j.items ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: consenters } = await admin
    .from("signal_consents")
    .select("user_id")
    .eq("source", "google_calendar")
    .eq("enabled", true);

  const events = await fetchUpcoming();
  let inserted = 0;
  for (const c of consenters ?? []) {
    for (const ev of events) {
      const start = ev.start?.dateTime;
      const end = ev.end?.dateTime;
      if (!start) continue;
      // Pre nudge
      const { error: e1 } = await admin.from("meeting_nudges").insert({
        user_id: c.user_id,
        source: "google_calendar",
        external_event_id: ev.id,
        title: ev.summary ?? "Meeting",
        starts_at: start,
        ends_at: end ?? null,
        kind: "pre",
      });
      if (!e1) inserted++;
      if (end) {
        const { error: e2 } = await admin.from("meeting_nudges").insert({
          user_id: c.user_id,
          source: "google_calendar",
          external_event_id: ev.id,
          title: ev.summary ?? "Meeting",
          starts_at: end,
          ends_at: end,
          kind: "post",
        });
        if (!e2) inserted++;
      }
    }
  }
  return new Response(JSON.stringify({ ok: true, inserted, scanned: events.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
