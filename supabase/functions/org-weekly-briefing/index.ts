// Generate a weekly AI briefing for an org/team using Groq.
// Privacy: only operates on aggregated data (n>=5). Never includes individual data.
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Caller-scoped client — RLS + helper functions enforce admin/manager check
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json().catch(() => ({}));
    const orgId = body.org_id as string | undefined;
    const teamId = (body.team_id as string | undefined) ?? null;
    if (!orgId) {
      return new Response(JSON.stringify({ error: "org_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull aggregated, privacy-safe data (RPCs enforce admin/manager + n>=5)
    const [pulseRes, distRes, snapRes] = await Promise.all([
      userClient.rpc("get_team_pulse_aggregate", { _org_id: orgId, _team_id: teamId, _days: 14 }),
      userClient.rpc("get_team_mood_distribution", { _org_id: orgId, _team_id: teamId, _days: 7 }),
      userClient.rpc("get_org_consciousness_snapshot", { _org_id: orgId }),
    ]);

    if (pulseRes.error || distRes.error || snapRes.error) {
      const err = pulseRes.error || distRes.error || snapRes.error;
      return new Response(JSON.stringify({ error: err?.message ?? "rpc failed" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pulse = (pulseRes.data ?? []) as any[];
    const dist = (distRes.data ?? []) as any[];
    const snap = (snapRes.data ?? [])[0];

    const insufficient = !snap?.sufficient || dist[0]?.band === "insufficient";

    if (insufficient) {
      return new Response(JSON.stringify({
        briefing: "Not enough team members have shared their pulse yet. Encourage participation — insights unlock at 5+ voices, with full anonymity.",
        cohort_size: snap?.cohort_size ?? 0,
        sufficient: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `You are an organizational consciousness coach. Write a 3-bullet weekly briefing for a manager about their team's collective inner state. Be specific, warm, and actionable. NEVER mention individuals — only aggregate patterns.

DATA (last 7-14 days, aggregated, anonymous):
- Cohort: ${snap.cohort_size} members participating of ${snap.total_active_members}
- 7-day mood avg: ${snap.avg_mood_7d}/5
- 7-day energy avg: ${snap.avg_energy_7d}/5
- Participation: ${snap.pulse_participation_pct}%
- Distribution: ${dist.map((d: any) => `${d.member_count} ${d.band}`).join(", ")}
- 14-day mood trend: ${pulse.slice(0, 7).map((p: any) => p.avg_mood).filter(Boolean).join(" → ")}

Format as exactly 3 bullets:
• What's true right now (1 sentence observation)
• What it likely means (1 sentence interpretation)
• What you can do this week (1 specific manager action)

Keep tone: wise, calm, non-alarmist. Under 80 words total.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!groqRes.ok) {
      return new Response(JSON.stringify({ error: `groq: ${groqRes.status}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqData = await groqRes.json();
    const briefing = groqData.choices?.[0]?.message?.content ?? "Briefing unavailable.";

    // Cache briefing (service role write — bypasses RLS but only writes aggregated text)
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    await adminClient.from("org_weekly_briefings").upsert({
      org_id: orgId,
      team_id: teamId,
      week_start: weekStartStr,
      briefing_text: briefing,
      cohort_size: snap.cohort_size,
      data_snapshot: { snap, dist, pulse_recent: pulse.slice(0, 7) },
      generated_at: new Date().toISOString(),
    }, { onConflict: "org_id,team_id,week_start" });

    return new Response(JSON.stringify({
      briefing,
      cohort_size: snap.cohort_size,
      sufficient: true,
      week_start: weekStartStr,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
