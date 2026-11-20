const fs = require('fs');
const labRegistry = fs.readFileSync('src/games/shell/labRegistry.ts', 'utf8');
const lines = labRegistry.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tier: "S"') && lines[i].includes('available: true')) {
    console.log(i+1, lines[i].trim());
  }
}