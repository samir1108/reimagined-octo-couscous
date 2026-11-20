import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PATHS, type PathEntry } from "@/data/handbook/paths";

const FIT_GRAD: Record<string, string> = {
  karma: "from-orange-500/30 to-amber-700/10",
  bhakti: "from-rose-500/30 to-pink-700/10",
  jnana: "from-indigo-500/30 to-violet-700/10",
  raja: "from-sky-500/30 to-blue-700/10",
  kriya: "from-emerald-500/30 to-teal-700/10",
  tantra: "from-fuchsia-500/30 to-purple-700/10",
};

export default function PathsView() {
  const [active, setActive] = useState<string>(PATHS[0].slug);
  const path = PATHS.find((p) => p.slug === active) ?? PATHS[0];

  return (
    <div>
      {/* Path selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8">
        {PATHS.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActive(p.slug)}
            className={[
              "rounded-xl py-3 px-2 text-center border transition bg-gradient-to-br",
              FIT_GRAD[p.slug],
              active === p.slug ? "border-primary/60 ring-1 ring-primary/40" : "border-border/40 hover:border-primary/30",
            ].join(" ")}
          >
            <div className="font-display text-sm md:text-base">{p.name.replace(" Yoga", "")}</div>
          </button>
        ))}
      </div>

      <PathDetail path={path} />
    </div>
  );
}

function PathDetail({ path }: { path: PathEntry }) {
  return (
    <section className="rounded-3xl border border-border/40 overflow-hidden">
      <div className={`bg-gradient-to-br ${FIT_GRAD[path.slug]} px-6 md:px-10 py-10`}>
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-2">{path.sanskrit}</p>
        <h2 className="font-display text-3xl md:text-4xl mb-3">{path.name}</h2>
        <p className="text-lg md:text-xl text-foreground/85 italic mb-6">"{path.essence}"</p>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-foreground/80">
          <div><span className="text-foreground/50">Origin:</span> {path.origin}</div>
          <div><span className="text-foreground/50">For whom:</span> {path.forWhom}</div>
          <div><span className="text-foreground/50">Best bands:</span> {path.bestBands}</div>
          <div><span className="text-foreground/50">Pairs with:</span> {path.pairsWellWith.join(", ")}</div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-10 space-y-10">
        <Block title="The 7 Levels" subtitle="L0 → L6. Each level: markers, the one practice that defines it, and the graduation signal.">
          <ol className="space-y-3">
            {path.levels.map((lv) => (
              <li key={lv.level} className="rounded-xl border border-border/40 p-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display text-primary text-lg">L{lv.level}</span>
                  <span className="font-display text-foreground text-base">{lv.name}</span>
                </div>
                <div className="text-sm text-foreground/75 mb-2">
                  <span className="text-foreground/45 mr-2">Markers:</span>
                  {lv.markers.join(" · ")}
                </div>
                <div className="text-sm text-foreground/85 mb-1">
                  <span className="text-primary/70 mr-2">Practice:</span>
                  {lv.practice}
                </div>
                <div className="text-sm text-foreground/65 italic">
                  <span className="text-foreground/45 mr-2 not-italic">Graduation:</span>
                  {lv.graduation}
                </div>
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Traps">
          <ul className="space-y-2 text-[15px] text-foreground/80">
            {path.traps.map((t, i) => (
              <li key={i} className="flex gap-3"><span className="text-destructive/70 mt-1">×</span><span>{t}</span></li>
            ))}
          </ul>
        </Block>

        <Block title="Famous practitioners">
          <div className="flex flex-wrap gap-2">
            {path.famous.map((f) => (
              <span key={f} className="px-3 py-1 rounded-full border border-border/40 text-sm text-foreground/85">{f}</span>
            ))}
          </div>
        </Block>

        <div className="border-t border-border/30 pt-6 text-center">
          <p className="italic text-foreground/80 text-base">"{path.oneSutra.text}"</p>
          <p className="text-xs text-muted-foreground mt-1">— {path.oneSutra.source}</p>
        </div>
      </div>
    </section>
  );
}

function Block({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-start justify-between gap-4 text-left mb-4">
        <div>
          <h3 className="font-display text-xl md:text-2xl">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-5 h-5 mt-1 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}
