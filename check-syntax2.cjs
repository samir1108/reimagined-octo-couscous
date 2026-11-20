const fs = require('fs');
const files = fs.readdirSync('src/games/games/').filter(f => f.endsWith('.tsx'));
files.forEach(file => {
  const content = fs.readFileSync(`src/games/games/${file}`, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.trim() === ')' && i > 0) {
      const prevLine = lines[i-1].trim();
      if (prevLine.includes('}}') || prevLine.includes('style={{')) {
        console.log(file, 'line', i+1, ':', line.trim(), '| prev:', prevLine);
      }
    }
    if (line.trim() === ')' && i > 1) {
      const prev2 = lines[i-2].trim();
      const prev1 = lines[i-1].trim();
      if (prev2.includes('style={{') && prev1.includes('}}')) {
        console.log(file, 'line', i+1, ':', line.trim(), '| prev2:', prev2);
      }
    }
  });
});