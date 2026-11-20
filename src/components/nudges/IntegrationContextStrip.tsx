import { useNudgeQueue } from "@/hooks/useNudgeQueue";
import { NudgeCard } from "./NudgeCard";

interface Props {
  max?: number;
}

/**
 * Slim strip of integration-driven nudges. Place near the top of Home.
 * Renders nothing when there's no pending nudge — never noisy.
 */
export function IntegrationContextStrip({ max = 2 }: Props) {
  const { nudges, dismiss, act } = useNudgeQueue();
  if (!nudges.length) return null;
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-3">
      {nudges.slice(0, max).map((n) => (
        <NudgeCard key={n.id} nudge={n} onAct={act} onDismiss={dismiss} />
      ))}
    </div>
  );
}
