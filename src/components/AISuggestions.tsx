import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";

export interface AISuggestion {
  type: "guide_mode" | "journal" | "practice";
  title: string;
  description: string;
  reason?: string;
  emoji: string;
  duration?: string;
  action: {
    target: string;
    mode?: string;
    prompt?: string;
    context?: string;
  };
}

interface AISuggestionsProps {
  suggestions: AISuggestion[];
}

export default function AISuggestions({ suggestions }: AISuggestionsProps) {
  const navigate = useNavigate();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!suggestions || suggestions.length === 0) return null;

  const handleClick = (suggestion: AISuggestion) => {
    const { target, mode, prompt, context } = suggestion.action;
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (prompt) params.set("prompt", prompt);
    if (context) params.set("aiContext", context);

    if (target === "guide") {
      navigate(`/app/guide?${params.toString()}`);
    } else if (target === "journal") {
      navigate(`/app/journal?${params.toString()}`);
    } else if (target === "practice") {
      navigate(`/app/practice?${params.toString()}`);
    }
  };

  const toggleReason = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div>
      <motion.div
        className="flex items-center gap-2.5 mb-4 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
          Recommended for You
        </h3>
      </motion.div>
      <div className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <motion.div
            key={`${suggestion.type}-${i}`}
            className="w-full glass-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              onClick={() => handleClick(suggestion)}
              className="w-full p-5 text-left glass-card-hover group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl">
                  {suggestion.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {suggestion.title}
                    </p>
                    {suggestion.duration && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-[9px] font-display text-primary shrink-0">
                        {suggestion.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed mt-1 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1 group-hover:translate-x-0.5 transform duration-200" />
              </div>
            </button>

            {/* "Why this?" toggle */}
            {suggestion.reason && (
              <>
                <button
                  onClick={(e) => toggleReason(e, i)}
                  className="w-full flex items-center gap-1.5 px-5 py-2 text-[10px] font-display text-primary/60 hover:text-primary transition-colors border-t border-border/30"
                >
                  <span>Why this?</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedIdx === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expandedIdx === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-xs text-muted-foreground font-body leading-relaxed italic">
                        {suggestion.reason}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
