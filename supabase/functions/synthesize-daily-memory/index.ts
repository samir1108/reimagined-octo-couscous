// Synthesize-daily-memory: produces one 3-sentence "who this user became today"
// doc per user per day. Reads today's chats, journals, reflections, and pulses,
// feeds them to Groq, stores the summary in daily_memory_synthesis, and embeds
// it into user_memory_vectors so tomorrow morning's session can recall it.
//
// Invocation:
//   POST {} with user auth → synthesizes for that user, today (or body.date)
//   POST {} with service-role header → synthesizes for ALL users active today
//     (called by the nightly pg_cron job)

import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embedding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

async function callGroq(prompt: string): Promise<string | null> {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an inner-witness AI. Read the user's day and write a single, intimate 3-sentence reflection in second person ('you'). No headings. No lists. No platitudes. Notice what shifted. Name the emotional texture. End with one quiet observation, not a prescription.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 220,
    }),
  });
  if (!r.ok) {
    console.error("groq fail", r.status, await r.text());
    return null;
  }
  const j = await r.json();
  return j?.choices?.[0]?.message?.content?.trim() ?? null;
}

async function synthesizeForUser(admin: any, userId: string, dateStr: string) {
  const dayStart = `${dateStr}T00:00:00Z`;
  const dayEnd = `${dateStr}T23:59:59Z`;

  // Skip if already synthesized
  const { data: existing } = await admin
    .from("daily_memory_synthesis")
    .select("id")
    .eq("user_id", userId)
    .eq("synthesis_date", dateStr)
    .maybeSingle();
  if (existing?.id) return { userId, status: "skip_exists" };

  // Pull today's signal sources
  const [journalsRes, sessionsRes, reflectionsRes, signalsRes] = await Promise.all([
    admin
      .from("journal_entries")
      .select("title, content, mood, tags")
      .eq("user_id", userId)
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd),
    admin
      .from("sessions")
      .select("type, time_slot, summary")
      .eq("user_id", userId)
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd),
    admin
      .from("evening_reflections")
      .select("mood, energy, gratitudes, highlights, challenges, lessons")
      .eq("user_id", userId)
      .eq("reflection_date", dateStr)
      .maybeSingle(),
    admin
      .from("consciousness_signals")
      .select("loop_id, content, signal_type")
      .eq("user_id", userId)
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd)
      .limit(40),
  ]);

  const journals = journalsRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const reflection = reflectionsRes.data ?? null;
  const signals = signalsRes.data ?? [];

  const totalSignal =
    journals.length + sessions.length + (reflection ? 1 : 0) + signals.length;
  if (totalSignal === 0) return { userId, status: "skip_no_signal" };

  // Build compact day blob
  const lines: string[] = [];
  if (journals.length) {
    lines.push("JOURNALS:");
    for (const j of journals.slice(0, 6)) {
      lines.push(`- (${j.mood ?? "—"}) ${(j.title ? j.title + ": " : "") + (j.content ?? "").slice(0, 280)}`);
    }
  }
  if (sessions.length) {
    lines.push("SESSIONS:");
    for (const s of sessions.slice(0, 6)) {
      lines.push(`- [${s.time_slot ?? "?"}] ${s.type}: ${(s.summary ?? "").slice(0, 200)}`);
    }
  }
  if (reflection) {
    lines.push("EVENING:");
    lines.push(`- mood=${reflection.mood} energy=${reflection.energy}`);
    if (reflection.highlights) lines.push(`- highlights: ${String(reflection.highlights).slice(0, 220)}`);
    if (reflection.challenges) lines.push(`- challenges: ${String(reflection.challenges).slice(0, 220)}`);
    if (reflection.lessons) lines.push(`- lessons: ${String(reflection.lessons).slice(0, 220)}`);
  }
  const loopsTouched = Array.from(
    new Set((signals.map((s: any) => s.loop_id).filter(Boolean) as string[]).slice(0, 12))
  );
  if (loopsTouched.length) lines.push(`LOOPS_TOUCHED: ${loopsTouched.join(", ")}`);

  const prompt = lines.join("\n");
  const summary = await callGroq(prompt);
  if (!summary) return { userId, status: "skip_no_summary" };

  // Heuristic key themes (loop ids + journal tags)
  const tagThemes = Array.from(
    new Set(journals.flatMap((j: any) => j.tags ?? []).filter(Boolean))
  ).slice(0, 6);
  const keyThemes = Array.from(new Set([...loopsTouched, ...tagThemes])).slice(0, 8);

  const moodSignal = reflection?.mood
    ? String(reflection.mood)
    : journals[0]?.mood ?? null;

  // Insert synthesis row
  const { data: ins, error: insErr } = await admin
    .from("daily_memory_synthesis")
    .insert({
      user_id: userId,
      synthesis_date: dateStr,
      summary,
      key_themes: keyThemes,
      loops_touched: loopsTouched,
      mood_signal: moodSignal,
      source_counts: {
        journals: journals.length,
        sessions: sessions.length,
        signals: signals.length,
        evening_reflection: reflection ? 1 : 0,
      },
    })
    .select("id")
    .single();
  if (insErr) return { userId, status: "error", error: insErr.message };

  // Embed the synthesis so it shows up in future recall
  const embedding = await embedText(summary);
  await admin.from("user_memory_vectors").insert({
    user_id: userId,
    source_type: "synthesis",
    source_id: ins?.id ?? null,
    content: summary,
    embedding: embedding as any,
    tags: keyThemes,
    loop_ids: loopsTouched,
  });

  return { userId, status: "ok", id: ins?.id, summary };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const dateStr: string = body.date ?? new Date().toISOString().slice(0, 10);

    // Decide mode: user-scope (auth user) vs cron-scope (service role OR shared secret)
    const authHeader = req.headers.get("Authorization") ?? "";
    const cronSecret = req.headers.get("x-cron-secret") ?? "";
    const expectedCronSecret = Deno.env.get("CRON_SECRET") ?? "";
    const isServiceRole = authHeader.includes(SUPABASE_SERVICE_ROLE_KEY);
    const isCronSecret = !!expectedCronSecret && cronSecret === expectedCronSecret;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (isServiceRole || isCronSecret) {
      // Cron path: find users with any activity today
      const dayStart = `${dateStr}T00:00:00Z`;
      const dayEnd = `${dateStr}T23:59:59Z`;
      const { data: activeUsers } = await admin
        .from("sessions")
        .select("user_id")
        .gte("created_at", dayStart)
        .lte("created_at", dayEnd);
      const ids = Array.from(new Set((activeUsers ?? []).map((r: any) => r.user_id)));
      const results: any[] = [];
      for (const uid of ids) {
        try {
          results.push(await synthesizeForUser(admin, uid, dateStr));
        } catch (e: any) {
          results.push({ userId: uid, status: "error", error: e?.message });
        }
      }
      return new Response(JSON.stringify({ ok: true, mode: "cron", count: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // User-scope path
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const res = await synthesizeForUser(admin, user.id, dateStr);
    return new Response(JSON.stringify({ ok: true, mode: "user", result: res }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("synthesize-daily-memory error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
