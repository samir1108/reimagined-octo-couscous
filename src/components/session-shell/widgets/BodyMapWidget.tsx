import { useState } from "react";
import { Button } from "@/design-system";

const REGIONS = [
  { id: "head", label: "Head", x: 50, y: 8 },
  { id: "neck", label: "Neck", x: 50, y: 16 },
  { id: "shoulders", label: "Shoulders", x: 50, y: 22 },
  { id: "chest", label: "Chest", x: 50, y: 32 },
  { id: "abdomen", label: "Abdomen", x: 50, y: 44 },
  { id: "lowerBack", label: "Lower Back", x: 50, y: 52 },
  { id: "hips", label: "Hips", x: 50, y: 60 },
  { id: "thighs", label: "Thighs", x: 50, y: 72 },
  { id: "knees", label: "Knees", x: 50, y: 80 },
  { id: "calves", label: "Calves", x: 50, y: 88 },
  { id: "feet", label: "Feet", x: 50, y: 96 },
];

interface BodyMapWidgetProps {
  regions?: string[];
  selectedRegion?: string | null;
  onSelectRegion?: (region: string) => void;
  highlightedRegions?: string[];
  showLabels?: boolean;
  interactive?: boolean;
  onComplete?: (payload: { selectedRegion: string | null; regions: string[] }) => void;
}

export function BodyMapWidget({
  regions = REGIONS.map((r) => r.id),
  selectedRegion: controlledSelected,
  onSelectRegion,
  highlightedRegions = [],
  showLabels = true,
  interactive = true,
  onComplete,
}: BodyMapWidgetProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  function handleSelect(id: string) {
    if (!interactive) return;
    if (onSelectRegion) onSelectRegion(id);
    else setInternalSelected(id);
  }

  const visibleRegions = REGIONS.filter((r) => regions.includes(r.id));

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative mx-auto h-64 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {visibleRegions.map((r) => {
            const isSelected = selected === r.id;
            const isHighlighted = highlightedRegions.includes(r.id);
            return (
              <g key={r.id} onClick={() => handleSelect(r.id)} className={interactive ? "cursor-pointer" : ""}>
                <circle
                  cx={r.x}
                  cy={r.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? "hsl(var(--primary))" : isHighlighted ? "hsl(var(--primary) / 0.4)" : "hsl(var(--muted-foreground) / 0.3)"}
                  stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all duration-300"
                />
                {showLabels && (
                  <text
                    x={r.x + 10}
                    y={r.y + 1}
                    className="fill-muted-foreground text-[6px] font-medium"
                    dominantBaseline="middle"
                  >
                    {r.label}
                  </text>
                )}
              </g>
            );
          })}
          {/* Body outline */}
          <path
            d="M50,4 C40,4 34,10 34,18 L34,24 C30,26 26,30 26,36 L26,50 C26,56 30,60 34,62 L34,70 C34,78 38,86 50,86 C62,86 66,78 66,70 L66,62 C70,60 74,56 74,50 L74,36 C74,30 70,26 66,24 L66,18 C66,10 60,4 50,4 Z"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </svg>
      </div>

      {selected && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{REGIONS.find((r) => r.id === selected)?.label}</span>
        </p>
      )}

      {onComplete && (
        <Button
          onClick={() => onComplete({ selectedRegion: selected, regions: visibleRegions.map((r) => r.id) })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
