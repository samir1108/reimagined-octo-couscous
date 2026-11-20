const fs = require('fs');
const gameRoute = fs.readFileSync('src/pages/GameRoute.tsx', 'utf8');
const loaderIds = gameRoute.match(/"([^"]+)":\s*\(\) => import/g) || [];
const loaderSet = new Set(loaderIds.map(m => m.match(/"([^"]+)"/)[1]));
console.log('the-30-second-mind:', loaderSet.has('the-30-second-mind'));
console.log('stop-spinning:', loaderSet.has('stop-spinning'));
console.log('japa-108:', loaderSet.has('japa-108'));