const fs = require('fs');
const labRegistry = fs.readFileSync('src/games/shell/labRegistry.ts', 'utf8');

const lines = labRegistry.split('\n');
const games = [];
let inArray = false;
for (const line of lines) {
  if (line.includes('export const LAB_GAMES')) inArray = true;
  if (!inArray) continue;
  if (line.trim() === '];') break;
  if (line.includes('tier:') && line.includes('available:')) {
    const idMatch = line.match(/id: "([^"]+)"/);
    const nameMatch = line.match(/name: "([^"]+)"/);
    const tierMatch = line.match(/tier: "([^"]+)"/);
    const availMatch = line.match(/available: (true|false)/);
    if (idMatch && nameMatch && tierMatch && availMatch) {
      games.push({ 
        id: idMatch[1], 
        name: nameMatch[1],
        tier: tierMatch[1],
        available: availMatch[1]
      });
    }
  }
}

console.log('ALL GAMES BY TIER:');
const byTier = {};
games.forEach(g => {
  if (!byTier[g.tier]) byTier[g.tier] = [];
  byTier[g.tier].push(g);
});

['S', 'A', 'B', 'C'].forEach(tier => {
  if (byTier[tier]) {
    console.log('\nTIER ' + tier + ' (' + byTier[tier].length + '):');
    byTier[tier].forEach(g => console.log('  - [' + g.available + ']', g.id, ':', g.name));
  }
});