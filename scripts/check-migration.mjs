#!/usr/bin/env node
/**
 * Structural check of the emitted mirror migrations.
 *
 *   node scripts/check-migration.mjs
 *
 * There is no local Postgres in this environment, so this checks the things
 * that can actually go wrong in generated SQL:
 *
 *   1. Every `'...'::jsonb` literal un-escapes and parses as JSON. The emitter
 *      only doubles single quotes; if that is wrong, every bank inserts a
 *      corrupt `questions` / `result_types` payload and the app silently loses
 *      its content. This is the highest-risk part of the migration and the
 *      reason this script exists.
 *   2. Every VALUES tuple has exactly as many top-level values as the column
 *      list has columns.
 *   3. BEGIN/COMMIT are balanced and each slug is upserted exactly once.
 *   4. The file is clean UTF-8 — a hand-written migration in this repo arrived
 *      as mojibake, which is how an encoding bug announces itself.
 *
 * It does not replace applying the migration.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrations = path.join(root, 'supabase/migrations');

const files = (await readdir(migrations))
  .filter((f) => f.endsWith('.sql'))
  .filter((f) => /mirror_readings|mirror_banks/.test(f))
  .sort();

if (!files.length) {
  console.error('No mirror migrations found. Run: node scripts/emit-mirror-migrations.mjs');
  process.exit(1);
}

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`   FAIL ${msg}`);
};

/**
 * Walk the SQL, yielding every string literal's raw (still-escaped) body along
 * with the token that follows it. This is the only reliable way to find
 * literals in generated SQL: the content is full of apostrophes ("don't") that
 * have been doubled, and full of parentheses and braces inside JSON.
 */
function* tokens(sql) {
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") {
            j += 2;
            continue;
          }
          break;
        }
        j++;
      }
      // After the closing quote, the next token tells us the cast.
      let k = j + 1;
      while (k < sql.length && /\s/.test(sql[k])) k++;
      let cast = '';
      if (sql.startsWith('::', k)) {
        let m = k + 2;
        while (m < sql.length && /[a-zA-Z]/.test(sql[m])) m++;
        cast = sql.slice(k, m);
      }
      yield { raw: sql.slice(i + 1, j), cast, start: i };
      i = j + 1;
      continue;
    }
    i++;
  }
}

/** SQL standard-conforming strings: only single quotes need doubling. */
const unquote = (raw) => raw.replaceAll("''", "'");

/** Split a VALUES body into top-level tuples, respecting string literals. */
function splitTuples(body) {
  const tuples = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (inString) {
      if (c === "'") {
        if (body[i + 1] === "'") i++;
        else inString = false;
      }
      continue;
    }
    if (c === "'") {
      inString = true;
    } else if (c === '(') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === ')') {
      depth--;
      if (depth === 0 && start >= 0) {
        tuples.push(body.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return tuples;
}

/** Count top-level commas in a tuple body, ignoring literals. */
function countValues(tuple) {
  const inner = tuple.slice(1, -1);
  let depth = 0;
  let commas = 0;
  let inString = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inString) {
      if (c === "'") {
        if (inner[i + 1] === "'") i++;
        else inString = false;
      }
      continue;
    }
    if (c === "'") inString = true;
    else if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === ',' && depth === 0) commas++;
  }
  return commas + 1;
}

// ─── Run ───

console.log(`Checking ${files.length} migration file(s)\n`);

for (const file of files) {
  const sql = await readFile(path.join(migrations, file), 'utf8');
  console.log(`── ${file}  (${(sql.length / 1024).toFixed(0)} KB)`);

  // 1. JSONB literals round-trip.
  let checked = 0;
  let bad = 0;
  for (const { raw, cast } of tokens(sql)) {
    if (cast !== '::jsonb') continue;
    checked++;
    const text = unquote(raw);
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) && typeof parsed !== 'object') {
        bad++;
        fail('jsonb literal parsed but is not an object or array');
      }
    } catch (error) {
      bad++;
      if (bad <= 3) {
        fail(`jsonb literal does not parse — ${error.message}`);
        console.log(`        near: ${text.slice(0, 100)}...`);
      }
    }
  }
  console.log(`   jsonb literals: ${checked} parsed, ${bad} bad`);

  // 2. Column count vs tuple arity.
  const pattern = /INSERT INTO public\.assessment_definitions \(([^)]*)\)\s*VALUES\s*([\s\S]*?);\n/g;
  let statements = 0;
  let tuples = 0;
  for (const [, cols, body] of sql.matchAll(pattern)) {
    statements++;
    const columnCount = cols.split(',').map((c) => c.trim()).filter(Boolean).length;
    for (const tuple of splitTuples(body)) {
      tuples++;
      const values = countValues(tuple);
      if (values !== columnCount) {
        fail(`tuple has ${values} values, column list has ${columnCount}`);
      }
    }
  }
  console.log(`   inserts: ${statements}, tuples arity-checked: ${tuples}`);

  // 3. Transaction + slug uniqueness.
  const begins = (sql.match(/^BEGIN;/gm) ?? []).length;
  const commits = (sql.match(/^COMMIT;/gm) ?? []).length;
  if (begins !== commits) fail(`BEGIN/COMMIT mismatch: ${begins} vs ${commits}`);

  const slugs = [...sql.matchAll(/ON CONFLICT \(slug\) DO UPDATE/g)].length;
  const rowSlugs = [...sql.matchAll(/^\s{4}\('([a-z0-9-]+)',/gm)].map((m) => m[1]);
  const dupes = rowSlugs.filter((s, i) => rowSlugs.indexOf(s) !== i);
  if (dupes.length) fail(`duplicate slugs: ${[...new Set(dupes)].join(', ')}`);
  if (slugs !== rowSlugs.length) {
    fail(`${rowSlugs.length} rows but ${slugs} ON CONFLICT clauses`);
  }
  console.log(
    `   transaction: ${begins} BEGIN / ${commits} COMMIT · ${rowSlugs.length} slugs, all unique`,
  );

  // 4. Encoding.
  const mojibake = sql.match(/Ã[\u0080-\u00BF]|â€[\u0080-\u009F]/g);
  if (mojibake) {
    fail(`${mojibake.length} mojibake sequence(s) — not clean UTF-8`);
  } else {
    console.log('   encoding: clean UTF-8');
  }

  console.log('');
}

if (failures) {
  console.log(`${failures} problem(s).`);
  process.exit(1);
}
console.log('All migration checks passed.');
