const fs = require('fs');
const path = require('path');

const dir = 'src/games/games';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const stats = {
  total: files.length,
  under60: [],
  under100: [],
  over200: [],
  noSignals: [],
  noPhases: [],
  usesSensors: [],
  plainTextOnly: [],
  usesCanvas: [],
  usesXstate: [],
  usesSound: [],
  usesHaptics: [],
  usesTTS: [],
  usesSTT: [],
  usesMic: [],
  hasCanvasCompanion: [],
};

for (const f of files) {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = c.split('\n').length;
  const name = f.replace('.tsx', '');

  if (lines < 60) stats.under60.push(name + ' (' + lines + ')');
  else if (lines < 100) stats.under100.push(name + ' (' + lines + ')');
  if (lines >= 200) stats.over200.push(name + ' (' + lines + ')');

  if (!c.includes('onEnd({')) stats.noSignals.push(name);
  if (!/type Phase|phase ===|phase === "|setPhase/.test(c)) stats.noPhases.push(name);
  if (c.includes('useBreathMic') || c.includes('useMicLevel')) stats.usesMic.push(name);
  if (c.includes('useTranscribe')) stats.usesSTT.push(name);
  if (c.includes('useGuruVoice') || c.includes('useVoiceText')) stats.usesTTS.push(name);
  if (c.includes('useSoundDesign')) stats.usesSound.push(name);
  if (c.includes('useHaptics')) stats.usesHaptics.push(name);
  if (c.includes('xstate')) stats.usesXstate.push(name);
  if (c.includes('Canvas')) stats.usesCanvas.push(name);
  if (c.includes('CinematicOverlay')) stats.hasCanvasCompanion.push(name);

  // Plain text: has <input> or <textarea> but no canvas, no sensors, no phases
  const hasInput = /<input|<textarea/.test(c);
  if (hasInput && !c.includes('Canvas') && !c.includes('useBreathMic') && !c.includes('useTranscribe')) {
    stats.plainTextOnly.push(name);
  }
}

console.log('=== GAME AUDIT ===');
console.log('Total .tsx game files:', stats.total);
console.log('');
console.log('Under 60 lines (STUBS):', stats.under60.length);
console.log('60-100 lines (THIN):', stats.under100.length);
console.log('200+ lines (RICH):', stats.over200.length);
console.log('');
console.log('No onEnd signals:', stats.noSignals.length, stats.noSignals.slice(0, 10));
console.log('No phase state:', stats.noPhases.length, stats.noPhases.slice(0, 10));
console.log('');
console.log('Uses mic:', stats.usesMic.length);
console.log('Uses STT:', stats.usesSTT.length);
console.log('Uses TTS:', stats.usesTTS.length);
console.log('Uses sound design:', stats.usesSound.length);
console.log('Uses haptics:', stats.usesHaptics.length);
console.log('Uses xstate:', stats.usesXstate.length);
console.log('Uses canvas:', stats.usesCanvas.length);
console.log('Uses CinematicOverlay:', stats.hasCanvasCompanion.length);
console.log('');
console.log('PLAIN TEXT ONLY (input, no sensor/canvas):', stats.plainTextOnly.length);
console.log(stats.plainTextOnly.join('\n'));
console.log('');
console.log('--- STUBS (under 60 lines) ---');
console.log(stats.under60.join('\n'));