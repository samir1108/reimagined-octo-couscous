/**
 * ARC RUN — one sit at a time.
 * Progress persists locally and (signed in) to `arc_progress`.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  completeArcSit,
  createProgress,
  getArc,
  isArcComplete,
  loadArcProgress,
  nextSit,
  recordArcSit,
  type ArcProgress,
  type ArcSit,
} from "@/lib/arcs";
import { recordSessionToHumanModel } from "@/lib/humanModel/ledger";

interface ArcRunPageProps {
  arcId?: string;
}

export default function ArcRunPage({ arcId }: ArcRunPageProps) {
  const params = useParams<{ arcId?: string }>();
  const id = arcId ?? params.arcId ?? "observer";
  const arc = useMemo(() => getArc(id), [id]);

  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ArcProgress>(() => createProgress(id));
  const [active, setActive] = useState<ArcSit | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProgress(createProgress(id));
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const uid = data.user?.id ?? null;
        if (cancelled) return;
        setUserId(uid);
        return loadArcProgress(id, uid);
      })
      .then((loaded) => {
        if (!cancelled && loaded) setProgress(loaded);
      })
      .catch(() => { /* local progress remains */ });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  if (!arc) {
    return (
      <main className="min-h-screen bg-background px-5 py-10 text-foreground">
        <p className="text-sm text-muted-foreground">Arc not found.</p>
        <Link to="/app/arcs" className="mt-3 inline-block text-sm underline">
          Back to arcs
        </Link>
      </main>
    );
  }

  const current = nextSit(arc, progress);
  const complete = isArcComplete(arc, progress);

  const openSit = (sit: ArcSit) => {
    setActive(sit);
    setSecondsLeft(sit.minutes * 60);
    setRunning(false);
    setAnswer("");
  };

  const finishSit = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await recordArcSit({
        userId,
        arcId: arc.id,
        sitIndex: active.index,
        quality: 0.8,
        feltShift: "same",
        evidence: { answerLength: answer.trim().length, minutes: active.minutes },
      });
      if (userId) {
        void recordSessionToHumanModel({
          userId,
          concept: active.concept,
          completed: true,
          qualityScore: 0.8,
          arcId: arc.id,
          sitIndex: active.index,
          note: `arc:${arc.id}:${active.index}`,
        });
      }
      setProgress((prev) => completeArcSit(arc, prev, active.index));
      setActive(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          to="/app/arcs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Arcs
        </Link>

        <h1 className="mt-6 font-display text-3xl">{arc.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{arc.subtitle}</p>

        <div className="mt-4 flex items-center gap-1.5">
          {arc.sits.map((sit) => {
            const done = progress.completed.includes(sit.index);
            return (
              <span
                key={sit.index}
                title={sit.title}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] ${
                  done
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : sit.index === current?.index
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/40 text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : sit.index}
              </span>
            );
          })}
          <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            {progress.completed.length}/{arc.sits.length} sits
          </span>
        </div>

        {complete && (
          <section className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm font-medium">Arc complete.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Five doors opened. The next arc should follow the same evidence, not a calendar.
            </p>
            <Link
              to="/app/arcs"
              className="mt-3 inline-block rounded-full border border-border/50 px-3 py-1.5 text-xs"
            >
              Choose the next arc
            </Link>
          </section>
        )}

        {!active && current && (
          <section className="mt-6 rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Sit {current.index} of {arc.sits.length}
            </p>
            <h2 className="mt-1 text-xl font-medium">{current.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{current.teaching}</p>
            <p className="mt-3 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              {current.minutes} min · {current.practice}
            </p>
            <button
              type="button"
              onClick={() => openSit(current)}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Begin this sit
            </button>
          </section>
        )}

        {active && (
          <section className="mt-6 rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Sit {active.index} of {arc.sits.length}
            </p>
            <h2 className="mt-1 text-xl font-medium">{active.title}</h2>
            <p className="mt-3 text-sm">{active.teaching}</p>

            <div className="mt-4 rounded-xl bg-muted/30 p-3 text-sm">{active.practiceText}</div>

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
                  setSecondsLeft(active.minutes * 60);
                  setRunning(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <label className="mt-5 block text-xs text-muted-foreground">
              {active.question}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Write what you actually noticed — not what you think you should say."
              />
            </label>

            <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Trap: {active.trap}
            </p>

            <div className="mt-3 rounded-xl bg-muted/30 px-3 py-2 text-xs">Carry: {active.carry}</div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={finishSit}
                disabled={saving}
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : "Complete this sit"}
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
