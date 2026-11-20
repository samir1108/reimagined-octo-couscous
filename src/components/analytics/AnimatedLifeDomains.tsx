import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Expand, Minimize, Home, Heart, Briefcase, BookOpen, Leaf, Users, Music, Dumbbell, Brain, Sparkles } from "lucide-react";

interface DomainNode {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  label: string;
  icon: React.ReactNode;
  level: number;
  angle: number;
  radius: number;
  orbitSpeed: number;
}

const DOMAINS: DomainNode[] = [
  { id: "health", x: 0, y: 0, baseX: 0, baseY: 0, color: "#10B981", label: "Health", icon: <Heart className="w-4 h-4" />, level: 0.7, angle: 0, radius: 120, orbitSpeed: 0.15 },
  { id: "relationships", x: 0, y: 0, baseX: 0, baseY: 0, color: "#EC4899", label: "Relationships", icon: <Users className="w-4 h-4" />, level: 0.5, angle: Math.PI * 0.4, radius: 120, orbitSpeed: 0.12 },
  { id: "work", x: 0, y: 0, baseX: 0, baseY: 0, color: "#3B82F6", label: "Work", icon: <Briefcase className="w-4 h-4" />, level: 0.6, angle: Math.PI * 0.8, radius: 120, orbitSpeed: 0.18 },
  { id: "growth", x: 0, y: 0, baseX: 0, baseY: 0, color: "#8B5CF6", label: "Growth", icon: <BookOpen className="w-4 h-4" />, level: 0.8, angle: Math.PI * 1.2, radius: 120, orbitSpeed: 0.1 },
  { id: "creativity", x: 0, y: 0, baseX: 0, baseY: 0, color: "#F59E0B", label: "Creativity", icon: <Music className="w-4 h-4" />, level: 0.4, angle: Math.PI * 1.6, radius: 120, orbitSpeed: 0.14 },
  { id: "spirituality", x: 0, y: 0, baseX: 0, baseY: 0, color: "#D946EF", label: "Spirituality", icon: <Sparkles className="w-4 h-4" />, level: 0.7, angle: Math.PI * 2.0, radius: 120, orbitSpeed: 0.08 },
  { id: "home", x: 0, y: 0, baseX: 0, baseY: 0, color: "#06B6D4", label: "Home", icon: <Home className="w-4 h-4" />, level: 0.5, angle: Math.PI * 2.4, radius: 120, orbitSpeed: 0.16 },
  { id: "mind", x: 0, y: 0, baseX: 0, baseY: 0, color: "#6366F1", label: "Mind", icon: <Brain className="w-4 h-4" />, level: 0.6, angle: Math.PI * 2.8, radius: 120, orbitSpeed: 0.13 },
];

export default function AnimatedLifeDomains() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [domains] = useState<DomainNode[]>(DOMAINS);

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
    const centerY = 250;

    const draw = () => {
      if (!ctx || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      const centerPulse = Math.sin(time * 1.2) * 0.1 + 1;
      
      const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 * centerPulse);
      centerGrad.addColorStop(0, "rgba(139, 92, 246, 0.2)");
      centerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60 * centerPulse, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        const ringPulse = Math.sin(time * 0.6 + i * 2) * 0.05 + 1;
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 / (i + 1)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([15, 10]);
        ctx.lineDashOffset = -time * 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40 * ringPulse + i * 30, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      domains.forEach(domain => {
        domain.angle += domain.orbitSpeed * 0.01;
        domain.x = centerX + Math.cos(domain.angle) * domain.radius;
        domain.y = centerY + Math.sin(domain.angle) * domain.radius;

        const pulse = Math.sin(time * 2 + domain.angle) * 0.08 + 1;
        const displaySize = 35 * pulse * (0.6 + domain.level * 0.4);
        const isHovered = hoveredDomain === domain.id;

        const grad = ctx.createLinearGradient(centerX, centerY, domain.x, domain.y);
        grad.addColorStop(0, domain.color + "40");
        grad.addColorStop(1, domain.color + "05");
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -time * 10;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(domain.x, domain.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const domainGrad = ctx.createRadialGradient(domain.x, domain.y, 0, domain.x, domain.y, displaySize);
        domainGrad.addColorStop(0, domain.color);
        domainGrad.addColorStop(0.7, domain.color + "80");
        domainGrad.addColorStop(1, "transparent");
        
        ctx.fillStyle = domainGrad;
        ctx.globalAlpha = isHovered ? 1 : 0.7;
        ctx.beginPath();
        ctx.arc(domain.x, domain.y, displaySize, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = domain.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(domain.x, domain.y, displaySize * 1.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        const levelRing = domain.level;
        ctx.strokeStyle = domain.color + "60";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(domain.x, domain.y, displaySize + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * levelRing);
        ctx.stroke();

        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = false;
      for (const domain of domains) {
        const dx = mouseX - domain.x;
        const dy = mouseY - domain.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 45) {
          setHoveredDomain(domain.id);
          found = true;
          break;
        }
      }
      if (!found) setHoveredDomain(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [domains, hoveredDomain]);

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

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap justify-center gap-1.5 pointer-events-none">
        {domains.map(domain => (
          <motion.div
            key={domain.id}
            className="pointer-events-auto glass-card px-2 py-1 rounded-full text-[9px] font-display tracking-wider uppercase flex items-center gap-1"
            style={{ borderColor: domain.color, color: domain.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {domain.icon}
            {domain.label}
          </motion.div>
        ))}
      </div>

      {hoveredDomain && (
        <motion.div
          className="absolute top-3 left-3 pointer-events-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="glass-card px-3 py-2 rounded-xl text-sm text-foreground max-w-xs">
            <p className="font-display tracking-wider capitalize">{hoveredDomain}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Level: {Math.round(domains.find(d => d.id === hoveredDomain)?.level * 100 || 0)}%
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}