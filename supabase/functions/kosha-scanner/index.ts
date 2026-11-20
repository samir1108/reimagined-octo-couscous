// Kosha Scanner — Batch 2.
// Reads the user's recent app signals (best-effort, tolerant to missing tables)
// and returns a per-sheath reading across the five koshas:
//   annamaya (body) · pranamaya (breath/energy) · manomaya (mind/emotion)
//   vijnanamaya (wisdom/discernment) · anandamaya (bliss/being)
//
// No embeddings; the reasoning model synthesizes the signals into a structured
// reading. Client renders it as a 5-ring dashboard.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are the Kosha Scanner — a yogic diagnostician trained in
Taittiriya Upanishad's pancha-kosha model AND modern contemplative science
(polyvagal, HRV, interoception, IFS, default-mode network).

Given a JSON blob of a user's recent signals, produce a reading of each of the
five sheaths. Do NOT be generic. Every finding must reference specific evidence
from the input (name the loop, the practice count, the missed day, the mood
score). If a sheath has no evidence, say so plainly — do not invent.

Return ONLY this JSON:
{
  "overall": "one honest sentence about the whole system",
  "koshas": [
    {
      "id": "annamaya" | "pranamaya" | "manomaya" | "vijnanamaya" | "anandamaya",
      "name": "Annamaya (body) | Pranamaya (breath/energy) | Manomaya (mind/emotion) | Vijnanamaya (wisdom/discernment) | Anandamaya (bliss/being)",
      "score": 0-100,
      "state": "starved" | "constricted" | "steady" | "flowing" | "radiant",
      "reading": "2 sentences citing SPECIFIC evidence from the input",
      "one_practice": {
        "name": "short evocative name",
        "duration_minutes": 3-7,
        "steps": ["step 1", "step 2", "step 3"]
      }
    }
  ],
  "priority_kosha": "id of the sheath most in need of attention",
  "closing_line": "one line the user can hold today"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("CONSCIOUSOS_API_KEY");
    if (!key) return json({ error: "missing_key" }, 500);

    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "unauth" }, 401);
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "unauth" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Best-effort signal gathering. Every read is wrapped so a missing table
    // never breaks the scan.
    const safe = async <T,>(p: Promise<{ data: T | null; error: unknown }>) => {
      try { const { data } = await p; return data ?? null; } catch { return null; }
    };

    const [profile, sessions, journals, loops, moods, mirror] = await Promise.all([
      safe(admin.from("profiles").select("*").eq("user_id", user.id).maybeSingle() as any),
      safe(admin.from("game_sessions").select("game_id, completed_at, duration_seconds")
        .eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20) as any),
      safe(admin.from("journal_entries").select("content, mood, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10) as any),
      safe(admin.from("user_loops").select("loop_id, intensity, last_triggered_at")
        .eq("user_id", user.id).limit(10) as any),
      safe(admin.from("mood_logs").select("mood, energy, note, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(14) as any),
      safe(admin.from("mirror_readings").select("checkpoint, insight, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(6) as any),
    ]);

    const signals = {
      profile: profile ? {
        onboarding_complete: (profile as any).onboarding_complete,
        anchors: (profile as any).spiritual_anchors ?? null,
      } : null,
      recent_practices: sessions,
      recent_journal_moods: journals,
      active_loops: loops,
      mood_logs: moods,
      mirror: mirror,
      now: new Date().toISOString(),
    };

    const resp = await fetch("https://ai.gateway.consciousos.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "ConsciousOS-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(signals) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: "ai_failed", status: resp.status, detail }, resp.status);
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { parsed = { error: "bad_json", raw }; }
    return json(parsed, 200);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
