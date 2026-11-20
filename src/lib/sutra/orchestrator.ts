// The Brain: whatNext(userId) — the single function every smart UI surface reads from.
//
// Reads the 5 axes:
//   1. Constellation  (who you are — 12 weighted practices)
//   2. Life Domains   (where you live — 8 domains scored)
//   3. Arc            (what you're working on — 7-day theme)
//   4. State          (right now — energy/mood/time/loops)
//   5. Mode Registry  (which door — 20+ session modes)
//
// Returns a single block OR a compound session plan (e.g. Wisdom→Practice→Journal),
// each with its own micro-theme and "why this?" reasoning.
//
// Apply 7 Laws (Observation spine, continuous calibration, diverge→T→breathe,
// per-practice levels vs global Band, weighted random, user agency, honest movement).

import { supabase } from "@/lib/supabase";
import { PRACTICES, type Practice, type PracticeStatus } from "./practices";
import { MODE_REGISTRY, type ModeEntry, getModesByPractice } from "./modeRegistry";
import { pickPracticeWithGraph, type GraphPracticeScore } from "./graphPicker";
import {
  conceptSessionRoute,
  detectNeed,
  needBlockIntro,
  needBlockLabel,
  readNeedSignals,
  type NeedDecision,
} from "@/lib/needEngine";
import { prescribe, type Prescription, type SuitabilityInput } from "@/lib/prescription";
import {
  buildSessionGraph,
  generateSession,
  type SessionGraph,
  type SessionSpec,
} from "@/lib/sessionGraph";

/** Built lazily once: derived from static catalogs, not per request. */
let cachedSessionGraph: SessionGraph | null = null;
function getSessionGraph(): SessionGraph {
  cachedSessionGraph ??= buildSessionGraph();
  return cachedSessionGraph;
}

export interface ConstellationSnapshot {
  phase: "diverge" | "t-shape" | "breathe" | "integrate";
  weights: Record<Practice, number>;
  levels: Record<Practice, number>;
  statuses: Record<Practice, PracticeStatus>;
}

export interface UserState {
  energy: "low" | "medium" | "high";
  mood: string;
  timeAvailableSec: number;
  activeLoops: string[];
  stressedDomains: string[];
}

export interface SessionBlock {
  modeId: string;
  label: string;
  practice: Practice;
  surface: ModeEntry["surface"];
  durationSec: number;
  route: string;
  intro: string;
}

export interface NextSessionPlan {
  /** Per-session micro-theme (derived from day theme + state) */
  sessionTheme: { title: string; micro: string };
  /** One block, or many for compound sessions */
  blocks: SessionBlock[];
  totalDurationSec: number;
  /** Law 1: Observation tail attached to every session */
  observationTail: string;
  /** Human-readable reasoning across all 5 axes */
  why: string;
  /**
   * 6th axis: the next honest step, including what the user has never met.
   * Only present when the knowledge graph returns usable evidence.
   */
  need?: NeedDecision;
  /** Safety + dose + arc + 30-day horizon for this sitting. */
  prescription?: Prescription;
  /** Graph-walked spec: gap → prerequisite path → arc → steps. */
  graphSpec?: SessionSpec;
  /** Alternatives if user says "skip" or "surprise me" */
  alternatives: SessionBlock[];
  /** Source axes for transparency */
  axes: {
    constellation: ConstellationSnapshot | null;
    arc: { title: string; day: number } | null;
    state: UserState;
    domains: string[];
  };
}

// ─── Readers ──────────────────────────────────────────────────────────────

async function getConstellation(userId: string): Promise<ConstellationSnapshot | null> {
  const { data } = await supabase
    .from("user_practice_constellation")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  const weights = {} as Record<Practice, number>;
  const levels = {} as Record<Practice, number>;
  const statuses = {} as Record<Practice, PracticeStatus>;
  for (const p of PRACTICES) {
    weights[p] = Number((data as any)[`${p}_weight`]) || 0.083;
    levels[p] = Number((data as any)[`${p}_level`]) || 0;
    statuses[p] = ((data as any)[`${p}_status`] as PracticeStatus) || "secondary";
  }
  return { phase: data.phase as any, weights, levels, statuses };
}

async function getStressedDomains(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("life_domain_scores")
    .select("domain, score")
    .eq("user_id", userId);
  if (!data) return [];
  return data.filter((d) => (d.score || 10) < 5).map((d) => d.domain);
}

async function getActiveLoops(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("active_loops")
    .select("loop_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(5);
  return data?.map((l) => l.loop_id) || [];
}

async function getCurrentArc(userId: string): Promise<{ title: string; day: number } | null> {
  const { data } = await supabase
    .from("theme_arcs" as any)
    .select("title, current_day")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { title: (data as any).title, day: (data as any).current_day || 1 };
}

async function getDailyTheme(userId: string): Promise<{ title: string; description: string; current_depth?: number; evolution_status?: string } | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_themes")
    .select("title, description, current_depth, evolution_status")
    .eq("user_id", userId)
    .eq("theme_date", today)
    .maybeSingle();
  return (data as any) || null;
}

async function getUserBand(userId: string): Promise<number | undefined> {
  const { data } = await supabase
    .from("user_consciousness_profile")
    .select("overall_band")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.overall_band as number | undefined;
}

/**
 * Decide how many steps the agenda should have based on theme depth + arc day.
 * Hard cap at 3 — never more.
 *   1 step  → fresh theme, gentle entry
 *   2 steps → deepening (teach → practice)
 *   3 steps → integration (breath → core → reflection)
 */
function decideAgendaLength(
  daily: { current_depth?: number; evolution_status?: string } | null,
  arc: { day: number } | null,
  state: UserState,
): 1 | 2 | 3 {
  if (state.timeAvailableSec < 360 || state.energy === "low") return 1;
  const depth = daily?.current_depth ?? 0;
  const status = daily?.evolution_status ?? "";
  const arcDay = arc?.day ?? 0;
  if (status === "integrate" || arcDay >= 7 || depth >= 3) return 3;
  if (status === "deepen" || arcDay >= 3 || depth >= 1) return 2;
  return 1;
}

// ─── State derivation ─────────────────────────────────────────────────────

function deriveState(stressedDomains: string[], activeLoops: string[]): UserState {
  const hour = new Date().getHours();
  const energy: UserState["energy"] =
    hour < 7 || hour >= 22 ? "low"
    : hour < 11 || hour >= 18 ? "medium"
    : "high";
  const mood = activeLoops.length > 2 ? "agitated" : "neutral";
  return {
    energy, mood,
    timeAvailableSec: 600, // sensible default; overridden by UI when user picks duration
    activeLoops, stressedDomains,
  };
}

// ─── Picker (Law 5: weighted random across 5 axes) ────────────────────────

function weightedPick<T>(items: Array<{ item: T; weight: number }>): T {
  const total = items.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const x of items) {
    r -= x.weight;
    if (r <= 0) return x.item;
  }
  return items[items.length - 1].item;
}

function pickPractice(c: ConstellationSnapshot | null, state: UserState, userBand?: number): Practice {
  const weights = c ? c.weights : PRACTICES.reduce((acc, p) => { acc[p] = 1 / 12; return acc; }, {} as any);
  const graphPick = pickPracticeWithGraph({
    activeLoops: state.activeLoops,
    stressedDomains: state.stressedDomains,
    userBand,
    constellationWeights: weights,
  });
  if (graphPick) return graphPick.practice;

  // Fallback to legacy weighted random
  const adjusted: Array<{ item: Practice; weight: number }> = PRACTICES.map((p) => {
    let w = weights[p];
    if (state.activeLoops.length > 0 && (p === "observe" || p === "witness")) w *= 1.3;
    if (state.mood === "agitated" && (p === "breath" || p === "body")) w *= 1.5;
    if (state.stressedDomains.includes("relationships") && p === "bhakti") w *= 1.4;
    if (state.stressedDomains.includes("work") && p === "karma") w *= 1.4;
    return { item: p, weight: w };
  });
  return weightedPick(adjusted);
}

function pickModeForPractice(practice: Practice, state: UserState): ModeEntry {
  const candidates = getModesByPractice(practice).filter((m) => {
    if (m.stateFit.minTimeSec && m.stateFit.minTimeSec > state.timeAvailableSec) return false;
    if (m.stateFit.energy && !m.stateFit.energy.includes(state.energy)) return false;
    return true;
  });
  if (candidates.length === 0) {
    // Fallback to any mode of that practice
    const all = getModesByPractice(practice);
    return all[0] || MODE_REGISTRY[0];
  }
  return weightedPick(candidates.map((m) => ({ item: m, weight: 1 })));
}

function shouldCompound(state: UserState, c: ConstellationSnapshot | null): boolean {
  // Compound when user has time + medium/high energy + we're past diverge phase
  if (state.timeAvailableSec < 480) return false;
  if (state.energy === "low") return false;
  if (c && c.phase === "diverge") return false;
  return Math.random() < 0.45;
}

function buildObservationTail(practice: Practice): string {
  const tails: Partial<Record<Practice, string>> = {
    observe: "Notice what shifted in the last minute.",
    inquiry: "Who was asking that question?",
    bhakti: "What remains in the heart now?",
    witness: "Stay with the silence a moment longer.",
    karma: "Notice the doer — and what is beyond them.",
    breath: "Feel the breath that came uninvited.",
    body: "Where in the body is the practice still living?",
    jnana: "What understood that teaching?",
    raja: "Notice the discipline holding itself.",
    tantra: "Where is the energy now resting?",
    neuro: "Watch the next thought arise.",
    kriya: "Feel the cleared space.",
  };
  return tails[practice] || "Notice what is here, just now.";
}

/**
 * Synthesize a per-session theme that braids 5 axes:
 *  • Daily theme (today's invitation)
 *  • Top practice from constellation (who you are)
 *  • Arc context (this week's thread, if any)
 *  • State (energy / mood / loops / stressed domain)
 *
 * Output is always concrete and personal — never a template.
 */
function buildSessionTheme(
  daily: { title: string; description: string } | null,
  practice: Practice,
  state: UserState,
  c: ConstellationSnapshot | null,
  arc: { title: string; day: number } | null,
): { title: string; micro: string } {
  const dayTitle = daily?.title?.trim() || "Presence";

  // Title: prefer the day theme, but if there's an active arc, layer it.
  const title = arc ? `${dayTitle} · ${arc.title}` : dayTitle;

  // Micro: assemble from real signals, in priority order.
  const stressed = state.stressedDomains[0];
  const loop = state.activeLoops[0];
  const top = c
    ? (Object.entries(c.weights).sort((a, b) => b[1] - a[1])[0]?.[0] as Practice | undefined)
    : undefined;

  let micro: string;
  if (loop) {
    micro = `Met through ${practice}, while ${loop.replace(/_/g, " ")} is active.`;
  } else if (stressed && state.mood === "agitated") {
    micro = `Met through the body — your ${stressed} field is unsettled.`;
  } else if (stressed) {
    micro = `Brought to your ${stressed}, through ${practice}.`;
  } else if (state.energy === "low") {
    micro = `Gently received, through ${practice}.`;
  } else if (top && top !== practice) {
    micro = `Your ${top} root, today expressed through ${practice}.`;
  } else if (arc) {
    micro = `Day ${arc.day} of "${arc.title}" — through ${practice}.`;
  } else {
    micro = `${dayTitle}, explored through ${practice}.`;
  }

  return { title, micro };
}

function buildWhy(
  practice: Practice,
  c: ConstellationSnapshot | null,
  state: UserState,
  arc: { title: string; day: number } | null,
): string {
  const parts: string[] = [];
  if (c) {
    const w = c.weights[practice];
    parts.push(`${practice} is ${(w * 100).toFixed(0)}% of your constellation`);
  }
  if (state.stressedDomains.length > 0) {
    parts.push(`applied to your ${state.stressedDomains[0]} stress`);
  }
  if (arc) parts.push(`in this week's "${arc.title}" arc, day ${arc.day}`);
  if (state.mood === "agitated") parts.push("because the field is unsettled");
  return parts.join(", ") + ".";
}

// ─── Public entrypoint ────────────────────────────────────────────────────

export async function whatNext(
  userId: string,
  opts?: { timeAvailableSec?: number; suitability?: SuitabilityInput; sessionNumber?: number },
): Promise<NextSessionPlan> {
  const [c, stressedDomains, activeLoops, arc, daily, userBand, needSignals] = await Promise.all([
    getConstellation(userId),
    getStressedDomains(userId),
    getActiveLoops(userId),
    getCurrentArc(userId),
    getDailyTheme(userId),
    getUserBand(userId),
    readNeedSignals(userId).catch(() => null),
  ]);

  const state = deriveState(stressedDomains, activeLoops);
  if (opts?.timeAvailableSec) state.timeAvailableSec = opts.timeAvailableSec;

  // 6th axis: what is the next honest step, especially for concepts the user
  // has never met. Deterministic — no LLM decides the door.
  const need: NeedDecision | undefined = needSignals
    ? detectNeed({
        ...needSignals,
        energy: state.energy,
        timeBudgetMin: Math.max(3, Math.round(state.timeAvailableSec / 60)),
      })
    : undefined;

  const prescription: Prescription | undefined = need
    ? prescribe({
        need,
        suitability: opts?.suitability,
        capabilityLevel: needSignals?.capabilityLevels?.[need.concept],
        energy: state.energy,
        timeBudgetMin: Math.max(3, Math.round(state.timeAvailableSec / 60)),
        sessionNumber: opts?.sessionNumber,
        completedSessions: needSignals?.concepts?.[need.concept]?.exposureCount ?? 0,
      })
    : undefined;

  const graphSpec: SessionSpec | undefined = needSignals
    ? generateSession(
        getSessionGraph(),
        {
          familiarity: Object.fromEntries(
            Object.entries(needSignals.concepts).map(([concept, evidence]) => [
              concept,
              evidence.familiarity,
            ]),
          ),
          capabilityLevels: needSignals.capabilityLevels,
          activeLoops: needSignals.activeLoops,
          stressedDomains: stressedDomains ?? [],
        },
        { maxMinutes: Math.max(3, Math.round(state.timeAvailableSec / 60)) },
      )
    : undefined;

  const safety = prescription?.suitability.verdict;
  const safetyBlocked = safety === "rest_only" || safety === "hold" || safety === "refer";
  const orienting = !!need && !safetyBlocked && (need.intent === "orient" || need.intent === "first_contact");

  const constellation: ConstellationSnapshot = c || {
    phase: "diverge",
    weights: PRACTICES.reduce((acc, p) => { acc[p] = 1 / 12; return acc; }, {} as any),
    levels: PRACTICES.reduce((acc, p) => { acc[p] = 0; return acc; }, {} as any),
    statuses: PRACTICES.reduce((acc, p) => { acc[p] = "secondary" as PracticeStatus; return acc; }, {} as any),
  };

  const primaryPractice: Practice = safetyBlocked
    ? "body"
    : orienting && need
      ? need.practice
      : pickPractice(constellation, state, userBand);

  const blocks: SessionBlock[] = [];
  if (safetyBlocked && prescription) {
    blocks.push({
      modeId: `safety-${safety}`,
      label:
        safety === "rest_only"
          ? "Rest & reset"
          : safety === "hold"
            ? "Ground first"
            : "Support first",
      practice: "body",
      surface: "guide",
      durationSec: Math.max(120, Math.round(prescription.dose.minutes * 60)),
      route: safety === "rest_only" ? "/app/practice" : "/app/guide?mode=open",
      intro: prescription.suitability.recommendedProtocol,
    });
  } else if (orienting && need) {
    blocks.push({
      modeId: `need-${need.concept}`,
      label: needBlockLabel(need),
      practice: need.practice,
      surface: "guide",
      durationSec: Math.max(180, Math.round(need.shape.minutes * 60)),
      route: conceptSessionRoute(need),
      intro: needBlockIntro(need),
    });
  } else {
    const primaryMode = pickModeForPractice(primaryPractice, state);
    blocks.push({
      modeId: primaryMode.id,
      label: primaryMode.label,
      practice: primaryMode.practice,
      surface: primaryMode.surface,
      durationSec: primaryMode.defaultDurationSec,
      route: primaryMode.route({}),
      intro: primaryMode.intro,
    });
  }

  const targetSteps = safetyBlocked || orienting ? 1 : decideAgendaLength(daily, arc, state);
  const seenPractices = new Set<Practice>([primaryPractice]);
  while (!orienting && blocks.length < targetSteps) {
    const nextPractice = pickPractice(constellation, state, userBand);
    if (seenPractices.has(nextPractice)) {
      const alt = pickPractice(constellation, state, userBand);
      if (seenPractices.has(alt)) break;
      seenPractices.add(alt);
      const altMode = pickModeForPractice(alt, state);
      if (!altMode.supportsCompound) break;
      blocks.push({
        modeId: altMode.id, label: altMode.label, practice: altMode.practice,
        surface: altMode.surface,
        durationSec: Math.min(altMode.defaultDurationSec, 240),
        route: altMode.route({}), intro: altMode.intro,
      });
      continue;
    }
    seenPractices.add(nextPractice);
    const nextMode = pickModeForPractice(nextPractice, state);
    if (!nextMode.supportsCompound) break;
    blocks.push({
      modeId: nextMode.id, label: nextMode.label, practice: nextMode.practice,
      surface: nextMode.surface,
      durationSec: Math.min(nextMode.defaultDurationSec, 240),
      route: nextMode.route({}), intro: nextMode.intro,
    });
  }
  if (blocks.length > 3) blocks.length = 3;

  const alternatives: SessionBlock[] = [];
  const seen = new Set<Practice>([primaryPractice]);
  for (let i = 0; i < 3 && !orienting && !safetyBlocked && alternatives.length < 3; i++) {
    const p = pickPractice(constellation, state, userBand);
    if (seen.has(p)) continue;
    seen.add(p);
    const m = pickModeForPractice(p, state);
    alternatives.push({
      modeId: m.id, label: m.label, practice: m.practice, surface: m.surface,
      durationSec: m.defaultDurationSec, route: m.route({}), intro: m.intro,
    });
  }

  const graphPick = pickPracticeWithGraph({
    activeLoops: state.activeLoops,
    stressedDomains: state.stressedDomains,
    userBand,
    constellationWeights: constellation.weights,
  });

  return {
    sessionTheme:
      safetyBlocked && prescription
        ? {
            title:
              safety === "rest_only"
                ? "Rest & reset"
                : safety === "hold"
                  ? "Ground first"
                  : "Support first",
            micro: prescription.why,
          }
        : orienting && need
          ? { title: needBlockLabel(need), micro: need.why }
          : buildSessionTheme(daily, primaryPractice, state, c, arc),
    blocks,
    totalDurationSec: blocks.reduce((s, b) => s + b.durationSec, 0),
    observationTail: graphPick ? `Graph insight: ${graphPick.reason}` : buildObservationTail(primaryPractice),
    why: prescription
      ? prescription.why
      : buildWhy(primaryPractice, c, state, arc),
    need,
    prescription,
    graphSpec,
    alternatives,
    axes: { constellation: c, arc, state, domains: stressedDomains },
  };
}
