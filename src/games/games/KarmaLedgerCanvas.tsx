// KarmaLedgerCanvas — animated karma balance with particle flow
"use client";

import { useEffect, useRef } from "react";

interface KarmaLedgerCanvasProps {
  phase: "intro" | "log" | "review" | "verdict" | "integrate";
  totals: Record<"skillful" | "unskillful" | "neutral", number>;
  entries: Array<{ tag: "skillful" | "unskillful" | "neutral"; text: string }>;
  breathEnvelope: number;
}

export default function KarmaLedgerCanvas({
  phase,
  totals,
  entries,
  breathEnvelope,
}: KarmaLedgerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    tag: "skillful" | "unskillful" | "neutral";
  }>>([]);
  const centerLineRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.9, 420);
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

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, "rgba(20, 15, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 2, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Center line (karma balance)
      centerLineRef.current = centerLineRef.current * 0.98;
      const balance = (totals.skillful - totals.unskillful) / Math.max(1, totals.skillful + totals.unskillful + totals.neutral);
      centerLineRef.current += balance * 0.02;
      centerLineRef.current = Math.max(-0.5, Math.min(0.5, centerLineRef.current));

      // Spawn particles for each entry
      if (phase === "log" && entries.length > 0) {
        const latest = entries[entries.length - 1];
        // Only spawn once per entry (track via time)
        if (Math.random() < 0.15) {
          const tagColor = latest.tag === "skillful" ? "110, 231, 183" : latest.tag === "unskillful" ? "251, 113, 133" : "255, 255, 255";
          const angle = latest.tag === "skillful" ? -Math.PI / 4 : latest.tag === "unskillful" ? Math.PI / 4 : 0;
          particlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * (30 + Math.random() * 40),
            vy: Math.sin(angle) * (30 + Math.random() * 40) - 20,
            size: 3 + Math.random() * 4,
            color: tagColor,
            life: 0,
            maxLife: 3 + Math.random() * 2,
            tag: latest.tag,
          });
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 15 * dt; // gravity

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // Draw karma scale (balance beam)
      const beamY = centerY + 80;
      const beamWidth = size * 0.6;
      const beamHeight = 4;

      // Beam
      ctx.beginPath();
      ctx.moveTo(centerX - beamWidth / 2, beamY);
      ctx.lineTo(centerX + beamWidth / 2, beamY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = beamHeight;
      ctx.stroke();

      // Fulcrum
      ctx.beginPath();
      ctx.arc(centerX, beamY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();

      // Skillful weight (left)
      const leftX = centerX - beamWidth / 2 + 30;
      const leftWeight = totals.skillful;
      if (leftWeight > 0) {
        ctx.beginPath();
        ctx.arc(leftX, beamY - 20 - leftWeight * 2, 12 + leftWeight, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(leftX - 5, beamY - 20 - leftWeight * 2 - 5, 0, leftX, beamY - 20 - leftWeight * 2, 12 + leftWeight);
        grad.addColorStop(0, "rgba(110, 231, 183, 0.8)");
        grad.addColorStop(1, "rgba(20, 80, 70, 0.6)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Unskillful weight (right)
      const rightX = centerX + beamWidth / 2 - 30;
      const rightWeight = totals.unskillful;
      if (rightWeight > 0) {
        ctx.beginPath();
        ctx.arc(rightX, beamY - 20 - rightWeight * 2, 12 + rightWeight, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(rightX + 5, beamY - 20 - rightWeight * 2 - 5, 0, rightX, beamY - 20 - rightWeight * 2, 12 + rightWeight);
        grad.addColorStop(0, "rgba(251, 113, 133, 0.8)");
        grad.addColorStop(1, "rgba(100, 20, 40, 0.6)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Neutral center weight
      const neutralWeight = totals.neutral;
      if (neutralWeight > 0) {
        ctx.beginPath();
        ctx.arc(centerX, beamY - 15 - neutralWeight, 10 + neutralWeight, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();
      }

      // Tilt indicator
      const tilt = centerLineRef.current * 30;
      ctx.save();
      ctx.translate(centerX, beamY);
      ctx.rotate(tilt * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(-beamWidth / 2, 0);
      ctx.lineTo(beamWidth / 2, 0);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.restore();

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 120 + breathEnvelope * 60, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 20;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Totals display
      ctx.font = "bold 18px 'Cormorant Garamond', Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Skillful count (left)
      ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
      ctx.fillText(String(totals.skillful), centerX - 140, centerY - 100);

      // Neutral count (center)
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText(String(totals.neutral), centerX, centerY - 100);

      // Unskillful count (right)
      ctx.fillStyle = "rgba(251, 113, 133, 0.9)";
      ctx.fillText(String(totals.unskillful), centerX + 140, centerY - 100);

      // Labels
      ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("skillful", centerX - 140, centerY - 80);
      ctx.fillText("neutral", centerX, centerY - 80);
      ctx.fillText("unskillful", centerX + 140, centerY - 80);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, totals, entries, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}