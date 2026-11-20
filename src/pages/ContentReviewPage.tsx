/**
 * CONTENT REVIEW — 1-in-N sampling for generated lines and graph sessions.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Flag, Download } from "lucide-react";
import {
  generateLines,
  type LineForm,
  type LineLanguage,
} from "@/lib/contentGen";
import {
  buildSessionGraph,
  generateSession,
  GRAPH_CONCEPTS,
} from "@/lib/sessionGraph";
import { downloadText } from "@/lib/humanModel";
import {
  loadReviews,
  reviewStats,
  setReview,
  type ReviewStatus,
} from "@/lib/contentReview";

type Tab = "lines" | "sessions";

const FORMS: Array<LineForm | "all"> = [
  "all",
  "teaching",
  "instruction",
  "question",
  "carry",
  "myth",
  "warning",
];

const LANGUAGES: LineLanguage[] = ["en", "hi"];

const GRAPH = buildSessionGraph();

export default function ContentReviewPage() {
  const [tab, setTab] = useState<Tab>("lines");
  const [language, setLanguage] = useState<LineLanguage>("en");
  const [form, setForm] = useState<LineForm | "all">("all");
  const [reviews, setReviews] = useState<Record<string, ReviewStatus>>(() => loadReviews());

  const lines = useMemo(() => {
    const generated = generateLines({ count: 180, language });
    return form === "all" ? generated : generated.filter((line) => line.form === form);
  }, [language, form]);

  const sessions = useMemo(
    () =>
      GRAPH_CONCEPTS.map((concept) => {
        const familiarity = Object.fromEntries(
          GRAPH_CONCEPTS.map((item) => [item.id, item.id === concept.id ? 0 : 1]),
        );
        const capabilityLevels = Object.fromEntries(
          GRAPH_CONCEPTS.map((item) => [item.id, item.id === concept.id ? 0 : 5]),
        );
        return generateSession(GRAPH, { familiarity, capabilityLevels });
      }),
    [],
  );

  const stats = reviewStats(reviews);

  const review = (id: string, status: ReviewStatus) => {
    setReviews(setReview(id, status));
  };

  const exportReviews = () => {
    downloadText(
      "content-review.json",
      JSON.stringify({ generatedAt: new Date().toISOString(), reviews, stats }, null, 2),
      "application/json",
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <Link
          to="/app/practice"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Practice
        </Link>

        <h1 className="mt-6 font-display text-3xl">Content review</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Sample generated lines and graph sessions. Approved means the line is teachable; flagged
          means it needs a rewrite. Nothing here changes the live catalog yet.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["lines", "sessions"] as Tab[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                tab === id ? "border-primary/60 bg-primary/10" : "border-border/50 text-muted-foreground"
              }`}
            >
              {id}
            </button>
          ))}
          <span className="ml-2 text-[11px] text-muted-foreground">
            approved {stats.approved} · flagged {stats.flagged}
          </span>
          <button
            type="button"
            onClick={exportReviews}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export reviews
          </button>
        </div>

        {tab === "lines" && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {LANGUAGES.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLanguage(id)}
                  className={`rounded-full border px-3 py-1.5 text-xs uppercase ${
                    language === id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/50 text-muted-foreground"
                  }`}
                >
                  {id}
                </button>
              ))}
              {FORMS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm(id)}
                  className={`rounded-full border px-2.5 py-1.5 text-[11px] capitalize ${
                    form === id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/50 text-muted-foreground"
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {lines.slice(0, 80).map((line) => {
                const status = reviews[line.id];
                return (
                  <div
                    key={line.id}
                    className="rounded-xl border border-border/40 bg-card/60 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm">{line.text}</p>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => review(line.id, "approved")}
                          className={`rounded-full border p-1.5 ${
                            status === "approved"
                              ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                              : "border-border/50 text-muted-foreground"
                          }`}
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => review(line.id, "flagged")}
                          className={`rounded-full border p-1.5 ${
                            status === "flagged"
                              ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                              : "border-border/50 text-muted-foreground"
                          }`}
                          title="Flag"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      {line.concept} · {line.form} · L{line.level} · {line.language}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "sessions" && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3">Target</th>
                  <th className="py-1.5 pr-3">Generated</th>
                  <th className="py-1.5 pr-3">Intent</th>
                  <th className="py-1.5 pr-3">Min</th>
                  <th className="py-1.5 pr-3">Arc</th>
                  <th className="py-1.5">Path</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((spec) => (
                  <tr key={spec.concept} className="border-t border-border/30">
                    <td className="py-1.5 pr-3">{spec.gap.id}</td>
                    <td className="py-1.5 pr-3 font-medium">{spec.concept}</td>
                    <td className="py-1.5 pr-3">{spec.intent}</td>
                    <td className="py-1.5 pr-3">{spec.minutes}</td>
                    <td className="py-1.5 pr-3">{spec.arcId ?? "—"}</td>
                    <td className="py-1.5 text-muted-foreground">{spec.path.join(" → ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
