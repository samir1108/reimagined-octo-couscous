/**
 * QUESTIONNAIRE UI
 * Beautiful, guided assessment flow
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2 } from "lucide-react";
import type { Questionnaire, QuestionnaireResult } from "@/lib/questionnaires";
import { supabase } from "@/lib/supabase";

interface QuestionnaireProps {
  questionnaire: Questionnaire;
  onComplete: (result: QuestionnaireResult, scores: Record<string, number>, programId?: string) => void;
  onClose: () => void;
}

export default function QuestionnaireUI({ questionnaire, onComplete, onClose }: QuestionnaireProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [programError, setProgramError] = useState<string | null>(null);
  const [lastScores, setLastScores] = useState<Record<string, number>>({});

  const question = questionnaire.questions[currentQ];
  const progress = ((currentQ + 1) / questionnaire.questions.length) * 100;
  const isAnswered = !!answers[question?.id];

  const selectOption = useCallback((value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  }, [question]);

  const next = useCallback(() => {
    if (currentQ < questionnaire.questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      calculateResult();
    }
  }, [currentQ, answers]);

  const prev = useCallback(() => {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  }, [currentQ]);

  const calculateResult = () => {
    const totalScores: Record<string, number> = {};

    // Sum all scores based on answers
    Object.entries(answers).forEach(([qId, answerValue]) => {
      const q = questionnaire.questions.find(q => q.id === qId);
      if (q) {
        const option = q.options.find(o => o.value === answerValue);
        if (option) {
          Object.entries(option.scores).forEach(([key, value]) => {
            totalScores[key] = (totalScores[key] || 0) + value;
          });
        }
      }
    });

    // Find highest scoring result
    let bestResult: QuestionnaireResult | null = null;
    let bestScore = 0;

    Object.entries(questionnaire.results).forEach(([id, r]) => {
      const score = totalScores[id] || 0;
      if (score > bestScore) {
        bestScore = score;
        bestResult = r;
      }
    });

    if (!bestResult) {
      bestResult = Object.values(questionnaire.results)[0];
    }

    setResult(bestResult);
    setLastScores(totalScores);
    setShowResult(true);
  };

  const generateProgram = async () => {
    if (!result) return;
    setGenerating(true);
    setProgramError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-personal-program`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            questionnaireId: questionnaire.id,
            resultId: result.id,
            resultData: result,
            guideIds: result.recommendedGuides,
            scores: lastScores,
          }),
        }
      );

      if (!resp.ok) throw new Error("Failed to generate program");

      const data = await resp.json();
      setGeneratedProgram(data.program);
      onComplete(result, lastScores, data.programId);
    } catch (e: any) {
      setProgramError(e.message || "Failed to generate program. Try again.");
    }
    setGenerating(false);
  };

  // Save result
  useEffect(() => {
    if (showResult && result) {
      const existing = JSON.parse(localStorage.getItem("questionnaire-results") || "[]");
      existing.push({
        questionnaireId: questionnaire.id,
        resultId: result.id,
        date: new Date().toISOString(),
        answers,
      });
      localStorage.setItem("questionnaire-results", JSON.stringify(existing));
    }
  }, [showResult, result]);

  // ─── RESULT SCREEN ───
  if (showResult && result) {
    return (
      <motion.div
      className="fixed inset-0 z-[85] flex flex-col bg-background backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-foreground text-xs font-display">Your Results</span>
          <button onClick={() => { setCurrentQ(0); setAnswers({}); setShowResult(false); }} className="text-muted-foreground text-xs font-display hover:text-foreground transition-colors">
            Retake
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-sm mx-auto text-center">
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {result.icon}
            </motion.div>

            <motion.h2
              className="text-foreground text-2xl font-display tracking-wide mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {result.title}
            </motion.h2>

            <motion.p
              className="text-muted-foreground text-sm font-display leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {result.description}
            </motion.p>

            {/* Recommended Guides */}
            <motion.div
              className="p-4 rounded-2xl bg-card/80 border border-border/60 mb-4 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-foreground text-xs font-display font-medium">Recommended Guides</p>
              </div>
              <div className="space-y-2">
                {result.recommendedGuides.map((guideId, i) => (
                  <motion.div
                    key={guideId}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-foreground text-xs font-display capitalize">{guideId}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recommended Practices */}
            <motion.div
              className="p-4 rounded-2xl bg-card/80 border border-border/60 mb-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-foreground text-xs font-display font-medium">Recommended Practices</p>
              </div>
              <div className="space-y-2">
                {result.recommendedPractices.map((practice, i) => (
                  <motion.div
                    key={practice}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-foreground text-xs font-display capitalize">{practice.replace(/-/g, " ")}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Generate Program Button */}
            <motion.button
              onClick={generateProgram}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground text-sm font-display tracking-wider hover:from-primary hover:to-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-2 shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              whileHover={{ scale: generating ? 1 : 1.02 }}
              whileTap={{ scale: generating ? 1 : 0.98 }}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Generating Your 30-Day Program...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Personal 30-Day Program
                </>
              )}
            </motion.button>

            {programError && (
              <motion.p
                className="text-destructive text-xs font-display text-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {programError}
              </motion.p>
            )}

            <motion.button
              onClick={() => onComplete(result, lastScores)}
              className="w-full py-3 rounded-xl bg-muted border border-border/60 text-muted-foreground text-xs font-display tracking-wider hover:bg-muted/80 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Close & Explore Later
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── QUESTION SCREEN ───
  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col bg-background backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[10px] font-display">{currentQ + 1} / {questionnaire.questions.length}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            className="max-w-sm mx-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <h3 className="text-foreground text-lg font-display leading-relaxed mb-1">
              {question.text}
            </h3>
            {question.textHi && (
              <p className="text-muted-foreground text-sm font-display mb-6 italic">
                {question.textHi}
              </p>
            )}

            {/* Options */}
            <div className="space-y-2">
              {question.options.map((option, i) => {
                const isSelected = answers[question.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => selectOption(option.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected
                      ? "bg-primary/15 border-primary/30"
                      : "bg-card/80 border-border/60 hover:bg-card hover:border-primary/20"
                      }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <p className={`text-sm font-display ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {option.label}
                    </p>
                    {option.labelHi && (
                      <p className={`text-xs font-display mt-1 ${isSelected ? "text-primary/60" : "text-muted-foreground"} italic`}>
                        {option.labelHi}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 border-t border-border/60 flex gap-2">
        {currentQ > 0 && (
          <button
            onClick={prev}
            className="flex-1 py-2.5 rounded-xl bg-muted border border-border/60 text-muted-foreground text-xs font-display tracking-wider hover:bg-muted/80 transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={!isAnswered}
          className={`flex-1 py-2.5 rounded-xl text-xs font-display tracking-wider transition-all flex items-center justify-center gap-1 ${isAnswered
            ? "bg-gradient-to-r from-primary/80 to-secondary/80 border border-primary/30 text-primary-foreground hover:from-primary hover:to-secondary shadow-sm"
            : "bg-muted border border-border/60 text-muted-foreground/40 cursor-not-allowed"
            }`}
        >
          {currentQ < questionnaire.questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="w-3 h-3" />
            </>
          ) : (
            <>
              See Results
              <Sparkles className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
