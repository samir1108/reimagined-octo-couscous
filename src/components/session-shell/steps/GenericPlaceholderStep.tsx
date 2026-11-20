import { useEffect } from "react";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";

/**
 * Silent fallback for unrecognized step kinds.
 * Auto-advances to the next step so the user never sees a "coming soon" card
 * when transitioning between screens.
 */
export function GenericPlaceholderStep() {
  const { currentStep, goToNext } = useSessionShell();

  useEffect(() => {
    if (!currentStep) return;
    // Defer one tick so context state settles before advancing.
    const t = setTimeout(() => {
      goToNext();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep?.title, currentStep?.kind]);

  return null;
}
