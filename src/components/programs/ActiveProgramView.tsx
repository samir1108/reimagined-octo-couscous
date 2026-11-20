import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Play, PenLine, Check, ChevronRight, X } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import ReactMarkdown from "react-markdown";
import type { Program, ProgramDay } from "@/data/programs/types";
import { useUpdateDayProgress, useDayProgress, useCompleteProgram, type ProgramEnrollment } from "@/hooks/usePrograms";
import { toast } from "@/hooks/use-toast";
import { conscious } from "@/lib/consciousToast";

interface ActiveProgramViewProps {
  program: Program;
  enrollment: ProgramEnrollment;
  onClose: () => void;
}

type Step = "learn" | "practice" | "reflect";

export default function ActiveProgramView({ program, enrollment, onClose }: ActiveProgramViewProps) {
  const currentDay = Math.min(enrollment.current_day, program.duration);
  const dayData = program.curriculum[currentDay - 1];
  const [step, setStep] = useState<Step>("learn");
  const [reflection, setReflection] = useState("");

  const { data: progress } = useDayProgress(enrollment.id, currentDay);
  const updateProgress = useUpdateDayProgress();
  const completeProgram = useCompleteProgram();

  if (!dayData) {
    // Program completed
    return (
      <ProgramCompleteScreen
        program={program}
        enrollment={enrollment}
        onClose={onClose}
        onComplete={() => completeProgram.mutate(enrollment.id)}
      />
    );
  }

  const knowledgeRead = progress?.knowledge_read || false;
  const practiceDone = progress?.practice_done || false;
  const reflectionDone = !!progress?.reflection_text;

  const handleMarkKnowledge = () => {
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      dayNumber: currentDay,
      updates: { knowledge_read: true },
    });
    setStep("practice");
  };

  const handleMarkPractice = () => {
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      dayNumber: currentDay,
      updates: { practice_done: true },
    });
    setStep("reflect");
  };

  const handleSubmitReflection = () => {
    if (!reflection.trim()) {
      conscious("writeMore");
      return;
    }
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      dayNumber: currentDay,
      updates: { reflection_text: reflection.trim() },
    });
    toast({ title: "✨ Day complete!", description: `Day ${currentDay} of ${program.duration} done!` });
  };

  const steps: { id: Step; label: string; icon: React.ElementType; done: boolean }[] = [
    { id: "learn", label: "Learn", icon: BookOpen, done: knowledgeRead },
    { id: "practice", label: "Practice", icon: Play, done: practiceDone },
    { id: "reflect", label: "Reflect", icon: PenLine, done: reflectionDone },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-display text-primary tracking-wider uppercase">
              Day {currentDay} of {program.duration}
            </p>
            <h1 className="text-xl font-display font-bold text-foreground">{dayData.title}</h1>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{dayData.theme}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display transition-all flex-1 ${
                  step === s.id
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : s.done
                    ? "glass-subtle text-primary/60"
                    : "glass-subtle text-muted-foreground"
                }`}
              >
                {s.done ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                {s.label}
              </button>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === "learn" && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-foreground text-sm">{dayData.knowledge.title}</h2>
                  <span className="text-xs text-muted-foreground font-body ml-auto">{dayData.knowledge.readingTime} min read</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none font-body text-foreground/80 leading-relaxed">
                  <ReactMarkdown>{dayData.knowledge.content}</ReactMarkdown>
                </div>
              </div>
              {!knowledgeRead && (
                <Button
                  onClick={handleMarkKnowledge}
                  disabled={updateProgress.isPending}
                  className="w-full rounded-xl font-display h-12"
                >
                  <Check className="w-4 h-4 mr-2" />
                  I've Read This — Next: Practice
                </Button>
              )}
              {knowledgeRead && (
                <Button
                  onClick={() => setStep("practice")}
                  variant="outline"
                  className="w-full rounded-xl font-display h-12"
                >
                  Continue to Practice <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </motion.div>
          )}

          {step === "practice" && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-foreground text-sm">{dayData.practice.title}</h2>
                  <span className="text-xs text-muted-foreground font-body ml-auto">{dayData.practice.durationMinutes} min</span>
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{dayData.practice.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-display capitalize">
                    {dayData.practice.type.replace("-", " ")}
                  </span>
                </div>
              </div>
              {!practiceDone && (
                <Button
                  onClick={handleMarkPractice}
                  disabled={updateProgress.isPending}
                  className="w-full rounded-xl font-display h-12"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Practice Done — Next: Reflect
                </Button>
              )}
              {practiceDone && (
                <Button
                  onClick={() => setStep("reflect")}
                  variant="outline"
                  className="w-full rounded-xl font-display h-12"
                >
                  Continue to Reflect <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </motion.div>
          )}

          {step === "reflect" && (
            <motion.div
              key="reflect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-foreground text-sm">Reflect</h2>
                </div>
                <p className="text-sm text-muted-foreground font-body leading-relaxed italic">
                  "{dayData.reflectionPrompt}"
                </p>
                {reflectionDone ? (
                  <div className="glass-subtle rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-body mb-1">Your reflection:</p>
                    <p className="text-sm text-foreground font-body">{progress?.reflection_text}</p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Write your reflection here..."
                      className="min-h-[120px] rounded-xl font-body text-sm"
                    />
                    <Button
                      onClick={handleSubmitReflection}
                      disabled={updateProgress.isPending || !reflection.trim()}
                      className="w-full rounded-xl font-display h-12"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Complete Day {currentDay}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProgramCompleteScreen({
  program,
  enrollment,
  onClose,
  onComplete,
}: {
  program: Program;
  enrollment: ProgramEnrollment;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center space-y-6 px-8 max-w-md">
        <motion.span
          className="text-7xl block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          🎉
        </motion.span>
        <h1 className="text-3xl font-display font-bold text-foreground">Journey Complete!</h1>
        <p className="text-muted-foreground font-body">
          You've completed all {program.duration} days of <strong>{program.title}</strong>. 
          This is a significant achievement in your consciousness journey.
        </p>
        <div className="flex flex-col gap-3">
          {enrollment.status === "active" && (
            <Button onClick={onComplete} className="w-full rounded-xl font-display h-12">
              Mark as Complete ✨
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="w-full rounded-xl font-display h-12">
            Back to Explore
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
