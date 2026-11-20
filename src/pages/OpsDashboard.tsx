import { useMemo } from "react";
import { useOpsMetrics } from "@/hooks/useOpsMetrics";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
      <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

export default function OpsDashboard() {
  const { funnel, steps, content, archetypes, cost, crisis, retention, loading, error, refresh } =
    useOpsMetrics();

  const funnel14 = useMemo(() => funnel.slice(0, 14), [funnel]);
  const worstSteps = useMemo(
    () => [...steps].filter((s) => s.shown >= 3).sort((a, b) => (a.completion_pct ?? 0) - (b.completion_pct ?? 0)).slice(0, 6),
    [steps],
  );
  const topContent = useMemo(
    () => [...content].filter((c) => c.attempts >= 3).sort((a, b) => (b.completion_pct ?? 0) - (a.completion_pct ?? 0)).slice(0, 8),
    [content],
  );
  const bestArch = useMemo(
    () => [...archetypes].filter((a) => a.n >= 2).sort((a, b) => (b.ucb ?? 0) - (a.ucb ?? 0)).slice(0, 6),
    [archetypes],
  );
  const costToday = useMemo(
    () => cost.reduce((sum, row) => sum + (row.cost_paise ?? 0), 0),
    [cost],
  );
  const crisis7 = useMemo(
    () => crisis.reduce((sum, row) => sum + (row.events ?? 0), 0),
    [crisis],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Ops</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Brain, content and safety read models.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-muted"
        >
          Refresh
        </button>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Session funnel (14 days)">
            {funnel14.length === 0 ? (
              <Empty label="No sittings recorded yet." />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {funnel14.map((r) => (
                    <tr key={r.day} className="border-t border-border/40">
                      <td className="py-1.5 text-muted-foreground">{r.day?.slice(0, 10)}</td>
                      <td className="py-1.5 text-right">{r.completed}/{r.started}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.completion_pct ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Weakest steps">
            {worstSteps.length === 0 ? (
              <Empty label="No step events yet." />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {worstSteps.map((r) => (
                    <tr key={`${r.kind}-${r.step_index}`} className="border-t border-border/40">
                      <td className="py-1.5">{r.kind} #{r.step_index + 1}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.completion_pct ?? 0}%</td>
                      <td className="py-1.5 text-right text-muted-foreground">{r.shown} shown</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Content that lands (min 3 attempts)">
            {topContent.length === 0 ? (
              <Empty label="Not enough completions yet." />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {topContent.map((r) => (
                    <tr key={r.ingredient_id} className="border-t border-border/40">
                      <td className="py-1.5">{r.label ?? r.ingredient_id}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.completion_pct ?? 0}%</td>
                      <td className="py-1.5 text-right text-muted-foreground">q {r.avg_quality ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Archetype UCB (min 2 scored)">
            {bestArch.length === 0 ? (
              <Empty label="No scored sittings yet." />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {bestArch.map((r) => (
                    <tr key={r.archetype} className="border-t border-border/40">
                      <td className="py-1.5">{r.archetype}</td>
                      <td className="py-1.5 text-right tabular-nums">ucb {r.ucb ?? 0}</td>
                      <td className="py-1.5 text-right text-muted-foreground">n {r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Retention (weekly)">
            {retention.length === 0 ? (
              <Empty label="No engagement data yet." />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {retention.slice(0, 8).map((r) => (
                    <tr key={r.week} className="border-t border-border/40">
                      <td className="py-1.5 text-muted-foreground">{r.week?.slice(0, 10)}</td>
                      <td className="py-1.5 text-right">{r.returning_users}/{r.active_users}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.returning_pct ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Safety and spend">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crisis events (logged)</span>
                <span className="tabular-nums">{crisis7}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI cost (paise)</span>
                <span className="tabular-nums">{Math.round(costToday)}</span>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </main>
  );
}
