/**
 * YourPath — the wider world, kept quiet.
 *
 * The deeper surfaces of the app (loops, domains, witness, yogas, journeys,
 * masters, library, temple) remain exactly where they live today; Home only
 * offers a compact set of doors into them. Every entry is a real route.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const PATHWAYS: Array<{ label: string; to: string }> = [
  { label: "Loops & patterns", to: "/app/analytics?tab=loops" },
  { label: "Practice matrix", to: "/app/practice" },
  { label: "Life domains", to: "/app/analytics?tab=domains" },
  { label: "Witness depth", to: "/app/analytics?tab=witness" },
  { label: "Insights", to: "/app/analytics?tab=insights" },
  { label: "Constellation", to: "/app/constellation" },
  { label: "Journeys", to: "/app/journeys" },
  { label: "Spiral", to: "/app/spiral" },
  { label: "Masters", to: "/app/masters" },
  { label: "Library", to: "/app/library" },
];

export default function YourPath() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
      aria-label="Your path"
      className="w-full"
    >
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => navigate("/app/analytics?tab=humanmap")}
          className="group inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/40 px-5 py-2 text-[10px] font-display tracking-[0.24em] uppercase text-muted-foreground/60 hover:text-primary/85 hover:bg-muted/40 transition-colors"
        >
          <Compass className="h-3 w-3" aria-hidden />
          Explore your map
          <ArrowRight
            className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      </div>

      <nav className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-x-6 gap-y-2" aria-label="Deeper practices">
        {PATHWAYS.map((p) => (
          <button
            key={p.to}
            type="button"
            onClick={() => navigate(p.to)}
            className="text-left text-[11px] text-muted-foreground/45 transition-colors hover:text-foreground/80"
          >
            {p.label}
          </button>
        ))}
      </nav>
    </motion.section>
  );
}
