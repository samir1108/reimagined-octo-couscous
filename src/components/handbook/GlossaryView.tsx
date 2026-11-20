import { useMemo, useState } from "react";
import { GLOSSARY, type GlossaryDomain } from "@/data/handbook/glossary";

const DOMAINS: Array<{ key: GlossaryDomain | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "sanskrit", label: "Sanskrit" },
  { key: "neuroscience", label: "Neuroscience" },
  { key: "psychology", label: "Psychology" },
  { key: "practice", label: "Practice" },
];

export default function GlossaryView() {
  const [domain, setDomain] = useState<GlossaryDomain | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return GLOSSARY
      .filter((g) => (domain === "all" || g.domain === domain))
      .filter((g) => q === "" || g.term.toLowerCase().includes(q.toLowerCase()) || g.shortDef.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [domain, q]);

  return (
    <div>
      <div className="mb-6 space-y-4">
        <input
          type="search"
          placeholder="Search glossary…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDomain(d.key)}
              className={[
                "px-3 py-1.5 rounded-full text-xs border transition",
                domain === d.key ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 text-foreground/75 hover:border-primary/30",
              ].join(" ")}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} terms</div>
      </div>

      <ul className="divide-y divide-border/40">
        {filtered.map((g) => (
          <li key={g.term} className="py-4">
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="font-display text-lg text-foreground">{g.term}</h3>
              {g.pronunciation && <span className="text-xs text-muted-foreground italic">{g.pronunciation}</span>}
              <span className="text-[10px] uppercase tracking-wider text-primary/70">{g.domain}</span>
            </div>
            <p className="text-[15px] text-foreground/85 mb-1">{g.shortDef}</p>
            <p className="text-sm text-foreground/65 leading-relaxed">{g.longDef}</p>
            {g.seeAlso && g.seeAlso.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">See also: {g.seeAlso.join(", ")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
