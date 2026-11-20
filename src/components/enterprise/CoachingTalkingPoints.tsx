import { motion } from "framer-motion";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

interface TalkingPoint {
  topic: string;
  context: string;
  suggestedQuestion: string;
}

export default function CoachingTalkingPoints({
  points,
  loading,
  employeeName,
  onMarkUsed,
}: {
  points: TalkingPoint[];
  loading: boolean;
  employeeName: string;
  onMarkUsed?: () => void;
}) {
  if (loading) {
    return (
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin mb-3" />
        <p className="text-sm font-body text-muted-foreground">Generating coaching insights for {employeeName}...</p>
      </motion.div>
    );
  }

  if (points.length === 0) {
    return (
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm font-body text-muted-foreground">Click "Prepare 1-on-1" to generate AI coaching insights</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-display text-base font-semibold text-foreground">
            1-on-1 with {employeeName}
          </h3>
        </div>
        {onMarkUsed && (
          <button
            onClick={onMarkUsed}
            className="flex items-center gap-1 text-xs font-body text-primary hover:underline"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark as used
          </button>
        )}
      </div>

      <div className="space-y-4">
        {points.map((point, i) => (
          <motion.div
            key={i}
            className="p-4 rounded-xl bg-muted/10 border border-border/10"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <h4 className="text-sm font-display font-semibold text-foreground mb-1">{point.topic}</h4>
            <p className="text-xs text-muted-foreground font-body mb-2">{point.context}</p>
            <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-2.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs font-body text-foreground italic">"{point.suggestedQuestion}"</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
