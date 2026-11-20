import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, ChevronRight, CheckCircle2, BookOpen, Compass, Gamepad2, Play, Layers, Flame, Search } from "lucide-react";
import LibrarySearchModal from "@/components/library/LibrarySearchModal";
import { Card } from "@/design-system";
import { Skeleton } from "@/design-system";
import { Badge } from "@/design-system";
import { ALL_GUIDES, type Guru } from "@/lib/guru-data";
import MasterProfile from "@/components/temple/MasterProfile";
import LoopMappingQuestionnaire from "@/components/pre-journey/LoopMappingQuestionnaire";
import { FLAGSHIP_GAMES, FACULTY_LABEL } from "@/games/shell/labRegistry";
import { coverFor } from "@/games/shell/facultyCovers";
import { getHeroImage } from "@/games/shell/heroImages";
import { getGameVideo } from "@/games/shell/gameVideos";
import { ALL_PROGRAMS_V3, ALL_ATOMS } from "@/lib/programs";
import { MANIFESTS as SENSORIAL_MANIFESTS } from "@/data/sensorialPractices";
import type { SensorialManifest } from "@/data/sensorialPractices/types";
import SensorialPracticeSession from "@/components/temple/sensorial/SensorialPracticeSession";
import type { Atom, AtomCategory } from "@/lib/programs/types";
import { MIRROR_CHECKPOINTS } from "@/data/pre-journey/mirrors";
import { MIRROR_BANKS } from "@/data/mirrors/registry";
import AudienceSpectrumSection from "@/components/programs/AudienceSpectrumSection";
import GamesTab from "@/components/library/GamesTab";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { PersonalPracticeConstellation } from "@/components/library/PersonalPracticeConstellation";
import { MirrorCompletionMap } from "@/components/library/MirrorCompletionMap";
import { getPracticesForDimension } from "@/lib/library/personalizedPractices";



interface AssessmentDef {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  intro: string;
  tradition: string;
  dimension_category: string;
  cover_emoji: string | null;
  question_count: number;
  estimated_minutes: number;
  is_featured: boolean;
}

interface CompletionRow {
  assessment_slug: string;
  taken_at: string;
  primary_result_label: string | null;
}

type TabKey = "programs" | "micro" | "practices" | "assessments" | "games" | "explore";

// ── Micro-Programs · thematic mini-arcs built from the flagship games ──
const MICRO_PROGRAM_GROUPS: {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  faculties: string[];
}[] = [
  { id: "body-breath",    title: "Body & Breath",         subtitle: "Nervous system floor · settle the vessel", emoji: "🫁", faculties: ["body", "breath", "attention"] },
  { id: "heart-emotion",  title: "Heart & Emotion",       subtitle: "Anger, grief, envy, love · metabolise",     emoji: "❤️‍🔥", faculties: ["heart"] },
  { id: "relationships",  title: "Relationships",         subtitle: "Boundaries · repair · hard conversations",  emoji: "🪢", faculties: ["heart", "karma"] },
  { id: "self-inquiry",   title: "Self-Inquiry",          subtitle: "Who is watching · what is real",            emoji: "🪞", faculties: ["self_inquiry", "witness"] },
  { id: "karma-life",     title: "Karma & Life-Design",   subtitle: "Enough · vows · legacy · mortality",        emoji: "🕯️", faculties: ["karma", "willpower"] },
  { id: "devotion",       title: "Devotion & Lineage",    subtitle: "Masters · ancestors · seasons",             emoji: "🌸", faculties: ["heart", "karma", "witness"] },
];

function microGamesFor(faculties: string[]) {
  return FLAGSHIP_GAMES.filter(
    (g) => g.faculties?.some((f) => faculties.includes(f as string))
  );
}

export default function Library() {
  const navigate = useNavigate();
  const { data: engineData } = useConsciousnessEngine();
  // Allow ?tab=... via URL — used by the double-tap orb gesture.
  const initialTab: TabKey = (() => {
    if (typeof window === "undefined") return "programs";
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "games") return "games";
    if (t === "micro" || t === "micro-programs") return "programs";
    if (t === "mirrors" || t === "assessments") return "assessments";
    if (t === "practices") return "practices";
    return "programs";
  })();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [openMicroGroup, setOpenMicroGroup] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<AssessmentDef[]>([]);
  const [completions, setCompletions] = useState<Record<string, CompletionRow>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState<Guru | null>(null);
  const [showLoopMap, setShowLoopMap] = useState(false);
  const [activeManifest, setActiveManifest] = useState<{ manifest: SensorialManifest; guru: Guru } | null>(null);
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [searchOpen, setSearchOpen] = useState(false);

  // Auto-open a specific sensorial practice via ?open=<manifestKey> (used by the landing GlimpseModal).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = new URLSearchParams(window.location.search).get("open");
    if (!key) return;
    const m = SENSORIAL_MANIFESTS.find((x) => x.key === key);
    if (!m) return;
    const found = ALL_GUIDES.find((g) => g.id === m.guruId);
    const guru: Guru = found ?? ({
      id: m.guruId,
      name: m.guruId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      tradition: "",
      era: "",
      avatar: m.backdropImage ?? "",
      bio: "",
      style: "",
      voiceId: m.voiceId,
    } as unknown as Guru);
    setActiveManifest({ manifest: m, guru });
  }, []);

  

  

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ data: defs }, { data: { user } }] = await Promise.all([
        supabase
          .from("assessment_definitions")
          .select("id,slug,title,subtitle,intro,tradition,dimension_category,cover_emoji,question_count,estimated_minutes,is_featured")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.auth.getUser(),
      ]);

      let comps: CompletionRow[] = [];
      if (user) {
        const { data: results } = await supabase
          .from("user_assessment_results")
          .select("assessment_slug, taken_at, primary_result_label")
          .eq("user_id", user.id)
          .order("taken_at", { ascending: false });
        comps = results ?? [];
      }

      const compMap: Record<string, CompletionRow> = {};
      for (const c of comps) if (!compMap[c.assessment_slug]) compMap[c.assessment_slug] = c;

      // Merge in the authored registry banks. The database holds the 32
      // original banks plus, once the catalog migration is applied, these same
      // 61. Merging means the Library is complete either way — a bank is
      // listed from source control whether or not the migration has run, so
      // "not available yet" cannot happen for a mirror that has been written.
      const dbDefs = (defs as AssessmentDef[]) ?? [];
      const seen = new Set(dbDefs.map((d) => d.slug));
      const registryOnly = MIRROR_BANKS.filter((b) => !seen.has(b.slug)).map(
        (b): AssessmentDef => ({
          id: `registry:${b.slug}`,
          slug: b.slug,
          title: b.title,
          subtitle: b.subtitle,
          intro: b.intro,
          tradition: b.tradition,
          dimension_category: b.dimensionCategory,
          cover_emoji: b.coverEmoji,
          question_count: b.questions.length,
          estimated_minutes: b.estimatedMinutes,
          is_featured: false,
        }),
      );

      if (!mounted) return;
      setAssessments([...dbDefs, ...registryOnly]);
      setCompletions(compMap);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const traditions = Array.from(new Set(assessments.map((a) => a.tradition)));

  const handleTalk = (guru: Guru) => {
    navigate("/app/temple", { state: { guruId: guru.id, action: "talk" } });
  };

  // Programs developed this week (V3)
  const programCategories = useMemo(() => {
    const set = new Set<string>();
    ALL_PROGRAMS_V3.forEach((p) => set.add(p.category));
    return ["all", ...Array.from(set).sort()];
  }, []);
  const [activeProgramCat, setActiveProgramCat] = useState<string>("all");
  const programsFiltered = useMemo(
    () => activeProgramCat === "all"
      ? ALL_PROGRAMS_V3
      : ALL_PROGRAMS_V3.filter((p) => p.category === activeProgramCat),
    [activeProgramCat],
  );

  // Practices developed this week (V3 atoms)
  const atomCategories = useMemo(() => {
    const set = new Set<AtomCategory>();
    ALL_ATOMS.forEach((a) => set.add(a.category));
    return ["all", ...Array.from(set).sort()] as const;
  }, []);
  const [activeAtomCat, setActiveAtomCat] = useState<string>("all");
  const [focusedPracticeDimension, setFocusedPracticeDimension] = useState<string | null>(null);
  const atomsFiltered = useMemo<Atom[]>(
    () => activeAtomCat === "all"
      ? ALL_ATOMS
      : ALL_ATOMS.filter((a) => a.category === activeAtomCat),
    [activeAtomCat],
  );
  const visibleManifests = useMemo(
    () => focusedPracticeDimension
      ? getPracticesForDimension(focusedPracticeDimension, SENSORIAL_MANIFESTS)
      : SENSORIAL_MANIFESTS,
    [focusedPracticeDimension],
  );

  return (
      <div className="max-w-3xl mx-auto pb-12 lg:max-w-5xl">
      {/* Heading + Tabs (solid, non-overlapping) */}
      <div className="pt-4 pb-3 mb-5">
        <div className="text-center mb-3">
          <h1 className="font-display text-xl sm:text-2xl font-semibold">Inner Library</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Programs, practices, mirrors & games built for your journey.
          </p>
        </div>
        <div className="flex justify-center mb-3 px-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-md flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/40 hover:bg-muted/60 border border-border/50 hover:border-primary/40 text-left text-xs text-muted-foreground transition-colors"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tell me what you're feeling or stuck on…</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">Ask</span>
          </button>
        </div>
        <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border/50 bg-muted/30 p-1 flex-wrap">
          <button
            onClick={() => setTab("programs")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === "programs"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Programs
            <span className="text-[10px] opacity-70">· {ALL_PROGRAMS_V3.length}</span>
          </button>
          <button
            onClick={() => setTab("practices")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === "practices"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Practices
            <span className="text-[10px] opacity-70">· {SENSORIAL_MANIFESTS.length}</span>
          </button>
          <button
            onClick={() => setTab("assessments")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === "assessments"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Mirrors
            <span className="text-[10px] opacity-70">· {MIRROR_CHECKPOINTS.length}</span>
          </button>
          <button
            onClick={() => setTab("games")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === "games"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Games
            <span className="text-[10px] opacity-70">· {FLAGSHIP_GAMES.length}</span>
          </button>
          <button
            onClick={() => setTab("explore")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === "explore" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Compass className="w-3.5 h-3.5" />
            Explore
            <span className="text-[10px] opacity-70">· 13K+</span>
          </button>

        </div>
        </div>
      </div>


      {/* Programs tab — V3 programs developed this week */}
      {tab === "programs" && (
        <div className="space-y-6">
          <AudienceSpectrumSection />
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {programCategories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveProgramCat(c)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs capitalize transition ${
                  activeProgramCat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {programsFiltered.map((p, idx) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/app/programs-v3?open=${p.id}`)}
                className="w-full text-left"
              >
                <Card className="p-4 hover:border-primary/40 transition-colors group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base font-semibold truncate">{p.title}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.subtitle}</p>
                      <div className="text-[10px] text-muted-foreground mt-1 capitalize">
                        {p.category} · {p.difficulty}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {p.totalSessions} sessions
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Micro-Programs tab — 275 lab games grouped as thematic mini-arcs */}
      {tab === "micro" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground text-center px-4">
            275 micro-practices, 60s–5min each. Grouped as small programs by inner faculty.
          </p>

          <div className="space-y-3">
            {MICRO_PROGRAM_GROUPS.map((group, idx) => {
              const games = microGamesFor(group.faculties);
              const isOpen = openMicroGroup === group.id;
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => setOpenMicroGroup(isOpen ? null : group.id)}
                      className="w-full text-left p-4 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl shrink-0">{group.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-base font-semibold truncate">
                            {group.title}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {group.subtitle}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {games.length} practices
                        </Badge>
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground/60 shrink-0 transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-border/40"
                        >
                          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                            {games.map((g) => (
                              <button
                                key={g.id}
                                onClick={() => navigate(`/app/games/${g.id}`)}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors group flex items-center gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">
                                    {g.name}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {g.oneLine}
                                  </p>
                                </div>
                                <Play className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}



      {/* Practices tab — 25 fully-developed sensorial practices (TTS, STT, camera, video). */}
      {tab === "practices" && (
        <div className="space-y-4">
          {engineData?.profile && (
            <PersonalPracticeConstellation
              bands={engineData.profile.dimension_bands}
              manifests={SENSORIAL_MANIFESTS}
              focusedDimension={focusedPracticeDimension}
              onSelectDimension={(dimension) => setFocusedPracticeDimension((current) =>
                current === dimension ? null : dimension,
              )}
            />
          )}
          <p className="text-xs text-muted-foreground text-center px-4">
            {focusedPracticeDimension
              ? `Showing guided practices aligned with ${focusedPracticeDimension}.`
              : "Cinematic practices with master voice, breath orb, camera presence & ambient video."}
          </p>

          <div className="space-y-2">
            {visibleManifests.map((m, idx) => {
              const found = ALL_GUIDES.find((g) => g.id === m.guruId);
              const guru: Guru = found ?? ({
                id: m.guruId,
                name: m.guruId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                tradition: "",
                era: "",
                avatar: m.backdropImage ?? "",
                bio: "",
                style: "",
                voiceId: m.voiceId,
              } as unknown as Guru);
              return (
                <motion.button
                  key={m.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActiveManifest({ manifest: m, guru })}
                  className="w-full text-left"
                >
                  <Card className="p-3 hover:border-primary/40 transition-colors group">
                    <div className="flex items-start gap-3">
                      {m.backdropImage && (
                        <img
                          src={m.backdropImage}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{m.title}</div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {guru.name} · {m.totalMinutes}m
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[9px] py-0">TTS</Badge>
                          {m.sensors?.mic && <Badge variant="outline" className="text-[9px] py-0">Mic</Badge>}
                          {m.sensors?.camera && <Badge variant="outline" className="text-[9px] py-0">Camera</Badge>}
                          {m.videoUrl && <Badge variant="outline" className="text-[9px] py-0">Video</Badge>}
                          <Badge variant="outline" className="text-[9px] py-0">{m.steps.length} steps</Badge>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </Card>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen sensorial practice player */}
      {activeManifest && (
        <div className="fixed inset-0 z-[60] bg-background">
          <SensorialPracticeSession
            manifest={activeManifest.manifest}
            guru={activeManifest.guru}
            onBack={() => setActiveManifest(null)}
          />
        </div>
      )}


      {/* Assessments tab */}
      {tab === "assessments" && (
        <>
          <MirrorCompletionMap completedSlugs={new Set(Object.keys(completions))} />
          {/* Map your loops — standalone Mirror entry */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowLoopMap(true)}
            className="w-full text-left mb-6"
          >
            <Card className="p-4 sm:p-5 border-primary/30 hover:border-primary/60 transition-colors group bg-primary/5">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🧭</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display text-base font-semibold">Map your loops</h3>
                    <Badge variant="secondary" className="text-[10px] py-0">Mirror</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tell the engine which loops run you — intensity, triggers, connections.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> 3–5 min</span>
                    <span>· loop intensity & triggers</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </Card>
          </motion.button>

          {(() => {
            const defBySlug: Record<string, AssessmentDef> = {};
            for (const d of assessments) defBySlug[d.slug] = d;
            // Group all 100 checkpoints by module, skip #1 (already shown above as Map your loops)
            const grouped = new Map<string, typeof MIRROR_CHECKPOINTS>();
            for (const m of MIRROR_CHECKPOINTS) {
              if (m.number === 1) continue;
              const arr = grouped.get(m.module) ?? [];
              arr.push(m);
              grouped.set(m.module, arr);
            }
            return Array.from(grouped.entries()).map(([module, items]) => (
              <section key={module} className="mb-8">
                <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">
                  {module}
                </h2>
                <div className="space-y-3">
                  {items.map((m, idx) => {
                    const def = defBySlug[m.assessmentSlug];
                    const completion = completions[m.assessmentSlug];
                    const locked = m.kind === "coming-soon";
                    return (
                      <motion.button
                        key={m.number}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx, 10) * 0.02 }}
                        whileHover={locked ? undefined : { scale: 1.01 }}
                        whileTap={locked ? undefined : { scale: 0.99 }}
                        onClick={() => {
                          if (locked) return;
                          navigate(`/app/library/${m.assessmentSlug}`);
                        }}
                        disabled={locked}
                        className={`w-full text-left ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <Card className="p-4 sm:p-5 hover:border-primary/40 transition-colors group">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">{def?.cover_emoji ?? "🪞"}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[10px] text-muted-foreground">#{m.number}</span>
                                <h3 className="font-display text-base font-semibold">{def?.title ?? m.title}</h3>
                                {locked && (
                                  <Badge variant="outline" className="text-[10px] py-0">
                                    Coming soon
                                  </Badge>
                                )}
                                {completion && (
                                  <Badge className="text-[10px] py-0 gap-1 bg-primary/15 text-primary hover:bg-primary/20">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    {completion.primary_result_label ?? "Taken"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {def?.subtitle ?? m.hook}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                {def ? (
                                  <>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {def.estimated_minutes} min
                                    </span>
                                    <span>{def.question_count} questions</span>
                                  </>
                                ) : (
                                  <span>Unlocks after session {m.afterSessionNumber}</span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0 mt-1" />
                          </div>
                        </Card>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            ));
          })()}
        </>
      )}

      {/* Games tab */}
      {tab === "games" && <GamesTab profile={engineData?.profile} />}
      {tab === "explore" && navigate("/app/library/explore", { replace: true })}


      {/* Master profile drawer */}
      <AnimatePresence>
        {selectedMaster && (
          <MasterProfile
            guru={selectedMaster}
            onBack={() => setSelectedMaster(null)}
            onTalk={(g) => {
              setSelectedMaster(null);
              handleTalk(g);
            }}
          />
        )}
      </AnimatePresence>

      {showLoopMap && (
        <LoopMappingQuestionnaire
          onClose={() => setShowLoopMap(false)}
          onComplete={() => setShowLoopMap(false)}
        />
      )}

      {searchOpen && <LibrarySearchModal onClose={() => setSearchOpen(false)} />}

    </div>
  );
}
