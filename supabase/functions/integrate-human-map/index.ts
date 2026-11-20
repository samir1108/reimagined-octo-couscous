// Integrate Human Map: reads recent mirror answers + sessions, asks Groq to
// score dimensions, upserts human_map_dimensions, resets the integration counter.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );

    const { data: userRes } = await supa.auth.getUser();
    const user = userRes.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Recent mirror answers (last 60 days, max 200)
    const { data: answers } = await supa
      .from("mirror_answers")
      .select("dimension_id,question_type,answer_value,source,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    // Last 6 sessions (light context)
    const { data: sessions } = await supa
      .from("sessions")
      .select("type,time_slot,status,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (!answers || answers.length === 0) {
      return new Response(
        JSON.stringify({ updated: 0, reason: "no_answers" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      return new Response(JSON.stringify({ error: "missing GROQ_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = `You are a calibration engine for a 99-dimension Human Map.
Given a user's mirror answers (sliders 0-100, scenario picks with weights, free text)
return a JSON array of dimension scores. Be conservative when evidence is thin.

Return ONLY JSON of shape:
{ "dimensions": [
  { "dimension_id": "<id>", "score": 0-100, "confidence": 0-1, "evidence": "<one short sentence in user-facing English>" }
] }

Rules:
- Only include dimensions for which there is at least one answer.
- "evidence" must reference what the user actually said/picked, not generic praise.
- Score = where they are now; confidence reflects evidence strength.`;

    const user_payload = {
      sessions: sessions ?? [],
      answers: answers.map((a: any) => ({
        d: a.dimension_id,
        t: a.question_type,
        v: a.answer_value,
        s: a.source,
      })),
    };

    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(user_payload) },
        ],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("groq error", r.status, txt);
      return new Response(JSON.stringify({ error: "groq_failed", detail: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await r.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { dimensions?: any[] } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }
    const dims = Array.isArray(parsed.dimensions) ? parsed.dimensions : [];

    // Map dimension_id -> category prefix
    const PREFIX_TO_CAT: Record<string, string> = {
      cog: "cognitive", emo: "emotional", phy: "physical", rel: "relational",
      exi: "existential", cre: "creative", pro: "professional",
      eco: "ecological", int: "integrative",
    };

    const rows = dims
      .filter((d: any) => typeof d?.dimension_id === "string")
      .map((d: any) => {
        const prefix = String(d.dimension_id).split("_")[0];
        const category = PREFIX_TO_CAT[prefix] ?? "cognitive";
        return {
          user_id: user.id,
          dimension_id: d.dimension_id,
          category,
          score: Math.max(0, Math.min(100, Math.round(Number(d.score) || 0))),
          confidence: Math.max(0, Math.min(1, Number(d.confidence) || 0)),
          discovered: true,
          evidence: typeof d.evidence === "string" ? d.evidence.slice(0, 280) : null,
          last_updated_at: new Date().toISOString(),
        };
      });

    if (rows.length > 0) {
      const { error: upErr } = await supa
        .from("human_map_dimensions")
        .upsert(rows, { onConflict: "user_id,dimension_id" });
      if (upErr) {
        console.error("upsert error", upErr);
        return new Response(JSON.stringify({ error: "upsert_failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Reset integration counter
    await supa.from("mirror_progress").upsert(
      {
        user_id: user.id,
        sessions_since_integration: 0,
        last_integration_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({ updated: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("integrate-human-map error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
