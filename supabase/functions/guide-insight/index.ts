/**
 * guide-insight
 * Returns a "curious mirror" insight for the user's last message in a Guide
 * conversation: why they may be saying it, loops they're likely living,
 * past echoes from their journey, and a possible next move.
 *
 * Additive — completely separate from guide-chat streaming. Client calls this
 * after each assistant reply to render an optional "Why am I saying this?" card.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Soft credit check — insight is cheap (5 paise); skip if user is dry
    const { data: creditCheck } = await admin.rpc("check_credit_balance", {
      p_user_id: user.id, p_min_balance: 5,
    });
    if (!creditCheck?.sufficient) {
      return new Response(JSON.stringify({ insight: null, skipped: "no_credits" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages = [] } = await req.json();
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user")?.content?.toString() ?? "";
    if (!lastUser || lastUser.length < 6) {
      return new Response(JSON.stringify({ insight: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull recent context: active loops (7d), recent attributions, dimensions
    const since7d = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
    const [{ data: attrs }, { data: signals }, { data: userLoops }] = await Promise.all([
      admin.from("loop_attributions")
        .select("loop_id,loop_name,confidence,rationale,created_at")
        .eq("user_id", user.id).gte("created_at", since7d)
        .order("confidence", { ascending: false }).limit(8),
      admin.from("consciousness_signals")
        .select("signal_type, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(8),
      admin.from("user_loops")
        .select("loop_id, severity, awareness_score")
        .eq("user_id", user.id).limit(20),
    ]);

    const activeLoopsBlock = (attrs ?? []).map((a: any) =>
      `- ${a.loop_name ?? a.loop_id} (${Math.round((a.confidence ?? 0) * 100)}% — ${a.rationale ?? "no rationale"})`
    ).join("\n");
    const longTermLoopsBlock = (userLoops ?? []).slice(0, 8).map((l: any) =>
      `- ${l.loop_id}${l.severity ? ` (severity: ${l.severity})` : ""}`
    ).join("\n");
    const pastEchoesBlock = (signals ?? []).slice(0, 5).map((s: any) => {
      const c = typeof s.content === "string" ? s.content : JSON.stringify(s.content).slice(0, 200);
      return `- [${s.signal_type}, ${new Date(s.created_at).toISOString().slice(0, 10)}] ${c.slice(0, 220)}`;
    }).join("\n");

    const recentTurns = messages.slice(-6).map((m: any) => `${m.role}: ${m.content}`).join("\n");

    const systemPrompt = `You are a warm, curious "inner mirror" — not a therapist, not a coach. The user is mid-conversation with their Guide. Your job is to gently show them the patterns behind what they just said, so the app feels alive and genuinely interested in them.

Return ONLY valid JSON in this exact shape (no markdown, no commentary):
{
  "why": "1-2 warm sentences explaining the most likely inner driver behind the user's last message. Use 'I notice…' or 'it sounds like…' — never clinical labels.",
  "active_loops": [
    { "loop_id": "VAL003", "loop_name": "Reactivity Spike", "evidence": "short quote or paraphrase from what they just said" }
  ],
  "past_echoes": [
    { "when": "4 days ago" or "earlier this week", "what": "one warm sentence connecting this moment to a past one — only if the past context actually supports it" }
  ],
  "next_move": "one warm, forward-looking sentence — what usually opens up if this pattern keeps going, plus a small invitation. Never prescriptive."
}

Rules:
- At most 2 active_loops, at most 2 past_echoes.
- If you have no real evidence for a field, return an empty array or empty string — never invent.
- Tone: curious, present, warm — like a wise older sibling. Plain English. No jargon.
- Quote the user's own words when possible.`;

    const userPrompt = `RECENT CONVERSATION (oldest → newest):
${recentTurns}

USER'S LAST MESSAGE:
"${lastUser}"

ACTIVE LOOP PATTERNS (last 7 days, from sessions):
${activeLoopsBlock || "(none yet)"}

LONG-TERM LOOPS (their journey):
${longTermLoopsBlock || "(none mapped)"}

PAST ECHOES (recent consciousness signals — moments they've journaled / been seen):
${pastEchoesBlock || "(none recent)"}

Return the JSON now.`;

    const __billing = await getBillingFromReq(req, "guide-insight");
    const resp = await aiGatewayFetchWithLang(req, {
      model: "tier:fast",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    }, {}, __billing ?? undefined);

    if (!resp.ok) {
      return new Response(JSON.stringify({ insight: null, error: `gateway_${resp.status}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await resp.json();
    const raw = aiResult.choices?.[0]?.message?.content ?? "{}";
    let insight: any = null;
    try {
      const cleaned = String(raw).replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      insight = JSON.parse(cleaned);
    } catch {
      insight = null;
    }

    // Deduct + log (cheap)
    await admin.rpc("check_and_deduct_credits", {
      p_user_id: user.id, p_amount: 5, p_description: "Guide insight (curious mirror)",
    });
    await admin.from("ai_usage_log").insert({
      user_id: user.id,
      function_name: "guide-insight",
      model: "tier:fast",
      input_tokens: aiResult.usage?.prompt_tokens || 0,
      output_tokens: aiResult.usage?.completion_tokens || 0,
      total_tokens: aiResult.usage?.total_tokens || 0,
      estimated_cost_paise: 5,
      charged_paise: 5,
      status: "success",
    });

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("guide-insight error:", e);
    return new Response(JSON.stringify({ insight: null, error: (e as Error).message }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
