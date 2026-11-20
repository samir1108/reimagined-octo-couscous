/**
 * SittingRecorder — the bridge between the normal session runtime and the
 * First Eleven mapping (Gate 2 → normal flow).
 * ─────────────────────────────────
 * Lives inside SessionShellProvider. Every completed step in a sitting is
 * converted back into a mapping answer (toAnswer in lib) and handed to the
 * sitting's answer store — exactly where the bespoke runner used to write
 * them. So running the eleven through the normal shell sharpens the same
 * mapping.
 *
 * When the sitting finishes it fires onSittingFinished once; the page owns
 * the progress store (single source of truth) and decides what's next.
 */
import { useEffect, useRef } from "react";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { toAnswer } from "@/lib/onboarding/sittingRecorder";
import type { SEAnswer } from "@/lib/onboarding/firstElevenTypes";

interface Props {
  onAnswer: (answer: SEAnswer) => void;
  onSittingFinished: () => void;
}

export default function SittingRecorder({ onAnswer, onSittingFinished }: Props) {
  const { plan, completedSteps, isFinished } = useSessionShell();
  const recordedCount = useRef(0);
  const closedRef = useRef(false);

  useEffect(() => {
    if (completedSteps.length <= recordedCount.current) return;
    const fresh = completedSteps.slice(recordedCount.current);
    recordedCount.current = completedSteps.length;
    for (const record of fresh) {
      const answer = toAnswer(record, plan.steps);
      if (answer) onAnswer(answer);
    }
  }, [completedSteps, plan.steps, onAnswer]);

  useEffect(() => {
    if (!isFinished || closedRef.current) return;
    closedRef.current = true;
    onSittingFinished();
  }, [isFinished, onSittingFinished]);

  return null;
}
