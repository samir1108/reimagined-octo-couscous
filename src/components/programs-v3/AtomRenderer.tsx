/**
 * AtomRenderer — renders ONE composed atom by its category.
 * Lightweight, presentation-only. No backend writes.
 */
import { useEffect, useState } from "react";
import type { Atom, SessionAtomInstance } from "@/lib/programs/types";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { Card } from "@/design-system";

interface Props {
  atom: Atom;
  instance: SessionAtomInstance;
  onDone: () => void;
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, left]);
  return { left, running, start: () => setRunning(true), pause: () => setRunning(false), reset: () => { setLeft(seconds); setRunning(false); } };
}

function Timer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const { left, running, start, pause } = useCountdown(seconds);
  useEffect(() => { if (left === 0 && running) onComplete(); }, [left, running, onComplete]);
  const mm = Math.floor(left / 60).toString().padStart(2, "0");
  const ss = (left % 60).toString().padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-5xl font-mono tabular-nums">{mm}:{ss}</div>
      <div className="flex gap-2">
        {!running ? (
          <Button onClick={start} variant="default">Start</Button>
        ) : (
          <Button onClick={pause} variant="secondary">Pause</Button>
        )}
        <Button onClick={onComplete} variant="ghost">Skip</Button>
      </div>
    </div>
  );
}

export default function AtomRenderer({ atom, instance, onDone }: Props) {
  const cat = atom.category;
  const dur = instance.durationSec;

  // Read / teaching style atoms
  const readish: typeof cat[] = ["teaching", "wisdom-read", "neuroscience", "framework"];
  if (readish.includes(cat)) {
    return (
      <Card className="p-6 space-y-4">
        <Header atom={atom} dur={dur} />
        {atom.body && <p className="text-base leading-relaxed text-foreground/90">{atom.body}</p>}
        {atom.script && (
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {atom.script.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        )}
        <Button onClick={onDone} className="w-full">I've read it</Button>
      </Card>
    );
  }

  // Timer-based: breath / meditation / witness / kriya / body-scan / mantra / mudra / concentration / observation / movement
  const timerish: typeof cat[] = [
    "breathwork", "body-scan", "kriya", "movement", "mudra", "mantra",
    "meditation", "witness", "observation", "concentration", "somatic-release", "contemplation",
  ];
  if (timerish.includes(cat)) {
    return (
      <Card className="p-6 space-y-4">
        <Header atom={atom} dur={dur} />
        {atom.script && (
          <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
            {atom.script.map((l, i) => <li key={i}>{l}</li>)}
          </ol>
        )}
        <Timer seconds={dur} onComplete={onDone} />
      </Card>
    );
  }

  // Journal / voice-journal / self-inquiry / shadow / emotion / ifs / loop-confront → textarea
  const writeish: typeof cat[] = [
    "journal", "voice-journal", "self-inquiry", "shadow-work",
    "emotion-naming", "ifs-parts", "loop-confront", "ai-mirror",
  ];
  if (writeish.includes(cat)) {
    return <WriteAtom atom={atom} dur={dur} onDone={onDone} />;
  }

  // Dialogue: guru-dialogue / council / guide-chat — for now a stub CTA
  const chatish: typeof cat[] = ["guru-dialogue", "council", "guide-chat"];
  if (chatish.includes(cat)) {
    return (
      <Card className="p-6 space-y-4">
        <Header atom={atom} dur={dur} />
        <p className="text-sm text-muted-foreground">{atom.intent}</p>
        <p className="text-xs text-muted-foreground italic">
          (Chat experience will open here. For now, mark complete when ready.)
        </p>
        <Button onClick={onDone} className="w-full">Mark complete</Button>
      </Card>
    );
  }

  // micro-act / speech-vow / detox → simple commitment
  if (cat === "micro-act" || cat === "speech-vow" || cat === "detox") {
    return (
      <Card className="p-6 space-y-4">
        <Header atom={atom} dur={dur} />
        <p className="text-sm text-foreground/90">{atom.intent}</p>
        {atom.script && (
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {atom.script.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        )}
        <Button onClick={onDone} className="w-full">I'll do this</Button>
      </Card>
    );
  }

  // ritual — short tap
  return (
    <Card className="p-6 space-y-4 text-center">
      <Header atom={atom} dur={dur} />
      <p className="text-sm text-muted-foreground">{atom.intent}</p>
      <Button onClick={onDone} className="w-full">Continue</Button>
    </Card>
  );
}

function Header({ atom, dur }: { atom: Atom; dur: number }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{atom.category}</div>
        <div className="text-lg font-semibold">{atom.label}</div>
      </div>
      <div className="text-xs text-muted-foreground tabular-nums">
        {Math.round(dur / 60)} min
      </div>
    </div>
  );
}

function WriteAtom({ atom, dur, onDone }: { atom: Atom; dur: number; onDone: () => void }) {
  const [text, setText] = useState("");
  return (
    <Card className="p-6 space-y-4">
      <Header atom={atom} dur={dur} />
      <p className="text-sm text-muted-foreground">{atom.intent}</p>
      {atom.script && (
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {atom.script.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      )}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write what's true right now..."
        className="min-h-[140px]"
      />
      <Button onClick={onDone} className="w-full" disabled={text.trim().length < 2}>
        Done
      </Button>
    </Card>
  );
}
