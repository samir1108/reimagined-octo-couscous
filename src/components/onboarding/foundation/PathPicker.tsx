import { motion } from "framer-motion";
import { ChevronRight, Lock, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { SECONDARY_PATHS, PATH_BY_ID } from "@/lib/onboarding/pathDefinitions";
import type { PathId } from "@/lib/onboarding/foundationQuestions";

interface Props {
  suggested: PathId[]; // top 2–3 from analysis
  onComplete: (paths: { core: "observation"; secondary: PathId[] }) => void;
}

export default function FoundationPathPicker({ suggested, onComplete }: Props) {
  const initial = useMemo(() => suggested.slice(0, 2), [suggested]);
  const [picked, setPicked] = useState<PathId[]>(initial);

  const toggle = (id: PathId) => {
    setPicked((curr) => {
      if (curr.includes(id)) return curr.filter((p) => p !== id);
      if (curr.length >= 3) return curr;
      return [...curr, id];
    });
  };

  const canSubmit = picked.length >= 2 && picked.length <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[100dvh] bg-background px-5 py-8 flex flex-col"
    >
      <div className="w-full max-w-md mx-auto flex-1">
        <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 text-center mb-2">
          Your road ahead
        </p>
        <h1 className="font-display text-2xl text-foreground text-center leading-snug mb-2">
          Choose your companions.
        </h1>
        <p className="text-[12.5px] text-muted-foreground text-center mb-7 leading-relaxed">
          Observation is the ground — every road starts there. Pick 2–3 paths that feel most alive to you right now. You can always add more later.
        </p>

        {/* Core: Observation (locked) */}
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent px-4 py-4 mb-6 relative overflow-hidden">
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[9.5px] uppercase tracking-[0.22em] text-primary/80">
            <Lock className="h-3 w-3" /> Core
          </div>
          <p className="font-display text-lg text-primary mb-0.5">Observation · Sakshi Bhav</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Watching what is, without grabbing or pushing. Every road we walk together starts from this seat.
          </p>
        </div>

        {/* Secondaries */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
            Pick 2–3 secondary paths
          </p>
          <span className="text-[11px] text-muted-foreground tabular-nums">{picked.length} of 3</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {SECONDARY_PATHS.map((p) => {
            const active = picked.includes(p.id);
            const isSuggested = suggested.includes(p.id);
            const disabled = !active && picked.length >= 3;
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                disabled={disabled}
                className={`relative text-left p-3.5 rounded-2xl border transition-all ${
                  active
                    ? "bg-primary/15 border-primary/60 shadow-[0_0_24px_-10px_hsl(var(--primary)/0.7)]"
                    : "bg-card/40 border-border/30 hover:border-border/60"
                } ${disabled ? "opacity-30 pointer-events-none" : ""}`}
              >
                {isSuggested && !active && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[8.5px] uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" /> suggested
                  </span>
                )}
                <div className="text-2xl mb-1.5 leading-none">{p.glyph}</div>
                <p className={`font-display text-[14px] ${active ? "text-primary" : "text-foreground"}`}>
                  {p.name}
                </p>
                <p className="text-[10.5px] text-muted-foreground/70 mt-0.5">{p.sanskrit}</p>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{p.blurb}</p>
              </button>
            );
          })}
        </div>

        {picked.length > 0 && (
          <p className="text-[11.5px] text-muted-foreground/80 text-center mt-5 leading-relaxed">
            Walking with{" "}
            <span className="text-foreground/90">
              {picked.map((id) => PATH_BY_ID[id].name).join(" · ")}
            </span>
          </p>
        )}
      </div>

      <div className="w-full max-w-md mx-auto pt-6 pb-2 flex flex-col items-center gap-2">
        <button
          onClick={() => canSubmit && onComplete({ core: "observation", secondary: picked })}
          disabled={!canSubmit}
          className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
        >
          Walk this road
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="text-[11px] text-muted-foreground/80 max-w-[280px] text-center leading-relaxed">
          This is your starting point — not a cage. Your path will evolve as you do.
        </p>
      </div>
    </motion.div>
  );
}
