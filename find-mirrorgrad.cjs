const fs = require('fs');
const content = fs.readFileSync('src/games/games/MirrorDuelCanvas.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('mirrorGrad')) {
    console.log(i+1, ':', line.trim());
  }
});