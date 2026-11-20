// CoherentThreeCanvas — three animated oscillators with phase coupling
"use client";

import { useEffect, useRef } from "react";

interface CoherentThreeCanvasProps {
  phase: "settle" | "calibrate" | "cohere" | "reflect" | "integrate";
  coherence: number;
  headPhase: number;
  heartPhase: number;
  gutPhase: number;
  breathEnvelope: number;
  maxCoherence: number;
  breathCycles: number;
  progress: number;
}

export default function CoherentThreeCanvas({
  phase,
  coherence,
  headPhase,
  heartPhase,
  gutPhase,
  breathEnvelope,
  maxCoherence,
  breathCycles,
  progress,
}: CoherentThreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.85, 380);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Three brain positions (triangle)
    const positions = [
      { x: 0.5, y: 0.2, name: "head", color: "120, 180, 255" }, // indigo/blue
      { x: 0.25, y: 0.7, name: "heart", color: "255, 120, 180" }, // pink
      { x: 0.75, y: 0.7, name: "gut", color: "255, 200, 80" }, // amber
    ];

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const centerX = size / 2;
      const centerY = size / 2;
      const orbitRadius = size * 0.25;

      ctx.clearRect(0, 0, size, size);

      // Background
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      grad.addColorStop(0, "rgba(30, 30, 60, 0.05)");
      grad.addColorStop(0.5, "rgba(15, 15, 30, 0.03)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Coherence field - central glow
      if (phase === "cohere" || phase === "reflect" || phase === "integrate") {
        const fieldRadius = size * 0.4 * (0.5 + coherence * 0.5);
        const fieldGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fieldRadius);
        fieldGrad.addColorStop(0, `rgba(120, 180, 255, ${coherence * 0.08})`);
        fieldGrad.addColorStop(0.5, `rgba(255, 120, 180, ${coherence * 0.05})`);
        fieldGrad.addColorStop(1, "transparent");
        ctx.fillStyle = fieldGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, fieldRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw coupling lines between brains
      const brainPositions = positions.map((p, i) => {
        const phaseVal = i === 0 ? headPhase : i === 1 ? heartPhase : gutPhase;
        const angleOffset = Math.sin(timeRef.current * 0.5 + i) * 0.3;
        return {
          x: centerX + p.x * size * 0.4,
          y: centerY + p.y * size * 0.4,
          phase: phaseVal + angleOffset,
          color: p.color,
        };
      });

      // Phase coupling lines
      if (phase === "cohere" || phase === "reflect" || phase === "integrate") {
        for (let i = 0; i < 3; i++) {
          for (let j = i + 1; j < 3; j++) {
            const p1 = brainPositions[i];
            const p2 = brainPositions[j];
            const phaseDiff = Math.abs(p1.phase - p2.phase);
            const coupling = Math.max(0, 1 - phaseDiff * 2) * coherence;
            
            if (coupling > 0.1) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(200, 200, 255, ${coupling * 0.4})`;
              ctx.lineWidth = 1 + coupling * 2;
              ctx.setLineDash([10, 5]);
              ctx.lineDashOffset = -timeRef.current * 30;
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }

      // Draw three brain oscillators
      brainPositions.forEach((brain, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.5 + brain.phase * Math.PI * 2);
        const radius = 30 + pulse * 15 * (0.5 + coherence * 0.5);

        // Outer glow ring
        const glowGrad = ctx.createRadialGradient(brain.x, brain.y, 0, brain.x, brain.y, radius * 1.8);
        glowGrad.addColorStop(0, `rgba(${brain.color}, ${0.15 + coherence * 0.1})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(brain.x, brain.y, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Main oscillator circle
        ctx.beginPath();
        ctx.arc(brain.x, brain.y, radius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(brain.x - radius * 0.3, brain.y - radius * 0.3, 0, brain.x, brain.y, radius);
        coreGrad.addColorStop(0, `rgba(${brain.color}, 0.9)`);
        coreGrad.addColorStop(0.5, `rgba(${brain.color}, 0.5)`);
        coreGrad.addColorStop(1, `rgba(${brain.color}, 0.1)`);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Phase indicator arc
        const arcRadius = radius * 1.3;
        const phaseArc = brain.phase * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(brain.x, brain.y, arcRadius, -Math.PI / 2, -Math.PI / 2 + phaseArc);
        ctx.strokeStyle = `rgba(${brain.color}, 0.6)`;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();

        // Label
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${brain.color}, 0.8)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const name = i === 0 ? "HEAD" : i === 1 ? "HEART" : "GUT";
        ctx.fillText(name, brain.x, brain.y + radius + 25);
      });

      // Spawn coherence particles
      if (phase === "cohere" && coherence > 0.5 && Math.random() < coherence * 0.05) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 80,
          y: centerY + (Math.random() - 0.5) * 80,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: `hsl(${240 + Math.random() * 60}, 70%, 60%)`,
          life: 0,
          maxLife: 3 + Math.random() * 2,
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const prog = p.life / p.maxLife;
        const alpha = (1 - prog) * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - prog * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Breath envelope visualization
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.45 + breathEnvelope * 80, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 6]);
        ctx.lineDashOffset = -timeRef.current * 20;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Progress ring
      if (progress > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.42, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = "rgba(125, 211, 252, 0.6)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Max coherence display
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 200, 100, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(maxCoherence * 100)}%`, centerX, centerY + size * 0.35);

      // Breath cycles
      ctx.font = "12px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${breathCycles} cycles`, centerX, centerY + size * 0.4);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, coherence, headPhase, heartPhase, gutPhase, breathEnvelope, maxCoherence, breathCycles, progress]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}