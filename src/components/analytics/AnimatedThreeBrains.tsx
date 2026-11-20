import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Expand, Minimize, Zap, Heart, Eye } from "lucide-react";

interface BrainNode {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  label: string;
  size: number;
  connections: string[];
  pulsePhase: number;
}

const BRAINS: BrainNode[] = [
  { id: "head", x: 300, y: 200, baseX: 300, baseY: 200, color: "#3B82F6", label: "Head Brain", size: 60, connections: ["heart", "gut"], pulsePhase: 0 },
  { id: "heart", x: 200, y: 380, baseX: 200, baseY: 380, color: "#EC4899", label: "Heart Brain", size: 55, connections: ["head", "gut"], pulsePhase: 2.1 },
  { id: "gut", x: 400, y: 380, baseX: 400, baseY: 380, color: "#10B981", label: "Gut Brain", size: 55, connections: ["head", "heart"], pulsePhase: 4.2 },
];

export default function AnimatedThreeBrains() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredBrain, setHoveredBrain] = useState<string | null>(null);
  const [brains] = useState<BrainNode[]>(BRAINS);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

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
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      brains.forEach(brain => {
        const pulse = Math.sin(time * 2 + brain.pulsePhase) * 0.15 + 1;
        const floatX = Math.sin(time * 0.5 + brain.pulsePhase) * 3;
        const floatY = Math.cos(time * 0.7 + brain.pulsePhase) * 3;
        
        brain.x = brain.baseX + floatX;
        brain.y = brain.baseY + floatY;

        brain.connections.forEach(connId => {
          const target = brains.find(b => b.id === connId);
          if (!target) return;

          const pulseOpacity = 0.15 + 0.1 * Math.sin(time * 3 + brain.pulsePhase);
          
          ctx.strokeStyle = `rgba(139, 92, 246, ${pulseOpacity})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.lineDashOffset = -time * 30;
          
          ctx.beginPath();
          ctx.moveTo(brain.x, brain.y);
          ctx.quadraticCurveTo(
            (brain.x + target.x) / 2,
            (brain.y + target.y) / 2 - 50,
            target.x,
            target.y
          );
          ctx.stroke();
          ctx.setLineDash([]);
        });
      });

      brains.forEach(brain => {
        const pulse = Math.sin(time * 2 + brain.pulsePhase) * 0.15 + 1;
        const displaySize = brain.size * pulse;
        const isHovered = hoveredBrain === brain.id;

        const gradient = ctx.createRadialGradient(
          brain.x, brain.y, 0,
          brain.x, brain.y, displaySize
        );
        gradient.addColorStop(0, brain.color);
        gradient.addColorStop(0.5, brain.color + "80");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = isHovered ? 1 : 0.7;
        ctx.beginPath();
        ctx.ellipse(brain.x, brain.y, displaySize * 1.2, displaySize * 0.8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = brain.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(brain.x, brain.y, displaySize * 1.4, displaySize * 1.0, -0.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = isHovered ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.font = `bold ${Math.max(12, 14 * pulse)}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(brain.label, brain.x, brain.y + displaySize + 20);
      });

      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = false;
      for (const brain of brains) {
        const dx = mouseX - brain.x;
        const dy = mouseY - brain.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < brain.size * 1.2) {
          setHoveredBrain(brain.id);
          found = true;
          break;
        }
      }
      if (!found) setHoveredBrain(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [brains, hoveredBrain]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full ${isExpanded ? "h-[50vh]" : "h-[35vh]"} rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 overflow-hidden glass-card`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
      
      <div className="absolute top-3 right-3 flex gap-2">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="glass-card rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isExpanded ? "Minimize" : "Expand"}
        >
          {isExpanded ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
        </motion.button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-4 pointer-events-none">
        {brains.map(brain => (
          <motion.div
            key={brain.id}
            className="pointer-events-auto glass-card px-3 py-1 rounded-full text-[10px] font-display tracking-wider uppercase flex items-center gap-1.5"
            style={{ borderColor: brain.color, color: brain.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {brain.id === "head" && <Brain className="w-3 h-3" />}
            {brain.id === "heart" && <Heart className="w-3 h-3" />}
            {brain.id === "gut" && <Zap className="w-3 h-3" />}
            {brain.label}
          </motion.div>
        ))}
      </div>

      {hoveredBrain && (
        <motion.div
          className="absolute top-3 left-3 pointer-events-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="glass-card px-3 py-2 rounded-xl text-sm text-foreground max-w-xs">
            <p className="font-display tracking-wider capitalize">{hoveredBrain} brain</p>
            <p className="text-xs text-muted-foreground mt-1">
              {hoveredBrain === "head" && "Cognitive processing, reasoning, planning"}
              {hoveredBrain === "heart" && "Emotional intelligence, relational wisdom"}
              {hoveredBrain === "gut" && "Intuitive knowing, instinctual responses"}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}