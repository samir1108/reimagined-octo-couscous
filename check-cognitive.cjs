const fs = require('fs');
const gameRoute = fs.readFileSync('src/pages/GameRoute.tsx', 'utf8');
const gamesTs = fs.readFileSync('src/lib/games/games.ts', 'utf8');

// Get cognitive game IDs
const cognitiveIds = gamesTs.match(/game_[a-z_]+/g) || [];
console.log('Cognitive game IDs:', cognitiveIds.length);
console.log('Sample:', cognitiveIds.slice(0, 10));

// Get loader IDs
const loaderIds = gameRoute.match(/"([^"]+)":\s*\(\) => import/g) || [];
const loaderSet = new Set(loaderIds.map(m => m.match(/"([^"]+)"/)[1]));

console.log('\nLoaders for cognitive games:');
cognitiveIds.forEach(id => {
  if (loaderSet.has(id)) {
    console.log('  HAS LOADER:', id);
  } else {
    console.log('  NO LOADER:', id);
  }
});