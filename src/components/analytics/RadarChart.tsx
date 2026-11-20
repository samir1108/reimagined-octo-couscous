import { motion, useReducedMotion } from "framer-motion";
import { AnimatedPath } from "@/components/animation/AnimatedPath";

interface RadarPoint {
  label: string;
  value: number; // 0-10
  color: string;
}

export function RadarChart({ points, size = 200 }: { points: RadarPoint[]; size?: number }) {
  const reduceMotion = useReducedMotion();
  const center = size / 2;
  const maxR = size * 0.38;
  const n = points.length;
  const angleStep = (2 * Math.PI) / n;

  const getXY = (i: number, r: number) => ({
    x: center + r * Math.cos(i * angleStep - Math.PI / 2),
    y: center + r * Math.sin(i * angleStep - Math.PI / 2),
  });

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  // Data polygon
  const dataPoints = points.map((p, i) => getXY(i, (p.value / 10) * maxR));
  const pathD = dataPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Grid */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={Array.from({ length: n }, (_, i) => {
            const pt = getXY(i, r * maxR);
            return `${pt.x},${pt.y}`;
          }).join(' ')}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={0.4}
        />
      ))}

      {/* Axis lines */}
      {points.map((_, i) => {
        const pt = getXY(i, maxR);
        return (
          <line key={i} x1={center} y1={center} x2={pt.x} y2={pt.y}
            stroke="hsl(var(--border))" strokeWidth={0.5} opacity={0.3} />
        );
      })}

      {/* Data shape */}
      <AnimatedPath
        d={pathD}
        progress={1}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        duration={0.8}
      />

      {/* Data points */}
      {dataPoints.map((pt, i) => (
        <motion.circle
          key={i}
          cx={pt.x} cy={pt.y} r={4}
          fill={points[i].color}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          initial={reduceMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.3 + i * 0.1, duration: reduceMotion ? 0 : undefined }}
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => {
        const pt = getXY(i, maxR + 18);
        return (
          <text key={i} x={pt.x} y={pt.y}
            textAnchor="middle" dominantBaseline="central"
            className="fill-muted-foreground text-[10px] font-body"
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}
