// ============================================================
// adapt-next-block
// ----------------------------------------------------------------
// Mid-session adaptive injection. Called from the SessionOrchestrator
// when a user finishes block N before navigating to block N+1.
// Reads fresh engine_signals (last ~10min) plus the active plan
// and returns:
//
//   { action: 'keep' }                         → no change, advance
//   { action: 'replace', block: SessionBlock } → swap the next block
//   { action: 'inject',  block: SessionBlock } → insert before next
//
// The block shape mirrors src/lib/sutra/orchestrator.ts SessionBlock.
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface IncomingBlock {
  modeId?: string;
  label: string;
  practice: string;
  surface?: string;
  durationSec: number;
  route: string;
  intro?: string;
}

// Tiny mapping practice → default route/surface so the AI can propose
// a block without hallucinating routes.
const PRACTICE_ROUTE: Record<string, { route: string; surface: string; modeId: string }> = {
  observation:    { route: "/app/practice",        surface: "practice",  modeId: "observation-micro" },
  breath:         { route: "/app/practice/breath", surface: "practice",  modeId: "breath-reset" },
  witness:        { route: "/app/practice/witness", surface: "witness",  modeId: "witness-short" },
  body:           { route: "/app/practice",        surface: "practice",  modeId: "body-scan" },
  "self-inquiry": { route: "/app/guide",           surface: "guide",     modeId: "inquiry-who-am-i" },
  bhakti:         { route: "/app/guide",           surface: "guide",     modeId: "bhakti-pause" },
  jnana:          { route: "/app/guide",           surface: "guide",     modeId: "jnana-reflect" },
  journal:        { route: "/app/journal",         surface: "journal",   modeId: "journal-reflect" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ action: "keep", reason: "unauth" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const completedBlock: IncomingBlock | null = body.completedBlock ?? null;
    const nextBlock: IncomingBlock | null = body.nextBlock ?? null;
    const sessionTheme: string = body.sessionTheme ?? "";
    const remainingBlocks: IncomingBlock[] = Array.isArray(body.remainingBlocks)
      ? body.remainingBlocks : [];

    // Fresh signals (last 15 min)
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: signals } = await admin
      .from("engine_signals")
      .select("signal_type, practice_id, urgency, payload, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20);

    const freshSignals = signals ?? [];

    // Cheap fast-path: no fresh signals → keep
    if (freshSignals.length === 0) {
      return new Response(JSON.stringify({ action: "keep", reason: "no-fresh-signals" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ask the AI to decide. Tool-calling for strict shape.
    const systemPrompt = `You are an adaptive session conductor inside a meditation/consciousness app.
You receive: the session theme, the block the user just finished, the planned next block,
remaining blocks, and FRESH user signals (active loops, needs_practice, needs_inquiry,
needs_rest, breakthrough). Your job: decide whether to KEEP the planned next block,
REPLACE it with something more attuned, or INJECT a short bridge step before it.

Rules:
- Default to KEEP. Only change when fresh signals strongly conflict with the next block.
- Injected/replacement blocks should be 60–240 seconds.
- Practice MUST be one of: observation, breath, witness, body, self-inquiry, bhakti, jnana, journal.
- Be gentle: never inject more than one extra step.`;

    const userPrompt = `Session theme: ${sessionTheme || "(none)"}
Just completed: ${completedBlock ? JSON.stringify(completedBlock) : "(first step)"}
Planned next: ${nextBlock ? JSON.stringify(nextBlock) : "(end of plan)"}
Remaining after next: ${remainingBlocks.length}

Fresh signals (most recent first):
${freshSignals.map((s: any) => `- ${s.signal_type} (urgency=${s.urgency}, practice=${s.practice_id ?? "-"})`).join("\n")}

Decide.`;

    const __billing = await getBillingFromReq(req, "adapt-next-block");
    const aiRes = await aiGatewayFetchWithLang(req, {
      model: "tier:fast",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "decide_adaptation",
          description: "Decide whether to keep, replace, or inject a block.",
          parameters: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["keep", "replace", "inject"] },
              reason: { type: "string" },
              block: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  practice: {
                    type: "string",
                    enum: Object.keys(PRACTICE_ROUTE),
                  },
                  durationSec: { type: "number" },
                  intro: { type: "string" },
                },
                required: ["label", "practice", "durationSec", "intro"],
              },
            },
            required: ["action", "reason"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "decide_adaptation" } },
    }, {}, __billing ?? undefined);

    const aiJson = await aiRes.json().catch(() => null);
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments
      ? JSON.parse(toolCall.function.arguments) : null;

    if (!args || args.action === "keep") {
      return new Response(JSON.stringify({ action: "keep", reason: args?.reason ?? "ai-keep" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((args.action === "replace" || args.action === "inject") && args.block) {
      const meta = PRACTICE_ROUTE[args.block.practice] ?? PRACTICE_ROUTE["observation"];
      const block = {
        modeId: meta.modeId,
        label: String(args.block.label).slice(0, 80),
        practice: args.block.practice,
        surface: meta.surface,
        durationSec: Math.min(240, Math.max(60, Number(args.block.durationSec) || 120)),
        route: meta.route,
        intro: String(args.block.intro).slice(0, 400),
      };
      return new Response(
        JSON.stringify({ action: args.action, reason: args.reason ?? "", block }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ action: "keep", reason: "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("adapt-next-block error", err);
    return new Response(JSON.stringify({ action: "keep", reason: "error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
