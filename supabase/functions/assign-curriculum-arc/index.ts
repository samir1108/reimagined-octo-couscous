// Master Curriculum Director
// Picks the right arc_template for a user based on DNA + lifetime phase + life stage
// + recent arc history, instantiates a theme_arcs row, and logs reasoning.
//
// Triggered:
//  (a) lazily by generate-theme when no active arc exists
//  (b) explicitly after onboarding completion
//  (c) when an arc nears completion (current_day >= duration_days - 1)
//  (d) by cron sweep for stalled users

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ArcTemplate {
  id: string;
  slug: string;
  title: string;
  primary_path: string;
  primary_practice: string;
  primary_chakra: string;
  assigned_guru: string;
  voice_style: string;
  duration_days: number;
  recommended_band_min: number;
  recommended_band_max: number;
  triggers_for_loops: string[] | null;
  triggers_for_life_events: string[] | null;
  difficulty: string | null;
}

// Lifetime phase → preferred difficulty / depth bias
const PHASE_DIFFICULTY_BIAS: Record<string, string[]> = {
  awakening:   ["beginner", "foundation"],
  exploration: ["beginner", "foundation", "intermediate"],
  deepening:   ["foundation", "intermediate"],
  integration: ["intermediate", "advanced"],
  mastery:     ["advanced", "intermediate"],
  teaching:    ["advanced"],
  dissolution: ["advanced"],
  freedom:     ["advanced"],
  compassion:  ["advanced"],
  beyond:      ["advanced"],
};

function getLifetimePhase(day: number): string {
  if (day <= 30) return "awakening";
  if (day <= 120) return "exploration";
  if (day <= 365) return "deepening";
  if (day <= 730) return "integration";
  if (day <= 1460) return "mastery";
  if (day <= 2920) return "teaching";
  if (day <= 4380) return "dissolution";
  if (day <= 5840) return "freedom";
  if (day <= 8000) return "compassion";
  return "beyond";
}

function scoreTemplate(
  tpl: ArcTemplate,
  ctx: {
    band: number;
    anchor_path: string | null;
    lifetime_phase: string;
    life_stage: string | null;
    journey_day: number;
    recent_template_ids: Set<string>;
    recent_paths: string[];
    active_loops: string[];
  },
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // 1. Band fit (most important): 40 pts if inside, decay outside
  const min = Number(tpl.recommended_band_min ?? 0);
  const max = Number(tpl.recommended_band_max ?? 10);
  if (ctx.band >= min && ctx.band <= max) {
    score += 40;
    reasons.push(`band ${ctx.band} fits [${min}-${max}]`);
  } else {
    const dist = ctx.band < min ? min - ctx.band : ctx.band - max;
    score += Math.max(0, 40 - dist * 15);
  }

  // 2. Anchor path match: 25 pts
  if (ctx.anchor_path && tpl.primary_path === ctx.anchor_path) {
    score += 25;
    reasons.push(`anchor path ${ctx.anchor_path} matches`);
  } else if (ctx.anchor_path && tpl.primary_path) {
    score += 5; // some cross-pollination value
  }

  // 3. Lifetime phase difficulty bias: 15 pts
  const allowedDiff = PHASE_DIFFICULTY_BIAS[ctx.lifetime_phase] ?? [];
  if (tpl.difficulty && allowedDiff.includes(tpl.difficulty)) {
    score += 15;
    reasons.push(`difficulty ${tpl.difficulty} fits ${ctx.lifetime_phase}`);
  } else if (!tpl.difficulty) {
    score += 8;
  }

  // 4. Loop trigger match: 10 pts per matching loop (cap 20)
  if (tpl.triggers_for_loops && ctx.active_loops.length) {
    const hits = tpl.triggers_for_loops.filter((l) =>
      ctx.active_loops.includes(l)
    ).length;
    if (hits > 0) {
      const add = Math.min(20, hits * 10);
      score += add;
      reasons.push(`triggers ${hits} active loop(s)`);
    }
  }

  // 5. Novelty: penalize recently-used template heavily, light bonus for fresh path
  if (ctx.recent_template_ids.has(tpl.id)) {
    score -= 30;
    reasons.push("recently completed — penalty");
  }
  if (
    ctx.recent_paths.length >= 2 &&
    !ctx.recent_paths.includes(tpl.primary_path)
  ) {
    score += 8;
    reasons.push("fresh path adds variety");
  }

  // 6. Day-1 user boost for short, gentle starter arcs
  if (ctx.journey_day <= 7 && tpl.duration_days <= 7) {
    score += 10;
    reasons.push("Day-1 friendly short arc");
  }

  return { score, reasons };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    let userId: string | null = body?.user_id ?? null;
    const force: boolean = !!body?.force;

    // If no user_id passed, derive from auth header
    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await admin.auth.getUser(token);
        userId = user?.id ?? null;
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "user_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Check existing active arc
    const { data: activeArc } = await admin
      .from("theme_arcs")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeArc && !force) {
      const nearEnd =
        activeArc.current_day >= (activeArc.duration_days ?? 21) - 1;
      if (!nearEnd) {
        return new Response(
          JSON.stringify({
            arc: activeArc,
            action: "kept_existing",
            reason: `arc active, day ${activeArc.current_day}/${activeArc.duration_days}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 2. Gather context
    const [dnaRes, profileRes, recentArcsRes, loopsRes, consciousnessRes] =
      await Promise.all([
        admin.from("user_spiritual_dna").select("*").eq("user_id", userId).maybeSingle(),
        admin.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        admin.from("theme_arcs").select("template_id,primary_path,started_at")
          .eq("user_id", userId).order("started_at", { ascending: false }).limit(5),
        admin.from("user_loops").select("loop_id").eq("user_id", userId).limit(20),
        admin.from("user_consciousness_profile").select("overall_band,journey_day")
          .eq("user_id", userId).maybeSingle(),
      ]);

    const dna = dnaRes.data;
    const profile = profileRes.data;
    const recentArcs = recentArcsRes.data ?? [];
    const activeLoops = (loopsRes.data ?? []).map((l: any) => l.loop_id);
    const cp = consciousnessRes.data;

    const journeyDay = cp?.journey_day ?? dna?.app_relationship_day ?? 1;
    const band = Number(cp?.overall_band ?? dna?.identity_band ?? 3);
    const lifetimePhase = getLifetimePhase(journeyDay);

    const ctx = {
      band,
      anchor_path: dna?.anchor_path ?? null,
      lifetime_phase: lifetimePhase,
      life_stage: dna?.life_stage ?? null,
      journey_day: journeyDay,
      recent_template_ids: new Set(
        recentArcs.map((a: any) => a.template_id).filter(Boolean),
      ),
      recent_paths: recentArcs.map((a: any) => a.primary_path).filter(Boolean),
      active_loops: activeLoops,
    };

    // 3. Score templates
    const { data: templates } = await admin
      .from("arc_templates")
      .select("*")
      .eq("is_active", true);

    if (!templates || templates.length === 0) {
      return new Response(
        JSON.stringify({ error: "no arc templates available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const scored = (templates as ArcTemplate[])
      .map((tpl) => ({ tpl, ...scoreTemplate(tpl, ctx) }))
      .sort((a, b) => b.score - a.score);

    const winner = scored[0];

    // 4. If we kept existing because near end, complete it before instantiating new
    if (activeArc && (force || activeArc.current_day >= (activeArc.duration_days ?? 21) - 1)) {
      await admin.from("theme_arcs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", activeArc.id);
    }

    // 5. Instantiate new arc
    const startedAt = new Date();
    const expectedEnd = new Date(startedAt);
    expectedEnd.setDate(expectedEnd.getDate() + winner.tpl.duration_days);

    const { data: newArc, error: insertErr } = await admin
      .from("theme_arcs")
      .insert({
        user_id: userId,
        template_id: winner.tpl.id,
        title: winner.tpl.title,
        intention: `${winner.tpl.primary_path} arc — ${winner.tpl.primary_practice}`,
        duration_days: winner.tpl.duration_days,
        current_day: 1,
        current_phase: "opening",
        status: "active",
        source: "orchestrator",
        voice_style: winner.tpl.voice_style,
        primary_path: winner.tpl.primary_path,
        primary_practice: winner.tpl.primary_practice,
        primary_chakra: winner.tpl.primary_chakra,
        assigned_guru: winner.tpl.assigned_guru,
        started_at: startedAt.toISOString(),
        expected_end_date: expectedEnd.toISOString().split("T")[0],
        metadata: {
          director_score: winner.score,
          director_reasons: winner.reasons,
          runner_up: scored[1] ? { slug: scored[1].tpl.slug, score: scored[1].score } : null,
          context_snapshot: {
            band,
            lifetime_phase: lifetimePhase,
            anchor_path: ctx.anchor_path,
            life_stage: ctx.life_stage,
            journey_day: journeyDay,
          },
        },
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 6. Log engine signal
    await admin.from("engine_signals").insert({
      user_id: userId,
      signal_type: "curriculum_arc_assigned",
      source: "assign-curriculum-arc",
      urgency: 0.6,
      context: {
        arc_id: newArc.id,
        template_slug: winner.tpl.slug,
        score: winner.score,
        reasons: winner.reasons,
        band,
        lifetime_phase: lifetimePhase,
      },
    });

    return new Response(
      JSON.stringify({
        arc: newArc,
        action: activeArc ? "rotated" : "assigned",
        score: winner.score,
        reasons: winner.reasons,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("assign-curriculum-arc error:", err?.message || err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
