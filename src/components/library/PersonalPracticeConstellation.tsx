import type { DimensionBands } from "@/hooks/useConsciousnessEngine";
import type { SensorialManifest } from "@/data/sensorialPractices/types";
import { DIMENSIONS } from "@/lib/library/practiceDimensions";
import { getPracticesForDimension } from "@/lib/library/personalizedPractices";

interface Props {
  bands: DimensionBands;
  manifests: SensorialManifest[];
  focusedDimension: string | null;
  onSelectDimension: (dimension: string) => void;
}

export function PersonalPracticeConstellation({
  bands,
  manifests,
  focusedDimension,
  onSelectDimension,
}: Props) {
  const weakest = DIMENSIONS.reduce((current, dimension) => {
    const cur = bands?.[current.key] ?? 0;
    const next = bands?.[dimension.key] ?? 0;
    return next < cur ? dimension : current;
  }, DIMENSIONS[0]);
  const center = 110;
  const radius = 68;

  return (
    <section className="glass-card rounded-2xl border border-primary/15 p-4" aria-labelledby="practice-constellation-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="practice-constellation-title" className="text-sm font-display font-semibold text-foreground">
            Your practice constellation
          </h2>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Your current dimension scores guide the starting point; choose a point to see matching practices.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[9px] text-primary">
          Focus · {weakest.label}
        </span>
      </div>

      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        <svg
          viewBox="0 0 220 220"
          className="h-48 w-48 shrink-0"
          role="img"
          aria-label={`Practice constellation based on dimension scores. Current lowest dimension: ${weakest.label}, ${(bands?.[weakest.key] ?? 0).toFixed(1)} out of 10.`}
        >
          {[0.33, 0.66, 1].map((scale) => (
            <circle
              key={scale}
              cx={center}
              cy={center}
              r={radius * scale}
              fill="none"
              stroke="hsl(var(--border) / 0.5)"
              strokeDasharray={scale === 1 ? "none" : "2 4"}
            />
          ))}
          {DIMENSIONS.map((dimension, index) => {
            const angle = (index / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
            const score = Math.max(0, Math.min(10, bands[dimension.key]));
            const pointRadius = radius * score / 10;
            const x = center + Math.cos(angle) * pointRadius;
            const y = center + Math.sin(angle) * pointRadius;
            const axisX = center + Math.cos(angle) * radius;
            const axisY = center + Math.sin(angle) * radius;
            const labelX = center + Math.cos(angle) * (radius + 23);
            const labelY = center + Math.sin(angle) * (radius + 23);
            const isFocused = focusedDimension === dimension.key;

            return (
              <g key={dimension.key}>
                <line
                  x1={center}
                  y1={center}
                  x2={axisX}
                  y2={axisY}
                  stroke="hsl(var(--border) / 0.45)"
                />
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={dimension.color}
                  strokeWidth="2"
                  opacity="0.65"
                />
                <circle cx={x} cy={y} r={isFocused ? 8 : 6} fill={dimension.color} stroke="hsl(var(--background))" strokeWidth="2">
                  <title>{`${dimension.label}: ${score.toFixed(1)} out of 10`}</title>
                </circle>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-muted-foreground"
                  fontSize="8"
                >
                  {dimension.label}
                </text>
              </g>
            );
          })}
          <circle cx={center} cy={center} r="17" fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary) / 0.45)" />
          <text x={center} y={center + 3} textAnchor="middle" className="fill-foreground" fontSize="8" fontWeight="600">
            YOU
          </text>
        </svg>

        <div className="grid w-full grid-cols-2 gap-2">
          {DIMENSIONS.map((dimension) => {
            const matches = getPracticesForDimension(dimension.key, manifests);
            const isFocused = focusedDimension === dimension.key;
            return (
              <button
                key={dimension.key}
                type="button"
                aria-pressed={isFocused}
                onClick={() => onSelectDimension(dimension.key)}
                className={`rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  isFocused ? "border-primary/45 bg-primary/10" : "border-border/35 bg-background/25 hover:border-primary/25"
                }`}
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-medium text-foreground">{dimension.label}</span>
                  <span className="text-[9px] tabular-nums text-muted-foreground">{(bands?.[dimension.key] ?? 0).toFixed(1)}</span>
                </span>
                <span className="mt-1 block text-[9px] text-muted-foreground">
                  {matches.length} matching guided {matches.length === 1 ? "practice" : "practices"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
