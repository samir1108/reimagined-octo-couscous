import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

/**
 * COMPANION ENGINE â€” The "true AI companion" brain
 * 
 * Runs for a user (triggered by app open or cron) and:
 * 1. Proactive Initiation â€” detects patterns worth reaching out about
 * 2. Emotional Memory â€” builds emotional timeline for callbacks
 * 3. Cross-Pattern Insights â€” synthesizes journals + sessions + loops
 * 4. "It Gets Me" moments â€” finds connections user hasn't seen
 * 5. Contextual Awareness â€” time, streak, life events
 * 6. Milestone Detection â€” celebrates unprompted
 */

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error("[companion-engine] missing required env vars");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // â”€â”€â”€ Throttle: max 1 companion run per 6 hours â”€â”€â”€
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: recentCompanion } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .in("type", ["companion_insight", "companion_milestone", "companion_nudge", "companion_pattern"])
      .gte("created_at", sixHoursAgo)
      .limit(1);

    if (recentCompanion && recentCompanion.length > 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "throttled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // â”€â”€â”€ Gather comprehensive user data â”€â”€â”€
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: profile },
      { data: consProfile },
      { data: recentSessions },
      { data: recentJournals },
      { data: activeLoops },
      { data: recentSignals },
      { data: memories },
      { data: regressions },
      { data: todaySessions },
      { data: psycheProfile },
    ] = await Promise.all([
      admin.from("profiles").select("display_name, created_at").eq("user_id", user.id).maybeSingle(),
      admin.from("user_consciousness_profile").select("*").eq("user_id", user.id).maybeSingle(),
      admin.from("sessions").select("id, summary, session_date, time_slot, type, user_chosen_topic, created_at")
        .eq("user_id", user.id).gte("session_date", sevenDaysAgo.split("T")[0])
        .order("created_at", { ascending: false }).limit(20),
      admin.from("journal_entries").select("content, mood, title, created_at")
        .eq("user_id", user.id).gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false }).limit(10),
      admin.from("user_loops").select("loop_id, severity, awareness_score, status, last_activated_at, first_detected_at")
        .eq("user_id", user.id).in("status", ["active", "aware"]).limit(10),
      admin.from("consciousness_signals").select("loops_detected, dimension_updates, chitta_vritti, heart_signals, gut_signals, created_at")
        .eq("user_id", user.id).gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false }).limit(15),
      admin.from("guru_memory").select("content, category, emotional_tone, importance, tags, dimension_relevant, created_at")
        .eq("user_id", user.id).eq("is_consolidated", false)
        .order("importance", { ascending: false }).limit(20),
      admin.from("regression_events").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(3),
      admin.from("sessions").select("id, time_slot, status")
        .eq("user_id", user.id).eq("session_date", today),
      admin.from("user_psyche_profile").select("shadow, defenses, emotional_signatures, inner_voices, beliefs")
        .eq("user_id", user.id).maybeSingle(),
    ]);

    const userName = profile?.display_name || "friend";
    const journeyDay = consProfile?.journey_day || 1;
    const streak = consProfile?.streak_current || 0;
    const longestStreak = consProfile?.streak_longest || 0;
    const band = consProfile?.overall_band || 0;
    const state = consProfile?.state || "normal";
    const totalSessions = consProfile?.total_sessions || 0;
    const totalJournals = consProfile?.total_journal_entries || 0;

    // â”€â”€â”€ Compute companion signals â”€â”€â”€
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString("en", { weekday: "long" });
    const daysOnPlatform = Math.ceil((now.getTime() - new Date(profile?.created_at || now).getTime()) / 86400000);

    // Emotional trajectory from journals
    const emotionalTrajectory = (recentJournals || []).map((j: any) => ({
      mood: j.mood,
      date: new Date(j.created_at).toLocaleDateString(),
      snippet: j.content?.slice(0, 150),
    }));

    // Loop patterns
    const loopSummary = (activeLoops || []).map((l: any) => ({
      id: l.loop_id,
      severity: l.severity,
      awareness: l.awareness_score,
      daysSinceDetected: Math.ceil((now.getTime() - new Date(l.first_detected_at).getTime()) / 86400000),
    }));

    // Session frequency (last 7 days)
    const sessionDays = new Set((recentSessions || []).map((s: any) => s.session_date));
    const activeDaysLast7 = sessionDays.size;

    // Memory emotional themes
    const emotionalMemories = (memories || [])
      .filter((m: any) => m.emotional_tone)
      .slice(0, 10)
      .map((m: any) => ({
        content: (m.content ?? "").slice(0, 200),
        tone: m.emotional_tone,
        importance: m.importance,
        category: m.category,
      }));

    // Dimension bands for imbalance detection
    const dimBands = consProfile?.dimension_bands || {};

    // Build the massive context for AI analysis
    const analysisContext = {
      user: {
        name: userName,
        journeyDay,
        daysOnPlatform,
        streak,
        longestStreak,
        band,
        state,
        totalSessions,
        totalJournals,
        chitta_vritti: consProfile?.chitta_vritti,
        witnessDepth: consProfile?.witness_depth,
        integrationScore: consProfile?.integration_score,
      },
      temporal: {
        hour,
        dayOfWeek,
        timeOfDay: hour < 6 ? "dawn" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night",
        todaySessionsDone: (todaySessions || []).filter((s: any) => s.status === "completed").length,
      },
      emotional: {
        trajectory: emotionalTrajectory,
        memories: emotionalMemories,
        psyche: psycheProfile ? {
          shadow: psycheProfile.shadow,
          innerVoices: psycheProfile.inner_voices,
          emotionalSignatures: psycheProfile.emotional_signatures,
        } : null,
      },
      patterns: {
        activeLoops: loopSummary,
        dimensionBands: dimBands,
        activeDaysLast7,
        regressions: (regressions || []).slice(0, 2),
        recentSessionSummaries: (recentSessions || [])
          .filter((s: any) => s.summary)
          .slice(0, 5)
          .map((s: any) => ({ date: s.session_date, slot: s.time_slot, summary: s.summary, topic: s.user_chosen_topic })),
      },
    };

    // â”€â”€â”€ AI Companion Analysis â”€â”€â”€
    const systemPrompt = `You are the Companion Intelligence for HOPE â€” a consciousness growth app. Your job is to analyze a user's complete data and generate ONE deeply personalized, proactive notification.

You are NOT a generic mindfulness bot. You are a COMPANION who:
- REMEMBERS specific things the user said, felt, explored
- NOTICES patterns the user hasn't consciously connected
- CELEBRATES milestones they might not realize they've hit
- WARNS gently about regression patterns forming
- CONNECTS dots across journals, sessions, loops, and emotional states

ANALYSIS CATEGORIES (pick the MOST impactful one):

1. **CROSS-PATTERN INSIGHT** â€” You noticed a connection between their journal entries, session topics, and active loops that they haven't explicitly seen. E.g., "Three times this week you wrote about control â€” in your morning session about work deadlines, your journal about your relationship, and the control loop we detected. There's a thread here worth pulling."

2. **EMOTIONAL CALLBACK** â€” Reference a specific emotional moment from their history that's relevant now. E.g., "Remember Tuesday when you wrote about feeling lighter after noticing the people-pleasing pattern? That awareness hasn't disappeared â€” it's been quietly working."

3. **MILESTONE CELEBRATION** â€” A meaningful achievement they might not notice: streak milestones (7, 14, 21, 30, 50, 100), session count milestones, first time a loop moved from 'active' to 'aware', dimension growth, etc.

4. **REGRESSION WARNING** â€” Gentle, loving alert that patterns suggest a regression forming. NOT scary â€” framed as "your companion noticed something." E.g., "I noticed your sessions got shorter this week, and there's a familiar pattern here. No judgment â€” just an invitation to check in."

5. **"I SEE YOU" MOMENT** â€” The most powerful: synthesize everything to say something so precisely accurate about their inner state that they feel truly seen. Reference specific data points woven into human insight.

6. **CONTEXTUAL NUDGE** â€” Time-aware, life-event-aware gentle push. E.g., "It's Friday evening and you haven't journaled since Tuesday. The thoughts building up this week might appreciate some space."

RULES:
- NEVER be generic. Every word must reference THEIR specific data.
- Keep title under 50 chars with ONE emoji
- Body: 2-3 short paragraphs, conversational, warm but direct
- Suggest ONE action (guide mode or journal)
- If nothing compelling to say, return type="skip" â€” NEVER send a generic notification
- Match their consciousness band in language complexity`;

    const __billing = await getBillingFromReq(req, "companion-engine");

    const response = await aiGatewayFetchWithLang(req, {
        model: "tier:deep",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this user's complete data and generate ONE companion notification:\n\n${JSON.stringify(analysisContext, null, 2)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_companion_notification",
            description: "Generate a proactive companion notification based on pattern analysis",
            parameters: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["cross_pattern", "emotional_callback", "milestone", "regression_warning", "i_see_you", "contextual_nudge", "skip"],
                  description: "The type of companion notification",
                },
                title: { type: "string", description: "Notification title with emoji (max 50 chars)" },
                body: { type: "string", description: "2-3 paragraph personalized body" },
                action: { type: "string", enum: ["guide", "journal", "none"], description: "Suggested action" },
                guide_mode: { type: "string", description: "Guide mode to open if action=guide" },
                journal_prompt: { type: ["string", "null"], description: "Journal prompt if action=journal, otherwise null" },
                ai_context: { type: "string", description: "Context for the guide/journal" },
                insight_summary: { type: "string", description: "One-line insight for the companion to remember" },
                referenced_data: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of specific data points referenced (for logging)",
                },
              },
              required: ["type", "title", "body", "action", "insight_summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_companion_notification" } },
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Companion AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Avoid noisy 500s on the client: treat AI failure as "nothing to say".
      console.warn("Companion AI non-ok:", response.status, errText);
      return new Response(JSON.stringify({ skipped: true, reason: "ai_unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const companion = JSON.parse(toolCall.function.arguments);

    // Skip if AI determined nothing compelling
    if (companion.type === "skip") {
      return new Response(JSON.stringify({ skipped: true, reason: "nothing_compelling" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map companion type to notification type
    const notifTypeMap: Record<string, string> = {
      cross_pattern: "companion_insight",
      emotional_callback: "companion_insight",
      milestone: "companion_milestone",
      regression_warning: "companion_nudge",
      i_see_you: "companion_pattern",
      contextual_nudge: "companion_nudge",
    };

    const metadata: Record<string, any> = {
      source: "companion_engine",
      companionType: companion.type,
      insightSummary: companion.insight_summary,
      referencedData: companion.referenced_data || [],
    };

    if (companion.action === "guide") {
      metadata.action = "guide";
      metadata.mode = companion.guide_mode || "open";
      metadata.aiContext = companion.ai_context || "";
    } else if (companion.action === "journal") {
      metadata.action = "journal";
      metadata.journalPrompt = companion.journal_prompt || "";
      metadata.aiContext = companion.ai_context || "";
    }

    // Insert notification
    await admin.from("notifications").insert({
      user_id: user.id,
      type: notifTypeMap[companion.type] || "companion_insight",
      title: companion.title,
      body: companion.body,
      metadata,
    });

    // Store the insight as a memory for future reference
    await admin.from("guru_memory").insert({
      user_id: user.id,
      content: `[Companion Insight] ${companion.insight_summary}`,
      category: "companion_insight",
      source_type: "companion_engine",
      importance: 7,
      emotional_tone: companion.type === "milestone" ? "celebration" : companion.type === "regression_warning" ? "concern" : "insight",
      tags: ["companion", companion.type],
    });

    return new Response(JSON.stringify({ success: true, type: companion.type, title: companion.title }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("companion-engine error:", e);
    return new Response(JSON.stringify({ skipped: true, reason: "error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
