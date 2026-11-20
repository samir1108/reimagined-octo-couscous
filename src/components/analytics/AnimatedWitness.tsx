import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Expand, Minimize, Eye, Sparkles, Zap } from "lucide-react";

interface WitnessParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  angle: number;
  speed: number;
}

export default function AnimatedWitness() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [particles] = useState<WitnessParticle[]>(() => {
    const p: WitnessParticle[] = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 150;
      p.push({
        x: 300 + Math.cos(angle) * radius,
        y: 250 + Math.sin(angle) * radius,
        baseX: 300 + Math.cos(angle) * radius,
        baseY: 250 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
        color: `hsl(${260 + Math.random() * 40}, 70%, ${50 + Math.random() * 30}%)`,
        angle,
        speed: 0.0005 + Math.random() * 0.001,
      });
    }
    return p;
  });
  const [centerPulse, setCenterPulse] = useState(1);

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
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      const pulse = Math.sin(time * 1.5) * 0.15 + 1;
      setCenterPulse(pulse);

      const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80 * pulse);
      centerGrad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
      centerGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.1)");
      centerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80 * pulse, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        const ringPulse = Math.sin(time * 0.8 + i * 2) * 0.1 + 1;
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 / (i + 1)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = -time * 20 * (i + 1);
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60 * ringPulse + i * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      particles.forEach(p => {
        p.angle += p.speed;
        const radius = Math.sqrt((p.baseX - centerX) ** 2 + (p.baseY - centerY) ** 2);
        const targetX = centerX + Math.cos(p.angle) * radius;
        const targetY = centerY + Math.sin(p.angle) * radius;
        
        p.vx += (targetX - p.x) * 0.01;
        p.vy += (targetY - p.y) * 0.01;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        const distToCenter = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
        const proximity = Math.max(0, 1 - distToCenter / 250);
        
        const displaySize = p.size * (1 + proximity * 0.5);
        const displayOpacity = p.opacity * (0.5 + proximity * 0.5);

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

      const witnessText = "THE WITNESS";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 24px system-ui";
      ctx.textAlign = "center";
      ctx.letterSpacing = "0.3em";
      ctx.fillText(witnessText, centerX, centerY + 8);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [particles]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full ${isExpanded ? "h-[45vh]" : "h-[30vh]"} rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30 overflow-hidden glass-card`}
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
        <motion.div className="glass-card px-3 py-1 rounded-full text-[10px] font-display tracking-wider uppercase text-muted-foreground flex items-center gap-1.5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Eye className="w-3 h-3" />
          Observing
        </motion.div>
        <motion.div className="glass-card px-3 py-1 rounded-full text-[10px] font-display tracking-wider uppercase text-muted-foreground flex items-center gap-1.5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Sparkles className="w-3 h-3" />
          Noticing
        </motion.div>
      </div>
    </motion.div>
  );
}