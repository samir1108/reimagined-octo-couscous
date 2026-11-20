// Standalone sound player — usable outside React components/hooks
// Rich, layered, organic sounds (not generic beeps)
const STORAGE_KEY = "hope-app-sound-enabled";
const ORB_OPEN_EVENT = "oversoul:orb-open";

type SoundType = "tap" | "success" | "toggle" | "notification" | "navigate" | "error" | "threshold" | "bigbang" | "universe";

let _audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_audioCtx || _audioCtx.state === "closed") {
    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) throw new Error("Web Audio API is unavailable");
    _audioCtx = new AudioContextCtor();
  }
  return _audioCtx;
}

// Master bus with subtle reverb-like feel via lowpass + slight delay
function createVoice(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  peakGain: number,
  attack = 0.005,
  detune = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.detune.setValueAtTime(detune, startTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), startTime);
  filter.Q.setValueAtTime(0.7, startTime);

  // Natural ADSR-ish envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  return gain;
}

function playTap(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Soft "pluck" — fundamental + 5th, very short, with slight pitch drop
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.08);

  filter.type = "lowpass";
  filter.frequency.value = 3500;

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.18, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.12);
}

function playSuccess(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Warm 3-note arpeggio (C5 -> E5 -> G5) with bell-like overtones
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const start = t + i * 0.08;
    // Fundamental
    const g1 = createVoice(ctx, freq, "sine", start, 0.6, 0.14, 0.008);
    g1.connect(dest);
    // Octave shimmer
    const g2 = createVoice(ctx, freq * 2, "sine", start, 0.4, 0.04, 0.01);
    g2.connect(dest);
    // Sub warmth
    const g3 = createVoice(ctx, freq * 0.5, "triangle", start, 0.5, 0.05, 0.01);
    g3.connect(dest);
  });
}

function playToggle(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Soft "click" with body — two-stage pitch
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.linearRampToValueAtTime(660, t + 0.04);
  osc.frequency.exponentialRampToValueAtTime(550, t + 0.15);

  filter.type = "lowpass";
  filter.frequency.value = 2500;

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.2);
}

function playNotification(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Crystalline 2-tone chime (perfect 5th) with shimmer
  const fundamentals = [880, 1318.5];
  fundamentals.forEach((freq, i) => {
    const start = t + i * 0.06;
    const g1 = createVoice(ctx, freq, "sine", start, 0.7, 0.12, 0.006);
    g1.connect(dest);
    // Bell harmonic (2.76x — inharmonic for bell-like character)
    const g2 = createVoice(ctx, freq * 2.76, "sine", start, 0.5, 0.025, 0.008);
    g2.connect(dest);
    // Slight detuned shimmer
    const g3 = createVoice(ctx, freq, "sine", start, 0.6, 0.05, 0.008, 8);
    g3.connect(dest);
  });
}

function playNavigate(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Soft upward "swoosh" — filtered sweep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(330, t);
  osc.frequency.exponentialRampToValueAtTime(550, t + 0.12);

  filter.type = "bandpass";
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(800, t);
  filter.frequency.exponentialRampToValueAtTime(2000, t + 0.12);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.2);
}

function playError(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Soft minor 2nd dissonance — gentle, not harsh
  const freqs = [349.23, 369.99]; // F4 + F#4 — dissonant but warm
  freqs.forEach((freq) => {
    const g1 = createVoice(ctx, freq, "triangle", t, 0.35, 0.09, 0.01);
    g1.connect(dest);
    const g2 = createVoice(ctx, freq * 0.5, "sine", t, 0.4, 0.05, 0.012);
    g2.connect(dest);
  });
}

function playThreshold(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  // Low temple bell — long decay, one clean strike with inharmonic shimmer
  const partials = [
    { freq: 261.63, gain: 0.16, attack: 0.008 },
    { freq: 523.25, gain: 0.08, attack: 0.014 },
    { freq: 724.6, gain: 0.045, attack: 0.03 },
  ];
  partials.forEach(({ freq, gain, attack }) => {
    const g1 = createVoice(ctx, freq, "sine", t, 2.4, gain, attack);
    g1.connect(dest);
    const g2 = createVoice(ctx, freq * 2.76, "sine", t, 1.6, gain * 0.2, 0.03);
    g2.connect(dest);
  });
}

/**
 * Cinematic "Big Bang / Universe" — a single, larger-than-life swell.
 *
 * Builds a sub-bass detonation, a rising white-noise / filtered-sweep
 * (the expanding vacuum), and a crystalline chord burst that blooms into
 * a long reverb tail. One-shot, non-looping, never competes with music.
 */
function playBigBang(ctx: AudioContext, dest: AudioNode) {
  const t = ctx.currentTime;
  const dur = 4.2;

  // 1) Sub-bass impact — the singularity
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(55, t);
  sub.frequency.exponentialRampToValueAtTime(24, t + 1.2);
  subGain.gain.setValueAtTime(0, t);
  subGain.gain.linearRampToValueAtTime(0.9, t + 0.05);
  subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  sub.connect(subGain);
  subGain.connect(dest);
  sub.start(t);
  sub.stop(t + dur);

  // 2) Noise sweep — the expanding vacuum / shockwave
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = "bandpass";
  nFilter.Q.value = 0.8;
  nFilter.frequency.setValueAtTime(300, t);
  nFilter.frequency.exponentialRampToValueAtTime(4200, t + 1.6);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0, t);
  nGain.gain.linearRampToValueAtTime(0.5, t + 0.15);
  nGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(dest);
  noise.start(t);
  noise.stop(t + dur);

  // 3) Crystalline chord bloom — the galaxies forming
  const chord = [130.81, 164.81, 196.0, 261.63, 329.63];
  chord.forEach((freq, i) => {
    const start = t + i * 0.05;
    const g1 = createVoice(ctx, freq, "sine", start, dur, 0.16, 0.01);
    g1.connect(dest);
    const g2 = createVoice(ctx, freq * 2, "sine", start, dur * 0.8, 0.05, 0.012);
    g2.connect(dest);
    const g3 = createVoice(ctx, freq * 4, "sine", start, dur * 0.6, 0.02, 0.015);
    g3.connect(dest);
  });

  // 4) Final bell strike — the settled universe
  setTimeout(() => {
    const t2 = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const s = t2 + i * 0.09;
      const g1 = createVoice(ctx, freq, "sine", s, 2.6, 0.14, 0.008);
      g1.connect(dest);
      const g2 = createVoice(ctx, freq * 2.76, "sine", s, 1.8, 0.04, 0.012);
      g2.connect(dest);
    });
  }, 1900);
}

function playOrbBell(
  ctx: AudioContext,
  dest: AudioNode,
  frequency: number,
  volume: number,
  startTime: number,
) {
  const partials: Array<[number, number, number]> = [
    [1, 1, 3.6],
    [2.76, 0.45, 2.2],
    [5.4, 0.22, 1.3],
    [8.93, 0.1, 0.8],
  ];
  partials.forEach(([ratio, level, duration]) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(
      0.16 * level * volume,
      startTime + 0.01,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration,
    );
    oscillator.connect(gain);
    gain.connect(dest);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.1);
  });
}

function createOrbNoiseBuffer(ctx: AudioContext) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playOrbOpening(ctx: AudioContext, dest: AudioNode) {
  const start = ctx.currentTime + 0.1;
  const duration = 6;
  const output = ctx.createGain();
  output.gain.value = 0.9;
  output.connect(dest);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.Q.value = 6;
  lowpass.frequency.setValueAtTime(90, start);
  lowpass.frequency.exponentialRampToValueAtTime(900, start + 3);
  lowpass.frequency.exponentialRampToValueAtTime(
    160,
    start + duration,
  );

  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(0.12, start + 2.5);
  envelope.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration,
  );
  lowpass.connect(envelope);
  envelope.connect(output);

  [
    [55, "sawtooth"],
    [55.7, "sawtooth"],
    [110.3, "square"],
  ].forEach(([frequency, type]) => {
    const oscillator = ctx.createOscillator();
    oscillator.type = type as OscillatorType;
    oscillator.frequency.setValueAtTime(
      Number(frequency) * 0.6,
      start,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      Number(frequency) * 1.4,
      start + 3,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      Number(frequency),
      start + duration,
    );
    oscillator.connect(lowpass);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.2);
  });

  const sweep = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  const sweepFilter = ctx.createBiquadFilter();
  sweep.type = "sawtooth";
  sweep.frequency.setValueAtTime(70, start);
  sweep.frequency.exponentialRampToValueAtTime(
    2400,
    start + 3.2,
  );
  sweepFilter.type = "bandpass";
  sweepFilter.Q.value = 4;
  sweepFilter.frequency.setValueAtTime(200, start);
  sweepFilter.frequency.exponentialRampToValueAtTime(
    3500,
    start + 3.2,
  );
  sweepGain.gain.setValueAtTime(0, start);
  sweepGain.gain.linearRampToValueAtTime(0.14, start + 2.8);
  sweepGain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + 3.9,
  );
  sweep.connect(sweepFilter);
  sweepFilter.connect(sweepGain);
  sweepGain.connect(output);
  sweep.start(start);
  sweep.stop(start + 4);

  const bell = ctx.createOscillator();
  const bellGain = ctx.createGain();
  bell.type = "sine";
  bell.frequency.value = 720;
  bellGain.gain.setValueAtTime(0, start + 0.6);
  bellGain.gain.linearRampToValueAtTime(0.09, start + 2);
  bellGain.gain.linearRampToValueAtTime(0.08, start + 3.6);
  bellGain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + 5.4,
  );
  bell.connect(bellGain);
  bellGain.connect(output);
  bell.start(start);
  bell.stop(start + 5.6);

  [
    [6.5, 220],
    [1.1, 320],
  ].forEach(([rate, amount]) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = Number(rate);
    gain.gain.value = Number(amount);
    oscillator.connect(gain);
    gain.connect(bell.frequency);
    oscillator.start(start);
    oscillator.stop(start + duration);
  });

  const noise = ctx.createBufferSource();
  const noiseFilter = ctx.createBiquadFilter();
  const noiseGain = ctx.createGain();
  noise.buffer = createOrbNoiseBuffer(ctx);
  noiseFilter.type = "bandpass";
  noiseFilter.Q.value = 1.2;
  noiseFilter.frequency.setValueAtTime(300, start + 1);
  noiseFilter.frequency.exponentialRampToValueAtTime(
    5000,
    start + 3.3,
  );
  noiseFilter.frequency.exponentialRampToValueAtTime(
    400,
    start + 5.5,
  );
  noiseGain.gain.setValueAtTime(0, start + 1);
  noiseGain.gain.linearRampToValueAtTime(0.12, start + 3.2);
  noiseGain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + 5.6,
  );
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(output);
  noise.start(start + 1);
  noise.stop(start + 5.7);

  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(90, start + 3.2);
  thump.frequency.exponentialRampToValueAtTime(
    30,
    start + 4,
  );
  thumpGain.gain.setValueAtTime(0, start + 3.2);
  thumpGain.gain.linearRampToValueAtTime(0.35, start + 3.22);
  thumpGain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + 4.2,
  );
  thump.connect(thumpGain);
  thumpGain.connect(output);
  thump.start(start + 3.2);
  thump.stop(start + 4.3);

  const chord = [146.83, 220, 293.66, 369.99];
  [2, 3, 4, 6].forEach((ratio, index) => {
    playOrbBell(
      ctx,
      dest,
      chord[index % chord.length] * ratio,
      0.9,
      start + 3.2 + index * 0.16,
    );
  });
  chord.forEach((frequency, index) => {
    playOrbBell(
      ctx,
      dest,
      frequency * 2,
      0.8,
      start + 4.3 + index * 0.35,
    );
  });
  playOrbBell(ctx, dest, chord[0] * 4, 1, start + 5.8);

  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      window.dispatchEvent(new Event(ORB_OPEN_EVENT));
    }, 3200);
  }
}

const PLAYERS: Record<SoundType, (ctx: AudioContext, dest: AudioNode) => void> = {
  tap: playTap,
  success: playSuccess,
  toggle: playToggle,
  notification: playNotification,
  navigate: playNavigate,
  error: playError,
  threshold: playThreshold,
  bigbang: playBigBang,
  universe: playBigBang,
};

// Master output chain with subtle warmth (gentle compression-like via gain shaping)
let masterGain: GainNode | null = null;
function getMaster(ctx: AudioContext): AudioNode {
  if (!masterGain || (masterGain.context as AudioContext).state === "closed") {
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

export function armAppAudio() {
  try {
    if (localStorage.getItem(STORAGE_KEY) === "false") return;
  } catch {
    return;
  }
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => undefined);
    }
  } catch {
    return;
  }
}

export function playOrbChime(frequency = 880, volume = 1) {
  try {
    if (localStorage.getItem(STORAGE_KEY) === "false") return;
  } catch {
    return;
  }
  try {
    const ctx = getCtx();
    const dest = getMaster(ctx);
    const play = () => playOrbBell(ctx, dest, frequency, volume, ctx.currentTime);
    if (ctx.state === "suspended") {
      void ctx.resume().then(play).catch(() => undefined);
      return;
    }
    play();
  } catch {
    return;
  }
}

export function playSoundEffect(type: SoundType) {
  try {
    const enabled = localStorage.getItem(STORAGE_KEY) === "true";
    if (!enabled) return;
  } catch {
    return;
  }

  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    const dest = getMaster(ctx);
    PLAYERS[type](ctx, dest);
  } catch {
    // non-critical
  }
}

export async function playAppLoadSound(): Promise<boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") return false;
    if (stored === null) localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    return false;
  }

  try {
    const ctx = getCtx();
    if (ctx.state !== "running") {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const resumeAttempt = ctx.resume().then(() => true).catch(() => false);
      const resumeTimeout = new Promise<false>((resolve) => {
        timeoutId = setTimeout(() => resolve(false), 250);
      });
      await Promise.race([resumeAttempt, resumeTimeout]);
      if (timeoutId) clearTimeout(timeoutId);
    }
    if (ctx.state !== "running") return false;
    playOrbOpening(ctx, getMaster(ctx));
    return true;
  } catch {
    return false;
  }
}
