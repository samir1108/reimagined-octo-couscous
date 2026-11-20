#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const prdDir = join(root, 'docs', 'prd');
const TARGET = 100000;

const BUDGETS = {
  '00-CONVENTIONS.md': 400,
  'V01-FOUNDATION.md': 2600,
  'V02-DATA-MODEL.md': 3600,
  'V03-API.md': 3200,
  'V04-STUDIOS.md': 12000,
  'V05-CAPABILITIES.md': 34000,
  'V06-AGENTS.md': 6000,
  'V07-WORKFLOWS.md': 3000,
  'V08-UI.md': 5000,
  'V09-TESTS.md': 9000,
  'V10-TICKETS.md': 8000,
  'V11-OPS.md': 4000,
};

const REQUIRED = Object.keys(BUDGETS);

if (!existsSync(prdDir)) {
  console.error('docs/prd not found');
  process.exit(1);
}

const files = readdirSync(prdDir).filter((f) => f.endsWith('.md') && f !== '_progress.md');
const rows = [];
let total = 0;
let missing = [];

for (const file of REQUIRED) {
  const path = join(prdDir, file);
  if (!existsSync(path)) {
    missing.push(file);
    rows.push({ file, lines: 0, budget: BUDGETS[file], pct: 0, ids: 0, complete: false });
    continue;
  }
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n').filter((l) => l.trim().length > 0).length;
  const ids = (text.match(/COS-\d{2}-[A-Z]+-\d{3}/g) || []).length;
  total += lines;
  rows.push({
    file,
    lines,
    budget: BUDGETS[file],
    pct: Math.round((lines / BUDGETS[file]) * 100),
    ids,
    complete: lines >= BUDGETS[file] * 0.85 && ids > 0,
  });
}

const extra = files.filter((f) => !REQUIRED.includes(f));
const pad = (s, n) => String(s).padEnd(n);
const num = (n, w) => String(n).padStart(w);

console.log('\nCreativeOS PRD — status');
console.log('-'.repeat(74));
console.log(pad('file', 24) + num('lines', 8) + num('budget', 9) + num('%', 6) + num('ids', 7) + '  state');
console.log('-'.repeat(74));
for (const r of rows) {
  console.log(
    pad(r.file.replace('.md', ''), 24) +
      num(r.lines, 8) +
      num(r.budget, 9) +
      num(r.pct, 6) +
      num(r.ids, 7) +
      '  ' +
      (r.complete ? 'complete' : r.lines ? 'in progress' : 'not started')
  );
}
console.log('-'.repeat(74));
const done = rows.filter((r) => r.complete).length;
const pct = ((total / TARGET) * 100).toFixed(1);
console.log(`TOTAL ${total} / ${TARGET} lines  (${pct}%)   volumes complete: ${done}/${rows.length}`);
if (missing.length) console.log(`missing volumes: ${missing.join(', ')}`);
if (extra.length) console.log(`unbudgeted files: ${extra.join(', ')}`);
console.log('');

const bar = Math.round((total / TARGET) * 40);
writeFileSync(
  join(prdDir, '_progress.md'),
  [
    '# PRD PROGRESS (generated)',
    '',
    '```',
    '[' + '#'.repeat(bar) + '.'.repeat(40 - bar) + '] ' + pct + '%',
    '```',
    '',
    '| volume | lines | budget | % | ids | state |',
    '|---|---|---|---|---|---|',
    ...rows.map(
      (r) =>
        `| ${r.file} | ${r.lines} | ${r.budget} | ${r.pct}% | ${r.ids} | ${
          r.complete ? 'complete' : r.lines ? 'in progress' : 'not started'
        } |`
    ),
    '',
    `Total: **${total}** / ${TARGET}`,
    '',
    `Updated by \`node scripts/prd-status.mjs\`.`,
    '',
  ].join('\n')
);

if (total >= TARGET) console.log('TARGET REACHED');
