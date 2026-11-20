import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Search, Sparkles, Layers, Flame, Gamepad2, BookOpen, ChevronRight } from "lucide-react";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";
import { ALL_PROGRAMS_V3, ALL_ATOMS } from "@/lib/programs";
import { FLAGSHIP_GAMES, type LabGame, FACULTY_LABEL } from "@/games/shell/labRegistry";
import { MANIFESTS as SENSORIAL_MANIFESTS } from "@/data/sensorialPractices";

interface Match<T> { item: T; score: number; hits: string[] }

const STOP = new Set([
  "the","a","an","and","or","but","of","to","in","for","on","at","by",
  "is","am","are","was","were","be","been","i","me","my","you","your",
  "with","this","that","it","its","as","so","if","then","from","about",
  "feel","feeling","have","having","get","getting","cant","can","cannot",
]);

// Small keyword→domain expansion to catch natural phrasings.
const EXPAND: Record<string, string[]> = {
  anxious: ["anxiety","panic","worry","stress","fear","breath","calm","nervous"],
  anxiety: ["anxious","panic","worry","stress","fear","breath","calm"],
  stress: ["stress","anxiety","overwhelm","pressure","tension","breath","calm"],
  overwhelmed: ["overwhelm","stress","anxiety","reset","pause","breath"],
  sad: ["sadness","grief","heart","tears","loss"],
  grief: ["grief","loss","heart","tears","sadness"],
  angry: ["anger","rage","frustration","boundaries","heart"],
  anger: ["anger","rage","frustration","boundaries","heart"],
  lonely: ["loneliness","solitude","heart","connection","friendship"],
  sleep: ["sleep","insomnia","night","evening","rest","stillness","body"],
  cant_sleep: ["sleep","insomnia","night","rest"],
  tired: ["fatigue","energy","rest","kriya","body"],
  focus: ["focus","attention","distraction","presence","concentration"],
  distracted: ["attention","focus","distraction","presence"],
  procrastination: ["willpower","focus","dharma","action","karma"],
  purpose: ["dharma","purpose","meaning","karma"],
  meaning: ["dharma","meaning","purpose"],
  relationship: ["heart","boundaries","forgiveness","communication","repair"],
  breakup: ["heart","grief","forgiveness","loss"],
  overthinking: ["thought","witness","attention","self_inquiry","mind"],
  thoughts: ["thought","witness","mind","self_inquiry"],
  self: ["self_inquiry","witness","ego","identity"],
  worth: ["worth","validation","ego","shadow"],
  shame: ["shadow","self_inquiry","heart"],
  guilt: ["shadow","forgiveness","heart"],
  fear: ["fear","anxiety","breath","witness"],
  body: ["body","kriya","breath","energy"],
  breath: ["breath","body","pranayama","calm"],
  meditation: ["stillness","witness","attention","meditation"],
};

function tokenize(q: string): string[] {
  const raw = q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const toks = new Set<string>();
  for (const t of raw) {
    if (STOP.has(t) || t.length < 3) continue;
    toks.add(t);
    // stem-ish
    if (t.endsWith("ing") && t.length > 5) toks.add(t.slice(0, -3));
    if (t.endsWith("ed") && t.length > 4) toks.add(t.slice(0, -2));
    if (t.endsWith("s") && t.length > 3) toks.add(t.slice(0, -1));
    // expansion
    const ex = EXPAND[t];
    if (ex) ex.forEach((e) => toks.add(e));
  }
  return [...toks];
}

function scoreText(tokens: string[], haystack: string): { score: number; hits: string[] } {
  const h = haystack.toLowerCase();
  let score = 0;
  const hits: string[] = [];
  for (const t of tokens) {
    if (!t) continue;
    if (h.includes(t)) {
      score += t.length >= 5 ? 2 : 1;
      hits.push(t);
    }
  }
  return { score, hits };
}

export default function LibrarySearchModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const tokens = useMemo(() => tokenize(submitted), [submitted]);

  const programs: Match<typeof ALL_PROGRAMS_V3[number]>[] = useMemo(() => {
    if (!tokens.length) return [];
    return ALL_PROGRAMS_V3
      .map((p) => {
        const hay = [p.title, p.subtitle, p.description, p.category, (p.tags || []).join(" ")].join(" ");
        const { score, hits } = scoreText(tokens, hay);
        return { item: p, score, hits };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [tokens]);

  const atoms: Match<typeof ALL_ATOMS[number]>[] = useMemo(() => {
    if (!tokens.length) return [];
    return ALL_ATOMS
      .map((a) => {
        const hay = [a.label, a.intent, a.category, (a.tags || []).join(" ")].join(" ");
        const { score, hits } = scoreText(tokens, hay);
        return { item: a, score, hits };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [tokens]);

  const practices: Match<typeof SENSORIAL_MANIFESTS[number]>[] = useMemo(() => {
    if (!tokens.length) return [];
    return SENSORIAL_MANIFESTS
      .map((m) => {
        const hay = [m.title, m.guruId, (m as any).subtitle ?? "", (m as any).intent ?? ""].join(" ");
        const { score, hits } = scoreText(tokens, hay);
        return { item: m, score, hits };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [tokens]);

  const games: Match<LabGame>[] = useMemo(() => {
    if (!tokens.length) return [];
    return FLAGSHIP_GAMES
      .map((g) => {
        const hay = [g.name, g.oneLine, g.faculties.map((f) => FACULTY_LABEL[f]).join(" "), g.faculties.join(" ")].join(" ");
        const { score, hits } = scoreText(tokens, hay);
        return { item: g, score, hits };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [tokens]);

  const totalHits = programs.length + atoms.length + practices.length + games.length;
  const handleSubmit = () => setSubmitted(query.trim());

  const go = (path: string) => { onClose(); navigate(path); };

  const suggestions = ["I can't sleep", "I feel anxious", "I keep overthinking", "Anger with someone I love", "I feel stuck / no purpose"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl overflow-y-auto"
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Ask the Library</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/60">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            Tell me a feeling, thought, or a moment you're stuck in. I'll pull programs, practices, mirrors and games that meet it.
          </p>

          <div className="relative mb-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g. I can't sleep, my mind won't stop…"
              rows={3}
              className="w-full rounded-2xl bg-muted/40 border border-border/50 focus:border-primary/60 outline-none px-4 py-3 text-sm resize-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1.5 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); setSubmitted(s); }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted/40 hover:bg-muted/70 text-muted-foreground border border-border/40"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!query.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40"
            >
              <Search className="w-3.5 h-3.5" /> Find
            </button>
          </div>

          {submitted && (
            <>
              {totalHits === 0 && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  Nothing matched directly. Try naming an emotion (anger, grief, anxiety), a body state (tired, tense), or a situation (can't sleep, hard conversation).
                </Card>
              )}

              {programs.length > 0 && (
                <Section icon={<Layers className="w-3.5 h-3.5" />} title="Programs">
                  {programs.map((m) => (
                    <RowButton
                      key={m.item.id}
                      title={m.item.title}
                      subtitle={m.item.subtitle}
                      meta={`${m.item.category} · ${m.item.totalSessions} sessions`}
                      hits={m.hits}
                      onClick={() => go(`/app/programs-v3?open=${m.item.id}`)}
                    />
                  ))}
                </Section>
              )}

              {practices.length > 0 && (
                <Section icon={<Flame className="w-3.5 h-3.5" />} title="Practices">
                  {practices.map((m) => (
                    <RowButton
                      key={m.item.key}
                      title={m.item.title}
                      subtitle={`${(m.item.guruId || "").replace(/-/g, " ")} · ${m.item.totalMinutes}m`}
                      hits={m.hits}
                      onClick={() => go(`/app/library?tab=practices&open=${m.item.key}`)}
                    />
                  ))}
                </Section>
              )}

              {games.length > 0 && (
                <Section icon={<Gamepad2 className="w-3.5 h-3.5" />} title="Games">
                  {games.map((m) => (
                    <RowButton
                      key={m.item.id}
                      title={m.item.name}
                      subtitle={m.item.oneLine}
                      meta={m.item.faculties.slice(0, 3).map((f) => FACULTY_LABEL[f]).join(" · ")}
                      hits={m.hits}
                      onClick={() => go(`/app/games/${m.item.id}`)}
                    />
                  ))}
                </Section>
              )}

              {atoms.length > 0 && (
                <Section icon={<BookOpen className="w-3.5 h-3.5" />} title="Micro-atoms">
                  {atoms.map((m) => (
                    <RowButton
                      key={m.item.id}
                      title={m.item.label}
                      subtitle={m.item.intent}
                      meta={`${m.item.category} · ~${Math.round((m.item.durationSec?.typical ?? 60) / 60) || 1}m`}
                      hits={m.hits}
                      onClick={() => go(`/app/library?tab=practices`)}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">
        {icon}
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function RowButton({
  title, subtitle, meta, hits, onClick,
}: { title: string; subtitle?: string; meta?: string; hits?: string[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left group">
      <Card className="p-3 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{subtitle}</div>}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {meta && <span className="text-[10px] text-muted-foreground capitalize">{meta}</span>}
              {hits && hits.slice(0, 3).map((h) => (
                <Badge key={h} variant="outline" className="text-[9px] py-0 capitalize">{h}</Badge>
              ))}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary shrink-0" />
        </div>
      </Card>
    </button>
  );
}
