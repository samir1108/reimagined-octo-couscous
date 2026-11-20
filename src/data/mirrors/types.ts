/**
 * MIRROR BANK TYPES + AUTHORING BUILDERS
 *
 * Every mirror in the 100-checkpoint Inner Library is authored here as a
 * `MirrorBank`. The DB (`assessment_definitions`) is a runtime mirror of this
 * registry — the registry is the source of truth and the fallback when the DB
 * row is missing.
 *
 * ── Adaptive depth ──────────────────────────────────────────────────────
 * Each question carries THREE prompt tiers:
 *   surface — situation-based, low ego risk. Early mirrors.
 *   deep    — names the mechanism. Mid journey.
 *   core    — names the structure and points inward. Late mirrors.
 *
 * The tier is chosen per-mirror by `adaptiveEngine` from the user's prior
 * confidence. Options and weights are SHARED across tiers so scores stay
 * comparable mirror-to-mirror over the whole journey. Only the wording moves.
 *
 * ── Voice rules (enforced by review, from agents/insightLayer.ts) ────────
 *   - Never label the user. Ask; don't diagnose.
 *   - English only. No Hinglish, no Devanagari.
 *   - No promise of outcomes, no diagnosis, no fear-based framing.
 */

// ─── Tiers ───

export type MirrorTier = 'surface' | 'deep' | 'core';

export const MIRROR_TIERS: readonly MirrorTier[] = ['surface', 'deep', 'core'] as const;

// ─── Question ───

export interface MirrorOption {
  label: string;
  value: string;
  /** Sub-score contribution, keyed by the bank's `dimensions`. */
  weights: Record<string, number>;
}

export interface MirrorQuestion {
  id: string;
  /** Sub-theme shown next to the progress counter. */
  domain: string;
  /** Three wordings of the same question. Weights are identical across tiers. */
  prompts: Record<MirrorTier, string>;
  options: MirrorOption[];
}

// ─── Result types ───

export interface MirrorResultType {
  id: string;
  label: string;
  short: string;
  description: string;
  shadow?: string;
  color?: string;
  /** Masters/practices this reading routes toward. */
  masters?: string[];
  /**
   * Dimension deltas applied when this result is primary, on a 0..1 scale.
   * Consumed by `mirrorCalibration` — this is the mirror → engine bridge.
   */
  calibration?: MirrorCalibration;
}

export interface MirrorCalibration {
  /** 0..1 band nudges. Handed to `applySignals` as confidence-weighted deltas. */
  dimensions?: Record<string, number>;
  /** Practice level nudges, e.g. `{ witnessing: 1 }`. */
  practiceLevels?: Record<string, number>;
  /** Additive bonus applied to the practice the engine is already leaning to. */
  practiceBias?: Record<string, number>;
  /** Domain-stress seeds, e.g. `{ relation: 'relationship' }`. */
  domainStress?: Record<string, string>;
  /** Tag recorded on the reading so later mirrors can branch on it. */
  tags?: string[];
}

// ─── Engine hooks ───

export interface MirrorEngineHooks {
  /** Which loop families this mirror feeds or surfaces. */
  loopsToCheck?: string[];
  /** Practices this reading should bias toward, by id. */
  practiceAffinity?: string[];
  /** Reading that unlocks extra depth on this bank's own tiers. */
  deepensWith?: string[];
}

// ─── Bank ───

export interface MirrorBank {
  slug: string;
  title: string;
  subtitle: string;
  /** Must match a `module` in src/data/pre-journey/mirrors.ts. */
  module: string;
  tradition: string;
  /** Groups banks in the Library UI, e.g. 'witness' | 'shadow' | 'attachment'. */
  dimensionCategory: string;
  coverEmoji: string;
  intro: string;
  estimatedMinutes: number;
  /** Sub-score keys. Order is the display order. */
  dimensions: string[];
  questions: MirrorQuestion[];
  resultTypes: MirrorResultType[];
  engineHooks?: MirrorEngineHooks;
  /** Bumped whenever question content changes; stored with each result. */
  version: number;
}

// ─── Authoring builders ──────────────────────────────────────────────────
// These remove the need to hand-write option weights for every question.

/** One option with explicit weights. */
export function o(label: string, weights: Record<string, number>): MirrorOption {
  return { label, value: label, weights };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * n-point scale spread across `dims`. The first label scores the first
 * dimension highest, the last label scores the last dimension highest, and
 * labels in between interpolate — so a 5-label scale over 4 dimensions gives
 * option 0 all of dimension 0, option 2 a mix of dimensions 1 and 2, and
 * option 4 all of dimension 3.
 *
 * e.g. scale(['Always','Often','Sometimes','Rarely','Never'], ['discipline'])
 *        → weights 1, 0.75, 0.5, 0.25, 0 on 'discipline'
 *     scale(['Vata','Pitta','Kapha'], ['vata','pitta','kapha'])
 *        → each option scores 1 on exactly one dimension
 *
 * `n` and `m` do not have to match. When they do not, labels land between
 * dimensions and split their weight, which is what a five-step scale over a
 * four-state model should do.
 */
export function scale(labels: string[], dims: string[]): MirrorOption[] {
  const n = labels.length;
  const m = dims.length;
  if (n < 2) throw new Error(`scale: needs at least 2 labels, got ${n}`);
  if (m < 1) throw new Error('scale: needs at least 1 dimension');

  return labels.map((label, i) => {
    const w: Record<string, number> = {};

    if (m === 1) {
      // Degenerate case: every option only touches the one dimension, so the
      // spread has to come from the option's own position on the scale.
      w[dims[0]] = round2(1 - i / (n - 1));
      return o(label, w);
    }

    // Where this option sits along the dimension axis, 0..m-1.
    const pos = (i * (m - 1)) / (n - 1);
    for (let di = 0; di < m; di++) {
      w[dims[di]] = round2(Math.max(0, 1 - Math.abs(di - pos)));
    }
    return o(label, w);
  });
}

/** 5-point scale weighted toward the named dimension. */
export function toward(dim: string, low: string, high: string, middle = 'Depends'): MirrorOption[] {
  return [
    o(low, { [dim]: 0 }),
    o(middle, { [dim]: 0.5 }),
    o(high, { [dim]: 1 }),
  ];
}

/** 5-point likert on one dimension — clean, low, middling, high, clean. */
export function likert5(dim: string, labels: [string, string, string, string, string]): MirrorOption[] {
  const w = [0, 0.25, 0.5, 0.75, 1];
  return labels.map((label, i) => o(label, { [dim]: w[i] }));
}

/** n options, one per dimension — the "which of these is hardest" shape. */
export function pickOne(labels: string[], dims: string[]): MirrorOption[] {
  if (labels.length !== dims.length) {
    throw new Error(`pickOne: ${labels.length} labels vs ${dims.length} dims`);
  }
  return labels.map((label, i) => o(label, { [dims[i]]: 1 }));
}

// ─── Question builders ───────────────────────────────────────────────────

/** Question where the same measure is asked once, phrased for one tier. */
export function q(id: string, domain: string, prompt: string, options: MirrorOption[]): MirrorQuestion {
  return { id, domain, prompts: { surface: prompt, deep: prompt, core: prompt }, options };
}

/**
 * Question with three genuine wordings.
 * `surface` stays external and situational, `core` names the mechanism and
 * turns the lens inward. Options and weights stay shared.
 */
export function q3(
  id: string,
  domain: string,
  surface: string,
  deep: string,
  core: string,
  options: MirrorOption[],
): MirrorQuestion {
  return { id, domain, prompts: { surface, deep, core }, options };
}

/** Build the display form of a question for a given tier. */
export function promptFor(question: MirrorQuestion, tier: MirrorTier): string {
  return question.prompts[tier] ?? question.prompts.surface;
}

/**
 * Which scoring dimension a question actually measures.
 *
 * `question.domain` is the sub-theme shown next to the progress counter
 * ("breath", "recovery", "onset") and is deliberately free text — it is
 * display copy, not a scoring key. The dimension a question measures is
 * therefore derived from its option weights: whichever dimension carries the
 * most total weight across the question's options is the one it is about.
 *
 * This is what the adaptive engine prunes on, so a question that only ever
 * weights `nervous-tone` is the one that gets dropped once that dimension has
 * been measured to the ceiling several times.
 */
export function questionMeasures(
  question: MirrorQuestion,
  dimensions: string[],
): string {
  const totals: Record<string, number> = {};
  for (const option of question.options) {
    for (const [key, weight] of Object.entries(option.weights)) {
      totals[key] = (totals[key] ?? 0) + weight;
    }
  }
  let best: string | null = null;
  let bestTotal = -1;
  for (const dimension of dimensions) {
    const total = totals[dimension] ?? 0;
    if (total > bestTotal) {
      best = dimension;
      bestTotal = total;
    }
  }
  return best ?? dimensions[0] ?? '';
}

// ─── Scoring overrides ───────────────────────────────────────────────────
//
// `normaliseBank` rebuilds a question by projecting its option order onto the
// bank's dimensions. That is right for the majority of questions, because most
// are written as a continuum running in the same direction as the progression
// the bank's dimensions describe.
//
// It is wrong in two specific cases, and both are listed here rather than left
// to inference:
//
//   `reverse`   — the options run opposite to the dimension order. Picking the
//                 LAST option should score the FIRST dimension, not the last.
//   `dimension` — the question is a category pick, not a continuum. "Where in
//                 the body do you feel it?" cannot be smeared across
//                 threat/shame/rejection/control/injustice; it contributes to
//                 the one dimension it actually indicates.
//
// Keyed `bank/questionId`. This table is the single place to review scoring
// semantics — a question listed here is one whose authored answer otherwise
// scored backwards. If you rewrite a question with `scale` or `pickOne` over
// its bank's dimensions, delete its entry here.

export type ScoringOverride = { reverse?: true; dimension: string };

export const SCORING_OVERRIDES: Record<string, ScoringOverride> = {
  // ── life-season · threshold > emergence > consolidation > dissolution ──
  'life-season/season-effort': { dimension: 'emergence' },
  'life-season/season-obstacle': { dimension: 'dissolution' },
  // Being stuck on "it has been urgent for a long time" is a threshold state;
  // "no urgency at all" is the free end. Forward would invert it.
  'life-season/season-urgency': { reverse: true },
  'life-season/season-timed': { dimension: 'threshold' },

  // ── daily-rhythm · dissonance > absorption > flow > recovery ──
  // A day that matches the plan, and a day that barely interrupts you, are the
  // good ends. Forward put "I stopped planning entirely" on recovery.
  'daily-rhythm/rhythm-expected': { reverse: true },
  'daily-rhythm/rhythm-switches': { reverse: true },
  'daily-rhythm/rhythm-best-hour': { dimension: 'flow' },
  'daily-rhythm/rhythm-worst-hour': { dimension: 'dissonance' },

  // ── energy-baseline · depletion > oscillation > capacity > reserve ──
  'energy-baseline/energy-cause': { dimension: 'depletion' },

  // ── trigger-map · threat > shame > rejection > control > injustice ──
  // Bodily activation precedes the threat response; the question does not
  // discriminate the five trigger types.
  'trigger-map/trigger-body': { dimension: 'threat' },
  // Approval-dependence is the shame axis.
  'trigger-map/trigger-size': { dimension: 'shame' },
  // Severity, not trigger type — and both ends are "costly", so this is a
  // U-shape rather than a line. Pinned to the axis it actually indicates.
  'trigger-map/trigger-cost': { dimension: 'threat' },

  // ── ground-state · anxious > neutral > settled > content ──
  'ground-state/ground-unsettled': { dimension: 'anxious' },

  // ── attention-diet · scattered > stimulant > absorbed > sustained ──
  // Time of day is not a position on this axis; it is context.
  'attention-diet/diet-input': { dimension: 'stimulant' },

  // ── yamas · ahimsa > satya > asteya > brahmacharya > aparigraha ──
  'yamas/yama-restraint': { dimension: 'brahmacharya' },
  'yamas/yama-hoarding': { dimension: 'aparigraha' },

  // ── niyamas ──
  'niyamas/niyama-effort': { dimension: 'tapas' },
  'niyamas/niyama-study': { dimension: 'svadhyaya' },
  'niyamas/niyama-surrender': { dimension: 'ishvarapranidhana' },

  // ── pranayama-capacity · breath-only > retention > sama > sushumna ──
  // Dizziness is resistance. Both ends of this scale are unprogressed — never
  // tried and actively avoiding are the same place — so it is pinned rather
  // than reversed.
  'pranayama-capacity/prana-dizzy': { dimension: 'breath-only' },
  'pranayama-capacity/prana-effort': { dimension: 'sama' },

  // ── dharana · wandering > returning > sustained > one-pointed ──
  'dharana/dhara-object': { dimension: 'sustained' },
  'dharana/dhara-return': { dimension: 'returning' },

  // ── dhyana · broken > flowing > continuous > expanded ──
  'dhyana/dhyana-seek': { dimension: 'flowing' },

  // ── vairagya · attached > disenchanted > detached > dispassionate ──
  'vairagya/vairagya-hard': { dimension: 'attached' },
  'vairagya/vairagya-cost': { dimension: 'detached' },

  // ── jnana-aptitude · abstract > analytical > discriminating > seeing ──
  // Where you stop analysing. "Stops at the explanation" and "rarely goes
  // past it" are the same place, so this is pinned, not reversed.
  'jnana-aptitude/jnana-level': { dimension: 'analytical' },
  'jnana-aptitude/jnana-concept': { dimension: 'discriminating' },

  // ── raja-access · unregulated > partly-governed > mostly-governed > free ──
  // Slowing down to re-acquire control is worse, not better.
  'raja-access/raja-return': { reverse: true },
  'raja-access/raja-decider': { dimension: 'free-running' },
  'raja-access/raja-disrupt': { dimension: 'unregulated' },

  // ── devotional-object · none > external-figure > universal > formless ──
  'devotional-object/devotion-need': { dimension: 'universal' },
  'devotional-object/devotion-quality': { dimension: 'formless' },

  // ── detachment-grade · reactive > distancing > detached > free ──
  // Detachment that is explicitly armour is the far end from detachment.
  'detachment-grade/detach-defence': { reverse: true },

  // ── svadhyaya · none > occasional > regular > relentless ──
  'svadhyaya/study-record': { dimension: 'regular' },

  // ── service-radius · self > household > community > all-sentient ──
  'service-radius/service-cost': { reverse: true },
  // Needing the service to be seen is the narrow, self-referential end.
  'service-radius/service-visibility': { reverse: true },
  'service-radius/service-radius': { dimension: 'household' },
  'service-radius/service-difficulty': { dimension: 'all-sentient' },
  'service-radius/service-reciprocity': { dimension: 'community' },

  // ── sexuality-eros · suppressed > obligated > expressive > integrated ──
  'sexuality-eros/eros-for': { dimension: 'integrated' },
  'sexuality-eros/eros-split': { dimension: 'integrated' },
  'sexuality-eros/eros-restraint': { dimension: 'obligated' },

  // ── grief-reservoir · unfelt > held > surfacing > moved-through ──
  'grief-reservoir/grief-what': { dimension: 'unfelt' },
  'grief-reservoir/grief-volume': { dimension: 'held' },
  'grief-reservoir/grief-function': { dimension: 'moved-through' },

  // ── anger-signature · suppressed > leaked > expressed > transmuted ──
  'anger-signature/anger-for': { dimension: 'suppressed' },
  'anger-signature/anger-protects': { dimension: 'suppressed' },
  'anger-signature/anger-says': { dimension: 'transmuted' },
  // Turning anger entirely inward is the suppressed end.
  'anger-signature/anger-inward': { reverse: true },
  // A blast of volatile anger is the leaked end, not the transmuted one.
  'anger-signature/anger-speed': { reverse: true },

  // ── forgiveness-capacity · stored > grudging > releasing > freeing ──
  'forgiveness-capacity/forgive-who': { dimension: 'grudging' },
  'forgiveness-capacity/forgive-recurrence': { reverse: true },
  'forgiveness-capacity/forgive-purpose': { dimension: 'stored' },
  'forgiveness-capacity/forgive-cost': { dimension: 'releasing' },
  'forgiveness-capacity/forgive-body': { dimension: 'stored' },
  'forgiveness-capacity/forgive-beyond': { dimension: 'freeing' },

  // ── trust-baseline · guarded > conditional > open > naive-closed ──
  'trust-baseline/trust-betrayal': { dimension: 'guarded' },
  // Both ends are closed — taking years and closing in advance are the same
  // guarded posture. Pinned rather than reversed.
  'trust-baseline/trust-earn': { dimension: 'guarded' },
  'trust-baseline/trust-first': { dimension: 'guarded' },
  'trust-baseline/trust-rebuilt': { dimension: 'open' },
  'trust-baseline/trust-visible': { dimension: 'naive-closed' },
  'trust-baseline/trust-testing': { dimension: 'guarded' },

  // ── love-language ──
  // Neither end is consistent: a fixed way and no way at all are both
  // failures. Pinned to the axis the question is closest to.
  'love-language/love-variable': { dimension: 'understanding' },
  'love-language/love-land': { dimension: 'understanding' },
  'love-language/love-ask': { dimension: 'understanding' },

  // ── work-dharma · drifting > surviving > ambitious > called ──
  'work-dharma/work-avoid': { dimension: 'drifting' },
  'work-dharma/work-scale': { dimension: 'called' },
  'work-dharma/work-friction': { dimension: 'drifting' },

  // ── legacy-question · unconsidered > performative > intended > embodied ──
  'legacy-question/legacy-frame': { dimension: 'performative' },
  'legacy-question/legacy-thought': { dimension: 'intended' },
  'legacy-question/legacy-scale': { dimension: 'embodied' },

  // ── community-rooting · isolated > surface-level > belonging > rooted ──
  'community-rooting/community-given': { dimension: 'belonging' },
  'community-rooting/community-loss': { dimension: 'rooted' },
  'community-rooting/community-chosen': { dimension: 'belonging' },

  // ── ritual-life · none > occasional > inherited > chosen-and-kept ──
  'ritual-life/ritual-what': { dimension: 'inherited' },
  'ritual-life/ritual-alone': { dimension: 'chosen-and-kept' },

  // ── awe-frequency · rare > occasional > regular > constant ──
  'awe-frequency/awe-trigger': { dimension: 'occasional' },
  'awe-frequency/awe-disappear': { dimension: 'regular' },
  'awe-frequency/awe-shared': { dimension: 'constant' },

  // ── non-dual-glimpses · never > concept-only > brief-glimpses > recurring ──
  // "Not applicable" means the question has not been reached, and dislocation
  // is a setback — neither is the far end. Pinned.
  'non-dual-glimpses/nondual-after': { dimension: 'brief-glimpses' },
  // Avoidance of the subject is resistance, which is the never end.
  'non-dual-glimpses/nondual-fear': { reverse: true },
  'non-dual-glimpses/nondual-language': { dimension: 'brief-glimpses' },

  // ── liberation-aim ──
  'liberation-aim/liberation-escape': { dimension: 'release-from-samsara' },
  'liberation-aim/liberation-fear': { dimension: 'release-from-samsara' },
  'liberation-aim/liberation-body': { dimension: 'moksha-as-inquiry' },
};

/**
 * Look up the override for a question, if it has one.
 * `reverse` flips the option order; `dimension` pins the question to a single
 * dimension. The two are mutually exclusive by design — the table above never
 * sets both.
 */
export function scoringOverride(
  bankSlug: string,
  question: MirrorQuestion,
): ScoringOverride | null {
  return SCORING_OVERRIDES[`${bankSlug}/${question.id}`] ?? null;
}

// ─── Normalisation ───

export interface NormalisationReport {
  bank: string;
  questionId: string;
  /** The undeclared weight keys that were dropped. */
  strayKeys: string[];
  /** How the question was repaired. */
  mode: 'stripped' | 'rebuilt' | 'reversed' | 'pinned';
}

/**
 * Repoint a question's weights at the bank's declared dimensions.
 *
 * Authored questions sometimes carry descriptive weight keys that are not
 * scoring dimensions — a question about shame might weight `{ shame: 1 }`,
 * a question about disclosure `{ none: 1, partial: 0.5, stated: 0 }`. Those
 * keys are meaningful to the person writing the question and meaningless to
 * the scorer, which sums only the bank's declared dimensions. Left alone
 * they score nothing: the user answers, the number does not move, and the
 * reading quietly lies about how much evidence it has.
 *
 * So a question whose weights miss every declared dimension is rebuilt as a
 * `scale` over the bank's dimensions, using option order. That guarantees the
 * question counts — it will never score zero — but it is an approximation, not
 * a faithful translation.
 *
 * ── Where each repair came from ─────────────────────────────────────────
 * 193 of the library's questions carried weight keys that were not scoring
 * dimensions. This function makes every one of them score. The repairs are
 * recorded per question in `NORMALISED` and printed by
 * `scripts/emit-mirror-migrations.mjs`, split four ways:
 *
 *   stripped  (13) — stray keys removed; the declared ones already carried it.
 *   pinned    (75) — a category pick, routed to the one dimension it indicates
 *                   via `SCORING_OVERRIDES`.
 *   reversed  (11) — a continuum running opposite to the dimension order.
 *   rebuilt   (94) — a continuum running the same way as the dimension order,
 *                   projected with `scale`. This is the only mode still relying
 *                   on inference, and it is the residual review surface.
 *
 * Every one of the 193 is named in `NORMALISED`. If a specific question reads
 * wrong, add it to `SCORING_OVERRIDES` or rewrite it in the source module with
 * `scale` or `pickOne` over the declared dimensions.
 */
export function normaliseBank(
  bank: MirrorBank,
): { bank: MirrorBank; report: NormalisationReport[] } {
  const report: NormalisationReport[] = [];
  const questions = bank.questions.map((question) => {
    const stray = new Set<string>();
    for (const option of question.options) {
      for (const key of Object.keys(option.weights)) {
        if (!bank.dimensions.includes(key)) stray.add(key);
      }
    }

    if (stray.size === 0) return question;

    // A question can be in the override table AND have stray keys — the
    // override decides how it scores, so it wins.
    const override = scoringOverride(bank.slug, question);
    if (override) {
      report.push({
        bank: bank.slug,
        questionId: question.id,
        strayKeys: [...stray].sort(),
        mode: override.reverse ? 'reversed' : 'pinned',
      });
      return { ...question, options: applyOverride(question, override, bank.dimensions) };
    }

    // Candidate repair: drop the stray keys and keep whatever remains.
    const stripped = question.options.map((option) => {
      const weights: Record<string, number> = {};
      for (const [key, weight] of Object.entries(option.weights)) {
        if (bank.dimensions.includes(key)) weights[key] = weight;
      }
      return { ...option, weights };
    });

    // Every option has to score something. One surviving option among four dead
    // ones is not a repair, it is a question with four branches that do
    // nothing — so the threshold is `every`, not `some`.
    const usable = stripped.every((option) => Object.keys(option.weights).length > 0);
    if (usable) {
      report.push({
        bank: bank.slug,
        questionId: question.id,
        strayKeys: [...stray].sort(),
        mode: 'stripped',
      });
      return { ...question, options: stripped };
    }

    report.push({
      bank: bank.slug,
      questionId: question.id,
      strayKeys: [...stray].sort(),
      mode: 'rebuilt',
    });
    return {
      ...question,
      options: scale(
        question.options.map((option) => option.label),
        bank.dimensions,
      ),
    };
  });

  return { bank: { ...bank, questions }, report };
}

/**
 * Score a question according to its override.
 *
 * `reverse` — the options run opposite to the dimension order, so the list is
 * flipped before being projected. Picking the last option then scores the first
 * dimension, which is what the author's option order means.
 *
 * `dimension` — the question is a category pick, not a continuum. It lands on
 * one dimension: the chosen option scores that dimension, and the option's
 * position within the list is irrelevant. The last option still scores it
 * fully, so a user is never left with an option that does nothing.
 */
function applyOverride(
  question: MirrorQuestion,
  override: ScoringOverride,
  dimensions: string[],
): MirrorOption[] {
  if (override.dimension) {
    if (!dimensions.includes(override.dimension)) {
      throw new Error(
        `override for ${question.id} names dimension "${override.dimension}", which the bank does not declare`,
      );
    }
    return question.options.map((option) => o(option.label, { [override.dimension!]: 1 }));
  }

  const flipped = [...question.options].reverse();
  return scale(
    flipped.map((option) => option.label),
    dimensions,
  );
}

/** Build the flat question shape the DB / AssessmentRunner consumes. */
export function toRuntimeQuestion(question: MirrorQuestion, tier: MirrorTier) {
  return {
    id: question.id,
    type: 'choice' as const,
    prompt: promptFor(question, tier),
    domain: question.domain,
    options: question.options,
  };
}

/** Narrow an authored bank to a flat, runtime-safe payload. */
export function toRuntimeBank(bank: MirrorBank, tier: MirrorTier) {
  return {
    slug: bank.slug,
    title: bank.title,
    subtitle: bank.subtitle,
    intro: bank.intro,
    tradition: bank.tradition,
    dimension_category: bank.dimensionCategory,
    cover_emoji: bank.coverEmoji,
    estimated_minutes: bank.estimatedMinutes,
    question_count: bank.questions.length,
    questions: bank.questions.map((qq) => toRuntimeQuestion(qq, tier)),
    scoring_logic: {
      method: 'weighted_sum_percentage',
      dimensions: bank.dimensions,
      primary_rule: 'highest_sub_score',
    },
    result_types: bank.resultTypes,
    version: bank.version,
  };
}

/**
 * Flatten a bank to the exact `assessment_definitions` row shape.
 * The `surface` tier is the canonical persisted form; the adaptive engine
 * re-tier-ifies it at read time, so a stored bank never loses depth.
 */
export function toAssessmentRow(bank: MirrorBank) {
  const flat = toRuntimeBank(bank, 'surface');
  return {
    ...flat,
    engine_hooks: {
      loops_to_check: bank.engineHooks?.loopsToCheck ?? [],
      practice_affinity: bank.engineHooks?.practiceAffinity ?? [],
      deepens_with: bank.engineHooks?.deepensWith ?? [],
    },
    is_active: true,
    is_featured: false,
    sort_order: 100,
  };
}
