import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Shuffle, Compass, Play, Loader2 } from "lucide-react";
import {
  useGetNextPractice,
  type PracticeTask,
} from "@/hooks/usePracticeMatrix";
import { useAwardKarma } from "@/hooks/useKarma";
import { useNavigate } from "react-router-dom";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const PRACTICE_META: Record<string, { label: string; emoji: string; route?: string }> = {
  observation: { label: "Observation", emoji: "👁️", route: "/app/practice" },
  self_inquiry: { label: "Self-Inquiry", emoji: "🔍", route: "/guide" },
  breath: { label: "Breath Awareness", emoji: "🌬️", route: "/app/practice" },
  witnessing: { label: "Witnessing", emoji: "🪷", route: "/app/practice" },
  body: { label: "Body Awareness", emoji: "🧘", route: "/app/practice" },
  bhakti: { label: "Bhakti Yoga", emoji: "💛", route: "/app/practice" },
  karma: { label: "Karma Yoga", emoji: "🤲", route: "/app/practice" },
  jnana: { label: "Jnana Yoga", emoji: "📖", route: "/guide" },
  raja: { label: "Raja Yoga", emoji: "👑", route: "/app/practice" },
  kriya: { label: "Kriya", emoji: "⚡", route: "/app/practice" },
  tantra: { label: "Tantra", emoji: "🔮", route: "/app/practice" },
  neuroscience: { label: "Neuroscience", emoji: "🧠", route: "/guide" },
};

export default function PathTab() {
  const navigate = useNavigate();
  const getNext = useGetNextPractice();
  const award = useAwardKarma();
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const autoLoadedRef = useRef(false);

  const handleLoad = () => {
    getNext.mutate(
      { timeSlot: undefined },
      { onSuccess: () => setLoaded(true) }
    );
  };

  // Auto-reveal on mount
  useEffect(() => {
    if (!autoLoadedRef.current) {
      autoLoadedRef.current = true;
      handleLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = getNext.data;
  const main = result?.tasks?.[0];
  const alternates = result?.tasks?.slice(1) || [];

  const handleBegin = (task: PracticeTask) => {
    const meta = PRACTICE_META[task.practice];
    award.mutate({
      source: "path_begin",
      weight: 1 + Math.min(0.5, (task.level || 0) * 0.1),
      metadata: { practice: task.practice, level: task.level, score: task.score },
      silent: false,
    });
    if (meta?.route) navigate(meta.route);
  };

  if (!loaded || !result || !main) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="glass-card rounded-2xl p-6 text-center">
          <Compass className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">
            Your Path Today
          </h3>
          <p className="text-sm font-body text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
            Reading your Spiritual DNA, active loops, and progression…
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/30 text-muted-foreground font-display font-medium text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Revealing your path…
          </div>
        </div>
      </motion.div>
    );
  }

  const mainMeta = PRACTICE_META[main.practice] || { label: main.practice, emoji: "🧘" };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      {/* Main */}
      <motion.div
        className="glass-card rounded-2xl p-5 !border-primary/20 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-display font-semibold tracking-wider uppercase">
              Main Practice
            </span>
            <span className="text-[10px] font-body text-muted-foreground">
              {result.formula}
            </span>
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{mainMeta.emoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-display font-bold text-foreground mb-1 tracking-tight">
                {mainMeta.label}
              </h3>
              <p className="text-xs font-body text-muted-foreground">
                Level {main.level} · Match score {main.score}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleBegin(main)}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-sunrise text-primary-foreground font-display font-medium text-sm shadow-md shadow-primary/15 hover:shadow-lg transition-all"
          >
            <Play className="w-4 h-4" />
            Begin · earn karma
          </button>
        </div>
      </motion.div>

      {/* Bypassing warning */}
      {result.bypassingCheck?.isBypassing && (
        <motion.div
          className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] font-display text-destructive font-semibold tracking-wider uppercase">
              Bypassing detected
            </span>
          </div>
          {result.bypassingCheck.warnings.map((w: string, i: number) => (
            <p key={i} className="text-[11px] text-destructive/80 font-body">{w}</p>
          ))}
        </motion.div>
      )}

      {/* Cross-pollination */}
      {result.crossPollinationSuggestion && (
        <motion.div
          className="p-3 rounded-xl bg-accent/10 border border-accent/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shuffle className="w-3.5 h-3.5 text-accent-foreground" />
            <span className="text-[10px] font-display text-accent-foreground font-semibold tracking-wider uppercase">
              Cross-pollination
            </span>
          </div>
          <p className="text-[11px] text-foreground/80 font-body">
            {result.crossPollinationSuggestion.reason}
          </p>
        </motion.div>
      )}

      {/* Alternatives */}
      {alternates.length > 0 && (
        <motion.div className="glass-card rounded-2xl p-4">
          <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-3">
            Or try one of these
          </p>
          <div className="space-y-2">
            {alternates.map((task, i) => {
              const meta = PRACTICE_META[task.practice] || { label: task.practice, emoji: "🧘" };
              return (
                <motion.button
                  key={task.practice}
                  onClick={() => handleBegin(task)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/15 border border-border/10 hover:border-primary/30 transition-colors text-left"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-medium text-foreground">
                      {meta.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      Level {task.level} · Score {task.score}
                    </p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Reasoning / scored details */}
      {result.allScored && result.allScored.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-xs font-display text-foreground">
              Why these picks?
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${showAll ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {showAll && (
              <motion.div
                className="mt-3 pt-3 border-t border-border/10 space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-[10px] text-muted-foreground/70 font-body mb-2 leading-relaxed">
                  Scored against your Spiritual DNA, current loops, recent practices, and progression band. Higher = better fit right now.
                </p>
                {result.allScored.slice(0, 8).map((s: PracticeTask) => (
                  <div key={s.practice} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-body">
                      {PRACTICE_META[s.practice]?.label || s.practice}
                    </span>
                    <span className="text-foreground font-display tabular-nums">{s.score}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={handleLoad}
        disabled={getNext.isPending}
        className="w-full text-xs font-body text-muted-foreground hover:text-foreground py-2 transition-colors"
      >
        {getNext.isPending ? "Re-reading your state…" : "Refresh path"}
      </button>
    </motion.div>
  );
}
