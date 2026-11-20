import { DIMENSIONS } from "@/data/handbook/dimensions";

export default function DimensionsView() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Six dimensions the consciousness engine tracks. Each one moves independently. A balanced human is one in which
        all six are alive — not just the favored one.
      </p>
      {DIMENSIONS.map((d) => (
        <article key={d.slug} className="rounded-2xl border border-border/40 p-6">
          <h3 className="font-display text-2xl mb-2">{d.name}</h3>
          <p className="text-[15px] italic text-foreground/85 mb-4">"{d.essence}"</p>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-foreground/45 uppercase tracking-[0.2em] text-[10px] mb-2">Low markers</div>
              <ul className="space-y-1">
                {d.lowMarkers.map((m, i) => <li key={i} className="text-foreground/75">· {m}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-primary/70 uppercase tracking-[0.2em] text-[10px] mb-2">High markers</div>
              <ul className="space-y-1">
                {d.highMarkers.map((m, i) => <li key={i} className="text-foreground/85">· {m}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/30 text-sm">
            <div className="text-foreground/85">
              <span className="text-foreground/45 mr-2">Moves it:</span>
              {d.movesItBy.join(" · ")}
            </div>
            <div className="text-foreground/65 mt-1">
              <span className="text-foreground/45 mr-2">Skills:</span>
              {d.pairedSkills.join(", ")}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
