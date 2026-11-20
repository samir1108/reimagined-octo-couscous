/**
 * ARCS — catalog of cross-concept sequences.
 * Observer, Self-inquiry, and the four Paths at Level 1.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ARCS,
  arcPercent,
  arcStatusLabel,
  loadLocalArcProgress,
  type ArcProgress,
} from "@/lib/arcs";

export default function ArcsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, ArcProgress>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      const next: Record<string, ArcProgress> = {};
      for (const arc of ARCS) next[arc.id] = loadLocalArcProgress(arc.id, id);
      setProgress(next);
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          to="/app/practice"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Practice
        </Link>

        <h1 className="mt-6 font-display text-3xl">Practice arcs</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          An arc is a cross-concept sequence: five sits, five different doors. Observer starts with
          what you notice; the four paths start with what you love, know, do, or sit with.
        </p>

        <div className="mt-6 space-y-3">
          {ARCS.map((arc) => {
            const p = progress[arc.id];
            const percent = p ? arcPercent(arc, p) : 0;
            const label = p ? arcStatusLabel(arc, p) : "Not started";
            return (
              <Link
                key={arc.id}
                to={`/app/arcs/${arc.id}`}
                className="block rounded-2xl border border-border/40 bg-card/60 p-4 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{arc.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{arc.subtitle}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      {arc.family === "path" ? "Path · Level 1" : arc.family} · 5 sits · {label}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] text-muted-foreground">
          Progress is saved locally and, when signed in, to your arc ledger. You can leave and
          return; the next sit waits.
        </p>
      </div>
    </main>
  );
}
