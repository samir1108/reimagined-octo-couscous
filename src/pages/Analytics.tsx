import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Sparkles as SparklesLucide, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Compass, RefreshCw, Eye, Zap, Sparkles, Brain, Crown, Heart, Activity, BookOpen, Lightbulb, FileText, Gauge, Dna, Target, Map, MapPin, Network, TrendingUp, Users, Waves, Orbit } from "lucide-react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { OverviewLayer } from "@/components/analytics/OverviewLayer";
import { DimensionsLayer } from "@/components/analytics/DimensionsLayer";
import { LoopsLayer } from "@/components/analytics/LoopsLayer";
import { WitnessLayer } from "@/components/analytics/WitnessLayer";
import { ChakrasLayer } from "@/components/analytics/ChakrasLayer";
import { PatternsLayer } from "@/components/analytics/PatternsLayer";
import { PsycheLayer } from "@/components/analytics/PsycheLayer";
import { ArchetypesLayer } from "@/components/analytics/ArchetypesLayer";
import { EmotionalBodyLayer } from "@/components/analytics/EmotionalBodyLayer";
import { SomaticLayer } from "@/components/analytics/SomaticLayer";
import { InsightsLayer } from "@/components/analytics/InsightsLayer";
import MirrorRingsLayer from "@/components/analytics/MirrorRingsLayer";
import MemoryDashboard from "@/components/MemoryDashboard";
import { ReportsLayer } from "@/components/analytics/ReportsLayer";
import ConsciousnessScore from "@/components/ConsciousnessScore";
import { PracticeLevelsRadar } from "@/components/analytics/PracticeLevelsRadar";
import { SpiritualDNAPanel } from "@/components/analytics/SpiritualDNAPanel";
import { LifeDomainPanel } from "@/components/analytics/LifeDomainPanel";
import DimensionHumanMap from "@/components/DimensionHumanMap";
import GeoSpiritualAnchors from "@/components/GeoSpiritualAnchors";
import FractalIntegrationLayer from "@/components/analytics/FractalIntegrationLayer";
import PredictiveInsightsLayer from "@/components/analytics/PredictiveInsightsLayer";
import CouncilOfYogis from "@/components/analytics/CouncilOfYogis";
import ConsciousnessLoom from "@/components/analytics/ConsciousnessLoom";
import { lazy, Suspense } from "react";
// lazy heavy viz
const ConsciousnessCosmos3D = lazy(() => import("@/components/analytics/ConsciousnessCosmos3D"));
const LoopConstellation = lazy(() => import("@/components/analytics/LoopConstellation"));
import Dimension100Radial from "@/components/analytics/Dimension100Radial";
import CuriosityHistoryDrawer from "@/components/CuriosityHistoryDrawer";
import { LoopAttributionPanel } from "@/components/analytics/LoopAttributionPanel";
import AppPreloader from "@/components/AppPreloader";
import { BAND_ARCHETYPES } from "@/types/consciousness";
import BandGuidebookModal from "@/components/analytics/BandGuidebookModal";
import CScoreStrip from "@/components/analytics/CScoreStrip";
import LineageCard from "@/components/analytics/LineageCard";
import WeeklyMirrorModal from "@/components/analytics/WeeklyMirrorModal";
import AncestorsLetterCard from "@/components/analytics/AncestorsLetterCard";
import { BookOpen as BookOpenIcon, Sparkles as SparklesIcon } from "lucide-react";
import FoundationReadingCard from "@/components/analytics/FoundationReadingCard";
import AnimatedThreeBrains from "@/components/analytics/AnimatedThreeBrains";
import AnimatedYogaPaths from "@/components/analytics/AnimatedYogaPaths";
import AnimatedWitness from "@/components/analytics/AnimatedWitness";
import AnimatedLifeDomains from "@/components/analytics/AnimatedLifeDomains";
import AnimatedIntegration from "@/components/analytics/AnimatedIntegration";
import EmbeddedLandingSections from "@/components/landing/EmbeddedLandingSections";
import { MIRROR_TOTAL } from "@/data/pre-journey/mirrors";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const TABS = [
  { id: "home", label: "Home", icon: Gauge, group: "Core" },
  { id: "overview", label: "Overview", icon: BarChart3, group: "Core" },
  { id: "practices", label: "Practices", icon: Target, group: "Practice" },
  { id: "dna", label: "DNA", icon: Dna, group: "Practice" },
  { id: "domains", label: "Life", icon: Activity, group: "Practice" },
  { id: "reports", label: "Reports", icon: FileText, group: "Core" },
  { id: "dimensions", label: "Dimensions", icon: Compass, group: "Psyche" },
  { id: "psyche", label: "Psyche", icon: BookOpen, group: "Psyche" },
  { id: "archetypes", label: "Archetypes", icon: Crown, group: "Psyche" },
  { id: "emotional", label: "Emotional", icon: Heart, group: "Psyche" },
  { id: "somatic", label: "Body & Life", icon: Activity, group: "Body" },
  { id: "loops", label: "Loops", icon: RefreshCw, group: "Loops" },
  { id: "witness", label: "Witness", icon: Eye, group: "Insights" },
  { id: "chakras", label: "Chakras", icon: Zap, group: "Body" },
  { id: "patterns", label: "Patterns", icon: Sparkles, group: "Loops" },
  { id: "insights", label: "Insights", icon: Lightbulb, group: "Insights" },
  { id: "memory", label: "Memory", icon: Brain, group: "Core" },
  { id: "humanmap", label: "Human Map", icon: Map, group: "Maps" },
  { id: "spaces", label: "Spaces", icon: MapPin, group: "Maps" },
  { id: "fractal", label: "Fractal", icon: Network, group: "Visuals" },
  { id: "predictive", label: "Predictive", icon: TrendingUp, group: "Insights" },
  { id: "council", label: "Council", icon: Users, group: "Insights" },
  { id: "loom", label: "Loom", icon: Waves, group: "Visuals" },
  { id: "cosmos", label: "Cosmos 3D", icon: Orbit, group: "Visuals" },
  { id: "constellation", label: "Loop Web", icon: Network, group: "Visuals" },
  { id: "map100", label: "100-Map", icon: Orbit, group: "Maps" },
  { id: "mirrors", label: `${MIRROR_TOTAL} Mirrors`, icon: Sparkles, group: "Practice" },
  { id: "signals", label: "Signals", icon: Sparkles, group: "Loops" },
  { id: "visuals", label: "Visuals", icon: Sparkles, group: "Visuals" },
] as const;

type TabId = typeof TABS[number]["id"];

const TAB_IDS = TABS.map((t) => t.id) as readonly string[];

function isTabId(value: string | null): value is TabId {
  return !!value && TAB_IDS.includes(value);
}

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const initial = searchParams.get("tab");
    return isTabId(initial) ? initial : "home";
  });
  const [guidebookBand, setGuidebookBand] = useState<number | null>(null);
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(searchParams.get("welcome") === "1");
  const fromJourney = searchParams.get("journey") === "1";
  const data = useAnalyticsData();
  const queryClient = useQueryClient();

  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  // Keep the selected view in the URL so refresh, back/forward, and shared links reopen the same tab.
  const selectTab = useCallback((id: TabId) => {
    setActiveTab(id);
    const next = new URLSearchParams(searchParams);
    if (id === "home") next.delete("tab");
    else next.set("tab", id);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Sync when the URL changes from outside (browser back/forward).
  useEffect(() => {
    const param = searchParams.get("tab");
    if (isTabId(param) && param !== activeTab) setActiveTab(param);
    else if (!param && activeTab !== "home") setActiveTab("home");
  }, [searchParams, activeTab]);

  // Keep the active chip in view as the strip scrolls.
  useEffect(() => {
    tabRefs.current[activeTab]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeTab]);

  const onTablistKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.id === activeTab);
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const id = TABS[next].id;
    selectTab(id);
    tabRefs.current[id]?.focus();
  };

  useEffect(() => {
    if (searchParams.get("welcome") === "1") setShowWelcome(true);
  }, [searchParams]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    const next = new URLSearchParams(searchParams);
    next.delete("welcome");
    setSearchParams(next, { replace: true });
  };

  if (data.isLoading) {
    return (
      <AppPreloader
        screen="analytics"
        label="Opening The Mirror…"
        className="min-h-[65dvh]"
      />
    );
  }

  return (
    <div className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 space-y-6">
      {/* Post-onboarding reveal — compact chip */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-xs">
            <SparklesLucide className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground/90 font-medium">
              {fromJourney
                ? "Your deep journey is complete — your engine has been updated."
                : "Your foundation reading is live — this is your Mirror."}
            </span>
            <button
              onClick={dismissWelcome}
              aria-label="Dismiss"
              className="ml-1 p-0.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
             </button>
           </div>
         </motion.div>
        )}


      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-3xl md:text-5xl font-editorial font-medium text-foreground mb-1 tracking-tight">The Mirror</h1>
        <p className="hidden sm:block text-sm text-muted-foreground font-body">See yourself — deeply, honestly, beautifully</p>
      </motion.div>

      {/* Pre-tab cards moved into the Home tab below. */}



      {/* Tab Navigation — sticky so the view switcher stays reachable on long tabs */}
      <motion.div
        className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pt-1 pb-2.5 bg-background/80 backdrop-blur-md border-b border-border/30"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Mirror views"
            onKeyDown={onTablistKeyDown}
            className="flex gap-1.5 overflow-x-auto pb-1 analytics-tabs-scroll flex-1"
          >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                role="tab"
                id={`mirror-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="mirror-tab-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display whitespace-nowrap transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries()}
            className="shrink-0 text-xs rounded-xl border border-border/40 bg-background/80 px-2 py-1.5 glass-card hover:border-primary/30 transition"
            aria-label="Refresh analytics"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <select
            value={activeTab}
            onChange={(e) => isTabId(e.target.value) && selectTab(e.target.value as TabId)}
            className="shrink-0 text-xs rounded-xl border border-border/40 bg-background/80 px-2 py-1.5 glass-card"
            aria-label="Jump to view"
          >
            {Array.from(new Set(TABS.map((t) => t.group))).map((g) => (
              <optgroup key={g} label={g}>
                {TABS.filter((t) => t.group === g).map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id="mirror-tab-panel"
          aria-labelledby={`mirror-tab-${activeTab}`}
          tabIndex={-1}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "home" && (
            <div className="space-y-4">
              {/* Dynamic reading from foundation onboarding */}
              <FoundationReadingCard />

              {/* CScore hero strip */}
              <CScoreStrip
                profile={data.profile}
                plan={data.plan}
                onTap={() => selectTab("overview")}
              />

              {/* Weekly Mirror trigger */}
              <button
                type="button"
                onClick={() => setMirrorOpen(true)}
                className="w-full glass-card rounded-2xl p-4 border border-border/40 hover:border-primary/30 hover:bg-primary/[0.03] transition-all group flex items-center gap-3"
              >
                <SparklesIcon className="w-4 h-4 text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-display font-medium text-foreground">Open this week's Mirror</p>
                  <p className="text-xs text-muted-foreground">7-day reflection — loops, rhythm, theme</p>
                </div>
                <span className="text-[10px] font-display tracking-wider uppercase text-primary/80 group-hover:text-primary">View →</span>
              </button>

              {/* Current V-Band card */}
              {(data.plan || data.profile) && (() => {
                const band = data.plan?.band ?? data.profile?.overall_band ?? 0;
                const vLevel = data.plan?.vLevel ?? data.profile?.overall_band ?? 0;
                const ICONS = ['🌑','🌒','🌓','🌔','🌕','🌌','🌈','✦','☀️','🌟','◯'];
                const idx = Math.max(0, Math.min(10, Math.floor(band)));
                const arch = BAND_ARCHETYPES[idx];
                const bandName = data.plan?.bandName || arch?.title || 'The Sleeper';
                const bandIcon = data.plan?.bandIcon || ICONS[idx];
                const frac = Number(vLevel) - idx;
                const subIdx = frac < 0.34 ? 0 : frac < 0.67 ? 1 : 2;
                const subStageLabel = ['Entering', 'Deepening', 'Mastery'][subIdx];
                const subName = arch?.microLabels?.[subIdx] || '';
                const subValue = `${idx}.${[0, 5, 9][subIdx]}`;
                return (
                  <button
                    type="button"
                    onClick={() => setGuidebookBand(idx)}
                    className="glass-card rounded-2xl p-5 border border-primary/20 w-full text-left hover:border-primary/40 hover:bg-primary/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{bandIcon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70 mb-0.5">
                          Current Band {idx} of 10 · V-Level {Number(vLevel).toFixed(1)}
                        </p>
                        <p className="text-lg font-display font-semibold text-foreground truncate">
                          {bandName}
                        </p>
                        {arch?.coreState && (
                          <p className="text-xs text-muted-foreground italic mt-0.5 truncate">"{arch.coreState}"</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70 mb-0.5">
                          Sub-level · {subValue}
                        </p>
                        <p className="text-sm font-display font-medium text-foreground truncate">
                          {subName} <span className="text-muted-foreground font-normal">· {subStageLabel}</span>
                        </p>
                      </div>
                      <div className="w-24 shrink-0">
                        <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.max(4, Math.min(100, frac * 100))}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground/70 text-right mt-1 font-display tracking-wider">
                          {Math.round(frac * 100)}% into band
                        </p>
                      </div>
                    </div>
                    {data.plan?.identityBandName && (
                      <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                        <span className="text-base">{data.plan.identityBandIcon || "🧭"}</span>
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-display tracking-wider uppercase text-muted-foreground/70">Identity:</span>{" "}
                          <span className="text-foreground/90 font-medium">{data.plan.identityBandName}</span>
                        </p>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-center gap-1.5 text-[10px] font-display tracking-wider uppercase text-primary/80 group-hover:text-primary transition">
                      <BookOpenIcon className="w-3 h-3" /> Tap to open Band Guidebook
                    </div>
                  </button>
                );
              })()}

               {/* Consciousness Score full */}
               <ConsciousnessScore
                 profile={data.profile}
                 plan={data.plan}
                 variant="full"
               />

               {/* Live 3 brains */}
               <AnimatedThreeBrains />

               {/* Live four paths */}
               <AnimatedYogaPaths />

               {/* Live witness */}
               <AnimatedWitness />

               {/* Live life domains */}
               <AnimatedLifeDomains />

               {/* Live integration */}
               <AnimatedIntegration />

              {/* Active loops quick view */}
              <LoopsLayer loops={data.loops} samskaras={data.samskaras} />
            </div>
          )}
          {activeTab === "overview" && (
            <OverviewLayer
              profile={data.profile}
              plan={data.plan}
              sessions={data.sessions}
              journals={data.journals}
              tasks={data.tasks}
              obsTask={data.obsTask}
              loops={data.loops}
            />
          )}
          {activeTab === "practices" && <PracticeLevelsRadar />}
          {activeTab === "dna" && <SpiritualDNAPanel />}
          {activeTab === "domains" && <LifeDomainPanel />}
          {activeTab === "dimensions" && (
            <DimensionsLayer profile={data.profile} plan={data.plan} />
          )}
          {activeTab === "reports" && (
            <ReportsLayer
              sessions={data.sessions}
              journals={data.journals}
              tasks={data.tasks}
              obsTask={data.obsTask}
              reflections={data.reflections}
              profile={data.profile}
            />
          )}
          {activeTab === "psyche" && (
            <PsycheLayer psycheData={data.psycheData} />
          )}
          {activeTab === "archetypes" && (
            <ArchetypesLayer psycheData={data.psycheData} />
          )}
          {activeTab === "emotional" && (
            <EmotionalBodyLayer psycheData={data.psycheData} />
          )}
          {activeTab === "somatic" && (
            <SomaticLayer psycheData={data.psycheData} />
          )}
          {activeTab === "loops" && (
            <LoopsLayer loops={data.loops} samskaras={data.samskaras} />
          )}
          {activeTab === "witness" && (
            <WitnessLayer profile={data.profile} />
          )}
          {activeTab === "chakras" && (
            <ChakrasLayer profile={data.profile} />
          )}
          {activeTab === "patterns" && (
            <PatternsLayer profile={data.profile} regressions={data.regressions} />
          )}
          {activeTab === "insights" && <InsightsLayer />}
          {activeTab === "memory" && <MemoryDashboard />}
          {activeTab === "humanmap" && <DimensionHumanMap />}
          {activeTab === "spaces" && <GeoSpiritualAnchors />}
          {activeTab === "fractal" && <FractalIntegrationLayer />}
          {activeTab === "predictive" && <PredictiveInsightsLayer />}
          {activeTab === "council" && <CouncilOfYogis />}
          {activeTab === "loom" && <ConsciousnessLoom />}
  {activeTab === "cosmos" && <Suspense fallback={<AppPreloader screen="analytics" label="Rendering Cosmos…" className="min-h-[40dvh]" />}><ConsciousnessCosmos3D /></Suspense>}
  {activeTab === "constellation" && <Suspense fallback={<AppPreloader screen="analytics" label="Rendering Loop Web…" className="min-h-[40dvh]" />}><LoopConstellation /></Suspense>}
          {activeTab === "map100" && (
            <div className="space-y-3">
              <Dimension100Radial />
              <div className="flex justify-end"><CuriosityHistoryDrawer /></div>
            </div>
          )}
          {activeTab === "mirrors" && <MirrorRingsLayer />}
          {activeTab === "signals" && <LoopAttributionPanel />}
          {activeTab === "visuals" && (
            <EmbeddedLandingSections />
          )}
        </motion.div>
      </AnimatePresence>

      <BandGuidebookModal
        open={guidebookBand !== null}
        band={guidebookBand ?? 0}
        onClose={() => setGuidebookBand(null)}
        onSelectBand={(b) => setGuidebookBand(b)}
      />

      <WeeklyMirrorModal
        open={mirrorOpen}
        onClose={() => setMirrorOpen(false)}
        loops={data.loops}
        sessions={data.sessions}
        journals={data.journals}
        reflections={data.reflections}
        profile={data.profile}
        plan={data.plan}
      />
    </div>
  );
}
