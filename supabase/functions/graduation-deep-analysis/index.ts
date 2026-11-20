// Graduation Deep Analysis — fuses 32 mirrors + 60 sessions + journals + loops + memory
// + consciousness profile into ONE deep "Who You Are" report via ConsciousOS AI (Gemini 2.5 Pro).
// Caches in `graduation_reports` (one row per user). Idempotent — returns cached if exists
// unless ?force=1.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";

    // 1) Return cache unless force
    if (!force) {
      const { data: cached } = await supabase
        .from("graduation_reports")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (cached) {
        return json({ report: cached, cached: true });
      }
    }

    // 2) Pull EVERYTHING in parallel
    const [
      mirrorsRes,
      sessionsRes,
      journalsRes,
      loopsRes,
      memoryRes,
      profileRes,
      psycheRes,
      assessmentsRes,
    ] = await Promise.all([
      supabase
        .from("pre_journey_mirrors")
        .select(
          "mirror_number, answers, mood_score, energy_score, clarity_score, insight, created_at",
        )
        .eq("user_id", userId)
        .order("mirror_number", { ascending: true }),
      supabase
        .from("sessions")
        .select("type, time_slot, status, created_at, ended_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(80),
      supabase
        .from("journal_entries")
        .select("title, content, mood, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("user_loops")
        .select("loop_id, status, created_at")
        .eq("user_id", userId)
        .limit(50),
      supabase
        .from("guru_memory")
        .select("content, importance, category, dimension_relevant")
        .eq("user_id", userId)
        .order("importance", { ascending: false })
        .limit(40),
      supabase
        .from("user_consciousness_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_psyche_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_assessment_results")
        .select("assessment_slug, result_data, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const mirrors = mirrorsRes.data ?? [];
    const sessions = sessionsRes.data ?? [];
    const journals = journalsRes.data ?? [];
    const loops = loopsRes.data ?? [];
    const memory = memoryRes.data ?? [];
    const assessments = assessmentsRes.data ?? [];
    const profile = profileRes.data ?? null;
    const psyche = psycheRes.data ?? null;

    // 3) Aggregate baseline
    const avg = (arr: number[]) =>
      arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
    const moodVals = mirrors
      .map((m: { mood_score: number | null }) => m.mood_score)
      .filter((v): v is number => typeof v === "number");
    const energyVals = mirrors
      .map((m: { energy_score: number | null }) => m.energy_score)
      .filter((v): v is number => typeof v === "number");
    const clarityVals = mirrors
      .map((m: { clarity_score: number | null }) => m.clarity_score)
      .filter((v): v is number => typeof v === "number");

    const insights = mirrors
      .map((m: { insight: string | null }) => m.insight)
      .filter((s): s is string => !!s && s.trim().length > 12);
    const longestInsight =
      insights.sort((a, b) => b.length - a.length)[0] ?? null;

    // 4) Build the deep-analysis prompt
    const compact = {
      mirror_count: mirrors.length,
      session_count: sessions.length,
      journal_count: journals.length,
      loop_count: loops.length,
      memory_count: memory.length,
      assessment_count: assessments.length,
      profile,
      psyche,
      mirror_answers: mirrors.map((m: {
        mirror_number: number;
        answers: Record<string, unknown> | null;
        insight: string | null;
      }) => ({
        n: m.mirror_number,
        a: m.answers,
        i: m.insight,
      })),
      assessment_results: assessments.map((a: {
        assessment_slug: string;
        result_data: unknown;
      }) => ({
        slug: a.assessment_slug,
        data: a.result_data,
      })),
      active_loops: loops
        .filter((l: { status: string }) => l.status === "active")
        .map((l: { loop_id: string }) => l.loop_id),
      dissolved_loops: loops
        .filter((l: { status: string }) => l.status === "dissolved" || l.status === "resolved")
        .map((l: { loop_id: string }) => l.loop_id),
      top_memories: memory.slice(0, 20).map((m: {
        content: string;
        importance: number;
        category: string | null;
      }) => ({
        c: m.content,
        i: m.importance,
        cat: m.category,
      })),
      recent_journals: journals.slice(0, 10).map((j: {
        content: string;
        mood: string | null;
      }) => ({
        c: (j.content ?? "").slice(0, 280),
        m: j.mood,
      })),
    };

    const systemPrompt =
      `You are an elite consciousness analyst trained in Yoga, Vedanta, Tantra, ` +
      `depth psychology (Jung), Internal Family Systems, and Ayurveda. ` +
      `You synthesize 60+ sessions and 32 deep mirrors into ONE precise portrait of ` +
      `who this person actually is — not who they performed as. ` +
      `Be specific, kind, and bold. Avoid spiritual platitudes. ` +
      `Speak in second person ("you"). Every claim must be grounded in the data given. ` +
      `Return ONLY via the function tool — no prose.`;

    const userPrompt =
      `Analyze this seeker's full Foundation journey and produce their graduation portrait.\n\n` +
      `DATA:\n${JSON.stringify(compact).slice(0, 60000)}`;

    const tool = {
      type: "function",
      function: {
        name: "produce_graduation_report",
        description: "Produce the deep graduation portrait.",
        parameters: {
          type: "object",
          properties: {
            archetype: {
              type: "string",
              description: "Core archetype name, e.g. 'The Quiet Witness'.",
            },
            archetype_subtype: {
              type: "string",
              description: "Modifier, e.g. 'with a sharp critic underneath'.",
            },
            archetype_reason: {
              type: "string",
              description: "1-3 sentences. Grounded in their data.",
            },
            one_sentence: {
              type: "string",
              description:
                "The single sentence that defines them. Bold. Specific. ≤ 25 words.",
            },
            pull_skill: { type: "string" },
            avoid_skill: { type: "string" },
            home_skills: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 of the 12 skills that are their natural home.",
            },
            dominant_guna: {
              type: "string",
              enum: ["sattva", "rajas", "tamas"],
            },
            guna_ratio: {
              type: "object",
              properties: {
                sattva: { type: "number" },
                rajas: { type: "number" },
                tamas: { type: "number" },
              },
              required: ["sattva", "rajas", "tamas"],
              additionalProperties: false,
            },
            dosha_pattern: {
              type: "string",
              description: "e.g. 'vata-pitta', 'kapha-dominant'.",
            },
            active_loops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  domain: { type: "string" },
                  evidence: { type: "string" },
                },
                required: ["name", "domain", "evidence"],
                additionalProperties: false,
              },
            },
            dissolved_loops: {
              type: "array",
              items: { type: "string" },
            },
            shadow_map: {
              type: "object",
              properties: {
                primary_shadow: { type: "string" },
                gift_inside: { type: "string" },
              },
              required: ["primary_shadow", "gift_inside"],
              additionalProperties: false,
            },
            bypass_risk: {
              type: "string",
              enum: ["low", "moderate", "high"],
            },
            recommended_lineage: {
              type: "string",
              description: "Karma / Bhakti / Jnana / Raja / Tantra / Hybrid.",
            },
            recommended_gurus: {
              type: "array",
              items: { type: "string" },
              description: "2-4 master names from the roster who fit them.",
            },
            pace_profile: {
              type: "string",
              enum: ["fast", "steady", "deep"],
            },
            companion_tone: {
              type: "string",
              enum: ["fierce", "direct", "warm", "gentle", "playful"],
            },
            priority_domain: {
              type: "string",
              enum: ["mind", "body", "heart", "energy", "shadow", "service"],
            },
            truth_arc: {
              type: "number",
              description: "0..1 — how honestly they showed up over 11 days.",
            },
            best_insight: {
              type: "string",
              description: "Their single most striking line, lightly polished.",
            },
            full_analysis: {
              type: "object",
              description: "Free-form deeper notes — strengths, edges, prescription.",
              properties: {
                strengths: { type: "array", items: { type: "string" } },
                edges: { type: "array", items: { type: "string" } },
                first_30_day_focus: { type: "string" },
                long_horizon_invitation: { type: "string" },
              },
              required: [
                "strengths",
                "edges",
                "first_30_day_focus",
                "long_horizon_invitation",
              ],
              additionalProperties: false,
            },
          },
          required: [
            "archetype",
            "archetype_reason",
            "one_sentence",
            "home_skills",
            "dominant_guna",
            "guna_ratio",
            "active_loops",
            "shadow_map",
            "bypass_risk",
            "recommended_lineage",
            "recommended_gurus",
            "pace_profile",
            "companion_tone",
            "priority_domain",
            "truth_arc",
            "full_analysis",
          ],
          additionalProperties: false,
        },
      },
    };

    const __billing = await getBillingFromReq(req, "graduation-deep-analysis");

    const aiRes = await aiGatewayFetchWithLang(req, {
      model: "tier:pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: {
        type: "function",
        function: { name: "produce_graduation_report" },
      },
    }, {}, __billing ?? undefined);

    if (aiRes.status === 429) {
      return json({ error: "Rate limit. Try again in a moment." }, 429);
    }
    if (aiRes.status === 402) {
      return json(
        { error: "AI credits exhausted. Add funds in ConsciousOS Cloud." },
        402,
      );
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const aiJson = await aiRes.json();
    const toolCall =
      aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolCall) {
      console.error("No tool call returned", JSON.stringify(aiJson).slice(0, 1000));
      return json({ error: "AI did not return structured output" }, 500);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = typeof toolCall === "string" ? JSON.parse(toolCall) : toolCall;
    } catch (e) {
      console.error("Tool args parse fail", e);
      return json({ error: "AI returned malformed JSON" }, 500);
    }

    // 5) Persist
    const row = {
      user_id: userId,
      archetype: String(parsed.archetype ?? "The Honest Beginner"),
      archetype_subtype: parsed.archetype_subtype as string | null ?? null,
      archetype_reason: String(parsed.archetype_reason ?? ""),
      one_sentence: String(parsed.one_sentence ?? ""),
      pull_skill: parsed.pull_skill as string | null ?? null,
      avoid_skill: parsed.avoid_skill as string | null ?? null,
      home_skills: (parsed.home_skills as string[] | null) ?? [],
      dominant_guna: parsed.dominant_guna as string | null ?? null,
      guna_ratio: parsed.guna_ratio ?? {},
      dosha_pattern: parsed.dosha_pattern as string | null ?? null,
      active_loops: parsed.active_loops ?? [],
      dissolved_loops: parsed.dissolved_loops ?? [],
      shadow_map: parsed.shadow_map ?? {},
      bypass_risk: parsed.bypass_risk as string | null ?? null,
      recommended_lineage: parsed.recommended_lineage as string | null ?? null,
      recommended_gurus: (parsed.recommended_gurus as string[] | null) ?? [],
      pace_profile: (parsed.pace_profile as string | null) ?? "steady",
      companion_tone: (parsed.companion_tone as string | null) ?? "gentle",
      priority_domain: parsed.priority_domain as string | null ?? null,
      avg_mood: avg(moodVals),
      avg_energy: avg(energyVals),
      avg_clarity: avg(clarityVals),
      truth_arc: typeof parsed.truth_arc === "number" ? parsed.truth_arc : 0.5,
      best_insight: (parsed.best_insight as string) ?? longestInsight,
      full_analysis: parsed.full_analysis ?? {},
      source_counts: {
        mirrors: mirrors.length,
        sessions: sessions.length,
        journals: journals.length,
        loops: loops.length,
        memory: memory.length,
        assessments: assessments.length,
      },
      model_used: "llama-3.3-70b-versatile",
      generated_at: new Date().toISOString(),
    };

    const { data: saved, error: saveErr } = await supabase
      .from("graduation_reports")
      .upsert(row, { onConflict: "user_id" })
      .select()
      .single();

    if (saveErr) {
      console.error("Save error", saveErr);
      return json({ error: "Failed to save report", detail: saveErr.message }, 500);
    }

    return json({ report: saved, cached: false });
  } catch (e) {
    console.error("graduation-deep-analysis fatal", e);
    return json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
