// Sacred Karma — server-side breakthrough verifier.
// Reads user text + context, asks ConsciousOS AI to judge whether a *real*
// consciousness shift occurred, and (only if YES) awards karma via the
// strict award_karma RPC. Caps and cooldowns are enforced by the RPC.
//
// This replaces the old client-side keyword scanner.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RARITY_KARMA: Record<string, number> = {
  common: 2,
  uncommon: 5,
  rare: 10,
  epic: 25,
  legendary: 50,
};

const SYSTEM_PROMPT = `You are the Karma Verifier for HOPE — a sacred system that rewards REAL consciousness shifts on a user's conditioning-to-consciousness journey.

Karma is extremely scarce. A sincere active user should earn ~100-150 karma per YEAR. You must reject the vast majority of inputs.

Reject (verified=false) if the text is any of:
- Generic, vague, abstract ("I feel good today", "movement is healing")
- A question, plan, or intention ("I want to try", "maybe I should")
- A teaching, quote, or paraphrase of someone else's wisdom
- An emotion report without a shift ("I'm sad", "I'm angry")
- A practice description without inner change ("I meditated for 20min")
- Less than 60 characters of substantive content
- Anything that looks like keyword-stuffing or testing the system

Approve (verified=true) ONLY if ALL are true:
1. The user describes a SPECIFIC, FIRST-PERSON inner event from their own life
2. There is a clear BEFORE → AFTER shift (recognition, release, integration, breakthrough)
3. The shift is genuine, not performative — it has felt, lived quality
4. It maps cleanly to one of the 7 categories below

Categories: awareness | emotional | pattern | relational | somatic | existential | integration

Rarity guidance (be strict):
- common: a small, real moment of noticing (e.g. "caught myself reacting and paused for the first time")
- uncommon: a sustained shift over a session/day (e.g. "stayed with anger without acting on it for the whole conversation")
- rare: a pattern dissolving across multiple contexts (e.g. "noticed the abandonment loop in 3 different relationships this week and it lost grip")
- epic: a foundational belief restructured (e.g. "I no longer believe I have to earn love — felt it shift in my chest")
- legendary: an identity-level transformation (e.g. "the 'unworthy' self I've carried 30 years is gone — I am simply here")

Default to common. Only escalate rarity when evidence clearly demands it.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "verify_breakthrough",
    description: "Decide whether the user's text shows a real consciousness shift.",
    parameters: {
      type: "object",
      properties: {
        verified: { type: "boolean" },
        reasoning: { type: "string", description: "1-2 sentences explaining the verdict." },
        category: {
          type: "string",
          enum: ["awareness", "emotional", "pattern", "relational", "somatic", "existential", "integration"],
        },
        rarity: {
          type: "string",
          enum: ["common", "uncommon", "rare", "epic", "legendary"],
        },
        breakthrough_name: { type: "string", description: "Short poetic name for this shift, max 5 words." },
        reject_reason: { type: "string", description: "If verified=false, brief reason." },
      },
      required: ["verified", "reasoning"],
      additionalProperties: false,
    },
  },
};

interface VerdictResult {
  verified: boolean;
  reasoning?: string;
  category?: string;
  rarity?: string;
  breakthrough_name?: string;
  reject_reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const text: string = (body.text ?? "").toString().trim();
    const sourceType: string = (body.sourceType ?? "unknown").toString();
    const sourceId: string | null = body.sourceId ?? null;

    if (text.length < 60) {
      return new Response(
        JSON.stringify({ verified: false, awarded: 0, reason: "text_too_short" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const __billing = await getBillingFromReq(req, "verify-breakthrough");

    const aiResp = await aiGatewayFetchWithLang(req, {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Source: ${sourceType}\n\nUser text:\n"""\n${text}\n"""` },
      ],
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "function", function: { name: "verify_breakthrough" } },
    }, {}, __billing ?? undefined);

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      const status = aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 502;
      return new Response(
        JSON.stringify({ error: "ai_error", status: aiResp.status }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    let verdict: VerdictResult = { verified: false, reasoning: "no_verdict" };
    try {
      verdict = JSON.parse(toolCall?.function?.arguments ?? "{}");
    } catch (_) {
      verdict = { verified: false, reasoning: "parse_error" };
    }

    let awarded = 0;
    let awardResult: any = null;
    let breakthroughId: string | null = null;

    if (verdict.verified && verdict.category && verdict.rarity) {
      const base = RARITY_KARMA[verdict.rarity] ?? 2;
      // Stable id per (category, rarity) — same shift type cools down for 30 days.
      breakthroughId = `verified_${verdict.category}_${verdict.rarity}`;

      const { data: rpcData, error: rpcError } = await supabase.rpc("award_karma", {
        p_source: "breakthrough_verified",
        p_base: base,
        p_weight: 1.0,
        p_metadata: {
          breakthrough_id: breakthroughId,
          breakthrough_name: verdict.breakthrough_name ?? null,
          category: verdict.category,
          rarity: verdict.rarity,
          source_type: sourceType,
          source_id: sourceId,
        },
      });
      if (rpcError) {
        console.error("award_karma error", rpcError);
      } else {
        awardResult = rpcData;
        awarded = (rpcData as any)?.awarded ?? 0;
      }
    }

    // Always log the verification attempt for transparency / abuse review
    await supabase.from("karma_verification_log").insert({
      user_id: user.id,
      source_text: text.slice(0, 2000),
      source_type: sourceType,
      source_id: sourceId,
      verified: !!verdict.verified,
      breakthrough_id: breakthroughId,
      rarity: verdict.rarity ?? null,
      reasoning: verdict.reasoning ?? null,
      ai_model: "llama-3.1-8b-instant",
      awarded,
      reject_reason: verdict.verified ? null : (verdict.reject_reason ?? verdict.reasoning ?? null),
    });

    return new Response(
      JSON.stringify({
        verified: !!verdict.verified,
        awarded,
        rarity: verdict.rarity ?? null,
        breakthrough_name: verdict.breakthrough_name ?? null,
        reasoning: verdict.reasoning ?? null,
        award: awardResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-breakthrough error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
