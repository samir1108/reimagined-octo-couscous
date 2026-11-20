import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Send, Sparkles } from "lucide-react";
import { useCuriosityEngine, useAnswerCuriosity, useSkipCuriosity } from "@/hooks/useCuriosityEngine";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function CuriosityCard() {
  const { data: curiosity } = useCuriosityEngine();
  const answerMutation = useAnswerCuriosity();
  const skipMutation = useSkipCuriosity();
  const [answer, setAnswer] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (!curiosity || dismissed) return null;
  if (curiosity.status === "cooling_down" || curiosity.status === "no_gaps") return null;
  if (!curiosity.activeQuestion) return null;

  const q = curiosity.activeQuestion;

  const handleAnswer = () => {
    if (!answer.trim()) return;
    answerMutation.mutate({ key: q.key, answer: answer.trim() });
    setAnswer("");
    setDismissed(true);
  };

  const handleSkip = () => {
    skipMutation.mutate();
    setDismissed(true);
  };

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 border-primary/15"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={spring}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
            Curious about you
          </span>
        </div>
        <button onClick={handleSkip} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm font-display text-foreground mb-2">{q.question}</p>
      
      {q.context && (
        <p className="text-xs text-muted-foreground font-body mb-3 italic">
          <Sparkles className="w-3 h-3 inline mr-1 text-primary/60" />
          {q.context}
        </p>
      )}

      {q.benefit && (
        <p className="text-[10px] text-primary/70 font-body mb-3">
          Why I'm asking: {q.benefit}
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
          placeholder="Your answer..."
          className="flex-1 bg-muted/30 rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/40 border border-border/20 focus:outline-none focus:border-primary/30"
        />
        <button
          onClick={handleAnswer}
          disabled={!answer.trim() || answerMutation.isPending}
          className="bg-primary/10 hover:bg-primary/20 text-primary rounded-xl px-3 py-2 transition-colors disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleSkip}
        className="mt-2 text-[10px] text-muted-foreground/50 hover:text-muted-foreground font-body transition-colors"
      >
        Skip — I'll answer another time
      </button>
    </motion.div>
  );
}
