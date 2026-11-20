import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Expand, Minimize, Layers, Sparkles, Zap, RotateCcw } from "lucide-react";

interface IntegrationLayer {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  segments: number;
}

const LAYERS: IntegrationLayer[] = [
  { id: "body", x: 300, y: 250, radius: 40, color: "#10B981", label: "Body", rotation: 0, rotationSpeed: 0.2, opacity: 0.8, segments: 8 },
  { id: "emotion", x: 300, y: 250, radius: 80, color: "#EC4899", label: "Emotion", rotation: Math.PI / 4, rotationSpeed: -0.15, opacity: 0.6, segments: 12 },
  { id: "mind", x: 300, y: 250, radius: 120, color: "#3B82F6", label: "Mind", rotation: Math.PI / 2, rotationSpeed: 0.1, opacity: 0.5, segments: 16 },
  { id: "awareness", x: 300, y: 250, radius: 160, color: "#8B5CF6", label: "Awareness", rotation: Math.PI * 3 / 4, rotationSpeed: -0.05, opacity: 0.4, segments: 24 },
];

interface IntegrationParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  layer: string;
}

export default function AnimatedIntegration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [layers] = useState<IntegrationLayer[]>(LAYERS);
  const [particles, setParticles] = useState<IntegrationParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const particleId = 0;

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

    const spawnParticle = (layer: IntegrationLayer) => {
      if (Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const radius = layer.radius * (0.7 + Math.random() * 0.3);
        setParticles(prev => [...prev.slice(-100), {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 2 + Math.random() * 3,
          color: layer.color,
          life: 1,
          maxLife: 60 + Math.random() * 60,
          layer: layer.id,
        }]);
      }
    };

    const draw = () => {
      if (!ctx || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      layers.forEach(layer => {
        layer.rotation += layer.rotationSpeed * 0.01;
        spawnParticle(layer);

        const pulse = Math.sin(time * 1.5 + layer.rotation) * 0.05 + 1;
        const displayRadius = layer.radius * pulse;
        const isHovered = hoveredLayer === layer.id;

        for (let ring = 0; ring < 2; ring++) {
          const ringRadius = displayRadius * (0.9 + ring * 0.15);
          ctx.strokeStyle = layer.color + Math.floor(layer.opacity * 100 * (isHovered ? 1.5 : 1)).toString(16).padStart(2, '0');
          ctx.lineWidth = isHovered ? 2 : 1;
          ctx.setLineDash([10 + ring * 5, 8]);
          ctx.lineDashOffset = -time * 20 * (ring + 1) * (layer.rotationSpeed > 0 ? 1 : -1);
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        const segmentAngle = (Math.PI * 2) / layer.segments;
        for (let i = 0; i < layer.segments; i++) {
          const angle = layer.rotation + i * segmentAngle;
          const innerR = displayRadius - 15;
          const outerR = displayRadius + 5;
          
          ctx.fillStyle = layer.color + Math.floor(0.15 * 100).toString(16).padStart(2, '0');
          ctx.globalAlpha = isHovered ? 0.8 : 0.5;
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
          ctx.lineTo(centerX + Math.cos(angle + segmentAngle * 0.6) * outerR, centerY + Math.sin(angle + segmentAngle * 0.6) * outerR);
          ctx.lineTo(centerX + Math.cos(angle + segmentAngle) * innerR, centerY + Math.sin(angle + segmentAngle) * innerR);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });

      particles.forEach((p, idx) => {
        const layer = layers.find(l => l.id === p.layer);
        if (!layer) return;

        const angle = Math.atan2(p.y - centerY, p.x - centerX);
        const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
        const targetDist = layer.radius;
        
        const force = (targetDist - dist) * 0.002;
        p.vx += Math.cos(angle) * force + (Math.random() - 0.5) * 0.1;
        p.vy += Math.sin(angle) * force + (Math.random() - 0.5) * 0.1;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        
        p.life--;
        
        const lifeRatio = p.life / p.maxLife;
        const displaySize = p.size * lifeRatio;
        const displayOpacity = lifeRatio * 0.6;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, displaySize * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, "transparent");
        
        ctx.fillStyle = grad;
        ctx.globalAlpha = displayOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, displaySize, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      
      setParticles(prev => prev.filter(p => p.life > 0));

      const centerPulse = Math.sin(time * 2) * 0.2 + 1;
      const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25 * centerPulse);
      centerGrad.addColorStop(0, "#8B5CF6");
      centerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = centerGrad;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25 * centerPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = false;
      for (const layer of layers) {
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > layer.radius - 20 && dist < layer.radius + 20) {
          setHoveredLayer(layer.id);
          found = true;
          break;
        }
      }
      if (!found) setHoveredLayer(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [layers, particles, hoveredLayer]);

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
        {layers.map(layer => (
          <motion.div
            key={layer.id}
            className="pointer-events-auto glass-card px-3 py-1 rounded-full text-[10px] font-display tracking-wider uppercase flex items-center gap-1.5"
            style={{ borderColor: layer.color, color: layer.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Layers className="w-3 h-3" />
            {layer.label}
          </motion.div>
        ))}
      </div>

      {hoveredLayer && (
        <motion.div
          className="absolute top-3 left-3 pointer-events-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="glass-card px-3 py-2 rounded-xl text-sm text-foreground max-w-xs">
            <p className="font-display tracking-wider capitalize">{hoveredLayer} layer</p>
            <p className="text-xs text-muted-foreground mt-1">Integrating with higher levels</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}