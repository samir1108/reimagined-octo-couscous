import fs from 'fs';

const labRegistry = fs.readFileSync('src/games/shell/labRegistry.ts', 'utf8');
const gameRoute = fs.readFileSync('src/pages/GameRoute.tsx', 'utf8');

const labGameIds = labRegistry.match(/id: "([^"]+)"/g) || [];
console.log('LabRegistry game IDs:', labGameIds.length);

const loaderIds = gameRoute.match(/"([^"]+)":\s*\(\) => import/g) || [];
console.log('GameRoute loader IDs:', loaderIds.length);

const labSet = new Set(labGameIds.map(m => m.match(/id: "([^"]+)"/)[1]));
const loaderSet = new Set(loaderIds.map(m => m.match(/"([^"]+)"/)[1]));

console.log('\nIn labRegistry but NOT in loaders:');
[...labSet].filter(id => !loaderSet.has(id)).forEach(id => console.log('  -', id));

console.log('\nIn loaders but NOT in labRegistry:');
[...loaderSet].filter(id => !labSet.has(id)).forEach(id => console.log('  -', id));