/**
 * Foundation Onboarding v2 — orchestrator.
 *
 * Sequence:
 *   framingA → 12 questions → framingB → analysis → daily rhythm → onComplete
 *
 * Drafts are autosaved to localStorage so reload mid-flow resumes.
 */
import { useCallback, useMemo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import FramingScreen from "./FramingScreen";
import QuestionCard from "./QuestionCard";
import AnalysisReveal from "./AnalysisReveal";
import FoundationPathPicker from "./PathPicker";
import Day1CalibrationScreen from "./Day1CalibrationScreen";
import { FOUNDATION_QUESTIONS, type PathId } from "@/lib/onboarding/foundationQuestions";
import { analyzeFoundation, type FoundationAnalysis, type FoundationAnswers } from "@/lib/onboarding/foundationAnalyzer";
import DailyRhythmOnboarding, { type DailyRhythmAnswers } from "@/components/onboarding/DailyRhythmOnboarding";
import { toast } from "sonner";

export interface FoundationResult {
  answers: FoundationAnswers;
  analysis: FoundationAnalysis;
  paths: { core: "observation"; secondary: PathId[] };
  rhythm: DailyRhythmAnswers;
}

interface Props {
  userId: string;
  onComplete: (result: FoundationResult) => void | Promise<void>;
}

type Phase = "framingA" | "questions" | "framingB" | "analysis" | "paths" | "rhythm";

const draftKey = (uid: string) => `foundation_v2_draft_${uid}`;
const DEFAULT_RHYTHM: DailyRhythmAnswers = { wake_time: "06:30", sleep_time: "22:30" };

export default function FoundationOnboarding({ userId, onComplete }: Props) {
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(draftKey(userId));
      if (!raw) return { answers: {} as FoundationAnswers };
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if ("answers" in parsed) {
        return parsed as {
          phase?: Phase;
          qIdx?: number;
          answers: FoundationAnswers;
          rhythm?: DailyRhythmAnswers;
          paths?: FoundationResult["paths"] | null;
        };
      }
      return { answers: parsed as FoundationAnswers };
    } catch {
      return { answers: {} as FoundationAnswers };
    }
  });
  const [phase, setPhase] = useState<Phase>(initial.phase ?? "framingA");
  const [qIdx, setQIdx] = useState(initial.qIdx ?? 0);
  const [answers, setAnswers] = useState<FoundationAnswers>(initial.answers);
  const [rhythm, setRhythm] = useState<DailyRhythmAnswers>(initial.rhythm ?? DEFAULT_RHYTHM);
  const [paths, setPaths] = useState<FoundationResult["paths"] | null>(initial.paths ?? null);
  const [savingRhythm, setSavingRhythm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey(userId), JSON.stringify({ phase, qIdx, answers, rhythm, paths }));
    } catch (error) {
      console.warn("Foundation onboarding draft could not be saved", error);
    }
  }, [answers, phase, paths, qIdx, rhythm, userId]);

  const total = FOUNDATION_QUESTIONS.length;
  const q = FOUNDATION_QUESTIONS[qIdx];

  const setAnswer = useCallback((v: string | number | string[]) => {
    setAnswers((curr) => ({ ...curr, [q.id]: v }));
  }, [q.id]);

  const next = useCallback(() => {
    if (qIdx < total - 1) setQIdx((i) => i + 1);
    else setPhase("framingB");
  }, [qIdx, total]);

  const back = useCallback(() => {
    if (qIdx > 0) setQIdx((i) => i - 1);
    else setPhase("framingA");
  }, [qIdx]);

  const analysis = useMemo<FoundationAnalysis | null>(() => {
    if (phase === "analysis" || phase === "paths" || phase === "rhythm") return analyzeFoundation(answers);
    return null;
  }, [answers, phase]);

  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return false;
    return true;
  }).length;

  const handlePathsComplete = useCallback((paths: { core: "observation"; secondary: PathId[] }) => {
    setPaths(paths);
    setPhase("rhythm");
  }, []);

  const handleRhythmContinue = useCallback(async () => {
    if (!paths || savingRhythm) return;
    setSavingRhythm(true);
    try {
      await onComplete({
        answers,
        analysis: analysis ?? analyzeFoundation(answers),
        paths,
        rhythm,
      });
      try {
        localStorage.removeItem(draftKey(userId));
      } catch (error) {
        console.warn("Foundation onboarding draft could not be cleared", error);
      }
    } catch (error) {
      console.error("Foundation onboarding save failed", error);
      toast.error("We couldn't save your routine yet. Please try again.");
    } finally {
      setSavingRhythm(false);
    }
  }, [analysis, answers, onComplete, paths, rhythm, savingRhythm, userId]);

  return (
    <AnimatePresence mode="wait">
      {phase === "framingA" && (
        <Day1CalibrationScreen
          key="framingA"
          onNext={() => setPhase("questions")}
          onSkip={() => {
            const defaults: FoundationAnswers = {
              mood: 5,
              energy: 5,
              body_awareness: 3,
              loop_awareness: "none",
              practice_history: "none",
              emotional_pattern: "stable",
              thought_pattern: "mixed",
              sleep_quality: "average",
              stress_level: 3,
              social_connection: 3,
              life_domains: ["health", "relationships", "career"],
              intention: "begin",
            };
            setAnswers(defaults);
            setPhase("framingB");
          }}
        />
      )}

      {phase === "questions" && (
        <QuestionCard
          key={`q-${q.id}`}
          question={q}
          index={qIdx}
          total={total}
          value={answers[q.id]}
          canBack={qIdx > 0 || true}
          canFinishEarly={Object.keys(answers).length >= 3}
          onFinishEarly={() => setPhase("framingB")}
          onAnswer={setAnswer}
          onNext={next}
          onBack={back}
        />
      )}

      {phase === "framingB" && (
        <FramingScreen
          key="framingB"
          eyebrow="Building your foundation"
          title="This is your foundation."
          body={`What you just gave me becomes your starting band.\n\nOver the next days I'll keep recalibrating — this isn't a test, it's a first photograph.`}
          cta="See what I see"
          onNext={() => setPhase("analysis")}
          progressLabel={`Step 3 of 4`}
        />
      )}

      {phase === "analysis" && analysis && (
        <AnalysisReveal
          key="analysis"
          analysis={analysis}
          onNext={() =>
            handlePathsComplete({ core: "observation", secondary: analysis.suggestedSecondary.slice(0, 3) })
          }
        />
      )}
      {phase === "rhythm" && (
        <DailyRhythmOnboarding
          name=""
          value={rhythm}
          onChange={setRhythm}
          onContinue={handleRhythmContinue}
          saving={savingRhythm}
        />
      )}
    </AnimatePresence>
  );
}
