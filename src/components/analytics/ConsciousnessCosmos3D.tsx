import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, Expand, Minimize } from "lucide-react";

interface CosmosNode {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  label: string;
  type: "core" | "dimension" | "practice" | "loop";
}

export default function ConsciousnessCosmos3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [nodes] = useState<CosmosNode[]>(() => {
    const nodes: CosmosNode[] = [
      { id: "center", x: 0, y: 0, z: 0, size: 24, color: "#8B5CF6", label: "Consciousness", type: "core" },
      { id: "thought", x: 120, y: 0, z: 40, size: 16, color: "#3B82F6", label: "Thought", type: "dimension" },
      { id: "emotion", x: -80, y: 100, z: -30, size: 16, color: "#EC4899", label: "Emotion", type: "dimension" },
      { id: "body", x: -100, y: -60, z: 20, size: 16, color: "#10B981", label: "Body", type: "dimension" },
      { id: "awareness", x: 60, y: -100, z: -50, size: 16, color: "#F59E0B", label: "Awareness", type: "dimension" },
      { id: "observation", x: 180, y: 30, z: 60, size: 10, color: "#06B6D4", label: "Observation", type: "practice" },
      { id: "self_inquiry", x: 200, y: -40, z: 20, size: 10, color: "#8B5CF6", label: "Self-Inquiry", type: "practice" },
      { id: "breath", x: -150, y: 120, z: -40, size: 10, color: "#EC4899", label: "Breath", type: "practice" },
      { id: "witnessing", x: -160, y: -80, z: 50, size: 10, color: "#10B981", label: "Witnessing", type: "practice" },
      { id: "body_awareness", x: 80, y: -160, z: -80, size: 10, color: "#F59E0B", label: "Body Awareness", type: "practice" },
      { id: "loop_1", x: 250, y: 0, z: 80, size: 8, color: "#EF4444", label: "Mental Loop", type: "loop" },
      { id: "loop_2", x: -200, y: 150, z: -60, size: 8, color: "#EF4444", label: "Emotional Loop", type: "loop" },
    ];
    return nodes;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
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

    const rotatePoint = (x: number, y: number, z: number, rx: number, ry: number) => {
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      
      const y1 = y * cosX - z * sinX;
      let z1 = y * sinX + z * cosX;
      const x1 = x * cosY + z1 * sinY;
      z1 = -x * sinY + z1 * cosY;
      
      return { x: x1, y: y1, z: z1 };
    };

    const project = (x: number, y: number, z: number, width: number, height: number) => {
      const focalLength = 300;
      const scale = focalLength / (focalLength + z);
      return {
        x: x * scale + width / 2,
        y: -y * scale + height / 2,
        scale,
      };
    };

    const draw = () => {
      if (!ctx || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      targetRotationY += (mouseX - targetRotationY) * 0.02;
      targetRotationX += (-mouseY - targetRotationX) * 0.02;
      rotationY += (targetRotationY - rotationY) * 0.1;
      rotationX += (targetRotationX - rotationX) * 0.1;

      const transformed = nodes.map(node => {
        const rotated = rotatePoint(node.x, node.y, node.z, rotationX, rotationY);
        const projected = project(rotated.x, rotated.y, rotated.z, width, height);
        return { ...node, ...rotated, ...projected };
      });

      transformed.sort((a, b) => b.z - a.z);

      ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
      ctx.lineWidth = 1;
      
      transformed.forEach(node => {
        if (node.id !== "center") {
          const center = transformed.find(n => n.id === "center");
          if (center) {
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
          }
        }
      });

      transformed.forEach(node => {
        const opacity = Math.max(0.3, Math.min(1, node.scale));
        const displaySize = Math.max(2, node.size * node.scale);
        
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, displaySize
        );
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(node.x, node.y, displaySize, 0, Math.PI * 2);
        ctx.fill();
        
        if (node.scale > 0.5 && displaySize > 6) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
          ctx.font = `${Math.max(10, 12 * node.scale)}px system-ui`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.x, node.y - displaySize - 8 * node.scale);
        }
        
        if (node.type === "core") {
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, displaySize + 10 * Math.sin(Date.now() / 500), 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / 200;
      mouseY = (e.clientY - rect.top - rect.height / 2) / 200;
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
            Drag to rotate · Scroll to zoom
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-1 pointer-events-none">
        {nodes.filter(n => n.type === "dimension").map(node => (
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