/**
 * SessionRunner — plays a ComposedSession atom-by-atom.
 */
import { useEffect, useMemo, useState } from "react";
import type { ComposedSession } from "@/lib/programs/types";
import { getAtomById } from "@/lib/programs/atoms";
import AtomRenderer from "./AtomRenderer";
import { Progress } from "@/design-system";
import { Button } from "@/design-system";
import { Card } from "@/design-system";
import { updateActiveProgram } from "@/lib/programs/activeProgram";

interface Props {
  session: ComposedSession;
  onExit: () => void;
  onComplete?: () => void;
}

export default function SessionRunner({ session, onExit, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const total = session.atoms.length;
  const done = idx >= total;

  useEffect(() => {
    updateActiveProgram({ cursor: idx, totalAtoms: total });
  }, [idx, total]);

  const current = useMemo(() => {
    if (done) return null;
    const inst = session.atoms[idx];
    const atom = getAtomById(inst.atomId);
    return atom ? { atom, inst } : null;
  }, [idx, session.atoms, done]);

  const progress = done ? 100 : Math.round((idx / total) * 100);

  if (done) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="text-3xl">🙏</div>
        <h2 className="text-2xl font-semibold">Session complete</h2>
        <p className="text-sm text-muted-foreground">
          You moved through {total} {total === 1 ? "atom" : "atoms"}.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <Button onClick={() => { onComplete?.(); onExit(); }}>Back to program</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onExit}>Exit</Button>
        <Progress value={progress} className="flex-1" />
        <div className="text-xs text-muted-foreground tabular-nums">
          {idx + 1} / {total}
        </div>
      </div>
      {session.why && (
        <p className="text-xs text-muted-foreground italic px-1">
          {session.why}
        </p>
      )}
      {current ? (
        <AtomRenderer
          key={current.inst.atomId + idx}
          atom={current.atom}
          instance={current.inst}
          onDone={() => setIdx((i) => i + 1)}
        />
      ) : (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Missing atom: {session.atoms[idx]?.atomId}
          </p>
          <Button onClick={() => setIdx((i) => i + 1)} className="mt-3">Skip</Button>
        </Card>
      )}
    </div>
  );
}
