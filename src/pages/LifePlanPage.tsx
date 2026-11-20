/**
 * LIFE PLAN — day, season, decade.
 * Generated from the 12-layer model, editable by rerunning, exportable.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Printer, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  buildHumanModel,
  downloadText,
  readHumanModel,
  type HumanModel,
} from "@/lib/humanModel";
import {
  buildLifePlanBundle,
  lifePlanToMarkdown,
  loadLifePlan,
  saveLifePlan,
  type DayPlan,
  type LifePlanBundle,
} from "@/lib/lifePlan";

type Tab = "day" | "season" | "decade";

export default function LifePlanPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [model, setModel] = useState<HumanModel | null>(null);
  const [bundle, setBundle] = useState<LifePlanBundle | null>(null);
  const [tab, setTab] = useState<Tab>("day");
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DayPlan | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const uid = data.user?.id ?? null;
        if (cancelled) return;
        setUserId(uid);
        const nextModel = await readHumanModel(uid);
        if (cancelled) return;
        setModel(nextModel);
        const saved = loadLifePlan(uid);
        setBundle(saved ?? buildLifePlanBundle(nextModel));
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = buildHumanModel({ userId: "anonymous" });
        setModel(fallback);
        setBundle(buildLifePlanBundle(fallback));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canSave = useMemo(() => Boolean(userId && bundle), [userId, bundle]);

  const regenerate = () => {
    if (!model) return;
    const next = buildLifePlanBundle(model, new Date());
    setBundle(next);
    setStatus("Regenerated from the current model.");
  };

  const save = () => {
    if (!userId || !bundle) return;
    saveLifePlan(userId, bundle);
    setStatus("Saved to this device.");
  };

  const exportMarkdown = () => {
    if (!bundle) return;
    downloadText(
      `practice-plan-${bundle.day.date}.md`,
      lifePlanToMarkdown(bundle),
      "text/markdown",
    );
  };

  const startEdit = () => {
    if (!bundle) return;
    setDraft({ ...bundle.day });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!bundle || !draft) return;
    const next = { ...bundle, day: draft };
    setBundle(next);
    if (userId) saveLifePlan(userId, next);
    setEditing(false);
    setStatus("Day plan updated.");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          to="/app/self-model"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> My 12-layer model
        </Link>

        <h1 className="mt-6 font-display text-3xl">My practice plan</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Three horizons, one model. The day is a dose, the season is a curriculum, the decade is a
          direction — not a promise.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["day", "season", "decade"] as Tab[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                tab === id
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/50 text-muted-foreground"
              }`}
            >
              {id}
            </button>
          ))}
          <button
            type="button"
            onClick={regenerate}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </button>
          <button
            type="button"
            onClick={exportMarkdown}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
          {tab === "day" && (
            <button
              type="button"
              onClick={editing ? saveEdit : startEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" /> {editing ? "Save day" : "Edit day"}
            </button>
          )}
          {canSave && (
            <button
              type="button"
              onClick={save}
              className="rounded-full border border-border/50 px-3 py-1.5 text-xs"
            >
              Save
            </button>
          )}
        </div>

        {status && (
          <p className="mt-3 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {status}
          </p>
        )}

        {bundle && tab === "day" && (
          <section className="mt-5 rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {bundle.day.date}
            </p>
            {editing && draft ? (
              <div className="mt-2 space-y-2 text-sm">
                {([
                  ["title", "Title"],
                  ["morning", "Morning"],
                  ["midday", "Midday"],
                  ["evening", "Evening"],
                  ["carry", "Carry"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="block text-xs text-muted-foreground">
                    {label}
                    <input
                      value={draft[key]}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border/50 bg-background px-2 py-1.5 text-sm text-foreground"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <>
                <h2 className="mt-1 text-xl font-medium">{bundle.day.title}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><span className="text-muted-foreground">Morning:</span> {bundle.day.morning}</li>
                  <li><span className="text-muted-foreground">Midday:</span> {bundle.day.midday}</li>
                  <li><span className="text-muted-foreground">Evening:</span> {bundle.day.evening}</li>
                  <li><span className="text-muted-foreground">Carry:</span> {bundle.day.carry}</li>
                </ul>
              </>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              {bundle.day.basis.join(" · ")}
            </p>
          </section>
        )}

        {bundle && tab === "season" && (
          <section className="mt-5 rounded-2xl border border-border/40 bg-card/60 p-5">
            <h2 className="text-xl font-medium">{bundle.season.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {bundle.season.startDate} · {bundle.season.days} days
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-3">Week</th>
                    <th className="py-1 pr-3">Focus</th>
                    <th className="py-1 pr-3">Sits</th>
                    <th className="py-1">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.season.weeks.map((week) => (
                    <tr key={week.week} className="border-t border-border/30">
                      <td className="py-1.5 pr-3">{week.week}</td>
                      <td className="py-1.5 pr-3">{week.focus}</td>
                      <td className="py-1.5 pr-3">{week.sessions}</td>
                      <td className="py-1.5 text-muted-foreground">{week.review}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Gates: {bundle.season.gates.join(" · ")}
            </p>
          </section>
        )}

        {bundle && tab === "decade" && (
          <section className="mt-5 rounded-2xl border border-border/40 bg-card/60 p-5">
            <h2 className="text-xl font-medium">{bundle.decade.title}</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {bundle.decade.years.map((year) => (
                <li key={year.year} className="flex gap-3">
                  <span className="w-10 shrink-0 text-[11px] text-muted-foreground">
                    Y{year.year}
                  </span>
                  <span>
                    <span className="font-medium">{year.theme}</span>
                    <span className="text-muted-foreground"> · {year.practice}</span>
                    <span className="block text-[11px] text-muted-foreground">{year.evidence}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Non-negotiables
              </p>
              <ul className="mt-1 list-disc pl-4">
                {bundle.decade.nonNegotiables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {bundle && (
          <p className="mt-5 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
            {bundle.disclaimer}
          </p>
        )}
      </div>
    </main>
  );
}
