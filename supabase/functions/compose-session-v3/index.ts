// ============================================================
// compose-session-v3 Ã¢â‚¬â€ SANKALPA ENGINE (T1 foundation)
// ------------------------------------------------------------
// Parallel reader  Ã¢â€ â€™  3-LLM Council (fast)  Ã¢â€ â€™  Composer (main)
//                  Ã¢â€ â€™  Safety + write session_spine
//
// Honors user.identity.aiMode ('fast' Groq | 'premium' OpenAI 5.5)
// for EVERY AI call inside this function via aiGatewayFetch.
//
// Returns: { ok, sessionId?, plan: {id, intent, intro, steps[]}, spineId, council, whyForYouCount }
// Plan.steps[i].whyForYou is always populated.
// Does NOT write to public.sessions yet Ã¢â‚¬â€ old generate-session-agenda
// stays the production path until the client opts in (feature flag).
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetch, aiGatewayFetchWithLang, type AiMode } from "../_shared/ai-config.ts";
import type { Energy, Gate } from "../_shared/user-context.ts";
import { buildPracticeMatrixSignal } from "../_shared/practiceMatrix.ts";
import { detectBlockedChakra } from "../_shared/chakraEngine.ts";
import { loopName } from "../_shared/loopMap.ts";
import { embedText } from "../_shared/long-term-memory.ts";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";
import { assessCrisis } from "../_shared/crisis.ts";
import {
  fitPlanToBudget,
  normalizeContractStep,
  normalizePlan as normalizeContractPlan,
  stepText,
  validateContractPlan,
  type ContractPlan,
} from "../_shared/session-contract.ts";
import { readNeedDecision } from "../_shared/needEngine.ts";
import {
  prescribe,
  type Prescription,
} from "../_shared/prescription.ts";
import { getSessionInvocation } from "../_shared/sessionNaming.ts";
import {
  deriveSessionPersonalization,
  filterExcludedPractices,
  isPersonalized,
  loadSessionPersonalization,
  personalizationContextBlock,
  personalizationDirectives,
  type SessionPersonalization,
} from "../_shared/sessionConfig.ts";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;

type StepKind =
  | "wisdom-read" | "breathwork" | "journal" | "micro-act"
  | "reflection" | "guide-chat" | "practice" | "temple-chat" | "witness";

interface Step {
  kind: StepKind;
  title: string;
  /** 3Ã¢â‚¬â€œ5 beat instruction script (setup Ã¢â€ â€™ action Ã¢â€ â€™ what not to do Ã¢â€ â€™ stop). */
  script?: string[];
  prompt?: string;
  params?: Record<string, unknown>;
  est_minutes: number;
  durationSeconds?: number;
  whyForYou?: string;        // Ã¢â€ Â NEW (T1)
  signalRef?: string;        // which of the 16 signals justified this step
  keystone?: boolean;
}
interface Plan { id: string; intent: string; intro: string; steps: Step[]; }

// Ã¢â€â‚¬Ã¢â€â‚¬ 14 Archetypes with activation conditions (T2) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const ARCHETYPE_SPEC: Record<string, { tagline: string; activate: string }> = {
  "Settling":          { tagline: "Land the body before depth.",         activate: "energy=low OR gap_days>=2 OR first session of day" },
  "Confrontation":     { tagline: "Meet the thing you've been dodging.", activate: "silence_signal present OR contradiction detected" },
  "Reconciliation":    { tagline: "Make peace with a part of self.",     activate: "primary loop is relational/inner-critic" },
  "Shadow Mirror":     { tagline: "See what the ego won't show.",        activate: "bypass detected OR spiritual-ego pattern" },
  "Stuck-Loop Break":  { tagline: "Break the repeating pattern.",        activate: "same loop fired 3+ times in 7 days" },
  "Lineage Initiation":{ tagline: "Receive a transmission.",             activate: "milestone day (7/30/100/365) OR V-Level cross" },
  "Re-entry":          { tagline: "Return after absence.",               activate: "gap_days>=3" },
  "Celebration":       { tagline: "Honor the rise.",                     activate: "V-Level rising OR streak milestone" },
  "Dissolution":       { tagline: "Let the construct soften.",           activate: "high witness stability AND late gate" },
  "Witness Deepening": { tagline: "Stretch the witness muscle.",         activate: "witness practice active AND plateau" },
  "Inquiry Spiral":    { tagline: "Ask the question that hurts.",        activate: "Jnana path AND active inquiry loop" },
  "Devotional":        { tagline: "Open the heart wide.",                activate: "Bhakti path AND heart dimension starved" },
  "Karmic Action":     { tagline: "Translate insight to one act.",       activate: "contradiction OR body dimension starved" },
  "Dark Night Hold":   { tagline: "Just be held, no progress today.",    activate: "V-Level regression OR distress signal" },
};
const ARCHETYPES = Object.keys(ARCHETYPE_SPEC);

// Lineage masters per voice (T2)
const VOICE_LINEAGE: Record<"head" | "heart" | "gut", { path: string; masters: string[] }> = {
  head:  { path: "Jnana (knowledge)",        masters: ["Ramana Maharshi", "J. Krishnamurti", "Nisargadatta", "Adi Shankara"] },
  heart: { path: "Bhakti (devotion)",        masters: ["Rumi", "Meera", "Ramakrishna", "Hafiz"] },
  gut:   { path: "Karma/Raja (body+action)", masters: ["Adiyogi/Shiva", "Patanjali", "Buddha", "Lao Tzu"] },
};

const ALLOWED_KINDS: StepKind[] = [
  "wisdom-read","breathwork","journal","micro-act","reflection",
  "guide-chat","practice","temple-chat","witness",
];

/**
 * Hard constraint gate Ã¢â‚¬â€ never trust the LLM to respect the rules.
 *
 * The old gate deduped step kinds (which made "write at the open AND the close"
 * impossible) and only shrank durations. This one defers to the shared contract:
 * script depth, resolvable signals, bound params, per-kind durations, keystone
 * and the time budget in both directions.
 */
function enforcePlanConstraints(plan: Plan, timeBudgetMin: number): {
  plan: Plan;
  ok: boolean;
  quality: number;
  errors: string[];
  warnings: string[];
} {
  const raw: ContractPlan = {
    id: plan.id,
    intent: plan.intent,
    intro: plan.intro,
    steps: plan.steps.map((s) => normalizeContractStep(s as never)),
  };
  const checked = validateContractPlan(raw, { budgetMin: timeBudgetMin });
  const built: Plan = {
    id: plan.id,
    intent: checked.plan.intent,
    intro: checked.plan.intro,
    steps: checked.plan.steps as Step[],
  };
  return {
    plan: built,
    ok: checked.ok,
    quality: checked.quality.score,
    errors: checked.errors.map((e) => `${e.code}: ${e.message}`),
    warnings: checked.warnings.map((e) => `${e.code}: ${e.message}`),
  };
}

function safeJSON<T = unknown>(s: string | undefined | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]) as T; } catch { /**/ } }
    return null;
  }
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const t0 = Date.now();

const body = await req.json().catch(() => ({} as Record<string, unknown>));
const bodyBudget = Number(body.timeBudgetMin ?? 0);
let timeBudgetMin = bodyBudget > 0 ? bodyBudget : 0;
let energy = body.energy as Energy | undefined;
let gate   = body.gate as Gate | undefined;
const intent = (body.intent as string | undefined) ?? null;

// Live Studio settings win over stored ones (the studio previews before saving).
const livePersonalization = deriveSessionPersonalization(body.sessionConfig, "request");
let personalization: SessionPersonalization | null = isPersonalized(livePersonalization)
  ? livePersonalization
  : null;

type NeedHint = {
  concept?: string;
  label?: string;
  intent?: "orient" | "first_contact" | "train" | "integrate" | "hold";
  familiarity?: number;
  minutes?: number;
  why?: string;
  evidence?: string[];
};
let need = (body.need && typeof body.need === "object" ? body.need : null) as NeedHint | null;
let needFamiliarity =
  need && typeof need.familiarity === "number" ? Math.max(0, Math.min(1, need.familiarity)) : null;

type RxHint = {
  dose?: { minutes?: number; intensity?: string; teachRatio?: number };
  suitability?: {
    verdict?: "clear" | "adapt" | "rest_only" | "hold" | "refer";
    allowClosedEyes?: boolean;
    allowBreathRetention?: boolean;
    maxMinutes?: number;
    recommendedProtocol?: string;
  };
  arc?: { spiralLabel?: string; sessionNumber?: number; totalSessions?: number };
  oneStep?: boolean;
  nextPreview?: string;
  claims?: Array<{ id?: string; statement?: string }>;
};
let rx = (body.prescription && typeof body.prescription === "object" ? body.prescription : null) as RxHint | null;
let serverPrescription: Prescription | null = null;
  const auth   = req.headers.get("Authorization")!;

  // Why the AI layer produced nothing Ã¢â‚¬â€ surfaced in the 500 instead of a
  // generic "no usable plan" so the client log names the real cause.
  const aiFailures: string[] = [];
  const noteFailure = async (stage: string, res: Response | null, err?: unknown) => {
    let detail = "";
    if (res) {
      detail = await res.clone().text().catch(() => "");
      detail = `HTTP ${res.status} ${detail.slice(0, 300)}`;
    } else if (err) {
      detail = (err as Error)?.message?.slice(0, 300) ?? String(err).slice(0, 300);
    }
    aiFailures.push(`${stage}: ${detail || "unknown"}`);
  };

  // Work that happens after the plan is composed must still run once the
  // response is sent. A bare `void promise` is dropped when the worker returns,
  // which is why whisper rows never appeared. EdgeRuntime.waitUntil keeps the
  // isolate alive until the promise settles.
  const background = (p: Promise<unknown>) => {
    const guarded = p.catch(() => {});
    const edgeRuntime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
    if (typeof edgeRuntime?.waitUntil === "function") {
      edgeRuntime.waitUntil(guarded);
      return;
    }
    void guarded;
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Crisis gate (HIGHEST priority) Ã¢â‚¬â€ never compose for acute risk Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // This runs before the context fetch and before any model call, so a crisis
  // message costs nothing and can never receive a Confrontation / Shadow
  // Mirror sitting.
  const crisis = assessCrisis(intent);
  if (crisis.isCrisis) {
    try {
      await admin.from("crisis_events").insert({
        user_id: user?.id ?? null,
        surface: "compose-session-v3",
        severity: crisis.severity,
        matched: crisis.matched,
        action: "short_circuit",
      });
    } catch {
      /* telemetry must never block safety copy */
    }
    return successResponse({
      plan: {
        id: `crisis_${t0}`,
        intent: "Stay safe right now",
        intro:
          "We are stopping the practice here. What you said needs a person, not a session.",
        steps: [
          {
            kind: "reflection",
            title: "Reach a human now",
            script: [
              "Call someone you trust, or one of the lines below.",
              "Do not sit alone with this.",
              "If you are in immediate danger, contact emergency services or go to the nearest hospital.",
            ],
            durationSeconds: 120,
            est_minutes: 2,
            whyForYou: "You named something no practice should try to hold.",
            signalRef: "gate:crisis",
            keystone: true,
          },
        ],
      },
      sessionId: null,
      spineId: null,
      meta: { safety: "crisis", matched: crisis.matched },
    });
  }

  // ──── PERSONALIZATION LAYER ─────────────────────────────────────────
  // Read the user's saved Session Personalization. When every signal still
  // equals the engine defaults this is null and composition stays untouched.
  if (!personalization) personalization = await loadSessionPersonalization(admin, user.id);
  if (personalization) {
    if (!bodyBudget && personalization.durationMin) timeBudgetMin = personalization.durationMin;
    // Preferred gate is an explicit Settings choice, so it wins over the
    // auto-derived current slot. Energy only fills in when the caller is silent.
    if (personalization.gate) gate = personalization.gate as Gate;
    if (!energy && personalization.energy) energy = personalization.energy as Energy;
  }
  if (!timeBudgetMin) timeBudgetMin = 8;

  // ──── READ LAYER (parallel) ─────────────────────────────────────────Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // Use get-user-context edge function with memory injection
  const userContextRes = await fetch(`${SUPABASE_URL}/functions/v1/get-user-context`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": req.headers.get("Authorization")!,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({
      userId: user.id,
      timeBudgetMin,
      energy,
      gate,
      intent,
      includeMemory: true,
    }),
  });
  const userContextData = await userContextRes.json();
  if (!userContextData.ok) throw new Error("Failed to get user context");
  
  const userCtx = userContextData.context;
  const memBlock = userCtx.memoryBlock || "";
  
  const [prevSpineRes, whisperRes, themeRes, historyRes] = await Promise.all([
    // T4: previous session spine (memory-graph callback source)
    admin.from("session_spine")
      .select("id, archetype, lead_master, primary_loop_id, primary_dimension, chakra_focus, final_user_sentence, why_for_you, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    // T4: unconsumed future-self whisper from a prior session
    admin.from("future_self_whispers")
      .select("id, whisper, tone, created_at")
      .eq("user_id", user.id).is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }).limit(1).maybeSingle(),
    // T4: today's living theme (latest sequence)
    admin.from("daily_themes")
      .select("id, title, description, sub_angle, current_depth, max_depth, evolution_status, affirmation, sequence_no, theme_date")
      .eq("user_id", user.id)
      .order("theme_date", { ascending: false })
      .order("sequence_no", { ascending: false })
      .limit(1).maybeSingle(),
    // T5: archetype Ãƒâ€” lead-master quality history (last 30 scored sessions)
    admin.from("session_spine")
      .select("archetype, lead_master, quality_score, created_at")
      .eq("user_id", user.id)
      .not("quality_score", "is", null)
      .order("created_at", { ascending: false }).limit(30),
  ]);

  const prevSpine = prevSpineRes?.data ?? null;
  const whisper = whisperRes?.data ?? null;
  const theme = themeRes?.data ?? null;

    // Ã¢â€â‚¬Ã¢â€â‚¬ T5: adaptive history Ã¢â‚¬â€ which archetypes/voices resonate? Ã¢â€â‚¬Ã¢â€â‚¬
    const history = (historyRes?.data ?? []) as Array<{ archetype: string; lead_master: string | null; quality_score: number | null }>;
    const archStats = new Map<string, { n: number; sum: number }>();
    const voiceStats = new Map<string, { n: number; sum: number }>();
    for (const h of history) {
      const q = Number(h.quality_score ?? 0);
      const a = archStats.get(h.archetype) ?? { n: 0, sum: 0 };
      a.n++; a.sum += q; archStats.set(h.archetype, a);
      if (h.lead_master) {
        const v = voiceStats.get(h.lead_master) ?? { n: 0, sum: 0 };
        v.n++; v.sum += q; voiceStats.set(h.lead_master, v);
      }
    }
    const archAvg = [...archStats.entries()].map(([k, v]) => ({ k, avg: v.sum / Math.max(1, v.n), n: v.n }));
    const top = archAvg.filter(x => x.n >= 2).sort((a, b) => b.avg - a.avg).slice(0, 3);
    const bottom = archAvg.filter(x => x.n >= 2).sort((a, b) => a.avg - b.avg).slice(0, 2);
    const voiceAvg = [...voiceStats.entries()].map(([k, v]) => ({ k, avg: v.sum / Math.max(1, v.n), n: v.n }))
      .sort((a, b) => b.avg - a.avg);

    // Ã¢â€â‚¬Ã¢â€â‚¬ LEARNED POLICY: UCB1 multi-armed bandit over archetypes Ã¢â€â‚¬Ã¢â€â‚¬
    // reward = session_spine.quality_score (0..1). Unseen archetypes get an
    // optimistic prior so they are explored; seen ones trade mean vs. bonus.
    const scoredHistory = history.filter((h) => h.quality_score != null);
    const totalScored = scoredHistory.length;
    const globalMean = totalScored
      ? scoredHistory.reduce((s, h) => s + Number(h.quality_score), 0) / totalScored
      : 0.5;
    const explorePrior = Math.min(0.95, Math.max(globalMean, 0.7));
    const ucbFor = (key: string): number => {
      const st = archStats.get(key);
      if (!st || st.n === 0) return explorePrior; // optimistic Ã¢â€ â€™ explore unseen
      const mean = st.sum / st.n;
      return mean + Math.sqrt((2 * Math.log(Math.max(2, totalScored))) / st.n);
    };
    const ucbTable = ARCHETYPES
      .map((k) => {
        const st = archStats.get(k);
        return {
          k,
          ucb: ucbFor(k),
          n: st?.n ?? 0,
          mean: st && st.n > 0 ? st.sum / st.n : null,
        };
      })
      .sort((a, b) => b.ucb - a.ucb);

    const adaptiveBlock = history.length
      ? [
          `ADAPTIVE HISTORY (last ${history.length} scored sessions, global mean ${globalMean.toFixed(2)}):`,
          top.length    ? `  Resonates most: ${top.map(t => `${t.k} (${t.avg.toFixed(2)}, n=${t.n})`).join(", ")}` : "",
          bottom.length ? `  Resonates least: ${bottom.map(t => `${t.k} (${t.avg.toFixed(2)}, n=${t.n})`).join(", ")}` : "",
          voiceAvg.length ? `  Voice resonance: ${voiceAvg.slice(0, 3).map(v => `${v.k} (${v.avg.toFixed(2)})`).join(", ")}` : "",
          `  BANDIT (UCB1, higher = exploit): ${ucbTable.slice(0, 5).map(u => `${u.k} ${u.ucb.toFixed(2)}${u.n ? `/n${u.n}` : " (unseen)"}`).join(", ")}`,
          "  Use as a soft bias only Ã¢â‚¬â€ do NOT pick a high-resonance archetype if its activation rule does not fire.",
        ].filter(Boolean).join("\n")
      : "ADAPTIVE HISTORY: (none yet Ã¢â‚¬â€ no scored sessions)";



    const aiMode: AiMode = userCtx.identity.aiMode === "premium" ? "premium" : "fast";

    // Ã¢â€â‚¬Ã¢â€â‚¬ Personalization Engine (Living Threads) Ã¢â€â‚¬Ã¢â€â‚¬
        // Ã¢â€â‚¬Ã¢â€â‚¬ Personalization Engine (Living Threads) Ã¢â€â‚¬Ã¢â€â‚¬
    const primaryThread = userCtx.personalization?.primaryThread ?? null;
    const confirmedObs = (userCtx.personalization?.confirmedObservations ?? []).slice(0, 5);

    // Depth mode progression: arrive -> observe -> investigate -> experiment -> integrate
    let currentDepthMode = primaryThread?.depthMode ?? 'arrive';
    if (primaryThread) {
      const sessions = primaryThread.sessionsCount ?? 0;
      if (sessions >= 4) currentDepthMode = 'integrate';
      else if (sessions >= 3) currentDepthMode = 'experiment';
      else if (sessions >= 2) currentDepthMode = 'investigate';
      else if (sessions >= 1) currentDepthMode = 'observe';
      // Update thread if depth mode changed
      if (currentDepthMode !== primaryThread.depthMode) {
        await admin.from('open_threads').update({ depth_mode: currentDepthMode, updated_at: new Date().toISOString() }).eq('id', primaryThread.id).catch(() => {});
        primaryThread.depthMode = currentDepthMode;
      }
    }

    const signals = {
      vLevel: userCtx.spiritual.vLevelCurrent,
      journeyDay: userCtx.spiritual.journeyDay,
      chittaVritti: userCtx.spiritual.chittaVritti,
      dimensions: userCtx.dimensionsToday,
      dimensionBands: userCtx.spiritual.dimensionBands,
      activeLoops: userCtx.recentLoopIds.slice(0, 5),
      paths: userCtx.spiritual.yogaPathAffinity,
      witness: { stability: userCtx.spiritual.witnessStability, depth: userCtx.spiritual.witnessDepth },
      gate: gate ?? userCtx.now?.gate ?? "morning",
      energy: energy ?? userCtx.now?.energy ?? "medium",
      timeBudgetMin,
      gapDays: userCtx.behavior?.gapDays,
      primaryThread: primaryThread ? {
        id: primaryThread.id,
        question: primaryThread.question,
        depthMode: primaryThread.depthMode,
        sessionsCount: primaryThread.sessionsCount,
      } : null,
      confirmedObservations: confirmedObs.map(o => ({ id: o.id, observation: o.observation, threadId: o.threadId })),
    };
    const starvedDim = (() => {
      const d = signals.dimensions as Record<string, number> | null;
      if (!d) return null;
      const entries = Object.entries(d).filter(([k]) => k !== "total");
      if (!entries.length) return null;
      entries.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
      return entries[0]?.[0] ?? null;
    })();

    // Ã¢â€â‚¬Ã¢â€â‚¬ T3: Practice grammar + chakra + named loops Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const practiceRows = Object.entries(userCtx.practiceLevels || {}).map(
      ([practice_type, v]: [string, any]) => ({
        practice_type,
        current_level: v?.level ?? 0,
        sessions_at_level: v?.sessionsAtLevel ?? 0,
        emotional_healing: v?.emotionalHealing ?? 0,
        loop_dissolution: v?.loopDissolution ?? 0,
      }),
    );
    const matrix = buildPracticeMatrixSignal(practiceRows);

    const chakra = detectBlockedChakra({
      weakestDimension: (starvedDim as any) ?? null,
      topLoopId: signals.activeLoops[0] ?? null,
      stressedDomain: matrix.mostStressedDomain ?? null,
      samskaraChakras: null,
      bypassingRisk: 0,
    });

    const namedLoops = signals.activeLoops.map((id) => ({ id, name: loopName(id) }));
    const practiceLevelsCompact = Object.fromEntries(
      Object.entries(userCtx.practiceLevels || {}).map(([k, v]: [string, any]) => [k, v?.level ?? 0]),
    );
    (signals as any).practiceLevels = practiceLevelsCompact;
    (signals as any).namedLoops = namedLoops;
    (signals as any).chakraFocus = chakra.primary.id;

    // -- SERVER-AUTHORITATIVE NEED + PRESCRIPTION -----------------------
    // The client used to compute these and pass them in. Composition is now
    // server-owned: if the caller sends nothing, the server decides the door
    // and the dose itself. Client values are still honoured when present.
    if (!need) {
      try {
        const decision = await readNeedDecision(admin, user.id, {
          energy: (signals.energy as "low" | "medium" | "high") ?? "medium",
          timeBudgetMin,
        });
        need = {
          concept: decision.concept,
          label: decision.label,
          intent: decision.intent,
          familiarity: decision.familiarity,
          minutes: decision.shape.minutes,
          why: decision.why,
          evidence: decision.evidence,
        };
        needFamiliarity = decision.familiarity;
      } catch (e) {
        console.warn("[v3] server need engine failed:", (e as Error).message);
      }
    }

    if (!rx && need?.concept) {
      const conceptId = need.concept as string;
      try {
        serverPrescription = prescribe({
          need: {
            concept: conceptId,
            label: need.label ?? conceptId,
            intent: (need.intent ?? "train") as
              | "orient"
              | "first_contact"
              | "train"
              | "integrate"
              | "hold",
            familiarity: needFamiliarity ?? 0,
            why: need.why ?? "",
            evidence: need.evidence ?? [],
            ladder: null,
            entryLevel: 1,
          },
          suitability: (body.suitability && typeof body.suitability === "object"
            ? body.suitability
            : undefined) as never,
          capabilityLevel: Number(practiceLevelsCompact[need.concept] ?? 0),
          energy: (signals.energy as "low" | "medium" | "high") ?? "medium",
          timeBudgetMin,
          sessionNumber: Number(userCtx.foundation?.totalSessions ?? 0) + 1,
          completedSessions: Number(userCtx.foundation?.totalSessions ?? 0),
        });
        rx = {
          dose: {
            minutes: serverPrescription.dose.minutes,
            intensity: serverPrescription.dose.intensity,
            teachRatio: serverPrescription.dose.teachRatio,
          },
          suitability: {
            verdict: serverPrescription.suitability.verdict,
            allowClosedEyes: serverPrescription.suitability.allowClosedEyes,
            allowBreathRetention: serverPrescription.suitability.allowBreathRetention,
            maxMinutes: serverPrescription.suitability.maxMinutes,
            recommendedProtocol: serverPrescription.suitability.recommendedProtocol,
          },
          arc: {
            spiralLabel: serverPrescription.arc.spiralLabel,
            sessionNumber: serverPrescription.arc.sessionNumber,
            totalSessions: serverPrescription.arc.totalSessions,
          },
          oneStep: serverPrescription.oneStep,
          nextPreview: serverPrescription.nextPreview,
        };
      } catch (e) {
        console.warn("[v3] server prescription failed:", (e as Error).message);
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ COUNCIL LAYER (T2 Ã¢â‚¬â€ 3 parallel voices + synthesizer) Ã¢â€â‚¬Ã¢â€â‚¬
    const sharedSignalsBlock =
      `SIGNALS: ${JSON.stringify(signals)}\n` +
      `STARVED DIMENSION: ${starvedDim ?? "(none)"}\n` +
      `MEMORY:${memBlock || "(none)"}\n` +
      (primaryThread ? `LIVING THREAD (PRIMARY): "${primaryThread.question}" | depth_mode=${primaryThread.depthMode} | explored ${primaryThread.sessionsCount}x\n` : "") +
      (confirmedObs.length ? `CONFIRMED OBSERVATIONS:\n${confirmedObs.map((o,i)=>`  ${i+1}. ${o.observation}`).join("\n")}\n` : "") +
      `USER INTENT: ${intent || "(open)"}`;

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ COUNCIL (ONE call: three voices + synthesis) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    // Previously this was 3 voice calls + 1 synthesizer call, each carrying the
    // full signals + memory block. One call returns all six fields; the old
    // synthesizer below is kept only as a fallback when parsing fails.
    const councilMenu = Object.entries(ARCHETYPE_SPEC)
      .map(([name, s]) => `- ${name}: ${s.tagline}  [activates when: ${s.activate}]`).join("\n");

    async function councilCall(): Promise<{
      head: string; heart: string; gut: string;
      lead: "head" | "heart" | "gut"; archetype: string; reason: string;
    }> {
      const sys = [
        "You are the inner council AND its synthesizer for one user, right now. Do the whole job in one answer.",
        "Voices: each ONE sentence, <=24 words, second person 'you', no greeting, no advice list.",
        "- head: cut through seeking; name the thought-pattern. Precise, dry.",
        "- heart: name the wound or longing that wants to be held. Tender.",
        "- gut: name what the body or action wants. Concrete, grounded.",
        "Then pick ONE lead voice and ONE archetype from the menu using its activation rules.",
        "Do NOT pick 'Settling' unless its rule fires.",
        "If several activate, prefer the deeper need (Dark Night > Shadow Mirror > Confrontation > Stuck-Loop Break > Witness Deepening > Inquiry Spiral > Devotional > Karmic Action > Reconciliation > Lineage Initiation > Celebration > Re-entry > Dissolution > Settling).",
        "ARCHETYPE MENU:",
        councilMenu,
        'Return ONLY JSON: {"head":"...","heart":"...","gut":"...","lead":"head|heart|gut","archetype":"<exact name>","reason":"<=22 words referencing a specific signal"}',
      ].join("\n");

      try {
        const r = await aiGatewayFetchWithLang(
          req,
          {
            model: "tier:fast",
            messages: [
              { role: "system", content: sys },
              { role: "user", content: `${adaptiveBlock}\n\n${sharedSignalsBlock}` },
            ],
            response_format: { type: "json_object" },
          },
          {},
          { admin, userId: user.id, functionName: "compose-session-v3:council", aiMode },
        );
        if (!r.ok) { await noteFailure("council", r); throw new Error(`status ${r.status}`); }
        const j = await r.json();
        const parsed = safeJSON<Record<string, unknown>>(j?.choices?.[0]?.message?.content);
        const str = (v: unknown) => String(v ?? "").replace(/^["'\s]+|["'\s]+$/g, "").slice(0, 240);
        const lead = String(parsed?.lead ?? "");
        const archetype = String(parsed?.archetype ?? "");
        return {
          head: str(parsed?.head),
          heart: str(parsed?.heart),
          gut: str(parsed?.gut),
          lead: (["head", "heart", "gut"].includes(lead) ? lead : "gut") as "head" | "heart" | "gut",
          archetype: ARCHETYPES.includes(archetype) ? archetype : "",
          reason: String(parsed?.reason ?? "").slice(0, 200),
        };
      } catch (e) {
        console.warn("[v3] council call failed:", (e as Error).message);
        return { head: "", heart: "", gut: "", lead: "gut", archetype: "", reason: "" };
      }
    }

    async function voiceCall(voice: "head" | "heart" | "gut"): Promise<string> {
      const lin = VOICE_LINEAGE[voice];
      const sys = [
        `You are the ${voice.toUpperCase()} voice of an inner Triangulation Council for one user, right now.`,
        `Path: ${lin.path}. You speak from the lineage of: ${lin.masters.join(", ")}.`,
        voice === "head"  ? "Your job: cut through seeking. Name the thought-pattern. Be precise, dry, brief." :
        voice === "heart" ? "Your job: name the wound or longing that wants to be held. Be tender." :
                            "Your job: name what the body/action wants. Stay concrete and grounded.",
        "Reply in ONE sentence, Ã¢â€°Â¤24 words, second person ('you'). No greeting. No advice list.",
      ].join("\n");
      try {
        const r = await aiGatewayFetchWithLang(
          req,
          {
            model: "tier:fast",
            messages: [
              { role: "system", content: sys },
              { role: "user",   content: sharedSignalsBlock },
            ],
          },
          {},
          { admin, userId: user.id, functionName: `compose-session-v3:voice-${voice}`, aiMode },
        );
        if (!r.ok) return "";
        const j = await r.json();
        return String(j?.choices?.[0]?.message?.content || "").replace(/^["'\s]+|["'\s]+$/g, "").slice(0, 240);
      } catch { return ""; }
    }

    const merged = await councilCall();
    const headSay = merged.head;
    const heartSay = merged.heart;
    const gutSay = merged.gut;
    const councilResolved = Boolean(merged.archetype);

    // Synthesizer Ã¢â‚¬â€ picks lead voice + archetype from 14 with activation rules
    const archetypeMenu = Object.entries(ARCHETYPE_SPEC)
      .map(([name, s]) => `- ${name}: ${s.tagline}  [activates when: ${s.activate}]`).join("\n");

    const synthSys = [
      "You are the SYNTHESIZER for an inner council. Three voices just spoke.",
      "Pick ONE lead voice (head|heart|gut) and ONE archetype from the menu below.",
      "Use the archetype activation rules to choose Ã¢â‚¬â€ do NOT pick 'Settling' unless its rule fires.",
      "If multiple archetypes activate, prefer the deeper need (Dark Night > Shadow Mirror > Confrontation > Stuck-Loop Break > Witness Deepening > Inquiry Spiral > Devotional > Karmic Action > Reconciliation > Lineage Initiation > Celebration > Re-entry > Dissolution > Settling).",
      "ARCHETYPE MENU:",
      archetypeMenu,
      "Return ONLY JSON: {\"lead\":\"head|heart|gut\",\"archetype\":\"<exact name>\",\"reason\":\"<Ã¢â€°Â¤22 words referencing a specific signal>\"}",
    ].join("\n");

    const synthUser = [
      `HEAD VOICE:  ${headSay  || "(silent)"}`,
      `HEART VOICE: ${heartSay || "(silent)"}`,
      `GUT VOICE:   ${gutSay   || "(silent)"}`,
      personalization ? personalizationDirectives(personalization).join("\n") : "",
      adaptiveBlock,
      sharedSignalsBlock,
    ].filter(Boolean).join("\n");

    let council = {
      head: headSay, heart: heartSay, gut: gutSay,
      lead: merged.lead, archetype: merged.archetype || "Settling",
      reason: merged.reason || "default",
    };
    if (!councilResolved) try {
      const r = await aiGatewayFetchWithLang(
        req,
        {
          model: "tier:fast",
          messages: [
            { role: "system", content: synthSys },
            { role: "user",   content: synthUser },
          ],
          response_format: { type: "json_object" },
        },
        {},
        { admin, userId: user.id, functionName: "compose-session-v3:synth", aiMode },
      );
      if (r.ok) {
        const j = await r.json();
        const parsed = safeJSON<{ lead: string; archetype: string; reason: string }>(
          j?.choices?.[0]?.message?.content,
        );
        if (parsed?.archetype && ARCHETYPES.includes(parsed.archetype)) {
          council.archetype = parsed.archetype;
          council.reason = String(parsed.reason || "").slice(0, 200);
          if (["head","heart","gut"].includes(parsed.lead)) council.lead = parsed.lead;
        }
      }
    } catch (e) { console.warn("[v3] synth failed:", (e as Error).message); }

    // ── PERSONALIZATION LOCK: a user-forced archetype is not negotiable ──
    if (personalization?.forcedArchetype && ARCHETYPES.includes(personalization.forcedArchetype)) {
      council.archetype = personalization.forcedArchetype;
      council.reason = `user-forced archetype: ${personalization.forcedArchetype}`;
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ BANDIT POLICY: reward-driven re-rank of the council's choice Ã¢â‚¬â€Ã¢â€â‚¬
    // Only act once there is real evidence (Ã¢â€°Â¥3 scored sittings), never touch
    // safety/milestone archetypes, and only override when the UCB gap is clear.
    const PROTECTED_ARCHETYPES = new Set([
      "Dark Night Hold", "Confrontation", "Shadow Mirror", "Lineage Initiation",
    ]);
    if (!personalization?.forcedArchetype && totalScored >= 3 && !PROTECTED_ARCHETYPES.has(council.archetype)) {
      const best = ucbTable.find((u) => !PROTECTED_ARCHETYPES.has(u.k) && u.n >= 2);
      const currentUcb = ucbFor(council.archetype);
      if (best && best.k !== council.archetype && best.ucb - currentUcb >= 0.15) {
        const prev = council.archetype;
        council.archetype = best.k;
        council.reason = `bandit-ucb: "${best.k}" (ucb ${best.ucb.toFixed(2)}, n=${best.n}) beats "${prev}" (ucb ${currentUcb.toFixed(2)}) Ã¢â‚¬â€ ${council.reason}`.slice(0, 240);
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ COMPOSITION LAYER (main call) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    // -- SAFETY OUTRANKS THE COUNCIL -------------------------------------
    // A body that needs rest never receives a Confrontation or Shadow Mirror
    // sitting, no matter what the voices said. The verdict is decided before
    // composition and enforced here.
    const safetyVerdict = rx?.suitability?.verdict ?? "clear";
    const safetyBlocked =
      safetyVerdict === "rest_only" || safetyVerdict === "hold" || safetyVerdict === "refer";
    if (safetyBlocked) {
      council.archetype = "Settling";
      council.reason = `safety:${safetyVerdict} â€” ${
        rx?.suitability?.recommendedProtocol ?? "grounding only"
      }`.slice(0, 240);
    }

    const rawStepBudget = Math.max(3, Math.min(7, Math.round(timeBudgetMin / 3)));
    const stepBudget = rx?.oneStep ? Math.min(2, rawStepBudget) : rawStepBudget;
    const leadLineage = VOICE_LINEAGE[council.lead as "head" | "heart" | "gut"] ?? VOICE_LINEAGE.gut;
    const archetypeTag = ARCHETYPE_SPEC[council.archetype]?.tagline ?? "";

    const composerSys = [
      "You compose ONE personalized session for this user RIGHT NOW.",
      `Archetype LOCKED: ${council.archetype} â€” "${archetypeTag}".`,
      `Lead voice: ${council.lead} (${leadLineage.path}). Channel the spirit of: ${leadLineage.masters.join(", ")}.`,
      ...(personalization ? personalizationDirectives(personalization) : []),
      ...(need
        ? [
            `USER NEED LOCK (do not override): concept=${need.concept ?? "?"} intent=${need.intent ?? "?"} familiarity=${needFamiliarity == null ? "?" : needFamiliarity.toFixed(2)}.`,
            need.intent === "orient"
              ? "ORIENTATION RULE: teach, do not train. At least 60% of steps must be wisdom-read or reflection. Include exactly ONE 60-second taste practice. Define every term in plain language the first time it appears. Total <= 6 minutes. No deep silence, no long witness."
              : "",
            need.intent === "first_contact"
              ? "FIRST-CONTACT RULE: one short guided taste (3-5 min) + one observation question. Do not assume prior skill. Do not use an unglossed term."
              : "",
            need.intent === "hold"
              ? "HOLD RULE: no progress, no insight-chasing. Breath and grounding only, then close gently."
              : "",
          ].filter(Boolean)
        : []),
      ...(rx
        ? [
            `PRESCRIPTION LOCK: ${rx.dose?.minutes ?? "?"} min, intensity=${rx.dose?.intensity ?? "?"}, teaching=${rx.dose?.teachRatio ?? "?"}, arc=${rx.arc?.spiralLabel ?? "?"} ${rx.arc?.sessionNumber ?? "?"}/${rx.arc?.totalSessions ?? "?"}.`,
            rx.suitability?.verdict === "rest_only"
              ? "SAFETY: REST ONLY â€” no meditation. Compose body-rest / yoga-nidra style. No witness, no inquiry, no long silence."
              : "",
            rx.suitability?.verdict === "hold"
              ? "SAFETY: HOLD â€” grounding only, 3 minutes max, no insight-chasing, no progress steps."
              : "",
            rx.suitability?.verdict === "refer"
              ? "SAFETY: REFER â€” do not compose an intensive sitting; a 2-minute grounding plus a suggestion to speak to a professional."
              : "",
            rx.suitability?.allowBreathRetention === false ? "SAFETY: no breath retention; natural breath only." : "",
            rx.suitability?.allowClosedEyes === false ? "SAFETY: keep eyes open; use sensory orientation." : "",
            rx.claims?.length
              ? `GROUND CLAIMS (do not contradict; you may rephrase): ${rx.claims
                  .map((c) => c.statement)
                  .filter(Boolean)
                  .join(" | ")}`
              : "",
          ].filter(Boolean)
        : []),
      `Return ${rx?.oneStep ? 1 : 3} to ${stepBudget} steps. Allowed kinds: ${ALLOWED_KINDS.join(", ")}.`,
      "Total minutes must fit within the time budget. Step shape must match the archetype:",
      "- Settling / Re-entry: start with breathwork or witness, end soft.",
      "- Confrontation / Shadow Mirror / Stuck-Loop Break: include a journal or reflection that names the pattern.",
      "- Dark Night Hold: NO progress steps Ã¢â‚¬â€ only breath, witness, soft reflection. No 'do' verbs.",
      "- Karmic Action: include exactly one micro-act step.",
      "- Devotional: include a temple-chat or wisdom-read from a heart-master.",
      "- Inquiry Spiral: include a journal step with a single piercing question.",
      "- Witness Deepening: include a witness step longer than usual.",
      "- Celebration / Lineage Initiation: include a wisdom-read that honors the milestone.",
      "",
      "PRACTICE GRAMMAR Ã¢â‚¬â€ every step must instantiate ONE concrete (family Ãƒâ€” focus Ãƒâ€” level) cell:",
      "  family Ã¢Ë†Ë† {observation, self_inquiry, breath_awareness, witnessing, body_awareness, bhakti, karma, jnana, raja, kriya, tantra}",
      "  focus  Ã¢Ë†Ë† a specific loop id, dimension, chakra, or micro-prompt from the practice matrix below",
      "  level  = the user's CURRENT level for that family (see PRACTICE MATRIX); never invent a level the user hasn't reached.",
      "",
      "EVERY STEP IS A BEHAVIOURAL CONTRACT, NOT A QUOTE:",
      "  - 'script' is an array of 3Ã¢â‚¬â€œ5 lines, 40Ã¢â‚¬â€œ140 words total. Line 1 = setup. Line 2 = the ONE concrete thing to do.",
      "    Line 3 = what NOT to do (no efforting / no fixing / no commenting). Line 4 = the stop condition.",
      "  - 'durationSeconds' is authoritative and must respect the kind's range:",
      "    breathwork 60Ã¢â‚¬â€œ600, witness 180Ã¢â‚¬â€œ1200, journal 120Ã¢â‚¬â€œ480, reflection 60Ã¢â‚¬â€œ180, micro-act 60Ã¢â‚¬â€œ120,",
      "    practice 180Ã¢â‚¬â€œ1200, wisdom-read 120Ã¢â‚¬â€œ360, guide-chat 120Ã¢â‚¬â€œ480, temple-chat 120Ã¢â‚¬â€œ480.",
      "  - 'params' must be bound so the widget can actually run the step:",
      "    breathwork {pattern:\"box|4-7-8|4-4-6|coherent|natural|fire\", durationSeconds}",
      "    witness {durationSeconds, object}",
      "    journal {questions:[1-3 strings], minChars:40}",
      "    reflection {maxChars:280}",
      "    micro-act {act:string, window:\"now|today\"}",
      "    practice {family, level, exercise:concrete instruction, durationSeconds}",
      "    wisdom-read {passage:60-150 words, source}",
      "    guide-chat {openingQuestion, maxTurns}",
      "    temple-chat {masterId, question}",
      "  - 'whyForYou' is ONE sentence naming a SPECIFIC signal (named loop, starved dimension, chakra, practice level, memory line, council voice). No vague reasons.",
      "  - 'signalRef' is a resolvable id: 'loop:<ID>' | 'dim:<dim>' | 'chakra:<id>' | 'practice:<family>:L<n>' | 'memory:<age>' | 'gate:<gate>' | 'closure'.",
      "  - 'title' must be imperative and start with a verb (Write / Sit / Breathe / Name / Do / Read / Ask / Say / Close).",
      "  - You MAY use the same kind twice when the sitting needs it (open and close with a write, for example) Ã¢â‚¬â€",
      "    but never with the same title, and never as consecutive steps. At least half the steps must be distinct kinds.",
      "  - Do not reuse the previous sitting's opening step. If it opened with a breath, open somewhere else.",
      "",
      "Use second person, warm, no jargon.",
      "Return ONLY JSON:",
      `{"intent":"string","intro":"string","steps":[{"kind":"<allowed>","title":"string","script":["string"],"durationSeconds":number,"params":{},"whyForYou":"string","signalRef":"string"}]}`,
    ].join("\n");

    // Ã¢â€â‚¬Ã¢â€â‚¬ T4: memory-graph callback + whisper + living theme Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const hoursSincePrev = prevSpine
      ? Math.round((Date.now() - new Date(prevSpine.created_at).getTime()) / 3600000)
      : null;
    const callbackBlock = [
      prevSpine
        ? `LAST SESSION (${hoursSincePrev}h ago): archetype="${prevSpine.archetype}", lead=${prevSpine.lead_master}, loop=${prevSpine.primary_loop_id ? loopName(prevSpine.primary_loop_id) : "Ã¢â‚¬â€"}, dim=${prevSpine.primary_dimension ?? "Ã¢â‚¬â€"}, chakra=${prevSpine.chakra_focus ?? "Ã¢â‚¬â€"}${prevSpine.final_user_sentence ? `, user's closing sentence: "${prevSpine.final_user_sentence}"` : ""}`
        : "LAST SESSION: (none Ã¢â‚¬â€ first session)",
      primaryThread
        ? `LIVING THREAD: "${primaryThread.question}" (depth: ${primaryThread.depthMode}, explored: ${primaryThread.sessionsCount} times). This session should build on this thread.`
        : "",
      whisper
        ? `FUTURE-SELF WHISPER (left by user's previous self for THIS session): "${whisper.whisper}" Ã¢â‚¬â€ weave its essence into the intro, do NOT quote verbatim.`
        : "",
      theme
        ? `LIVING THEME (day's arc): "${theme.title}" Ã¢â‚¬â€ ${theme.description}${theme.sub_angle ? ` | current angle: ${theme.sub_angle}` : ""} | depth ${theme.current_depth}/${theme.max_depth} | status=${theme.evolution_status}. This session should HONOR the theme's current angle.`
        : "",
    ].filter(Boolean).join("\n");

    const prevStepKinds: string[] = Array.isArray((prevSpine as { why_for_you?: unknown })?.why_for_you)
      ? ((prevSpine as { why_for_you: Array<{ kind?: string }> }).why_for_you)
          .map((w) => String(w?.kind ?? ""))
          .filter(Boolean)
      : [];
    const varietyBlock = prevStepKinds.length
      ? [
          `LAST SITTING'S STEP ORDER: ${prevStepKinds.join(" Ã¢â€ â€™ ")}`,
          "This sitting must not repeat that sequence. At least half the steps must use different kinds,",
          "and the first step must not use the same kind as last sitting's first step.",
        ].join("\n")
      : "";

    const composerUser = [
      `ARCHETYPE: ${council.archetype}  (reason: ${council.reason})`,
      `COUNCIL VOICES:`,
      `  head:  ${council.head  || "(silent)"}`,
      `  heart: ${council.heart || "(silent)"}`,
      `  gut:   ${council.gut   || "(silent)"}`,
      `STARVED DIMENSION: ${starvedDim ?? "(none)"}`,
      namedLoops.length ? `NAMED LOOPS (use these human names in whyForYou):\n  ${namedLoops.map(l => `${l.id} Ã¢â€ â€™ ${l.name}`).join("\n  ")}` : "NAMED LOOPS: (none active)",
      userCtx.behavior?.lastJournalSnippet
        ? `USER'S LAST WRITTEN LINE: "${String(userCtx.behavior.lastJournalSnippet).slice(0, 280)}"\n  Honour it in the first or closing step; reference it as signalRef "memory:journal" without quoting it verbatim.`
        : "",
      "",
      callbackBlock,
      "",
      varietyBlock,
      "",
      "INTRO RULES (T4):",
      "- The 'intro' field MUST open with a 1-sentence memory-graph callback to LAST SESSION if it exists (reference its archetype, loop, dimension, or the user's closing sentence Ã¢â‚¬â€ whichever is most alive).",
      "- If a LIVING THREAD exists, reference it meaningfully in the intro Ã¢â‚¬â€ show continuity without repeating the exact question word-for-word.",
      "- If a FUTURE-SELF WHISPER exists, fold its essence into the intro's second sentence.",
      "- If a LIVING THEME exists, the intro's closing must signal how today honors/deepens that theme.",
      "- Total intro Ã¢â€°Â¤ 3 sentences. Warm, second person, no jargon.",
      "",
      matrix.promptBlock,
      "",
      chakra.promptBlock,
      "",
      personalization ? personalizationContextBlock(personalization) : "",
      "",
      `SIGNALS: ${JSON.stringify(signals)}`,
      `MEMORY:${memBlock || "(none)"}`,
      `TIME BUDGET: ${timeBudgetMin} min   GATE: ${signals.gate}   ENERGY: ${signals.energy}`,
      need
        ? `NEED DECISION: ${need.label ?? need.concept ?? "?"} Â· intent=${need.intent ?? "?"} Â· familiarity=${needFamiliarity == null ? "?" : needFamiliarity.toFixed(2)} Â· target ${need.minutes ?? timeBudgetMin} min\nWHY: ${need.why ?? "(not provided)"}\nEVIDENCE: ${(need.evidence ?? []).slice(0, 5).join(" | ") || "(none)"}`
        : "",
      rx
        ? `PRESCRIPTION: dose=${rx.dose?.minutes ?? "?"} min (${rx.dose?.intensity ?? "?"}), safety=${rx.suitability?.verdict ?? "?"}, protocol=${rx.suitability?.recommendedProtocol ?? "â€”"}, oneStep=${rx.oneStep ? "yes" : "no"}${rx.nextPreview ? `, next=${rx.nextPreview}` : ""}`
        : "",
      intent ? `USER INTENT: ${intent}` : "",
    ].filter(Boolean).join("\n");


    let plan: Plan | null = null;
    try {
      const r = await aiGatewayFetchWithLang(
        req,
        {
          model: "tier:main",
          messages: [
            { role: "system", content: composerSys },
            { role: "user",   content: composerUser },
          ],
          response_format: { type: "json_object" },
        },
        {},
        { admin, userId: user.id, functionName: "compose-session-v3:composer", aiMode },
      );
      if (r.ok) {
        const j = await r.json();
        const parsed = safeJSON<{ intent: string; intro: string; steps: Step[] }>(
          j?.choices?.[0]?.message?.content,
        );
        if (parsed?.steps?.length) {
          const cleaned = parsed.steps
            .filter((s) => s && ALLOWED_KINDS.includes(s.kind))
            .slice(0, stepBudget)
            .map((s) => {
              const normalized = normalizeContractStep({
                kind: s.kind,
                title: String(s.title || "Practice"),
                script: Array.isArray((s as Step).script) ? (s as Step).script : undefined,
                prompt: s.prompt ? String(s.prompt) : undefined,
                durationSeconds: Number((s as Step).durationSeconds) || undefined,
                est_minutes: Math.max(1, Math.min(15, Number(s.est_minutes) || 3)),
                params: (s as any).params && typeof (s as any).params === "object" ? (s as any).params : {},
                whyForYou: String(s.whyForYou || ""),
                signalRef: s.signalRef ? String(s.signalRef) : undefined,
              });
              return normalized as Step;
            });
          if (cleaned.length) {
            plan = {
              id: crypto.randomUUID(),
              intent: String(parsed.intent || `${council.archetype} session`).slice(0, 160),
              intro:  String(parsed.intro  || "A session shaped by where you are right now.").slice(0, 400),
              steps:  cleaned,
            };
          }
        }
      } else {
        await noteFailure("composer", r);
      }
    } catch (e) {
      console.warn("[v3] composer failed:", (e as Error).message);
      await noteFailure("composer-threw", null, e);
    }

    // No usable AI plan Ã¢â‚¬â€ hand control back to the client engine rather than
    // substituting a fixed authored shape.
    if (!plan) {
      throw new Error(
        `composer returned no usable plan${aiFailures.length ? ` Ã¢â‚¬â€ ${aiFailures.join(" | ")}` : ""}`,
      );
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ T3: Novelty filter (cosine vs the last 14 days of session steps) Ã¢â€â‚¬Ã¢â€â‚¬
    const NOVELTY_THRESHOLD = 0.8;
    const NOVELTY_WINDOW_DAYS = 14;
    const noveltyCutoff = Date.now() - NOVELTY_WINDOW_DAYS * 86400_000;
    const noveltyReport: Array<{ index: number; maxSim: number; matched?: string }> = [];
    let stepEmbeddings: (number[] | null)[] = [];
    try {
      stepEmbeddings = await Promise.all(plan.steps.map((s) => embedText(stepText(s as never)).catch(() => null)));

      for (let attempt = 0; attempt < 2; attempt++) {
        const flaggedIndices: number[] = [];
        for (let i = 0; i < stepEmbeddings.length; i++) {
          const emb = stepEmbeddings[i];
          if (!emb) continue;
          const { data } = await admin.rpc("match_user_memories", {
            p_user_id: user.id,
            p_query_embedding: emb as any,
            p_match_count: 24,
            p_min_days_ago: 0,
          });
          // `p_min_days_ago` is a floor, not a window Ã¢â‚¬â€ the comparison set must
          // be the recent sittings, so filter by age here.
          const stepMatches = (data ?? []).filter((m: any) =>
            m.source_type === "session_step" &&
            (!m.created_at || new Date(m.created_at).getTime() >= noveltyCutoff)
          );
          const top = stepMatches[0];
          const maxSim = Number(top?.similarity ?? 0);
          if (noveltyReport[i]) {
            noveltyReport[i] = { index: i, maxSim: Math.min(noveltyReport[i].maxSim, maxSim), matched: top?.content?.slice(0, 80) };
          } else {
            noveltyReport.push({ index: i, maxSim, matched: top?.content?.slice(0, 80) });
          }
          if (maxSim > NOVELTY_THRESHOLD) flaggedIndices.push(i);
        }
        if (flaggedIndices.length === 0) break;

        const repairSys = [
          "Some steps below repeat content the user has already seen in the last 14 days.",
          "Rewrite ONLY the steps at the given indices so they are clearly DIFFERENT in title, script and angle,",
          "while keeping the same archetype, kind and durationSeconds. Preserve whyForYou's specific signal reference.",
          "The script must stay a 3Ã¢â‚¬â€œ5 line behavioural contract (setup Ã¢â€ â€™ concrete action Ã¢â€ â€™ what not to do Ã¢â€ â€™ stop condition).",
          "Return ONLY JSON: {\"replacements\":[{\"index\":number,\"title\":string,\"script\":[\"string\"],\"whyForYou\":string,\"signalRef\":string}]}",
        ].join("\n");
        const repairUser = [
          `ARCHETYPE: ${council.archetype}`,
          `FLAGGED INDICES: ${JSON.stringify(flaggedIndices)}`,
          `CURRENT STEPS: ${JSON.stringify(plan.steps.map((s, i) => ({ i, kind: s.kind, title: s.title, script: s.script, durationSeconds: s.durationSeconds })))}`,
          `RECENTLY SEEN (avoid these): ${JSON.stringify(noveltyReport.filter(r => flaggedIndices.includes(r.index)).map(r => r.matched).filter(Boolean))}`,
          matrix.promptBlock,
        ].join("\n");
        try {
          const r = await aiGatewayFetchWithLang(
            req,
            {
              model: "tier:main",
              messages: [
                { role: "system", content: repairSys },
                { role: "user",   content: repairUser },
              ],
              response_format: { type: "json_object" },
            },
            {},
            { admin, userId: user.id, functionName: "compose-session-v3:novelty-repair", aiMode },
          );
          if (!r.ok) break;
          const j = await r.json();
          const parsed = safeJSON<{ replacements: Array<{ index: number; title: string; script: string[]; whyForYou: string; signalRef: string }> }>(
            j?.choices?.[0]?.message?.content,
          );
          for (const rep of parsed?.replacements ?? []) {
            const idx = Number(rep.index);
            if (!Number.isInteger(idx) || !plan.steps[idx]) continue;
            plan.steps[idx] = normalizeContractStep({
              ...plan.steps[idx],
              title: String(rep.title || plan.steps[idx].title),
              script: Array.isArray(rep.script) ? rep.script : plan.steps[idx].script,
              whyForYou: String(rep.whyForYou || plan.steps[idx].whyForYou || ""),
              signalRef: rep.signalRef ? String(rep.signalRef) : plan.steps[idx].signalRef,
            }) as Step;
            try { stepEmbeddings[idx] = await embedText(stepText(plan.steps[idx] as never)); } catch { stepEmbeddings[idx] = null; }
          }
        } catch (e) { console.warn("[v3] novelty repair failed:", (e as Error).message); break; }
      }
    } catch (e) { console.warn("[v3] novelty filter skipped:", (e as Error).message); }

    // ──── PERSONALIZATION FILTER: honor excluded practice families ──────
    if (personalization) {
      const beforeFilter = plan.steps.length;
      const kept = filterExcludedPractices(plan.steps, personalization);
      if (kept.length !== beforeFilter) {
        plan.steps = kept.length > 0 ? kept : plan.steps;
        console.warn(`[v3] personalization removed ${beforeFilter - kept.length} excluded step(s)`);
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ CONTRACT CHECK (normalise + score; keep the composer's plan) Ã¢â€â‚¬Ã¢â€â‚¬
    let gateCheck = enforcePlanConstraints(plan, timeBudgetMin);
    let qualityGateErrors = gateCheck.errors;
    if (!gateCheck.ok) {
      // One focused repair; if it still falls short, keep the plan and record it.
      const qSys = [
        "The session below breaks the behavioural contract. Fix ONLY what is listed.",
        "Rules: every step needs a 3Ã¢â‚¬â€œ5 line script (40Ã¢â‚¬â€œ140 words), bound params for its kind,",
        "a whyForYou naming a real signal, a resolvable signalRef, and a duration inside its kind's range.",
        "Keep the archetype, intent and step count. Return ONLY JSON:",
        "{\"intent\":\"string\",\"intro\":\"string\",\"steps\":[{\"kind\":\"string\",\"title\":\"string\",\"script\":[\"string\"],\"durationSeconds\":number,\"params\":{},\"whyForYou\":\"string\",\"signalRef\":\"string\"}]}",
      ].join("\n");
      const qUser = [
        `ISSUES: ${JSON.stringify(gateCheck.errors.slice(0, 10))}`,
        `PLAN: ${JSON.stringify(plan.steps)}`,
        matrix.promptBlock,
        chakra.promptBlock,
      ].join("\n");
      try {
        const r = await aiGatewayFetch(
          {
            model: "tier:main",
            messages: [
              { role: "system", content: qSys },
              { role: "user", content: qUser },
            ],
            response_format: { type: "json_object" },
          },
          {},
          { admin, userId: user.id, functionName: "compose-session-v3:quality-repair", aiMode },
        );
        if (r.ok) {
          const j = await r.json();
          const parsed = safeJSON<{ intent: string; intro: string; steps: Step[] }>(j?.choices?.[0]?.message?.content);
          if (parsed?.steps?.length) {
            gateCheck = enforcePlanConstraints(
              {
                id: plan.id,
                intent: String(parsed.intent || plan.intent),
                intro: String(parsed.intro || plan.intro),
                steps: parsed.steps.filter((s) => s && ALLOWED_KINDS.includes(s.kind)),
              },
              timeBudgetMin,
            );
            qualityGateErrors = gateCheck.errors;
          }
        }
      } catch (e) { console.warn("[v3] quality repair failed:", (e as Error).message); }
    }

    if (!gateCheck.ok) {
      // The AI plan is the engine's answer. Keep it, record the contract
      // shortfall, and let the shell show what was actually composed.
      console.warn("[v3] contract shortfall kept:", qualityGateErrors.slice(0, 5));
    }
    plan = gateCheck.plan;
    const contentQuality = gateCheck.quality;

    // Ã¢â€â‚¬Ã¢â€â‚¬ WRITE LAYER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const whyForYouArr = plan.steps.map((s, i) => ({
      stepIndex: i, kind: s.kind, why: s.whyForYou, signalRef: s.signalRef,
    }));
    const graphEdges = [
      ...signals.activeLoops.map((id) => ({ type: "loop", id, name: loopName(id) })),
      starvedDim ? { type: "dimension", id: starvedDim } : null,
      { type: "chakra", id: chakra.primary.id },
      { type: "master", id: council.lead },
    ].filter(Boolean);

    const spineId = crypto.randomUUID();
    const { data: spineRow } = await admin.from("session_spine").insert({
      id: spineId,
      // The client persists `sessions` with this id, so completion can find the
      // spine by session_id and actually score it.
      session_id: spineId,
      user_id: user.id,
      archetype: council.archetype,
      archetype_reason: council.reason,
      lead_master: council.lead,
      council_voices: { head: council.head, heart: council.heart, gut: council.gut },
      primary_loop_id: signals.activeLoops[0] ?? null,
      secondary_loop_ids: signals.activeLoops.slice(1, 5),
      primary_dimension: starvedDim,
      chakra_focus: chakra.primary.id,
      quality_score: null,
      final_user_sentence: null,
      why_for_you: whyForYouArr,
      graph_edges: graphEdges,
      composed_signals: { ...signals, contentQuality, qualityGateErrors, personalization: personalization?.signals ?? null },
      ai_mode: aiMode,
    }).select("id").single();

    // Persist step embeddings for future novelty checks
    background((async () => {
      try {
        const rows = plan.steps.map((s, i) => ({
          user_id: user.id,
          source_type: "session_step",
          source_id: spineRow?.id ?? spineId,
          content: stepText(s as never).slice(0, 4000),
          embedding: stepEmbeddings[i] as any,
          tags: [s.kind, council.archetype, council.lead],
          loop_ids: s.signalRef?.startsWith("loop:") ? [s.signalRef.slice(5)] : [],
        })).filter((r) => r.embedding);
        if (rows.length) await admin.from("user_memory_vectors").insert(rows);
      } catch (e) { console.warn("[v3] step-embedding insert failed:", (e as Error).message); }
    })());

    // Ã¢â€â‚¬Ã¢â€â‚¬ T4: Mark consumed whisper, generate next whisper, evolve theme Ã¢â€â‚¬Ã¢â€â‚¬
    let nextWhisper: string | null = null;
    background((async () => {
      try {
        if (whisper?.id) {
          await admin.from("future_self_whispers")
            .update({ consumed_at: new Date().toISOString() }).eq("id", whisper.id);
        }
      } catch (e) { console.warn("[v3] whisper consume failed:", (e as Error).message); }
    })());

    try {
      const wSys = [
        "You are the user's FUTURE SELF, writing one short whisper for them to receive at the START of their NEXT session.",
        "It must reference what was just composed (archetype, lead voice, primary loop or dimension) without quoting raw IDs.",
        "Tone: warm, intimate, second person, Ã¢â€°Â¤22 words, ONE sentence. No advice, no commands Ã¢â‚¬â€ a remembering.",
        "Return ONLY JSON: {\"whisper\":\"string\",\"tone\":\"tender|fierce|playful|grave|grateful\"}",
      ].join("\n");
      const wUser = [
        `JUST COMPOSED: archetype=${council.archetype}, lead=${council.lead}, loop=${signals.activeLoops[0] ? loopName(signals.activeLoops[0]) : "Ã¢â‚¬â€"}, dim=${starvedDim ?? "Ã¢â‚¬â€"}, chakra=${chakra.primary.id}`,
        `INTRO: ${plan.intro}`,
        `FIRST STEP: ${plan.steps[0]?.title} Ã¢â‚¬â€ ${plan.steps[0]?.whyForYou ?? ""}`,
      ].join("\n");
      const wr = await aiGatewayFetchWithLang(
        req,
        {
          model: "tier:fast",
          messages: [{ role: "system", content: wSys }, { role: "user", content: wUser }],
          response_format: { type: "json_object" },
        },
        {},
        { admin, userId: user.id, functionName: "compose-session-v3:whisper", aiMode },
      );
      if (wr.ok) {
        const wj = await wr.json();
        const parsed = safeJSON<{ whisper: string; tone: string }>(wj?.choices?.[0]?.message?.content);
        if (parsed?.whisper) {
          nextWhisper = String(parsed.whisper).slice(0, 280);
          const whisperRow = {
            user_id: user.id,
            source_spine_id: spineRow?.id ?? spineId,
            whisper: nextWhisper,
            tone: String(parsed.tone || "tender").slice(0, 32),
          };
          background((async () => {
            const { error } = await admin.from("future_self_whispers").insert(whisperRow);
            if (error) console.warn("[v3] whisper insert failed:", error.message);
          })());
        }
      }
    } catch (e) { console.warn("[v3] whisper gen failed:", (e as Error).message); }

    // Trigger living-theme evolution
    if (theme?.id) {
      background(fetch(`${SUPABASE_URL}/functions/v1/evolve-theme`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": auth,
          "apikey": ANON_KEY,
        },
        body: JSON.stringify({
          themeId: theme.id,
          spineId: spineRow?.id ?? spineId,
          archetype: council.archetype,
          leadMaster: council.lead,
          primaryLoopId: signals.activeLoops[0] ?? null,
          primaryDimension: starvedDim,
        }),
      }).catch((e) => console.warn("[v3] evolve-theme trigger failed:", e?.message)));
    }

    // -- INVOCATION (server-owned session name) --------------------------
    const invocation = getSessionInvocation({
      sessionCount: Number(userCtx.foundation?.totalSessions ?? 0) + 1,
      hour: Number(userCtx.now?.hour ?? new Date().getHours()),
      themeTitle: theme?.title ?? null,
      archetype: council.archetype,
      activeLoopNames: namedLoops.map((l) => l.name),
      weakestDimension: starvedDim,
      daysSinceLastSession: Number(signals.gapDays ?? 999),
      sessionSalt: spineRow?.id ?? spineId,
    });

    return successResponse({
      plan,
      invocation: invocation.invocation,
      gateLine: invocation.gateLine,
      sittingRoman: invocation.sittingRoman,
      gateAccent: invocation.gateAccent,
      need: need ?? null,
      prescription: serverPrescription ?? (rx as unknown) ?? null,
      safety: safetyVerdict,
      spineId: spineRow?.id ?? spineId,
      council,
      chakraFocus: chakra.primary.id,
      whyForYouCount: plan.steps.filter((s) => s.whyForYou).length,
      meta: {
        vLevelStart: Number(signals.vLevel ?? 0),
        dimensionBandsStart: signals.dimensionBands ?? null,
        starvedDimension: starvedDim,
        chakraFocus: chakra.primary.id,
        namedLoops,
        practiceLevels: practiceLevelsCompact,
        leadVoice: council.lead,
        leadMaster: VOICE_LINEAGE[council.lead as "head" | "heart" | "gut"]?.masters?.[0] ?? null,
        gate: signals.gate,
        energy: signals.energy,
        timeBudgetMin,
        aiMode,
        personalization: personalization
          ? {
              source: personalization.source,
              signals: personalization.signals,
              focusFamily: personalization.focusFamily,
              guideStyle: personalization.guideStyle,
              structure: personalization.structure,
              reflectionDepth: personalization.reflectionDepth,
              forcedArchetype: personalization.forcedArchetype,
            }
          : null,
        memoryInjected: !!memBlock,
        noveltyFlagged: noveltyReport.filter((n) => n.maxSim > 0.8).length,
        contentQuality: Math.round(contentQuality * 1000) / 1000,
        qualityGateErrors,
        need,
      prescription: serverPrescription ?? (rx as unknown) ?? null,
        safety: safetyVerdict,
        invocation: invocation.invocation,
        gateLine: invocation.gateLine,
        sittingRoman: invocation.sittingRoman,
        gateAccent: invocation.gateAccent,
      },
      novelty: noveltyReport,
      memoryCallback: prevSpine
        ? {
            archetype: prevSpine.archetype,
            hoursAgo: hoursSincePrev,
            closingSentence: prevSpine.final_user_sentence ?? null,
            lastJournal: userCtx.behavior?.lastJournalSnippet ?? null,
          }
        : userCtx.behavior?.lastJournalSnippet
          ? { archetype: null, hoursAgo: null, closingSentence: null, lastJournal: userCtx.behavior.lastJournalSnippet }
          : null,
      whisperConsumed: whisper ? { id: whisper.id, text: whisper.whisper } : null,
      nextWhisper,
      themeId: theme?.id ?? null,
      elapsedMs: Date.now() - t0,
      aiMode,
    });
  }
));
