/**
 * Client-side prosody feature extractor.
 * Records a short audio clip, extracts pitch variance / pace / pause ratio
 * using the Web Audio API, and returns features. Audio is NEVER uploaded.
 */

export interface ProsodyFeatures {
  pitchVarianceHz: number;
  pacingWordsPerSec: number;
  pauseRatio: number;
  meanPitchHz: number;
  durationSec: number;
}

export async function extractProsodyFromMic(durationMs = 8000): Promise<ProsodyFeatures | null> {
  if (!navigator.mediaDevices?.getUserMedia) return null;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
  if (!stream) return null;

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buffer = new Float32Array(analyser.fftSize);
  const pitches: number[] = [];
  const volumes: number[] = [];

  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      analyser.getFloatTimeDomainData(buffer);
      // Naive autocorrelation pitch estimate
      const pitch = autoCorrelate(buffer, ctx.sampleRate);
      if (pitch > 50 && pitch < 500) pitches.push(pitch);
      // RMS volume
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
      volumes.push(Math.sqrt(sum / buffer.length));
      if (performance.now() - start < durationMs) requestAnimationFrame(tick);
      else resolve();
    };
    tick();
  });

  stream.getTracks().forEach((t) => t.stop());
  await ctx.close().catch(() => {});

  const durationSec = (performance.now() - start) / 1000;
  const meanPitch = pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 0;
  const variance = pitches.length
    ? Math.sqrt(pitches.reduce((a, b) => a + (b - meanPitch) ** 2, 0) / pitches.length)
    : 0;
  const silentFrames = volumes.filter((v) => v < 0.01).length;
  const pauseRatio = volumes.length ? silentFrames / volumes.length : 0;
  // very rough: assume avg syllable rate proxies word rate
  const speechRatio = 1 - pauseRatio;
  const pacingWordsPerSec = speechRatio * 2.5;

  return {
    pitchVarianceHz: Number(variance.toFixed(2)),
    pacingWordsPerSec: Number(pacingWordsPerSec.toFixed(2)),
    pauseRatio: Number(pauseRatio.toFixed(3)),
    meanPitchHz: Number(meanPitch.toFixed(1)),
    durationSec: Number(durationSec.toFixed(1)),
  };
}

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  const sliced = buf.slice(r1, r2);
  const newSize = sliced.length;
  const c = new Array(newSize).fill(0);
  for (let i = 0; i < newSize; i++)
    for (let j = 0; j < newSize - i; j++)
      c[i] += sliced[j] * sliced[j + i];

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  return maxpos > 0 ? sampleRate / maxpos : -1;
}
