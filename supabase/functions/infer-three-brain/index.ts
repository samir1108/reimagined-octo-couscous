// 3-Brain Inference — head/heart/gut weekly snapshot from last 30d signals + journal.
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetch, pickModel } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: corsHeaders });
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: corsHeaders });

    const since = new Date(Date.now() - 30 * 86400_000).toISOString();

    // Pull recent journal text + recent signals (best-effort, table may not exist)
    const journals = await sb
      .from("journal_entries" as any)
      .select("content, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .limit(40);

    const text = (journals.data as any[] | null)
      ?.map((j) => String(j.content || "").slice(0, 500))
      .join("\n\n")
      .slice(0, 8000) ?? "";

    if (!text || text.length < 80) {
      // Not enough data — return neutral
      const neutral = { head: 0.34, heart: 0.33, gut: 0.33, dominant: "balanced", imbalance_score: 0 };
      return new Response(JSON.stringify({ ...neutral, reason: "insufficient_data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const billing = await getBillingFromReq(req, "infer-three-brain");
    const prompt = `You are an analyst classifying a person's recent journal text into the 3-brain framework:
- HEAD (analytical, planning, conceptual)
- HEART (relational, emotional, connection)
- GUT (instinct, body, action, courage)

Read the text. Return ONLY a JSON object: {"head":0..1,"heart":0..1,"gut":0..1,"dominant":"head|heart|gut|balanced","imbalance_score":0..1,"evidence":{"head":["..."],"heart":["..."],"gut":["..."]}}.
The three scores must sum to ~1.0. imbalance_score = max - min.

TEXT:
${text}`;

    const resp = await aiGatewayFetch(
      {
        model: pickModel("fast"),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      },
      {},
      billing ?? undefined,
    );
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "ai_failed", status: resp.status }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    const data = await resp.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");

    // Persist via admin client (bypass RLS for upsert)
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const week = new Date();
    week.setUTCHours(0, 0, 0, 0);
    week.setUTCDate(week.getUTCDate() - week.getUTCDay()); // Sunday start
    await admin.from("three_brain_inferences").upsert({
      user_id: user.id,
      head_score: Number(parsed.head) || 0,
      heart_score: Number(parsed.heart) || 0,
      gut_score: Number(parsed.gut) || 0,
      dominant: parsed.dominant || "balanced",
      imbalance_score: Number(parsed.imbalance_score) || 0,
      evidence: parsed.evidence || {},
      computed_for_week: week.toISOString().slice(0, 10),
    }, { onConflict: "user_id,computed_for_week" });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
