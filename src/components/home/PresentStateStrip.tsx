import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Props {
  profile?: {
    overall_band?: number | string | null;
    v_level?: number | string | null;
    mind_state?: string | null;
    attention?: string | null;
    energy?: number | string | null;
  } | null;
  engineData?: {
    plan?: { vLevel?: number | string | null } | null;
    profile?: { mind_state?: string | null } | null;
    energy?: number | string | null;
  } | null;
  loops?: string[];
}

export default function PresentStateStrip({ profile, engineData, loops = [] }: Props) {
  const navigate = useNavigate();
  const candidates = [
    { label: "Overall band", value: profile?.overall_band },
    { label: "Journey level", value: engineData?.plan?.vLevel ?? profile?.v_level },
    { label: "Mind state", value: profile?.mind_state ?? engineData?.profile?.mind_state },
    { label: "Energy", value: profile?.energy ?? engineData?.energy },
    { label: "Attention", value: profile?.attention },
    { label: "Active loop", value: loops[0] },
  ];
  const items = candidates.flatMap(({ label, value }) => {
    if (value === null || value === undefined || String(value).trim() === "") return [];
    return [{
      label,
      value: label === "Overall band" && typeof value === "number" ? value.toFixed(1) : String(value),
    }];
  });

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border/40 bg-card/45 p-4 shadow-sm shadow-black/10 backdrop-blur-sm sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-display font-medium tracking-[0.14em] uppercase text-muted-foreground/75">
          Your present state
        </h2>
        <button
          type="button"
          onClick={() => navigate("/app/analytics?tab=overview")}
          className="min-h-9 rounded-full px-3 py-1 text-xs font-medium text-primary/85 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          Explore analytics <span aria-hidden>→</span>
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 rounded-xl border border-border/30 bg-background/45 px-3 py-2.5">
            <dt className="truncate text-[11px] font-medium text-muted-foreground/75">
              {item.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground/95">{item.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
