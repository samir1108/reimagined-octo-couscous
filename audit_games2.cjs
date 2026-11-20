const fs = require('fs');
const path = require('path');

const dir = 'src/games/games';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).sort();

const hist = {};
const rows = [];
for (const f of files) {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = c.split('\n').length;
  const bucket = lines < 60 ? '<60' : lines < 100 ? '60-99' : lines < 150 ? '100-149' : lines < 200 ? '150-199' : lines < 300 ? '200-299' : '300+';
  hist[bucket] = (hist[bucket] || 0) + 1;
  rows.push({ f: f.replace('.tsx', ''), lines });
}

console.log('HISTOGRAM');
Object.keys(hist).sort().forEach(k => console.log(' ', k, hist[k]));
console.log('');

// Files that are not standalone games (canvas companions etc.)
const companions = files.filter(f => /Canvas\.tsx$/.test(f));
console.log('Canvas companion files:', companions.length);
console.log(companions.join(', '));
console.log('');

const helpers = files.filter(f => /^_/.test(f));
console.log('Helper files:', helpers.join(', '));
console.log('');

// Which game files are missing from GameRoute loader?
const route = fs.readFileSync('src/pages/GameRoute.tsx', 'utf8');
const missing = [];
for (const f of files) {
  const n = f.replace('.tsx', '');
  if (/Canvas$/.test(n)) continue;
  if (!route.includes('"' + n + '"') && !route.includes("'" + n + "'")) missing.push(n);
}
console.log('Game files NOT referenced in GameRoute.tsx:', missing.length);
console.log(missing.join(', '));
console.log('');

// Registry ids
const reg = fs.readFileSync('src/games/shell/labRegistry.ts', 'utf8');
const ids = [...reg.matchAll(/id:\s*"([a-z0-9-]+)"/g)].map(m => m[1]);
const avail = [...reg.matchAll(/\{ id: "([a-z0-9-]+)"[^\n]*available: true/g)].map(m => m[1]);
console.log('LAB_GAMES ids:', ids.length, 'available:true inline matches:', avail.length);

fs.writeFileSync('audit_games.json', JSON.stringify({ hist, files: rows }, null, 2));
