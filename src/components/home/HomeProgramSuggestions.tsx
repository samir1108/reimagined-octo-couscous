import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOWROOM_PROGRAMS } from "@/data/showroomPrograms";
import { scorePrograms, topForYou, type ScoredProgram } from "@/lib/programPersonalization";
import type { UserConsciousnessProfile } from "@/types/database";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

interface Props {
  userId: string | null | undefined;
  profile?: UserConsciousnessProfile | null;
  maxCards?: number;
}

export default function HomeProgramSuggestions({ userId, profile, maxCards = 3 }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const programs = useMemo<ScoredProgram[]>(() => {
    const assessData = (profile?.assessment_data ?? {}) as Record<string, unknown>;
    const analysis = (assessData.analysis ?? null) as Parameters<typeof scorePrograms>[1]["analysis"];
    const paths = (assessData.paths ?? null) as Parameters<typeof scorePrograms>[1]["paths"];
    const scored = scorePrograms(SHOWROOM_PROGRAMS, { analysis, paths });
    const top = topForYou(scored, maxCards);
    if (top.length > 0) return top;
    return SHOWROOM_PROGRAMS.slice(0, maxCards).map((p) => ({ program: p, score: 0, reason: "" }));
  }, [profile, maxCards]);

  if (!programs.length) return null;

  return (
    <motion.div
      className="w-full max-w-md mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <Sparkles className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/70">
          Programs for your first week
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition"
          aria-label="Dismiss programs"
          title="Hide programs"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <AnimatePresence>
        {!dismissed && (
          <motion.div
            key="programs-content"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="grid gap-2">
              {programs.map(({ program, reason }) => (
                <button
                  key={program.slug}
                  onClick={() => navigate(`/showroom/programs/${program.slug}`)}
                  className="w-full text-left rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/50 transition p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm">{program.theme}</span>
                        <span className="text-sm font-display font-medium text-foreground/90 truncate">
                          {program.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {program.subtitle}
                      </p>
                      {reason && (
                        <p className="text-[10px] text-primary/70 mt-1 leading-snug line-clamp-1">
                          {reason}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground/60 font-display tracking-wider uppercase">
                          {program.duration}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">·</span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {program.guru}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate("/app/library")}
              className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-2 font-display tracking-wider uppercase transition"
            >
              See all free programs →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
