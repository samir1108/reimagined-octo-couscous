import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Sparkles } from "lucide-react";
import { getCardForDay } from "@/data/knowledgeCards";

interface KnowledgeCardWidgetProps {
  journeyDay?: number;
}

export default function KnowledgeCardWidget({ journeyDay = 1 }: KnowledgeCardWidgetProps) {
  const card = getCardForDay(journeyDay);
  const isOnboarding = journeyDay <= 30;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 cursor-pointer glass-card-hover"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.6 }}
      onClick={() => setExpanded(prev => !prev)}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
          {card.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold mb-0.5 flex items-center gap-1.5">
            {isOnboarding ? <Sparkles className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {isOnboarding ? `Day ${journeyDay} — Why This Matters` : "Daily Wisdom"}
          </p>
          <h3 className="text-sm font-display font-semibold text-foreground tracking-tight truncate">
            {card.title}
          </h3>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="mt-4 pt-4 border-t border-border/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-body text-foreground/80 leading-relaxed mb-3">
              {card.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-body italic">— {card.source}</span>
              <span className="px-2 py-0.5 rounded-full glass-subtle text-[10px] font-display text-muted-foreground capitalize">
                {card.category}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
