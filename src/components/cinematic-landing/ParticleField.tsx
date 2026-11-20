import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  warmth: number;
}

interface ParticleFieldProps {
  progress: MotionValue<number>;
  /** Progress value at which the field locks into stillness. */
  freezeAt?: number;
  density?: number;
  className?: string;
}

/**
 * ParticleField — the thinking field of Act I.
 *
 * Thoughts, memories, desires, fears and ambitions drift around the visitor.
 * Their speed is driven by scroll progress: the faster you scroll, the more
 * frantic the mind becomes. At `freezeAt` the field stops dead, which is the
 * beat that lands on the word CONTROL.
 */
export default function ParticleField({
  progress,
  freezeAt = 0.82,
  density = 150,
  className = "",
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: Particle[] = [];

    const seed = () => {
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: 0.6 + Math.random() * 1.8,
        alpha: 0.18 + Math.random() * 0.55,
        warmth: Math.random(),
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const p = progress.get();
      const frozen = p >= freezeAt;
      const speed = frozen ? 0 : 0.18 + p * 2.6;

      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        if (!frozen) {
          particle.x += particle.vx * speed;
          particle.y += particle.vy * speed;

          if (particle.x < -20) particle.x = width + 20;
          if (particle.x > width + 20) particle.x = -20;
          if (particle.y < -20) particle.y = height + 20;
          if (particle.y > height + 20) particle.y = -20;
        }

        const gold = particle.warmth > 0.72;
        const glow = gold
          ? `rgba(251, 191, 36, ${particle.alpha * (0.55 + p * 0.45)})`
          : `rgba(226, 232, 240, ${particle.alpha * (0.4 + p * 0.6)})`;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.shadowBlur = gold ? 14 : 6;
        ctx.shadowColor = gold ? "rgba(251,191,36,0.65)" : "rgba(226,232,240,0.35)";
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [progress, freezeAt, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  );
}
