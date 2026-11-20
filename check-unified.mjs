import fs from 'fs';

const unifiedRegistry = fs.readFileSync('src/lib/games/unifiedRegistry.ts', 'utf8');
const gameRoute = fs.readFileSync('src/pages/GameRoute.tsx', 'utf8');

const unifiedIds = unifiedRegistry.match(/id: "([^"]+)"/g) || [];
console.log('UnifiedRegistry game IDs:', unifiedIds.length);

const loaderIds = gameRoute.match(/"([^"]+)":\s*\(\) => import/g) || [];
console.log('GameRoute loader IDs:', loaderIds.length);

const unifiedSet = new Set(unifiedIds.map(m => m.match(/id: "([^"]+)"/)[1]));
const loaderSet = new Set(loaderIds.map(m => m.match(/"([^"]+)"/)[1]));

console.log('\nIn unifiedRegistry but NOT in loaders (BROKEN LINKS):');
const missing = [...unifiedSet].filter(id => !loaderSet.has(id));
missing.forEach(id => console.log('  -', id));

console.log('\nIn loaders but NOT in unifiedRegistry:');
[...loaderSet].filter(id => !unifiedSet.has(id)).forEach(id => console.log('  -', id));

console.log('\n\nTotal missing loaders:', missing.length);