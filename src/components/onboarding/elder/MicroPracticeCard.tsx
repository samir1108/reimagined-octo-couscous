/**
 * MicroPracticeCard — Micro-Practice Reveal (Elder IP #5).
 *
 * Instead of asking "are you disciplined?", give a 30-sec practice and observe:
 *  - Did they do it? (compliance)
 *  - How did they describe it after? (interoception)
 * Injected once at Arc 5 (Body). Records outcome as a signal on the next
 * user turn (`signal: "micro-practice:<state>"`).
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onDone: (outcome: "did_it" | "skipped" | "partial", noticed: string) => void;
}

export default function MicroPracticeCard({ onDone }: Props) {
  const [phase, setPhase] = useState<"intro" | "running" | "reflect">("intro");
  const [seconds, setSeconds] = useState(30);
  const [noticed, setNoticed] = useState("");

  useEffect(() => {
    if (phase !== "running") return;
    if (seconds <= 0) {
      setPhase("reflect");
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, seconds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-2xl border border-primary/30 bg-primary/[0.04] p-5"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-2">
        A 30-second practice
      </p>

      {phase === "intro" && (
        <>
          <p className="font-display text-lg text-foreground mb-1">
            Close your eyes. Feel your feet on the floor. Breathe out slowly.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Do this for 30 seconds. I'll ask you what you noticed.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPhase("running")}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
            >
              Start
            </button>
            <button
              onClick={() => onDone("skipped", "")}
              className="px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground transition"
            >
              Skip this
            </button>
          </div>
        </>
      )}

      {phase === "running" && (
        <>
          <p className="font-display text-2xl text-foreground text-center tabular-nums mb-3">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </p>
          <p className="text-sm text-muted-foreground text-center italic mb-4">
            Breathing out… slower than in…
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setPhase("reflect")}
              className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition"
            >
              I'm done
            </button>
          </div>
        </>
      )}

      {phase === "reflect" && (
        <>
          <p className="font-display text-base text-foreground mb-2">
            What did you notice — in one line?
          </p>
          <textarea
            value={noticed}
            onChange={(e) => setNoticed(e.target.value)}
            rows={2}
            placeholder="tight chest, breath shortened, calmer, felt silly…"
            className="w-full resize-none px-3 py-2 rounded-xl bg-card/30 border border-border/40 focus:border-primary/50 outline-none text-sm text-foreground placeholder:text-muted-foreground/60 mb-3"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onDone("did_it", noticed.trim() || "no words")}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
            >
              Continue
            </button>
            <button
              onClick={() => onDone("partial", noticed.trim() || "no words")}
              className="px-4 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground transition"
            >
              I only did some of it
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
