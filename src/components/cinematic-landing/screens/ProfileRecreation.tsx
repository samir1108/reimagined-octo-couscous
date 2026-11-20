import { BAND_ARCHETYPES, DIMENSIONS, SPEED_PROFILES } from "@/types/consciousness";

/**
 * ProfileRecreation — what the system currently believes about the user.
 *
 * Every value here is the product's own working model
 * (`src/types/consciousness.ts`) and the loop names come from the real loop
 * library (`src/data/loops.ts`). Each inference is presented as a claim the
 * user can see — and dispute.
 */
const BAND_INDEX = 2;

const ACTIVE_LOOPS = [
  { name: "People-Pleasing", dimension: "emotion", severity: "moderate" },
  { name: "Achievement Treadmill", dimension: "thought", severity: "moderate" },
];

export default function ProfileRecreation() {
  const band = BAND_ARCHETYPES[BAND_INDEX];
  const profile = SPEED_PROFILES[1];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0a0807] text-foreground">
      <header className="flex items-center justify-between px-5 pt-5">
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.3em] text-primary/70">Your profile</p>
          <h3 className="mt-1.5 text-base font-medium md:text-lg">Samir</h3>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-primary/85">
          {profile.label}
        </span>
      </header>

      <div className="mt-4 flex-1 space-y-3 overflow-hidden px-5">
        <section className="rounded-2xl border border-foreground/10 bg-white/[0.03] p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[0.55rem] uppercase tracking-[0.28em] text-foreground/45">
              Current band
            </p>
            <span className="font-mono text-[0.6rem] text-foreground/40">Band 2.5</span>
          </div>
          <p className="mt-1.5 text-sm font-medium uppercase tracking-[0.14em] text-foreground/90">
            {band.name}
          </p>
          <p className="mt-1 text-xs italic text-foreground/50">&ldquo;{band.coreState}&rdquo;</p>
          <p className="mt-2 text-[0.65rem] leading-relaxed text-foreground/45">
            {band.engineApproach}
          </p>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-white/[0.03] p-4">
          <p className="text-[0.55rem] uppercase tracking-[0.28em] text-foreground/45">
            Dimension emphasis
          </p>
          <div className="mt-2.5 space-y-2">
            {DIMENSIONS.map((dimension, index) => {
              const score = [3.4, 2.8, 2.1, 2.6, 1.9, 3.1][index] ?? 2;
              const weakest = score <= 2.1;
              return (
                <div key={dimension.id}>
                  <div className="flex items-baseline justify-between text-[0.6rem]">
                    <span className="uppercase tracking-[0.12em] text-foreground/70">
                      {dimension.id}
                      {weakest ? (
                        <span className="ml-1.5 text-primary/70">needs work</span>
                      ) : null}
                    </span>
                    <span className="font-mono text-foreground/40">{score.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className={`h-full rounded-full ${weakest ? "bg-primary/80" : "bg-foreground/35"}`}
                      style={{ width: `${Math.min(100, (score / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-foreground/10 bg-white/[0.03] p-4">
          <p className="text-[0.55rem] uppercase tracking-[0.28em] text-foreground/45">
            Active patterns
          </p>
          <ul className="mt-2 space-y-1.5">
            {ACTIVE_LOOPS.map((loop) => (
              <li
                key={loop.name}
                className="flex items-baseline justify-between gap-3 border-b border-foreground/[0.06] pb-1 text-[0.65rem] last:border-0"
              >
                <span className="text-foreground/85">{loop.name}</span>
                <span className="shrink-0 text-[0.55rem] uppercase tracking-[0.12em] text-foreground/40">
                  {loop.dimension} &middot; {loop.severity}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="px-5 pb-5">
        <p className="text-[0.55rem] leading-relaxed text-foreground/30">
          Every inference here is a claim you can see &mdash; and dispute. Bands, dimensions and risk
          indicators are inferred from what you report, not measured.
        </p>
      </div>
    </div>
  );
}
