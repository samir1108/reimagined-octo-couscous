import { Reveal } from "@/components/animation/Reveal";
import { AnimatedPath } from "@/components/animation/AnimatedPath";

interface JourneySpiralProps {
  progress: number;
  label: string;
  size?: number;
}

const CENTER = 64;

function makeSpiralPath() {
  const turns = 4;
  const steps = 180;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const angle = -Math.PI / 2 + t * turns * Math.PI * 2;
    const radius = 5 + t * 51;
    const x = CENTER + Math.cos(angle) * radius;
    const y = CENTER + Math.sin(angle) * radius;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

const SPIRAL_PATH = makeSpiralPath();

function pointAtProgress(progress: number) {
  const angle = -Math.PI / 2 + progress * 4 * Math.PI * 2;
  const radius = 5 + progress * 51;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

export default function JourneySpiral({ progress, label, size = 88 }: JourneySpiralProps) {
  const value = Math.max(0, Math.min(1, progress));
  const marker = pointAtProgress(value);

  return (
    <Reveal className="shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        role="img"
        aria-label={label}
        className="overflow-visible"
      >
        <path
          d={SPIRAL_PATH}
          fill="none"
          stroke="hsl(var(--primary) / 0.16)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <AnimatedPath
          d={SPIRAL_PATH}
          progress={value}
          duration={1.2}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {[0.25, 0.5, 0.75, 1].map((milestone) => {
          const point = pointAtProgress(milestone);
          const reached = milestone <= value;
          return (
            <circle
              key={milestone}
              cx={point.x}
              cy={point.y}
              r={reached ? 2.8 : 2}
              fill={reached ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.45)"}
            />
          );
        })}
        <circle cx={marker.x} cy={marker.y} r="4" fill="hsl(var(--foreground))" stroke="hsl(var(--primary))" strokeWidth="2" />
      </svg>
    </Reveal>
  );
}
