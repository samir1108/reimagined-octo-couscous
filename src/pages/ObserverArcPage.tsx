/**
 * ObserverArcPage — "The Observer in 3 sessions".
 * The three sits that answer: what is the observer, and what remains when
 * body, emotion, and thought are seen as known, not as me.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { OBSERVER_ARC } from "@/lib/prescription";

export default function ObserverArcPage() {
  const [active, setActive] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState("");
  const [done, setDone] = useState<number[]>([]);

  const session = active == null ? null : OBSERVER_ARC[active];
  const total = useMemo(() => (session ? 180 : 0), [session]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const open = (index: number) => {
    setActive(index);
    setSecondsLeft(180);
    setRunning(false);
    setAnswer("");
  };

  const finish = () => {
    if (active == null) return;
    setDone((prev) => (prev.includes(active) ? prev : [...prev, active]));
    setActive(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          to="/app/practice"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Practice
        </Link>

        <h1 className="mt-6 font-display text-3xl">The Observer in 3 sessions</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Meditation is not holding the mind still. These three sits look at what notices —
          body, emotion, and thought are seen as known, not as the knower.
        </p>

        {!session && (
          <div className="mt-6 space-y-3">
            {OBSERVER_ARC.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => open(index)}
                className="w-full rounded-2xl border border-border/40 bg-card/60 p-4 text-left transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {index + 1}. {item.title}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {done.includes(index) ? "done" : "3 min"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.teaching}</p>
              </button>
            ))}
          </div>
        )}

        {session && active != null && (
          <section className="mt-6 rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Session {active + 1} of {OBSERVER_ARC.length}
            </p>
            <h2 className="mt-1 text-xl font-medium">{session.title}</h2>

            <p className="mt-3 text-sm">{session.teaching}</p>

            <div className="mt-4 rounded-xl bg-muted/30 p-3 text-sm">{session.practice}</div>

            <div className="mt-4 flex items-center gap-3">
              <span className="font-mono text-2xl tabular-nums">
                {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
                {String(secondsLeft % 60).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSecondsLeft(total);
                  setRunning(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <label className="mt-5 block text-xs text-muted-foreground">
              {session.question}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Write what you actually noticed — not what you think you should say."
              />
            </label>

            <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Trap: {session.trap}
            </p>

            <div className="mt-4 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              Carry: {session.carry}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={finish}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Close this sit
              </button>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-full border border-border/50 px-4 py-2 text-sm"
              >
                Back
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
