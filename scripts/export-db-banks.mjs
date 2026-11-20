#!/usr/bin/env node
/**
 * Pull the 32 database-resident mirror banks out of the live Supabase project
 * and into version control.
 *
 *   node scripts/export-db-banks.mjs              # write src/data/mirrors/db-banks.json
 *   node scripts/export-db-banks.mjs --dry-run    # report only
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 * The original 32 banks (mirrors 1-3, 11-13, 19, 21-25, 31-39, 43, 44, 46, 49,
 * 51, 52, 55, 56, 61-63, 71-73, 81-84, 91, 92, 98) were inserted straight into
 * the remote `assessment_definitions` table. There is no seed migration for
 * them anywhere in this repo, so a fresh database cannot reproduce them and
 * nobody can review a change to them.
 *
 * The 61 banks in src/data/mirrors/ are the opposite — versioned, diffable,
 * and regenerable. This script closes that gap: it exports the 32 to a JSON
 * file in the repo, so the whole 93-slug library lives in source control.
 *
 * Requires the anon/publishable key to be able to SELECT assessment_definitions.
 * If RLS blocks it, run once with a service_role key:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/export-db-banks.mjs
 */

import { readFileSync, writeFile, mkdir } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'src/data/mirrors/db-banks.json');
const dryRun = process.argv.includes('--dry-run');

// ─── Env ───

function envValue(name) {
  for (const file of ['.env', '.env.local', '.env.production']) {
    const p = path.join(root, file);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, 'utf8').match(
      new RegExp(`^${name}\\s*=\\s*(.+)$`, 'm'),
    );
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return process.env[name];
}

const url = envValue('VITE_SUPABASE_URL');
const anon = envValue('VITE_SUPABASE_PUBLISHABLE_KEY') || envValue('SUPABASE_ANON_KEY');
const service = envValue('SUPABASE_SERVICE_ROLE_KEY');

if (!url) {
  console.error('VITE_SUPABASE_URL not found (.env or environment).');
  process.exit(1);
}

const client = createClient(url, service || anon, {
  auth: { persistSession: false },
});

console.log(`URL:    ${url}`);
console.log(`Key:    ${service ? 'service_role' : 'anon/publishable'}`);

// ─── Which slugs ───

// Mirrors DB_RESIDENT_SLUGS in src/data/mirrors/registry.ts. Kept as a literal
// here so this script has no TypeScript dependency; registry.validate() checks
// the two against each other via the count, and the test suite asserts the
// registry's own list is 32.
const DB_RESIDENT_SLUGS = [
  'loop-map', 'spiritual-stage', 'inner-compass', 'three-brains',
  'dosha-constitution', 'mind-body-type', 'witness-capacity', 'presence-quality',
  'time-relationship', 'emotional-range', 'energy-bodies',
  'practice-level-calibration', 'path-affinity', 'triguna-analysis',
  'pancha-kosha', 'discipline-style', 'sankalpa-shakti', 'klesha-map',
  'attachment-style', 'purpose-mirror', 'jungian-archetypes', 'inner-council',
  'shadow-inventory', 'vasana-map', 'karmic-patterns', 'witchcraft-karma-memory',
  'relationship-roles', 'inner-child', 'spiritual-bypass', 'chakra-balance',
  'money-psyche', 'death-awareness',
];

// ─── Fetch ───

const COLUMNS = [
  'slug', 'title', 'subtitle', 'tradition', 'dimension_category', 'intro',
  'cover_emoji', 'estimated_minutes', 'question_count', 'questions',
  'scoring_logic', 'result_types', 'engine_hooks', 'version', 'sort_order',
];

const { data, error } = await client
  .from('assessment_definitions')
  .select(COLUMNS.join(','))
  .in('slug', DB_RESIDENT_SLUGS);

if (error) {
  console.error(`\nQuery failed: ${error.message}`);
  console.error(
    '\nIf this says zero rows, RLS is blocking the anon key. Re-run with a',
  );
  console.error('service role key:');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="..." ; node scripts/export-db-banks.mjs');
  process.exit(1);
}

const rows = data ?? [];
const found = new Set(rows.map((r) => r.slug));
const missing = DB_RESIDENT_SLUGS.filter((s) => !found.has(s));

console.log(`\nExpected: ${DB_RESIDENT_SLUGS.length}`);
console.log(`Found:    ${rows.length}`);
if (missing.length) {
  console.log(`Missing:  ${missing.length} — ${missing.join(', ')}`);
}

if (!rows.length) {
  console.error('\nNothing exported — the key cannot read the table.');
  process.exit(1);
}

const bank = rows.map((r) => ({
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  tradition: r.tradition,
  dimension_category: r.dimension_category,
  intro: r.intro,
  cover_emoji: r.cover_emoji,
  estimated_minutes: r.estimated_minutes,
  question_count: r.question_count,
  questions: r.questions,
  scoring_logic: r.scoring_logic,
  result_types: r.result_types,
  engine_hooks: r.engine_hooks,
  version: r.version,
  sort_order: r.sort_order,
}));

bank.sort((a, b) => a.slug.localeCompare(b.slug));

const summary = bank.map((b) => {
  const q = Array.isArray(b.questions) ? b.questions.length : 0;
  const rt = Array.isArray(b.result_types) ? b.result_types.length : 0;
  const tiers = new Set(
    (b.questions ?? []).map((question) =>
      Object.keys(question?.prompts ?? {}).sort().join('+'),
    ),
  );
  return `  ${String(q).padStart(2)}q ${String(rt).padStart(2)}r  ${b.slug}`;
});

console.log('\nExported banks:');
console.log(summary.join('\n'));

// ─── Write ───

if (dryRun) {
  console.log('\n--dry-run: nothing written.');
  process.exit(0);
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(
  outFile,
  `${JSON.stringify(bank, null, 2)}\n`,
  'utf8',
);

console.log(`\nWrote ${outFile}`);
console.log('This file is now the source of truth for those 32 banks.');
