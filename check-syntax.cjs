const fs = require('fs');
const files = fs.readdirSync('src/games/games/').filter(f => f.endsWith('.tsx'));
files.forEach(file => {
  const content = fs.readFileSync(`src/games/games/${file}`, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.trim() === '})' && i > 0) {
      const prevLine = lines[i-1].trim();
      if (prevLine.includes('backgroundImage:') || prevLine.includes('style={{')) {
        console.log(file, 'line', i+1, ':', line.trim());
      }
    }
  });
});