const fs = require('fs');
const labRegistry = fs.readFileSync('src/games/shell/labRegistry.ts', 'utf8');
const gameRoute = fs.readFileSync('src/pages/GameRoute.tsx', 'utf8');

// Extract all game IDs from labRegistry
const labGameIds = labRegistry.match(/id: "([^"]+)"/g) || [];
console.log('LabRegistry game IDs:', labGameIds.length);

// Extract loader IDs from GameRoute
const loaderIds = gameRoute.match(/"([^"]+)":\s*\(\) => import/g) || [];
console.log('GameRoute loader IDs:', loaderIds.length);

const labSet = new Set(labGameIds.map(m => m.match(/id: "([^"]+)"/)[1]));
const loaderSet = new Set(loaderIds.map(m => m.match(/"([^"]+)"/)[1]));

// Check which games have component files
const componentDir = 'src/games/games/';
const components = fs.readdirSync(componentDir).filter(f => f.endsWith('.tsx'));
// Map component file names to game IDs (PascalCase to kebab-case)
function pascalToKebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}
const componentIds = new Set(components.map(f => {
  const name = f.replace('.tsx', '');
  return pascalToKebab(name);
}));

console.log('Component files:', components.length);
console.log('Component IDs (mapped):', componentIds.size);

console.log('\nIn labRegistry but NO loader:');
[...labSet].filter(id => !loaderSet.has(id)).forEach(id => console.log('  -', id));

console.log('\nIn loader but NO labRegistry:');
[...loaderSet].filter(id => !labSet.has(id)).forEach(id => console.log('  -', id));

console.log('\nIn labRegistry but NO component file (MISSING IMPLEMENTATIONS):');
const missing = [...labSet].filter(id => !componentIds.has(id));
missing.forEach(id => console.log('  -', id));
console.log('Total missing:', missing.length);

console.log('\nComponent files NOT in labRegistry (orphan components):');
const orphans = [...componentIds].filter(id => !labSet.has(id));
orphans.forEach(id => console.log('  -', id));
console.log('Total orphans:', orphans.length);