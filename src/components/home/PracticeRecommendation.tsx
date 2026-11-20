import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, AlertTriangle, Sparkles, Target, Shuffle } from "lucide-react";
import { useGetNextPractice, type PracticeTask, type BypassingCheck, type CrossPollinationSuggestion } from "@/hooks/usePracticeMatrix";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const PRACTICE_LABELS: Record<string, { label: string; emoji: string }> = {
  observation: { label: "Observation", emoji: "👁️" },
  self_inquiry: { label: "Self-Inquiry", emoji: "🔍" },
  breath: { label: "Breath", emoji: "🌬️" },
  witnessing: { label: "Witnessing", emoji: "🪷" },
  body: { label: "Body Awareness", emoji: "🧘" },
  bhakti: { label: "Bhakti", emoji: "💛" },
  karma: { label: "Karma Yoga", emoji: "🤲" },
  jnana: { label: "Jnana", emoji: "📖" },
  raja: { label: "Raja Yoga", emoji: "👑" },
  kriya: { label: "Kriya", emoji: "⚡" },
  tantra: { label: "Tantra", emoji: "🔮" },
  neuroscience: { label: "Neuroscience", emoji: "🧠" },
};

const ALLOCATION_LABELS: Record<string, { label: string; color: string }> = {
  fixed: { label: "Core", color: "text-primary" },
  ai_personalized: { label: "AI Pick", color: "text-accent-foreground" },
  user_choice: { label: "Your Choice", color: "text-muted-foreground" },
};

interface PracticeRecommendationProps {
  timeSlot?: string;
}

export default function PracticeRecommendation({ timeSlot }: PracticeRecommendationProps) {
  const getNextPractice = useGetNextPractice();
  const [showDetails, setShowDetails] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    getNextPractice.mutate({ timeSlot }, {
      onSuccess: () => setLoaded(true),
    });
  };

  const result = getNextPractice.data;

  if (!loaded) {
    return (
      <motion.button
        onClick={handleLoad}
        disabled={getNextPractice.isPending}
        className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        {getNextPractice.isPending ? (
          <span className="text-sm text-muted-foreground font-display animate-pulse">Finding your practice...</span>
        ) : (
          <>
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-foreground">Get Today's Practice</span>
          </>
        )}
      </motion.button>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      className="glass-card rounded-2xl p-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
            Today's Practice · {result.formula}
          </span>
        </div>
        <button onClick={() => setShowDetails(!showDetails)} className="text-muted-foreground/40">
          <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Main tasks */}
      <div className="space-y-2">
        {result.tasks.map((task: PracticeTask, i: number) => {
          const p = PRACTICE_LABELS[task.practice] || { label: task.practice, emoji: "🧘" };
          const alloc = ALLOCATION_LABELS[task.allocation] || ALLOCATION_LABELS.fixed;
          return (
            <motion.div
              key={task.practice}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/15 border border-border/10"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <span className="text-lg">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-medium text-foreground">{p.label}</p>
                <p className="text-[10px] text-muted-foreground font-body">Level {task.level} · Score {task.score}</p>
              </div>
              <span className={`text-[9px] font-display ${alloc.color} bg-muted/20 px-2 py-0.5 rounded-full`}>
                {alloc.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Bypassing warning */}
      {result.bypassingCheck?.isBypassing && (
        <motion.div
          className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] font-display text-destructive font-semibold">Bypassing Detected</span>
          </div>
          {result.bypassingCheck.warnings.map((w: string, i: number) => (
            <p key={i} className="text-[11px] text-destructive/80 font-body">{w}</p>
          ))}
        </motion.div>
      )}

      {/* Cross-pollination suggestion */}
      {result.crossPollinationSuggestion && (
        <motion.div
          className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shuffle className="w-3.5 h-3.5 text-accent-foreground" />
            <span className="text-[10px] font-display text-accent-foreground font-semibold">Cross-Pollination</span>
          </div>
          <p className="text-[11px] text-foreground/80 font-body">{result.crossPollinationSuggestion.reason}</p>
        </motion.div>
      )}

      {/* Details */}
      <AnimatePresence>
        {showDetails && result.allScored && (
          <motion.div
            className="mt-3 pt-3 border-t border-border/10 space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wider mb-2">All scored practices</p>
            {result.allScored.map((s: PracticeTask) => (
              <div key={s.practice} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-body">{PRACTICE_LABELS[s.practice]?.label || s.practice}</span>
                <span className="text-foreground font-display">{s.score}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
