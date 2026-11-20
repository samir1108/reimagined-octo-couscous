import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Expand, Minimize, Heart, BookOpen, Users, Crown, Zap, Sparkles } from "lucide-react";

interface PathNode {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  progress: number;
  pulsePhase: number;
}

const PATHS: PathNode[] = [
  { id: "raja", x: 300, y: 150, baseX: 300, baseY: 150, color: "#8B5CF6", label: "Raja Yoga", icon: <Crown className="w-5 h-5" />, description: "Discipline & Meditation", progress: 0.6, pulsePhase: 0 },
  { id: "jnana", x: 150, y: 280, baseX: 150, baseY: 280, color: "#3B82F6", label: "Jnana Yoga", icon: <BookOpen className="w-5 h-5" />, description: "Knowledge & Self-Inquiry", progress: 0.4, pulsePhase: 1.5 },
  { id: "bhakti", x: 450, y: 280, baseX: 450, baseY: 280, color: "#EC4899", label: "Bhakti Yoga", icon: <Heart className="w-5 h-5" />, description: "Devotion & Heart Opening", progress: 0.5, pulsePhase: 3 },
  { id: "karma", x: 300, y: 410, baseX: 300, baseY: 410, color: "#10B981", label: "Karma Yoga", icon: <Users className="w-5 h-5" />, description: "Action & Service", progress: 0.3, pulsePhase: 4.5 },
];

export default function AnimatedYogaPaths() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [paths] = useState<PathNode[]>(PATHS);

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

    const centerX = 300;
    const centerY = 280;

    const draw = () => {
      if (!ctx || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      paths.forEach(path => {
        const pulse = Math.sin(time * 1.5 + path.pulsePhase) * 0.08 + 1;
        const orbitAngle = time * 0.2 + path.pulsePhase;
        const radius = 130;
        
        path.x = centerX + Math.cos(orbitAngle) * radius * 0.6;
        path.y = centerY + Math.sin(orbitAngle) * radius * 0.6;

        const progressPulse = Math.sin(time * 3 + path.pulsePhase) * 0.1 + path.progress;
        
        const grad = ctx.createLinearGradient(centerX, centerY, path.x, path.y);
        grad.addColorStop(0, path.color + "60");
        grad.addColorStop(1, path.color + "10");
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -time * 20;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(
          (centerX + path.x) / 2 + Math.sin(time + path.pulsePhase) * 10,
          (centerY + path.y) / 2 + Math.cos(time + path.pulsePhase) * 10,
          path.x,
          path.y
        );
        ctx.stroke();
        ctx.setLineDash([]);
      });

      paths.forEach(path => {
        const pulse = Math.sin(time * 1.5 + path.pulsePhase) * 0.08 + 1;
        const displaySize = 50 * pulse;
        const isHovered = hoveredPath === path.id;

        const gradient = ctx.createRadialGradient(
          path.x, path.y, 0,
          path.x, path.y, displaySize
        );
        gradient.addColorStop(0, path.color);
        gradient.addColorStop(0.6, path.color + "80");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = isHovered ? 1 : 0.7;
        ctx.beginPath();
        ctx.arc(path.x, path.y, displaySize, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = path.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(path.x, path.y, displaySize * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        const progressRing = path.progress;
        ctx.strokeStyle = path.color + "60";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(path.x, path.y, displaySize + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressRing);
        ctx.stroke();

        ctx.globalAlpha = 1;
      });

      const centerPulse = Math.sin(time * 2) * 0.15 + 1;
      const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40 * centerPulse);
      centerGrad.addColorStop(0, "#8B5CF6");
      centerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = centerGrad;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40 * centerPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = false;
      for (const path of paths) {
        const dx = mouseX - path.x;
        const dy = mouseY - path.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          setHoveredPath(path.id);
          found = true;
          break;
        }
      }
      if (!found) setHoveredPath(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [paths, hoveredPath]);

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

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap justify-center gap-2 pointer-events-none">
        {paths.map(path => (
          <motion.div
            key={path.id}
            className="pointer-events-auto glass-card px-3 py-1.5 rounded-full text-[10px] font-display tracking-wider uppercase flex items-center gap-1.5"
            style={{ borderColor: path.color, color: path.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {path.icon}
            {path.label}
          </motion.div>
        ))}
      </div>

      {hoveredPath && (
        <motion.div
          className="absolute top-3 left-3 pointer-events-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="glass-card px-3 py-2 rounded-xl text-sm text-foreground max-w-xs">
            <p className="font-display tracking-wider">{hoveredPath.charAt(0).toUpperCase() + hoveredPath.slice(1)} Yoga</p>
            <p className="text-xs text-muted-foreground mt-1">
              {paths.find(p => p.id === hoveredPath)?.description}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}