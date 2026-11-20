/**
 * TEMPLE DISCOVER — Standalone Self-Assessment Hub
 * Full-screen experience with all questionnaires, analysis, and 30-day journey offer
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Compass, Sparkles, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { ALL_QUESTIONNAIRES, type QuestionnaireResult } from "@/lib/questionnaires";
import QuestionnaireUI from "./QuestionnaireUI";

interface TempleDiscoverProps {
  onClose: () => void;
  onStartJourney?: (resultData: QuestionnaireResult) => void;
}

const CATEGORY_ICONS: Record<number, string> = {
  0: "🔮", 1: "🌙", 2: "💔", 3: "💰", 4: "🧭",
  5: "👶", 6: "🎨", 7: "🔮", 8: "🌙", 9: "💔",
};

export default function TempleDiscover({ onClose, onStartJourney }: TempleDiscoverProps) {
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [completedResults, setCompletedResults] = useState<
    { questionnaireId: string; result: QuestionnaireResult; scores: Record<string, number> }[]
  >([]);

  const completedIds = completedResults.map(r => r.questionnaireId);

  const handleComplete = (result: QuestionnaireResult, scores: Record<string, number>) => {
    const quiz = ALL_QUESTIONNAIRES[activeQuiz!];
    setCompletedResults(prev => [
      ...prev.filter(r => r.questionnaireId !== quiz.id),
      { questionnaireId: quiz.id, result, scores },
    ]);
    setActiveQuiz(null);
  };

  // Show active questionnaire
  if (activeQuiz !== null) {
    return (
      <QuestionnaireUI
        questionnaire={ALL_QUESTIONNAIRES[activeQuiz]}
        onComplete={handleComplete}
        onClose={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-foreground text-sm font-display font-semibold">Discover Yourself</h1>
          <p className="text-muted-foreground text-[10px] font-display">Deep self-assessments & personalized journeys</p>
        </div>
        <Compass className="w-5 h-5 text-primary/70" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Hero */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-foreground text-xl font-display font-semibold mb-2">
              Map Your Inner Landscape
            </h2>
            <p className="text-muted-foreground text-sm font-display leading-relaxed max-w-xs mx-auto">
              Take these assessments to understand your patterns, unlock personalized practices, and begin a transformative 30-day journey.
            </p>
          </motion.div>

          {/* Completed Results Summary */}
          {completedResults.length > 0 && (
            <motion.div
              className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <p className="text-foreground text-xs font-display font-medium">
                  {completedResults.length} assessment{completedResults.length > 1 ? "s" : ""} completed
                </p>
              </div>
              <div className="space-y-2">
                {completedResults.map((cr) => (
                  <div
                    key={cr.questionnaireId}
                    className="flex items-center gap-3 p-2 rounded-xl bg-card/80 border border-border/40"
                  >
                    <span className="text-lg">{cr.result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-xs font-display font-medium truncate">{cr.result.title}</p>
                      <p className="text-muted-foreground text-[10px] font-display truncate">{cr.result.description.slice(0, 60)}...</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start 30-Day Journey CTA */}
              <motion.button
                onClick={() => onStartJourney?.(completedResults[completedResults.length - 1].result)}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground text-sm font-display font-semibold tracking-wide hover:from-primary hover:to-secondary transition-all flex items-center justify-center gap-2 shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Start Your 30-Day Journey
              </motion.button>
              <p className="text-center text-muted-foreground text-[10px] font-display mt-2">
                Personalized based on your assessment results
              </p>
            </motion.div>
          )}

          {/* All Assessments */}
          <div>
            <p className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-3">
              All Assessments
            </p>
            <div className="space-y-2">
              {ALL_QUESTIONNAIRES.map((q, i) => {
                const isCompleted = completedIds.includes(q.id);
                return (
                  <motion.button
                    key={q.id}
                    onClick={() => setActiveQuiz(i)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all group ${
                      isCompleted
                        ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                        : "border-border/60 bg-card/80 hover:bg-card hover:border-primary/30 hover:shadow-md"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        isCompleted ? "bg-primary/20" : "bg-muted"
                      }`}>
                        {isCompleted ? "✅" : (CATEGORY_ICONS[i] || "🔮")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-foreground text-sm font-display font-medium truncate">{q.title}</p>
                          {isCompleted && (
                            <span className="text-[9px] font-display text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">Done</span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs font-display truncate">{q.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-muted-foreground/80 text-[10px] font-display">
                            {q.questionCount} questions · {q.timeEstimate}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}