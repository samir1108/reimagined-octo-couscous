const fs = require('fs');
const labRegistry = fs.readFileSync('src/games/shell/labRegistry.ts', 'utf8');
const lines = labRegistry.split('\n');

console.log('TIER S GAMES WITH FULL SENSORS (needsMic, needsCamera, needsTTS, needsSTT):\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tier: "S"') && lines[i].includes('available: true') && lines[i].includes('needsMic:') && lines[i].includes('needsCamera:') && lines[i].includes('needsTTS:') && lines[i].includes('needsSTT:')) {
    const idMatch = lines[i].match(/id: "([^"]+)"/);
    const nameMatch = lines[i].match(/name: "([^"]+)"/);
    if (idMatch && nameMatch) {
      console.log('  -', idMatch[1], ':', nameMatch[1]);
    }
  }
}

console.log('\nTIER S GAMES WITH MIC ONLY (needsMic: true, no camera):\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tier: "S"') && lines[i].includes('available: true') && lines[i].includes('needsMic: true') && !lines[i].includes('needsCamera:') && lines[i].includes('needsTTS:') && lines[i].includes('needsSTT:')) {
    const idMatch = lines[i].match(/id: "([^"]+)"/);
    const nameMatch = lines[i].match(/name: "([^"]+)"/);
    if (idMatch && nameMatch) {
      console.log('  -', idMatch[1], ':', nameMatch[1]);
    }
  }
}

console.log('\nTIER S GAMES WITH CAMERA ONLY (needsCamera: true, no mic):\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tier: "S"') && lines[i].includes('available: true') && lines[i].includes('needsCamera: true') && !lines[i].includes('needsMic:') && lines[i].includes('needsTTS:') && lines[i].includes('needsSTT:')) {
    const idMatch = lines[i].match(/id: "([^"]+)"/);
    const nameMatch = lines[i].match(/name: "([^"]+)"/);
    if (idMatch && nameMatch) {
      console.log('  -', idMatch[1], ':', nameMatch[1]);
    }
  }
}

console.log('\nTIER S GAMES WITH NO SENSORS (just faculties/tier/available):\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('tier: "S"') && lines[i].includes('available: true') && !lines[i].includes('needsMic:') && !lines[i].includes('needsCamera:') && !lines[i].includes('needsTTS:') && !lines[i].includes('needsSTT:')) {
    const idMatch = lines[i].match(/id: "([^"]+)"/);
    const nameMatch = lines[i].match(/name: "([^"]+)"/);
    if (idMatch && nameMatch) {
      console.log('  -', idMatch[1], ':', nameMatch[1]);
    }
  }
}