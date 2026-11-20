import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

/**
 * 30-second guided 3-breath taste. Pure visual + text cues — no audio,
 * no backend. Used inside world deep-dives as the "mini-experience".
 */
export default function MiniBreath({ accent }: { accent: string }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"idle" | "in" | "hold" | "out" | "done">("idle");
  const [round, setRound] = useState(0);
  const timerRef = useRef<number | null>(null);

  const cancel = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const start = () => {
    cancel();
    setRunning(true);
    setRound(0);
    runRound(0);
  };

  const reset = () => {
    cancel();
    setRunning(false);
    setPhase("idle");
    setRound(0);
  };

  const runRound = (i: number) => {
    if (i >= 3) {
      setPhase("done");
      setRunning(false);
      return;
    }
    setRound(i + 1);
    setPhase("in");
    timerRef.current = window.setTimeout(() => {
      setPhase("hold");
      timerRef.current = window.setTimeout(() => {
        setPhase("out");
        timerRef.current = window.setTimeout(() => runRound(i + 1), 5000);
      }, 2000);
    }, 4000);
  };

  useEffect(() => () => cancel(), []);

  const scale =
    phase === "in" ? 1.6 :
    phase === "hold" ? 1.6 :
    phase === "out" ? 0.9 : 1;
  const dur =
    phase === "in" ? 4 :
    phase === "out" ? 5 :
    phase === "hold" ? 2 : 1.2;

  const label =
    phase === "in" ? "Breathe in" :
    phase === "hold" ? "Hold" :
    phase === "out" ? "Out, long" :
    phase === "done" ? "There you are." :
    "Try one round";

  return (
    <div className="relative rounded-3xl border border-amber-100/15 bg-black/50 backdrop-blur-md p-8 md:p-10 overflow-hidden">
      <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/60 mb-2">
        Mini-experience · 30 sec
      </div>
      <h3 className="text-2xl md:text-3xl font-serif text-amber-50 mb-6">
        A taste of the practice
      </h3>

      <div className="flex flex-col items-center justify-center py-4">
        <div
          className="relative w-40 h-40 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 50%, hsl(${accent} / .35), transparent 70%)`,
            transform: `scale(${scale})`,
            transition: `transform ${dur}s cubic-bezier(.45,.05,.55,.95)`,
          }}
        >
          <div
            className="w-32 h-32 rounded-full border"
            style={{
              borderColor: `hsl(${accent} / .55)`,
              boxShadow: `0 0 60px hsl(${accent} / .4) inset, 0 0 40px hsl(${accent} / .3)`,
            }}
          />
        </div>

        <div className="mt-8 h-6 text-amber-50/85 text-sm tracking-wide">
          {label} {running && phase !== "done" && (
            <span className="text-amber-200/60">· round {round} of 3</span>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {!running && phase !== "done" && (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-black px-5 py-2.5 text-sm font-medium hover:bg-amber-200 transition"
            >
              <Play className="w-4 h-4" /> Begin
            </button>
          )}
          {phase === "done" && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-amber-100/30 text-amber-100/90 px-5 py-2.5 text-sm hover:bg-amber-100/10 transition"
            >
              <RotateCcw className="w-4 h-4" /> Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
