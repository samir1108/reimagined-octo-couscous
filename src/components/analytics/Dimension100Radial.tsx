import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { DIMENSIONS_100, type SubDimension } from "@/lib/consciousness/taxonomy/dimensions100";

/**
 * 100-DIMENSION RADIAL MAP (Batch 13)
 * Renders all 96 sub-dimensions as a radial wheel grouped by parent.
 */

const PARENTS = ["thought", "emotion", "body", "action", "connection", "spirit"] as const;
const PARENT_COLORS: Record<string, string> = {
  thought: "hsl(var(--primary))",
  emotion: "hsl(var(--primary) / 0.85)",
  body: "hsl(var(--primary) / 0.7)",
  action: "hsl(var(--primary) / 0.6)",
  connection: "hsl(var(--primary) / 0.5)",
  spirit: "hsl(var(--primary) / 0.4)",
};

export default function Dimension100Radial() {
  const [selected, setSelected] = useState<SubDimension | null>(null);
  const total = DIMENSIONS_100.length;

  const points = useMemo(() => {
    return DIMENSIONS_100.map((d, i) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const r = 42;
      return {
        d,
        x: 50 + Math.cos(angle) * r,
        y: 50 + Math.sin(angle) * r,
        angle,
      };
    });
  }, [total]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-display font-semibold text-foreground mb-1">100-Dimension Map</h3>
        <p className="text-xs text-muted-foreground font-body">
          Every facet of you. Tap a dot to learn its name.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <svg viewBox="0 0 100 100" className="w-full max-w-md mx-auto">
          {/* Center label */}
          <text x="50" y="51" textAnchor="middle" className="fill-muted-foreground" fontSize="3.2">
            You
          </text>

          {points.map(({ d, x, y }) => (
            <motion.circle
              key={d.id}
              cx={x}
              cy={y}
              r={Math.max(0, selected?.id === d.id ? 1.6 : 0.9)}
              fill={PARENT_COLORS[d.parent]}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + Math.random() * 0.4 }}
              onClick={() => setSelected(d)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </svg>

        {selected ? (
          <div className="mt-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">
              {selected.parent}
            </p>
            <p className="text-sm font-display text-foreground">{selected.label}</p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/60 font-body text-center mt-3">
            {total} dimensions across {PARENTS.length} primary fields
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {PARENTS.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-[10px] text-muted-foreground capitalize">
              <span className="w-2 h-2 rounded-full" style={{ background: PARENT_COLORS[p] }} />
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
