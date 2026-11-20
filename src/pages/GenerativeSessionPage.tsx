import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadGenerativeSession } from "@/lib/session-shell/api";
import { SessionShellProvider } from "@/lib/session-shell/SessionShellContext";
import { GuidedFlowShell } from "@/components/session-shell/GuidedFlowShell";
import HomeOrb from "@/components/orb/HomeOrb";
import { Button } from "@/design-system";
import type { SessionPlan } from "@/lib/session-shell/types";

export default function GenerativeSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    setError(null);
    setPlan(null);
    (async () => {
      try {
        const res = await loadGenerativeSession(sessionId);
        if (cancelled) return;
        if (!res) setError("This sitting could not be found.");
        else setPlan(res.plan);
      } catch {
        if (!cancelled) setError("This sitting could not be loaded.");
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (error) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <HomeOrb size={96} />
        <div className="max-w-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground/90">The door did not open</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{error}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
            Nothing was lost. Try again, or return Home — this sitting is still saved.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" onClick={retry} className="rounded-full">Try again</Button>
          <Button size="sm" variant="ghost" onClick={() => navigate("/app")} className="rounded-full text-muted-foreground">
            Back Home
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionId || !plan) {
    // Seamless continuation of the cosmic orb shown on Home while the
    // generated session plan loads — never a blank black screen.
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-background px-6 text-center">
        <div className="h-32 w-32">
          <HomeOrb className="h-full w-full" />
        </div>
        <div>
          <p className="text-sm font-display italic text-foreground/80">Preparing your sitting…</p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
            Gathering the threads
          </p>
        </div>
      </div>
    );
  }

  return (
    <SessionShellProvider sessionId={sessionId} plan={plan}>
      <GuidedFlowShell />
    </SessionShellProvider>
  );
}
