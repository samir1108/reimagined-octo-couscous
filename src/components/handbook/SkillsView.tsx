import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SKILLS, type SkillEntry } from "@/data/handbook/skills";

export default function SkillsView() {
  const [active, setActive] = useState<string>(SKILLS[0].slug);
  const skill = SKILLS.find((s) => s.slug === active) ?? SKILLS[0];
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {SKILLS.map((s) => (
          <button
            key={s.slug}
            onClick={() => setActive(s.slug)}
            className={[
              "px-3 py-1.5 rounded-full text-sm border transition",
              active === s.slug ? "border-primary/60 bg-primary/10 text-primary" : "border-border/40 text-foreground/80 hover:border-primary/30",
            ].join(" ")}
          >
            {s.name}
          </button>
        ))}
      </div>
      <SkillDetail skill={skill} />
    </div>
  );
}

function SkillDetail({ skill }: { skill: SkillEntry }) {
  return (
    <section className="rounded-3xl border border-border/40 overflow-hidden">
      <div className="bg-gradient-to-br from-primary/15 to-transparent px-6 md:px-10 py-8">
        <h2 className="font-display text-3xl md:text-4xl mb-2">{skill.name}</h2>
        <p className="text-lg text-foreground/85 italic mb-4">"{skill.essence}"</p>
        <div className="flex gap-6 text-sm text-foreground/70">
          <span><span className="text-foreground/45">Dimension:</span> {skill.dimension}</span>
          <span><span className="text-foreground/45">Path:</span> {skill.pairedPath}</span>
        </div>
      </div>
      <div className="px-6 md:px-10 py-8">
        <Block title="The 7 Levels">
          <ol className="space-y-3">
            {skill.levels.map((lv) => (
              <li key={lv.level} className="rounded-xl border border-border/40 p-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display text-primary text-lg">L{lv.level}</span>
                  <span className="font-display text-base">{lv.name}</span>
                </div>
                <div className="text-sm text-foreground/75 mb-1">
                  <span className="text-foreground/45 mr-2">Markers:</span>
                  {lv.markers.join(" · ")}
                </div>
                <div className="text-sm text-foreground/85 mb-1">
                  <span className="text-primary/70 mr-2">Practice:</span>
                  {lv.microPractice}
                </div>
                <div className="text-sm text-foreground/65 italic">
                  <span className="text-foreground/45 mr-2 not-italic">Graduation:</span>
                  {lv.graduation}
                </div>
              </li>
            ))}
          </ol>
        </Block>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between mb-4 text-left">
        <h3 className="font-display text-xl md:text-2xl">{title}</h3>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}
