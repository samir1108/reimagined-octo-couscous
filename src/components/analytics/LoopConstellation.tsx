import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, Expand, Minimize } from "lucide-react";

interface ConstellationNode {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  label: string;
  type: "core" | "loop" | "practice";
}

export default function LoopConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [nodes] = useState<ConstellationNode[]>(() => {
    const nodes: ConstellationNode[] = [
      { id: "center", x: 0, y: 0, size: 20, color: "#8B5CF6", label: "Core Loop", type: "core" },
      { id: "loop_1", x: 120, y: 40, size: 14, color: "#EF4444", label: "Mental Loop", type: "loop" },
      { id: "loop_2", x: -100, y: 80, size: 14, color: "#EC4899", label: "Emotional Loop", type: "loop" },
      { id: "loop_3", x: 80, y: -120, size: 14, color: "#10B981", label: "Body Loop", type: "loop" },
      { id: "loop_4", x: -140, y: -60, size: 14, color: "#3B82F6", label: "Awareness Loop", type: "loop" },
      { id: "practice_1", x: 180, y: 20, size: 10, color: "#06B6D4", label: "Observation", type: "practice" },
      { id: "practice_2", x: 200, y: -50, size: 10, color: "#8B5CF6", label: "Self-Inquiry", type: "practice" },
      { id: "practice_3", x: -180, y: 100, size: 10, color: "#EC4899", label: "Breath", type: "practice" },
      { id: "practice_4", x: -200, y: -80, size: 10, color: "#10B981", label: "Witnessing", type: "practice" },
      { id: "practice_5", x: 100, y: -180, size: 10, color: "#F59E0B", label: "Body Awareness", type: "practice" },
    ];
    return nodes;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;
    let targetRotation = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!ctx || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      targetRotation += (mouseX * 0.5 - targetRotation) * 0.02;
      rotation += (targetRotation - rotation) * 0.1;

      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      const transformed = nodes.map(node => {
        const x = node.x * cos - node.y * sin;
        const y = node.x * sin + node.y * cos;
        return { ...node, x, y };
      });

      ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
      ctx.lineWidth = 1;
      
      const center = transformed.find(n => n.id === "center");
      if (center) {
        transformed.forEach(node => {
          if (node.id !== "center") {
            ctx.beginPath();
            ctx.moveTo(center.x + width / 2, center.y + height / 2);
            ctx.lineTo(node.x + width / 2, node.y + height / 2);
            ctx.stroke();
          }
        });
      }

      transformed.forEach(node => {
        const opacity = Math.max(0.4, 1 - Math.abs(node.y) / 400);
        const displaySize = Math.max(3, node.size * opacity);
        
        const gradient = ctx.createRadialGradient(
          node.x + width / 2, node.y + height / 2, 0,
          node.x + width / 2, node.y + height / 2, displaySize
        );
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(node.x + width / 2, node.y + height / 2, displaySize, 0, Math.PI * 2);
        ctx.fill();
        
        if (displaySize > 8) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
          ctx.font = `${Math.max(9, 11 * opacity)}px system-ui`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.x + width / 2, node.y + height / 2 - displaySize - 6);
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / 150;
      mouseY = (e.clientY - rect.top - rect.height / 2) / 150;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [nodes]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full ${isExpanded ? "h-[70vh]" : "h-[50vh]"} rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 overflow-hidden glass-card`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
      
      <div className="absolute inset-0 flex items-start justify-end p-4 pointer-events-none">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="pointer-events-auto glass-card rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isExpanded ? "Minimize" : "Expand"}
        >
          {isExpanded ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
        </motion.button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="flex flex-wrap justify-center gap-2">
          <span className="glass-card px-3 py-1 rounded-full text-[10px] font-display tracking-wider uppercase text-muted-foreground">
            Drag to rotate · Hover loops to highlight
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-1 pointer-events-none">
        {nodes.filter(n => n.type === "loop").map(node => (
          <motion.div
            key={node.id}
            className="pointer-events-auto glass-card px-2 py-1 rounded-full text-[9px] font-display tracking-wider uppercase"
            style={{ borderColor: node.color, color: node.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {node.label}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}