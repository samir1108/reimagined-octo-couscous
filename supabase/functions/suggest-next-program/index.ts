// ============================================================
// suggest-next-program
// ----------------------------------------------------------------
// The "Master-of-Masters" router for Home.
// Reads user state (sessions, loops, dimensions, foundation progress,
// engine_signals from Guide-chat) and returns ONE recommendation:
//
//   kind = 'continue' | 'template' | 'composed' | 'single'
//
// - continue : resume an active personalized_program / foundation
// - template : start an existing src/data/programs ProgramTemplate
// - composed : freshly-blended micro-program (uses ConsciousOS AI)
// - single   : just a next-session practice for today
//
// The composed kind is what makes the app feel like "1M yogis in one
// app" — it can stitch together neuroscience + self-inquiry + bhakti
// across N days, taught by a master picked for the user's loops.
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Static catalog snapshots — kept tiny on purpose; the engine recommends
// by id/slug and the client resolves to the rich object from src/data/.
const TEMPLATE_CATALOG = [
  { slug: "7day-awareness-kickstart", title: "7-Day Awareness Kickstart", days: 7, theme: "observation, witness, awareness", master: "patanjali" },
  { slug: "7day-sensory-awakening",   title: "7-Day Sensory Awakening",   days: 7, theme: "body, senses, presence",         master: "buddha" },
  { slug: "7day-thought-detox",       title: "7-Day Thought Detox",       days: 7, theme: "mind, thought-loops, witness",   master: "ramana" },
  { slug: "7day-emotion-mapping",     title: "7-Day Emotion Mapping",     days: 7, theme: "emotion, feeling, mapping",      master: "rumi" },
];

const PRACTICE_CATALOG = [
  "observation", "breath", "witness", "body",
  "bhakti", "karma", "jnana",
  "raja", "kriya", "tantra",
  "self-inquiry", "neuroscience", "emotional-healing", "loop-dissolution",
];

const MASTER_CATALOG = [
  "patanjali", "buddha", "ramana", "krishna", "rumi", "lao-tzu",
  "shankaracharya", "nisargadatta", "vivekananda", "adiyogi",
  "aarav", "veer", // modern bridge guides for L0-L1
];

const MODE_CATALOG = [
  "teaching", "guided-practice", "self-inquiry", "journal-reflect",
  "witness-sit", "breath-drill", "body-scan", "kriya-flow",
  "wisdom-listen", "mantra", "visualization", "integration",
];

interface UserContext {
  userId: string;
  band: number;
  brainDominance: string | null;
  recentSessionCount: number;
  daysActive: number;
  activeLoops: string[];
  weakDimensions: string[];
  foundationDay: number;
  foundationTotal: number;
  activeProgram: any | null;
  recentSignals: any[];
  recentGuideTopics: string[];
}

async function loadUserContext(admin: any, userId: string): Promise<UserContext> {
  // MAINSPRING: one cached snapshot call replaces 8 raw queries.
  // We reshape to the local UserContext interface so downstream code is untouched.
  const { getUserContext } = await import("../_shared/user-context.ts");
  const snap = await getUserContext(admin, userId);

  // Merge active loops: severity-ranked + attributions + recent signals
  const fromAttrs = snap.loopAttributions.map((a) => a.loopId);
  const fromActive = snap.activeLoops.map((l) => l.loopId);
  const fromSignals = snap.engineSignals
    .filter((s) => s.type === "active_loop" && s.loopId)
    .map((s) => s.loopId as string);
  const activeLoops = Array.from(new Set([...fromAttrs, ...fromActive, ...fromSignals])).slice(0, 5);

  // Reshape activeProgram to snake_case (downstream code expects current_day, template_slug, master_id, etc.)
  const activeProgram = snap.activeProgram
    ? {
        id: snap.activeProgram.id,
        title: snap.activeProgram.title,
        master_id: snap.activeProgram.masterId,
        template_slug: snap.activeProgram.templateSlug,
        days: snap.activeProgram.days,
        current_day: snap.activeProgram.currentDay,
        sessions: snap.activeProgram.sessions,
      }
    : null;

  // Reshape engineSignals to legacy snake_case for the AI prompt + consumed-id tracking
  const recentSignals = snap.engineSignals.map((s) => ({
    id: s.id,
    signal_type: s.type,
    practice_id: s.practiceId,
    loop_id: s.loopId,
    urgency: s.urgency,
    source: s.source,
  }));

  return {
    userId,
    band: snap.spiritualDna.currentBand || snap.spiritual.overallBand,
    brainDominance: snap.spiritualDna.brainDominance,
    recentSessionCount: snap.behavior.sessionsLast7d,
    daysActive: Math.max(snap.spiritual.journeyDay, Math.round(snap.behavior.consistencyScore * 30)),
    activeLoops,
    weakDimensions: snap.weakDimensions,
    foundationDay: snap.foundation.currentSession,
    foundationTotal: snap.foundation.totalSessions,
    activeProgram,
    recentSignals,
    recentGuideTopics: snap.recentGuideTopics,
  };
}

// Cold-start / zero-signal fallback — never leave Home empty.
function coldStartSuggestion(ctx: UserContext) {
  if (ctx.activeProgram) {
    return {
      kind: "continue" as const,
      title: ctx.activeProgram.title,
      why: `Day ${ctx.activeProgram.current_day} of your ${ctx.activeProgram.days}-day journey`,
      master_id: ctx.activeProgram.master_id,
      days: ctx.activeProgram.days,
      current_day: ctx.activeProgram.current_day,
      template_slug: ctx.activeProgram.template_slug,
      sessions: ctx.activeProgram.sessions ?? [],
      cta: "Continue",
      program_id: ctx.activeProgram.id,
    };
  }

  if (ctx.foundationDay > 0 && ctx.foundationDay < ctx.foundationTotal) {
    return {
      kind: "continue" as const,
      title: `Foundation · Session ${ctx.foundationDay + 1} of ${ctx.foundationTotal}`,
      why: "Continue building your base. The mirror is waiting.",
      master_id: "aarav",
      days: 1,
      current_day: 1,
      template_slug: "foundation-course",
      sessions: [{ day: 1, title: `Foundation Session ${ctx.foundationDay + 1}`, mode: "teaching", duration_min: 12 }],
      cta: "Continue Foundation",
    };
  }

  // Brand-new user
  return {
    kind: "template" as const,
    title: "7-Day Awareness Kickstart",
    why: "A gentle first arc — observe before you change anything.",
    master_id: "patanjali",
    days: 7,
    current_day: 1,
    template_slug: "7day-awareness-kickstart",
    sessions: [{ day: 1, title: "Notice your first thought", mode: "guided-practice", duration_min: 8 }],
    cta: "Begin",
  };
}

async function composeWithAI(ctx: UserContext, regenerate: boolean, userLang: string = "en") {
  const systemPrompt = `You are the Master-of-Masters routing engine for HOPE — an app that fuses 1M+ yogis' wisdom into one adaptive practice.

Your job: pick ONE recommendation for this user's NEXT step, by calling the recommend_next tool.

Decision rules (in order):
1. If recent guide-chat signals show acute need (anger/grief/anxiety) → composed micro-program 3-5 days targeting it.
2. If user is deep in a path (Bhakti / Jnana / Raja) and plateauing → cross-pollinate with a complementary path.
3. If user is brand new (≤3 sessions) → recommend a 7-day TEMPLATE from the catalog.
4. If user has rich signals across 2+ themes → COMPOSE a fresh 5-7 day blend (e.g. neuroscience + self-inquiry).
5. Otherwise → single next-session practice.

Tone of "why": one warm sentence, name the master, sound like a wise friend, NOT marketing.
Examples:
  "Patanjali noticed you've been circling control 3 times this week — let's soften it."
  "Buddha suggests a body-first arc since your mind has been very loud."
  "Ramana whispers: stop adding, start removing. 5 days of self-inquiry."

Available templates: ${TEMPLATE_CATALOG.map(t => `${t.slug} (${t.theme})`).join(" | ")}
Available practices: ${PRACTICE_CATALOG.join(", ")}
Available masters: ${MASTER_CATALOG.join(", ")}
Available modes: ${MODE_CATALOG.join(", ")}

For composed programs: produce 3-7 day-by-day sessions. Each session: { day, title, mode, practice_id, level (0-5), duration_min (5-20), master_id }.

${regenerate ? "User asked to see a DIFFERENT path than usual. Pick something they wouldn't expect — surprise them while staying useful." : ""}${buildLanguageInstruction(userLang)}`;

  const userPrompt = `USER STATE:
- Band: ${ctx.band.toFixed(1)} / 10
- Brain dominance: ${ctx.brainDominance ?? "unknown"}
- Sessions completed (last 5): ${ctx.recentSessionCount}
- Days active: ${ctx.daysActive}
- Foundation: ${ctx.foundationDay}/${ctx.foundationTotal}
- Active loops: ${ctx.activeLoops.join(", ") || "none detected"}
- Weak dimensions: ${ctx.weakDimensions.join(", ") || "none"}
- Active program: ${ctx.activeProgram ? `${ctx.activeProgram.title} (day ${ctx.activeProgram.current_day})` : "none"}

ENGINE SIGNALS (most recent first):
${ctx.recentSignals.slice(0, 8).map((s: any) => `- ${s.signal_type}${s.practice_id ? ` → ${s.practice_id}` : ""}${s.loop_id ? ` (loop: ${s.loop_id})` : ""} [urgency ${s.urgency}, src: ${s.source}]`).join("\n") || "- (no recent signals)"}

RECENT GUIDE-CHAT TOPICS:
${ctx.recentGuideTopics.map(t => `- "${t}"`).join("\n") || "- (none)"}

Recommend ONE thing now. Be specific. Use the tool.`;

  const __billing = await getBillingFromReq(req, "suggest-next-program");
  const response = await aiGatewayFetchWithLang(req, {
    model: "tier:fast",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [{
      type: "function",
      function: {
        name: "recommend_next",
        description: "Recommend the user's next program or session.",
        parameters: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["continue", "template", "composed", "single"] },
            title: { type: "string", description: "Short, evocative. Max 60 chars." },
            why: { type: "string", description: "One warm sentence naming the master and reason. Max 140 chars." },
            master_id: { type: "string", description: "Picked from masters catalog." },
            template_slug: { type: "string", description: "Required if kind=template. From templates catalog." },
            days: { type: "integer", minimum: 1, maximum: 30 },
            sessions: {
              type: "array",
              description: "1-7 day-by-day sessions. Required for composed/single.",
              items: {
                type: "object",
                properties: {
                  day: { type: "integer" },
                  title: { type: "string" },
                  mode: { type: "string" },
                  practice_id: { type: "string" },
                  level: { type: "integer", minimum: 0, maximum: 5 },
                  duration_min: { type: "integer", minimum: 3, maximum: 30 },
                  master_id: { type: "string" },
                },
                required: ["day", "title", "mode", "duration_min"],
                additionalProperties: false,
              },
            },
            cta: { type: "string", description: "Button label. e.g. Begin, Continue, Try this." },
          },
          required: ["kind", "title", "why", "days", "cta"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "recommend_next" } },
  }, {}, __billing ?? undefined);

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    console.warn("[suggest-next-program] AI gateway error", response.status, txt.slice(0, 300));
    return null;
  }

  const data = await response.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return null;
  try {
    return JSON.parse(args);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const regenerate = Boolean(body?.regenerate);
    const persist = body?.persist !== false; // default true
    const userLang = await resolveUserLanguage(req, body?.language);

    const ctx = await loadUserContext(admin, user.id);

    // If active program AND user didn't ask for a regeneration → resume.
    // Adaptive: lazily generate the upcoming session if not already cooked,
    // by invoking generate-program-session. This ensures every session is
    // designed against the latest signals + past completions.
    if (!regenerate && ctx.activeProgram) {
      const sugg: any = coldStartSuggestion(ctx);
      try {
        const idx = Math.max(0, (ctx.activeProgram.current_day ?? 1) - 1);
        const existing = Array.isArray(ctx.activeProgram.sessions) ? ctx.activeProgram.sessions[idx] : null;
        const isFresh = existing && existing.adaptive === true && existing.generated_at &&
          (Date.now() - new Date(existing.generated_at).getTime()) < 1000 * 60 * 60 * 6; // 6h cache
        if (!isFresh) {
          const genRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-program-session`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": authHeader,
            },
            body: JSON.stringify({ programId: ctx.activeProgram.id, sessionIndex: idx }),
          });
          if (genRes.ok) {
            const { session } = await genRes.json();
            if (session) {
              const arr = Array.isArray(sugg.sessions) ? [...sugg.sessions] : [];
              while (arr.length < idx) arr.push(null);
              arr[idx] = session;
              sugg.sessions = arr;
            }
          } else {
            console.warn("[suggest-next-program] adaptive gen failed", genRes.status);
          }
        }
      } catch (e) {
        console.warn("[suggest-next-program] adaptive gen error", (e as Error).message);
      }
      return new Response(JSON.stringify({ suggestion: sugg, context_summary: summarize(ctx) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try AI composition
    let suggestion: any = null;
    try {
      suggestion = await composeWithAI(ctx, regenerate, userLang);
    } catch (e) {
      console.warn("[suggest-next-program] AI compose failed:", (e as Error).message);
    }

    // Fallback to deterministic cold-start
    if (!suggestion) suggestion = coldStartSuggestion(ctx);

    // Persist if it's a new program (not 'continue')
    let programId: string | null = ctx.activeProgram?.id ?? null;
    if (persist && suggestion.kind !== "continue" && suggestion.kind !== "single") {
      const { data: inserted, error: insertErr } = await admin
        .from("personalized_programs")
        .insert({
          user_id: user.id,
          title: suggestion.title,
          why: suggestion.why,
          master_id: suggestion.master_id ?? null,
          kind: suggestion.kind,
          template_slug: suggestion.template_slug ?? null,
          days: suggestion.days ?? 1,
          sessions: suggestion.sessions ?? [],
          status: "suggested",
          source_signals: ctx.recentSignals.slice(0, 5).map((s: any) => ({
            type: s.signal_type, practice_id: s.practice_id, loop_id: s.loop_id, source: s.source,
          })),
        })
        .select("id")
        .single();
      if (!insertErr && inserted) {
        programId = inserted.id;
        // Mark these signals as consumed so we don't re-suggest the same thing
        const ids = ctx.recentSignals.slice(0, 5).map((s: any) => s.id).filter(Boolean);
        if (ids.length) {
          await admin.from("engine_signals")
            .update({ consumed_at: new Date().toISOString() })
            .in("id", ids);
        }
      } else if (insertErr) {
        console.warn("[suggest-next-program] insert failed:", insertErr.message);
      }
    }

    return new Response(JSON.stringify({
      suggestion: { ...suggestion, program_id: programId },
      context_summary: summarize(ctx),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[suggest-next-program] error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function summarize(ctx: UserContext) {
  return {
    band: ctx.band,
    active_loops: ctx.activeLoops,
    weak_dimensions: ctx.weakDimensions,
    foundation_day: ctx.foundationDay,
    signals_count: ctx.recentSignals.length,
  };
}
