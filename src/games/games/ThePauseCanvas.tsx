// ThePauseCanvas — cinematic void field around the urge-orb.
// Layers, back-to-front:
//   1. Deep ink base with radial ember wash that heats with proximity
//   2. Drifting ember particles rising like sparks from a slow fire
//   3. Heat-haze band pulsing behind the orb when urge spikes
//   4. Molten inner core + iris pulse
//   5. Outer urge halo + mic ripple
//   6. Near-miss shock ring (sharp white flash)
//   7. Thin progress arc that cools from crimson to indigo as time survives
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;       // mic 0..1
  proximity: number;      // 0 = far, 1 = on the button (urge pressure)
  survivedFrac: number;   // 0..1 of target time
  flashKey: number;       // increments on near-miss to flash sharp ring
}

export default function ThePauseCanvas({ envelope, proximity, survivedFrac, flashKey }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, prox: 0, surv: 0, t: 0, flash: 0, lastFlash: 0 });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.prox = proximity; }, [proximity]);
  useEffect(() => { stateRef.current.surv = survivedFrac; }, [survivedFrac]);
  useEffect(() => {
    const s = stateRef.current;
    if (flashKey !== s.lastFlash) { s.flash = 1; s.lastFlash = flashKey; }
  }, [flashKey]);

  const embersRef = useRef<Array<{ x: number; y: number; vy: number; r: number; a: number; life: number; hue: number }>>([]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true }); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      s.flash = Math.max(0, s.flash - dt * 1.4);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      // Persistent ink base — gives embers a soft trail
      ctx.fillStyle = "rgba(4,2,6,0.32)";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      // Hue: hot red (urge) → cool indigo as survived grows
      const cool = s.surv;
      const r = Math.round(220 - 100 * cool);
      const g = Math.round(40 + 40 * cool);
      const b = Math.round(40 + 180 * cool);

      // Urge wash — bigger when proximity high; darker vignette as cool grows
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      wash.addColorStop(0, `rgba(${r},${g},${b},${0.12 + s.prox * 0.22})`);
      wash.addColorStop(0.6, `rgba(${r},${g},${b},${0.03 + s.prox * 0.06})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);

      // ── Ember particles — rise like slow sparks. Spawn rate scales with prox.
      const spawnP = 0.35 + s.prox * 1.4;
      if (Math.random() < spawnP) {
        embersRef.current.push({
          x: cx + (Math.random() - 0.5) * Math.min(w, h) * 0.35,
          y: cy + Math.min(w, h) * (0.05 + Math.random() * 0.12),
          vy: -(6 + Math.random() * 14),
          r: 0.6 + Math.random() * 1.6,
          a: 0.35 + Math.random() * 0.35,
          life: 2.4 + Math.random() * 2.2,
          hue: 8 + Math.random() * 18 + cool * 200, // reds → violets as cool grows
        });
      }
      embersRef.current = embersRef.current.filter((e) => {
        e.life -= dt;
        if (e.life <= 0) return false;
        e.y += e.vy * dt;
        e.x += Math.sin((s.t + e.y * 0.01) * 2) * 0.3;
        const alive = Math.max(0, Math.min(1, e.life / 2.4));
        ctx.fillStyle = `hsla(${e.hue}, 85%, ${55 + cool * 15}%, ${e.a * alive})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Orb pulse
      const baseR = Math.min(w, h) * 0.13;
      const pulse = 1 + Math.sin(s.t * (1.4 + s.prox * 2.4)) * (0.05 + s.prox * 0.08) + s.env * 0.06;

      // Heat-haze band — appears with proximity, distorts the sky behind orb
      if (s.prox > 0.05) {
        const bandR = baseR * (3.2 + s.prox * 1.4);
        const band = ctx.createRadialGradient(cx, cy, baseR * 1.4, cx, cy, bandR);
        band.addColorStop(0, "rgba(0,0,0,0)");
        band.addColorStop(0.5, `rgba(${r},${g},${b},${0.06 * s.prox})`);
        band.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = band;
        ctx.beginPath(); ctx.arc(cx, cy, bandR, 0, Math.PI * 2); ctx.fill();
      }

      // Outer urge halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * (2.8 + s.prox * 0.9));
      halo.addColorStop(0, `rgba(${r},${g},${b},${0.22 + s.prox * 0.32})`);
      halo.addColorStop(0.4, `rgba(${r},${g},${b},${0.10 + s.prox * 0.14})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, baseR * (2.8 + s.prox * 0.9), 0, Math.PI * 2); ctx.fill();

      // Molten iris behind orb button — visible when proximity high
      const irisR = baseR * (0.55 + s.prox * 0.25) * pulse;
      const iris = ctx.createRadialGradient(cx, cy - baseR * 0.1, 0, cx, cy, irisR);
      iris.addColorStop(0, `rgba(255,${180 - cool * 60},${140 - cool * 40},${0.20 + s.prox * 0.25})`);
      iris.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = iris;
      ctx.beginPath(); ctx.arc(cx, cy, irisR, 0, Math.PI * 2); ctx.fill();

      // Mic ripple
      const ripple = baseR * 1.7 + s.env * baseR * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, ripple, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.12 + s.env * 0.30})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Near-miss flash
      if (s.flash > 0.01) {
        ctx.save();
        ctx.shadowColor = `rgba(255,220,220,${s.flash * 0.8})`;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * (1.1 + (1 - s.flash) * 1.0) * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${s.flash * 0.85})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }

      // Progress arc (survived) — thin, around orb; cools with time
      const arcR = baseR * 2.05;
      // Base track
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // Filled arc
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.surv);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.70)`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Bead at head of arc
      if (s.surv > 0.001 && s.surv < 0.999) {
        const ang = -Math.PI / 2 + Math.PI * 2 * s.surv;
        const bx = cx + Math.cos(ang) * arcR;
        const by = cy + Math.sin(ang) * arcR;
        ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
        ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,0.55)`;
        ctx.beginPath(); ctx.arc(bx, by, 0.9, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
