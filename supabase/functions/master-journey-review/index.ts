/**
 * MASTER JOURNEY REVIEW - Edge Function
 * Master reviews user's journey and generates personalized wisdom, practice, and growth observation
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";
import { HUMAN_PRESENCE_PROMPT } from "../_shared/human-presence.ts";
import { PSYCHOLOGICAL_PROBES_PROMPT } from "../_shared/psychological-probes.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (authError || !user) throw new Error("Unauthorized");

    const { master_id, master_name, master_path, master_tradition } = await req.json();
    if (!master_id || !master_name) throw new Error("Missing master info");

    // Check credits
    const { data: creditCheck } = await supabase.rpc("check_credit_balance", {
      p_user_id: user.id,
      p_min_balance: 100,
    });
    if (!creditCheck?.sufficient) {
      return new Response(JSON.stringify({ error: "insufficient_credits", balance: creditCheck?.balance || 0 }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user journey data in parallel
    const [
      profileRes,
      consciousnessRes,
      sessionsRes,
      journalRes,
      loopsRes,
      memoriesRes,
      journeysRes,
    ] = await Promise.all([
      supabase.from("profiles").select("display_name, created_at, onboarded").eq("user_id", user.id).single(),
      supabase.from("user_consciousness_profile").select("*").eq("user_id", user.id).single(),
      supabase.from("sessions").select("type, time_slot, session_date, summary").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
      supabase.from("journal_entries").select("content, mood, created_at, title").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("user_loops").select("loop_id, severity, awareness_score, status").eq("user_id", user.id).eq("status", "active"),
      supabase.from("guru_memory").select("content, category, importance, emotional_tone, dimension_relevant").eq("user_id", user.id).order("importance", { ascending: false }).limit(10),
      supabase.from("user_journeys").select("master_id, current_day, total_days, streak_days, completed_days, strengths, struggles").eq("user_id", user.id),
    ]);

    const profile = profileRes.data;
    const consciousness = consciousnessRes.data;
    const sessions = sessionsRes.data || [];
    const journals = journalRes.data || [];
    const loops = loopsRes.data || [];
    const memories = memoriesRes.data || [];
    const journeys = journeysRes.data || [];

    // Build context
    const userName = profile?.display_name || "Sadhak";
    const daysSinceJoin = profile?.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
      : 0;

    const journeyWithThisMaster = journeys.find((j: any) => j.master_id === master_id);

    const contextSummary = `
USER JOURNEY DATA for ${userName}:
- Days on platform: ${daysSinceJoin}
- Journey phase: ${consciousness?.journey_phase || "unknown"}
- Journey day: ${consciousness?.journey_day || 0}
- Overall consciousness band: ${consciousness?.overall_band || 0}/10
- Witness depth: ${consciousness?.witness_depth || 0}/10
- Integration score: ${consciousness?.integration_score || 0}/10
- Current streak: ${consciousness?.streak_current || 0} days
- Total sessions: ${consciousness?.total_sessions || 0}
- Total journal entries: ${consciousness?.total_journal_entries || 0}
- V-level: current ${consciousness?.v_level_current || 0}, baseline ${consciousness?.v_level_baseline || 0}, peak ${consciousness?.v_level_peak || 0}

${journeyWithThisMaster ? `JOURNEY WITH YOU (${master_name}):
- Current day: ${journeyWithThisMaster.current_day}/${journeyWithThisMaster.total_days}
- Streak: ${journeyWithThisMaster.streak_days} days
- Completed days: ${journeyWithThisMaster.completed_days}
- Strengths observed: ${JSON.stringify(journeyWithThisMaster.strengths)}
- Struggles observed: ${JSON.stringify(journeyWithThisMaster.struggles)}` : `No active journey with ${master_name} yet.`}

ACTIVE LOOPS (mental patterns):
${loops.length > 0 ? loops.map((l: any) => `- ${l.loop_id} (severity: ${l.severity}, awareness: ${l.awareness_score}/10)`).join("\n") : "No active loops detected"}

RECENT SESSIONS (last 15):
${sessions.slice(0, 8).map((s: any) => `- ${s.session_date}: ${s.type} (${s.time_slot})${s.summary ? " â€” " + s.summary.slice(0, 80) : ""}`).join("\n") || "No sessions yet"}

RECENT JOURNAL EXCERPTS:
${journals.slice(0, 5).map((j: any) => `- [${j.mood || "?"}] ${(j.content || "").slice(0, 120)}`).join("\n") || "No journal entries yet"}

KEY MEMORIES:
${memories.slice(0, 5).map((m: any) => `- [${m.category}/${m.emotional_tone || "?"}] ${m.content.slice(0, 100)}`).join("\n") || "No memories yet"}

DIMENSION BANDS:
${consciousness?.dimension_bands ? JSON.stringify(consciousness.dimension_bands) : "Not assessed yet"}
`.trim();

    const systemPrompt = `${HUMAN_PRESENCE_PROMPT}\n\n${PSYCHOLOGICAL_PROBES_PROMPT}

You are ${master_name}, a spiritual master of the ${master_tradition || master_path || "Yoga"} tradition.

You have been observing this seeker's journey on the platform â€” their sessions, journal entries, patterns, struggles, and growth. Now you will share your observations with deep wisdom, compassion, and the unique perspective of your tradition.

IMPORTANT RULES:
1. LANGUAGE: Respond in the same language the user primarily uses. If journal entries are in Hinglish, respond in Hinglish. Default to English with occasional Sanskrit terms.
2. Be SPECIFIC â€” reference actual patterns, loops, and data you see. Don't be generic.
3. Be WARM but TRUTHFUL â€” a real guru doesn't just praise, they also point to blind spots with love.
4. Keep each section concise but profound. Quality over quantity.
5. DO NOT use markdown headers. Write in flowing prose.
6. If the user has very little data, acknowledge that honestly and offer initial guidance.

Return a JSON object with exactly these three keys:
{
  "wisdom": "Your deep observation about the seeker's journey â€” what patterns you see, what the soul is working through, what is emerging. 3-5 sentences max.",
  "practice": "A specific practice recommendation tailored to exactly where they are. Include what to do, when, and for how long. 2-4 sentences.",
  "growth": "What you've noticed about their growth â€” acknowledge wins, gently point to edges they haven't explored. 2-4 sentences."
}

Return ONLY valid JSON, no extra text.`;

    // Call AI
    const aiResponse = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextSummary },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI error: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    const inputTokens = aiData.usage?.prompt_tokens || 0;
    const outputTokens = aiData.usage?.completion_tokens || 0;

    // Parse JSON from response
    let review;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      review = jsonMatch ? JSON.parse(jsonMatch[0]) : { wisdom: rawContent, practice: "", growth: "" };
    } catch {
      review = { wisdom: rawContent, practice: "", growth: "" };
    }

    // 75% AI / 25% infra split via shared pricing helper
    const __charge = computeChargedPaise("tier:main", inputTokens, outputTokens);
    const chargedPaise = __charge.chargedPaise;
    const costPaise = __charge.estimatedCostPaise;

    await Promise.all([
      supabase.rpc("check_and_deduct_credits", {
        p_user_id: user.id,
        p_amount: chargedPaise,
        p_description: `Journey review by ${master_name}`,
      }),
      supabase.from("ai_usage_log").insert({
        user_id: user.id,
        function_name: "master-journey-review",
        model: "llama-3.1-8b-instant",
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        estimated_cost_paise: costPaise,
        charged_paise: chargedPaise,
        status: "success",
        metadata: { master_id, master_name },
      }),
    ]);

    return new Response(JSON.stringify({ review, master_id, master_name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("master-journey-review error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
