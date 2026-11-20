// SoundMicroscopeFieldCanvas — a single luminous ring that slowly resonates
// with the current tone frequency. Brightens with mic envelope (your own breath
// in the room) and emits a quick ripple each time the user taps.
import { useEffect, useRef } from "react";

export default function SoundMicroscopeFieldCanvas({
  freq,            // current oscillator frequency in Hz (180–520)
  envelope,        // 0..1 mic
  tapPulse,        // monotonic counter; each increment = ripple
}: {
  freq: number;
  envelope: number;
  tapPulse: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Array<{ r: number; a: number }>>([]);
  const lastTapRef = useRef(0);
  const tRef = useRef(0);
  const smoothFreqRef = useRef(freq);

  useEffect(() => {
    if (tapPulse <= lastTapRef.current) return;
    lastTapRef.current = tapPulse;
    ripplesRef.current.push({ r: 30, a: 0.6 });
  }, [tapPulse]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => { c.width = c.clientWidth * devicePixelRatio; c.height = c.clientHeight * devicePixelRatio; };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      tRef.current += 0.016;
      // smooth toward target freq so the ring re-tunes gracefully
      smoothFreqRef.current += (freq - smoothFreqRef.current) * 0.06;
      const sf = smoothFreqRef.current;

      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.18;

      // Cool wash that brightens with envelope
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      const heat = 0.05 + envelope * 0.18;
      wash.addColorStop(0, `rgba(140, 180, 230, ${heat})`);
      wash.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      // Frequency-locked breathing of the central ring (faster when freq high)
      const omega = sf * 0.012;             // visual rate proportional to pitch
      const breath = 1 + Math.sin(tRef.current * omega) * 0.05;
      const r = baseR * breath;

      // Halo
      const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
      halo.addColorStop(0, `rgba(180, 220, 255, ${0.25 + envelope * 0.15})`);
      halo.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Core ring — line width hints at pitch (thin = high, thick = low)
      const lw = (1.5 + (520 - sf) / 340 * 2.5) * devicePixelRatio;
      ctx.strokeStyle = `rgba(220, 235, 255, ${0.7 + envelope * 0.25})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner faint dot
      ctx.fillStyle = `rgba(220, 235, 255, 0.5)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();

      // Tap ripples
      ripplesRef.current = ripplesRef.current.filter((rp) => {
        rp.r += 3 * devicePixelRatio;
        rp.a *= 0.94;
        ctx.strokeStyle = `rgba(200, 220, 255, ${rp.a})`;
        ctx.lineWidth = 1.4 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        return rp.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [freq, envelope]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
