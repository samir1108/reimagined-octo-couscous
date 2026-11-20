/**
 * MIRROR REGISTRY — the source of truth for every mirror question bank.
 *
 * Combines the authored banks across all ten modules, validates them, and
 * reports which checkpoint slugs are still unresolved.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 * The 32 original banks (mirrors 1–3, 11–13, 19, 21–25, 31–39, 43, 44, 46,
 * 49, 51, 52, 55, 56, 61–63, 71–73, 81–84, 91, 92, 98) exist only in the remote
 * Supabase database — there is no seed migration for `assessment_definitions`
 * anywhere in this repo. The 61 authored here close the other half of the
 * 93-slug library, and unlike their predecessors they are versioned in git,
 * reviewable in a diff, and reproducible with one command.
 *
 * Run `node scripts/emit-mirror-migrations.mjs --check` to verify coverage.
 */

import { MIRROR_CHECKPOINTS } from '@/data/pre-journey/mirrors';
import { toAssessmentRow, questionMeasures, normaliseBank, SCORING_OVERRIDES, type MirrorBank, type NormalisationReport } from './types';

import { WELCOME_BANKS } from './welcome';
import { ENGINES_BANKS } from './engines';
import { OBSERVATION_BANKS } from './observation';
import { SKILLS_BANKS } from './skills';
import { PATANJALI_BANKS } from './patanjali';
import { YOGAS_BANKS } from './yogas';
import { LEVELS_BANKS } from './levels';
import { LOOPS_BANKS } from './loops';
import { HEART_BANKS } from './heart';
import { LAUNCH_BANKS } from './launch';
import { LEGACY_A_BANKS } from './legacy-a';
import { LEGACY_B_BANKS } from './legacy-b';
import { LEGACY_C_BANKS } from './legacy-c';
import { LEGACY_D_BANKS } from './legacy-d';

// ─── Assembly ───

const AUTHORED: MirrorBank[] = [
  ...WELCOME_BANKS,
  ...ENGINES_BANKS,
  ...OBSERVATION_BANKS,
  ...SKILLS_BANKS,
  ...PATANJALI_BANKS,
  ...YOGAS_BANKS,
  ...LEVELS_BANKS,
  ...LOOPS_BANKS,
  ...HEART_BANKS,
  ...LAUNCH_BANKS,
  ...LEGACY_A_BANKS,
  ...LEGACY_B_BANKS,
  ...LEGACY_C_BANKS,
  ...LEGACY_D_BANKS,
];

/**
 * Questions whose option weights missed every declared dimension are rebuilt
 * as a scale over those dimensions. See `normaliseBank` for why. Exported so
 * the count is visible in review and in the migration emitter's output rather
 * than being a silent repair.
 */
export const NORMALISED: NormalisationReport[] = [];
export const MIRROR_BANKS: MirrorBank[] = AUTHORED.map((bank) => {
  const { bank: normalised, report } = normaliseBank(bank);
  NORMALISED.push(...report);
  return normalised;
});

export const MIRROR_BY_SLUG: Map<string, MirrorBank> = new Map(
  MIRROR_BANKS.map((b) => [b.slug, b]),
);

// All 32 former DB-resident slugs are now authored in-repo in legacy-a/b/c/d.ts.
// This list is retained as a record of the migration but carries no slugs.
export const DB_RESIDENT_SLUGS: readonly string[] = [];

// Must match src/types/consciousness.ts DimensionId and src/types/practices.ts
// PracticeId. Kept as literals so this module stays importable from Node by
// the migration emitter without dragging in the whole type graph.
//
// Declared before validate() is called — `registryIssues` is a module-level
// const, so these are still in their temporal dead zone otherwise.
const VALID_DIMENSION_IDS = new Set([
  'thought',
  'emotion',
  'body',
  'action',
  'connection',
  'spirit',
]);

const VALID_PRACTICE_IDS = new Set([
  'observation',
  'self-inquiry',
  'breath',
  'witnessing',
  'body',
  'bhakti',
  'karma',
  'jnana',
  'raja',
  'kriya',
  'tantra',
  'neuroscience',
  'relationship',
  'work-career',
  'finance',
  'health',
  'emotional-healing',
  'loop-dissolution',
]);

// ─── Validation ───

/**
 * Structural problems in the authored banks. A non-empty list means the
 * registry is not shippable — the emitter refuses to run.
 */
export const registryIssues: string[] = validate(MIRROR_BANKS);
function validate(banks: MirrorBank[]): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const bank of banks) {
    const at = bank.slug;

    if (seen.has(at)) issues.push(`${at}: duplicate slug`);
    seen.add(at);

    if (bank.dimensions.length < 2) {
      issues.push(`${at}: needs at least 2 dimensions`);
    }
    if (bank.questions.length < 5) {
      issues.push(`${at}: only ${bank.questions.length} questions, minimum is 5`);
    }
    if (bank.resultTypes.length < 2) {
      issues.push(`${at}: only ${bank.resultTypes.length} result types, minimum is 2`);
    }

    const dims = new Set(bank.dimensions);
    const resultIds = new Set(bank.resultTypes.map((r) => r.id));

    // Every result type must correspond to a declared dimension — the
    // scoring engine picks the primary by ranking dimensions, then looks up a
    // result type by that id. A mismatch means a blank result screen.
    for (const id of resultIds) {
      if (!dims.has(id)) {
        issues.push(`${at}: result type "${id}" is not a declared dimension`);
      }
    }
    for (const dim of dims) {
      if (!resultIds.has(dim)) {
        issues.push(`${at}: dimension "${dim}" has no result type — it cannot be shown`);
      }
    }

    const questionIds = new Set<string>();
    for (const question of bank.questions) {
      if (questionIds.has(question.id)) {
        issues.push(`${at}: duplicate question id "${question.id}"`);
      }
      questionIds.add(question.id);

      // `domain` is the display sub-theme, not a scoring key. What must be a
      // declared dimension is the dimension the question actually measures,
      // which is derived from its option weights.
      if (!questionMeasures(question, bank.dimensions)) {
        issues.push(`${at}: question "${question.id}" measures no declared dimension`);
      }
      if (!question.domain?.trim()) {
        issues.push(`${at}: question "${question.id}" has no display sub-theme`);
      }
      for (const tier of ['surface', 'deep', 'core'] as const) {
        if (!question.prompts[tier]?.trim()) {
          issues.push(`${at}: question "${question.id}" has no ${tier} prompt`);
        }
      }
      if (question.options.length < 2) {
        issues.push(`${at}: question "${question.id}" has ${question.options.length} options`);
      }
      const values = new Set<string>();
      for (const option of question.options) {
        if (values.has(option.value)) {
          issues.push(`${at}: question "${question.id}" has duplicate option value "${option.value}"`);
        }
        values.add(option.value);
        const keys = Object.keys(option.weights);
        if (keys.length === 0) {
          issues.push(`${at}: question "${question.id}" option "${option.value}" carries no weight`);
        }
        for (const key of keys) {
          if (!dims.has(key)) {
            issues.push(`${at}: question "${question.id}" weights unknown dimension "${key}"`);
          }
        }
      }
    }

    // Calibration keys must be real engine dimensions, and masters must be
    // real practice ids. A typo here silently does nothing at runtime.
    for (const result of bank.resultTypes) {
      for (const dim of Object.keys(result.calibration?.dimensions ?? {})) {
        if (!VALID_DIMENSION_IDS.has(dim)) {
          issues.push(`${at}: result "${result.id}" calibrates unknown dimension "${dim}"`);
        }
      }
      for (const practice of [
        ...(result.masters ?? []),
        ...(bank.engineHooks?.practiceAffinity ?? []),
        ...Object.keys(result.calibration?.practiceLevels ?? {}),
        ...Object.keys(result.calibration?.practiceBias ?? {}),
        ...Object.values(result.calibration?.domainStress ?? {}),
      ]) {
        if (!VALID_PRACTICE_IDS.has(practice)) {
          issues.push(`${at}: references unknown practice "${practice}"`);
        }
      }
    }
  }

  // Every scoring override must name a dimension its own bank declares, and
  // must name a question that exists. A typo here would silently send a
  // question's weight nowhere.
  for (const [key, override] of Object.entries(SCORING_OVERRIDES)) {
    const [slug, questionId] = key.split('/');
    const bank = banks.find((b) => b.slug === slug);
    if (!bank) {
      issues.push(`override "${key}": no bank with that slug`);
      continue;
    }
    if (!bank.questions.some((q) => q.id === questionId)) {
      issues.push(`override "${key}": no question with that id in ${slug}`);
    }
    if (override.dimension && !bank.dimensions.includes(override.dimension)) {
      issues.push(
        `override "${key}": "${override.dimension}" is not a dimension of ${slug} (${bank.dimensions.join(', ')})`,
      );
    }
    if (override.reverse && override.dimension) {
      issues.push(`override "${key}": sets both reverse and dimension`);
    }
  }

  return issues;
}

// ─── The 32 must be authored in-repo ────────────────────────────────────
//
// This is a separate list from `registryIssues` because it is the single
// clearest statement of what changed: every slug the app relied on for its
// first months is now in version control, reviewable in a diff and
// reproducible from source. `node scripts/emit-mirror-migrations.mjs --check`
// fails while this is non-empty.
export const LEGACY_SLUGS_NOT_AUTHORED: readonly string[] = DB_RESIDENT_SLUGS.filter(
  (slug) => !MIRROR_BY_SLUG.has(slug),
);

// ─── Coverage ───

/** Slugs referenced by the 100 checkpoints. */
export const CHECKPOINT_SLUGS: readonly string[] = [
  ...new Set(MIRROR_CHECKPOINTS.map((m) => m.assessmentSlug)),
];

/**
 * Checkpoint slugs that have no authored bank.
 *
 * `DB_RESIDENT_SLUGS` is deliberately NOT an exemption here any more. When
 * this gate was first written, 32 slugs were excused because they were
 * believed to live only in `assessment_definitions` — which turned out to be
 * an empty table. Every one of the 93 referenced slugs must now be authored in
 * this repo, and the emitter refuses to run until that is true.
 */
export const UNRESOLVED_SLUGS: readonly string[] = CHECKPOINT_SLUGS.filter(
  (slug) => !MIRROR_BY_SLUG.has(slug),
);

// ─── Runtime row shape ───

/**
 * The exact `assessment_definitions` insert shape, attached to each bank.
 * Stored at the surface tier; the adaptive engine re-tiers at read time.
 */
export const MIRROR_ROWS = MIRROR_BANKS.map((bank) => ({
  ...bank,
  __row: toAssessmentRow(bank),
}));

// ─── Lookup helpers ───

/** The authored bank for a slug, if this repo has it. */
export function getBank(slug: string): MirrorBank | undefined {
  return MIRROR_BY_SLUG.get(slug);
}

/** Whether a slug is authored here rather than living only in the database. */
export function isAuthored(slug: string): boolean {
  return MIRROR_BY_SLUG.has(slug);
}

export { MIRROR_CHECKPOINTS };
export type { MirrorBank };
