/**
 * HumanModelPage — "My 12-layer model".
 * The private encyclopedia: state, evidence, trajectory, and the 1/3/10-year
 * estimate under three practice scenarios. Estimates, not fate.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { chakraReadiness } from "@/lib/prescription";
import {
  HUMAN_LAYERS,
  HUMAN_MODEL_DISCLAIMER,
  applyOutcome,
  buildHumanModel,
  buildMemoryDigest,
  downloadText,
  humanModelToJson,
  humanModelToMarkdown,
  projectHumanModel,
  readHumanModel,
  type HumanModel,
  type TrajectoryScenario,
} from "@/lib/humanModel";

const SCENARIOS: Array<{ id: TrajectoryScenario; label: string }> = [
  { id: "default", label: "No change" },
  { id: "practice", label: "Current practice" },
  { id: "intensive", label: "Intensive" },
];

export default function HumanModelPage() {
  const [model, setModel] = useState<HumanModel | null>(null);
  const [scenario, setScenario] = useState<TrajectoryScenario>("practice");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const uid = data.user?.id ?? null;
        setUserId(uid);
        return readHumanModel(uid);
      })
      .then((next) => {
        if (!cancelled) setModel(next);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load your model — showing an empty template.");
        setModel(buildHumanModel({ userId: "anonymous" }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const projection = useMemo(
    () => (model ? projectHumanModel(model, scenario) : null),
    [model, scenario],
  );
  const energy = useMemo(() => (model ? chakraReadiness(model) : null), [model]);
  const digest = useMemo(() => (model ? buildMemoryDigest(model) : null), [model]);

  const preview = (layerId: (typeof HUMAN_LAYERS)[number]["id"]) => {
    if (!model) return;
    setModel(
      applyOutcome(model, {
        layer: layerId,
        concept: "observation",
        completed: true,
        feltShift: "lighter",
        qualityScore: 0.85,
        note: "preview",
      }),
    );
  };

  if (!model || !projection) {
    return (
      <main className="min-h-screen bg-background px-5 py-10 text-foreground">
        <p className="text-sm text-muted-foreground">Loading your model…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <Link
          to="/app/practice"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Practice
        </Link>

        <h1 className="mt-6 font-display text-3xl">My 12-layer model</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          One living document about you: body, emotion, thought, identity, behavior, relationships,
          work, time, meaning, environment, history, and potential. Every number carries evidence.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/40 bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Weakest</p>
            <p className="mt-1 text-sm font-medium capitalize">{model.summary.weakest}</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Strongest</p>
            <p className="mt-1 text-sm font-medium capitalize">{model.summary.strongest}</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Readiness</p>
            <p className="mt-1 text-sm font-medium">{Math.round(model.summary.readiness * 100)}%</p>
          </div>
        </div>

        {energy && (
          <div className="mt-3 rounded-2xl border border-border/40 bg-card/60 px-3 py-2 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Energy readiness
            </span>
            <span className="ml-2 font-medium">{energy.label}</span>
            <span className="ml-2 text-muted-foreground">{energy.note}</span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.id)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                scenario === s.id
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/50 text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {userId && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                const rebuilt = await readHumanModel(userId, { force: true });
                setModel(rebuilt);
              }}
              className="rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
            >
              Rebuild from evidence
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(
                  `human-model-${model.builtAt.slice(0, 10)}.json`,
                  humanModelToJson(model),
                  "application/json",
                )
              }
              className="rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(
                  `human-model-${model.builtAt.slice(0, 10)}.md`,
                  humanModelToMarkdown(model, projection.layers),
                  "text/markdown",
                )
              }
              className="rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
            >
              Export Markdown
            </button>
            <Link
              to="/app/plan"
              className="rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
            >
              Practice plan →
            </Link>
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {error}
          </p>
        )}

        <div className="mt-5 space-y-2">
          {HUMAN_LAYERS.map((meta) => {
            const layer = model.layers[meta.id];
            const future = projection.layers[meta.id];
            const Icon =
              layer.trajectory === "rising"
                ? ArrowUpRight
                : layer.trajectory === "declining"
                  ? ArrowDownRight
                  : Minus;
            return (
              <div
                key={meta.id}
                className="rounded-2xl border border-border/40 bg-card/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{meta.question}</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-lg font-medium tabular-nums">
                      {Math.round(layer.state * 100)}
                    </span>
                    <Icon
                      className={`h-4 w-4 ${
                        layer.trajectory === "rising"
                          ? "text-emerald-500"
                          : layer.trajectory === "declining"
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.round(layer.state * 100)}%` }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                  <span>{layer.evidence.length} evidence</span>
                  <span>confidence {Math.round(layer.confidence * 100)}%</span>
                  <span>
                    1y {Math.round(future.y1.mid * 100)} · 3y {Math.round(future.y3.mid * 100)} · 10y{" "}
                    {Math.round(future.y10.mid * 100)}
                  </span>
                  <button
                    type="button"
                    onClick={() => preview(meta.id)}
                    className="rounded-full border border-border/50 px-2 py-0.5 text-foreground/70 hover:bg-muted/40"
                  >
                    simulate one sit
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          {HUMAN_MODEL_DISCLAIMER}
        </p>

        {digest && (
          <details className="mt-3 rounded-2xl border border-border/40 bg-card/60 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium">
              Memory digest · what to keep
            </summary>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {digest.entries.map((entry) => (
                <li key={entry.layer}>
                  <span className="font-medium text-foreground/80">{entry.layer}:</span>{" "}
                  {entry.line}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </main>
  );
}
