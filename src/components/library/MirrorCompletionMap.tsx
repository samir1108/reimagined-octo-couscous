import { MIRROR_CHECKPOINTS } from "@/data/pre-journey/mirrors";

const ASSESSMENT_CHECKPOINTS = MIRROR_CHECKPOINTS.filter(
  (checkpoint) => checkpoint.kind !== "loop-map" && checkpoint.kind !== "coming-soon",
);
const DISTINCT_ASSESSMENT_CHECKPOINTS = ASSESSMENT_CHECKPOINTS.filter(
  (checkpoint, index, checkpoints) =>
    checkpoints.findIndex((item) => item.assessmentSlug === checkpoint.assessmentSlug) === index,
);

interface Props {
  completedSlugs: ReadonlySet<string>;
}

export function MirrorCompletionMap({ completedSlugs }: Props) {
  const completed = DISTINCT_ASSESSMENT_CHECKPOINTS.filter((checkpoint) =>
    completedSlugs.has(checkpoint.assessmentSlug),
  ).length;

  return (
    <section className="glass-card mb-6 rounded-2xl border border-primary/15 p-4" aria-labelledby="mirror-map-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="mirror-map-title" className="text-sm font-display font-semibold text-foreground">
            Your mirror map
          </h2>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Each point marks a distinct assessment checkpoint with a saved result.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border/40 px-2.5 py-1 text-[10px] tabular-nums text-muted-foreground">
          {completed} / {DISTINCT_ASSESSMENT_CHECKPOINTS.length}
        </span>
      </div>
      <svg
        viewBox="0 0 320 72"
        className="mt-3 h-16 w-full"
        role="img"
        aria-label={`${completed} of ${DISTINCT_ASSESSMENT_CHECKPOINTS.length} distinct mirror assessment checkpoints have saved results.`}
      >
        {DISTINCT_ASSESSMENT_CHECKPOINTS.map((checkpoint, index) => {
          const column = index % 20;
          const row = Math.floor(index / 20);
          const isCompleted = completedSlugs.has(checkpoint.assessmentSlug);
          return (
            <circle
              key={checkpoint.number}
              cx={11 + column * 15.65}
              cy={8 + row * 14}
              r={isCompleted ? 4.2 : 2.8}
              fill={isCompleted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.22)"}
              stroke={isCompleted ? "hsl(var(--primary) / 0.35)" : "none"}
              strokeWidth="2"
            >
              <title>{`Mirror ${checkpoint.number}: ${checkpoint.title}${isCompleted ? " — completed" : ""}`}</title>
            </circle>
          );
        })}
      </svg>
    </section>
  );
}
