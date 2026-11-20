/**
 * PRACTICE MATRIX READER (v4 Theme Engine)
 *
 * Maps the 12-practice × 4-dimension matrix from user_practice_levels rows
 * into a structured signal that the AI prompt can reason over.
 *
 * The 12 practices live in 3 layers:
 *   LAYER 1 (Core)      → observation, self_inquiry, breath_awareness, witnessing, body_awareness
 *   LAYER 2 (Path)      → bhakti, karma, jnana, raja
 *   LAYER 3 (Specialty) → kriya, tantra, neuroscience, life_domain
 *                          + emotional_healing, loop_dissolution (per-row columns)
 */

export type Dimension = "thought" | "emotion" | "body" | "awareness";
export type YogaPath = "bhakti" | "karma" | "jnana" | "raja";

export interface PracticeRow {
  practice_type: string;
  current_level: number;
  sessions_at_level?: number;
  emotional_healing?: number;
  loop_dissolution?: number;
}

export interface SpecialtyRow {
  practice_type: string;
  is_active?: boolean;
  conditions_met?: string[] | null;
  conditions_required?: string[] | null;
}

export interface LifeDomainRow {
  domain: string;
  score?: number;
  trend?: string;
  stressors?: string[] | null;
}

interface PracticeMeta {
  layer: 1 | 2 | 3;
  dims: Dimension[];      // which dimensions this practice trains
  maxLevel: number;
  label: string;
}

// Each practice → which dimensions it trains + max level (per blueprint)
export const PRACTICE_META: Record<string, PracticeMeta> = {
  // ── Layer 1: Core ──
  observation:      { layer: 1, dims: ["awareness", "thought"],     maxLevel: 7, label: "Observation" },
  self_inquiry:     { layer: 1, dims: ["thought", "awareness"],     maxLevel: 6, label: "Self-Inquiry" },
  breath_awareness: { layer: 1, dims: ["body", "awareness"],        maxLevel: 5, label: "Breath Awareness" },
  witnessing:       { layer: 1, dims: ["awareness"],                maxLevel: 5, label: "Witnessing" },
  body_awareness:   { layer: 1, dims: ["body", "emotion"],          maxLevel: 5, label: "Body Awareness" },
  // ── Layer 2: Path ──
  bhakti:           { layer: 2, dims: ["emotion", "awareness"],     maxLevel: 5, label: "Bhakti" },
  karma:            { layer: 2, dims: ["body", "thought"],          maxLevel: 5, label: "Karma" },
  jnana:            { layer: 2, dims: ["thought", "awareness"],     maxLevel: 6, label: "Jnana" },
  raja:             { layer: 2, dims: ["thought", "body"],          maxLevel: 8, label: "Raja" },
  // ── Layer 3: Specialty ──
  kriya:            { layer: 3, dims: ["body", "awareness"],        maxLevel: 7, label: "Kriya" },
  tantra:           { layer: 3, dims: ["body", "awareness"],        maxLevel: 5, label: "Tantra" },
  neuroscience:     { layer: 3, dims: ["thought", "body"],          maxLevel: 5, label: "Neuroscience" },
  neti_neti:        { layer: 3, dims: ["thought", "awareness"],     maxLevel: 4, label: "Neti-Neti" },
};

const ALL_PRACTICES = Object.keys(PRACTICE_META);

export interface MatrixSlice {
  practice: string;
  label: string;
  level: number;
  maxLevel: number;
  layer: 1 | 2 | 3;
  dims: Dimension[];
}

export interface PracticeMatrixSignal {
  /** Full per-practice level map (filled with 0 for unseen practices). */
  levels: Record<string, number>;
  /** Practices grouped by dimension. */
  byDimension: Record<Dimension, MatrixSlice[]>;
  /** Lowest-level practice across all 12 — the natural growth target. */
  weakestPractice: MatrixSlice | null;
  /** Highest-level practice — where they are deep. */
  strongestPractice: MatrixSlice | null;
  /** Dominant yoga path (highest level among bhakti/karma/jnana/raja). */
  dominantPath: { path: YogaPath; level: number } | null;
  /** Weakest yoga path — the growth path. */
  weakestPath: { path: YogaPath; level: number } | null;
  /** L+1 micro-practice anchor for the weakest core practice. */
  microAnchor: { practice: string; nextLevel: number; hint: string } | null;
  /** Spread metric — high spread = T-shape, low = balanced. */
  spread: number;
  /** Average level across the matrix. */
  avgLevel: number;
  /** Has anything plateaued? (high sessions_at_level, low growth). */
  plateauedPractice: { practice: string; level: number; sessionsAtLevel: number } | null;
  /** Specialty cards: which are active, which are locked. */
  specialties: { active: string[]; locked: string[] };
  /** Life domain cards (Relationship/Work/Finance/Health) — sorted by stress (lowest score first). */
  lifeDomains: { domain: string; score: number; trend: string; stressed: boolean }[];
  /** Most stressed life domain — natural focus for today's theme. */
  mostStressedDomain: string | null;
  /** Compact text block for the AI prompt. */
  promptBlock: string;
}

/** L+1 micro-practice hints — what the next level looks like in 1 line. */
const NEXT_LEVEL_HINTS: Record<string, Record<number, string>> = {
  observation: {
    1: "5-sense anchoring (sight/sound/touch/taste/smell, 30 sec)",
    2: "label thoughts as they pass: 'planning', 'remembering', 'judging'",
    3: "track an emotion for 60 sec without naming it good/bad",
    4: "scan body slowly head-to-toe, naming sensations only",
    5: "notice the tiny gap between two thoughts — once",
    6: "ask 'who is the one observing?' and rest in the question",
  },
  self_inquiry: {
    1: "ask 'what am I feeling right now?' — answer in 1 word",
    2: "ask 'where did this thought come from?' — sit 30 sec",
    3: "pick one belief — ask 'is this absolutely true?'",
    4: "ask 'who is the one asking?' — don't answer, just wait",
    5: "Ramana's 'who am I?' — return to it 3 times today",
    6: "let the question dissolve into its own silence",
  },
  breath_awareness: {
    1: "watch one full natural breath without changing it",
    2: "count 1–10 breaths, restart if you lose track",
    3: "try 4-7-8 (in 4, hold 7, out 8) for 4 cycles",
    4: "feel breath traveling along the spine — 5 breaths",
    5: "let the breath breathe itself — don't direct it",
  },
  witnessing: {
    1: "watch one daily event without judging it good/bad",
    2: "catch one reaction the second it begins — just notice",
    3: "see one loop fire today — name the pattern silently",
    4: "hold sakshi bhav (witness state) through one full task",
    5: "rest as the witness even in transitions",
  },
  body_awareness: {
    1: "progressive body scan — head to toe, 90 seconds",
    2: "locate where one emotion lives in the body",
    3: "feel prana/energy in the palms or spine",
    4: "treat body as sacred — one slow conscious gesture",
    5: "soften the boundary between body and space",
  },
  bhakti: {
    1: "name 3 things you're grateful for — feel them",
    2: "hum or chant one mantra/song from the heart",
    3: "surrender one thing you're gripping — say it aloud",
    4: "rest in heart center, send love outward",
    5: "love without an object — just love itself",
  },
  karma: {
    1: "do one act today expecting nothing back",
    2: "do one task with full skill as offering",
    3: "release attachment to one outcome (Gita 2.47)",
    4: "see service in a small mundane act",
    5: "act from stillness — no doer-thought",
  },
  jnana: {
    1: "discriminate: name 1 real vs 1 unreal thing",
    2: "neti-neti the body — 'I have a body, I am not the body'",
    3: "neti-neti thoughts — 'I have thoughts, I am not them'",
    4: "sit with 'tat tvam asi' (I am that) for 1 minute",
    5: "use viveka in one decision today",
    6: "see directly — without the seer",
  },
  raja: {
    1: "practice one yama (ahimsa — non-harm) all day",
    2: "practice one niyama (santosha — contentment)",
    3: "sit in steady comfortable posture for 5 min",
    4: "regulate breath: equal in / equal out × 10",
    5: "withdraw from one input (phone/news) for 1 hr",
    6: "concentrate on one point for 3 min",
    7: "let concentration deepen into meditation",
    8: "rest in absorption — no object, no observer",
  },
  kriya: {
    1: "watch breath at the nostrils for 2 minutes",
    2: "alternate-nostril breathing × 5 cycles",
    3: "kapalbhati × 30 + light bandha",
    4: "spinal breathing — energy up the sushumna",
    5: "full kriya sequence (with guidance)",
    6: "subtle body work — feel the chakras spin",
    7: "rest as prana moves on its own",
  },
  tantra: {
    1: "see the divine in one mundane object today",
    2: "scan the 7 chakras once — name what you feel",
    3: "balance masculine/feminine in one action",
    4: "treat one daily ritual as sacred ceremony",
    5: "everything is consciousness — rest in that",
  },
  neuroscience: {
    1: "identify head/heart/gut signals in one decision",
    2: "interrupt one habitual pattern — choose differently",
    3: "humming/chanting → vagus nerve regulation × 3 min",
    4: "10 min closed-eye rest — quiet default mode network",
    5: "feel head + heart + gut coherent in one moment",
  },
  neti_neti: {
    1: "'I am not this body' — sit 30 sec with that",
    2: "'I am not these thoughts' — sit 30 sec",
    3: "'I am not these emotions' — sit 30 sec",
    4: "what remains when all is negated? rest there",
  },
};

export function buildPracticeMatrixSignal(
  rows: PracticeRow[] | null | undefined,
  specialtyRows?: SpecialtyRow[] | null,
  domainRows?: LifeDomainRow[] | null,
): PracticeMatrixSignal {
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeSpecialties = Array.isArray(specialtyRows) ? specialtyRows : [];
  const safeDomains = Array.isArray(domainRows) ? domainRows : [];

  // Build full level map — fill 0 for unseen practices
  const levels: Record<string, number> = {};
  for (const p of ALL_PRACTICES) levels[p] = 0;
  for (const r of safeRows) {
    if (r?.practice_type && PRACTICE_META[r.practice_type]) {
      levels[r.practice_type] = r.current_level || 0;
    }
  }

  // Group by dimension
  const byDimension: Record<Dimension, MatrixSlice[]> = {
    thought: [],
    emotion: [],
    body: [],
    awareness: [],
  };
  for (const p of ALL_PRACTICES) {
    const meta = PRACTICE_META[p];
    const slice: MatrixSlice = {
      practice: p,
      label: meta.label,
      level: levels[p],
      maxLevel: meta.maxLevel,
      layer: meta.layer,
      dims: meta.dims,
    };
    for (const d of meta.dims) byDimension[d].push(slice);
  }

  // Weakest / strongest core+path practices (skip layer 3)
  const layer12 = ALL_PRACTICES
    .filter((p) => PRACTICE_META[p].layer <= 2)
    .map((p) => ({ p, level: levels[p], meta: PRACTICE_META[p] }));
  const sorted = [...layer12].sort((a, b) => a.level - b.level);
  const weak = sorted[0];
  const strong = sorted[sorted.length - 1];

  const weakestPractice: MatrixSlice | null = weak
    ? { practice: weak.p, label: weak.meta.label, level: weak.level, maxLevel: weak.meta.maxLevel, layer: weak.meta.layer, dims: weak.meta.dims }
    : null;
  const strongestPractice: MatrixSlice | null = strong
    ? { practice: strong.p, label: strong.meta.label, level: strong.level, maxLevel: strong.meta.maxLevel, layer: strong.meta.layer, dims: strong.meta.dims }
    : null;

  // Dominant / weakest yoga path
  const paths: YogaPath[] = ["bhakti", "karma", "jnana", "raja"];
  const pathLevels = paths.map((p) => ({ path: p, level: levels[p] }));
  const sortedPaths = [...pathLevels].sort((a, b) => b.level - a.level);
  const dominantPath = sortedPaths[0]?.level > 0 ? sortedPaths[0] : null;
  const weakestPath = [...pathLevels].sort((a, b) => a.level - b.level)[0] || null;

  // L+1 micro-anchor for the weakest core practice
  let microAnchor: PracticeMatrixSignal["microAnchor"] = null;
  if (weakestPractice) {
    const next = Math.min(weakestPractice.level + 1, weakestPractice.maxLevel);
    const hint = NEXT_LEVEL_HINTS[weakestPractice.practice]?.[next] || "stay one beat longer than yesterday";
    microAnchor = { practice: weakestPractice.label, nextLevel: next, hint };
  }

  // Spread (max - min) across layer 1+2 → high = T-shape, low = balanced
  const lvls = layer12.map((x) => x.level);
  const minL = Math.min(...lvls, 0);
  const maxL = Math.max(...lvls, 0);
  const spread = maxL - minL;
  const avgLevel = lvls.length > 0 ? lvls.reduce((a, b) => a + b, 0) / lvls.length : 0;

  // Plateau: any practice with sessions_at_level >= 14 (2+ weeks stuck)
  let plateauedPractice: PracticeMatrixSignal["plateauedPractice"] = null;
  for (const r of safeRows) {
    if ((r?.sessions_at_level || 0) >= 14 && r.current_level > 0) {
      if (!plateauedPractice || (r.sessions_at_level || 0) > plateauedPractice.sessionsAtLevel) {
        plateauedPractice = { practice: r.practice_type, level: r.current_level, sessionsAtLevel: r.sessions_at_level || 0 };
      }
    }
  }

  // Specialty activation status (the 7 specialty cards)
  const SPECIALTY_KEYS = ["kriya","tantra","neuroscience","emotional_healing","loop_dissolution"];
  const activeSpecs: string[] = [];
  const lockedSpecs: string[] = [];
  for (const key of SPECIALTY_KEYS) {
    const row = safeSpecialties.find((s) => s.practice_type === key);
    if (row?.is_active) activeSpecs.push(key);
    else lockedSpecs.push(key);
  }

  // Life domains — sort by lowest score (most stressed first)
  const lifeDomains = safeDomains
    .map((d) => ({
      domain: d.domain,
      score: typeof d.score === "number" ? d.score : 5,
      trend: d.trend || "stable",
      stressed: (typeof d.score === "number" ? d.score : 5) < 5,
    }))
    .sort((a, b) => a.score - b.score);
  const mostStressedDomain = lifeDomains[0]?.stressed ? lifeDomains[0].domain : null;

  // Build prompt block
  const lines: string[] = [];
  lines.push(`═══ PRACTICE MATRIX (12 × 4 dimensions) ═══`);
  for (const dim of ["thought", "emotion", "body", "awareness"] as Dimension[]) {
    const slices = byDimension[dim].map((s) => `${s.label}=L${s.level}`).join(", ");
    lines.push(`  ${dim.toUpperCase()}: ${slices}`);
  }
  lines.push(`Avg level: ${avgLevel.toFixed(1)} · Spread: ${spread} (${spread >= 3 ? "T-SHAPE — deep in some, shallow in others" : "BALANCED — even across practices"})`);
  if (weakestPractice) lines.push(`WEAKEST CORE/PATH: ${weakestPractice.label} (L${weakestPractice.level}/${weakestPractice.maxLevel}) — primary growth target.`);
  if (strongestPractice) lines.push(`STRONGEST CORE/PATH: ${strongestPractice.label} (L${strongestPractice.level}/${strongestPractice.maxLevel}) — confidence anchor.`);
  if (dominantPath) lines.push(`DOMINANT YOGA PATH: ${dominantPath.path} (L${dominantPath.level}) — speak in this dialect.`);
  if (weakestPath && weakestPath.level < (dominantPath?.level || 0)) {
    lines.push(`WEAKEST YOGA PATH: ${weakestPath.path} (L${weakestPath.level}) — gentle stretch only.`);
  }
  if (microAnchor) lines.push(`L+1 MICRO-ANCHOR (target this exactly): ${microAnchor.practice} L${microAnchor.nextLevel} → "${microAnchor.hint}".`);
  if (plateauedPractice) lines.push(`PLATEAU DETECTED: ${plateauedPractice.practice} stuck at L${plateauedPractice.level} for ${plateauedPractice.sessionsAtLevel} sessions — consider cross-pollination.`);

  // Specialties block
  lines.push(`SPECIALTIES ACTIVE: ${activeSpecs.length > 0 ? activeSpecs.join(", ") : "(none yet)"} — eligible to weave into theme.`);
  if (lockedSpecs.length > 0) lines.push(`SPECIALTIES LOCKED: ${lockedSpecs.join(", ")} — DO NOT teach these directly; user has not unlocked them.`);

  // Life domains block
  if (lifeDomains.length > 0) {
    const domainStr = lifeDomains.slice(0, 4).map((d) => `${d.domain}=${d.score.toFixed(1)}/10${d.stressed ? "⚠" : ""}`).join(", ");
    lines.push(`LIFE DOMAINS: ${domainStr}`);
    if (mostStressedDomain) {
      lines.push(`MOST STRESSED DOMAIN: ${mostStressedDomain} — today's theme should land in this area of life.`);
    }
  }

  return {
    levels,
    byDimension,
    weakestPractice,
    strongestPractice,
    dominantPath,
    weakestPath,
    microAnchor,
    spread,
    avgLevel,
    plateauedPractice,
    specialties: { active: activeSpecs, locked: lockedSpecs },
    lifeDomains,
    mostStressedDomain,
    promptBlock: lines.join("\n"),
  };
}
