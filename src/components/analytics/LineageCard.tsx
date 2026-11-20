/**
 * LineageCard — shows the user's derived 3-master spiritual lineage.
 * Pure frontend; reads from useAnalyticsData engine output.
 */
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { deriveLineage } from "@/data/lineageMap";

interface Props {
  dimensionBands?: Record<string, number>;
  overallBand?: number;
}

export default function LineageCard({ dimensionBands, overallBand = 0 }: Props) {
  const { masters, rootDimension } = deriveLineage(dimensionBands, overallBand);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.08 }}
      className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-primary/5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/80">
          Your Lineage · rooted in {rootDimension}
        </span>
      </div>
      <p className="text-sm font-display text-foreground/90 leading-relaxed">
        You walk the path of{" "}
        {masters.map((m, i) => (
          <span key={m.name}>
            <span className="font-semibold text-foreground">{m.name}</span>
            {i < masters.length - 1 ? <span className="text-muted-foreground"> → </span> : null}
          </span>
        ))}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {masters.map((m) => (
          <span
            key={m.name}
            className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 border border-border/40 text-muted-foreground"
          >
            {m.tradition} · {m.era}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
