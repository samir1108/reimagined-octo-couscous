import { createClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { embedText } from "../_shared/embedding.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || url.searchParams.get("route") || "";
    const authHeader = req.headers.get("Authorization");

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action. Use ?action=bypassing|contradictions|cross-pollination|silence" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "bypassing":
        return await handleBypassing(req, authHeader);
      case "contradictions":
        return await handleContradictions(req, authHeader);
      case "cross-pollination":
        return await handleCrossPollination(req, authHeader);
      case "silence":
        return await handleSilence(req, authHeader);
      case "anomalies":
        return await handleAnomalies(req, authHeader);
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getSupabaseClients(authHeader: string | null) {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = authHeader
    ? createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      })
    : sb;
  return { sb, userClient };
}

async function requireUser(userClient: ReturnType<typeof createClient>) {
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

async function handleBypassing(req: Request, authHeader: string | null) {
  const { sb, userClient } = await getSupabaseClients(authHeader);
  const user = await requireUser(userClient);

  const [levelsRes, profileRes, specialtyRes] = await Promise.all([
    sb.from("user_practice_levels").select("*").eq("user_id", user.id),
    sb.from("user_consciousness_profile").select("*").eq("user_id", user.id).maybeSingle(),
    sb.from("specialty_activations").select("*").eq("user_id", user.id),
  ]);

  const levels: Record<string, number> = {};
  for (const row of levelsRes.data ?? []) {
    if (row.practice_type) levels[row.practice_type] = row.current_level || 0;
  }

  const defaults: Record<string, number> = {
    observation: 0, self_inquiry: 0, breath: 0, witnessing: 0, body: 0,
    bhakti: 0, karma: 0, jnana: 0, raja: 0, kriya: 0, tantra: 0, neuroscience: 0,
    emotional_healing: 0, loop_dissolution: 0,
  };
  Object.assign(defaults, levels);

  const profile = profileRes.data || {};
  const dimBands = (profile.dimension_bands as Record<string, number>) || {};
  const band = profile.overall_band || 0;
  const specialties = specialtyRes.data || [];

  const warnings: any[] = [];
  const recommendations: string[] = [];

  const coreMin = Math.min(
    defaults.observation, defaults.self_inquiry,
    defaults.breath, defaults.witnessing, defaults.body
  );
  const pathMax = Math.max(
    defaults.bhakti, defaults.karma,
    defaults.jnana, defaults.raja
  );
  if (pathMax > coreMin + 2) {
    warnings.push({
      rule: "foundation_first",
      severity: "high",
      message: "Core foundations need strengthening before advancing paths",
      details: { coreMin, pathMax, gap: pathMax - coreMin },
    });
    recommendations.push("Focus on weakest core practice for next 3 sessions");
  }

  const thought = dimBands.thought || 0;
  const emotion = dimBands.emotion || 0;
  if (thought > emotion + 2) {
    warnings.push({
      rule: "heart_over_head",
      severity: "medium",
      message: "Intellectualizing without emotional integration",
      details: { thought, emotion, gap: thought - emotion },
    });
    recommendations.push("Add bhakti or body practice to balance head-heart");
  }

  const bodyDim = dimBands.body || 0;
  const kriyaActive = specialties.find((s: any) => s.practice_type === "kriya" && s.is_active);
  if (kriyaActive && (bodyDim < 2 || emotion < 2)) {
    warnings.push({
      rule: "integration_lock",
      severity: "high",
      message: "Kriya practice requires Body & Emotion Band ≥ 2",
      details: { body: bodyDim, emotion, kriyaActive: true },
    });
    recommendations.push("Deactivate kriya until body and emotional grounding improve");
  }

  const avgSkill = (defaults.observation + defaults.self_inquiry + defaults.witnessing) / 3;
  if (avgSkill > band + 2) {
    warnings.push({
      rule: "state_skill_gap",
      severity: "medium",
      message: "Practice skill exceeds lived consciousness level",
      details: { avgSkill: Number(avgSkill.toFixed(1)), band, gap: Number((avgSkill - band).toFixed(1)) },
    });
    recommendations.push("Grounding practice: body scan, walking meditation, or karma yoga");
  }

  const bypassingRisk = Math.min(1, warnings.filter(w => w.severity === "high").length * 0.4 +
    warnings.filter(w => w.severity === "medium").length * 0.2);

  return new Response(JSON.stringify({
    isBypassing: warnings.length > 0,
    bypassingRisk: Number(bypassingRisk.toFixed(2)),
    warnings,
    recommendations,
    goldenRules: {
      foundationFirst: coreMin >= 2 || pathMax <= coreMin + 2,
      heartOverHead: thought <= emotion + 2,
      integrationLock: !kriyaActive || (bodyDim >= 2 && emotion >= 2),
    },
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleCrossPollination(req: Request, authHeader: string | null) {
  const { sb, userClient } = await getSupabaseClients(authHeader);
  const user = await requireUser(userClient);

  const body = await req.json().catch(() => ({}));
  const checkPractice = body.practice;

  const { data: sessionRows } = await sb
    .from("sessions")
    .select("type_payload,created_at")
    .eq("user_id", user.id)
    .eq("type", "practice")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: crossHistory } = await sb
    .from("cross_pollination_log")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const allSessions = (sessionRows || []).map((r: any) => ({
    ...(r.type_payload || {}),
    created_at: r.created_at,
  }));
  const suggestions: any[] = [];

  const CROSS_MAP: Record<string, { target: string; reason: string }> = {
    observation:  { target: "bhakti",     reason: "Heart opening can deepen your watching" },
    self_inquiry: { target: "body",       reason: "Get out of the head — feel it in the body" },
    bhakti:       { target: "jnana",      reason: "Add clarity to your devotion" },
    karma:        { target: "witnessing", reason: "Watch yourself in action" },
    breath:       { target: "self_inquiry", reason: "Breath settled? Now ask: who breathes?" },
    witnessing:   { target: "karma",      reason: "Take your witness into daily life" },
    jnana:        { target: "bhakti",     reason: "Balance intellect with heart" },
    body:         { target: "breath",     reason: "Breath and body are one system" },
    raja:         { target: "observation", reason: "Return to pure seeing" },
  };

  const practiceGroups: Record<string, any[]> = {};
  for (const s of allSessions) {
    const p = s.practice_type;
    if (!p) continue;
    if (!practiceGroups[p]) practiceGroups[p] = [];
    practiceGroups[p].push(s);
  }

  const practicesToCheck = checkPractice ? [checkPractice] : Object.keys(practiceGroups);

  for (const practice of practicesToCheck) {
    const group = practiceGroups[practice] || [];
    if (group.length < 5) continue;

    const last5Quality = group.slice(0, 5).map((s: any) => s.quality_score || 0.5);
    const avg = last5Quality.reduce((a: number, b: number) => a + b, 0) / last5Quality.length;
    const isPlateauing = avg < 0.45 && group.length >= 5;
    const isStagnant = Math.max(...last5Quality) - Math.min(...last5Quality) < 0.1 && avg < 0.6;

    if (isPlateauing || isStagnant) {
      const mapping = CROSS_MAP[practice];
      if (!mapping) continue;

      const pastCross = (crossHistory || []).filter(
        (h: any) => h.source_practice === practice && h.target_practice === mapping.target
      );
      const pastEffectiveness = pastCross.length > 0
        ? pastCross.reduce((sum: number, h: any) => sum + (h.effectiveness_score || 0.5), 0) / pastCross.length
        : 0.5;

      suggestions.push({
        source: practice,
        target: mapping.target,
        reason: mapping.reason,
        plateauAvgQuality: Number(avg.toFixed(2)),
        sessionsInPlateau: group.length,
        userEffectivenessScore: Number(pastEffectiveness.toFixed(2)),
        type: isPlateauing ? "plateau" : "stagnant",
      });

      await sb.from("cross_pollination_log").insert({
        user_id: user.id,
        source_practice: practice,
        target_practice: mapping.target,
        reason: isPlateauing ? "plateau" : "stagnant",
        sessions_before_plateau: group.length,
      });
    }
  }

  return new Response(JSON.stringify({
    suggestions,
    hasPlateau: suggestions.length > 0,
    totalPracticesAnalyzed: practicesToCheck.length,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleSilence(req: Request, authHeader: string | null) {
  const { sb, userClient } = await getSupabaseClients(authHeader);
  const user = await requireUser(userClient);

  async function insertSignalIfNew(admin: ReturnType<typeof createClient>, userId: string, kind: string, key: string, context: any, urgency = 0.55) {
    const sevenAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { data: existing } = await admin
      .from("engine_signals")
      .select("id")
      .eq("user_id", userId)
      .eq("signal_type", "silence")
      .gte("created_at", sevenAgo)
      .contains("context", { key })
      .maybeSingle();
    if (existing?.id) return false;
    await admin.from("engine_signals").insert({
      user_id: userId,
      signal_type: "silence",
      urgency,
      source: "detect",
      domain: kind,
      context: { ...context, key },
    });
    return true;
  }

  let found = 0;

  const fourteenAgo = new Date(Date.now() - 14 * 86400_000).toISOString();
  const { data: sess } = await sb
    .from("sessions")
    .select("summary, status, created_at")
    .eq("user_id", user.id)
    .gte("created_at", fourteenAgo)
    .limit(200);

  const skips: Record<string, number> = {};
  const completes: Record<string, number> = {};
  for (const s of sess ?? []) {
    let plan: any = null;
    try { plan = typeof s.summary === "string" ? JSON.parse(s.summary) : s.summary; } catch { /* ignore */ }
    const skipped = plan?.skippedSteps ?? plan?.skipped_steps ?? [];
    const completed = plan?.completedSteps ?? plan?.completed_steps ?? [];
    for (const st of skipped) {
      const k = st?.kind || st?.step_kind;
      if (k) skips[k] = (skips[k] ?? 0) + 1;
    }
    for (const st of completed) {
      const k = st?.kind || st?.step_kind;
      if (k) completes[k] = (completes[k] ?? 0) + 1;
    }
  }
  for (const [k, n] of Object.entries(skips)) {
    if (n >= 3 && (completes[k] ?? 0) < 1) {
      const ok = await insertSignalIfNew(sb, user.id, "skipped-step", `skip:${k}`, {
        step_kind: k,
        skip_count: n,
        message: `You've moved past "${k}" ${n} times this week without sitting with it.`,
      });
      if (ok) found += 1;
    }
  }

  const fortyFiveAgo = new Date(Date.now() - 45 * 86400_000).toISOString();
  const fifteenAgo = new Date(Date.now() - 15 * 86400_000).toISOString();

  const { data: oldRows } = await sb
    .from("user_memory_vectors")
    .select("loop_ids, created_at")
    .eq("user_id", user.id)
    .gte("created_at", fortyFiveAgo)
    .lt("created_at", fifteenAgo)
    .limit(500);
  const oldLoops = new Set<string>();
  for (const r of oldRows ?? []) {
    for (const l of r.loop_ids ?? []) oldLoops.add(l);
  }

  const { data: newRows } = await sb
    .from("user_memory_vectors")
    .select("loop_ids")
    .eq("user_id", user.id)
    .gte("created_at", fourteenAgo)
    .limit(500);
  const recentLoops = new Set<string>();
  for (const r of newRows ?? []) {
    for (const l of r.loop_ids ?? []) recentLoops.add(l);
  }

  for (const l of oldLoops) {
    if (recentLoops.has(l)) continue;
    const ok = await insertSignalIfNew(sb, user.id, "loop-silent", `silent:${l}`, {
      loop_id: l,
      message: `The pattern "${l}" was alive in you a few weeks back. It went quiet — by resolution, or by looking away?`,
    });
    if (ok) found += 1;
  }

  const twentyOneAgo = new Date(Date.now() - 21 * 86400_000).toISOString();
  const { data: stale } = await sb
    .from("engine_signals")
    .select("domain")
    .eq("user_id", user.id)
    .is("consumed_at", null)
    .lt("created_at", twentyOneAgo)
    .not("domain", "is", null)
    .limit(50);
  const domainCounts: Record<string, number> = {};
  for (const r of stale ?? []) {
    if (r.domain) domainCounts[r.domain] = (domainCounts[r.domain] ?? 0) + 1;
  }
  for (const [d, n] of Object.entries(domainCounts)) {
    if (n < 2) continue;
    const ok = await insertSignalIfNew(sb, user.id, "stale-domain", `stale:${d}`, {
      domain: d,
      count: n,
      message: `${n} unresolved signals in "${d}" are sitting waiting.`,
    });
    if (ok) found += 1;
  }

  return new Response(JSON.stringify({ ok: true, found }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleContradictions(req: Request, authHeader: string | null) {
  const { sb, userClient } = await getSupabaseClients(authHeader);

  const cronHeader = req.headers.get("x-cron-secret");
  const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

  if (cronHeader && CRON_SECRET && cronHeader === CRON_SECRET) {
    const since = new Date(Date.now() - 48 * 3600_000).toISOString();
    const { data: active } = await sb
      .from("user_memory_vectors")
      .select("user_id")
      .gte("created_at", since)
      .limit(500);

    const seen = new Set<string>();
    let total = 0;
    for (const r of active ?? []) {
      if (seen.has(r.user_id)) continue;
      seen.add(r.user_id);
      const { found } = await processUserContradictions(sb, r.user_id).catch(() => ({ found: 0 }));
      total += found;
    }
    return new Response(JSON.stringify({ ok: true, users: seen.size, contradictions: total }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user = await requireUser(userClient);
  const { found } = await processUserContradictions(sb, user.id);
  return new Response(JSON.stringify({ ok: true, found }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function processUserContradictions(admin: ReturnType<typeof createClient>, userId: string): Promise<{ found: number }> {
  const since = new Date(Date.now() - 48 * 3600_000).toISOString();
  const { data: recent } = await admin
    .from("user_memory_vectors")
    .select("id, content, embedding, created_at")
    .eq("user_id", userId)
    .in("source_type", ["journal", "chat", "reflection"])
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!recent?.length) return { found: 0 };

  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";

  const embed = (text: string): Promise<number[] | null> => embedText(text);

  async function judgeContradiction(now: string, then: string): Promise<{ contradicts: boolean; reason: string }> {
    if (!GROQ_API_KEY) return { contradicts: false, reason: "" };
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" },
          temperature: 0,
          messages: [
            {
              role: "system",
              content: "You compare two statements by the same person. Return JSON: {\"contradicts\": boolean, \"reason\": string}. Contradiction means the NEWER statement holds a position, value, or feeling that is meaningfully opposite to the OLDER statement. Same topic, different stance. Mere change of mood is NOT contradiction; change of stated value or commitment IS. Keep reason to 1 short sentence in second-person, gentle, non-judgmental.",
            },
            { role: "user", content: `OLDER: ${then}\n\nNEWER: ${now}` },
          ],
        }),
      });
      if (!r.ok) return { contradicts: false, reason: "" };
      const j = await r.json();
      const raw = j?.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw);
      return {
        contradicts: !!parsed?.contradicts,
        reason: String(parsed?.reason ?? "").slice(0, 280),
      };
    } catch {
      return { contradicts: false, reason: "" };
    }
  }

  let found = 0;
  for (const row of recent) {
    let queryEmb: number[] | null = row.embedding ?? null;
    if (!queryEmb) queryEmb = await embed(row.content);
    if (!queryEmb) continue;

    const { data: matches } = await admin.rpc("match_user_memories", {
      p_user_id: userId,
      p_query_embedding: queryEmb as any,
      p_match_count: 3,
      p_min_days_ago: 7,
    });

    const candidates = (matches ?? []) as any[];
    for (const m of candidates) {
      if (m.similarity < 0.78) continue;
      const verdict = await judgeContradiction(row.content, m.content);
      if (!verdict.contradicts) continue;

      const pairKey = `${m.id}:${row.id}`;
      const { data: existing } = await admin
        .from("engine_signals")
        .select("id")
        .eq("user_id", userId)
        .eq("signal_type", "contradiction")
        .contains("context", { pair_key: pairKey })
        .maybeSingle();
      if (existing?.id) continue;

      await admin.from("engine_signals").insert({
        user_id: userId,
        signal_type: "contradiction",
        urgency: 0.65,
        source: "detect",
        context: {
          pair_key: pairKey,
          older_id: m.id,
          newer_id: row.id,
          older_excerpt: m.content.slice(0, 200),
          newer_excerpt: row.content.slice(0, 200),
          older_days_ago: m.days_ago,
          reason: verdict.reason,
        },
      });
      found += 1;
    }
  }
  return { found };
}

async function handleAnomalies(req: Request, authHeader: string | null) {
  const { sb, userClient } = await getSupabaseClients(authHeader);
  const user = await requireUser(userClient);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const detected: any[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenAgo = new Date(today.getTime() - 7 * 86400000);

  const [{ count: todayCount }, { count: weekCount }, { data: costRows }] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenAgo.toISOString()).lt("created_at", today.toISOString()),
    admin.from("ai_cost_logs").select("cost_paise, created_at").gte("created_at", sevenAgo.toISOString()),
  ]);

  const avg = (weekCount ?? 0) / 7;
  if (avg > 2 && (todayCount ?? 0) < avg * 0.4) {
    detected.push({ kind: "signup_drop", severity: "warn", title: `Signups down ${Math.round((1 - (todayCount ?? 0) / avg) * 100)}% today`, detail: { today: todayCount, avg7: avg } });
  }

  if (costRows && costRows.length) {
    let todaySum = 0, prevSum = 0;
    for (const r of costRows) {
      const ts = new Date(r.created_at).getTime();
      if (ts >= today.getTime()) todaySum += Number(r.cost_paise) || 0;
      else prevSum += Number(r.cost_paise) || 0;
    }
    const prevAvg = prevSum / 7;
    if (prevAvg > 100 && todaySum > prevAvg * 2) {
      detected.push({ kind: "cost_spike", severity: "critical", title: `AI costs ${(todaySum / prevAvg).toFixed(1)}× normal today`, detail: { today_paise: todaySum, avg7_paise: prevAvg } });
    }
  }

  let inserted = 0;
  for (const a of detected) {
    const { data: existing } = await admin.from("anomalies").select("id").eq("kind", a.kind).eq("acknowledged", false).gte("detected_at", sevenAgo.toISOString()).maybeSingle();
    if (!existing) {
      await admin.from("anomalies").insert(a);
      inserted++;
    }
  }

  return new Response(JSON.stringify({ ok: true, detected: detected.length, inserted }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
