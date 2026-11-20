/**
 * LifetimeSessionsStrip — horizontal scroll of all 60 Foundation sessions
 * with done / current / locked states. Pinned near the top of PreJourney
 * so the user always feels their lifetime journey at a glance.
 */
import { Check, Lock } from 'lucide-react';
import { PRE_JOURNEY_SESSIONS, PRE_JOURNEY_MODULES, PRE_JOURNEY_TOTAL } from '@/data/pre-journey/sessions';
import { cn } from '@/lib/utils';

interface Props {
  completedIds: string[];
  currentSessionId: string;
  pendingMirrorAfter?: number | null;
}

export default function LifetimeSessionsStrip({
  completedIds, currentSessionId, pendingMirrorAfter,
}: Props) {
  const completed = new Set(completedIds);
  const currentIdx = PRE_JOURNEY_SESSIONS.findIndex(s => s.id === currentSessionId);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70">
          Lifetime · {PRE_JOURNEY_TOTAL} sessions
        </span>
        <span className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/70">
          {completed.size}/{PRE_JOURNEY_SESSIONS.length}
        </span>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-1 min-w-max pb-1">
          {PRE_JOURNEY_SESSIONS.map((s, i) => {
            const isDone = completed.has(s.id);
            const isCurrent = i === currentIdx;
            const isLocked = !isDone && !isCurrent && i > currentIdx;
            const moduleInfo = PRE_JOURNEY_MODULES.find(m => m.id === s.module);
            const showMirror = pendingMirrorAfter === s.number;
            return (
              <div key={s.id} className="flex flex-col items-center" title={`${s.number}. ${s.title}`}>
                <div
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-mono transition',
                    isDone && 'bg-primary/20 text-primary',
                    isCurrent && `bg-gradient-to-br ${moduleInfo?.gradient} text-white ring-2 ring-primary/40`,
                    isLocked && 'bg-muted/20 text-muted-foreground/40',
                  )}
                >
                  {isDone ? <Check className="w-3 h-3" /> : isLocked ? <Lock className="w-2.5 h-2.5" /> : s.number}
                </div>
                {showMirror && (
                  <div className="mt-0.5 text-[8px] text-amber-400 animate-pulse">◆</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
