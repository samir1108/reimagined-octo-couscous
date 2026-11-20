/**
 * Practice v2 — "The Dojo"
 * One scroll. One decision. Visible mastery.
 *
 * ┌ Theme strip (context)
 * ├ NowHero       (AI's one pick — Begin)
 * ├ ChainStrip    (today's observation continuity)
 * ├ PathMatrixGrid (9-skill consciousness matrix)
 * └ Library footer (Browse all programs)
 */
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";

import { useThemeOfDay } from "@/hooks/useThemeOfDay";
import { useTodayPracticePack, useComposeTodayPractice } from "@/hooks/useTodayPractice";
import { usePracticeLevels } from "@/hooks/usePracticeMatrix";
import { useCompleteObservationTask } from "@/hooks/useTasks";
import { useAwardKarma } from "@/hooks/useKarma";
import { toast } from "@/hooks/use-toast";
import { conscious } from "@/lib/consciousToast";
import type { ObservationTask } from "@/types/database";
import type { PracticeId } from "@/types/practices";
import { getPracticeById } from "@/types/practices";

import NowHero from "@/components/practice/dojo/NowHero";
import PathMatrixGrid from "@/components/practice/dojo/PathMatrixGrid";
import ChainStrip from "@/components/practice/dojo/ChainStrip";
import PathDetailSheet from "@/components/practice/dojo/PathDetailSheet";
import ThemePracticeSession from "@/components/practice/ThemePracticeSession";
// PracticeLaunchSheet removed — cinematic PracticeRunner used instead
import PracticeRunner from "@/components/practice/PracticeRunner";
import OffAppTab from "@/components/practice/OffAppTab";
import MicroTab from "@/components/practice/MicroTab";
import RitualsTab from "@/components/practice/RitualsTab";
import LibraryTab from "@/components/practice/LibraryTab";
import ForYouTab from "@/components/practice/ForYouTab";
import { usePrefetchForYou } from "@/hooks/useForYouPractices";
import PersonalizationLockedCard from "@/components/practice/PersonalizationLockedCard";
import { usePersonalizationReadiness } from "@/hooks/usePersonalizationReadiness";
import { useOnboardingPath } from "@/hooks/useOnboardingPath";
import { useCompleteGate } from "@/hooks/useSpiritualDNA";
import { isGateId } from "@/lib/consciousness/dailyGates";
import { useNextSession } from "@/hooks/useNextSession";
import PlanStrip from "@/components/practice/PlanStrip";
import SuitabilityCard from "@/components/practice/SuitabilityCard";
import TeachingCards from "@/components/practice/TeachingCards";
import {
  buildThirtyDayPlan,
  decideSuitability,
  loadSuitability,
  saveSuitability,
  type SuitabilityInput,
} from "@/lib/prescription";

type PracticeTab = "today" | "foryou" | "offapp" | "rituals" | "micro" | "library";

const TABS: { id: PracticeTab; label: string; emoji: string }[] = [
  { id: "today",   label: "Today",   emoji: "✨" },
  { id: "foryou",  label: "For You", emoji: "🪞" },
  { id: "offapp",  label: "Off-App", emoji: "🌿" },
  { id: "rituals", label: "Rituals", emoji: "📿" },
  { id: "micro",   label: "Micro",   emoji: "⚡" },
];

const PRACTICE_EMOJI: Record<string, string> = {
  observation: "👁️",
  self_inquiry: "🔍",
  "self-inquiry": "🔍",
  breath: "🌬️",
  witnessing: "🪷",
  body: "🫁",
  bhakti: "❤️",
  karma: "🤲",
  jnana: "📖",
  raja: "👑",
  kriya: "⚡",
  tantra: "🔥",
  neuroscience: "🧬",
  "emotional-healing": "💧",
  "loop-dissolution": "🔓",
  relationship: "💞",
  "work-career": "💼",
  finance: "💰",
  health: "🏥",
};

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gateParam = searchParams.get("gate");
  const requestedGate = isGateId(gateParam) ? gateParam : null;
  const completeGate = useCompleteGate();
  const { data: themeData, isLoading: themeLoading } = useThemeOfDay();
  const { data: pack, isLoading: packLoading } = useTodayPracticePack();
  const compose = useComposeTodayPractice();
  const { data: levels } = usePracticeLevels();

  // Background-prefetch For You so the tab opens instantly (cached per day)
  usePrefetchForYou();

  const completeObservation = useCompleteObservationTask();
  const awardKarma = useAwardKarma();

  const [sessionOpen, setSessionOpen] = useState(false);  // launchOpen removed — runner opens directly
  const [tab, setTab] = useState<PracticeTab>("today");
  const [detailId, setDetailId] = useState<PracticeId | null>(null);
  const [runnerId, setRunnerId] = useState<PracticeId | null>(null);

  // Safety + horizon. These sit above the dojo pick so the app can say
  // "rest today" or "6 minutes, not 20" before offering any practice.
  const { plan: nextPlan } = useNextSession();
  const [suitability, setSuitability] = useState<SuitabilityInput>(() => loadSuitability());
  const suitabilityDecision = useMemo(() => decideSuitability(suitability), [suitability]);
  const thirtyDay = useMemo(
    () =>
      buildThirtyDayPlan(nextPlan?.need?.concept ?? "observation", suitabilityDecision, {
        completedSessions: nextPlan?.prescription?.completedSessions ?? 0,
      }),
    [nextPlan?.need?.concept, nextPlan?.prescription?.completedSessions, suitabilityDecision],
  );

  const completeRequestedGate = async () => {
    if (!requestedGate) return;
    try {
      await completeGate.mutateAsync({ gate: requestedGate });
    } catch (error) {
      console.error("Practice completed but daily gate progress could not be updated", error);
      toast({ title: "Practice completed, but this daily gate could not be marked complete.", variant: "destructive" });
    }
  };

  // Auto-compose today's pack on first load if missing
  useEffect(() => {
    if (!packLoading && !pack && !compose.isPending) {
      compose.mutate(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packLoading, pack]);

  // ─── Resolve "Now" hero from data
  const theme = themeData?.theme as any;
  const recommended = theme?.recommended_practice;
  const firstPick = pack?.practices?.[0];

  const heroEmoji =
    firstPick?.emoji ||
    PRACTICE_EMOJI[firstPick?.practice ?? ""] ||
    PRACTICE_EMOJI[recommended?.type ?? ""] ||
    "✨";
  const heroTitle = firstPick?.title || recommended?.title || "Begin where you are";
  const heroSubtitle =
    firstPick?.why ||
    recommended?.why ||
    (theme?.sub_angle ? `Today's thread: ${theme.sub_angle}` : "Settle in. Let awareness lead.");
  const heroDuration = firstPick?.duration ?? recommended?.duration_min ?? 5;
  const heroBadge = useMemo(() => {
    if (firstPick?.practice && firstPick?.level) {
      const def = getPracticeById(firstPick.practice as PracticeId);
      if (def) return `${def.label} · L${firstPick.level}`;
    }
    if (theme?.title) return theme.title;
    return null;
  }, [firstPick, theme?.title]);

  // ─── Observation chain (preserve existing data path)
  const observationTasks: ObservationTask[] =
    (themeData?.observationTasks as ObservationTask[]) || [];
  const activeTask = observationTasks.find((t) => t.status === "active");
  const completedCount = observationTasks.filter((t) => t.status === "completed").length;

  const handleObservationSubmit = (text: string) => {
    if (!activeTask) return;
    completeObservation.mutate(
      { taskId: activeTask.id, reflection: text },
      {
        onSuccess: () => {
          awardKarma.mutate({ source: "observation_task", weight: 1.2, metadata: { taskId: activeTask.id } });
          toast({ title: "✨ Observation woven into the chain" });
        },
        onError: () =>
          conscious("actionMissed", { kind: "error" }),
      },
    );
  };

  const recommendedMatrixId = (firstPick?.practice ?? recommended?.type ?? null) as string | null;

  const loadingHero = (themeLoading || packLoading || compose.isPending) && !theme;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-20 lg:max-w-4xl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between px-1 pt-2"
      >
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Practice
          </h1>
          {theme?.title && (
            <p className="mt-1 text-xs font-body text-muted-foreground">
              <span className="text-primary/80">●</span> Theme · {theme.title}
            </p>
          )}
        </div>
      </motion.header>

      {/* Tab switcher — gated tabs hidden until foundation (1 session + 1 mirror) complete */}
      <GatedTabBar tab={tab} setTab={setTab} />


      {tab === "today" && (
        <>
          {/* NOW — the one decision */}
          {loadingHero ? (
            <div className="rounded-[28px] border border-border/30 bg-card/30 p-12 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-3 text-sm font-body text-muted-foreground">
                Composing your practice…
              </span>
            </div>
          ) : (
            <NowHero
              emoji={heroEmoji}
              title={heroTitle}
              subtitle={heroSubtitle}
              durationMin={heroDuration}
              badge={heroBadge}
              loading={compose.isPending}
              onBegin={() => {
                if (theme) {
                  setSessionOpen(true);
                  return;
                }
                // Fallback: open cinematic runner with the recommended practice
                const raw = (firstPick?.practice ?? recommended?.type ?? "observation") as string;
                const id = (raw.replace("_", "-") as PracticeId);
                setRunnerId(id);
              }}
            />
          )}

          {/* CHAIN — observation continuity */}
          <ChainStrip
            activeTitle={activeTask?.title ?? null}
            activeDomain={activeTask?.domain ?? null}
            total={observationTasks.length}
            completed={completedCount}
            submitting={completeObservation.isPending}
            onSubmit={handleObservationSubmit}
          />

          {/* SAFETY — sleep, pain, panic change the dose */}
          <SuitabilityCard
            value={suitability}
            decision={suitabilityDecision}
            onChange={(next) => {
              setSuitability(next);
              saveSuitability(next);
            }}
          />

          {/* HORIZON — spiral, arc, next session, 30-day gates */}
          <PlanStrip
            plan={thirtyDay}
            prescription={nextPlan?.prescription}
            path={nextPlan?.graphSpec?.path}
          />

          {/* CORRECTION — meditation is not mind-holding; observer in 3 sits */}
          <TeachingCards />

          <Link
            to="/app/self-model"
            className="block rounded-2xl border border-border/40 bg-card/60 px-4 py-3 text-sm hover:border-primary/40"
          >
            My 12-layer model →
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Body, emotion, thought, identity, work, meaning — with evidence and a 10-year estimate.
            </span>
          </Link>

          <Link
            to="/app/arcs"
            className="block rounded-2xl border border-border/40 bg-card/60 px-4 py-3 text-sm hover:border-primary/40"
          >
            Practice arcs →
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Observer, self-inquiry, Bhakti, Jnana, Karma, Raja — five sits each, one door per sit.
            </span>
          </Link>

          <Link
            to="/app/plan"
            className="block rounded-2xl border border-border/40 bg-card/60 px-4 py-3 text-sm hover:border-primary/40"
          >
            My practice plan →
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              One day, one season, ten years — generated from your 12-layer model.
            </span>
          </Link>

          <Link
            to="/app/practice/orb"
            className="block rounded-2xl border border-primary/30 bg-primary/8 px-4 py-3 text-sm hover:border-primary/50"
          >
            Orb practice bank →
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Voice-led sittings from one second to twelve hours — the orb speaks, listens, and holds the time.
            </span>
          </Link>

          {/* PATH — visible mastery */}
          <PathMatrixGrid
            levels={(levels as any) ?? {}}
            recommendedId={recommendedMatrixId}
            onSelect={(id) => setDetailId(id)}
          />

        </>
      )}

      {tab === "foryou" && <GatedTab tabLabel="For You"><ForYouTab /></GatedTab>}
      {tab === "offapp" && <OffAppTab />}
      {tab === "rituals" && <GatedTab tabLabel="Rituals"><RitualsTab /></GatedTab>}
      {tab === "micro" && <MicroTab />}
      {tab === "library" && <LibraryTab />}
      {/* ─── Sheets & sessions ─── */}
      <AnimatePresence>
        {sessionOpen && theme && (
          <ThemePracticeSession
            theme={theme}
            onClose={() => setSessionOpen(false)}
            onComplete={completeRequestedGate}
          />
        )}
      </AnimatePresence>

      

      <PathDetailSheet
        practiceId={detailId}
        currentLevel={
          detailId
            ? Number(((levels as any) ?? {})[detailId.replace("-", "_")] ?? 0)
            : 0
        }
        open={!!detailId}
        onOpenChange={(v) => !v && setDetailId(null)}
        onPracticeNow={(id) => {
          setDetailId(null);
          setRunnerId(id);
        }}
      />

      {/* Cinematic full-screen runner — opens on tap of any practice */}
      <AnimatePresence>
        {runnerId && (
          <PracticeRunner
            practiceId={runnerId}
            currentLevel={Number(((levels as any) ?? {})[runnerId.replace("-", "_")] ?? 0)}
            onClose={() => setRunnerId(null)}
            onComplete={completeRequestedGate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * GatedTab — wraps personalization-dependent tabs (For You, Off-App, Rituals)
 * Renders the live tab when the user has at least 1 completed session AND
 * 1 completed mirror; otherwise shows the locked card with next steps.
 */
function GatedTab({ tabLabel, children }: { tabLabel: string; children: React.ReactNode }) {
  const { data } = usePersonalizationReadiness();
  const { data: path } = useOnboardingPath();
  if (path === "quick" || data.ready) return <>{children}</>;
  return (
    <PersonalizationLockedCard
      tabLabel={tabLabel}
      needsSession={data.needsSession}
      needsMirror={data.needsMirror}
      sessionsCompleted={data.sessionsCompleted}
      mirrorsCompleted={data.mirrorsCompleted}
    />
  );
}

/**
 * GatedTabBar — hides For You / Off-App / Rituals tabs until the user has
 * completed at least 1 session AND 1 mirror (the "foundation"). Always shows
 * Today, Micro, Library. Quick-path users (4-question onboarding) see all tabs
 * immediately because their 4Q calibration acts as the baseline.
 */
const GATED_TAB_IDS: PracticeTab[] = ["foryou", "rituals"];
function GatedTabBar({ tab, setTab }: { tab: PracticeTab; setTab: (t: PracticeTab) => void }) {
  const { data } = usePersonalizationReadiness();
  const { data: path } = useOnboardingPath();
  const unlocked = path === "quick" || data.ready;
  const visible = TABS.filter((t) => unlocked || !GATED_TAB_IDS.includes(t.id));
  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {visible.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display tracking-wide transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-card/40 text-muted-foreground hover:text-foreground border border-border/30"
            }`}
          >
            <span className="text-sm">{t.emoji}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
