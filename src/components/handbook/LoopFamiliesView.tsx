import { LOOP_FAMILIES } from "@/data/handbook/loopFamilies";

export default function LoopFamiliesView() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground max-w-2xl">
        The 400+ loops in our library cluster into 12 families. Each family has the same neuroscience signature, the
        same origin pattern, and responds to the same kind of practice.
      </p>
      {LOOP_FAMILIES.map((f) => (
        <article key={f.slug} className="rounded-2xl border border-border/40 p-6">
          <h3 className="font-display text-2xl mb-3">{f.name}</h3>
          <div className="space-y-3 text-[15px] leading-relaxed">
            <p className="text-foreground/85"><span className="text-foreground/45 mr-2">Feels like:</span>{f.feels}</p>
            <p className="text-foreground/75"><span className="text-foreground/45 mr-2">Neuroscience:</span>{f.neuroscience}</p>
            <p className="text-foreground/75"><span className="text-foreground/45 mr-2">Origin:</span>{f.origin}</p>
            <p className="text-foreground/90"><span className="text-primary/70 mr-2">Way out:</span>{f.wayOut}</p>
            <p className="text-foreground/65 text-sm"><span className="text-foreground/40 mr-2">Path:</span>{f.pairedPath}</p>
            {f.exampleIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Example loop IDs: {f.exampleIds.join(", ")}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
