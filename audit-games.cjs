const fs = require('fs');
const files = fs.readdirSync('src/games/games/').filter(f => f.endsWith('.tsx'));
console.log('Total game components:', files.length);

// Categorize by size (proxy for complexity)
const sizes = files.map(f => {
  const content = fs.readFileSync('src/games/games/' + f, 'utf8');
  return { file: f, lines: content.split('\n').length, chars: content.length };
});

sizes.sort((a, b) => b.chars - a.chars);

console.log('\n=== FLAGSHIP (10k+ chars) ===');
sizes.filter(s => s.chars > 10000).forEach(s => console.log('  ' + s.file + ': ' + s.chars + ' chars, ' + s.lines + ' lines'));

console.log('\n=== SUBSTANTIAL (5k-10k chars) ===');
sizes.filter(s => s.chars >= 5000 && s.chars <= 10000).forEach(s => console.log('  ' + s.file + ': ' + s.chars + ' chars, ' + s.lines + ' lines'));

console.log('\n=== BASIC (< 5k chars) ===');
sizes.filter(s => s.chars < 5000).forEach(s => console.log('  ' + s.file + ': ' + s.chars + ' chars, ' + s.lines + ' lines'));

console.log('\n=== TOTALS ===');
console.log('Flagship:', sizes.filter(s => s.chars > 10000).length);
console.log('Substantial:', sizes.filter(s => s.chars >= 5000 && s.chars <= 10000).length);
console.log('Basic:', sizes.filter(s => s.chars < 5000).length);