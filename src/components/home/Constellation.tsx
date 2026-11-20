"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

interface DiscoveryNode {
  id: string;
  label: string;
  category: "observation" | "insight" | "practice" | "theme" | "loop";
  explorationStatus: "explored" | "current" | "available";
  relationships: string[];
}

interface ConstellationProps {
  nodes: DiscoveryNode[];
}

const CATEGORY_COLORS: Record<DiscoveryNode["category"], string> = {
  observation: "--primary",
  insight: "--accent",
  practice: "--success",
  theme: "--gold-600",
  loop: "--muted-foreground",
};

function getCanvasColor(token: string, alpha = 1) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return `hsl(${value || "0 0% 50%"} / ${alpha})`;
}

export default function Constellation({ nodes }: ConstellationProps) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        setSize({ width: canvas.width, height: canvas.height });
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    window.addEventListener("resize", resize);
    return () => { ro.disconnect(); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw subtle cosmic background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.5);
    gradient.addColorStop(0, getCanvasColor("--primary", 0.02));
    gradient.addColorStop(1, "rgba(8,9,8,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Calculate node positions using force-directed layout (simplified)
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Place explored nodes in a spiral
    const exploredNodes = nodes.filter(n => n.explorationStatus === "explored");
    const currentNodes = nodes.filter(n => n.explorationStatus === "current");
    const availableNodes = nodes.filter(n => n.explorationStatus === "available");

    const allNodes = [...currentNodes, ...exploredNodes, ...availableNodes];

    allNodes.forEach((node, i) => {
      const angle = (i / Math.max(1, allNodes.length)) * Math.PI * 2 * 1.618; // Golden angle
      const radius = maxRadius * (0.15 + 0.7 * (i / Math.max(1, allNodes.length - 1)));
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    // Draw connections
    ctx.strokeStyle = getCanvasColor("--primary", 0.06);
    ctx.lineWidth = 1;
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      node.relationships.forEach(relId => {
        const relPos = nodePositions.get(relId);
        if (relPos) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          const bend = ((node.id.length + relId.length) % 7 - 3) * 3;
          ctx.quadraticCurveTo(
            (pos.x + relPos.x) / 2 + bend,
            (pos.y + relPos.y) / 2 - bend,
            relPos.x, relPos.y
          );
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    allNodes.forEach((node, i) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const color = CATEGORY_COLORS[node.category];
      const isCurrent = node.explorationStatus === "current";
      const isExplored = node.explorationStatus === "explored";

      // Outer glow for current
      if (isCurrent && !reducedMotion) {
        const time = Date.now() / 1000;
        const pulse = 1 + Math.sin(time * 2) * 0.15;
        const glowRadius = 18 * pulse;
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
        glow.addColorStop(0, getCanvasColor(color, 0.25));
        glow.addColorStop(1, getCanvasColor(color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node body
      const nodeRadius = isCurrent ? 10 : isExplored ? 8 : 6;
      const gradient = ctx.createRadialGradient(
        pos.x - nodeRadius * 0.3, pos.y - nodeRadius * 0.3, 0,
        pos.x, pos.y, nodeRadius
      );
      gradient.addColorStop(0, getCanvasColor(color));
      gradient.addColorStop(1, getCanvasColor(color, 0.67));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ring for explored
      if (isExplored) {
        ctx.strokeStyle = getCanvasColor(color, 0.38);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.font = "11px Inter, system-ui";
      ctx.fillStyle = isExplored ? "hsl(41 33% 87% / 0.8)" : isCurrent ? "hsl(42 80% 78%)" : "hsl(46 6% 57% / 0.5)";
      ctx.textAlign = "center";
      ctx.fillText(node.label, pos.x, pos.y + nodeRadius + 14);
    });
  }, [nodes, size, reducedMotion]);

  return (
    <section aria-labelledby="constellation-title" className="relative">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-primary/65">Your discovery universe</p>
          <h2 id="constellation-title" className="mt-1.5 text-2xl font-light tracking-wide text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-editorial)" }}>The constellation of your explorations</h2>
        </div>
        <p className="mb-5 text-[10px] text-muted-foreground/60">Recent explorations and profile focus, gathered as they emerge.</p>
      </div>

      {nodes.length === 0 && (
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Your constellation will begin to take shape as you explore. Nothing is filled in before it exists.
        </p>
      )}

      <div className="relative aspect-[4/3] max-h-[380px] rounded-2xl bg-background border border-white/[0.04] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-label="Interactive constellation of your explored themes and their connections"
        />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] to-transparent" />
        </div>
      </div>

      {nodes.length > 0 && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 flex flex-wrap gap-2"
          role="list"
          aria-label="Explored concepts"
        >
          {nodes.filter(n => n.explorationStatus === "explored").slice(0, 6).map((node, i) => (
            <motion.span
              key={node.id}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: reducedMotion ? 0 : i * 0.04 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-foreground/[0.015] px-3 py-1.5 text-[10px] text-muted-foreground transition hover:border-primary/25 hover:bg-primary/[0.04] hover:text-foreground/85"
              role="listitem"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                aria-hidden="true"
              />
              {node.label}
            </motion.span>
          ))}
        </motion.div>
      )}

      <motion.button
        type="button"
        onClick={() => navigate("/app/constellation")}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs text-primary/80 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Explore full constellation <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.button>
    </section>
  );
}