/**
 * SpiralStepBanner
 * Slim sticky top banner shown on any surface when a multi-step spiral is
 * active. Shows progress + manual "Done with step" + Stop. Auto-detection
 * happens at each surface (they call orchestrator.completeCurrent()), this
 * is the always-visible manual override per the user spec.
 */
import { ChevronRight, X, MoreHorizontal } from "lucide-react";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";
import { usePracticeRunController } from "@/contexts/PracticeRunControllerContext";

export default function SpiralStepBanner() {
  const { isActive, active, currentBlock, nextBlock, stepNumber, totalSteps, completeCurrent, stop } =
    useSessionOrchestrator();

  // Banner removed app-wide per user request — zero friction across all flows.
  return null;

  return (
    <div className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-md px-3 pt-2">
        <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-background/85 backdrop-blur-md px-3 py-1.5 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Step {stepNumber}/{totalSteps}</span>
              <span className="opacity-50">·</span>
              <span className="truncate text-foreground/80">{currentBlock?.label ?? ""}</span>
            </div>
            {nextBlock && (
              <div className="text-[10px] text-muted-foreground/70 truncate">
                Next: {nextBlock.label}
              </div>
            )}
          </div>
          <RunBannerActions completeCurrent={completeCurrent} stop={stop} hasNext={!!nextBlock} />
        </div>
      </div>
    </div>
  );
}

function RunBannerActions({
  completeCurrent,
  stop,
  hasNext,
}: { completeCurrent: () => void; stop: () => void; hasNext: boolean }) {
  // Use try/catch — controller may not be mounted in some preview routes.
  let setMoreOpen: ((v: boolean) => void) | null = null;
  let active = null as null | { runId: string };
  try {
    const ctl = usePracticeRunController();
    setMoreOpen = ctl.setMoreOpen;
    active = ctl.active;
  } catch { /* not inside provider */ }

  return (
    <>
      <button
        type="button"
        onClick={completeCurrent}
        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90 transition"
        aria-label="Mark step complete"
      >
        {hasNext ? "Next" : "Finish"}
        <ChevronRight className="w-3 h-3" />
      </button>
      {active && setMoreOpen && (
        <button
          type="button"
          onClick={() => setMoreOpen!(true)}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground transition"
          aria-label="More controls"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={stop}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground transition"
        aria-label="Stop session"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </>
  );
}
