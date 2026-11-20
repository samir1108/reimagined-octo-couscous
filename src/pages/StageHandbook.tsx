/**
 * The Handbook — public, SEO-friendly route at /handbook
 * Tabs: Bands · Paths · Skills · Loops · Gurus · Dimensions · Glossary
 */
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import BandsView from "@/components/handbook/BandsView";
import PathsView from "@/components/handbook/PathsView";
import SkillsView from "@/components/handbook/SkillsView";
import LoopFamiliesView from "@/components/handbook/LoopFamiliesView";
import GurusView from "@/components/handbook/GurusView";
import DimensionsView from "@/components/handbook/DimensionsView";
import GlossaryView from "@/components/handbook/GlossaryView";

const TABS = [
  { key: "bands",      label: "Bands",      desc: "The 8 stages of consciousness, Sleeper → Source." },
  { key: "paths",      label: "Paths",      desc: "The 6 yoga paths — levels, traps, and what each path is actually for." },
  { key: "skills",     label: "Skills",     desc: "The 9 core skills of consciousness, with 7 progressive levels each." },
  { key: "loops",      label: "Loops",      desc: "The 12 loop families behind the 400+ patterns." },
  { key: "gurus",      label: "Gurus",      desc: "13 masters — lineage, one-line teaching, signature practice." },
  { key: "dimensions", label: "Dimensions", desc: "The 6 dimensions the engine tracks in every session." },
  { key: "glossary",   label: "Glossary",   desc: "Sanskrit, neuroscience, and practice terms — side by side." },
] as const;

type TabKey = typeof TABS[number]["key"];

const PAGE_TITLE = "The Handbook — Paths, Skills, Loops, Gurus | ConsciousOS";
const PAGE_DESC =
  "Open field guide to consciousness: 8 bands, 6 yoga paths with levels, 9 skills, 12 loop families, 13 gurus, and a Sanskrit + neuroscience glossary.";

export default function StageHandbook() {
  useForceDarkMode();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const tab: TabKey = useMemo(() => {
    const t = params.get("tab") as TabKey | null;
    return TABS.find((x) => x.key === t)?.key ?? "bands";
  }, [params]);

  const setTab = (next: TabKey) => {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    if (next !== "bands") p.delete("band");
    setParams(p, { replace: true });
  };

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = PAGE_TITLE;
    const ensureMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
      return el;
    };
    ensureMeta("description", PAGE_DESC);
    ensureMeta("og:title", PAGE_TITLE, "property");
    ensureMeta("og:description", PAGE_DESC, "property");

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const hadCanon = !!canon;
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = `${window.location.origin}/handbook`;

    return () => { document.title = prev; if (!hadCanon) canon?.remove(); };
  }, []);

  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="w-4 h-4" />
            <span className="font-display text-sm tracking-wide">The Handbook</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10 md:py-14">
        <div className="mb-8 md:mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-3">Open · Free · Citable</p>
          <h1 className="font-display text-3xl md:text-5xl leading-tight mb-3">The Handbook</h1>
          <p className="text-foreground/75 max-w-2xl mx-auto text-base leading-relaxed">
            A field guide to consciousness — the bands, the paths, the skills, the loops, the masters, the terms.
            Open. Free. Made to be linked.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "px-4 py-2 rounded-full text-sm border transition",
                tab === t.key
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/40 text-foreground/75 hover:border-primary/30",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">{active.desc}</p>

        {tab === "bands"      && <BandsView />}
        {tab === "paths"      && <PathsView />}
        {tab === "skills"     && <SkillsView />}
        {tab === "loops"      && <LoopFamiliesView />}
        {tab === "gurus"      && <GurusView />}
        {tab === "dimensions" && <DimensionsView />}
        {tab === "glossary"   && <GlossaryView />}

        <p className="mt-16 text-center text-xs text-muted-foreground/70 max-w-md mx-auto">
          This handbook is open. Translate it. Teach it. The map is shared; the walking is yours.
        </p>
      </main>
    </div>
  );
}
