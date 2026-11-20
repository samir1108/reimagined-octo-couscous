/**
 * awakeningEngine — the brain of THE AWAKENING JOURNEY.
 * ─────────────────────────────────
 * Three jobs:
 *
 *   1. planSession       — fill a session's question beats deterministically
 *                          from the bank, seeded by what the user has
 *                          already said. No two users walk the same journey.
 *   2. analyzeCapabilities — fold every answer into an honest capability map:
 *                          provisional indicators with evidence levels, never
 *                          a verdict on a person.
 *   3. recommendNext / buildReport — decide what comes next and explain why,
 *                          then generate the final development report from
 *                          what the user actually did.
 */
import type {
  AwakeningSession,
  AwakeningQuestion,
  PlannedStep,
  AwakeningAnswer,
  AwakeningProgress,
  CapabilityId,
  CapabilityMap,
  Recommendation,
  DevelopmentReport,
  PathRecommendation,
  Beat,
  EvidenceLevel,
} from "./types";
import { AWAKENING_QUESTIONS_BY_SESSION } from "./questions";
import {
  AWAKENING_SESSIONS,
  AWAKENING_SESSION_BY_ID,
  AWAKENING_TOTAL,
  AWAKENING_CANONICAL_ORDER,
} from "./sessions";
import { LOOP_CATALOG } from "@/lib/loopLibraryCatalog";

// ── the eight capabilities, in plain language ───────────────────────────

export const CAPABILITY_LABEL: Record<CapabilityId, string> = {
  awareness: "Awareness",
  attention: "Attention",
  emotional_regulation: "Emotional regulation",
  behavioral_patterns: "Pattern recognition",
  intention: "Intention",
  discipline: "Follow-through",
  values: "Values",
  reflection: "Reflection",
};

export const CAPABILITY_QUESTION: Record<CapabilityId, string> = {
  awareness: "Can you notice thoughts, feelings, and impulses as they arise?",
  attention: "Can you direct and sustain attention on what you chose?",
  emotional_regulation: "Can you feel an emotion without it choosing your next action?",
  behavioral_patterns: "Can you identify the triggers and sequences that repeat?",
  intention: "Can you tell why you act — the motive under the motive?",
  discipline: "Can you follow through on commitments you chose?",
  values: "Can you connect decisions to priorities that are actually yours?",
  reflection: "Can you learn from experience and adjust?",
};

export const CAPABILITY_IDS = Object.keys(CAPABILITY_LABEL) as CapabilityId[];

/** How much each beat's answers weigh — deeper beats carry more signal. */
const BEAT_WEIGHT: Record<Beat, number> = {
  arrival: 1,
  observation: 1,
  investigation: 1.2,
  practice: 1,
  application: 1.2,
  reflection: 1.5,
};

const EVIDENCE_RANK: Record<EvidenceLevel, number> = {
  hypothesized: 0,
  self_reported: 1,
  measured: 2,
};

// ── deterministic hash (stable variety per user) ────────────────────────

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 4294967295;
}

// ── progress ────────────────────────────────────────────────────────────

export function emptyProgress(order: string[] = AWAKENING_CANONICAL_ORDER): AwakeningProgress {
  return {
    current_session_id: order[0] ?? AWAKENING_SESSIONS[0].id,
    completed_session_ids: [],
    answers: [],
    vows: {},
    vow_results: {},
    carry_seeds: {},
    order: order.length ? order : AWAKENING_CANONICAL_ORDER,
    goal: null,
    completed_at: null,
    updated_at: new Date().toISOString(),
  };
}

// ── 1. planSession — adaptive question fill ─────────────────────────────

export interface PlanContext {
  askedIds: ReadonlySet<string>;
  map: CapabilityMap | null;
  activeLoops: readonly string[];
  /** stable per-user seed (userId) so choices vary across users, not reloads */
  seed: string;
}

/**
 * Fill the session's question beats. Scoring per candidate:
 *   +3  targets the user's weakest capability
 *   +2  touches an already-active loop (confirmation depth)
 *   -2  that capability was already covered in this session (variety)
 *   +0.5..1  deterministic per-user tiebreak
 * Never re-asks. Borrows from another beat of the same session as a last
 * resort. If the bank is empty for a beat, the beat becomes a silent
 * prompt rather than being dropped — the spine stays intact.
 */
export function planSession(session: AwakeningSession, ctx: PlanContext): PlannedStep[] {
  const bankByBeat = new Map<Beat, AwakeningQuestion[]>();
  const allForSession: AwakeningQuestion[] = [];
  for (const q of AWAKENING_QUESTIONS_BY_SESSION(session.id)) {
    allForSession.push(q);
    const arr = bankByBeat.get(q.beat) ?? [];
    arr.push(q);
    bankByBeat.set(q.beat, arr);
  }

  const planned: PlannedStep[] = [];
  const covered = new Set<CapabilityId>();
  // Track picks inside this plan too — the two investigation beats must
  // never land on the same question.
  const used = new Set<string>(ctx.askedIds);

  for (const step of session.steps) {
    if (step.kind === "practice") {
      planned.push({ kind: "practice", practice: session.practice });
      continue;
    }
    if (step.kind === "experiment") {
      planned.push({ kind: "experiment", experiment: session.experiment });
      continue;
    }

    const candidates = bankByBeat.get(step.beat) ?? [];
    let pool = candidates.filter((q) => !used.has(q.id));
    let borrowed = false;
    if (!pool.length) {
      pool = allForSession.filter((q) => q.beat !== step.beat && !used.has(q.id));
      borrowed = true;
    }

    const scored = pool.map((q) => {
      const capabilities = questionCapabilities(q);
      let score = hashString(`${ctx.seed}:${q.id}`);
      if (borrowed) score -= 1;
      if (ctx.map) {
        if (capabilities.includes(ctx.map.weakest)) score += 3;
        const capped = capabilities.filter((c) => covered.has(c));
        if (capped.length) score -= 2;
      }
      const loops = q.loops ?? [];
      if (loops.some((l) => ctx.activeLoops.includes(l))) score += 2;
      if (q.beat === "reflection") score += 0.25;
      return { q, score, capabilities };
    });

    scored.sort((a, b) => b.score - a.score);
    const pick = scored[0];

    if (pick) {
      planned.push({ kind: "question", beat: step.beat, question: pick.q });
      used.add(pick.q.id);
      for (const c of pick.capabilities) covered.add(c);
    } else {
      // Bank exhausted for this beat — keep the spine with a wordless beat.
      planned.push({
        kind: "question",
        beat: step.beat,
        question: {
          id: `${session.id}_${step.beat}_open`,
          sessionId: session.id,
          beat: step.beat,
          kind: "text",
          title: "Sit with this for a moment.",
          placeholder: "Anything, or nothing.",
          maxLength: 140,
          capabilities: { reflection: 6 },
        },
      });
    }
  }

  return planned;
}

/** All capabilities a question reads, in signal order. */
export function questionCapabilities(q: AwakeningQuestion): CapabilityId[] {
  const signals =
    q.kind === "choice"
      ? q.options.flatMap((o) => Object.keys(o.capabilities) as CapabilityId[])
      : q.kind === "scale"
        ? ([...Object.keys(q.low), ...Object.keys(q.high)] as CapabilityId[])
        : (Object.keys(q.capabilities) as CapabilityId[]);
  return Array.from(new Set(signals));
}

// ── answer helpers (the runner records answers through these) ───────────

/** Capability signals for a chosen option / scale value / free text. */
export function signalsFor(q: AwakeningQuestion, value: string | number): Partial<Record<CapabilityId, number>> {
  if (q.kind === "choice") {
    const opt = q.options.find((o) => o.id === value);
    return opt?.capabilities ?? {};
  }
  if (q.kind === "scale" && typeof value === "number") {
    const t = (Math.min(5, Math.max(1, value)) - 1) / 4;
    const out: Partial<Record<CapabilityId, number>> = {};
    const keys = new Set([...Object.keys(q.low), ...Object.keys(q.high)] as CapabilityId[]);
    for (const k of keys) {
      const lo = q.low[k] ?? 5;
      const hi = q.high[k] ?? 5;
      out[k] = Math.round((lo + (hi - lo) * t) * 10) / 10;
    }
    return out;
  }
  if (q.kind === "text") {
    return typeof value === "string" && value.trim().length >= 2 ? q.capabilities : {};
  }
  return {};
}

/** Loops a question reading carries for this value. */
export function loopsFor(q: AwakeningQuestion, value: string | number): string[] {
  const base = q.loops ?? [];
  if (q.kind === "choice") {
    const opt = q.options.find((o) => o.id === value);
    return Array.from(new Set([...base, ...(opt?.loops ?? [])]));
  }
  return base;
}

export function answerFromQuestion(
  q: AwakeningQuestion,
  value: string | number,
  sessionId: string,
  evidence: EvidenceLevel = "self_reported"
): AwakeningAnswer {
  return {
    questionId: q.id,
    sessionId,
    beat: q.beat,
    value,
    capabilities: signalsFor(q, value),
    loops: loopsFor(q, value),
    band: bandFor(q, value),
    evidence,
  };
}

function bandFor(q: AwakeningQuestion, value: string | number): number | undefined {
  if (q.kind === "choice") return q.options.find((o) => o.id === value)?.band;
  if (q.kind === "scale" && typeof value === "number") {
    const signals = signalsFor(q, value);
    const vals = Object.values(signals);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : undefined;
  }
  return q.kind === "text" ? q.bandHint : undefined;
}

// ── 2. analyzeCapabilities — the honest map ─────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

/**
 * Fold every answer into the capability map. Rules:
 *   - neutral 5.0 with zero evidence (we do not assume either way),
 *   - deeper beats weigh more (reflection > investigation > observation),
 *   - measured evidence outranks self-report in the level, not the score,
 *   - nothing here is a measurement of a person's worth — the summary says so.
 */
export function analyzeCapabilities(progress: AwakeningProgress): CapabilityMap {
  const sums: Record<CapabilityId, number> = {} as Record<CapabilityId, number>;
  const weights: Record<CapabilityId, number> = {} as Record<CapabilityId, number>;
  const levels: Record<CapabilityId, EvidenceLevel> = {} as Record<CapabilityId, EvidenceLevel>;
  for (const c of CAPABILITY_IDS) {
    sums[c] = 0;
    weights[c] = 0;
    levels[c] = "hypothesized";
  }

  for (const a of progress.answers) {
    const w = (BEAT_WEIGHT[a.beat] ?? 1) * (a.evidence === "measured" ? 1.3 : 1);
    for (const [cap, score] of Object.entries(a.capabilities) as [CapabilityId, number][]) {
      if (typeof score !== "number") continue;
      sums[cap] += score * w;
      weights[cap] += w;
      if (EVIDENCE_RANK[a.evidence] > EVIDENCE_RANK[levels[cap]]) levels[cap] = a.evidence;
    }
  }

  const scores = {} as Record<CapabilityId, number>;
  const evidence = {} as Record<CapabilityId, number>;
  for (const c of CAPABILITY_IDS) {
    scores[c] = weights[c] ? clamp(round1(sums[c] / weights[c]), 0, 10) : 5;
    evidence[c] = weights[c] ? Math.round(weights[c] * 10) / 10 : 0;
  }

  const ranked = CAPABILITY_IDS.slice().sort((a, b) => scores[a] - scores[b]);
  const answeredCount = progress.answers.length;
  const completed = progress.completed_session_ids.length;

  const summaryLines: string[] = [];
  if (answeredCount === 0) {
    summaryLines.push(
      "Nothing is read yet. The map stays blank until you have answered something — and it can change with any single answer."
    );
  } else {
    const weakest = ranked[0];
    const strongest = ranked[ranked.length - 1];
    summaryLines.push(
      `Provisional read from ${answeredCount} of your own answers across ${completed} session${completed === 1 ? "" : "s"} — an indicator, not a measurement of you.`
    );
    summaryLines.push(
      `Strongest right now: ${CAPABILITY_LABEL[strongest]} (${scores[strongest].toFixed(1)}). ${CAPABILITY_QUESTION[strongest]}`
    );
    summaryLines.push(
      `Growth edge: ${CAPABILITY_LABEL[weakest]} (${scores[weakest].toFixed(1)}) — that is where the next session aims.`
    );
    const measured = CAPABILITY_IDS.filter((c) => levels[c] === "measured");
    if (measured.length) {
      summaryLines.push(
        `${measured.map((c) => CAPABILITY_LABEL[c]).join(", ")} carries measured evidence from your practices — the strongest kind of reading we have.`
      );
    }
  }

  return {
    scores,
    evidence,
    levels,
    strongest: ranked[ranked.length - 1],
    weakest: ranked[0],
    answeredCount,
    summaryLines,
  };
}

// ── 3. the personal order and the next-session recommendation ───────────

/**
 * The user's personal order: session 1 always opens, session 11 always
 * closes, and the middle nine are re-ordered by capability gaps as the map
 * sharpens. Two users therefore walk the same eleven sessions in different
 * sequences — because they need different things from them.
 */
export function personalOrder(map: CapabilityMap | null): { id: string; reason: string }[] {
  const first = AWAKENING_SESSION_BY_ID("meet_the_observer")!;
  const last = AWAKENING_SESSION_BY_ID("design_conscious_life")!;
  const middle = AWAKENING_SESSIONS.filter((s) => s.id !== first.id && s.id !== last.id);

  if (!map || map.answeredCount === 0) {
    return AWAKENING_SESSIONS.map((s) => ({ id: s.id, reason: "the spine's own order" }));
  }

  const ranked = middle
    .map((s) => {
      // A session's value = how well it targets the user's weakest capabilities.
      const targets = s.capabilities;
      let value = 0;
      targets.forEach((c, i) => {
        const gap = 10 - map.scores[c];
        value += gap * (i === 0 ? 1 : 0.6);
      });
      return { s, value: value + hashString(`order:${s.id}`) * 0.5 };
    })
    .sort((a, b) => b.value - a.value)
    .map(({ s, value }) => ({
      id: s.id,
      reason:
        value > 12
          ? `aims straight at your growth edge — ${CAPABILITY_LABEL[map.weakest]}`
          : "builds on what you have already opened",
    }));

  return [
    { id: first.id, reason: "every later session depends on it" },
    ...ranked,
    { id: last.id, reason: "integrates everything the others opened" },
  ];
}

/**
 * What the user should do next, and why — in plain language, always
 * explainable. Anchors: session 1 first, session 11 only after the other
 * ten. The middle is gap-driven.
 */
export function recommendNext(progress: AwakeningProgress, map: CapabilityMap): Recommendation | null {
  const order = progress.order.length ? progress.order : AWAKENING_CANONICAL_ORDER;
  const remaining = order.filter((id) => !progress.completed_session_ids.includes(id));

  if (!remaining.length) return null;

  // Anchor 1: the observer session must come first.
  if (!progress.completed_session_ids.includes("meet_the_observer")) {
    const s = AWAKENING_SESSION_BY_ID("meet_the_observer")!;
    return {
      sessionId: s.id,
      sessionTitle: s.title,
      reason: "Everything else in the journey depends on learning to watch — so we start there, always.",
      targets: s.capabilities,
      confidence: "hypothesized",
    };
  }

  // Anchor 2: the integration session closes the journey.
  const middleRemaining = remaining.filter((id) => id !== "design_conscious_life");
  const chosenId = middleRemaining.length
    ? middleRemaining.reduce((best, id) => {
        const score = sessionGapScore(id, map);
        const bestScore = sessionGapScore(best, map);
        return score > bestScore ? id : best;
      }, middleRemaining[0])
    : "design_conscious_life";

  const session = AWAKENING_SESSION_BY_ID(chosenId)!;
  const primary = session.capabilities[0];
  const weakestTargeted = session.capabilities.includes(map.weakest);

  const reason = middleRemaining.length
    ? weakestTargeted
      ? `Your map currently reads ${CAPABILITY_LABEL[map.weakest]} as your growth edge (${map.scores[map.weakest].toFixed(1)}). This session trains it directly.`
      : `It builds ${session.capabilities.map((c) => CAPABILITY_LABEL[c].toLowerCase()).join(" and ")} — the next layer on top of what you have opened.`
    : "The other ten are complete. This one brings them together — and hands you the map.";

  return {
    sessionId: session.id,
    sessionTitle: session.title,
    reason,
    targets: session.capabilities,
    confidence: map.levels[primary] ?? "hypothesized",
  };
}

function sessionGapScore(sessionId: string, map: CapabilityMap): number {
  const s = AWAKENING_SESSION_BY_ID(sessionId);
  if (!s) return 0;
  let value = 0;
  s.capabilities.forEach((c, i) => {
    value += (10 - map.scores[c]) * (i === 0 ? 1 : 0.6);
  });
  return value + hashString(`gap:${sessionId}`) * 0.5;
}

// ── the post-journey path library ───────────────────────────────────────

export interface AwakeningPath {
  slug: string;
  title: string;
  capability: CapabilityId;
  reason: string;
  /** The journey door this path opens. */
  journeySlug?: string;
}

export const PATHS: AwakeningPath[] = [
  {
    slug: "attention-training",
    title: "Train Your Attention",
    capability: "attention",
    reason: "Structured attention practice with measurable returns — attention is the capability everything else borrows.",
    journeySlug: "decondition-the-mind",
  },
  {
    slug: "emotional-regulation",
    title: "Regulate Your Reactions",
    capability: "emotional_regulation",
    reason: "Widen the gap between feeling and action, deliberately, with breath and pause practices.",
    journeySlug: "stop-the-reactor",
  },
  {
    slug: "pattern-mapping",
    title: "Map Your Patterns",
    capability: "behavioral_patterns",
    reason: "Go deeper on the triggers and sequences you have started to see — patterns dissolve by being watched.",
    journeySlug: "befriend-the-shadow",
  },
  {
    slug: "self-inquiry",
    title: "Who Am I?",
    capability: "awareness",
    reason: "The question the first session opened, walked properly — the path of direct knowing.",
    journeySlug: "who-am-i",
  },
  {
    slug: "karma-and-work",
    title: "Work Without Wearing Out",
    capability: "intention",
    reason: "Intention, action, consequence — your working life as practice rather than treadmill.",
    journeySlug: "work-without-wearing-out",
  },
  {
    slug: "follow-through",
    title: "Build Follow-Through",
    capability: "discipline",
    reason: "Turn intention into action with a system instead of a push — small, repeatable, honest.",
    journeySlug: "the-open-journey",
  },
  {
    slug: "values-and-purpose",
    title: "Live Your Values",
    capability: "values",
    reason: "Examine the inherited goals and make decisions from priorities that are actually yours.",
    journeySlug: "the-open-journey",
  },
  {
    slug: "read-the-weather",
    title: "Read the Emotional Weather",
    capability: "reflection",
    reason: "Deepen the reflection practice — name what is moving, precisely, before it drives.",
    journeySlug: "read-the-weather",
  },
];

export function recommendPaths(map: CapabilityMap, limit = 3): PathRecommendation[] {
  const ranked = PATHS.slice()
    .map((p) => ({ p, gap: 10 - map.scores[p.capability] }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, limit);
  return ranked.map(({ p }) => ({
    slug: p.slug,
    title: p.title,
    reason: p.reason,
    journeySlug: p.journeySlug,
  }));
}

// ── loops named by the user's own answers ───────────────────────────────

export function loopsFromAnswers(answers: AwakeningAnswer[]): { id: string; name: string; score: number }[] {
  const scores: Record<string, number> = {};
  for (const a of answers) {
    const w = BEAT_WEIGHT[a.beat] ?? 1;
    for (const l of a.loops ?? []) scores[l] = (scores[l] ?? 0) + w;
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, score]) => ({ id, name: loopName(id), score: Math.round(score * 100) / 100 }));
}

export function loopName(id: string): string {
  return LOOP_CATALOG.find((l) => l.id === id)?.name ?? id;
}

export function loopHint(id: string): string {
  return LOOP_CATALOG.find((l) => l.id === id)?.hint ?? "";
}

// ── 4. buildReport — the final development report ───────────────────────

function sessionAnswers(progress: AwakeningProgress, sessionId: string): AwakeningAnswer[] {
  return progress.answers.filter((a) => a.sessionId === sessionId);
}

function countTextAnswers(progress: AwakeningProgress, sessionIds: string[]): number {
  return progress.answers.filter(
    (a) => sessionIds.includes(a.sessionId) && typeof a.value === "string" && String(a.value).trim().length > 3
  ).length;
}

/**
 * The session-11 report. Built only from what the user actually did:
 * their own answers, their own vows, their own practice completions.
 * Nothing is invented to make the experience feel intelligent.
 */
export function buildReport(progress: AwakeningProgress, map: CapabilityMap): DevelopmentReport {
  const patternsIdentified = loopsFromAnswers(progress.answers);
  const vowEntries = Object.entries(progress.vow_results);
  const vows = {
    kept: vowEntries.filter(([, v]) => v === "kept").length,
    partly: vowEntries.filter(([, v]) => v === "partly").length,
    notYet: vowEntries.filter(([, v]) => v === "not_yet").length,
    total: vowEntries.length,
  };

  const observationCount = countTextAnswers(progress, [
    "meet_the_observer",
    "automatic_patterns",
    "inner_world",
  ]);
  const patternCount = countTextAnswers(progress, [
    "automatic_patterns",
    "meet_your_triggers",
    "understand_your_karma",
  ]);
  const experimentsRun = progress.completed_session_ids.filter((id) => id !== "design_conscious_life").length;

  const sections: DevelopmentReport["sections"] = [
    {
      id: "awareness",
      title: "What you learned to notice",
      capability: "awareness",
      lines: [
        map.levels.awareness === "hypothesized"
          ? "You began the practice of noticing — the observer session is the foundation the rest stands on."
          : `Across the discovery sessions you recorded ${observationCount} written observation${observationCount === 1 ? "" : "s"} of your own experience.`,
        `Awareness reads ${map.scores.awareness.toFixed(1)} of 10 right now — ${map.levels.awareness === "measured" ? "measured from your practices" : "from your own answers, provisional"}.`,
      ],
    },
    {
      id: "patterns",
      title: "Patterns you identified",
      capability: "behavioral_patterns",
      lines: patternsIdentified.length
        ? [
            `You named ${patternCount} pattern${patternCount === 1 ? "" : "s"} in your own words, and your answers point at these loudest:`,
            ...patternsIdentified.slice(0, 3).map((p) => `• ${p.name}${loopHint(p.id) ? ` — ${loopHint(p.id)}` : ""}`),
          ]
        : [
            "You mapped the shape of your automatic patterns — triggers, sequences, and the action that repeats.",
            "The loudest loops have not declared themselves yet. They will, as the watching continues.",
          ],
    },
    {
      id: "karma",
      title: "Karma — what your actions created",
      capability: "intention",
      lines: [
        `You ran ${experimentsRun} real-world experiment${experimentsRun === 1 ? "" : "s"} and phrased ${vows.total} vow${vows.total === 1 ? "" : "s"} in your own words.`,
        vows.total
          ? `Of those: ${vows.kept} kept, ${vows.partly} partly, ${vows.notYet} not yet. The record is honest either way — it is karma data, not a grade.`
          : "No vows were recorded yet — the experiments are still ahead of you.",
      ],
    },
    {
      id: "attention",
      title: "Attention",
      capability: "attention",
      lines: [
        `Attention reads ${map.scores.attention.toFixed(1)} of 10 — ${CAPABILITY_QUESTION.attention}`,
        map.levels.attention === "measured"
          ? "This reading carries measured evidence from your practice sessions."
          : "This reading comes from your answers; the practices sharpen it with real measurement.",
      ],
    },
    {
      id: "regulation",
      title: "Emotional regulation",
      capability: "emotional_regulation",
      lines: [
        `Regulation reads ${map.scores.emotional_regulation.toFixed(1)} of 10 — the gap between what you feel and what you do about it.`,
        map.scores.emotional_regulation >= 7
          ? "You can feel something without it choosing your next action. That is a trained capability, not a personality trait."
          : "The pause is trainable. It starts with catching the early sign — which you have already practiced.",
      ],
    },
    {
      id: "discipline",
      title: "Follow-through",
      capability: "discipline",
      lines: [
        `Follow-through reads ${map.scores.discipline.toFixed(1)} of 10.`,
        vows.kept > 0
          ? `You kept ${vows.kept} of your own vow${vows.kept === 1 ? "" : "s"} — that is the system working, not willpower.`
          : "The smallest repeatable action beats the biggest intention. That is the whole of this capability.",
      ],
    },
    {
      id: "values",
      title: "Values",
      capability: "values",
      lines: [
        `Values read ${map.scores.values.toFixed(1)} of 10 — how often your decisions come from priorities that are actually yours.`,
        "The test of a value is a choice made while it costs something. You made at least one in this journey.",
      ],
    },
  ];

  const ranked = CAPABILITY_IDS.slice().sort((a, b) => map.scores[b] - map.scores[a]);

  return {
    headline: `Eleven sessions. ${progress.answers.length} of your own answers. One map that is now yours to run.`,
    sections,
    patternsIdentified,
    practicesCompleted: progress.completed_session_ids.length,
    vows,
    strengths: ranked.slice(0, 2),
    growthEdges: ranked.slice(-2).reverse(),
    recommendedPaths: recommendPaths(map),
  };
}

// ── convenience ─────────────────────────────────────────────────────────

export { AWAKENING_SESSIONS, AWAKENING_TOTAL, AWAKENING_SESSION_BY_ID, AWAKENING_CANONICAL_ORDER };
