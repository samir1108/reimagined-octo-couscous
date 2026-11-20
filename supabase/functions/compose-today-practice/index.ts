// COMPOSE-TODAY-PRACTICE
// Builds today's practice mix using 30/50/20 formula + theme/arc awareness.
// Caches result in today_practice_packs (one per user per day).
import { createClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

const CORE = ["observation", "self_inquiry", "breath", "witnessing", "body"];
const PATHS = ["bhakti", "karma", "jnana", "raja"];

const PRACTICE_META: Record<string, { label: string; emoji: string; defaultDuration: number }> = {
  observation:  { label: "Observation",      emoji: "👁️", defaultDuration: 10 },
  self_inquiry: { label: "Self-Inquiry",     emoji: "🔍", defaultDuration: 12 },
  breath:       { label: "Breath",           emoji: "🌬️", defaultDuration: 8 },
  witnessing:   { label: "Witnessing",       emoji: "🪷", defaultDuration: 12 },
  body:         { label: "Body Awareness",   emoji: "🧘", defaultDuration: 10 },
  bhakti:       { label: "Bhakti",           emoji: "💛", defaultDuration: 15 },
  karma:        { label: "Karma Yoga",       emoji: "🤲", defaultDuration: 20 },
  jnana:        { label: "Jnana",            emoji: "📖", defaultDuration: 15 },
  raja:         { label: "Raja Yoga",        emoji: "👑", defaultDuration: 20 },
  kriya:        { label: "Kriya",            emoji: "⚡", defaultDuration: 15 },
  tantra:       { label: "Tantra",           emoji: "🔮", defaultDuration: 20 },
  neuroscience: { label: "Neuroscience",     emoji: "🧠", defaultDuration: 10 },
};

function levelTitle(practice: string, level: number, themeBias?: string) {
  const meta = PRACTICE_META[practice];
  const base = meta?.label ?? practice;
  const lvl = `L${Math.max(0, Math.min(5, level))}`;
  if (themeBias) return `${base} · ${lvl} — through the lens of ${themeBias}`;
  return `${base} · ${lvl}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    ).auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const force = body.force === true;
    const inferRequested = body.infer === true;
    let arrival = (body.arrival || null) as null | {
      body_state?: "tight" | "neutral" | "open" | "heavy";
      mind_state?: "racing" | "foggy" | "calm" | "scattered";
      intention?: "ground" | "clarity" | "release" | "energy" | "ai_decide";
      inferred?: boolean;
    };
    const today = new Date().toISOString().split("T")[0];

    // Cache hit? (skip cache when arrival state is provided so we re-balance live)
    if (!force && !arrival) {
      const { data: existing } = await supabase
        .from("today_practice_packs")
        .select("*")
        .eq("user_id", user.id)
        .eq("pack_date", today)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ pack: existing, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch all context in parallel
    const [
      levelsRes, dnaRes, profileRes, loopsRes, themeRes, arcRes, anchorRes,
      effectivenessRes, teachingsRes,
    ] = await Promise.all([
      supabase.from("user_practice_levels").select("*").eq("user_id", user.id),
      supabase.from("user_spiritual_dna").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_consciousness_profile").select("overall_band, dimension_bands, bypassing_risk").eq("user_id", user.id).maybeSingle(),
      supabase.from("active_loops").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("daily_themes").select("*").eq("theme_date", today).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("theme_arcs").select("*").eq("user_id", user.id).eq("status", "active").maybeSingle(),
      supabase.from("band_practice_anchors").select("*").eq("user_id", user.id).eq("is_active", true).maybeSingle(),
      // Per-user effectiveness map — what's actually worked for THIS user
      supabase.from("practice_effectiveness").select("practice, loop_tag, effectiveness_score, sessions_count").eq("user_id", user.id),
      // Curated teaching bank (global library)
      supabase.from("practice_teachings").select("*"),
    ]);

    const levels: Record<string, number> = {};
    for (const row of (levelsRes.data || [])) {
      const r = row as any;
      if (r.practice_type) levels[r.practice_type] = r.current_level || 0;
    }
    for (const p of [...CORE, ...PATHS]) levels[p] = levels[p] ?? 0;

    const dna: any = dnaRes.data || {};
    const profile: any = profileRes.data || {};
    const band = Math.round(profile.overall_band ?? 1);
    const loops = (loopsRes.data || []) as any[];
    const theme: any = themeRes.data || null;
    const arc: any = arcRes.data || null;
    const anchor: any = anchorRes.data || null;
    const effectiveness = (effectivenessRes.data || []) as Array<{
      practice: string; loop_tag: string | null; effectiveness_score: number; sessions_count: number;
    }>;
    const teachings = (teachingsRes.data || []) as Array<{
      practice: string; level: number; loop_tag: string | null;
      day_min: number; day_max: number;
      teaching: string; practice_instruction: string; off_app_cue: string | null;
      duration_minutes: number; archetype_bias: string | null; weight: number;
    }>;

    // Journey day approximation (used to pick age-appropriate teachings)
    const journeyDay = Math.max(1, Math.round((profile as any).journey_day ?? band * 7 + 1));

    // ── INFERRED ARRIVAL — when user skipped, derive from recent context.
    // Heuristics: time-of-day + last 3 sessions' chitta_vritti + active loops.
    if (!arrival || inferRequested) {
      try {
        const hour = new Date().getHours();
        const { data: recentSignals } = await supabase
          .from("consciousness_signals")
          .select("chitta_vritti, heart_signals, gut_signals, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        // Default by time-of-day
        let bodyGuess: "tight" | "neutral" | "open" | "heavy" = "neutral";
        let mindGuess: "racing" | "foggy" | "calm" | "scattered" = "calm";
        let intentGuess: "ground" | "clarity" | "release" | "energy" | "ai_decide" = "ai_decide";
        if (hour < 6) { bodyGuess = "heavy"; mindGuess = "foggy"; intentGuess = "ground"; }
        else if (hour < 11) { bodyGuess = "neutral"; mindGuess = "calm"; intentGuess = "clarity"; }
        else if (hour < 16) { bodyGuess = "neutral"; mindGuess = "scattered"; intentGuess = "energy"; }
        else if (hour < 20) { bodyGuess = "tight"; mindGuess = "racing"; intentGuess = "release"; }
        else { bodyGuess = "heavy"; mindGuess = "foggy"; intentGuess = "ground"; }

        // Override from recent chitta_vritti if present
        const lastVritti = (recentSignals?.[0]?.chitta_vritti || "").toLowerCase();
        if (lastVritti.includes("anxious") || lastVritti.includes("racing")) mindGuess = "racing";
        else if (lastVritti.includes("foggy") || lastVritti.includes("dull")) mindGuess = "foggy";
        else if (lastVritti.includes("calm") || lastVritti.includes("clear")) mindGuess = "calm";
        else if (lastVritti.includes("scattered")) mindGuess = "scattered";

        // Active loop signal → bias intention
        const loopId = (loops[0]?.loop_id || "").toLowerCase();
        if (loopId.includes("anxiety") || loopId.includes("anger")) intentGuess = "release";
        else if (loopId.includes("purpose") || loopId.includes("identity")) intentGuess = "clarity";
        else if (loopId.includes("fatigue") || loopId.includes("burnout")) intentGuess = "ground";

        arrival = {
          body_state: bodyGuess,
          mind_state: mindGuess,
          intention: intentGuess,
          inferred: true,
        };
      } catch {
        // If inference fails, leave arrival null and use baseline mix.
      }
    }

    // ── Effectiveness lookup helper
    const effFor = (practice: string, loopTag?: string | null): number => {
      const exact = effectiveness.find((e) => e.practice === practice && e.loop_tag === loopTag);
      const generic = effectiveness.find((e) => e.practice === practice && !e.loop_tag);
      return Math.max(exact?.effectiveness_score ?? 0, generic?.effectiveness_score ?? 0);
    };

    // ── 30%: FIXED CORE — band anchor practice OR weakest core
    const fixedPractice = anchor?.practice_type
      ?? CORE.reduce((min, p) => (levels[p] < levels[min] ? p : min), CORE[0]);

    // ── 50%: AI PERSONALIZED — score-based with effectiveness boost
    const themeBias = theme?.title || arc?.metadata?.focus || null;
    const themeFocusAreas: string[] = Array.isArray(theme?.focus_areas)
      ? theme.focus_areas
      : (theme?.focus_areas ? Object.values(theme.focus_areas) : []);

    const candidateScores = new Map<string, number>();
    const bump = (p: string, v: number) => candidateScores.set(p, (candidateScores.get(p) ?? 0) + v);

    for (const fa of themeFocusAreas.map((s: any) => String(s).toLowerCase())) {
      if (fa.includes("witness") || fa.includes("aware")) bump("witnessing", 3);
      if (fa.includes("breath") || fa.includes("calm")) bump("breath", 3);
      if (fa.includes("inquiry") || fa.includes("self")) bump("self_inquiry", 3);
      if (fa.includes("body") || fa.includes("ground")) bump("body", 3);
      if (fa.includes("devotion") || fa.includes("heart") || fa.includes("love")) bump("bhakti", 3);
      if (fa.includes("action") || fa.includes("service") || fa.includes("work")) bump("karma", 3);
      if (fa.includes("knowledge") || fa.includes("understanding")) bump("jnana", 3);
      if (fa.includes("discipline") || fa.includes("focus")) bump("raja", 3);
    }
    const loopMap: Record<string, string[]> = {
      anxiety: ["breath", "body", "witnessing"],
      anger: ["body", "observation", "karma"],
      grief: ["bhakti", "body", "breath"],
      digital: ["observation", "witnessing"],
      purpose: ["karma", "self_inquiry", "jnana"],
    };
    const primaryLoopTag = loops[0] ? String(loops[0].loop_id || "").toLowerCase().split(/[_-]/)[0] : null;
    for (const l of loops) {
      const id = String(l.loop_id || "").toLowerCase();
      for (const [k, ps] of Object.entries(loopMap)) {
        if (id.includes(k)) {
          ps.forEach((p) => {
            bump(p, 3);
            // EFFECTIVENESS BOOST: if THIS user has had success with p+k, prioritise it
            const eff = effFor(p, k);
            if (eff > 0) bump(p, Math.round(eff * 6)); // up to +6
          });
        }
      }
    }
    if (dna.growth_path) bump(dna.growth_path, 4);
    if (dna.anchor_path) bump(dna.anchor_path, 5);
    if (arc?.metadata?.primary_practice) bump(arc.metadata.primary_practice, 4);
    // generic effectiveness pull
    for (const e of effectiveness) {
      if (e.sessions_count >= 3) bump(e.practice, Math.round(e.effectiveness_score * 3));
    }

    // ── ARRIVAL STATE OVERRIDES — State-Skill Matrix
    // Real-time mood/body/intention input re-balances the 30/50/20 mix.
    const stateNotes: string[] = [];
    let stabilizationMode = false;

    if (arrival) {
      const { body_state, mind_state, intention } = arrival;

      // Body signals
      if (body_state === "tight") {
        bump("breath", 6); bump("body", 5); bump("witnessing", 3);
        bump("jnana", -4); bump("self_inquiry", -3);
        stateNotes.push("body holding tension");
      }
      if (body_state === "heavy") {
        bump("body", 6); bump("breath", 4); bump("bhakti", 3);
        bump("karma", -3); bump("jnana", -3);
        stateNotes.push("body feels heavy");
      }
      if (body_state === "open") {
        bump("self_inquiry", 4); bump("witnessing", 4); bump("jnana", 3);
        stateNotes.push("body is open");
      }

      // Mind signals
      if (mind_state === "racing") {
        bump("breath", 6); bump("body", 5); bump("witnessing", 4);
        bump("self_inquiry", -5); bump("jnana", -4);
        stabilizationMode = true;
        stateNotes.push("mind racing");
      }
      if (mind_state === "foggy") {
        bump("breath", 4); bump("body", 5); bump("bhakti", 4);
        bump("self_inquiry", -3); bump("jnana", -4);
        stateNotes.push("mind foggy");
      }
      if (mind_state === "scattered") {
        bump("witnessing", 5); bump("breath", 4); bump("raja", 3);
        bump("karma", -2);
        stateNotes.push("mind scattered");
      }
      if (mind_state === "calm") {
        bump("self_inquiry", 4); bump("witnessing", 4); bump("jnana", 3);
        stateNotes.push("mind clear");
      }

      // Intention overrides (deepest signal — user's stated need)
      if (intention === "ground") {
        bump("body", 8); bump("breath", 6); bump("witnessing", 4);
      }
      if (intention === "clarity") {
        bump("self_inquiry", 8); bump("witnessing", 6); bump("jnana", 5);
      }
      if (intention === "release") {
        bump("body", 7); bump("breath", 6); bump("bhakti", 5); bump("karma", 4);
      }
      if (intention === "energy") {
        bump("breath", 7); bump("body", 5); bump("kriya", 4); bump("raja", 3);
      }
    }

    // If user is dysregulated, swap fixed anchor to a stabilizing practice
    let stabilizedFixed = fixedPractice;
    if (stabilizationMode || arrival?.body_state === "tight" || arrival?.body_state === "heavy") {
      const stabilizers = ["breath", "body", "witnessing"];
      stabilizedFixed = stabilizers.reduce(
        (best, p) => ((candidateScores.get(p) ?? 0) > (candidateScores.get(best) ?? -1) ? p : best),
        "breath",
      );
    }

    candidateScores.delete(stabilizedFixed);
    const aiPicks = [...candidateScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([p]) => p)
      .slice(0, 2);
    while (aiPicks.length < 2) {
      const fillers = ["witnessing", "breath", "self_inquiry"].filter(
        (p) => p !== stabilizedFixed && !aiPicks.includes(p),
      );
      if (!fillers.length) break;
      aiPicks.push(fillers[0]);
    }

    // ── Curated teaching attach helper
    const pickTeaching = (practice: string, level: number, preferLoop?: string | null) => {
      const candidates = teachings.filter((t) =>
        t.practice === practice
        && Math.abs(t.level - level) <= 1
        && journeyDay >= t.day_min && journeyDay <= t.day_max,
      );
      if (!candidates.length) return null;
      const scored = candidates.map((t) => {
        let s = t.weight;
        if (preferLoop && t.loop_tag === preferLoop) s += 5;
        if (!t.loop_tag) s += 1;
        if (dna.anchor_path && t.archetype_bias === dna.anchor_path) s += 2;
        if (Math.abs(t.level - level) === 0) s += 2;
        return { t, s };
      });
      scored.sort((a, b) => b.s - a.s);
      return scored[0].t;
    };

    const fixedTeaching = pickTeaching(stabilizedFixed, levels[stabilizedFixed] ?? 0, primaryLoopTag);

    // ── 20% USER CHOICE: map intention → concrete practice (no more empty placeholder)
    const intentionPracticeMap: Record<string, string> = {
      ground: "body",
      clarity: "self_inquiry",
      release: "bhakti",
      energy: "breath",
      ai_decide: "witnessing",
    };
    const intentionLabel: Record<string, string> = {
      ground: "Grounding",
      clarity: "Clarity",
      release: "Release",
      energy: "Energy",
      ai_decide: "Open Sit",
    };
    const userChoicePractice = arrival?.intention
      ? (intentionPracticeMap[arrival.intention] || "witnessing")
      : null;
    const userChoiceTeaching = userChoicePractice
      ? pickTeaching(userChoicePractice, levels[userChoicePractice] ?? 0, primaryLoopTag)
      : null;

    const composed = [
      {
        practice: stabilizedFixed,
        level: levels[stabilizedFixed] ?? 0,
        allocation: "fixed",
        title: levelTitle(stabilizedFixed, levels[stabilizedFixed] ?? 0),
        why: stabilizationMode
          ? `Stabilizing first — your nervous system needs ground before depth`
          : (anchor && anchor.practice_type === stabilizedFixed
            ? `Your band-${band} foundation practice (week ${anchor.current_week})`
            : `Your weakest core — strengthens the foundation`),
        duration: fixedTeaching?.duration_minutes ?? anchor?.duration_minutes ?? PRACTICE_META[stabilizedFixed]?.defaultDuration ?? 10,
        emoji: PRACTICE_META[stabilizedFixed]?.emoji ?? "🧘",
        teaching: fixedTeaching?.teaching ?? null,
        instruction: fixedTeaching?.practice_instruction ?? null,
        off_app_cue: fixedTeaching?.off_app_cue ?? null,
        loop_tag: primaryLoopTag,
      },
      ...aiPicks.map((p) => {
        const t = pickTeaching(p, levels[p] ?? 0, primaryLoopTag);
        const eff = effFor(p, primaryLoopTag);
        const stateReason = stateNotes.length
          ? `Tuned to how you arrived — ${stateNotes.slice(0, 2).join(" + ")}`
          : null;
        return {
          practice: p,
          level: levels[p] ?? 0,
          allocation: "ai_personalized",
          title: levelTitle(p, levels[p] ?? 0, themeBias),
          why: stateReason
            ?? (eff > 0.5
              ? `This has been working for you — picking it again`
              : (themeBias ? `Tuned to today's theme: "${themeBias}"` : (loops.length ? `Supports your active pattern work` : `Aligned with your ${dna.growth_path || "path"}`))),
          duration: t?.duration_minutes ?? PRACTICE_META[p]?.defaultDuration ?? 10,
          emoji: PRACTICE_META[p]?.emoji ?? "🧘",
          teaching: t?.teaching ?? null,
          instruction: t?.practice_instruction ?? null,
          off_app_cue: t?.off_app_cue ?? null,
          loop_tag: primaryLoopTag,
          effectiveness: eff,
        };
      }),
      ...(userChoicePractice ? [{
        practice: userChoicePractice,
        level: levels[userChoicePractice] ?? 0,
        allocation: "user_choice",
        title: `${intentionLabel[arrival!.intention!]} · ${PRACTICE_META[userChoicePractice]?.label ?? userChoicePractice}`,
        why: `Your chosen intention today: ${intentionLabel[arrival!.intention!].toLowerCase()}`,
        duration: userChoiceTeaching?.duration_minutes ?? PRACTICE_META[userChoicePractice]?.defaultDuration ?? 10,
        emoji: PRACTICE_META[userChoicePractice]?.emoji ?? "✨",
        teaching: userChoiceTeaching?.teaching ?? null,
        instruction: userChoiceTeaching?.practice_instruction ?? null,
        off_app_cue: userChoiceTeaching?.off_app_cue ?? null,
        loop_tag: primaryLoopTag,
      }] : []),
    ];

    // bypassing check
    const coreMin = Math.min(...CORE.map((p) => levels[p] ?? 0));
    const pathMax = Math.max(...PATHS.map((p) => levels[p] ?? 0));
    const bypassingCheck = {
      isBypassing: pathMax > coreMin + 2,
      warnings: pathMax > coreMin + 2
        ? ["Foundation gap — your paths are running ahead of your core practices"]
        : [],
    };

    const arrivalLabel = arrival?.inferred ? "what we sensed about you" : "how you arrived";
    const rationale = arrival
      ? `Tuned to ${arrivalLabel}${stateNotes.length ? ` (${stateNotes.join(", ")})` : ""}. ${stabilizationMode ? "Starting with stabilization." : "Practices match your state and intention."}`
      : (arc
        ? `Day ${arc.current_day} of ${arc.duration_days} in your "${arc.title || "active"}" arc. Practices align with this chapter.`
        : theme
          ? `Today's theme "${theme.title}" shapes your AI picks while your core practice anchors you.`
          : `30/50/20 mix: 1 core anchor, 2 AI-tuned picks, 1 free choice.`);

    // upsert pack
    const { data: pack, error: upsertErr } = await supabase
      .from("today_practice_packs")
      .upsert({
        user_id: user.id,
        pack_date: today,
        theme_id: theme?.id ?? null,
        arc_id: arc?.id ?? null,
        practices: composed,
        formula: "30/50/20",
        band_level: band,
        arc_phase: arc?.metadata?.phase_label ?? null,
        bypassing_check: bypassingCheck,
        cross_pollination: null,
        rationale,
      }, { onConflict: "user_id,pack_date" })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ pack, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
