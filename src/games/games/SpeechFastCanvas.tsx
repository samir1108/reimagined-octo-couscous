// SpeechFastCanvas — animated fast visualization with urge tracking
"use client";

import { useEffect, useRef } from "react";

interface SpeechFastCanvasProps {
  phase: "choose" | "fasting" | "verdict" | "integrate";
  urges: Array<{ t: number; spoke: boolean; note: string; spoken: boolean }>;
  remaining: number;
  durMins: number;
  breathEnvelope: number;
}

export default function SpeechFastCanvas({
  phase,
  urges,
  remaining,
  durMins,
  breathEnvelope,
}: SpeechFastCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    type: "held" | "spoke";
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.85, 400);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size * 0.35;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Progress ring
      const progress = 1 - remaining / (durMins * 60);
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.9, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(125, 211, 252, 0.6)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Background ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Central orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.25 * (0.8 + orbPulse * 0.3);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(125, 211, 252, ${0.25 + Math.sin(timeRef.current * 0.5) * 0.1})`);
      orbGrad.addColorStop(0.5, `rgba(180, 220, 255, 0.1)`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(125, 211, 252, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 220, 255, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 150, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Urge markers around the ring
      const held = urges.filter(u => !u.spoke).length;
      const spoke = urges.filter(u => u.spoke).length;

      // Held markers (green)
      for (let i = 0; i < held; i++) {
        const angle = (i / Math.max(1, held)) * Math.PI * 2 + timeRef.current * 0.2;
        const r = maxRadius * (0.95 + Math.sin(timeRef.current * 0.5 + i) * 0.03);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 6);
        grad.addColorStop(0, "rgba(110, 231, 183, 0.9)");
        grad.addColorStop(1, "rgba(20, 100, 80, 0.7)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Spoke markers (red)
      for (let i = 0; i < urges.filter(u => u.spoke).length; i++) {
        const angle = (i / Math.max(1, urges.filter(u => u.spoke).length)) * Math.PI * 2 + Math.PI + timeRef.current * 0.2;
        const r = maxRadius * (0.95 + Math.sin(timeRef.current * 0.5 + i) * 0.03);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 6);
        grad.addColorStop(0, "rgba(251, 113, 133, 0.9)");
        grad.addColorStop(1, "rgba(180, 50, 70, 0.7)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Spawn particles for new urges
      if (phase === "fasting" && Math.random() < 0.05) {
        const heldCount = urges.filter(u => !u.spoke).length;
        const spokeCount = urges.filter(u => u.spoke).length;
        const isHeld = Math.random() < heldCount / Math.max(1, heldCount + spokeCount);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: isHeld ? "110, 231, 183" : "251, 113, 133",
          life: 0,
          maxLife: 2 + Math.random() * 1.5,
          type: isHeld ? "held" : "spoke",
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Timer text
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      ctx.font = "bold 32px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`, centerX, centerY);

      // Urge counts
      const heldCount = urges.filter(u => !u.spoke).length;
      const spokeCount = urges.filter(u => u.spoke).length;
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${heldCount} held`, centerX, centerY - maxRadius * 0.3);

      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${spokeCount} spoke`, centerX, centerY + maxRadius * 0.3);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, urges, remaining, durMins, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}