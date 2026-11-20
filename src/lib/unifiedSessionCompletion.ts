import { supabase } from "@/lib/supabase";
import { localDateKey } from "@/lib/localDate";
import type { SessionPlan, CompletedStepRecord, SessionCompleteResult } from "@/lib/session-shell/types";

const GATE_KEYS = ["morning", "midday", "evening", "night"];

interface UnifiedCompletionInput {
  userId: string;
  sessionId: string;
  plan: SessionPlan | null;
  completedSteps: CompletedStepRecord[];
  skippedSteps?: CompletedStepRecord[];
  totalSeconds: number;
  gate: string;
  /** session_spine row for this session, when one exists. */
  spineId?: string | null;
}

interface DimensionNudge {
  id: string;
  delta: number;
}

interface UnifiedCompletionResult {
  ok: boolean;
  sessionId: string;
  completedStepCount: number;
  durationMs: number;
  loopsTouched: string[];
  karmaEarned: number;
  shiftSummary: string;
  nextTeaser: string;
  vLevelDelta: number;
  dimensionNudges: DimensionNudge[];
  alreadyCompleted: boolean;
  qualityScore: number;
  primaryPractice: string | null;
}

async function computeKarmaEarned(
  completedSteps: CompletedStepRecord[],
  totalSeconds: number
): Promise<number> {
  const stepKarma = completedSteps.length * 15;
  const timeKarma = Math.floor(totalSeconds / 60) * 5;
  return stepKarma + timeKarma;
}

async function computeDimensionNudges(
  plan: SessionPlan | null,
  completedSteps: CompletedStepRecord[]
): Promise<DimensionNudge[]> {
  const nudges: DimensionNudge[] = [];
  
  if (!plan) return nudges;
  
  for (const [index, step] of plan.steps.entries()) {
    if (stepWasCompleted(step, index, completedSteps)) {
      // Map practice kinds to dimensions
      const dimensionMap: Record<string, string> = {
        "breathwork": "awareness",
        "body_scan": "body",
        "movement": "body",
        "mantra": "thought",
        "self_inquiry": "thought",
        "loving_kindness": "emotion",
        "open_awareness": "awareness",
        "witness": "awareness",
        "journal": "thought",
        "reflection": "awareness",
        "free_write": "thought",
        "practice": "awareness",
      };
      
      const dim = dimensionMap[step.kind] || "awareness";
      const existing = nudges.find(n => n.id === dim);
      if (existing) {
        existing.delta += 1;
      } else {
        nudges.push({ id: dim, delta: 1 });
      }
    }
  }
  
  return nudges;
}

/**
 * A record matches a plan step by its explicit index, or — for older stored
 * records written before `stepIndex` existed — by kind + title.
 */
function stepWasCompleted(
  step: SessionPlan["steps"][number],
  index: number,
  completedSteps: CompletedStepRecord[],
): boolean {
  return completedSteps.some(
    (c) =>
      c.stepIndex === index ||
      (c.stepIndex == null && c.kind === step.kind && (!c.title || !step.title || c.title === step.title)),
  );
}

async function computeLoopsTouched(
  plan: SessionPlan | null,
  completedSteps: CompletedStepRecord[]
): Promise<string[]> {
  const loops: string[] = [];
  
  if (!plan) return loops;
  
  for (const [index, step] of plan.steps.entries()) {
    if (stepWasCompleted(step, index, completedSteps) && step.signalRef) {
      loops.push(step.signalRef);
    }
  }
  
  return [...new Set(loops)];
}

async function computeShiftSummary(
  plan: SessionPlan | null,
  completedSteps: CompletedStepRecord[],
  totalSeconds: number
): Promise<string> {
  const practiceSteps = plan?.steps.filter(s => 
    ["breathwork", "body_scan", "movement", "mantra", "self_inquiry", "loving_kindness", "open_awareness", "witness", "practice"].includes(s.kind)
  ) || [];
  
  const completedPractice = practiceSteps.filter(s => 
    stepWasCompleted(s, plan!.steps.indexOf(s), completedSteps)
  );
  
  if (completedPractice.length === 0) {
    return `Completed ${completedSteps.length} step${completedSteps.length !== 1 ? 's' : ''} in ${Math.floor(totalSeconds / 60)} min.`;
  }
  
  const kinds = completedPractice.map(s => s.kind.replace('_', ' ')).join(', ');
  return `Practiced ${kinds} for ${Math.floor(totalSeconds / 60)} min. ${completedSteps.length} step${completedSteps.length !== 1 ? 's' : ''} complete.`;
}

async function computeNextTeaser(
  plan: SessionPlan | null,
  loopsTouched: string[],
  vLevelDelta: number
): Promise<string> {
  if (loopsTouched.length > 0) {
    const ref = loopsTouched[0];
    const name = (ref.includes(':') ? ref.split(':').slice(1).join(':') : ref).replace(/_/g, ' ');
    return `You touched ${name}. Your next session will build on this.`;
  }
  
  if (vLevelDelta > 0) {
    return `Your awareness deepened. The next sitting will build on this clarity.`;
  }
  
  return `A quiet session. The next one may reveal something new.`;
}

/**
 * Evidence per step — did the user actually do the thing, not just tap Next.
 * Completion used to be tap-speed; now the reward signal comes from payloads.
 */
function stepEvidence(record: CompletedStepRecord, step?: { est_minutes?: number; durationSeconds?: number }): number {
  const data = ((record.payload as { data?: Record<string, unknown> } | undefined)?.data
    ?? record.payload
    ?? {}) as Record<string, unknown>;
  const planned = Math.max(30, Number(step?.durationSeconds) || (Number(step?.est_minutes) || 1) * 60);
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
    case "breathwork": {
      const done = Number(data.durationSec) || spent;
      return Math.max(0, Math.min(1, done / planned));
    }
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

async function computeQualityScore(
  completedSteps: CompletedStepRecord[],
  skippedSteps: CompletedStepRecord[] | undefined,
  totalSeconds: number,
  plan: SessionPlan | null
): Promise<number> {
  if (!plan) return 50;

  const completed = completedSteps.length;
  const skipped = skippedSteps?.length || 0;
  const attempted = completed + skipped;

  // Engagement: did they walk the session or bail out of it?
  const engagement = attempted > 0 ? completed / attempted : completed / plan.steps.length;

  // Depth: average evidence that each step was actually done.
  const evidence = completedSteps.map((record) => {
    const step = plan.steps[record.stepIndex ?? -1] ?? plan.steps.find((s) => s.kind === record.kind);
    return stepEvidence(record, step);
  });
  const depth = evidence.length
    ? evidence.reduce((a, b) => a + b, 0) / evidence.length
    : engagement * 0.5;

  // Completion: time spent vs the session's own estimate.
  const expectedMinutes = plan.steps.reduce((sum, s) => sum + (Number(s.est_minutes) || 0), 0);
  const actualMinutes = totalSeconds / 60;
  const completion = expectedMinutes > 0
    ? Math.min(1, actualMinutes / expectedMinutes)
    : engagement;

  const score = (engagement * 0.25 + depth * 0.5 + completion * 0.25) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function computePrimaryPractice(
  plan: SessionPlan | null,
  completedSteps: CompletedStepRecord[]
): Promise<string | null> {
  if (!plan) return null;
  
  const practiceSteps = plan.steps.filter(s => 
    ["breathwork", "body_scan", "movement", "mantra", "self_inquiry", "loving_kindness", "open_awareness", "witness", "practice"].includes(s.kind)
  );
  
  for (const step of practiceSteps) {
    if (stepWasCompleted(step, plan.steps.indexOf(step), completedSteps)) {
      return step.kind;
    }
  }
  
  return null;
}

/**
 * Write what actually happened back onto the proposed ingredient rows.
 *
 * This is the write side of the composer's feedback loop. Without it the
 * engine has no memory of which steps this user finishes — the performance
 * view stays empty and the learned term never fires.
 */
async function recordIngredientOutcomes(input: {
  sessionId: string;
  plan: SessionPlan | null;
  completedSteps: CompletedStepRecord[];
  skippedSteps?: CompletedStepRecord[];
}): Promise<void> {
  const { sessionId, plan, completedSteps, skippedSteps = [] } = input;
  if (!plan || plan.steps.length === 0) return;

  for (let index = 0; index < plan.steps.length; index++) {
    const step = plan.steps[index];
    const params = (step.params ?? {}) as Record<string, unknown>;
    const ingredientId = typeof params.ingredientId === "string" ? params.ingredientId : null;
    if (!ingredientId) continue;

    const matches = (record: CompletedStepRecord) =>
      record.stepIndex === index ||
      (record.stepIndex == null &&
        record.kind === step.kind &&
        (!record.title || !step.title || record.title === step.title));

    const doneRecord = completedSteps.find(matches);
    const skipped = skippedSteps.some(matches);
    if (!doneRecord && !skipped) continue;

    const plannedSeconds = Math.max(60, Math.round(Number(step.est_minutes ?? 1) * 60));
    const secondsSpent = doneRecord ? Math.max(0, Math.round(doneRecord.durationSeconds ?? 0)) : 0;
    const ratio = plannedSeconds > 0 ? Math.min(1, secondsSpent / plannedSeconds) : 0;
    const quality = doneRecord ? Math.min(1, 0.4 + 0.6 * ratio) : 0;

    try {
      await supabase
        .from("session_ingredients")
        .update({
          completed: Boolean(doneRecord),
          seconds_spent: secondsSpent,
          quality,
        })
        .eq("session_id", sessionId)
        .eq("ingredient_id", ingredientId);
    } catch (e) {
      console.warn("[unifiedSessionCompletion] ingredient outcome failed:", e);
    }
  }
}

export async function completeUnifiedSession(input: UnifiedCompletionInput): Promise<UnifiedCompletionResult> {
  const { userId, sessionId, plan, completedSteps, skippedSteps, totalSeconds, gate } = input;
  
  // Check if already completed
  const { data: existing } = await supabase
    .from("sessions")
    .select("status")
    .eq("id", sessionId)
    .maybeSingle();
  
  if (existing?.status === "completed") {
    return {
      ok: true,
      sessionId,
      completedStepCount: completedSteps.length,
      durationMs: totalSeconds * 1000,
      loopsTouched: [],
      karmaEarned: 0,
      shiftSummary: "Session was already completed.",
      nextTeaser: "",
      vLevelDelta: 0,
      dimensionNudges: [],
      alreadyCompleted: true,
      qualityScore: 0,
      primaryPractice: null,
    };
  }
  
  const completedStepCount = completedSteps.length;
  const durationMs = totalSeconds * 1000;
  
  const [
    karmaComputed,
    loopsTouched,
    dimensionNudges,
    shiftSummary,
    nextTeaser,
    qualityScore,
    primaryPractice,
  ] = await Promise.all([
    computeKarmaEarned(completedSteps, totalSeconds),
    computeLoopsTouched(plan, completedSteps),
    computeDimensionNudges(plan, completedSteps),
    computeShiftSummary(plan, completedSteps, totalSeconds),
    computeNextTeaser(plan, await computeLoopsTouched(plan, completedSteps), 0),
    computeQualityScore(completedSteps, skippedSteps, totalSeconds, plan),
    computePrimaryPractice(plan, completedSteps),
  ]);
  
  // Update session as completed. Never wipe the stored plan: the agenda,
  // provenance and resume/analytics all read it back from `summary`.
  let mergedSummary: string | null = plan
    ? JSON.stringify({ ...plan, completedSteps, skippedSteps })
    : null;
  if (!mergedSummary) {
    const { data: row } = await supabase
      .from("sessions")
      .select("summary")
      .eq("id", sessionId)
      .maybeSingle();
    let prev: Record<string, unknown> = {};
    try {
      prev = JSON.parse(row?.summary || "{}");
    } catch { /* keep empty */ }
    mergedSummary = JSON.stringify({ ...prev, completedSteps, skippedSteps });
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_seconds: totalSeconds,
      summary: mergedSummary,
    })
    .eq("id", sessionId);
  
  if (updateError) {
    console.error("[unifiedSessionCompletion] Failed to update session:", updateError);
  }

  try {
    await recordIngredientOutcomes({ sessionId, plan, completedSteps, skippedSteps });
  } catch (e) {
    console.warn("[unifiedSessionCompletion] ingredient outcomes skipped:", e);
  }

  // The sitting changed today's completions, so the cached context is stale.
  try {
    await supabase.from("user_state_snapshot").delete().eq("user_id", userId);
  } catch {
    /* best-effort */
  }
  
  // ── Karma ─────────────────────────────────────────────────────────────
  // Karma lives in `user_karma` (owned by the award_karma RPC). The previous
  // implementation read `balance_paise` from an error object and wrote karma
  // into `user_credits`, which reset the user's paid credit balance to the
  // karma value on every completed session.
  let karmaEarned = karmaComputed;
  if (userId) {
    const weight = Math.min(1.5, Math.max(0.5, (Number(qualityScore) || 50) / 50));
    const awardRpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
    const { data: awardData, error: awardError } = await awardRpc("award_karma", {
      p_source: "session_complete",
      p_base: 25,
      p_weight: weight,
      p_metadata: {
        session_id: sessionId,
        gate,
        steps: completedStepCount,
        seconds: totalSeconds,
      },
    });
    if (!awardError) {
      const awarded = Number((awardData as { awarded?: number } | null)?.awarded);
      if (Number.isFinite(awarded) && awarded > 0) karmaEarned = awarded;
    } else {
      console.warn("[unifiedSessionCompletion] award_karma failed:", awardError.message);
    }
  }

  // ── Day gate record ───────────────────────────────────────────────────
  // The guided session shell used to leave `user_daily_gates` untouched, so
  // sessions started from the Home orb never completed a gate. Mirror what
  // Guide's completeGate does, keyed to the local day.
  if (userId && GATE_KEYS.includes(gate)) {
    const gateUpdates: Record<string, unknown> = {
      [`${gate}_done`]: true,
      [`${gate}_at`]: new Date().toISOString(),
    };
    if (gate === "night") {
      const hour = new Date().getHours();
      gateUpdates.night_adapted = hour >= 21 || hour < 5;
    }
    const { error: gateError } = await supabase
      .from("user_daily_gates")
      .upsert(
        {
          user_id: userId,
          gate_date: localDateKey(),
          ...gateUpdates,
        },
        { onConflict: "user_id,gate_date" },
      );
    if (gateError) {
      console.warn("[unifiedSessionCompletion] gate record failed:", gateError.message);
    }
  }

  // Let the server-side engine absorb the outcome (V-level, dimensions,
  // practice levels). Fire-and-forget: completion must never wait on it.
  void supabase.functions
    .invoke("consciousness-engine", {
      body: {
        action: "session_completed",
        sessionId,
        metadata: {
          source: "generative",
          stepKinds: completedSteps.map((s) => s.kind),
          totalSeconds,
        },
      },
    })
    .catch(() => { /* non-fatal */ });

  // Correlate outcome for consciousness fingerprint & auto-recalibration
  await correlateSessionOutcome(
    userId,
    sessionId,
    plan,
    completedSteps,
    skippedSteps,
    qualityScore,
    loopsTouched,
    dimensionNudges,
    undefined, // moodBefore - would need to track
    undefined, // moodAfter
    undefined, // energyBefore
    undefined, // energyAfter
    input.spineId ?? null,
  );

  return {
    ok: true,
    sessionId,
    completedStepCount,
    durationMs,
    loopsTouched,
    karmaEarned,
    shiftSummary,
    nextTeaser,
    vLevelDelta: 0,
    dimensionNudges,
    alreadyCompleted: false,
    qualityScore,
    primaryPractice,
  };
}

// Correlate session outcome for consciousness fingerprint & auto-recalibration
async function correlateSessionOutcome(
  userId: string,
  sessionId: string,
  plan: SessionPlan | null,
  completedSteps: CompletedStepRecord[],
  skippedSteps: CompletedStepRecord[] | undefined,
  qualityScore: number,
  loopsTouched: string[],
  dimensionNudges: DimensionNudge[],
  moodBefore?: string,
  moodAfter?: string,
  energyBefore?: string,
  energyAfter?: string,
  spineId?: string | null,
) {
  try {
    await supabase.functions.invoke("correlate-session-outcome", {
      body: {
        sessionId,
        userId,
        spineId: spineId ?? null,
        qualityScore: qualityScore / 100, // normalize to 0-1
        loopsTouched: loopsTouched
          .filter((ref) => ref.startsWith("loop:"))
          .map((ref) => ref.slice("loop:".length)),
        dimensionNudges: Object.fromEntries(dimensionNudges.map(n => [n.id, n.delta])),
        vlevelDelta: 0, // Would compute from before/after V-Level
        moodBefore,
        moodAfter,
        energyBefore,
        energyAfter,
        breakthroughDetected: qualityScore >= 90,
        regressionDetected: qualityScore < 30,
      },
    });
  } catch (e) {
    console.warn("[correlateSessionOutcome] Failed:", e);
  }
}