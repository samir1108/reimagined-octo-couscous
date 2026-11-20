import { GURUS } from "@/data/handbook/gurus";

export default function GurusView() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {GURUS.map((g) => (
        <article key={g.slug} className="rounded-2xl border border-border/40 p-6 flex flex-col">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display text-2xl">{g.name}</h3>
            <span className="text-xs text-muted-foreground">{g.era}</span>
          </div>
          <p className="text-xs text-primary/80 mb-3">{g.lineage}</p>
          <p className="text-[15px] italic text-foreground/85 mb-4">"{g.oneLine}"</p>

          <p className="text-sm text-foreground/75 mb-3"><span className="text-foreground/45 mr-2">Story:</span>{g.story}</p>
          <p className="text-sm text-foreground/85 mb-3"><span className="text-primary/70 mr-2">Signature:</span>{g.signature}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground/65 mb-4">
            <div><span className="text-foreground/40">Meets you at:</span> {g.forBand}</div>
            <div><span className="text-foreground/40">Brain:</span> {g.forBrain}</div>
          </div>

          {g.loops.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {g.loops.map((l) => (
                <span key={l} className="px-2 py-0.5 rounded-full text-[10px] border border-border/40 text-foreground/70">{l}</span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-border/30 text-xs text-foreground/70 italic">
            "{g.oneSutra.text}"
            <div className="text-muted-foreground not-italic mt-1">— {g.oneSutra.source}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
