// DarshanSitCanvas — animated gaze visualization with dual-direction tracking
"use client";

import { useEffect, useRef } from "react";

interface DarshanSitCanvasProps {
  phase: "intro" | "pick" | "look" | "beseen" | "compare" | "integrate";
  face: string;
  remain: number;
  harder: "looking" | "beseen" | "same" | null;
  breathEnvelope: number;
}

export default function DarshanSitCanvas({
  phase,
  face,
  remain,
  harder,
  breathEnvelope,
}: DarshanSitCanvasProps) {
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
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, "rgba(20, 15, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 2, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Two eyes visualization
      const eyeOffset = 80;
      const eyeY = centerY;
      const leftEyeX = centerX - eyeOffset;
      const rightEyeX = centerX + eyeOffset;
      const eyeRadius = 50;

      // Draw two eyes
      const eyes = [
        { x: leftEyeX, y: eyeY, label: "YOU", color: "251, 113, 133", phase: "look" },
        { x: rightEyeX, y: eyeY, label: "THEM", color: "240, 140, 60", phase: "beseen" },
      ];

      eyes.forEach((eye) => {
        const isActive = phase === eye.phase;
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * (isActive ? 2 : 1));
        const eyeRadius = eyeRadius * (0.8 + pulse * 0.2);

        // Eye glow
        const eyeGrad = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, eyeRadius * 1.5);
        const c = eye.color;
        const baseAlpha = isActive ? 0.3 : 0.1;
        eyeGrad.addColorStop(0, `rgba(${c}, ${baseAlpha + pulse * 0.15})`);
        eyeGrad.addColorStop(1, "transparent");
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, eyeRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye white
        ctx.beginPath();
        ctx.ellipse(eye.x, eye.y, eyeRadius * 0.8, eyeRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();

        // Iris
        const irisRadius = eyeRadius * 0.4;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, irisRadius, 0, Math.PI * 2);
        const irisGrad = ctx.createRadialGradient(eye.x - irisRadius * 0.3, eye.y - irisRadius * 0.3, 0, eye.x, eye.y, irisRadius);
        irisGrad.addColorStop(0, `rgba(${eye.color}, 0.9)`);
        irisGrad.addColorStop(0.5, `rgba(${eye.color}, 0.6)`);
        irisGrad.addColorStop(1, `rgba(${eye.color}, 0.3)`);
        ctx.fillStyle = irisGrad;
        ctx.fill();

        // Pupil
        const pupilRadius = irisRadius * 0.4;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, pupilRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(eye.x - pupilRadius * 0.3, eye.y - pupilRadius * 0.3, pupilRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();

        // Glow ring when active
        if (isActive) {
          const pulseAlpha = 0.5 + 0.5 * Math.sin(timeRef.current * 3);
          ctx.beginPath();
          ctx.arc(eye.x, eye.y, eyeRadius * 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${eye.color}, ${pulseAlpha * 0.4})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${eye.color}, ${isActive ? 0.9 : 0.5})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(eye.label, eye.x, eye.y + eyeRadius + 25);
      });

      // Connection line between eyes
      if (phase === "look" || phase === "beseen" || phase === "compare") {
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2);
        ctx.beginPath();
        ctx.moveTo(leftEyeX, eyeY);
        ctx.lineTo(rightEyeX, eyeY);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.1 + pulse * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -timeRef.current * 30;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Spawn particles when gazing
      if ((phase === "look" || phase === "beseen") && Math.random() < 0.1) {
        const isLooking = phase === "look";
        const fromX = isLooking ? leftEyeX : rightEyeX;
        const toX = isLooking ? rightEyeX : leftEyeX;
        const angle = isLooking ? 0 : Math.PI;
        const speed = 30 + Math.random() * 50;
        particlesRef.current.push({
          x: fromX,
          y: eyeY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: isLooking ? "251, 113, 133" : "240, 140, 60",
          life: 0,
          maxLife: 2 + Math.random() * 1.5,
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

      // Harder indicator
      if (phase === "compare" && harder) {
        const isLookingHarder = harder === "looking";
        const harderEyeX = isLookingHarder ? leftEyeX : rightEyeX;
        const harderColor = isLookingHarder ? "251, 113, 133" : "240, 140, 60";

        ctx.beginPath();
        ctx.arc(harderEyeX, eyeY, 70 + Math.sin(timeRef.current * 3) * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${harderColor}, ${0.4 + Math.sin(timeRef.current * 4) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = "bold 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${harderColor}, 0.9)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("HARDER", harderEyeX, eyeY - 80);
      }

      // Timer text
      if (phase === "look" || phase === "beseen") {
        ctx.font = "bold 48px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 113, 133, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(remain), centerX, centerY);
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Progress ring
      const progress = (GAZE_SECONDS - remain) / GAZE_SECONDS;
      if (phase === "look" || phase === "beseen") {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.45, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Face label
      if (face) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 113, 133, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(face, centerX, size * 0.15);
      }

      // Harder text
      if (phase === "compare" && harder) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const text = harder === "looking" ? "looking was harder" : harder === "beseen" ? "being seen was harder" : "both equally hard";
        ctx.fillText(text, centerX, centerY + 80);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, face, remain, harder, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

const GAZE_SECONDS = 60;
const eyeRadius = 50;