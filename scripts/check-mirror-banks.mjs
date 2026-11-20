/**
 * Structural validation of the mirror banks, runnable against a subset of
 * modules before the whole registry is assembled.
 *
 *   node scripts/check-mirror-banks.mjs welcome engines heart
 *
 * With no arguments it checks every module file it finds. This is the same
 * rule set as `registryIssues` in src/data/mirrors/registry.ts, factored out
 * so a partial registry can be verified while it is still being written.
 */

import * as esbuild from 'esbuild';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { mkdir, readdir, rm } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src/data/mirrors');
const outDir = path.join(root, 'node_modules/.cache/mirror-check');

const EXPORT_NAMES = {
  welcome: 'WELCOME_BANKS',
  engines: 'ENGINES_BANKS',
  observation: 'OBSERVATION_BANKS',
  skills: 'SKILLS_BANKS',
  patanjali: 'PATANJALI_BANKS',
  yogas: 'YOGAS_BANKS',
  levels: 'LEVELS_BANKS',
  loops: 'LOOPS_BANKS',
  heart: 'HEART_BANKS',
  launch: 'LAUNCH_BANKS',
  'legacy-a': 'LEGACY_A_BANKS',
  'legacy-b': 'LEGACY_B_BANKS',
  'legacy-c': 'LEGACY_C_BANKS',
  'legacy-d': 'LEGACY_D_BANKS',
};

const VALID_DIMENSIONS = new Set([
  'thought', 'emotion', 'body', 'action', 'connection', 'spirit',
]);

const VALID_PRACTICES = new Set([
  'observation', 'self-inquiry', 'breath', 'witnessing', 'body',
  'bhakti', 'karma', 'jnana', 'raja', 'kriya', 'tantra', 'neuroscience',
  'relationship', 'work-career', 'finance', 'health', 'emotional-healing',
  'loop-dissolution',
]);

const modules = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = modules.length
  ? modules
  : (await readdir(srcDir))
      .filter((f) => f.endsWith('.ts') && f !== 'types.ts' && f !== 'registry.ts')
      .map((f) => f.replace(/\.ts$/, ''))
      .filter((n) => EXPORT_NAMES[n]);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await esbuild.build({
  entryPoints: targets.map((t) => path.join(srcDir, `${t}.ts`)),
  outdir: outDir,
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'warning',
  // Bank modules import './types' relatively, so bundling is only needed to
  // satisfy the alias option — esbuild rejects an alias without it.
  external: ['react', 'react-dom'],
  alias: { '@': path.join(root, 'src') },
});

const banks = [];
const loadErrors = [];
for (const target of targets) {
  let mod;
  try {
    mod = await import(pathToFileURL(path.join(outDir, `${target}.js`)).href);
  } catch (error) {
    // A bank builder throws at module-evaluation time when its arguments are
    // malformed (see pickOne's arity check). Collect and report rather than
    // dying on the first one, so a single run lists every broken module.
    loadErrors.push(`${target}: ${error.message}`);
    continue;
  }
  const list = mod[EXPORT_NAMES[target]];
  if (!Array.isArray(list)) {
    loadErrors.push(`${target}: export ${EXPORT_NAMES[target]} is not an array`);
    continue;
  }
  banks.push(...list);
}

// ─── Rules ───

const issues = [];
const normalised = [];
const notes = [];
const fail = (slug, message) => issues.push(`${slug}: ${message}`);

for (const bank of banks) {
  const dims = new Set(bank.dimensions);
  const resultIds = new Set(bank.resultTypes.map((r) => r.id));

  if (bank.questions.length < 5) fail(bank.slug, `only ${bank.questions.length} questions`);
  if (bank.resultTypes.length < 2) fail(bank.slug, `only ${bank.resultTypes.length} result types`);

  for (const id of resultIds) {
    if (!dims.has(id)) fail(bank.slug, `result "${id}" is not a declared dimension`);
  }
  for (const d of dims) {
    if (!resultIds.has(d)) fail(bank.slug, `dimension "${d}" has no result type`);
  }

  const qids = new Set();
  for (const question of bank.questions) {
    if (qids.has(question.id)) fail(bank.slug, `duplicate question id "${question.id}"`);
    qids.add(question.id);

    if (!question.domain?.trim()) {
      fail(bank.slug, `question "${question.id}" has no display sub-theme`);
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      fail(
        bank.slug,
        `question "${question.id}" has ${Array.isArray(question.options) ? question.options.length : 'no'} options`,
      );
      continue;
    }
    // `domain` is the display sub-theme. The scoring dimension is derived from
    // the option weights — mirrors types.ts `questionMeasures`.
    const totals = {};
    for (const option of question.options) {
      for (const [key, weight] of Object.entries(option.weights ?? {})) {
        totals[key] = (totals[key] ?? 0) + weight;
      }
    }
    const stray = Object.keys(totals).filter((k) => !dims.has(k));
    const touchesDeclared = Object.keys(totals).some((k) => dims.has(k));
    if (!touchesDeclared) {
      // normaliseBank() rebuilds these as a scale over the declared dimensions.
      // Reported, not failed — the repair is auditable rather than silent.
      normalised.push(`${bank.slug} / ${question.id}  stray: ${stray.join(', ') || 'none'}`);
    } else if (stray.length) {
      notes.push(`${bank.slug} / ${question.id}  stray keys alongside declared: ${stray.join(', ')}`);
    }
    for (const tier of ['surface', 'deep', 'core']) {
      if (!question.prompts[tier]?.trim()) {
        fail(bank.slug, `question "${question.id}" has no ${tier} prompt`);
      }
    }
    const values = new Set();
    for (const option of question.options) {
      if (values.has(option.value)) {
        fail(bank.slug, `question "${question.id}" duplicate option "${option.value}"`);
      }
      values.add(option.value);
      if (Object.keys(option.weights).length === 0) {
        fail(bank.slug, `question "${question.id}" option "${option.value}" has no weight`);
      }
    }
  }

  for (const result of bank.resultTypes) {
    for (const dim of Object.keys(result.calibration?.dimensions ?? {})) {
      if (!VALID_DIMENSIONS.has(dim)) {
        fail(bank.slug, `result "${result.id}" calibrates unknown dimension "${dim}"`);
      }
    }
    const practices = [
      ...(result.masters ?? []),
      ...(bank.engineHooks?.practiceAffinity ?? []),
      ...Object.keys(result.calibration?.practiceLevels ?? {}),
      ...Object.keys(result.calibration?.practiceBias ?? {}),
      ...Object.values(result.calibration?.domainStress ?? {}),
    ];
    for (const practice of practices) {
      if (!VALID_PRACTICES.has(practice)) {
        fail(bank.slug, `references unknown practice "${practice}"`);
      }
    }
  }
}

// ─── Report ───

const byModule = targets.join(', ');

console.log(`Modules: ${byModule}`);
console.log(`Banks:   ${banks.length}`);
console.log(`Issues:  ${issues.length + loadErrors.length}`);
console.log(`Rebuilt: ${normalised.length} question(s) with undeclared weight keys`);

if (loadErrors.length) {
  console.log('\nModules that failed to load (a builder threw at evaluation time):');
  for (const error of loadErrors) console.log(`  - ${error}`);
}
if (normalised.length) {
  console.log('\nRebuilt as a scale over the declared dimensions:');
  for (const entry of normalised) console.log(`  · ${entry}`);
}
if (notes.length) {
  console.log('\nNotes:');
  for (const entry of notes) console.log(`  · ${entry}`);
}
if (issues.length) {
  console.log('');
  for (const issue of issues) console.log(`  - ${issue}`);
}

process.exit(issues.length || loadErrors.length ? 1 : 0);
