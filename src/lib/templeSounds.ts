/**
 * Temple Sound System - Web Audio API
 * Per temple.md Section 5: Temple bell, singing bowl, wind chime, 3 bells at session end
 */

// Create audio context lazily (user gesture required)
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single tone with envelope
 */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain: number = 0.15,
  detune: number = 0
): void {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.detune.setValueAtTime(detune, ctx.currentTime);

    // Envelope: attack -> sustain -> decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.02); // attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration); // decay

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

/**
 * Temple Bell - Deep, resonant bell sound
 * Used: App open, program activation, vow completion
 */
export function playTempleBell(): void {
  playTone(220, 2.0, 'sine', 0.2);
  playTone(440, 1.5, 'sine', 0.08);
  playTone(660, 1.2, 'sine', 0.04);
  playTone(330, 1.8, 'sine', 0.06);
}

/**
 * Singing Bowl - Tibetan singing bowl
 * Used: Notifications
 */
export function playSingingBowl(): void {
  playTone(180, 3.0, 'sine', 0.12);
  playTone(360, 2.5, 'sine', 0.06);
  playTone(540, 2.0, 'sine', 0.03);
  // Slight detuning for bowl effect
  playTone(182, 3.0, 'sine', 0.04, 5);
  playTone(358, 2.5, 'sine', 0.02, -5);
}

/**
 * 3 Gentle Bells - Session end
 * Used: Timer complete, practice session end
 */
export function playThreeBells(): void {
  setTimeout(() => playTempleBell(), 0);
  setTimeout(() => playTempleBell(), 1200);
  setTimeout(() => playTempleBell(), 2400);
}

/**
 * Wind Chime - Light, airy chimes
 * Used: Chat messages appearing
 */
export function playWindChime(): void {
  playTone(1200, 0.8, 'sine', 0.06);
  setTimeout(() => playTone(1500, 0.6, 'sine', 0.04), 100);
  setTimeout(() => playTone(1800, 0.5, 'sine', 0.03), 200);
}

/**
 * Gentle Chime - Soft acknowledgment
 * Used: Button taps, small interactions
 */
export function playGentleChime(): void {
  playTone(880, 0.4, 'sine', 0.08);
}

/**
 * Low Gong - Deep, grounding
 * Used: Day transitions, silence days
 */
export function playLowGong(): void {
  playTone(80, 3.0, 'sine', 0.15);
  playTone(160, 2.5, 'sine', 0.08);
  playTone(120, 2.8, 'sine', 0.06);
}

/**
 * Om Chanting - Sustained drone
 * Used: Timer mode ambient (called repeatedly)
 */
let omOscillators: OscillatorNode[] = [];

export function startOmChant(): void {
  try {
    stopOmChant(); // Stop any existing
    const ctx = getAudioCtx();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1);

    const freqs = [136.1, 272.2, 408.3]; // Om frequencies
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      omOscillators.push(osc);
    });

    gainNode.connect(ctx.destination);
  } catch {
    // Audio not available
  }
}

export function stopOmChant(): void {
  omOscillators.forEach((osc) => {
    try { osc.stop(); } catch {}
  });
  omOscillators = [];
}

/**
 * Sound map for use with SoundContext
 */
export type TempleSound =
  | 'bell'
  | 'singing-bowl'
  | 'three-bells'
  | 'wind-chime'
  | 'gentle-chime'
  | 'low-gong'
  | 'om-start'
  | 'om-stop';

export function playTempleSound(sound: TempleSound): void {
  switch (sound) {
    case 'bell': playTempleBell(); break;
    case 'singing-bowl': playSingingBowl(); break;
    case 'three-bells': playThreeBells(); break;
    case 'wind-chime': playWindChime(); break;
    case 'gentle-chime': playGentleChime(); break;
    case 'low-gong': playLowGong(); break;
    case 'om-start': startOmChant(); break;
    case 'om-stop': stopOmChant(); break;
  }
}
