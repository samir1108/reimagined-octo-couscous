// analyze-assessment — generates AI deep analysis for a user_assessment_result
// and wires the result into engine signals (consciousness_signals + dimension_map_scores).
import { createClient } from "npm:@supabase/supabase-js@2";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const reqBody = await req.json();
    const { result_id } = reqBody;
    const userLang = await resolveUserLanguage(req, reqBody.language);
    if (!result_id) {
      return new Response(JSON.stringify({ error: "result_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load result + assessment definition
    const { data: result, error: resErr } = await supabase
      .from("user_assessment_results")
      .select("*, assessment:assessment_definitions(*)")
      .eq("id", result_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (resErr || !result) {
      return new Response(JSON.stringify({ error: "Result not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const def = result.assessment;
    const subScores = result.sub_scores ?? {};
    const primaryId: string = result.primary_result;
    const resultTypes: any[] = Array.isArray(def.result_types) ? def.result_types : [];
    const primaryType = resultTypes.find((r) => r.id === primaryId) ?? resultTypes[0];

    const systemPrompt = `You are a Council of Yogis — a synthesis voice combining the perspectives of the world's greatest contemplative teachers (Ramana Maharshi, Patañjali, Krishna, Buddha, Lao Tzu, Rumi, Carl Jung when relevant).

Your task: read this user's assessment result and write a profound, personal, world-class deep analysis (800-1500 words).

Tone: warm, precise, non-religious, deeply intelligent. Speak directly to the user as "you". Never patronize. Never use generic affirmations.

Structure your response in 4 sections, each with a markdown ## heading:
## What This Reveals About You
## Your Hidden Strength
## Your Shadow & Blind Spot
## Your Path Forward

Avoid clichés. Reference the actual sub-score numbers when they sharpen the insight. Be specific to *this* user's pattern, not generic to the archetype.${buildLanguageInstruction(userLang)}`;

    const userPrompt = `# Assessment: ${def.title}
**Tradition:** ${def.tradition}
**Dimension:** ${def.dimension_category}

## Sub-scores (raw weighted)
${Object.entries(subScores).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Primary Result
**${primaryType?.label ?? primaryId}** — ${primaryType?.short ?? ""}
${primaryType?.description ?? ""}

## Known Shadow of this archetype
${primaryType?.shadow ?? "—"}

Write the user's deep reading now.`;

    const __billing = await getBillingFromReq(req, "analyze-assessment");

    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "tier:deep",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }, {}, __billing ?? undefined);

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      throw new Error("AI gateway error");
    }

    const aiJson = await aiResp.json();
    const deepAnalysis: string = aiJson.choices?.[0]?.message?.content ?? "";

    // Build insights, recommended masters & practices
    const recommendedMasters: string[] = primaryType?.masters ?? [];
    const insights = [
      { type: "strength", title: "Your edge", body: primaryType?.short ?? "" },
      { type: "shadow", title: "Watch for", body: primaryType?.shadow ?? "" },
    ];

    // Update result with deep analysis
    await supabase
      .from("user_assessment_results")
      .update({
        deep_analysis: deepAnalysis,
        insights,
        recommended_masters: recommendedMasters,
        result_summary: primaryType?.short ?? "",
        primary_result_label: primaryType?.label ?? primaryId,
      })
      .eq("id", result_id)
      .eq("user_id", userId);

    // ─── Engine integration ──────────────────────────────────────────
    // 1) Write a consciousness_signal so the engine can read this assessment
    const engineHooks = def.engine_hooks ?? {};
    try {
      await supabase.from("consciousness_signals").insert({
        user_id: userId,
        source_type: "assessment",
        source_id: result_id,
        confidence: 0.85,
        chitta_vritti: `Assessment: ${def.title} → ${primaryType?.label ?? primaryId}`,
        dimension_updates: {
          assessment_slug: def.slug,
          primary_result: primaryId,
          sub_scores: subScores,
          ...(engineHooks?.dimension_updates ?? {}),
        },
      });
    } catch (e) {
      console.warn("consciousness_signals insert failed:", e);
    }

    // 2) Update dimension_map_scores for traceable sub-dimensions
    try {
      for (const [dim, score] of Object.entries(subScores)) {
        const numScore = Number(score) || 0;
        await supabase.from("dimension_map_scores").upsert(
          {
            user_id: userId,
            category: def.dimension_category ?? "psyche",
            dimension_name: `${def.slug}.${dim}`,
            score: numScore,
            discovery_source: "assessment",
            last_signal_at: new Date().toISOString(),
            signal_count: 1,
          },
          { onConflict: "user_id,dimension_name" },
        );
      }
    } catch (e) {
      console.warn("dimension_map_scores upsert failed:", e);
    }

    // 2b) If this assessment writes practice levels (calibration), upsert user_practice_levels
    if (engineHooks?.writes_practice_levels) {
      try {
        // subScores keys = practice_type, raw values 0..N → cap to that practice's max level (≈7)
        // Convert weighted-sum raw to a 0–7 level: divide by 4 (max weight per Q) and round.
        for (const [practice, raw] of Object.entries(subScores)) {
          const numRaw = Number(raw) || 0;
          // Each practice has ~4 questions × max weight 4 = 16 raw. Map 0–16 → 0–7.
          const level = Math.max(0, Math.min(7, Math.round((numRaw / 16) * 7)));
          await supabase.from("user_practice_levels").upsert(
            {
              user_id: userId,
              practice_type: practice,
              current_level: level,
              sessions_at_level: 0,
            },
            { onConflict: "user_id,practice_type" },
          );
        }
      } catch (e) {
        console.warn("user_practice_levels upsert failed:", e);
      }
    }

    // 3) Mark engine_applied
    await supabase
      .from("user_assessment_results")
      .update({ engine_applied: true, engine_applied_at: new Date().toISOString() })
      .eq("id", result_id)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        deep_analysis: deepAnalysis,
        insights,
        recommended_masters: recommendedMasters,
        primary_result_label: primaryType?.label ?? primaryId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("analyze-assessment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
