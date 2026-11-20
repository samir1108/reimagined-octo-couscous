/**
 * PathMatrixGrid — Visible mastery. The 9-skill consciousness matrix as a tappable grid.
 * Each cell = one practice with its current level + max. Tap → opens detail sheet.
 */
import { motion } from "framer-motion";
import { CORE_PRACTICES, PATH_PRACTICES, SPECIALTY_PRACTICES, getMaxLevel, type PracticeId } from "@/types/practices";

interface Props {
  levels: Partial<Record<string, number>>; // { observation: 2, breath: 1, ... }
  recommendedId?: string | null;
  onSelect: (id: PracticeId) => void;
}

// snake_case (DB) → kebab/canonical PracticeId
const idMap: Record<string, PracticeId> = {
  observation: "observation",
  self_inquiry: "self-inquiry",
  breath: "breath",
  witnessing: "witnessing",
  body: "body",
  bhakti: "bhakti",
  karma: "karma",
  jnana: "jnana",
  raja: "raja",
  kriya: "kriya",
  tantra: "tantra",
  neuroscience: "neuroscience",
  emotional_healing: "emotional-healing",
  loop_dissolution: "loop-dissolution",
  relationship: "relationship",
  work_career: "work-career",
  finance: "finance",
  health: "health",
};

function getLevel(levels: Props["levels"], dbKey: string): number {
  return Number(levels?.[dbKey] ?? 0);
}

export default function PathMatrixGrid({ levels, recommendedId, onSelect }: Props) {
  const cells = [
    ...CORE_PRACTICES.map((p) => ({ practice: p, dbKey: p.id.replace("-", "_") })),
    ...PATH_PRACTICES.map((p) => ({ practice: p, dbKey: p.id })),
    ...SPECIALTY_PRACTICES.map((p) => ({ practice: p, dbKey: p.id.replace("-", "_") })),
  ];

  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display tracking-[0.32em] uppercase text-muted-foreground">
            My Path
          </span>
        </div>
        <span className="text-[10px] font-body text-muted-foreground/60">
          5 core · 4 paths · 9 specialty
        </span>
      </header>
      <p className="text-[11px] text-muted-foreground/70 px-1 -mt-1">
        Tap any practice to see details and begin. Each level deepens the skill.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {cells.map(({ practice, dbKey }, i) => {
          const lvl = getLevel(levels, dbKey);
          const max = getMaxLevel(practice.id);
          const isRec = recommendedId === practice.id || recommendedId === dbKey;
          const isPath = practice.layer === "path";

          return (
            <motion.button
              key={practice.id}
              onClick={() => onSelect(practice.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.35 }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              className={[
                "group relative aspect-square rounded-2xl p-3 text-left flex flex-col",
                "border transition-all duration-300",
                isRec
                  ? "border-primary/50 bg-gradient-to-br from-primary/15 to-accent/10 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.5)]"
                  : "border-border/30 bg-card/40 hover:border-primary/30 hover:bg-card/60",
              ].join(" ")}
            >
              {isRec && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              <div className="text-2xl leading-none">{practice.icon}</div>
              <div className="mt-auto pt-3">
                <div className="text-[10px] font-display uppercase tracking-[0.1em] text-muted-foreground/80 leading-tight truncate">
                  {practice.label.split(" ")[0]}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: max }).map((_, idx) => (
                    <span
                      key={idx}
                      className={[
                        "h-0.5 flex-1 rounded-full transition-colors",
                        idx < lvl
                          ? isPath
                            ? "bg-accent"
                            : "bg-primary"
                          : "bg-border/40",
                      ].join(" ")}
                    />
                  ))}
                </div>
                <div className="mt-1 text-[9px] font-display tracking-[0.15em] text-foreground/70">
                  L{lvl}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
