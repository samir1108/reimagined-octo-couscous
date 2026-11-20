import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, History } from "lucide-react";
import { useConstellation } from "@/hooks/useConstellation";
import { PRACTICES, PRACTICE_META, type Practice } from "@/lib/sutra/practices";
import { Button } from "@/design-system";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";

const PHASE_LABEL: Record<string, string> = {
  diverge: "Diverge — exploring many paths",
  "t-shape": "T-Shape — depth in some, breadth across all",
  breathe: "Breathe — flowing between paths",
  integrate: "Integrate — many paths becoming one",
};

export default function ConstellationPage() {
  const { constellation, loading, recompute } = useConstellation();

  useEffect(() => {
    if (!loading && !constellation) {
      recompute();
    }
  }, [loading, constellation, recompute]);

  const groupedPractices = (() => {
    if (!constellation) return { primary: [], secondary: [], dormant: [] };
    const groups: Record<string, Practice[]> = { primary: [], secondary: [], dormant: [] };
    for (const p of PRACTICES) {
      groups[constellation.statuses[p]].push(p);
    }
    // Sort within each group by weight desc
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => constellation.weights[b] - constellation.weights[a]);
    }
    return groups;
  })();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-light text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
              Your Practice Constellation
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your unique blend across 12 paths — never zero, always evolving.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" asChild>
              <Link to="/app/constellation/evolution">
                <History className="mr-2 h-4 w-4" />
                Evolution
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => recompute()}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Recompute
            </Button>
          </div>
        </motion.div>

        {loading && !constellation && (
          <Card className="p-8 text-center text-muted-foreground">
            Reading your constellation…
          </Card>
        )}

        {constellation && (
          <>
            {/* Phase */}
            <Card className="mb-6 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current phase</div>
              <div className="mt-1 text-base text-foreground">
                {PHASE_LABEL[constellation.phase] || constellation.phase}
              </div>
            </Card>

            {/* Primary */}
            {groupedPractices.primary.length > 0 && (
              <Section title="Primary — your strongest pull" practices={groupedPractices.primary} constellation={constellation} variant="primary" />
            )}

            {/* Secondary */}
            {groupedPractices.secondary.length > 0 && (
              <Section title="Secondary — warming up" practices={groupedPractices.secondary} constellation={constellation} variant="secondary" />
            )}

            {/* Dormant */}
            {groupedPractices.dormant.length > 0 && (
              <Section title="Dormant — latent, waiting" practices={groupedPractices.dormant} constellation={constellation} variant="dormant" />
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              No path is ever zero. Dormant practices may rise when life calls them.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title, practices, constellation, variant,
}: {
  title: string;
  practices: Practice[];
  constellation: NonNullable<ReturnType<typeof useConstellation>["constellation"]>;
  variant: "primary" | "secondary" | "dormant";
}) {
  const tone =
    variant === "primary" ? "border-primary/40 bg-primary/5"
    : variant === "secondary" ? "border-border bg-card"
    : "border-border/50 bg-muted/30 opacity-70";

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-2">
        {practices.map((p) => {
          const meta = PRACTICE_META[p];
          const w = constellation.weights[p];
          const lvl = constellation.levels[p];
          return (
            <Card key={p} className={`p-4 ${tone}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <div className="font-medium text-foreground">{meta.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {meta.sanskrit && <span className="italic">{meta.sanskrit}</span>}
                      {meta.sanskrit && " · "}
                      {meta.description}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={variant === "primary" ? "default" : "outline"}>
                    {(w * 100).toFixed(0)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">L{lvl}/{meta.maxLevel}</span>
                </div>
              </div>
              {/* Weight bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, w * 100 * 3)}%` }}
                  transition={{ duration: 0.6 }}
                  className={
                    variant === "primary" ? "h-full bg-primary"
                    : variant === "secondary" ? "h-full bg-foreground/40"
                    : "h-full bg-muted-foreground/30"
                  }
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
