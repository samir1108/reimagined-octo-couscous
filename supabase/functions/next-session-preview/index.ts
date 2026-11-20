// next-session-preview
// One API call â†’ returns the next slot's theme, assigned guru, wisdom,
// reasoning ("why this for you now"), explore prompts, and a list of
// alternate yogis the user can switch to before starting the session.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Slot = "morning" | "midday" | "evening" | "night";

const SLOT_LABEL: Record<Slot, string> = {
  morning: "Morning",
  midday: "Midday",
  evening: "Evening",
  night: "Night",
};

const SLOT_INTENT: Record<Slot, string> = {
  morning: "Awakening â€” set intention, meet the day with presence",
  midday: "Anchor â€” return to the witness amid activity",
  evening: "Reflection â€” harvest the day, integrate lessons",
  night: "Release â€” soften, let go, rest into being",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const nextSlot = (body.nextSlot as Slot) || "midday";
    const justCompletedSlot = (body.justCompletedSlot as Slot | undefined) ?? null;
    const currentGuruId = (body.currentGuruId as string | undefined) ?? null;
    const lastInsight = (body.lastInsight as string | undefined) ?? "";
    const userLang = await resolveUserLanguage(req, body.language);

    // Fetch today's theme + profile + recent signals + active loops + summary
    const today = new Date().toISOString().slice(0, 10);
    const [anchorRes, allTodayThemesRes, profileRes, rotationRes, signalsRes, loopsRes, summaryRes, recentSessionsRes] = await Promise.all([
      // ANCHOR = latest OPEN theme for today. When a theme's depth is exhausted,
      // a new anchor is created and this query will pick it up automatically.
      supabase
        .from("daily_themes")
        .select("id,title,description,affirmation,focus_areas,current_depth,max_depth,evolution_status")
        .eq("user_id", user.id)
        .eq("theme_date", today)
        .eq("evolution_status", "open")
        .order("sequence_no", { ascending: false })
        .limit(1)
        .maybeSingle(),
      // ALL today's spark titles â€” to forbid repetition
      admin
        .from("daily_themes")
        .select("title,sequence_no")
        .eq("user_id", user.id)
        .eq("theme_date", today)
        .order("sequence_no", { ascending: true }),
      supabase
        .from("user_consciousness_profile" as any)
        .select("overall_band,journey_phase,dominant_path,streak_current,journey_day,dimension_bands,state,bypassing_risk")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("guru_shishya_relationships")
        .select("guru_id,guru_name,total_sessions,current_streak")
        .eq("user_id", user.id)
        .order("last_session_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("consciousness_signals")
        .select("head_signals,heart_signals,gut_signals,witness_signals,dimension_updates,chitta_vritti,loops_detected,source_type,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      admin
        .from("user_loops")
        .select("loop_id,severity,awareness_score,status")
        .eq("user_id", user.id)
        .in("status", ["active", "aware"])
        .order("severity", { ascending: false })
        .limit(5),
      admin
        .from("daily_dimension_summary")
        .select("thought_score,emotion_score,body_score,awareness_score,signal_count")
        .eq("user_id", user.id)
        .eq("summary_date", today)
        .maybeSingle(),
      admin
        .from("sessions")
        .select("type,time_slot,quality_score,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const anchor = anchorRes.data;
    const allTodayThemes = allTodayThemesRes.data ?? [];
    const priorSparkTitles = allTodayThemes.map((t: any) => t.title).filter(Boolean);
    const lastSeq = allTodayThemes[allTodayThemes.length - 1]?.sequence_no ?? 0;
    const nextSequenceNo = lastSeq >= 10 ? null : Math.min(10, lastSeq + 1);

    const latestTheme = allTodayThemes[allTodayThemes.length - 1] ?? null;
    const maxDepth = latestTheme?.max_depth ?? 5;
    const currentThreadDepth = lastSeq > 0 ? lastSeq - 1 : 0;
    const depthCapReached = currentThreadDepth >= maxDepth;

    let isNewAnchor = false;

    // When depth cap is reached, close the current theme and start a new one.
    if (depthCapReached && latestTheme?.id && nextSequenceNo !== null) {
      await admin
        .from("daily_themes")
        .update({ evolution_status: "closed", updated_at: new Date().toISOString() })
        .eq("id", latestTheme.id);
      isNewAnchor = true;
    }
    const profile: any = profileRes.data ?? {};
    const assignedGuruId = currentGuruId || rotationRes.data?.guru_id || "krishna";
    const recentSignals = signalsRes.data ?? [];
    const activeLoops = loopsRes.data ?? [];
    const todaySummary: any = summaryRes.data ?? null;
    const recentSessions = recentSessionsRes.data ?? [];

    // â”€â”€ Compute deltas: dimension trajectory + dominant signal type â”€â”€
    const aggDims: Record<string, number[]> = { thought: [], emotion: [], body: [], awareness: [] };
    const aggCenters: Record<string, number> = { head: 0, heart: 0, gut: 0, witness: 0 };
    for (const s of recentSignals) {
      const du = (s as any).dimension_updates || {};
      for (const k of Object.keys(aggDims)) {
        if (typeof du[k] === "number") aggDims[k].push(du[k]);
      }
      if (Array.isArray((s as any).head_signals)) aggCenters.head += (s as any).head_signals.length;
      if (Array.isArray((s as any).heart_signals)) aggCenters.heart += (s as any).heart_signals.length;
      if (Array.isArray((s as any).gut_signals)) aggCenters.gut += (s as any).gut_signals.length;
      if (Array.isArray((s as any).witness_signals)) aggCenters.witness += (s as any).witness_signals.length;
    }
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const recentDimAvg = {
      thought: avg(aggDims.thought),
      emotion: avg(aggDims.emotion),
      body: avg(aggDims.body),
      awareness: avg(aggDims.awareness),
    };
    const dominantCenter = Object.entries(aggCenters).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";
    const lastChittaVritti = (recentSignals[0] as any)?.chitta_vritti || null;
    const dimBands = profile.dimension_bands || {};
    const weakestDim = Object.entries(dimBands)
      .filter(([, v]) => typeof v === "number")
      .sort((a, b) => (a[1] as number) - (b[1] as number))[0]?.[0] || null;

    // Build prompt â€” anchor stays, spark MUST be fresh
    const anchorBlock = anchor
      ? `Day's ANCHOR theme (immutable root, do NOT repeat its title):\n- Anchor title: ${anchor.title}\n- Anchor description: ${anchor.description}\n- Focus areas: ${(anchor.focus_areas ?? []).join?.(", ") || ""}`
      : isNewAnchor
        ? "Day's ANCHOR theme: (none yet â€” invent a fresh root theme for today. This becomes the anchor.)"
        : "Day's ANCHOR theme: (none yet â€” invent a fitting root)";

    const forbiddenTitlesBlock = priorSparkTitles.length
      ? `FORBIDDEN titles (already used today â€” do NOT reuse, do NOT paraphrase, do NOT echo their core noun):\n${priorSparkTitles.map((t: string) => `- "${t}"`).join("\n")}`
      : "No prior spark titles today.";

    const slotLabel = SLOT_LABEL[nextSlot];
    const slotIntent = SLOT_INTENT[nextSlot];

    const sys = isNewAnchor
      ? `You are an oracle composing a fresh ANCHOR theme for one day. This is the ROOT theme â€” all future sessions today will branch from it.

Output STRICT JSON only â€” no prose, no markdown, no fences.

Schema:
{
  "slot": "${nextSlot}",
  "slotLabel": "${slotLabel}",
  "themeTitle": string,           // 3-7 words, EVOCATIVE, becomes today's root
  "themeSubtitle": string,        // single sentence, max 18 words, hints at the day's direction
  "wisdom": string,               // 1 short paragraph (â‰¤ 60 words), tradition-rooted, present-tense
  "reasoning": string,            // "Why this for you now" â€” 1-2 sentences referencing their state
  "explore": string[],            // 3 short reflection prompts, each â‰¤ 12 words
  "guru": {
    "id": "${assignedGuruId}",
    "openingLine": string         // single line greet (â‰¤ 18 words)
  },
  "alternateGurus": [
    { "id": string, "name": string, "reason": string }
  ]
}

CRITICAL RULES:
1. themeTitle MUST be brand new â€” NOT any forbidden title below.
2. This is the ROOT for the day â€” make it broad enough to spawn 5 fresh angles.
3. Pick alternateGurus from this allowlist (use exact ids): krishna, buddha, shiva, ramana, osho, vivekananda, patanjali, yogananda, rumi, lao_tzu, jiddu_krishnamurti, nisargadatta, sadhguru, dalai_lama, thich_nhat_hanh, eckhart_tolle, ramakrishna, ananda_mayi.
4. Do not include the assigned guru "${assignedGuruId}" in alternateGurus.
5. Tone matches the slot: ${slotIntent}.
6. Language clear, modern, never preachy.${buildLanguageInstruction(userLang)}`
      : `You are an oracle composing a fresh "SPARK" for one session. The user has an immutable daily ANCHOR theme; each session reveals a brand-new angle of that anchor with a SURPRISING, DIFFERENT title.

Output STRICT JSON only â€” no prose, no markdown, no fences.

Schema:
{
  "slot": "${nextSlot}",
  "slotLabel": "${slotLabel}",
  "themeTitle": string,           // 3-7 words, EVOCATIVE, must be DIFFERENT from anchor and every forbidden title
  "themeSubtitle": string,        // single sentence, max 18 words, hints why this spark serves the anchor
  "wisdom": string,               // 1 short paragraph (â‰¤ 60 words), tradition-rooted, present-tense
  "reasoning": string,            // "Why this for you now" â€” 1-2 sentences referencing their state
  "explore": string[],            // 3 short reflection prompts, each â‰¤ 12 words
  "guru": {
    "id": "${assignedGuruId}",
    "openingLine": string         // single line greet (â‰¤ 18 words)
  },
  "alternateGurus": [
    { "id": string, "name": string, "reason": string }
  ]
}

CRITICAL RULES:
1. themeTitle MUST be a fresh new title â€” NOT the anchor title, NOT any forbidden title, NOT a paraphrase. Use a different metaphor, different imagery, different angle each time.
2. The spark still SERVES the anchor's spirit â€” same root, different blossom.
3. Pick alternateGurus from this allowlist (use exact ids): krishna, buddha, shiva, ramana, osho, vivekananda, patanjali, yogananda, rumi, lao_tzu, jiddu_krishnamurti, nisargadatta, sadhguru, dalai_lama, thich_nhat_hanh, eckhart_tolle, ramakrishna, ananda_mayi.
4. Do not include the assigned guru "${assignedGuruId}" in alternateGurus.
5. Tone matches the slot: ${slotIntent}.
6. Language clear, modern, never preachy.${buildLanguageInstruction(userLang)}`;

    const fmt = (n: number | null) => (n === null || isNaN(n as number) ? "â€”" : (n as number).toFixed(2));
    const recentSessionsLine = recentSessions.length
      ? recentSessions.map((s: any) => `${s.type}@${s.time_slot}(q=${s.quality_score ?? "â€”"})`).join(", ")
      : "(none)";
    const activeLoopsLine = activeLoops.length
      ? activeLoops.map((l: any) => `${l.loop_id}(sev=${l.severity ?? "?"},aware=${l.awareness_score ?? "?"})`).join(", ")
      : "(none)";
    const todaySummaryLine = todaySummary
      ? `thought=${fmt(todaySummary.thought_score)} emotion=${fmt(todaySummary.emotion_score)} body=${fmt(todaySummary.body_score)} awareness=${fmt(todaySummary.awareness_score)} (n=${todaySummary.signal_count})`
      : "(no daily rollup yet)";

    const usr = `User context:
- Slot just completed: ${justCompletedSlot ?? "(none)"}
- Next slot: ${nextSlot} (${slotIntent})
- Assigned guru id: ${assignedGuruId}
- V-Band: ${profile.overall_band ?? 0} (${profile.journey_phase ?? "awakening"}, state=${profile.state ?? "normal"})
- Dominant path: ${profile.dominant_path ?? "awareness"}
- Journey day: ${profile.journey_day ?? 1}
- Streak: ${profile.streak_current ?? 0}
- Bypassing risk: ${profile.bypassing_risk ?? 0}
- Weakest dimension band: ${weakestDim ?? "â€”"}
- Recent signal averages (last 3 sessions): thought=${fmt(recentDimAvg.thought)} emotion=${fmt(recentDimAvg.emotion)} body=${fmt(recentDimAvg.body)} awareness=${fmt(recentDimAvg.awareness)}
- Dominant active center (head/heart/gut/witness): ${dominantCenter}
- Latest chitta vritti: ${lastChittaVritti ?? "â€”"}
- Active loops: ${activeLoopsLine}
- Today's dimension rollup: ${todaySummaryLine}
- Recent sessions: ${recentSessionsLine}
- Last insight from previous session: "${(lastInsight || "").slice(0, 200)}"

${anchorBlock}

${forbiddenTitlesBlock}

Compose a FRESH spark now. The "themeTitle" MUST be brand-new â€” different metaphor, different angle from the anchor and every forbidden title above. The "reasoning" MUST reference at least one concrete signal above (a dimension delta, an active loop, the dominant center, or the chitta vritti) â€” not generic platitudes.`;

    const __billing = await getBillingFromReq(req, "next-session-preview");

    const aiRes = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
        response_format: { type: "json_object" },
      }, {}, __billing ?? undefined);

    let parsed: any = {};
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      parsed = {
        slot: nextSlot,
        slotLabel,
        themeTitle: anchor?.title ?? "Return to Presence",
        themeSubtitle: anchor?.description?.slice(0, 120) ?? "Meet this moment as it is.",
        wisdom: "The next breath is the only true door. Step through it gently.",
        reasoning: "A natural next step in your daily rhythm.",
        explore: ["What is alive in me right now?", "Where is my attention?", "What wants to be released?"],
        guru: { id: assignedGuruId, openingLine: "Welcome back. Let us begin." },
        alternateGurus: [
          { id: "buddha", name: "Buddha", reason: "Steadies the restless mind." },
          { id: "ramana", name: "Ramana Maharshi", reason: "Returns you to 'Who am I?'." },
          { id: "rumi", name: "Rumi", reason: "Opens the heart through poetry." },
        ],
        fallback: true,
      };
    } else {
      const aiJson = await aiRes.json();
      const content = aiJson?.choices?.[0]?.message?.content ?? "{}";
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {};
      }
    }

    parsed.slot = nextSlot;
    parsed.slotLabel = slotLabel;
    parsed.guru = parsed.guru ?? { id: assignedGuruId, openingLine: "Welcome back." };
    parsed.guru.id = parsed.guru.id || assignedGuruId;
    parsed.alternateGurus = Array.isArray(parsed.alternateGurus) ? parsed.alternateGurus.slice(0, 3) : [];
    parsed.explore = Array.isArray(parsed.explore) ? parsed.explore.slice(0, 3) : [];

    const persistedExplore = parsed.explore.map((prompt: string) => ({ label: "Reflect", prompt }));

    // Anti-echo guard: if AI still returned an anchor/forbidden title, append a fresh suffix
    const lowerForbidden = new Set(
      [anchor?.title, ...priorSparkTitles].filter(Boolean).map((s: string) => s.toLowerCase().trim()),
    );
    let sparkTitle = (parsed.themeTitle ?? "").toString().trim();
    if (!sparkTitle || lowerForbidden.has(sparkTitle.toLowerCase())) {
      // Server-side fallback variant â€” guarantees a different title
      const variants = [
        "A New Angle Opens",
        "The Spark Beneath",
        "One Breath Deeper",
        "A Fresh Doorway",
        "The Hidden Edge",
        "Turning the Mirror",
      ];
      sparkTitle = variants[(nextSequenceNo - 1) % variants.length];
    }
    parsed.themeTitle = sparkTitle;

    // INSERT new theme row:
    // - isNewAnchor: fresh anchor theme when previous theme's depth is exhausted
    // - !depthCapReached: new spark/thread of the current anchor
    // Skip if we've already reached the max of 10 themes for today
    if (nextSequenceNo !== null && (isNewAnchor || !depthCapReached)) {
      const newDepth = isNewAnchor ? 0 : Math.min(maxDepth, nextSequenceNo - 1);
      const newMaxDepth = isNewAnchor ? 5 : maxDepth;
      const newFocusAreas = isNewAnchor
        ? (parsed.explore?.map((e: any) => e.label || e.prompt || e) || [])
        : (anchor?.focus_areas ?? []);
      const { error: persistError } = await admin
        .from("daily_themes")
        .insert({
          user_id: user.id,
          theme_date: today,
          sequence_no: nextSequenceNo,
          title: sparkTitle,
          description: parsed.themeSubtitle ?? anchor?.description?.slice(0, 120) ?? "Meet this moment as it is.",
          affirmation: parsed.wisdom ?? null,
          focus_areas: newFocusAreas,
          deepened_wisdom: parsed.wisdom ?? null,
          deepened_reasoning: parsed.reasoning ?? null,
          deepened_explore: persistedExplore,
          evolution_status: "open",
          sub_angle: parsed.themeSubtitle ?? null,
          last_evolved_at: new Date().toISOString(),
          current_depth: newDepth,
          max_depth: newMaxDepth,
        });

      if (persistError) {
        console.error("Failed to persist theme row", persistError);
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("next-session-preview error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
