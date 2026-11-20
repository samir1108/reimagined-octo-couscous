import { motion } from "framer-motion";

export type Intensity = "gentle" | "standard" | "deep";

interface Props {
  disabled?: boolean;
  onPick: (intensity: Intensity) => void;
}

const OPTIONS: { id: Intensity; label: string; sub: string }[] = [
  { id: "gentle", label: "Gentle", sub: "soft & easy" },
  { id: "standard", label: "Standard", sub: "balanced" },
  { id: "deep", label: "Deep", sub: "go further" },
];

export default function IntensityPick({ disabled, onPick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mt-3 flex flex-wrap gap-2 max-w-[85%]"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => onPick(o.id)}
          disabled={disabled}
          className="flex flex-col items-start gap-0.5 px-4 py-2 rounded-2xl bg-card/50 border border-border/50 hover:bg-primary/15 hover:border-primary/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-foreground/90 text-sm font-display">{o.label}</span>
          <span className="text-muted-foreground/70 text-[10px] uppercase tracking-[0.18em]">
            {o.sub}
          </span>
        </button>
      ))}
    </motion.div>
  );
}
