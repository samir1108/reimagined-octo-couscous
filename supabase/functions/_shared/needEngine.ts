// ============================================================
// NEED ENGINE (server) — the 6th axis
// ------------------------------------------------------------
// Port of src/lib/needEngine/* so session composition is decided
// on the server, not in the client bundle.
//
// Decision, not generation:
//   score = 0.40 * (1 - familiarity)
//         + 0.30 * relevance
//         + 0.20 * readiness
//         + 0.10 * (1 - recency)
//         - 0.25 * recentlyUsed
//         (+0.18 requested)
//
// The LLM never decides the door. It only writes words for the door
// chosen here.
// ============================================================

export type ConceptId =
  | "observation"
  | "self_inquiry"
  | "neti_neti"
  | "witness"
  | "breath"
  | "body";

export type NeedIntent = "orient" | "first_contact" | "train" | "integrate" | "hold";

export interface ConceptPrerequisite {
  concept: ConceptId;
  minFamiliarity: number;
}

export interface ConceptDef {
  id: ConceptId;
  label: string;
  sanskrit?: string;
  practice: string;
  ladder: "observation" | "self_inquiry" | "neti_neti" | null;
  entryLevel: number;
  prerequisites: ConceptPrerequisite[];
  tasteMinutes: number;
  trainMinutes: number;
  teaching: string;
  metaphor: string;
  taste: string;
  question: string;
  carry: string;
  loopCategories: string[];
  dimensions: Array<"body" | "emotion" | "thought" | "awareness">;
}

export interface ConceptEvidence {
  conceptId: ConceptId;
  familiarity: number;
  exposureCount: number;
  practiceCount: number;
  selfReport: number;
  lastAt: string | null;
}

export interface NeedSignals {
  concepts: Record<ConceptId, ConceptEvidence>;
  activeLoops: string[];
  stressedDomains: string[];
  dimensionBands: Record<string, number>;
  overallBand: number;
  energy: "low" | "medium" | "high";
  timeBudgetMin: number;
  recentConceptIds: ConceptId[];
  capabilityLevels: Partial<Record<ConceptId, number>>;
}

export interface NeedStep {
  title: string;
  body: string;
  kind: "teach" | "taste" | "question" | "carry";
  seconds: number;
}

export interface NeedSessionShape {
  minutes: number;
  teachRatio: number;
  depth: "taste" | "guided" | "deep";
  steps: NeedStep[];
}

export interface NeedDecision {
  concept: ConceptId;
  label: string;
  intent: NeedIntent;
  familiarity: number;
  readiness: number;
  relevance: number;
  score: number;
  confidence: number;
  evidence: string[];
  why: string;
  shape: NeedSessionShape;
  practice: string;
  ladder: ConceptDef["ladder"];
  entryLevel: number;
}

// ─── Catalog (six doors, deliberately ordered) ────────────────────────────

export const CONCEPT_IDS: ConceptId[] = [
  "observation",
  "self_inquiry",
  "neti_neti",
  "witness",
  "breath",
  "body",
];

export const CONCEPTS: Record<ConceptId, ConceptDef> = {
  observation: {
    id: "observation",
    label: "Observation",
    sanskrit: "Sakshi",
    practice: "observe",
    ladder: "observation",
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 5,
    trainMinutes: 20,
    teaching:
      "Observation means seeing what is actually happening — sensation, breath, thought — without changing it, fixing it, or commenting on it.",
    metaphor:
      "Think of a cinema. The film is your experience. The screen is you. Observation is noticing the screen while the film plays.",
    taste:
      "For one minute, notice three things in order: the weight of your body on the seat, the air on your skin, one breath at the nostrils. Do not change any of them.",
    question: "Which was easier to notice — the body, or the breath?",
    carry:
      "Once today, when you catch yourself lost in thought, say silently: 'thinking'. Then return to one breath.",
    loopCategories: ["mental", "attention", "narrative", "cognitive_bias"],
    dimensions: ["thought", "awareness"],
  },

  self_inquiry: {
    id: "self_inquiry",
    label: "Self-Inquiry",
    sanskrit: "Atma Vichara",
    practice: "inquiry",
    ladder: "self_inquiry",
    entryLevel: 1,
    prerequisites: [{ concept: "observation", minFamiliarity: 0.35 }],
    tasteMinutes: 8,
    trainMinutes: 20,
    teaching:
      "Self-inquiry turns attention from the answer to the one who asks. The question 'Who am I?' is not a quiz — it is a way of looking back at the looker.",
    metaphor:
      "A torch lights the wall. Inquiry stops staring at the wall and follows the beam back to the hand holding it.",
    taste:
      "Ask once, softly: 'Who am I?' Do not answer. Notice the direction attention turns when no answer is given.",
    question: "What happened when you did not answer the question?",
    carry:
      "Next time a strong emotion rises, ask once: 'To whom does this come?' Let the answer be 'to me' — then look at that me.",
    loopCategories: ["identity", "ego", "belief", "validation", "comparison"],
    dimensions: ["thought", "awareness"],
  },

  neti_neti: {
    id: "neti_neti",
    label: "Neti-Neti",
    sanskrit: "Neti Neti",
    practice: "jnana",
    ladder: "neti_neti",
    entryLevel: 1,
    prerequisites: [
      { concept: "observation", minFamiliarity: 0.45 },
      { concept: "self_inquiry", minFamiliarity: 0.3 },
    ],
    tasteMinutes: 10,
    trainMinutes: 20,
    teaching:
      "Neti-neti is the discipline of saying 'not this' to every false identity until only what cannot be denied remains. It is not denial — it is precise discrimination.",
    metaphor:
      "Peeling an onion of labels — body, emotion, thought — without putting a new label on what is left.",
    taste:
      "Say slowly: 'This body is known by me; I am not only this body.' Feel the small gap between the knower and the known.",
    question: "If you are not only the body, what is doing the knowing?",
    carry:
      "Once today, when you say 'I am tired' or 'I am angry', add silently: 'this is known by me.'",
    loopCategories: ["identity", "ego", "belief", "narrative"],
    dimensions: ["thought", "awareness"],
  },

  witness: {
    id: "witness",
    label: "Witnessing",
    sanskrit: "Drashta",
    practice: "witness",
    ladder: null,
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 6,
    trainMinutes: 18,
    teaching:
      "Witnessing is resting as the awareness that notices thoughts, feelings, and sensations without becoming any of them.",
    metaphor:
      "Weather moves through the sky. You are not the weather, and you are not doing the sky either — you are the space it appears in.",
    taste:
      "Sit for one minute. When a thought appears, label it quietly: 'thinking'. Do not follow it. Return to the next breath.",
    question: "What was watching the thoughts?",
    carry:
      "Three times today, pause for one breath and ask: 'What is aware right now?'",
    loopCategories: ["mental", "attention", "narrative"],
    dimensions: ["thought", "awareness"],
  },

  breath: {
    id: "breath",
    label: "Breath Awareness",
    sanskrit: "Pranayama",
    practice: "breath",
    ladder: null,
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 5,
    trainMinutes: 15,
    teaching:
      "Breath awareness is knowing the breath as it is, without changing it. The breath is the one place body and mind always meet.",
    metaphor:
      "Watch a sleeping animal. You do not wake it to check it is breathing. You simply stay near.",
    taste:
      "For one minute, feel the breath at the nostrils. Long or short, smooth or rough — all of it is allowed.",
    question: "Where did you feel the breath most clearly?",
    carry:
      "Once today, take three breaths without changing them, and notice one thing that shifted.",
    loopCategories: ["control", "survival", "energy", "anxiety"],
    dimensions: ["body", "awareness"],
  },

  body: {
    id: "body",
    label: "Body Sensing",
    sanskrit: "Kaya",
    practice: "body",
    ladder: null,
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 7,
    trainMinutes: 18,
    teaching:
      "Body sensing is feeling the body as the body — weight, temperature, contact, vibration — instead of thinking about it.",
    metaphor:
      "The body is already here, already breathing, already touching the floor. The mind is somewhere else. Sensing is coming home.",
    taste:
      "Scan slowly from the crown to the feet. Name only what is actually felt: 'warm', 'tight', 'tingling', 'numb'.",
    question: "Which part of the body felt most awake?",
    carry:
      "Once today, put both feet on the floor and feel the contact for ten seconds.",
    loopCategories: ["body", "avoidance", "control", "survival"],
    dimensions: ["body", "emotion"],
  },
};

export function getConcept(id: ConceptId): ConceptDef {
  return CONCEPTS[id];
}

// ─── Familiarity ──────────────────────────────────────────────────────────

const clamp01 = (n: number): number =>
  Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

export function computeFamiliarity(input: {
  exposureCount?: number;
  practiceCount?: number;
  selfReport?: number;
}): number {
  const exposure = clamp01((input.exposureCount ?? 0) / 3);
  const practice = clamp01((input.practiceCount ?? 0) / 3);
  const self = clamp01(input.selfReport ?? 0);
  return Math.round((0.45 * exposure + 0.35 * practice + 0.2 * self) * 100) / 100;
}

function emptyConceptEvidence(conceptId: ConceptId): ConceptEvidence {
  return {
    conceptId,
    familiarity: 0,
    exposureCount: 0,
    practiceCount: 0,
    selfReport: 0,
    lastAt: null,
  };
}

export function emptyConceptEvidenceMap(): Record<ConceptId, ConceptEvidence> {
  return CONCEPT_IDS.reduce((acc, id) => {
    acc[id] = emptyConceptEvidence(id);
    return acc;
  }, {} as Record<ConceptId, ConceptEvidence>);
}

// ─── Detection ────────────────────────────────────────────────────────────

const daysSince = (iso: string | null): number => {
  if (!iso) return 999;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 999;
  return Math.max(0, (Date.now() - t) / 86_400_000);
};

function normalizeSignals(signals: Partial<NeedSignals>): NeedSignals {
  const concepts = emptyConceptEvidenceMap();
  for (const id of CONCEPT_IDS) {
    const given = signals.concepts?.[id];
    if (given) concepts[id] = { ...concepts[id], ...given };
  }
  return {
    concepts,
    activeLoops: signals.activeLoops ?? [],
    stressedDomains: signals.stressedDomains ?? [],
    dimensionBands: signals.dimensionBands ?? {},
    overallBand: signals.overallBand ?? 0,
    energy: signals.energy ?? "medium",
    timeBudgetMin: signals.timeBudgetMin ?? 10,
    recentConceptIds: signals.recentConceptIds ?? [],
    capabilityLevels: signals.capabilityLevels ?? {},
  };
}

function prerequisitesMet(
  def: ConceptDef,
  concepts: Record<ConceptId, ConceptEvidence>,
): boolean {
  return def.prerequisites.every(
    (p) => (concepts[p.concept]?.familiarity ?? 0) >= p.minFamiliarity,
  );
}

function relevanceFor(def: ConceptDef, signals: NeedSignals): number {
  const loopHit = signals.activeLoops.length
    ? Math.min(1, signals.activeLoops.length / 3) * 0.6 +
      (def.loopCategories.some((c) =>
        signals.activeLoops.some((l) => l.toLowerCase().includes(c))
      )
        ? 0.4
        : 0)
    : 0;

  const weakest = Object.entries(signals.dimensionBands)
    .filter(([, v]) => typeof v === "number")
    .sort((a, b) => (a[1] as number) - (b[1] as number))[0]?.[0];

  const dimensionHit =
    weakest && def.dimensions.includes(weakest as never) ? 0.75 : 0;

  const domainHit = signals.stressedDomains.length
    ? def.id === "breath" || def.id === "body"
      ? 0.35
      : 0.15
    : 0;

  return clamp01(Math.max(loopHit, dimensionHit) * 0.7 + domainHit * 0.3);
}

function readinessFor(def: ConceptDef, signals: NeedSignals): number {
  const level = signals.capabilityLevels[def.id] ?? 0;
  const band = clamp01(signals.overallBand / 10);
  return clamp01(0.55 * clamp01(level / 5) + 0.45 * band);
}

function chooseIntent(
  evidence: ConceptEvidence,
  readiness: number,
  signals: NeedSignals,
): NeedIntent {
  if (signals.energy === "low" && evidence.familiarity < 0.2) return "orient";
  if (evidence.exposureCount === 0 && evidence.familiarity < 0.2) return "orient";
  if (evidence.practiceCount === 0 || evidence.familiarity < 0.45) return "first_contact";
  if (readiness < 0.6) return "train";
  return "integrate";
}

function stepsFor(def: ConceptDef, intent: NeedIntent): NeedStep[] {
  const orient = (): NeedStep[] => [
    { title: `What ${def.label} is`, body: def.teaching, kind: "teach", seconds: 60 },
    { title: "One image", body: def.metaphor, kind: "teach", seconds: 45 },
    { title: "60-second taste", body: def.taste, kind: "taste", seconds: 60 },
    { title: "One question", body: def.question, kind: "question", seconds: 45 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  const firstContact = (): NeedStep[] => [
    { title: `Meet ${def.label}`, body: def.teaching, kind: "teach", seconds: 60 },
    { title: "Guided taste", body: `${def.taste}\n\n${def.metaphor}`, kind: "taste", seconds: 180 },
    { title: "Notice what happened", body: def.question, kind: "question", seconds: 60 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  const train = (): NeedStep[] => [
    { title: "One reminder", body: def.teaching, kind: "teach", seconds: 45 },
    {
      title: "The practice",
      body: `${def.taste}\n\nStay longer than feels comfortable. Do not add anything.`,
      kind: "taste",
      seconds: 600,
    },
    { title: "Observe honestly", body: def.question, kind: "question", seconds: 90 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  const integrate = (): NeedStep[] => [
    { title: "Recall", body: `Where did ${def.label} show up since last time?`, kind: "question", seconds: 60 },
    { title: "Deepen", body: `${def.taste}\n\nThis time, let the object change. Follow it.`, kind: "taste", seconds: 480 },
    { title: "Name the shift", body: def.question, kind: "question", seconds: 90 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  if (intent === "orient") return orient();
  if (intent === "first_contact") return firstContact();
  if (intent === "integrate") return integrate();
  return train();
}

export function shapeForIntent(
  def: ConceptDef,
  intent: NeedIntent,
  timeBudgetMin: number,
): NeedSessionShape {
  const budget = Math.max(3, Math.min(30, Math.round(timeBudgetMin || 10)));
  const minutes =
    intent === "orient"
      ? Math.min(6, Math.max(4, def.tasteMinutes))
      : intent === "first_contact"
        ? Math.min(12, Math.max(7, def.tasteMinutes + 3))
        : intent === "integrate"
          ? Math.min(16, Math.max(10, budget))
          : Math.min(25, Math.max(12, budget));

  const teachRatio =
    intent === "orient" ? 0.6 : intent === "first_contact" ? 0.35 : intent === "integrate" ? 0.25 : 0.15;

  const depth = intent === "orient" ? "taste" : intent === "first_contact" ? "guided" : "deep";

  return { minutes, teachRatio, depth, steps: stepsFor(def, intent) };
}

function evidenceLines(
  def: ConceptDef,
  evidence: ConceptEvidence,
  signals: NeedSignals,
  redirect?: { concept: ConceptId; familiarity: number; required: number },
): string[] {
  const lines: string[] = [];
  lines.push(`${evidence.exposureCount} completed ${def.label} sitting(s)`);
  lines.push(`${Math.round(evidence.familiarity * 100)}% familiarity from knowledge graph`);
  if (redirect) {
    const prereq = getConcept(redirect.concept);
    lines.push(
      `prerequisite ${prereq.label} at ${Math.round(redirect.familiarity * 100)}% (needs ${Math.round(redirect.required * 100)}%)`,
    );
  }
  if (signals.activeLoops[0]) lines.push(`active loop: ${signals.activeLoops[0]}`);
  const weakest = Object.entries(signals.dimensionBands)
    .filter(([, v]) => typeof v === "number")
    .sort((a, b) => (a[1] as number) - (b[1] as number))[0]?.[0];
  if (weakest) lines.push(`weakest dimension: ${weakest}`);
  if (signals.overallBand) lines.push(`journey band ${signals.overallBand}`);
  return lines;
}

function whyLine(
  def: ConceptDef,
  intent: NeedIntent,
  evidence: ConceptEvidence,
  shape: NeedSessionShape,
  redirect?: { concept: ConceptId },
): string {
  const pct = Math.round(evidence.familiarity * 100);
  if (redirect) {
    const prereq = getConcept(redirect.concept);
    return `Aapne ${prereq.label} ko abhi tak nahi chhua (${Math.round(evidence.familiarity * 100)}% familiarity), aur ${def.label} usi par khada hai. Isliye aaj ${shape.minutes} min ka ${prereq.label} orientation — ${def.label} uske baad.`;
  }
  if (intent === "orient") {
    return `${def.label} aapke liye naya hai (${pct}% familiarity). Aaj ${shape.minutes} minute ka orientation: ek idea, ek 60-second taste, ek carry. Practice agli baar.`;
  }
  if (intent === "first_contact") {
    return `Aap ${def.label} ke baare mein jaante hain, par abhi baith kar nahi kiya. Aaj ${shape.minutes} minute ka guided first contact — bas ek asli taste.`;
  }
  if (intent === "integrate") {
    return `${def.label} aapke paas already hai. Aaj ${shape.minutes} minute usko roz ki zindagi mein utaarne ke liye.`;
  }
  return `${def.label} familiar hai, isliye aaj ${shape.minutes} minute ka focused training — depth badhane ke liye.`;
}

export interface DetectOptions {
  requested?: ConceptId[];
}

export function detectNeed(
  input: Partial<NeedSignals>,
  options: DetectOptions = {},
): NeedDecision {
  const signals = normalizeSignals(input);

  const candidates = CONCEPT_IDS.map((id) => {
    const def = CONCEPTS[id];
    const evidence = { ...signals.concepts[id] };
    evidence.familiarity = computeFamiliarity(evidence);

    const eligible = prerequisitesMet(def, signals.concepts);
    const readiness = readinessFor(def, signals);
    const relevance = relevanceFor(def, signals);
    const recency = clamp01(1 - Math.min(1, daysSince(evidence.lastAt) / 7));
    const recentlyUsed = signals.recentConceptIds.includes(id) ? 1 : 0;
    const requestedBoost = options.requested?.includes(id) ? 0.18 : 0;

    const score = clamp01(
      0.4 * (1 - evidence.familiarity) +
        0.3 * relevance +
        0.2 * readiness +
        0.1 * (1 - recency) -
        0.25 * recentlyUsed +
        requestedBoost,
    );

    return { def, evidence, eligible, readiness, relevance, score };
  });

  const eligible = candidates.filter((c) => c.eligible);
  const pool = eligible.length ? eligible : [candidates[0]];
  const explicit = options.requested?.find((id) =>
    prerequisitesMet(CONCEPTS[id], signals.concepts)
  );
  const best = explicit
    ? (candidates.find((c) => c.def.id === explicit) ??
      pool.reduce((a, b) => (b.score > a.score ? b : a)))
    : pool.reduce((a, b) => (b.score > a.score ? b : a));

  const requestedId = options.requested?.find(
    (id) => !prerequisitesMet(CONCEPTS[id], signals.concepts),
  );
  const blocked = requestedId
    ? CONCEPTS[requestedId].prerequisites.find(
        (p) => (signals.concepts[p.concept]?.familiarity ?? 0) < p.minFamiliarity,
      )
    : undefined;

  let chosen = best;
  let redirect:
    | { concept: ConceptId; familiarity: number; required: number }
    | undefined;

  if (blocked) {
    const prereqDef = CONCEPTS[blocked.concept];
    const prereqEvidence = {
      ...signals.concepts[blocked.concept],
      familiarity: computeFamiliarity(signals.concepts[blocked.concept]),
    };
    chosen = {
      def: prereqDef,
      evidence: prereqEvidence,
      eligible: true,
      readiness: readinessFor(prereqDef, signals),
      relevance: relevanceFor(prereqDef, signals),
      score: 1 - prereqEvidence.familiarity,
    };
    redirect = {
      concept: blocked.concept,
      familiarity: prereqEvidence.familiarity,
      required: blocked.minFamiliarity,
    };
  }

  const intent = chooseIntent(chosen.evidence, chosen.readiness, signals);
  const shape = shapeForIntent(chosen.def, intent, signals.timeBudgetMin);
  const evidence = evidenceLines(chosen.def, chosen.evidence, signals, redirect);
  const confidence = clamp01(
    0.45 +
      0.1 * Math.min(3, chosen.evidence.exposureCount + chosen.evidence.practiceCount) +
      0.15 * (1 - chosen.evidence.familiarity) +
      (redirect ? 0.1 : 0),
  );

  return {
    concept: chosen.def.id,
    label: chosen.def.label,
    intent,
    familiarity: chosen.evidence.familiarity,
    readiness: Math.round(chosen.readiness * 100) / 100,
    relevance: Math.round(chosen.relevance * 100) / 100,
    score: Math.round(chosen.score * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    evidence,
    why: whyLine(chosen.def, intent, chosen.evidence, shape, redirect),
    shape,
    practice: chosen.def.practice,
    ladder: chosen.def.ladder,
    entryLevel: chosen.def.entryLevel,
  };
}

// ─── Reader (best-effort, read-only) ──────────────────────────────────────

const KEYWORDS: Record<ConceptId, string[]> = {
  observation: ["observation", "observe", "sakshi", "noticing"],
  self_inquiry: ["self inquiry", "self-inquiry", "atma vichara", "who am i", "who am i?"],
  neti_neti: ["neti", "not this", "via negativa"],
  witness: ["witness", "drashta", "witnessing"],
  breath: ["breath", "pranayama", "anapana"],
  body: ["body", "asana", "body scan", "somatic"],
};

const CONCEPT_PRACTICE_KEY: Record<ConceptId, string> = {
  observation: "observe",
  self_inquiry: "inquiry",
  neti_neti: "jnana",
  witness: "witness",
  breath: "breath",
  body: "body",
};

function textMatches(text: string, concept: ConceptId): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS[concept].some((k) => lower.includes(k));
}

function bump(
  map: Record<ConceptId, ConceptEvidence>,
  concept: ConceptId,
  patch: Partial<ConceptEvidence>,
): void {
  const current = map[concept];
  map[concept] = {
    ...current,
    exposureCount: current.exposureCount + (patch.exposureCount ?? 0),
    practiceCount: current.practiceCount + (patch.practiceCount ?? 0),
    selfReport: Math.max(current.selfReport, patch.selfReport ?? 0),
    lastAt:
      patch.lastAt && (!current.lastAt || new Date(patch.lastAt) > new Date(current.lastAt))
        ? patch.lastAt
        : current.lastAt,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function baseNeedSignals(): NeedSignals {
  return {
    concepts: emptyConceptEvidenceMap(),
    activeLoops: [],
    stressedDomains: [],
    dimensionBands: {},
    overallBand: 0,
    energy: "medium",
    timeBudgetMin: 10,
    recentConceptIds: [],
    capabilityLevels: {},
  };
}

export interface ReadNeedOptions {
  energy?: "low" | "medium" | "high";
  timeBudgetMin?: number;
  requested?: ConceptId[];
}

/**
 * Collects the same evidence the client reader used, but server-side.
 * No table is treated as required: a missing table means "no evidence yet",
 * never a broken session.
 */
export async function readNeedSignals(
  admin: any,
  userId: string,
  opts: ReadNeedOptions = {},
): Promise<NeedSignals> {
  const signals = baseNeedSignals();
  signals.energy = opts.energy ?? "medium";
  signals.timeBudgetMin = opts.timeBudgetMin ?? 10;

  const settled = await Promise.allSettled([
    admin
      .from("user_knowledge_nodes")
      .select("node_type,label,state,provenance,confidence,last_observed_at")
      .eq("user_id", userId)
      .limit(200),
    admin
      .from("sessions")
      .select("type,status,metadata,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(120),
    admin.from("active_loops").select("loop_id,is_active").eq("user_id", userId).limit(10),
    admin.from("user_practice_constellation").select("*").eq("user_id", userId).maybeSingle(),
    admin
      .from("user_consciousness_profile")
      .select("overall_band,dimension_bands")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const dataAt = (i: number): any[] => {
    const r = settled[i];
    return r.status === "fulfilled" ? (r.value?.data ?? []) : [];
  };

  for (const node of dataAt(0) as Array<Record<string, unknown>>) {
    const state = asRecord(node.state);
    const text = `${String(node.label ?? "")} ${JSON.stringify(state)}`;
    const provenance = String(node.provenance ?? "inferred");
    for (const concept of CONCEPT_IDS) {
      if (!textMatches(text, concept)) continue;
      const exposure =
        typeof state.exposure_count === "number" ? Number(state.exposure_count) : 1;
      const practiced =
        typeof state.practice_count === "number"
          ? Number(state.practice_count)
          : provenance === "practiced" || provenance === "observed"
            ? 1
            : 0;
      const report =
        provenance === "reported" ? Math.max(0, Math.min(1, Number(node.confidence ?? 0.6))) : 0;
      bump(signals.concepts, concept, {
        exposureCount: exposure,
        practiceCount: practiced,
        selfReport: report,
        lastAt: node.last_observed_at ? String(node.last_observed_at) : null,
      });
    }
  }

  const sessions = dataAt(1) as Array<Record<string, unknown>>;
  const recentConcepts = new Set<ConceptId>();
  for (let i = 0; i < sessions.length; i += 1) {
    const session = sessions[i];
    const text = `${String(session.type ?? "")} ${JSON.stringify(session.metadata ?? {})}`;
    const completed = String(session.status ?? "").toLowerCase() === "completed";
    const createdAt = session.created_at ? String(session.created_at) : null;
    for (const concept of CONCEPT_IDS) {
      if (!textMatches(text, concept)) continue;
      bump(signals.concepts, concept, {
        exposureCount: 1,
        practiceCount: completed ? 1 : 0,
        lastAt: createdAt,
      });
      if (i < 3) recentConcepts.add(concept);
    }
  }

  const loops = dataAt(2) as Array<Record<string, unknown>>;
  signals.activeLoops = loops
    .filter((l) => l.is_active !== false)
    .map((l) => String(l.loop_id ?? ""))
    .filter(Boolean);

  const constellationRow = settled[3].status === "fulfilled" ? settled[3].value?.data : null;
  if (constellationRow) {
    const row = asRecord(constellationRow);
    for (const concept of CONCEPT_IDS) {
      const key = `${CONCEPT_PRACTICE_KEY[concept]}_level`;
      const level = Number(row[key]);
      if (Number.isFinite(level)) signals.capabilityLevels[concept] = level;
    }
  }

  const profileRow = settled[4].status === "fulfilled" ? settled[4].value?.data : null;
  if (profileRow) {
    const row = asRecord(profileRow);
    signals.overallBand = Number(row.overall_band) || 0;
    signals.dimensionBands = asRecord(row.dimension_bands) as Record<string, number>;
  }

  for (const concept of CONCEPT_IDS) {
    signals.concepts[concept] = {
      ...signals.concepts[concept],
      familiarity: computeFamiliarity(signals.concepts[concept]),
    };
  }

  signals.recentConceptIds = Array.from(recentConcepts);
  return signals;
}

export async function readNeedDecision(
  admin: any,
  userId: string,
  opts: ReadNeedOptions = {},
): Promise<NeedDecision> {
  const signals = await readNeedSignals(admin, userId, opts);
  return detectNeed(signals, { requested: opts.requested });
}
