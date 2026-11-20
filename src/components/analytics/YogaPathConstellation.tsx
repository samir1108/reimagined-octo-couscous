import { AnimatedPath } from "@/components/animation/AnimatedPath";
import { Reveal } from "@/components/animation/Reveal";

const PATHS = [
  { key: "jnana", label: "Jñāna", color: "hsl(210 80% 60%)", angle: -90 },
  { key: "bhakti", label: "Bhakti", color: "hsl(330 70% 60%)", angle: 0 },
  { key: "karma", label: "Karma", color: "hsl(150 60% 50%)", angle: 90 },
  { key: "raja", label: "Rāja", color: "hsl(270 70% 60%)", angle: 180 },
] as const;

interface Props {
  affinity: Record<string, number>;
  dominantPath?: string | null;
}

export function YogaPathConstellation({ affinity, dominantPath }: Props) {
  const rawValues = PATHS.map(({ key }) => Number(affinity[key]));
  const hasRecordedValues = rawValues.some(Number.isFinite);
  if (!hasRecordedValues) return null;

  const scale = Math.max(...rawValues.filter(Number.isFinite)) <= 1 ? 1 : 10;
  const values = PATHS.map((path, index) => {
    const raw = rawValues[index];
    return Number.isFinite(raw) ? Math.max(0, Math.min(1, raw / scale)) : 0;
  });
  const cx = 120;
  const cy = 120;
  const radius = 72;
  const points = PATHS.map((path, index) => {
    const angle = path.angle * Math.PI / 180;
    const distance = radius * values[index];
    return {
      x: cx + Math.cos(angle) * distance,
      y: cy + Math.sin(angle) * distance,
    };
  });
  const polygon = points.map(({ x, y }, index) =>
    `${index === 0 ? "M" : "L"} ${x} ${y}`,
  ).join(" ") + " Z";

  return (
    <Reveal>
      <section className="glass-card rounded-2xl p-4" aria-labelledby="yoga-path-constellation-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="yoga-path-constellation-title" className="text-sm font-display font-semibold text-foreground">
              Your four-path balance
            </h3>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Built from your recorded yoga-path affinities.
            </p>
          </div>
          {dominantPath && (
            <span className="shrink-0 rounded-full border border-primary/20 px-2.5 py-1 text-[9px] capitalize text-primary">
              Leading · {dominantPath}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-center">
          <svg
            viewBox="0 0 240 240"
            className="h-56 w-56 max-w-full"
            role="img"
            aria-label={`Four-path affinity. ${PATHS.map((path, index) => `${path.label} ${Math.round(values[index] * 100)} percent`).join(", ")}.`}
          >
            {[0.33, 0.66, 1].map((factor) => (
              <circle
                key={factor}
                cx={cx}
                cy={cy}
                r={radius * factor}
                fill="none"
                stroke="hsl(var(--border) / 0.5)"
                strokeDasharray={factor === 1 ? "none" : "2 4"}
              />
            ))}
            {PATHS.map((path) => {
              const angle = path.angle * Math.PI / 180;
              return (
                <line
                  key={path.key}
                  x1={cx}
                  y1={cy}
                  x2={cx + Math.cos(angle) * radius}
                  y2={cy + Math.sin(angle) * radius}
                  stroke="hsl(var(--border) / 0.4)"
                />
              );
            })}
            <AnimatedPath
              d={polygon}
              fill="hsl(var(--primary) / 0.15)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              duration={0.9}
            />
            {points.map((point, index) => (
              <circle
                key={PATHS[index].key}
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill={PATHS[index].color}
                stroke="hsl(var(--background))"
                strokeWidth="1.5"
              >
                <title>{`${PATHS[index].label}: ${Math.round(values[index] * 100)}% affinity`}</title>
              </circle>
            ))}
            {PATHS.map((path) => {
              const angle = path.angle * Math.PI / 180;
              const x = cx + Math.cos(angle) * (radius + 18);
              const y = cy + Math.sin(angle) * (radius + 18);
              return (
                <text
                  key={path.key}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={path.color}
                  fontSize="9"
                >
                  {path.label}
                </text>
              );
            })}
            <circle cx={cx} cy={cy} r="3" fill="hsl(var(--foreground))" />
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PATHS.map((path, index) => (
            <div key={path.key} className="flex items-center justify-between rounded-lg bg-background/25 px-2.5 py-1.5">
              <span className="text-[10px] text-muted-foreground">{path.label}</span>
              <span className="text-[10px] tabular-nums text-foreground">{Math.round(values[index] * 100)}%</span>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
