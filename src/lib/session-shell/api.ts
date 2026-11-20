import { supabase } from "@/lib/supabase";
import { triggerInsufficientCredits } from "@/lib/handleCreditError";
import { type SessionPlan, type CompletedStepRecord, type SessionCompleteResult, type SessionStep, type StepKind } from "./types";
import { completeUnifiedSession } from "@/lib/unifiedSessionCompletion";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { isOnline, type BrainDepth } from "@/lib/session/brain";
import { flushCompletionQueue } from "@/lib/session/offlineQueue";
import type { Prescription, SuitabilityInput } from "@/lib/prescription";
import { recordSessionToHumanModel } from "@/lib/humanModel/ledger";
import {
  buildBankerPlan,
  normalizeContractStep,
  validateContractPlan,
  type ContractPlan,
} from "@/supabase/_shared/session-contract";

/** Depth asks the server for a richer sitting; the server meters credits. */

/** 6th-axis decision from `needEngine`, kept structurally small for the wire. */
export interface SessionNeedHint {
  concept: string;
  label?: string;
  intent: string;
  familiarity: number;
  minutes?: number;
  why?: string;
  evidence?: string[];
}

/**
 * The deterministic composer emits ingredient kinds (`knowledge`,
 * `micro_action`), while the shell speaks in step kinds. Normalize both so
 * icons, master attribution and widgets line up for new AND stored plans.
 */
const KIND_ALIASES: Record<string, StepKind> = {
  knowledge: "wisdom-read",
  micro_action: "micro-act",
  microact: "micro-act",
  "micro-action": "micro-act",
  breathing: "breathwork",
  write: "journal",
  reading: "wisdom-read",
};

function normalizeKind(kind: string | undefined): StepKind {
  const k = String(kind || "").trim().toLowerCase();
  return (KIND_ALIASES[k] as StepKind) || (k as StepKind);
}

function normalizePlan(plan: SessionPlan): SessionPlan {
  return {
    ...plan,
    steps: (plan.steps || []).map((s) => {
      const normalized = normalizeContractStep(s as never);
      return {
        ...normalized,
        kind: normalizeKind(s.kind),
        est_minutes:
          Number(normalized.est_minutes) ||
          Math.max(1, Math.round((Number(normalized.durationSeconds) || 60) / 60)),
      };
    }),
  };
}

/**
 * Contract guard. Validation is telemetry, not a veto: a plan that breaks the
 * behavioural contract is still the engine's plan, so the shell shows it
 * instead of silently swapping in authored filler.
 */
function minimalSafeSteps(budgetMin: number, gate?: string): SessionStep[] {
  // Never ship a title-only two-step sitting. The banker plan is authored,
  // contract-compliant content (scripts, params, durations) and fits the budget.
  const banker = buildBankerPlan({ budgetMin, gate: gate ?? "morning" });
  return banker.steps.map((s) => ({
    kind: normalizeKind(s.kind),
    title: s.title,
    script: s.script,
    prompt: s.prompt,
    params: s.params,
    durationSeconds: s.durationSeconds,
    est_minutes: Math.max(1, s.est_minutes ?? 1),
    whyForYou: s.whyForYou,
    signalRef: s.signalRef,
    optional: s.optional,
    keystone: s.keystone,
  }));
}

/**
 * The contract is a veto, not a warning. An invalid plan gets one repair pass;
 * if nothing usable survives, a minimal safe sitting is used instead of
 * shipping a broken one.
 */
function guardPlan(plan: SessionPlan, budgetMin: number, gate?: string): { plan: SessionPlan; quality: number; errors: string[] } {
  const normalized = normalizePlan(plan);
  const checked = validateContractPlan(normalized as unknown as ContractPlan, { budgetMin });
  let steps = checked.plan.steps as unknown as SessionStep[];
  let repaired = false;
  let vetoed = false;

  if (!checked.ok) {
    const valid = steps.filter(
      (s) => typeof s.title === "string" && s.title.trim().length > 0 && (s.est_minutes ?? 0) > 0,
    );
    if (valid.length > 0 && valid.length !== steps.length) {
      steps = valid;
      repaired = true;
    }
  }

  if (steps.length === 0) {
    vetoed = true;
    steps = minimalSafeSteps(budgetMin, gate);
  }

  if (vetoed || repaired) {
    console.warn("[session] plan contract veto:", {
      vetoed,
      repaired,
      errors: checked.errors.slice(0, 5).map((e) => e.code),
    });
  }

  return {
    plan: {
      ...normalized,
      steps,
      _meta: {
        ...(normalized._meta ?? {}),
        contractVetoed: vetoed,
        contractRepaired: repaired,
      },
    },
    quality: checked.quality.score,
    errors: checked.errors.map((e) => e.message),
  };
}

/** "0h ago" reads like a bug. Speak in human time instead. */
function relativeSittingAge(hoursAgo: number): string {
  if (hoursAgo < 1) return "moments ago";
  if (hoursAgo < 6) return `${Math.round(hoursAgo)}h ago`;
  if (hoursAgo < 24) return "earlier today";
  if (hoursAgo < 48) return "yesterday";
  return `${Math.round(hoursAgo / 24)}d ago`;
}

function humanizeArchetype(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function persistActiveSession(args: {
  sessionId: string;
  userId: string;
  plan: SessionPlan;
  gate: string;
  themeId?: string | null;
}): Promise<string> {
  // The orchestrator/fallback composer can hand back a non-UUID placeholder
  // (e.g. `fallback_<timestamp>`). `sessions.id` is a UUID column, so coerce
  // it here and return the id actually persisted.
  const sessionId = UUID_RE.test(args.sessionId) ? args.sessionId : crypto.randomUUID();
  let themeId = args.themeId && UUID_RE.test(args.themeId) ? args.themeId : null;
  if (themeId) {
    const { data: themeRow } = await supabase
      .from("daily_themes")
      .select("id")
      .eq("id", themeId)
      .maybeSingle();
    if (!themeRow) themeId = null;
  }

  const { error } = await supabase
    .from("sessions")
    .insert({
      id: sessionId,
      user_id: args.userId,
      type: "generative",
      time_slot: args.gate,
      theme_id: themeId,
      status: "active",
      summary: JSON.stringify(args.plan),
    });

  if (error) throw new Error(error.message);

  // Defensive: a race between two devices must not leave two actives behind.
  try {
    await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("user_id", args.userId)
      .eq("status", "active")
      .neq("id", sessionId);
  } catch { /* best-effort */ }

  // Record what the composer proposed, so completion can write outcomes back.
  // Without these rows the learning loop has nothing to update.
  try {
    const rows = args.plan.steps
      .map((step, index) => {
        const p = (step.params ?? {}) as Record<string, unknown>;
        const ingredientId = typeof p.ingredientId === "string"
          ? p.ingredientId
          : `${step.kind}:${step.title ?? `step-${index}`}`;
        return {
          user_id: args.userId,
          session_id: sessionId,
          ingredient_id: ingredientId,
          ingredient_kind: step.kind,
          archetype_id: typeof p.archetypeId === "string"
            ? p.archetypeId
            : (args.plan._meta?.archetype ?? null),
          slot_role: typeof p.slotRole === "string" ? p.slotRole : null,
          minutes: Math.max(1, Math.round(step.est_minutes ?? 1)),
          reason: step.whyForYou ?? null,
        };
      })
      .filter((r) => Boolean(r.ingredient_id));

    if (rows.length > 0) {
      await supabase
        .from("session_ingredients")
        .upsert(rows, { onConflict: "session_id,ingredient_id" });
    }
  } catch (e) {
    console.warn("[session] could not record proposed ingredients:", e);
  }

  return sessionId;
}

/** Calls the server composer; the in-app engine is the offline fallback. */
export async function startGenerativeSession(args: {
  intent?: string;
  slot?: string;
  themeId?: string | null;
  /** minutes user is willing to spend right now */
  timeBudgetMin?: number;
  /** user-reported energy level */
  energy?: "low" | "medium" | "high";
  /** client local gate so the server can align to the user's clock, not server clock */
  gate?: "morning" | "midday" | "evening" | "night";
  /**
   * 6th-axis decision from `needEngine`. The server locks the intent and
   * concept; it may not override "this person has never met this".
   */
  need?: SessionNeedHint;
  /** Safety + dose + arc + horizon. Server decides these when omitted. */
  prescription?: Prescription;
  /** Body/state facts the server needs to decide suitability itself. */
  suitability?: SuitabilityInput;
  /**
   * Explicit resume only. A fresh sitting always composes a fresh plan Ã¢â‚¬â€ the
   * old "reuse anything under 3h" path silently replayed the same steps with a
   * new time budget and gate.
   */
  resumeActive?: boolean;
  /**
   * `deep` asks the server composer for a richer paid sitting. Omitted means
   * the standard server sitting. In both cases the session is composed online;
   * if composition fails, no session is created and the caller shows Retry.
   */
  depth?: BrainDepth;
}): Promise<{ sessionId: string; plan: SessionPlan }> {
  // Any sittings that completed offline land before a new one begins.
  void flushCompletionQueue();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // One active sitting per user. Reuse ONLY on an explicit resume request.
  const { data: existingActive } = await supabase
    .from("sessions")
    .select("id, summary, started_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingActive) {
    if (args.resumeActive) {
      try {
        const existingPlan = normalizePlan(JSON.parse(existingActive.summary || "{}") as SessionPlan);
        if (existingPlan?.steps?.length) {
          return { sessionId: existingActive.id, plan: existingPlan };
        }
      } catch { /* malformed - abandon below */ }
    }
    await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", existingActive.id);
  }

  const gate = args.gate || getCurrentTimeSlot();

  // Composition lives on the server. Offline is a hard stop: no session is
  // composed locally, and the caller shows a retry toast.
  if (!isOnline()) {
    throw new Error("session_compose_failed: offline");
  }

  // The server composer is the only composer. There is no local session:
  // if composition fails, nothing is started and the caller shows a retry
  // toast. A silently different sitting is worse than no sitting.
  let serverComposerError: string | null = null;
  try {
    const { data, error } = await supabase.functions.invoke("compose-session-v3", {
      body: {
        // Let the server fall back to the user's saved Session Personalization
        // duration/energy when the caller did not pass an explicit budget.
        timeBudgetMin: args.timeBudgetMin,
        energy: args.energy,
        gate,
        intent: args.intent,
        themeId: args.themeId ?? null,
        need: args.need ?? null,
        prescription: args.prescription ?? null,
      },
    });
    if (error) throw error;
    if (data?.ok && data?.plan?.steps?.length) {
      const meta: any = data.meta || {};
      const sessionId = String(data.spineId || data.plan.id);
      const loopName = meta.namedLoops?.[0]?.name;
      const lastArch = data.memoryCallback?.archetype;
      const hoursAgo = data.memoryCallback?.hoursAgo;
      const built: SessionPlan = normalizePlan({
        id: sessionId,
        intent: data.plan.intent,
        intro: data.plan.intro,
        steps: data.plan.steps,
        _meta: {
          composedBy: "compose-session-v3",
          languageRefinedBy: "ai",
          spineId: sessionId,
          prescription: (data.prescription ?? args.prescription) as Prescription | undefined,
          need: data.need ?? args.need ?? null,
          safety: data.safety ?? null,
          invocation: data.invocation ?? null,
          gateLine: data.gateLine ?? null,
          sittingRoman: data.sittingRoman ?? null,
          gateAccent: data.gateAccent ?? null,
          brainMode: "cloud",
          brainReason: args.depth === "deep" ? "Deeper sitting requested" : "Server composer",
          archetype: data.council?.archetype,
          archetypeReason: data.council?.reason,
          toneWords: ["ai-composed", meta.aiMode || "fast"],
          whyThisSession:
            lastArch && typeof hoursAgo === "number"
              ? `Continuing from your ${humanizeArchetype(lastArch)} session, ${relativeSittingAge(hoursAgo)}`
              : loopName
                ? `Working on your ${loopName} loop`
                : `V-Level ${Number(meta.vLevelStart ?? 0).toFixed(1)}, ${gate} gate`,
          leadVoice: meta.leadVoice ?? data.council?.lead,
          leadMaster: meta.leadMaster ?? null,
          primaryLoopId: meta.namedLoops?.[0]?.id ?? null,
          namedLoops: meta.namedLoops ?? [],
          starvedDimension: meta.starvedDimension ?? null,
          chakraFocus: meta.chakraFocus ?? data.chakraFocus ?? null,
          practiceLevels: meta.practiceLevels ?? null,
          stage: null,
          memoryInjected: !!meta.memoryInjected,
          hardwareUsed: [],
          vLevelStart: Number.isFinite(Number(meta.vLevelStart)) ? Number(meta.vLevelStart) : null,
          dimensionBandsStart: meta.dimensionBandsStart ?? null,
          council: data.council
            ? {
                head: data.council.head ?? null,
                heart: data.council.heart ?? null,
                gut: data.council.gut ?? null,
                lead: data.council.lead ?? null,
                archetype: data.council.archetype ?? null,
                reason: data.council.reason ?? null,
              }
            : null,
          contentQuality: Number.isFinite(Number(meta.contentQuality)) ? Number(meta.contentQuality) : null,
          provenance: {
            vLevel: Number.isFinite(Number(meta.vLevelStart)) ? Number(meta.vLevelStart) : null,
            stage: null,
            guru: meta.leadMaster ?? null,
            memoryInjected: !!meta.memoryInjected,
            hardwareSignals: false,
          },
        },
      });

      // Contract score is telemetry Ã¢â‚¬â€ the composer's plan still ships.
      const guard = guardPlan(built, args.timeBudgetMin ?? 8, gate);
      const plan = guard.plan;
      if (plan._meta) {
        plan._meta.contentQuality = guard.quality;
      }
      if (guard.errors.length) {
        console.warn("[session] composer plan below contract quality:", guard.errors.slice(0, 5));
      }
      if (plan.steps.length) {
        await persistActiveSession({ sessionId, userId: user.id, plan, gate, themeId: args.themeId });
        return { sessionId, plan };
      }
    }
    // Reached only when the function answered without a usable plan.
    serverComposerError = String(data?.error || "compose-session-v3 returned no plan");
    console.error("[session] composer returned no plan - no session composed:", {
      event: "session_compose_failed",
      source: "compose-session-v3",
      message: serverComposerError,
    });
    throw new Error(`session_compose_failed: ${serverComposerError}`);
  } catch (e) {
    const errorContext = (e as { context?: { status?: number; json?: () => Promise<unknown> } })?.context;
    const status = errorContext?.status ?? (e as { status?: number })?.status;
    // The edge function puts the real cause in `{ error }`. Without this the
    // only visible text is "Edge Function returned a non-2xx status code".
    let bodyMessage = "";
    if (typeof errorContext?.json === "function") {
      try {
        const body = await errorContext.json();
        bodyMessage = String((body as { error?: unknown })?.error ?? "");
      } catch { /* non-JSON error body */ }
    }
    const message = bodyMessage || String((e as Error)?.message || "");
    if (status === 402 || /insufficient|402|credit/i.test(message)) {
      triggerInsufficientCredits();
      throw new Error("insufficient_credits");
    }
    if (message.startsWith("session_compose_failed")) throw e;
    serverComposerError = message || `HTTP ${status ?? "error"}`;
    console.error("[session] composer failed - no session composed:", {
      event: "session_compose_failed",
      source: "compose-session-v3",
      status: status ?? null,
      message: serverComposerError,
    }, e);
    throw new Error(`session_compose_failed: ${serverComposerError}`);
  }
}

/** Creates a session with a pre-composed plan (for programs). */
export async function createSessionWithPlan(plan: SessionPlan): Promise<{ sessionId: string }> {
  const { v4: uuidv4 } = await import("uuid");
  const sessionId = uuidv4();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("sessions")
    .insert({
      id: sessionId,
      status: "active",
      summary: JSON.stringify(plan),
      user_id: user?.id,
      created_at: new Date().toISOString(),
    });
  if (error) throw error;
  return { sessionId };
}

/** Hydrates an existing session from the DB row. */
export async function loadGenerativeSession(
  sessionId: string,
): Promise<{ plan: SessionPlan; status: string } | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, status, summary")
    .eq("id", sessionId)
    .maybeSingle();
  if (error || !data) return null;
  try {
    const plan = JSON.parse(data.summary || "{}") as SessionPlan;
    if (!plan?.steps?.length) return null;
    return { plan: normalizePlan(plan), status: data.status };
  } catch {
    return null;
  }
}

/** Closes a generative session and returns the completion summary. */
export async function completeGenerativeSession(args: {
  sessionId: string;
  completedSteps: CompletedStepRecord[];
  skippedSteps?: CompletedStepRecord[];
  totalSeconds: number;
  /** The plan being completed Ã¢â‚¬â€ used to attribute outcomes to ingredients. */
  plan?: SessionPlan | null;
}): Promise<SessionCompleteResult> {
  // A spine can exist for any composed session, not only the edge composer's.
  // The plan carries its spine id; older plans fall back to the column lookup,
  // then to the spine whose id equals the session id.
  let spineId: string | null = args.plan?._meta?.spineId ?? null;
  if (!spineId) {
    try {
      const { data: spineRow } = await supabase
        .from("session_spine")
        .select("id")
        .eq("session_id", args.sessionId)
        .maybeSingle();
      spineId = (spineRow as { id?: string } | null)?.id ?? null;
    } catch {
      spineId = null;
    }
  }
  if (!spineId && UUID_RE.test(args.sessionId)) {
    try {
      const { data: spineRow } = await supabase
        .from("session_spine")
        .select("id")
        .eq("id", args.sessionId)
        .maybeSingle();
      spineId = (spineRow as { id?: string } | null)?.id ?? null;
    } catch { /* keep null */ }
  }

  // Completion is server-owned: the edge function scores evidence, writes
  // karma/streak/moments/arc, and closes the row. The local handler below is
  // only the offline fallback — it never composes anything.
  try {
    const { data, error } = await supabase.functions.invoke("session-complete", {
      body: {
        sessionId: args.sessionId,
        completedSteps: args.completedSteps,
        skippedSteps: args.skippedSteps ?? [],
        totalSeconds: args.totalSeconds,
      },
    });
    if (!error && data?.ok) {
      const userId = (await supabase.auth.getUser()).data.user?.id || "";
      if (spineId) {
        const journalRecord = [...args.completedSteps]
          .reverse()
          .find((s) => s.kind === "journal" || s.kind === "reflection");
        const journalText = (journalRecord?.payload as { data?: { text?: string } } | undefined)?.data?.text;
        const stepCompletions = [...args.completedSteps, ...(args.skippedSteps || [])]
          .filter((s) => typeof s.stepIndex === "number")
          .map((s) => ({
            index: s.stepIndex as number,
            completed: !(s.payload as { skipped?: boolean } | undefined)?.skipped,
            timeSpentSec: s.durationSeconds,
          }));
        void scoreSessionSpine({
          spineId,
          finalUserSentence: typeof journalText === "string" ? journalText.slice(0, 500) : undefined,
          stepCompletions,
          durationSec: args.totalSeconds,
        });
      }
      if (userId) {
        void recordSessionToHumanModel({
          userId,
          concept: args.plan?._meta?.prescription?.concept ?? data.primaryPractice,
          completed: true,
          qualityScore: data.qualityScore,
        }).catch(() => { /* ledger is best-effort */ });
      }
      return {
        ok: true,
        sessionId: args.sessionId,
        completedStepCount: Number(data.completedStepCount ?? args.completedSteps.length),
        durationMs: Number(data.durationMs ?? args.totalSeconds * 1000),
        loopsTouched: data.loopsTouched ?? [],
        karmaEarned: Number(data.karmaEarned ?? 0),
        shiftSummary: data.shiftSummary ?? null,
        nextTeaser: data.nextTeaser ?? null,
        vLevelDelta: data.vLevelDelta ?? null,
        dimensionNudges: data.dimensionNudges ?? [],
        alreadyCompleted: Boolean(data.alreadyCompleted),
        qualityScore: Number(data.qualityScore ?? 0),
        primaryPractice: data.primaryPractice ?? null,
      };
    }
    if (error) console.warn("[session] server completion unavailable, using local fallback:", error);
  } catch (e) {
    console.warn("[session] server completion failed, using local fallback:", e);
  }

  // Use unified completion handler
  const userId = (await supabase.auth.getUser()).data.user?.id || "";
  const result = await completeUnifiedSession({
    userId,
    sessionId: args.sessionId,
    plan: args.plan,
    completedSteps: args.completedSteps,
    skippedSteps: args.skippedSteps,
    totalSeconds: args.totalSeconds,
    gate: getCurrentTimeSlot(),
    spineId,
  });

  if (!result.ok) {
    throw new Error("Failed to complete session");
  }

  // Score the spine so future sittings can learn from this one. Best-effort
  // and never blocks the completion screen.
  if (spineId) {
    const journalRecord = [...args.completedSteps]
      .reverse()
      .find((s) => s.kind === "journal" || s.kind === "reflection");
    const journalText = (journalRecord?.payload as { data?: { text?: string } } | undefined)?.data?.text;
    const stepCompletions = [...args.completedSteps, ...(args.skippedSteps || [])]
      .filter((s) => typeof s.stepIndex === "number")
      .map((s) => ({
        index: s.stepIndex as number,
        completed: !(s.payload as { skipped?: boolean } | undefined)?.skipped,
        timeSpentSec: s.durationSeconds,
      }));
    void scoreSessionSpine({
      spineId,
      finalUserSentence: typeof journalText === "string" ? journalText.slice(0, 500) : undefined,
      stepCompletions,
      durationSec: args.totalSeconds,
    });
  }

  // Close the loop: the sitting moves the 12-layer model, not just the streak.
  if (userId) {
    void recordSessionToHumanModel({
      userId,
      concept: args.plan?._meta?.prescription?.concept ?? result.primaryPractice,
      completed: true,
      qualityScore: result.qualityScore,
    }).catch(() => { /* ledger is best-effort */ });
  }

  return {
    ok: true,
    sessionId: result.sessionId,
    completedStepCount: result.completedStepCount,
    durationMs: result.durationMs,
    loopsTouched: result.loopsTouched,
    karmaEarned: result.karmaEarned,
    shiftSummary: result.shiftSummary,
    nextTeaser: result.nextTeaser,
    vLevelDelta: result.vLevelDelta,
    dimensionNudges: result.dimensionNudges,
    alreadyCompleted: result.alreadyCompleted,
    qualityScore: result.qualityScore,
    primaryPractice: result.primaryPractice,
  };
}

/**
 * Sankalpa T5 Ã¢â‚¬â€ score a session_spine after the user closes the session.
 * `spineId` is what compose-session-v3 returned as sessionId when the flag is on.
 * Safe to call fire-and-forget; logs and swallows failures so the UI never breaks.
 */
export async function scoreSessionSpine(args: {
  spineId: string;
  finalUserSentence?: string;
  stepCompletions?: Array<{ index: number; completed?: boolean; timeSpentSec?: number; rating?: number }>;
  durationSec?: number;
  mood?: string;
}): Promise<{ qualityScore: number; summary?: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("score-session-spine", { body: args });
    if (error) { console.warn("[sankalpa-t5] score failed:", error); return null; }
    return { qualityScore: Number(data?.qualityScore ?? 0), summary: data?.summary };
  } catch (e) {
    console.warn("[sankalpa-t5] score threw:", e);
    return null;
  }
}
