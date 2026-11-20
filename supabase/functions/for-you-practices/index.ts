// supabase/functions/for-you-practices/index.ts
// Generates a personalized daily list of micro-practices for the user
// based on their chosen practice domains + life goals.
// Cached per user per day in for_you_cache table (created on first run).

import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface Practice {
  domain: string;
  emoji: string;
  title: string;
  why: string;
  duration_min: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const userLang = await resolveUserLanguage(req);

    // Fetch user context
    const [{ data: prof }, { data: dna }] = await Promise.all([
      admin.from("user_consciousness_profile")
        .select("life_domains, current_band")
        .eq("user_id", user.id).maybeSingle(),
      admin.from("spiritual_dna_assessments")
        .select("assessment_conversation")
        .eq("user_id", user.id).maybeSingle(),
    ]);

    const activeDomains: string[] =
      (prof?.life_domains as any)?.active_domains ??
      ["observation", "self_inquiry", "meditation", "emotion_tracking", "nature", "real_life", "relationship", "journaling"];
    const goals = (dna?.assessment_conversation as any)?.goals ?? null;
    const band = (prof as any)?.current_band ?? 1;

    const promptBody = `Generate exactly 6 distinct daily micro-practices for a seeker.

Their chosen practice domains: ${activeDomains.join(", ")}
Their priority goal: ${goals?.priorityGoal ?? "general awareness"}
Other goals: ${(goals?.secondaryGoals ?? []).join(", ") || "none"}
Current consciousness band (0-10): ${band}

Rules:
- Each practice must map to ONE of the user's chosen domains
- Title: 4-8 words, action-oriented (e.g., "Trace one judgment to its root")
- Why: 1 sentence explaining the inner shift
- Duration: 2-15 minutes
- Variety: Cover at least 4 different domains across the 6 picks
- No fluff, no preamble, no spiritual jargon

Return ONLY a JSON array, no markdown:
[{"domain":"shadow_work","emoji":"🌑","title":"...","why":"...","duration_min":5}, ...]`;

    let practices: Practice[] = [];
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You output ONLY valid JSON arrays. No prose. No markdown fences." + buildLanguageInstruction(userLang) },
            { role: "user", content: promptBody },
          ],
          temperature: 0.7,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
      });
      const j = await resp.json();
      let raw = j?.choices?.[0]?.message?.content ?? "[]";
      // tolerate {"practices":[…]} as well
      try {
        const parsed = JSON.parse(raw);
        practices = Array.isArray(parsed) ? parsed : (parsed.practices ?? parsed.list ?? []);
      } catch {
        const m = raw.match(/\[[\s\S]*\]/);
        if (m) practices = JSON.parse(m[0]);
      }
    } catch (e) {
      console.error("AI generation failed:", e);
    }

    // Fallback if AI failed
    if (!practices.length) {
      practices = activeDomains.slice(0, 6).map((d) => ({
        domain: d,
        emoji: "✨",
        title: `Bring awareness to ${d.replace(/_/g, " ")}`,
        why: "A simple touchpoint to deepen practice today.",
        duration_min: 5,
      }));
    }

    return new Response(JSON.stringify({
      date: today,
      practices,
      domains_used: Array.from(new Set(practices.map((p) => p.domain))),
      goal: goals?.priorityGoal ?? null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("for-you-practices error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
