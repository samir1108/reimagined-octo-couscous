/**
 * evolve-theme — runs after each session to deepen, hold, or close today's theme.
 * Reads session messages, asks AI to decide the next micro-shift, persists deepened
 * Explore / Wisdom / Reasoning / Recommended Practice for the rest of the day.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface EvolutionResult {
  decision: "deepen" | "hold" | "close";
  sub_angle: string | null;
  rationale: string;
  deepened_wisdom: string;
  deepened_reasoning: string;
  deepened_explore: { label: string; prompt: string }[];
  recommended_practice: { title: string; why: string; duration_min: number; type: string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reqBody = await req.json();
    const { sessionId } = reqBody;
    const userLang = await resolveUserLanguage(req, reqBody.language);
    const today = new Date().toISOString().split("T")[0];

    // Load today's CURRENT theme — the latest sequence row
    const { data: theme } = await supabase
      .from("daily_themes")
      .select("*")
      .eq("user_id", user.id)
      .eq("theme_date", today)
      .order("sequence_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!theme) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_theme" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (theme.evolution_status === "closed") {
      return new Response(JSON.stringify({ skipped: true, reason: "closed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load session messages
    const { data: messages } = await supabase
      .from("session_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!messages || messages.length < 2) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_messages" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const conversation = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const currentDepth = theme.current_depth ?? 0;
    const subAngle = theme.sub_angle || theme.title;

    // ── Pull user's practice domains + life goals to bias evolution ──
    let domainGoalContext = "";
    try {
      const [{ data: profRow }, { data: dnaRow }] = await Promise.all([
        supabase.from("user_consciousness_profile").select("life_domains").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_spiritual_dna").select("assessment_conversation").eq("user_id", user.id).maybeSingle(),
      ]);
      const activeDomains = (profRow?.life_domains as any)?.active_domains ?? [];
      const goals = (dnaRow?.assessment_conversation as any)?.goals ?? null;
      if (activeDomains.length || goals) {
        domainGoalContext = `\n\nUSER PRACTICE FOCUS:\n- Active practice domains: ${activeDomains.join(", ") || "—"}\n- Priority life goal: ${goals?.priorityGoal || "—"}\nWhen choosing the deepened sub-angle and recommended practice, lean toward these domains/goals when natural — never force.`;
      }
    } catch (_) { /* non-blocking */ }

    // Ask AI to decide the next move
    const systemPrompt = `You are the Living Theme Engine. The user has a daily consciousness theme that evolves session-by-session via micro-shifts.

CURRENT THEME: "${theme.title}"
CURRENT DEPTH: ${currentDepth}
CURRENT SUB-ANGLE: "${subAngle}"
DESCRIPTION: ${theme.description}${domainGoalContext}

The user just finished a session. Read the conversation and decide ONE of:
- "deepen": same theme but a deeper layer surfaced (e.g. "Anger" → "Anger underneath = fear of being unseen"). Increase depth.
- "hold": user explored but didn't move; keep theme + sub_angle as-is.
- "close": the thread reached natural completion or user clearly moved on. Close the theme.

If deepen/hold, also produce updated content (Wisdom teaching, Reasoning explanation, 3 Explore prompts, 1 recommended Practice) that fits the NEW depth.

Respond ONLY in JSON matching this shape:
{
  "decision": "deepen" | "hold" | "close",
  "sub_angle": "string (the deepened lens, max 80 chars)" or null if close,
  "rationale": "string (1 sentence why)",
  "deepened_wisdom": "string (2-3 sentence teaching at new depth)",
  "deepened_reasoning": "string (1-2 sentences why this depth now)",
  "deepened_explore": [{"label": "short", "prompt": "tap-to-open question"}, ... 3 items],
  "recommended_practice": {"title": "string", "why": "string", "duration_min": 5, "type": "breath|witness|inquiry|journal"}
}${buildLanguageInstruction(userLang)}`;

    const __billing = await getBillingFromReq(req, "evolve-theme");

    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Session conversation:\n\n${conversation}` },
        ],
        response_format: { type: "json_object" },
      }, {}, __billing ?? undefined);

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      return new Response(
        JSON.stringify({ error: "AI failed", detail: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiResp.json();
    const result: EvolutionResult = JSON.parse(aiData.choices[0].message.content);

    const depthBefore = currentDepth;
    const maxDepth = Math.min(7, Math.max(3, Number((theme as any).max_depth) || 5));
    let depthAfter = result.decision === "deepen" ? currentDepth + 1 : currentDepth;

    // Derive a 0..1 theme quality signal from this session's evolution.
    // deepen = strong engagement, hold = present but static, close = thread completed.
    const evolutionQuality =
      result.decision === "deepen"
        ? 0.85
        : result.decision === "close"
          ? 0.9
          : 0.55;

    // ── Enforce max_depth: if we'd cross it, force close ──
    let finalDecision: "deepen" | "hold" | "close" = result.decision;
    if (result.decision === "deepen" && depthAfter >= maxDepth) {
      finalDecision = "close";
      depthAfter = maxDepth;
    }
    const newStatus = finalDecision === "close" ? "closed" : "open";

    // Update theme
    await supabase
      .from("daily_themes")
      .update({
        current_depth: depthAfter,
        sub_angle: result.sub_angle ?? theme.sub_angle,
        evolution_status: newStatus,
        theme_quality: Number(evolutionQuality.toFixed(3)),
        completed: finalDecision === "close",
        deepened_wisdom: result.deepened_wisdom,
        deepened_reasoning: result.deepened_reasoning,
        deepened_explore: result.deepened_explore,
        recommended_practice: result.recommended_practice,
        last_evolved_at: new Date().toISOString(),
      })
      .eq("id", theme.id);

    // Log evolution
    await supabase.from("theme_evolution_log").insert({
      user_id: user.id,
      theme_id: theme.id,
      session_id: sessionId,
      depth_before: depthBefore,
      depth_after: depthAfter,
      sub_angle_before: theme.sub_angle,
      sub_angle_after: result.sub_angle,
      decision: finalDecision,
      rationale: result.rationale,
    });

    // ── If theme just closed, auto-spawn the next theme of the day ──
    let nextThemeSpawned = false;
    if (finalDecision === "close") {
      try {
        const spawnResp = await fetch(`${SUPABASE_URL}/functions/v1/generate-theme`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ autoNextTheme: true }),
        });
        if (spawnResp.ok) {
          const spawnData = await spawnResp.json().catch(() => ({}));
          nextThemeSpawned = true;
          await supabase.from("notifications").insert({
            user_id: user.id,
            type: "theme_spawned",
            title: "✨ A new theme has arrived",
            body: spawnData?.theme?.title
              ? `Your next theme: "${spawnData.theme.title}". Tap to begin.`
              : "Your next theme is ready. Tap to begin.",
            metadata: {
              previous_theme_id: theme.id,
              new_theme_id: spawnData?.theme?.id ?? null,
              sequence_no: spawnData?.theme?.sequence_no ?? null,
            },
          });
        } else {
          console.error("evolve-theme: auto-spawn failed", await spawnResp.text().catch(() => ""));
        }
      } catch (spawnErr) {
        console.error("evolve-theme: auto-spawn error", spawnErr);
      }
    }

    // Notify on deepen/close (skip plain "hold"); skip the close notification
    // if we already sent the spawn notification above.
    if (finalDecision === "deepen") {
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "theme_evolved",
        title: `Theme deepened: ${result.sub_angle}`,
        body: result.rationale,
        metadata: { theme_id: theme.id, decision: finalDecision, depth: depthAfter, max_depth: maxDepth },
      });
    } else if (finalDecision === "close" && !nextThemeSpawned) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "theme_evolved",
        title: "This thread closed.",
        body: result.rationale,
        metadata: { theme_id: theme.id, decision: finalDecision, depth: depthAfter, max_depth: maxDepth },
      });
    }

    return new Response(
      JSON.stringify({ success: true, ...result, depth_after: depthAfter }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
