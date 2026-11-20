import { DIMENSIONS, BAND_ARCHETYPES } from "@/types/consciousness";

/**
 * ConsciousnessMapRecreation — the six-dimension map.
 *
 * Uses the product's real model (`src/types/consciousness.ts`):
 *   - the six DimensionIds and their canonical labels
 *   - the 11-band archetype list the engine actually assigns
 *
 * The numbers shown are illustrative of the working model, not measurements.
 */
const BAND_INDEX = 2;

export default function ConsciousnessMapRecreation() {
  const band = BAND_ARCHETYPES[BAND_INDEX];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0a0807] text-foreground">
      <header className="px-5 pt-5">
        <p className="text-[0.55rem] uppercase tracking-[0.3em] text-primary/70">
          The Consciousness Map
        </p>
        <h3 className="mt-1.5 text-base font-medium md:text-lg">
          {band.name} &mdash; {band.title}
        </h3>
        <p className="mt-1 text-xs italic text-foreground/50">&ldquo;{band.coreState}&rdquo;</p>
      </header>

      <div className="mt-4 flex flex-1 items-center justify-center px-5">
        <div className="relative aspect-square w-full max-w-[240px]">
          <div className="absolute inset-[4%] rounded-full border border-foreground/10" />
          <div className="absolute inset-[18%] rounded-full border border-primary/15" />
          <div className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle,rgba(255,244,210,0.55)_0%,rgba(251,191,36,0.2)_50%,transparent_78%)]" />
          {DIMENSIONS.map((dimension, index) => {
            const angle = (index / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 44;
            const top = 50 + Math.sin(angle) * 44;
            const score = [3.4, 2.8, 2.1, 2.6, 1.9, 3.1][index] ?? 2;
            return (
              <div
                key={dimension.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span className="mx-auto block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(251,191,36,0.85)]" />
                <span className="mt-1.5 block whitespace-nowrap text-[0.55rem] uppercase tracking-[0.14em] text-foreground/70">
                  {dimension.icon} {dimension.id}
                </span>
                <span className="mt-0.5 block font-mono text-[0.55rem] text-foreground/40">
                  {score.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5">
        <p className="text-[0.55rem] uppercase tracking-[0.28em] text-foreground/45">
          The six dimensions
        </p>
        <ul className="mt-2 space-y-1.5">
          {DIMENSIONS.map((dimension) => (
            <li
              key={dimension.id}
              className="flex items-baseline gap-2 border-b border-foreground/[0.06] pb-1 text-[0.65rem] leading-snug"
            >
              <span className="w-20 shrink-0 uppercase tracking-[0.12em] text-foreground/80">
                {dimension.label}
              </span>
              <span className="text-foreground/45">{dimension.description}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.55rem] leading-relaxed text-foreground/30">
          Band, dimension emphasis and limits are the product&rsquo;s own working model, inferred
          from what you report &mdash; not clinical or scientific measurement.
        </p>
      </div>
    </div>
  );
}
