// StopSpinningCanvas — animated spinning orb with proximity flash
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StopSpinningCanvasProps {
  phase: "loop" | "reveal" | "confess" | "integrate";
  isSpinning: boolean;
  flashKey: number;
  proximity: number;
  onPress: () => void;
}

export default function StopSpinningCanvas({
  phase,
  isSpinning,
  flashKey,
  proximity,
  onPress,
}: StopSpinningCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Flash effect
  const [flashOpacity, setFlashOpacity] = useState(0);

  useEffect(() => {
    if (flashKey > 0) {
      setFlashOpacity(0.6);
      const timer = setTimeout(() => setFlashOpacity(0), 150);
      return () => clearTimeout(timer);
    }
  }, [flashKey]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.8, 380);
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
      const center = size / 2;
      const radius = size * 0.42;

      ctx.clearRect(0, 0, size, size);

      // Background glow rings
      if (isSpinning) {
        for (let i = 0; i < 4; i++) {
          const r = radius * (0.9 + i * 0.05) + Math.sin(timeRef.current * 0.8 + i) * 4;
          const alpha = 0.03 * (4 - i);
          ctx.beginPath();
          ctx.arc(center, center, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251, 113, 133, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Main spinning ring
      if (isSpinning) {
        const segments = 60;
        const spinSpeed = 0.8; // rotations per second
        const offset = timeRef.current * spinSpeed * Math.PI * 2;

        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + offset;
          const nextAngle = ((i + 1) / segments) * Math.PI * 2 + offset;

          // Pulse with breath-like rhythm
          const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2 + i * 0.1);
          const segmentRadius = radius * (0.85 + pulse * 0.15);

          const x1 = center + Math.cos(angle) * radius * 0.85;
          const y1 = center + Math.sin(angle) * radius * 0.85;
          const x2 = center + Math.cos(nextAngle) * radius * 0.85;
          const y2 = center + Math.sin(nextAngle) * radius * 0.85;
          const x3 = center + Math.cos(nextAngle) * segmentRadius;
          const y3 = center + Math.sin(nextAngle) * segmentRadius;
          const x4 = center + Math.cos(angle) * segmentRadius;
          const y4 = center + Math.sin(angle) * segmentRadius;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.lineTo(x4, y4);
          ctx.closePath();

          const hue = 340 + Math.sin(timeRef.current * 0.5 + i * 0.1) * 20; // rose to red
          const sat = 70 + pulse * 20;
          const light = 40 + pulse * 20;
          ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
          ctx.fill();
        }
      }

      // Inner core
      const coreRadius = radius * 0.5;
      const corePulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.5);
      ctx.beginPath();
      ctx.arc(center, center, coreRadius * (0.9 + corePulse * 0.1), 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(center, center, 0, center, center, coreRadius);
      coreGrad.addColorStop(0, `rgba(251, 113, 133, ${0.4 + corePulse * 0.2})`);
      coreGrad.addColorStop(1, "rgba(136, 19, 55, 0)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Proximity ring
      if (proximity > 0.1) {
        ctx.beginPath();
        ctx.arc(center, center, radius * (1.1 + proximity * 0.2), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 113, 133, ${proximity * 0.4})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 30;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Flash overlay
      if (flashOpacity > 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity * 0.3})`;
        ctx.fill();
      }

      // Center pulse text
      if (phase === "loop" && isSpinning) {
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillStyle = `rgba(251, 113, 133, ${0.6 + Math.sin(timeRef.current * 3) * 0.2})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DON'T", center, center - 10);
        ctx.fillText("PRESS", center, center + 10);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isSpinning, flashKey, flashOpacity, proximity, phase]);

  return (
    <motion.canvas
      ref={canvasRef}
      onClick={onPress}
      className="mx-auto cursor-pointer touch-none"
      style={{ touchAction: "none" }}
      whileTap={{ scale: 0.96 }}
    />
  );
}