import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const {
      data: { user },
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Not authenticated");

    const { timeSlot } = await req.json(); // 'morning' | 'evening' | 'night'

    // Gather user context in parallel
    const [
      { data: profile },
      { data: consProfile },
      { data: recentSessions },
      { data: recentJournals },
      { data: recentSignals },
      { data: theme },
      { data: userProfile },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, created_at")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_consciousness_profile")
        .select(
          "journey_day, journey_phase, v_level_current, v_level_baseline, chitta_vritti, overall_band, dimension_bands, active_loops, streak_current, total_sessions, total_journal_entries, witness_depth, integration_score"
        )
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("sessions")
        .select("time_slot, type, summary, session_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("journal_entries")
        .select("content, mood, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("consciousness_signals")
        .select(
          "head_signals, heart_signals, gut_signals, witness_signals, loops_detected, chitta_vritti, dimension_updates"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("daily_themes")
        .select("title, description")
        .eq("user_id", user.id)
        .eq("theme_date", new Date().toISOString().split("T")[0])
        .single(),
      supabase
        .from("user_psyche_profile")
        .select("shadow, defenses, emotional_signatures, inner_voices")
        .eq("user_id", user.id)
        .single(),
    ]);

    const journeyDay = consProfile?.journey_day || 1;
    const userName = profile?.display_name || "Seeker";

    // Build rich context
    const contextParts: string[] = [];
    contextParts.push(`User: ${userName}, Journey Day ${journeyDay}, Phase: ${consProfile?.journey_phase || "calibration"}`);
    contextParts.push(`V-Level: ${consProfile?.v_level_current || 3}/10, Baseline: ${consProfile?.v_level_baseline || 3}, Streak: ${consProfile?.streak_current || 0} days`);
    contextParts.push(`Total sessions: ${consProfile?.total_sessions || 0}, Journal entries: ${consProfile?.total_journal_entries || 0}`);
    contextParts.push(`Chitta Vritti: ${consProfile?.chitta_vritti || "mudha"}`);
    contextParts.push(`Witness depth: ${consProfile?.witness_depth || 0}, Integration: ${consProfile?.integration_score || 0}`);

    if (consProfile?.dimension_bands) {
      contextParts.push(`Dimension bands: ${JSON.stringify(consProfile.dimension_bands)}`);
    }
    if (consProfile?.active_loops) {
      const loops = Array.isArray(consProfile.active_loops) ? consProfile.active_loops : [];
      if (loops.length > 0) contextParts.push(`Active loops: ${JSON.stringify(loops.slice(0, 5))}`);
    }
    if (theme) {
      contextParts.push(`Today's theme: "${theme.title}" â€” ${theme.description}`);
    }
    if (recentSessions?.length) {
      const summaries = recentSessions
        .filter((s: any) => s.summary)
        .slice(0, 3)
        .map((s: any) => `[${s.time_slot}] ${s.summary}`)
        .join("\n");
      if (summaries) contextParts.push(`Recent session summaries:\n${summaries}`);
    }
    if (recentJournals?.length) {
      const excerpts = recentJournals
        .slice(0, 3)
        .map((j: any) => j.content.slice(0, 200))
        .join("\n---\n");
      contextParts.push(`Recent journal excerpts:\n${excerpts}`);
    }
    if (recentSignals?.length) {
      const loopsDetected = recentSignals
        .flatMap((s: any) => {
          const ld = s.loops_detected;
          return Array.isArray(ld) ? ld : [];
        })
        .slice(0, 5);
      if (loopsDetected.length > 0) contextParts.push(`Recently detected loops: ${JSON.stringify(loopsDetected)}`);
    }
    if (userProfile?.shadow) {
      contextParts.push(`Shadow work data: ${JSON.stringify(userProfile.shadow)}`);
    }

    const timeSlotLabels: Record<string, string> = {
      morning: "Morning (start of day)",
      evening: "Evening (reflection time)",
      night: "Night (wind-down)",
    };

    const systemPrompt = `You are the consciousness guide for HOPE â€” a spiritual growth app. Generate a rich, deeply personalized journey notification for ${userName}.

TIME: ${timeSlotLabels[timeSlot] || timeSlot}

USER CONTEXT:
${contextParts.join("\n")}

INSTRUCTIONS:
1. Write a notification that feels like a wise friend who knows this person deeply.
2. Reference specific patterns, loops, or growth you see in their data.
3. The title should be short, evocative (include an emoji), and specific to THEIR journey â€” not generic.
4. The body should be 2-3 paragraphs:
   - Paragraph 1: A personal observation about where they are right now (reference their data â€” streak, patterns, consciousness state, recent sessions/journals)
   - Paragraph 2: A teaching or insight relevant to their current phase and time of day
   - Paragraph 3: A gentle call to action â€” either journal about something specific, or explore a specific guide mode
5. Suggest ONE action: either "journal" or "guide" and a specific mode/context.
6. For morning: energize and set intention. For evening: reflect and integrate. For night: gentle wisdom and rest.
7. Do NOT be generic. Every sentence should feel like it was written for THIS person specifically.
8. Keep language warm but direct. No fluff.`;

    const __billing = await getBillingFromReq(req, "generate-journey-nudge");

    const response = await aiGatewayFetchWithLang(req, {
        model: "tier:deep",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate the ${timeSlot} journey notification for Day ${journeyDay}. Return as JSON.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_journey_notification",
              description: "Create a rich, personalized journey notification",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Short notification title with emoji (max 60 chars)",
                  },
                  body: {
                    type: "string",
                    description:
                      "Rich 2-3 paragraph notification body. Use newlines between paragraphs.",
                  },
                  action: {
                    type: "string",
                    enum: ["guide", "journal"],
                    description: "Suggested action type",
                  },
                  guide_mode: {
                    type: "string",
                    description:
                      "If action=guide, the mode to open (e.g. shadow_work, self_inquiry, emotional_check, thought_observation, body_scan, witness_practice, loop_explorer, inner_child, gratitude, future_self, theory)",
                  },
                  journal_prompt: {
                    type: "string",
                    description:
                      "If action=journal, a specific prompt to journal about",
                  },
                  ai_context: {
                    type: "string",
                    description:
                      "Short context string for the AI guide/journal to reference",
                  },
                },
                required: ["title", "body", "action", "ai_context"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "create_journey_notification" },
        },
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits" }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI error ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const nudge = JSON.parse(toolCall.function.arguments);

    // Build metadata
    const metadata: Record<string, any> = {
      source: "journey_nudge",
      timeSlot,
      journeyDay,
    };

    if (nudge.action === "guide") {
      metadata.action = "guide";
      metadata.mode = nudge.guide_mode || "open";
      metadata.aiContext = nudge.ai_context || `journey_day_${journeyDay}_${timeSlot}`;
    } else {
      metadata.action = "journal";
      metadata.journalPrompt = nudge.journal_prompt || "";
      metadata.aiContext = nudge.ai_context || `journey_day_${journeyDay}_${timeSlot}`;
    }

    // Insert notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "onboarding",
      title: nudge.title,
      body: nudge.body,
      metadata,
    });

    return new Response(JSON.stringify({ success: true, nudge }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-journey-nudge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
