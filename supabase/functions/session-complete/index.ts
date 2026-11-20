// ============================================================
// session-complete â€” the server-owned closing pipeline.
// ------------------------------------------------------------
// Closes a generative session row, then runs every downstream effect
// the client used to run:
//   â€¢ evidence-based quality score (feeds the archetype bandit)
//   â€¢ karma event
//   â€¢ streak
//   â€¢ moments + session_events
//   â€¢ arc / thread continuity
//   â€¢ ingredient outcomes
//   â€¢ V-level delta + AI shift summary + next-session teaser
//
// The stored plan in `sessions.summary` is merged, never overwritten:
// resume, provenance and analytics all read it back.
// ============================================================
import { withMiddleware, successResponse, failureResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface CompletedStep {
  kind: string;
  title?: string;
  stepIndex?: number;
  payload?: Record<string, unknown>;
  durationSeconds?: number;
}

interface PlanStep {
  kind: string;
  title?: string;
  est_minutes?: number;
  durationSeconds?: number;
  params?: Record<string, unknown>;
  signalRef?: string;
}

const PRACTICE_KINDS = [
  "breathwork", "body_scan", "movement", "mantra", "self_inquiry",
  "loving_kindness", "open_awareness", "witness", "practice",
];

const DIMENSION_BY_KIND: Record<string, string> = {
  breathwork: "awareness",
  body_scan: "body",
  movement: "body",
  mantra: "thought",
  self_inquiry: "thought",
  loving_kindness: "emotion",
  open_awareness: "awareness",
  witness: "awareness",
  journal: "thought",
  reflection: "awareness",
  free_write: "thought",
  practice: "awareness",
};

function matchesStep(record: CompletedStep, step: PlanStep, index: number): boolean {
  return (
    record.stepIndex === index ||
    (record.stepIndex == null &&
      record.kind === step.kind &&
      (!record.title || !step.title || record.title === step.title))
  );
}

/** Evidence per step â€” did the user actually do the thing, not just tap Next. */
function stepEvidence(record: CompletedStep, step?: PlanStep): number {
  const data = ((record.payload as { data?: Record<string, unknown> } | undefined)?.data ??
    record.payload ??
    {}) as Record<string, unknown>;
  const planned = Math.max(
    30,
    Number(step?.durationSeconds) || (Number(step?.est_minutes) || 1) * 60,
  );
  const spent = Number(record.durationSeconds) || 0;

  switch (record.kind) {
    case "journal": {
      const chars = Number(data.chars) || String(data.text || "").trim().length;
      return Math.max(0, Math.min(1, chars / 40));
    }
    case "reflection": {
      const chars = Number(data.chars) || String(data.reflection || "").trim().length;
      return chars >= 3 ? 1 : chars / 3;
    }
    case "micro-act": {
      if (data.done === true) return 1;
      if (data.committed === true) return 0.5;
      return 0;
    }
    case "witness": {
      const done = Number(data.durationSec) || spent;
      if (data.partial === true) return Math.max(0, Math.min(0.8, done / planned));
      return Math.max(0, Math.min(1, done / planned));
    }
    case "breathwork":
    case "practice": {
      const done = Number(data.durationSec) || spent;
      return Math.max(0, Math.min(1, done / planned));
    }
    case "wisdom-read": {
      const line = String(data.highlight || "").trim();
      return line.length >= 3 ? 1 : 0;
    }
    case "guide-chat":
    case "temple-chat": {
      const answer = String(data.answer || data.text || "").trim();
      return answer.length >= 12 ? 1 : answer.length / 12;
    }
    default:
      return spent >= planned * 0.5 ? 1 : spent / planned;
  }
}

function computeQuality(
  plan: { steps?: PlanStep[] } | null,
  completed: CompletedStep[],
  skipped: CompletedStep[],
  totalSeconds: number,
): number {
  const steps = plan?.steps ?? [];
  const attempted = completed.length + skipped.length;
  const engagement = attempted > 0
    ? completed.length / attempted
    : steps.length > 0
      ? completed.length / steps.length
      : 0;

  const evidence = completed.map((record) => {
    const step = steps[record.stepIndex ?? -1] ?? steps.find((s) => s.kind === record.kind);
    return stepEvidence(record, step);
  });
  const depth = evidence.length
    ? evidence.reduce((a, b) => a + b, 0) / evidence.length
    : engagement * 0.5;

  const expectedMinutes = steps.reduce((sum, s) => sum + (Number(s.est_minutes) || 0), 0);
  const actualMinutes = totalSeconds / 60;
  const completion = expectedMinutes > 0
    ? Math.min(1, actualMinutes / expectedMinutes)
    : engagement;

  return Math.max(
    0,
    Math.min(1, Number((engagement * 0.25 + depth * 0.5 + completion * 0.25).toFixed(3))),
  );
}

async function aiShiftSummary(args: {
  completedSteps: CompletedStep[];
  skippedSteps: CompletedStep[];
  loopsTouched: string[];
  vDelta: number | null;
  intent: string | null;
}): Promise<{ shiftSummary: string | null; nextTeaser: string | null }> {
  const engagedCount = args.completedSteps.length;
  const skippedCount = args.skippedSteps.length;

  if (engagedCount === 0) {
    const total = engagedCount + skippedCount;
    if (skippedCount > 0) {
      return {
        shiftSummary: `You skipped ${skippedCount} of ${total} step${total === 1 ? "" : "s"}. Nothing was practiced today â€” and that's honest data too.`,
        nextTeaser: "Your next session is waiting â€” even one breath taken fully is enough to begin.",
      };
    }
    return {
      shiftSummary: "You arrived but didn't engage any step. The intention is noted.",
      nextTeaser: "In your next session, try just the first step â€” it's shorter than you remember.",
    };
  }

  if (!GROQ_API_KEY) return { shiftSummary: null, nextTeaser: null };
  try {
    const resp = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content:
              "You write 2 short, warm, second-person reflections after a meditation session. " +
              `Return JSON: {"shiftSummary": string (one sentence, what shifted in them â€” ONLY based on steps they ACTUALLY engaged with, never invent practice that didn't happen), "nextTeaser": string (one sentence about what the NEXT SESSION might invite â€” always phrase it as "next session", NEVER say "tomorrow" or "next time" or any time reference)}. ` +
              "If many steps were skipped, acknowledge that honestly without shame. No clichÃ©s. No 'namaste'. No emoji. 14-22 words each.",
          },
          {
            role: "user",
            content: JSON.stringify({
              intent: args.intent,
              engagedKinds: args.completedSteps.map((s) => s.kind),
              engagedCount,
              skippedKinds: args.skippedSteps.map((s) => s.kind),
              skippedCount,
              loopsTouched: args.loopsTouched.slice(0, 4),
              vDelta: args.vDelta,
            }),
          },
        ],
      }),
    });
    if (!resp.ok) return { shiftSummary: null, nextTeaser: null };
    const data = await resp.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    const cleanTeaser = (s: string) =>
      s
        .replace(/\btomorrow('s)?\b/gi, "your next session")
        .replace(/\bnext time\b/gi, "your next session")
        .replace(/\byour next session('s)? session\b/gi, "your next session");
    return {
      shiftSummary: typeof parsed.shiftSummary === "string" ? parsed.shiftSummary.slice(0, 240) : null,
      nextTeaser: typeof parsed.nextTeaser === "string" ? cleanTeaser(parsed.nextTeaser).slice(0, 240) : null,
    };
  } catch (e) {
    console.warn("[session-complete] AI summary failed:", e);
    return { shiftSummary: null, nextTeaser: null };
  }
}

/** Streak bookkeeping, idempotent per calendar day. */
async function updateStreak(admin: any, userId: string): Promise<{
  current: number;
  longest: number;
  total: number;
}> {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const { data: streak } = await admin
    .from("user_session_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let current = Number(streak?.current_streak ?? 0);
  let longest = Number(streak?.longest_streak ?? 0);
  let total = Number(streak?.total_sessions_lifetime ?? 0);
  const lastDate = streak?.last_session_date ?? null;

  if (lastDate === today) {
    return { current, longest, total };
  }

  current = lastDate === yesterday ? current + 1 : 1;
  longest = Math.max(longest, current);
  total += 1;

  await admin.from("user_session_streaks").upsert({
    user_id: userId,
    current_streak: current,
    longest_streak: longest,
    total_sessions_lifetime: total,
    last_session_date: today,
    grace_days_remaining: 3,
    paused: false,
  });

  return { current, longest, total };
}

interface MomentRow {
  type: string;
  message: string;
  visual: string;
  shareable: boolean;
}

function evaluateMoments(input: {
  totalLifetime: number;
  gapDays: number;
  todaySessions: number;
  activeLoopCount: number;
  completedStepCount: number;
}): MomentRow[] {
  const out: MomentRow[] = [];
  const { totalLifetime, gapDays, todaySessions, activeLoopCount, completedStepCount } = input;

  if (gapDays >= 3) {
    out.push({
      type: "return",
      message: gapDays > 30
        ? `You're back after ${gapDays} days. The path didn't go anywhere â€” it was waiting.`
        : gapDays > 7
          ? "You're here. That's enough. Let's begin gently."
          : "Welcome back. No catching up â€” just presence.",
      visual: "warm-glow",
      shareable: false,
    });
  }

  if ([1, 7, 30, 100, 365, 500, 1000].includes(totalLifetime)) {
    out.push({
      type: "milestone",
      message: totalLifetime === 100
        ? `Session ${totalLifetime}. You've sat with yourself ${totalLifetime} times. That's a life.`
        : totalLifetime === 365
          ? "One full year of sessions. The practice has become you."
          : `Session ${totalLifetime}. Each one a thread in the fabric of who you're becoming.`,
      visual: "fireworks",
      shareable: true,
    });
  }

  if (completedStepCount >= 3) {
    out.push({
      type: "breakthrough",
      message: completedStepCount >= 5
        ? "Five steps engaged. You're not checking boxes â€” you're diving."
        : "You just did something differently. That's the muscle getting stronger.",
      visual: "sparkle",
      shareable: true,
    });
  }

  if (activeLoopCount > 0) {
    out.push({
      type: "mirror",
      message: "You saw something true today. Let it settle.",
      visual: "mirror-shimmer",
      shareable: true,
    });
  }

  if (todaySessions >= 3) {
    out.push({
      type: "depth",
      message: "Three sessions in one day. You're not checking boxes â€” you're diving.",
      visual: "depth-ripple",
      shareable: true,
    });
  }

  return out;
}

function arcNameFor(input: {
  loops: string[];
  dimension: string | null;
  archetype: string | null;
}): string {
  if (input.loops.length > 0) {
    const loop = input.loops[0].replace(/_/g, " ");
    return `Untangling "${loop.charAt(0).toUpperCase()}${loop.slice(1)}"`;
  }
  const byDimension: Record<string, string> = {
    body: "The Body Remembers",
    thought: "The Witness Wakes Up",
    emotion: "Opening the Heart",
    awareness: "Spacious Mind",
  };
  if (input.dimension && byDimension[input.dimension]) return byDimension[input.dimension];
  const byArchetype: Record<string, string> = {
    Settling: "Settling In",
    Confrontation: "Facing What Is",
    "Shadow Mirror": "Seeing Clearly",
    "Stuck-Loop Break": "Breaking the Pattern",
    "Lineage Initiation": "The Transmission",
    "Re-entry": "The Return",
    Celebration: "Celebrating the Rise",
    Dissolution: "Letting Go",
    "Witness Deepening": "Deepening the Witness",
    "Inquiry Spiral": "The Inquiry Deepens",
    Devotional: "Opening the Heart",
    "Karmic Action": "From Insight to Action",
    "Dark Night Hold": "Holding the Dark",
  };
  if (input.archetype && byArchetype[input.archetype]) return byArchetype[input.archetype];
  return "The Journey Continues";
}

/** Arc continuity: same loop/dimension/archetype inside 14 days continues. */
async function updateThread(
  admin: any,
  userId: string,
  input: { loops: string[]; dimension: string | null; archetype: string | null; sessionTitle: string },
): Promise<{ arc: string; sessionsInArc: number; resolved: boolean }> {
  const { data: row } = await admin
    .from("session_threads")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const previous = Array.isArray(row?.previous_arcs) ? row.previous_arcs : [];
  const startedAt = row?.arc_started_at ? new Date(row.arc_started_at).getTime() : 0;
  const withinWindow = startedAt > 0 && Date.now() - startedAt < 14 * 86400_000;
  const currentArc: string | null = row?.current_arc ?? null;

  const themeOf = (name: string | null): string => {
    if (!name) return "general";
    const lower = name.toLowerCase();
    if (lower.includes("untangling")) return "untangling";
    if (lower.includes("return")) return "return";
    if (lower.includes("opening")) return "opening";
    if (lower.includes("deepening")) return "deepening";
    if (lower.includes("breaking")) return "breaking";
    if (lower.includes("settling")) return "settling";
    return "general";
  };

  const nextTheme = input.loops.length
    ? "untangling"
    : input.dimension === "emotion"
      ? "opening"
      : input.dimension === "thought" || input.dimension === "awareness"
        ? "deepening"
        : input.archetype === "Re-entry"
          ? "return"
          : input.archetype === "Settling"
            ? "settling"
            : "general";

  const continues = Boolean(currentArc) && withinWindow && (
    themeOf(currentArc) === nextTheme ||
    input.loops.some((l) => (currentArc ?? "").toLowerCase().includes(l.toLowerCase()))
  );

  let arc = currentArc ?? "";
  let sessionsInArc = Number(row?.sessions_in_arc ?? 0);
  let resolution = String(row?.resolution ?? "");
  let resolved = false;

  if (continues && currentArc) {
    sessionsInArc += 1;
    if (sessionsInArc >= 8) {
      previous.push({
        arc: currentArc,
        sessions: sessionsInArc,
        completedAt: new Date().toISOString(),
        resolution: "resolved",
      });
      arc = "";
      sessionsInArc = 0;
      resolved = true;
    }
  } else {
    if (currentArc && sessionsInArc > 0) {
      previous.push({
        arc: currentArc,
        sessions: sessionsInArc,
        completedAt: new Date().toISOString(),
        resolution: "integrated",
      });
    }
    arc = arcNameFor({ loops: input.loops, dimension: input.dimension, archetype: input.archetype });
    sessionsInArc = 1;
  }

  await admin.from("session_threads").upsert({
    user_id: userId,
    current_arc: arc || null,
    arc_started_at: continues ? row?.arc_started_at ?? new Date().toISOString() : new Date().toISOString(),
    sessions_in_arc: sessionsInArc,
    arc_intensity: Math.min(1, 0.1 * sessionsInArc),
    previous_arcs: previous,
    updated_at: new Date().toISOString(),
  });

  return { arc: arc || currentArc || "", sessionsInArc, resolved };
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const auth = req.headers.get("Authorization") ?? "";
  const body = await req.json().catch(() => ({}));

  // Whisper-only mode â€” stores a future-self whisper without touching
  // any session row. Used by the completion screen's "leave one sentence
  // for your next sitting" when a direct client insert is blocked by RLS.
  if (body?.mode === "whisper" && typeof body?.text === "string" && body.text.trim()) {
    const expires = new Date(Date.now() + 7 * 86400_000).toISOString();
    const { error: wErr } = await admin.from("future_self_whispers").insert({
      user_id: user.id,
      whisper: String(body.text).trim().slice(0, 300),
      tone: "user",
      expires_at: expires,
    });
    if (wErr) return failureResponse(wErr.message, 500);
    return successResponse({ ok: true });
  }

  const sessionId: string | undefined = body?.sessionId;
  const completedSteps: CompletedStep[] = Array.isArray(body?.completedSteps) ? body.completedSteps : [];
  const skippedSteps: CompletedStep[] = Array.isArray(body?.skippedSteps) ? body.skippedSteps : [];
  const totalSeconds: number = Number(body?.totalSeconds) || 0;

  if (!sessionId) return failureResponse("sessionId required", 400);

  const { data: session } = await admin
    .from("sessions")
    .select("id, user_id, type, summary, started_at, user_chosen_topic, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.user_id !== user.id) return failureResponse("Not found", 404);

  if (session.status === "completed") {
    return successResponse({
      ok: true, sessionId,
      completedStepCount: completedSteps.length,
      durationMs: totalSeconds * 1000,
      loopsTouched: [], karmaEarned: 0,
      shiftSummary: null, nextTeaser: null,
      vLevelDelta: null, dimensionNudges: [],
      alreadyCompleted: true,
    });
  }

  // â”€â”€ Read the stored plan (never overwrite it) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let plan: { steps?: PlanStep[]; _meta?: Record<string, unknown>; intent?: string } = {};
  try {
    plan = JSON.parse(session.summary || "{}");
  } catch { /* non-JSON legacy summary */ }

  const vLevelStart = Number((plan?._meta as any)?.vLevelStart ?? NaN);
  const dimensionBandsStart = ((plan?._meta as any)?.dimensionBandsStart ?? null) as
    | Record<string, number>
    | null;
  const planIntent: string | null = session.user_chosen_topic || plan?.intent || null;
  const planSteps = plan?.steps ?? [];

  // Fire consciousness-engine first so v-level may update before we read it back
  try {
    await admin.functions.invoke("consciousness-engine", {
      body: {
        action: "session_completed",
        sessionId,
        metadata: {
          source: "generative",
          stepKinds: completedSteps.map((s) => s.kind),
          totalSeconds,
        },
      },
      headers: { Authorization: auth },
    });
  } catch (e) {
    console.warn("[session-complete] engine call failed:", e);
  }

  // -- Post-session V-level + dimensions ---------------------------------
  let vLevelEnd: number | null = null;
  let dimensionBandsEnd: Record<string, number> | null = null;
  try {
    const { data: profile } = await admin
      .from("user_consciousness_profile")
      .select("v_level_current, dimension_bands")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile) {
      vLevelEnd = Number(profile.v_level_current ?? 0);
      dimensionBandsEnd = profile.dimension_bands || null;
    }
  } catch { /* non-fatal */ }

  const vLevelDelta = Number.isFinite(vLevelStart) && vLevelEnd !== null
    ? Number((vLevelEnd - vLevelStart).toFixed(2))
    : null;

  const dimensionNudges: Array<{ id: string; delta: number }> = [];
  if (dimensionBandsStart && dimensionBandsEnd) {
    for (const [k, v] of Object.entries(dimensionBandsEnd)) {
      const start = Number(dimensionBandsStart[k] ?? 0);
      const end = Number(v ?? 0);
      const d = Number((end - start).toFixed(2));
      if (d > 0) dimensionNudges.push({ id: k, delta: d });
    }
    dimensionNudges.sort((a, b) => b.delta - a.delta);
  } else {
    for (const record of completedSteps) {
      const dim = DIMENSION_BY_KIND[record.kind];
      if (!dim) continue;
      const existing = dimensionNudges.find((n) => n.id === dim);
      if (existing) existing.delta = Number((existing.delta + 0.1).toFixed(2));
      else dimensionNudges.push({ id: dim, delta: 0.1 });
    }
  }

  // -- Loops touched -----------------------------------------------------
  let loopsTouched: string[] = [];
  try {
    const since = session.started_at || new Date(Date.now() - 3600_000).toISOString();
    const { data: sigs } = await admin
      .from("consciousness_signals")
      .select("loop_id")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .not("loop_id", "is", null)
      .limit(20);
    loopsTouched = Array.from(new Set((sigs || []).map((r: any) => r.loop_id).filter(Boolean)));
  } catch { /* non-fatal */ }
  if (loopsTouched.length === 0) {
    loopsTouched = Array.from(new Set(
      planSteps
        .map((s) => s.signalRef)
        .filter((r): r is string => typeof r === "string" && r.startsWith("loop:"))
        .map((r) => r.slice(5)),
    ));
  }

  // -- Karma -------------------------------------------------------------
  const hasReflective = completedSteps.some((s) => s.kind === "journal" || s.kind === "reflection");
  const karmaEarned = Math.max(0, completedSteps.length * 2) + (hasReflective ? 1 : 0);
  if (karmaEarned > 0) {
    try {
      await admin.from("karma_events").insert({
        user_id: user.id,
        source: "generative_session",
        base_points: karmaEarned,
        weight: 1.0,
        awarded: karmaEarned,
        metadata: { sessionId, stepKinds: completedSteps.map((s) => s.kind), totalSeconds },
      });
    } catch (e) {
      console.warn("[session-complete] karma insert failed:", e);
    }
  }

  const qualityScore = computeQuality(plan, completedSteps, skippedSteps, totalSeconds);

  // -- Streak ------------------------------------------------------------
  let streak = { current: 0, longest: 0, total: 0 };
  try {
    streak = await updateStreak(admin, user.id);
  } catch (e) {
    console.warn("[session-complete] streak failed:", e);
  }

  // -- Moments + events --------------------------------------------------
  let moments: MomentRow[] = [];
  try {
    const { count: lifetimeCount } = await admin
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed");

    const { data: recent } = await admin
      .from("sessions")
      .select("id, started_at, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(60);

    const rows = (recent || []) as Array<Record<string, unknown>>;
    const totalLifetime = Number(lifetimeCount ?? rows.length) || 1;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = rows.filter((r) =>
      r.completed_at && new Date(String(r.completed_at)).getTime() >= todayStart.getTime()
    ).length;
    const lastBefore = rows.find((r) => String(r.id) !== sessionId);
    const gapDays = lastBefore?.completed_at
      ? Math.floor((Date.now() - new Date(String(lastBefore.completed_at)).getTime()) / 86400_000)
      : 999;

    let activeLoopCount = loopsTouched.length;
    try {
      const { count } = await admin
        .from("active_loops")
        .select("loop_id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true);
      if (typeof count === "number") activeLoopCount = count;
    } catch { /* keep loopsTouched */ }

    moments = evaluateMoments({
      totalLifetime: totalLifetime + 1,
      gapDays,
      todaySessions: todaySessions + 1,
      activeLoopCount,
      completedStepCount: completedSteps.length,
    });

    const events = [
      {
        transaction_type: "session_completed",
        payload: {
          sessionId,
          completedSteps: completedSteps.map((s) => s.kind),
          skippedSteps: skippedSteps.map((s) => s.kind),
          totalSeconds,
          karmaEarned,
          qualityScore,
        },
      },
      ...moments.map((m) => ({
        transaction_type: m.type,
        payload: { message: m.message, visual: m.visual, shareable: m.shareable },
      })),
    ];

    for (const event of events) {
      try {
        await admin.from("session_events").insert({
          user_id: user.id,
          event_type: event.transaction_type,
          payload: { ...event.payload, timestamp: new Date().toISOString() },
        });
      } catch { /* per-event best effort */ }
    }
  } catch (e) {
    console.warn("[session-complete] moments failed:", e);
  }

  // -- Arc continuity ----------------------------------------------------
  let arc = { arc: "", sessionsInArc: 0, resolved: false };
  try {
    const archetype = String((plan?._meta as any)?.archetype ?? "") || null;
    const dimension = String((plan?._meta as any)?.starvedDimension ?? "") || null;
    arc = await updateThread(admin, user.id, {
      loops: loopsTouched,
      dimension,
      archetype,
      sessionTitle: String(session.user_chosen_topic ?? planIntent ?? "Session"),
    });
  } catch (e) {
    console.warn("[session-complete] thread failed:", e);
  }

  // -- Ingredient outcomes ----------------------------------------------
  try {
    for (let index = 0; index < planSteps.length; index++) {
      const step = planSteps[index];
      const ingredientId = typeof step.params?.ingredientId === "string"
        ? step.params.ingredientId
        : null;
      if (!ingredientId) continue;
      const done = completedSteps.find((r) => matchesStep(r, step, index));
      const skipped = skippedSteps.some((r) => matchesStep(r, step, index));
      if (!done && !skipped) continue;

      const plannedSeconds = Math.max(60, Math.round(Number(step.est_minutes ?? 1) * 60));
      const spent = done ? Math.max(0, Math.round(done.durationSeconds ?? 0)) : 0;
      const ratio = plannedSeconds > 0 ? Math.min(1, spent / plannedSeconds) : 0;
      await admin
        .from("session_ingredients")
        .update({
          completed: Boolean(done),
          seconds_spent: spent,
          quality: done ? Math.min(1, 0.4 + 0.6 * ratio) : 0,
        })
        .eq("session_id", sessionId)
        .eq("ingredient_id", ingredientId);
    }
  } catch (e) {
    console.warn("[session-complete] ingredient outcomes skipped:", e);
  }

  // -- AI summary (cheap fast model) -------------------------------------
  const { shiftSummary, nextTeaser } = await aiShiftSummary({
    completedSteps, skippedSteps, loopsTouched, vDelta: vLevelDelta, intent: planIntent,
  });

  // -- Close the row LAST, merging the plan back ------------------------
  const mergedSummary = JSON.stringify({
    ...plan,
    completedSteps,
    skippedSteps,
    completion: {
      completedStepCount: completedSteps.length,
      karmaEarned,
      qualityScore,
      shiftSummary,
      nextTeaser,
    },
  });

  await admin
    .from("sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: totalSeconds,
      summary: mergedSummary,
    })
    .eq("id", sessionId);

  const primaryPractice =
    planSteps.find((s) => PRACTICE_KINDS.includes(s.kind))?.kind ?? null;

  // Context caches are stale the moment a sitting closes.
  try {
    await admin.from("user_state_snapshot").delete().eq("user_id", user.id);
  } catch { /* best-effort */ }

  return successResponse({
    ok: true,
    sessionId,
    completedStepCount: completedSteps.length,
    durationMs: totalSeconds * 1000,
    loopsTouched,
    karmaEarned,
    shiftSummary,
    nextTeaser,
    vLevelDelta,
    dimensionNudges: dimensionNudges.slice(0, 3),
    qualityScore,
    primaryPractice,
    moments,
    streak,
    arc,
  });
}));
