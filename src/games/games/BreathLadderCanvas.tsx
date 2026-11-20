// BreathLadderCanvas — animated breath orb with 4-7-8 phase rings
"use client";

import { useEffect, useRef } from "react";

interface BreathLadderCanvasProps {
  phase: "settle" | "round" | "reflect" | "integrate";
  step: "in" | "hold" | "out";
  round: number;
  countdown: number;
  breathEnvelope: number;
  targetInhale: number;
  targetHold: number;
  targetExhale: number;
}

export default function BreathLadderCanvas({
  phase,
  step,
  round,
  countdown,
  breathEnvelope,
  targetInhale,
  targetHold,
  targetExhale,
}: BreathLadderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const phaseStartRef = useRef(0);

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

    // Track step changes
    if (step !== "in" || phase !== "round") {
      phaseStartRef.current = performance.now();
    }

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size * 0.4;

      ctx.clearRect(0, 0, size, size);

      // Background glow
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.7);
      if (phase === "round") {
        const stepColor = step === "in" ? "110, 231, 183" : step === "hold" ? "110, 231, 183" : "45, 212, 191";
        grad.addColorStop(0, `rgba(${stepColor}, 0.05)`);
        grad.addColorStop(0.5, `rgba(${stepColor}, 0.02)`);
        grad.addColorStop(1, "transparent");
      } else {
        grad.addColorStop(0, "rgba(110, 231, 183, 0.04)");
        grad.addColorStop(1, "transparent");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Target rings for 4-7-8
      if (phase === "round") {
        // Inhale ring (4s) - inner
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(110, 231, 183, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hold ring (7s) - middle
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(110, 231, 183, 0.1)";
        ctx.lineWidth = 1;
        ctx.setLineDash([12, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Exhale ring (8s) - outer
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([16, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Main breathing orb
      let orbRadius: number;
      let orbColor: string;
      let pulseAlpha: number;

      if (phase === "round") {
        const elapsed = (performance.now() - phaseStartRef.current) / 1000;
        let progress: number;

        if (step === "in") {
          progress = Math.min(1, elapsed / (targetInhale / 1000));
          orbRadius = maxRadius * (0.35 + progress * 0.25); // grows to hold ring
          orbColor = "110, 231, 183"; // emerald
          pulseAlpha = 0.4 + 0.3 * Math.sin(timeRef.current * 3);
        } else if (step === "hold") {
          progress = Math.min(1, elapsed / (targetHold / 1000));
          orbRadius = maxRadius * (0.6 + progress * 0.25); // grows to exhale ring
          orbColor = "110, 231, 183"; // emerald
          pulseAlpha = 0.5 + 0.2 * Math.sin(timeRef.current * 1.5);
        } else { // out
          progress = Math.min(1, elapsed / (targetExhale / 1000));
          orbRadius = maxRadius * (0.85 - progress * 0.5); // shrinks back
          orbColor = "45, 212, 191"; // cyan
          pulseAlpha = 0.3 + 0.3 * Math.sin(timeRef.current * 2);
        }

        // Orb glow
        const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 1.5);
        orbGrad.addColorStop(0, `rgba(${orbColor}, ${pulseAlpha})`);
        orbGrad.addColorStop(0.5, `rgba(${orbColor}, ${pulseAlpha * 0.4})`);
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Orb core
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
        coreGrad.addColorStop(0, `rgba(${orbColor}, 0.9)`);
        coreGrad.addColorStop(0.5, `rgba(${orbColor}, 0.5)`);
        coreGrad.addColorStop(1, `rgba(${orbColor}, 0.1)`);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Progress arc on current target ring
        let targetRingRadius: number;
        if (step === "in") targetRingRadius = maxRadius * 0.35;
        else if (step === "hold") targetRingRadius = maxRadius * 0.6;
        else targetRingRadius = maxRadius * 0.85;

        ctx.beginPath();
        ctx.arc(centerX, centerY, targetRingRadius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = `rgba(${orbColor}, 0.8)`;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Countdown text
        ctx.font = "bold 48px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + 0.1 * Math.sin(timeRef.current * 4)})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(countdown), centerX, centerY);

        // Step label
        ctx.font = "italic 18px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${orbColor}, 0.9)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(step.toUpperCase(), centerX, centerY + orbRadius + 30);
      } else if (phase === "settle") {
        // Idle breathing orb
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 0.6);
        orbRadius = maxRadius * 0.3 * (0.8 + pulse * 0.4);
        orbColor = "110, 231, 183";

        const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        orbGrad.addColorStop(0, `rgba(${orbColor}, ${0.3 + pulse * 0.2})`);
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius);
        coreGrad.addColorStop(0, `rgba(${orbColor}, 0.6)`);
        coreGrad.addColorStop(1, `rgba(${orbColor}, 0.1)`);
        ctx.fillStyle = coreGrad;
        ctx.fill();
      } else {
        // Reflect/integrate - gentle pulse
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 0.4);
        orbRadius = maxRadius * 0.25 * (0.9 + pulse * 0.2);
        orbColor = "110, 231, 183";

        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius);
        coreGrad.addColorStop(0, `rgba(${orbColor}, 0.6)`);
        coreGrad.addColorStop(1, `rgba(${orbColor}, 0.1)`);
        ctx.fillStyle = coreGrad;
        ctx.fill();
      }

      // Breath envelope visualization
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.95 + breathEnvelope * 30, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Round indicators
      if (phase === "round") {
        const dotY = size - 60;
        const dotSpacing = 18;
        const startX = centerX - (ROUNDS - 1) * dotSpacing / 2;
        for (let i = 0; i < ROUNDS; i++) {
          ctx.beginPath();
          ctx.arc(startX + i * dotSpacing, dotY, i < round ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = i < round ? "rgba(110, 231, 183, 0.8)" : "rgba(255, 255, 255, 0.15)";
          if (i + 1 === round) {
            ctx.shadowColor = "rgba(110, 231, 183, 0.6)";
            ctx.shadowBlur = 10;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, step, round, countdown, breathEnvelope, targetInhale, targetHold, targetExhale]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

const ROUNDS = 4;