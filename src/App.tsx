import { Suspense, lazy, useEffect, useRef } from "react";
import { Toaster } from "@/design-system";
import { SonnerToaster as Sonner } from "@/design-system";
import InstallPWA from "@/components/InstallPWA";
import { TooltipProvider } from "@/design-system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { indexedDBPersister } from "@/lib/queryPersister";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import { LanguageProvider } from "@/contexts/LanguageContext";
import FirstRunLanguageGate from "@/components/language/FirstRunLanguageGate";
import { SoundProvider } from "@/contexts/SoundContext";
import { supabase } from "@/lib/supabase";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalErrorRedirect from "@/components/GlobalErrorRedirect";
import { OversoulOrbPage } from "@/components/OversoulOrb";
import { GlobalPresenceOrb } from "@/components/orb";

import AppPreloader from "@/components/AppPreloader";
import { resolveScreenPlaceholder } from "@/lib/ui/screenPlaceholder";

// Eager â€” only the landing entry (public "/") pays first-paint cost.
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Gates from "./pages/Gates";
// AppEntry + Home are lazy so signed-out visitors don't pay ~40KB for auth-only screens.
const AppEntry = lazy(() => import("./pages/AppEntry"));
const Home = lazy(() => import("./pages/Home"));

// Lazy â€” code-split routes. We prefetch them all in the background after first
// paint so navigation feels instant and the Suspense fallback is never shown.
const lazyImporters = {
  HopeLanding:               () => import("./pages/hope/HopeLanding"),
  Practice:                  () => import("./pages/Practice"),
  Guide:                     () => import("./pages/Guide"),
  AppGuide:                  () => import("./pages/AppGuide"),
  Journal:                   () => import("./pages/Journal"),
  Analytics:                 () => import("./pages/Analytics"),
  OpsDashboard:              () => import("./pages/OpsDashboard"),
  Settings:                  () => import("./pages/Settings"),
  SessionWidgets:            () => import("./pages/SessionWidgets"),
  Credits:                   () => import("./pages/Credits"),
  Council:                   () => import("./pages/Council"),
  DharmaOracle:              () => import("./pages/DharmaOracle"),
  KoshaScanner:              () => import("./pages/KoshaScanner"),
  Masters:                   () => import("./pages/Masters"),
  FoundationCourse:          () => import("./pages/FoundationCourse"),
  PreJourney:                () => import("./pages/PreJourney"),
  FirstEleven:               () => import("./pages/FirstEleven"),
  AwakeningJourney:          () => import("./pages/AwakeningJourney"),
  SpiralPage:                () => import("./pages/SpiralPage"),
  JourneyPickerPage:         () => import("./pages/JourneyPickerPage"),
  Explore:                   () => import("./pages/Explore"),
  TheMirrorPage:             () => import("./pages/TheMirrorPage"),
  Library:                   () => import("./pages/Library"),
  ExploreLibrary:            () => import("./pages/ExploreLibrary"),
  ExploreCategory:           () => import("./pages/ExploreCategory"),
  ItemDetailPage:            () => import("./pages/ItemDetailPage"),
  MemoryVault:               () => import("./pages/MemoryVault"),
  LifeAndLegacy:             () => import("./pages/LifeAndLegacy"),
  AssessmentRunner:          () => import("./pages/AssessmentRunner"),
  AssessmentResult:          () => import("./pages/AssessmentResult"),
  MeetYourself:              () => import("./pages/MeetYourself"),
  YourSelf:                  () => import("./pages/YourSelf"),
  Constellation:             () => import("./pages/Constellation"),
  ConstellationEvolution:    () => import("./pages/ConstellationEvolution"),
  SignalConsentCenterPage:   () => import("@/components/integrations/SignalConsentCenter"),
  SentientDashboard:         () => import("@/components/integrations/SentientDashboard"),
  JourneyProgressOutside:    () => import("./components/temple/JourneyProgressOutside"),
  InnerLLMsLanding:          () => import("./components/temple/InnerLLMsLanding"),
  EnterpriseLayout:          () => import("./components/enterprise/EnterpriseLayout"),
  EnterpriseDashboard:       () => import("./pages/enterprise/EnterpriseDashboard"),
  EnterpriseEmployees:       () => import("./pages/enterprise/EnterpriseEmployees"),
  EnterpriseTeams:           () => import("./pages/enterprise/EnterpriseTeams"),
  EnterpriseManagers:        () => import("./pages/enterprise/EnterpriseManagers"),
  EnterpriseInvite:          () => import("./pages/enterprise/EnterpriseInvite"),
  EnterpriseSettings:        () => import("./pages/enterprise/EnterpriseSettings"),
  CreateOrganization:        () => import("./pages/enterprise/CreateOrganization"),
  EnterpriseAuth:            () => import("./pages/enterprise/EnterpriseAuth"),
  EmployeeDetail:            () => import("./pages/enterprise/EmployeeDetail"),
  EmployeePortal:            () => import("./pages/enterprise/EmployeePortal"),
  EnterpriseReports:         () => import("./pages/enterprise/EnterpriseReports"),
  EnterpriseChallenges:      () => import("./pages/enterprise/EnterpriseChallenges"),
  ManagerCoaching:           () => import("./pages/enterprise/ManagerCoaching"),
  EnterpriseContact:         () => import("./pages/enterprise/EnterpriseContact"),
  EnterprisePrivacy:         () => import("./pages/enterprise/EnterprisePrivacy"),
  EnterpriseOrgMirror:       () => import("./pages/enterprise/EnterpriseOrgMirror"),
  EnterpriseBoard:           () => import("./pages/enterprise/EnterpriseBoard"),
  EnterprisePeerCircles:     () => import("./pages/enterprise/EnterprisePeerCircles"),
  EnterpriseProgramDesigner: () => import("./pages/enterprise/EnterpriseProgramDesigner"),
  EnterprisePeople:          () => import("./pages/enterprise/EnterprisePeople"),
  AdminLayout:               () => import("./components/admin/AdminLayout"),
  AdminDashboard:            () => import("./pages/admin/AdminDashboard"),
  AdminUsers:                () => import("./pages/admin/AdminUsers"),
  AdminUserDetail:           () => import("./pages/admin/AdminUserDetail"),
  AdminAnalytics:            () => import("./pages/admin/AdminAnalytics"),
  AdminEnterprise:           () => import("./pages/admin/AdminEnterprise"),
  AdminActivityFeed:         () => import("./pages/admin/AdminActivityFeed"),
  AdminCopilot:              () => import("./pages/admin/AdminCopilot"),
  AdminHealth:               () => import("./pages/admin/AdminHealth"),
  AdminSessions:             () => import("./pages/admin/AdminSessions"),
  AdminCosts:                () => import("./pages/admin/AdminCosts"),
  AdminWaitlist:             () => import("./pages/admin/AdminWaitlist"),
  AdminTraining:             () => import("./pages/admin/AdminTraining"),
  AdminPowerTools:           () => import("./pages/admin/AdminPowerTools"),
  AdminPredictive:           () => import("./pages/admin/AdminPredictive"),
  AdminBI:                   () => import("./pages/admin/AdminBI"),
  Blog:                      () => import("./pages/Blog"),
  BlogPost:                  () => import("./pages/BlogPost"),
  Knowledge:                 () => import("./pages/Knowledge"),
  KnowledgeCategory:         () => import("./pages/KnowledgeCategory"),
  KnowledgeEssay:            () => import("./pages/KnowledgeEssay"),
  Loops:                     () => import("./pages/Loops"),
  LoopDetail:                () => import("./pages/LoopDetail"),
  AdminSEO:                  () => import("./pages/admin/AdminSEO"),
  Games:                     () => import("./pages/Games"),
  GameRoute:                 () => import("./pages/GameRoute"),
  GamesPage:                 () => import("./pages/Games"),
  GameInsights:              () => import("./pages/GameInsights"),
  PracticesPage:             () => import("./pages/Practices"),
  OrbPractice:               () => import("./pages/OrbPractice"),
  ExperimentsPage:           () => import("./pages/Experiments"),
  CinematicJourney:           () => import("./pages/CinematicJourney"),
  GenerativeSession:         () => import("./pages/GenerativeSessionPage"),
  FrameworkLibrary:          () => import("./pages/FrameworkLibrary"),
  FrameworkSession:          () => import("./pages/FrameworkSession"),
  ProgramsPage:              () => import("./pages/ProgramsPage"),
  ProgramDetailPage:         () => import("./pages/ProgramDetailPage"),
} as const;

const HopeLanding               = lazy(lazyImporters.HopeLanding);
  const Temple                     = lazy(() => import("./pages/Temple"));
const Bience                   = lazy(() => import("./pages/Bience"));
const Practice                  = lazy(lazyImporters.Practice);
const OrbPractice               = lazy(lazyImporters.OrbPractice);
const ArcsPage                  = lazy(() => import("./pages/ArcsPage"));
const ArcRunPage                = lazy(() => import("./pages/ArcRunPage"));
const HumanModelPage            = lazy(() => import("./pages/HumanModelPage"));
const LifePlanPage              = lazy(() => import("./pages/LifePlanPage"));
const ContentReviewPage         = lazy(() => import("./pages/ContentReviewPage"));
const Guide                     = lazy(lazyImporters.Guide);
const AppGuide                  = lazy(lazyImporters.AppGuide);
const Journal                   = lazy(lazyImporters.Journal);
const Analytics                 = lazy(lazyImporters.Analytics);
const OpsDashboard              = lazy(lazyImporters.OpsDashboard);
const Settings                  = lazy(lazyImporters.Settings);
const SessionWidgets            = lazy(lazyImporters.SessionWidgets);
const Credits                   = lazy(lazyImporters.Credits);
const Council                   = lazy(lazyImporters.Council);
const DharmaOracle               = lazy(lazyImporters.DharmaOracle);
const KoshaScanner               = lazy(lazyImporters.KoshaScanner);
const Masters                   = lazy(lazyImporters.Masters);
const FoundationCourse          = lazy(lazyImporters.FoundationCourse);
const PreJourney                = lazy(lazyImporters.PreJourney);
  const FirstEleven               = lazy(lazyImporters.FirstEleven);
  const AwakeningJourney          = lazy(lazyImporters.AwakeningJourney);
const SpiralPage                = lazy(lazyImporters.SpiralPage);
const JourneyPickerPage         = lazy(lazyImporters.JourneyPickerPage);
  const Explore                   = lazy(lazyImporters.Explore);
  const TheMirrorPage             = lazy(lazyImporters.TheMirrorPage);
const Library                   = lazy(lazyImporters.Library);
const ExploreLibrary            = lazy(lazyImporters.ExploreLibrary);
const ExploreCategory           = lazy(lazyImporters.ExploreCategory);
const ItemDetailPage            = lazy(lazyImporters.ItemDetailPage);
const MemoryVault               = lazy(lazyImporters.MemoryVault);
const LifeAndLegacy             = lazy(lazyImporters.LifeAndLegacy);
const AssessmentRunner          = lazy(lazyImporters.AssessmentRunner);
const AssessmentResult          = lazy(lazyImporters.AssessmentResult);
const MeetYourself              = lazy(lazyImporters.MeetYourself);
const YourSelf                  = lazy(lazyImporters.YourSelf);
const Constellation             = lazy(lazyImporters.Constellation);
const ConstellationEvolution    = lazy(lazyImporters.ConstellationEvolution);
const SignalConsentCenterPage   = lazy(lazyImporters.SignalConsentCenterPage);
const SentientDashboard         = lazy(lazyImporters.SentientDashboard);
import SentientWatchersProvider from "@/components/integrations/SentientWatchersProvider";
import { useAppFreshness } from "@/hooks/useAppFreshness";

function AppFreshnessGuard() {
  useAppFreshness();
  return null;
}
const JourneyProgressOutside    = lazy(lazyImporters.JourneyProgressOutside);
const Showroom                  = lazy(() => import("./pages/showroom/Showroom"));
const ShowroomProgram           = lazy(() => import("./pages/showroom/ShowroomProgram"));
const ShowroomDay               = lazy(() => import("./pages/showroom/ShowroomDay"));
const ShowroomDaySession        = lazy(() => import("./pages/showroom/ShowroomDaySession"));
const ShowroomHandbook          = lazy(() => import("./pages/showroom/ShowroomHandbook"));
const AppIntro                  = lazy(() => import("./pages/AppIntro"));
const ExperienceIntro           = lazy(() => import("./pages/experience/ExperienceIntro"));
const ExperiencePaths           = lazy(() => import("./pages/experience/ExperiencePaths"));
const ExperiencePathDetail      = lazy(() => import("./pages/experience/ExperiencePathDetail"));
const PathLevelSession          = lazy(() => import("./pages/experience/PathLevelSession"));
const PathLevelFullSession      = lazy(() => import("./pages/experience/PathLevelFullSession"));
const ExperienceProgramsCatalog = lazy(() => import("./pages/experience/ExperiencePrograms"));
const ExperienceGames           = lazy(() => import("./pages/experience/ExperienceGames"));
const ExperiencePractices       = lazy(() => import("./pages/experience/ExperiencePractices"));
const PracticeLiveSession       = lazy(() => import("./pages/experience/PracticeLiveSession"));
const MantraLiveSession         = lazy(() => import("./pages/experience/MantraLiveSession"));
const ExperienceObservation     = lazy(() => import("./pages/experience/ExperienceObservation"));
const ObservationLiveSession      = lazy(() => import("./pages/experience/ObservationLiveSession"));
const ExperienceSelfInquiry     = lazy(() => import("./pages/experience/ExperienceSelfInquiry"));
const SelfInquiryLiveSession    = lazy(() => import("./pages/experience/SelfInquiryLiveSession"));
const ExperienceNetiNeti        = lazy(() => import("./pages/experience/ExperienceNetiNeti"));
const NetiNetiLiveSession       = lazy(() => import("./pages/experience/NetiNetiLiveSession"));
const ExperiencePranayama       = lazy(() => import("./pages/experience/ExperiencePranayama"));
const PranayamaLiveSession      = lazy(() => import("./pages/experience/PranayamaLiveSession"));
const ExperienceWisdom          = lazy(() => import("./pages/experience/ExperienceWisdom"));
const ShaktiSadhanaSession      = lazy(() => import("./pages/experience/ShaktiSadhanaSession"));
const ExperienceLineage         = lazy(() => import("./pages/experience/ExperienceLineage"));
const ExperienceGlossary        = lazy(() => import("./pages/experience/ExperienceGlossary"));
const ExperiencePrerequisites   = lazy(() => import("./pages/experience/ExperiencePrerequisites"));
const ExperienceLoopsAtlas      = lazy(() => import("./pages/experience/ExperienceLoopsAtlas"));
const ExperienceBridges         = lazy(() => import("./pages/experience/ExperienceBridges"));
const InnerLLMsLanding          = lazy(lazyImporters.InnerLLMsLanding);
const EnterpriseLayout          = lazy(lazyImporters.EnterpriseLayout);
const EnterpriseDashboard       = lazy(lazyImporters.EnterpriseDashboard);
const EnterpriseEmployees       = lazy(lazyImporters.EnterpriseEmployees);
const EnterpriseTeams           = lazy(lazyImporters.EnterpriseTeams);
const EnterpriseManagers        = lazy(lazyImporters.EnterpriseManagers);
const EnterpriseInvite          = lazy(lazyImporters.EnterpriseInvite);
const EnterpriseSettings        = lazy(lazyImporters.EnterpriseSettings);
const CreateOrganization        = lazy(lazyImporters.CreateOrganization);
const EnterpriseAuth            = lazy(lazyImporters.EnterpriseAuth);
const EmployeeDetail            = lazy(lazyImporters.EmployeeDetail);
const EmployeePortal            = lazy(lazyImporters.EmployeePortal);
const EnterpriseReports         = lazy(lazyImporters.EnterpriseReports);
const EnterprisePeople          = lazy(lazyImporters.EnterprisePeople);
const EnterpriseChallenges      = lazy(lazyImporters.EnterpriseChallenges);
const ManagerCoaching           = lazy(lazyImporters.ManagerCoaching);
const EnterpriseContact         = lazy(lazyImporters.EnterpriseContact);
const EnterprisePrivacy         = lazy(lazyImporters.EnterprisePrivacy);
const EnterpriseOrgMirror       = lazy(lazyImporters.EnterpriseOrgMirror);
const EnterpriseBoard           = lazy(lazyImporters.EnterpriseBoard);
const EnterprisePeerCircles     = lazy(lazyImporters.EnterprisePeerCircles);
const EnterpriseProgramDesigner = lazy(lazyImporters.EnterpriseProgramDesigner);
const AdminLayout               = lazy(lazyImporters.AdminLayout);
const AdminDashboard            = lazy(lazyImporters.AdminDashboard);
const AdminUsers                = lazy(lazyImporters.AdminUsers);
const AdminUserDetail           = lazy(lazyImporters.AdminUserDetail);
const AdminAnalytics            = lazy(lazyImporters.AdminAnalytics);
const AdminEnterprise           = lazy(lazyImporters.AdminEnterprise);
const AdminActivityFeed         = lazy(lazyImporters.AdminActivityFeed);
const AdminCopilot              = lazy(lazyImporters.AdminCopilot);
const AdminHealth               = lazy(lazyImporters.AdminHealth);
const AdminSessions             = lazy(lazyImporters.AdminSessions);
const AdminCosts                = lazy(lazyImporters.AdminCosts);
const AdminWaitlist             = lazy(lazyImporters.AdminWaitlist);
const AdminTraining             = lazy(lazyImporters.AdminTraining);
const AdminPowerTools           = lazy(lazyImporters.AdminPowerTools);
const AdminPredictive           = lazy(lazyImporters.AdminPredictive);
const AdminBI                   = lazy(lazyImporters.AdminBI);
const Blog                      = lazy(lazyImporters.Blog);
const BlogPost                  = lazy(lazyImporters.BlogPost);
const Knowledge                 = lazy(lazyImporters.Knowledge);
const KnowledgeCategory         = lazy(lazyImporters.KnowledgeCategory);
const KnowledgeEssay            = lazy(lazyImporters.KnowledgeEssay);
const Loops                     = lazy(lazyImporters.Loops);
const LoopDetail                = lazy(lazyImporters.LoopDetail);
const AdminSEO                  = lazy(lazyImporters.AdminSEO);
const Games                     = lazy(lazyImporters.Games);
const GameRoute                 = lazy(lazyImporters.GameRoute);
const GamesPage                 = lazy(lazyImporters.GamesPage);
const PracticesPage             = lazy(lazyImporters.PracticesPage);
const ExperimentsPage           = lazy(lazyImporters.ExperimentsPage);

const GameInsights              = lazy(lazyImporters.GameInsights);
const ProgramsPage              = lazy(lazyImporters.ProgramsPage);
const ProgramDetailPage         = lazy(lazyImporters.ProgramDetailPage);
const CinematicJourney          = lazy(lazyImporters.CinematicJourney);
const GenerativeSession         = lazy(lazyImporters.GenerativeSession);
const FrameworkLibrary          = lazy(lazyImporters.FrameworkLibrary);
const FrameworkSession          = lazy(lazyImporters.FrameworkSession);
const ProgramsV3                = lazy(() => import("./pages/ProgramsV3"));
const Dictionary                = lazy(() => import("./pages/Dictionary"));
const StageHandbook             = lazy(() => import("./pages/StageHandbook"));
const Launch                    = lazy(() => import("./pages/Launch"));

/**
 * Prefetch every code-split chunk in the background after first paint.
 * Uses requestIdleCallback so it never competes with user interaction.
 * Result: by the time the user navigates, the chunk is already in memory and
 * the Suspense fallback below never has to show.
 */
/**
 * Two-stage background prefetch to keep the landing-page network graph small
 * (Lighthouse "Network dependency tree" / LCP).
 *
 * Stage 1 (after 2s idle): only the handful of routes a freshly-landed user
 *   is most likely to navigate to next.
 * Stage 2 (after first user interaction): everything else (admin, enterprise,
 *   blog, charts, etc.) â€” no longer competes with initial paint.
 */
if (typeof window !== "undefined") {
  const idle = (cb: () => void) =>
    (window as any).requestIdleCallback?.(cb, { timeout: 3000 }) ?? setTimeout(cb, 300);

  const PRIORITY_KEYS: Array<keyof typeof lazyImporters> = [
    "HopeLanding", "Practice", "Guide", "Journal", "Settings",
  ];

  setTimeout(() => {
    PRIORITY_KEYS.forEach((k) => idle(() => { lazyImporters[k]?.().catch(() => {}); }));
  }, 2000);

  // Do not prefetch the entire app in preview. The old "warm everything"
  // path could request dozens of heavy routes/assets at once and leave the
  // iframe looking like a blank black screen while Vite was busy compiling.
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 min â€” data stays fresh
      gcTime: 1000 * 60 * 60 * 24, // 24h â€” keep in cache for persistence
      refetchOnWindowFocus: false,
    },
  },
});

// 24h max cache age for IndexedDB persistence
const persistOptions = {
  persister: indexedDBPersister,
  maxAge: 1000 * 60 * 60 * 24,
  buster: 'v2-journey-day-fix', // bump to invalidate stale persisted cache
};

function RouteFallback() {
  const { pathname } = useLocation();
  const { screen, width, label } = resolveScreenPlaceholder(pathname);
  return (
    <AppPreloader
      screen={screen}
      width={width}
      label={`Opening ${label}â€¦`}
      className="min-h-[100dvh]"
    />
  );
}

/**
 * Clears TanStack Query cache + IndexedDB persistence when user changes.
 * Prevents data leaking between accounts on the same device.
 */
function AuthCacheClearer() {
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Set initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      lastUserIdRef.current = user?.id ?? null;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id ?? null;
      const prevUserId = lastUserIdRef.current;

      // Clear cache on sign out, or when a different user signs in
      if (
        event === 'SIGNED_OUT' ||
        (event === 'SIGNED_IN' && prevUserId && newUserId && prevUserId !== newUserId) ||
        (event === 'SIGNED_IN' && prevUserId === null && newUserId)
      ) {
        queryClient.clear();
        indexedDBPersister.removeClient();
        // Also clear any theme cache in localStorage
        try { localStorage.removeItem("satyug-app-theme-of-day"); } catch { }
      }

      lastUserIdRef.current = newUserId;
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

const App = () => (
  <ErrorBoundary>
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <AppFreshnessGuard />
      <AuthCacheClearer />
      <MotionConfig reducedMotion="user">
      <SoundProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPWA />
          <BrowserRouter>
            <LanguageProvider>
            <FirstRunLanguageGate>
            <GlobalErrorRedirect />
            <SentientWatchersProvider />
            <GlobalPresenceOrb />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/knowledge/:category" element={<KnowledgeCategory />} />
                  <Route path="/knowledge/:category/:slug" element={<KnowledgeEssay />} />
                  <Route path="/loops" element={<Loops />} />
                  <Route path="/loops/:slug" element={<LoopDetail />} />
{/* Cinematic Journey â€” mounted OUTSIDE AppLayout so no navbar/bottom-bar chrome leaks through */}
                   <Route path="/app/cinematic-journey" element={<CinematicJourney />} />
                   <Route path="/app/orb" element={<OversoulOrbPage />} />
                   <Route path="/app/ops" element={<OpsDashboard />} />
                    <Route path="/hope-preview" element={<HopeLanding />} />
                  <Route path="/launch" element={<Launch />} />
                  <Route path="/experience/intro" element={<ExperienceIntro />} />
                  {/* Scroll-driven product tour â€” mounted outside AppLayout so no chrome leaks in */}
                  <Route path="/app-intro" element={<AppIntro />} />
                  <Route path="/experience" element={<Showroom />} />
                  <Route path="/experience/paths" element={<ExperiencePaths />} />
                  <Route path="/experience/paths/:slug" element={<ExperiencePathDetail />} />
                  <Route path="/experience/paths/:slug/level/:level/session" element={<PathLevelFullSession />} />
                  <Route path="/experience/paths/:slug/level/:level/orb" element={<PathLevelSession />} />
                  <Route path="/experience/programs" element={<ExperienceProgramsCatalog />} />
                  <Route path="/experience/games" element={<ExperienceGames />} />
                  <Route path="/experience/practices" element={<ExperiencePractices />} />
                  <Route path="/experience/practices/:slug/session" element={<PracticeLiveSession />} />
                  <Route path="/experience/mantra/session" element={<MantraLiveSession />} />
                  <Route path="/experience/observation" element={<ExperienceObservation />} />
                  <Route path="/experience/observation/session" element={<ObservationLiveSession />} />
                  <Route path="/experience/self-inquiry" element={<ExperienceSelfInquiry />} />
                  <Route path="/experience/self-inquiry/session" element={<SelfInquiryLiveSession />} />
                  <Route path="/experience/neti-neti" element={<ExperienceNetiNeti />} />
                  <Route path="/experience/neti-neti/session" element={<NetiNetiLiveSession />} />
                  <Route path="/experience/pranayama" element={<ExperiencePranayama />} />
                  <Route path="/experience/pranayama/session" element={<PranayamaLiveSession />} />
                  <Route path="/experience/wisdom" element={<ExperienceWisdom />} />
                  <Route path="/experience/shakti-sadhana" element={<ShaktiSadhanaSession />} />
                  <Route path="/experience/lineage" element={<ExperienceLineage />} />
                  <Route path="/experience/glossary" element={<ExperienceGlossary />} />
                  <Route path="/experience/prerequisites" element={<ExperiencePrerequisites />} />
                  <Route path="/experience/loops-atlas" element={<ExperienceLoopsAtlas />} />
                  <Route path="/experience/bridges" element={<ExperienceBridges />} />
                  <Route path="/experience/programs/:slug" element={<ShowroomProgram />} />
                  <Route path="/experience/programs/:slug/day/:day" element={<ShowroomDay />} />
                  <Route path="/experience/programs/:slug/day/:day/session" element={<ShowroomDaySession />} />
                  <Route path="/experience/handbooks/:slug" element={<ShowroomHandbook />} />
                   <Route path="/showroom" element={<Showroom />} />
                  <Route path="/showroom/programs/:slug" element={<ShowroomProgram />} />
                  <Route path="/showroom/programs/:slug/day/:day" element={<ShowroomDay />} />
                  <Route path="/showroom/programs/:slug/day/:day/session" element={<ShowroomDaySession />} />
                  <Route path="/showroom/handbooks/:slug" element={<ShowroomHandbook />} />
                  <Route path="/temple" element={<Temple />} />
                  <Route path="/bience" element={<Bience />} />
                  <Route path="/dictionary" element={<Navigate to="/handbook" replace />} />
                  <Route path="/handbook" element={<StageHandbook />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/app" element={<AppEntry />}>
                    <Route index element={<Home />} />
                    <Route path="practice" element={<Practice />} />
                    <Route path="practice/orb" element={<OrbPractice />} />
                    <Route path="observer" element={<ArcRunPage arcId="observer" />} />
                    <Route path="arcs" element={<ArcsPage />} />
                    <Route path="arcs/:arcId" element={<ArcRunPage />} />
                    <Route path="self-model" element={<HumanModelPage />} />
                    <Route path="plan" element={<LifePlanPage />} />
                    <Route path="review" element={<ContentReviewPage />} />
                    <Route path="guide" element={<Guide />} />
                    <Route path="guide/voice" element={<AppGuide />} />
                    <Route path="journal" element={<Journal />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="gates" element={<Gates />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="credits" element={<Credits />} />
                    <Route path="council" element={<Council />} />
                    <Route path="dharma-oracle" element={<DharmaOracle />} />
                    <Route path="kosha-scanner" element={<KoshaScanner />} />
                    <Route path="masters" element={<Masters />} />
                    {/* New 60-session + 32-mirror Foundation (orb + agenda + sessions) */}
                    <Route path="before" element={<PreJourney />} />
                    <Route path="pre-journey" element={<PreJourney />} />
                    <Route path="first-eleven" element={<FirstEleven />} />
                    <Route path="awakening" element={<AwakeningJourney />} />
                    <Route path="mirror" element={<TheMirrorPage />} />
                    <Route path="spiral" element={<SpiralPage />} />
                    <Route path="journeys" element={<JourneyPickerPage />} />
                     {/* Legacy 118-day curriculum kept reachable but not linked */}
                     <Route path="foundation" element={<FoundationCourse />} />
                     <Route path="meet-yourself" element={<MeetYourself />} />
                     <Route path="yourself" element={<YourSelf />} />
<Route path="library" element={<Library />} />
                      <Route path="library/item/:id" element={<ItemDetailPage />} />
                      <Route path="library/explore" element={<ExploreLibrary />} />
                      <Route path="library/explore/:slug" element={<ExploreCategory />} />
                      <Route path="explore" element={<Explore />} />
                    <Route path="memory" element={<MemoryVault />} />
                    <Route path="life-legacy" element={<LifeAndLegacy />} />
                    <Route path="library/result/:id" element={<AssessmentResult />} />
                    <Route path="library/:slug" element={<AssessmentRunner />} />
                    <Route path="constellation" element={<Constellation />} />
                    <Route path="constellation/evolution" element={<ConstellationEvolution />} />
                    <Route path="integrations" element={<SignalConsentCenterPage />} />
                     <Route path="sentient" element={<SentientDashboard />} />
                     <Route path="games" element={<GamesPage />} />
                     <Route path="games/:gameId" element={<GameRoute />} />
                     <Route path="games-insights" element={<GameInsights />} />
                     <Route path="practices" element={<PracticesPage />} />
                     <Route path="experiments" element={<ExperimentsPage />} />
                     <Route path="session/:sessionId" element={<GenerativeSession />} />
                     <Route path="widgets" element={<SessionWidgets />} />
                     <Route path="frameworks" element={<FrameworkLibrary />} />
                     <Route path="frameworks/:frameworkId" element={<FrameworkSession />} />
                     <Route path="programs" element={<ProgramsPage />} />
                     <Route path="programs/:slug" element={<ProgramDetailPage />} />
                     <Route path="programs-v3" element={<ProgramsV3 />} />
                     <Route path="cinematic-journey" element={<CinematicJourney />} />
                   </Route>
                  <Route path="/journey" element={<JourneyProgressOutside />} />
                  <Route path="/inner-llms" element={<InnerLLMsLanding />} />
                  <Route path="/enterprise/auth" element={<EnterpriseAuth />} />
                  <Route path="/enterprise/create" element={<CreateOrganization />} />
                  <Route path="/enterprise/contact" element={<EnterpriseContact />} />
                  <Route path="/enterprise/privacy" element={<EnterprisePrivacy />} />
                  <Route path="/enterprise" element={<EnterpriseLayout />}>
                    <Route index element={<EnterpriseDashboard />} />
                    <Route path="employees" element={<EnterpriseEmployees />} />
                    <Route path="employees/:userId" element={<EmployeeDetail />} />
                    <Route path="teams" element={<EnterpriseTeams />} />
                    <Route path="managers" element={<EnterpriseManagers />} />
                    <Route path="invite" element={<EnterpriseInvite />} />
                    <Route path="settings" element={<EnterpriseSettings />} />
                    <Route path="reports" element={<EnterpriseReports />} />
                    <Route path="people" element={<EnterprisePeople />} />
                    <Route path="challenges" element={<EnterpriseChallenges />} />
                    <Route path="coaching" element={<ManagerCoaching />} />
                    <Route path="org-mirror" element={<EnterpriseOrgMirror />} />
                    <Route path="board" element={<EnterpriseBoard />} />
                    <Route path="circles" element={<EnterprisePeerCircles />} />
                    <Route path="programs" element={<EnterpriseProgramDesigner />} />
                    <Route path="portal" element={<EmployeePortal />} />
                  </Route>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:userId" element={<AdminUserDetail />} />
                    <Route path="sessions" element={<AdminSessions />} />
                    <Route path="health" element={<AdminHealth />} />
                    <Route path="activity" element={<AdminActivityFeed />} />
                    <Route path="copilot" element={<AdminCopilot />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="enterprise" element={<AdminEnterprise />} />
                    <Route path="costs" element={<AdminCosts />} />
                    <Route path="waitlist" element={<AdminWaitlist />} />
                    <Route path="training" element={<AdminTraining />} />
                    <Route path="power" element={<AdminPowerTools />} />
                    <Route path="predictive" element={<AdminPredictive />} />
                    <Route path="bi" element={<AdminBI />} />
                    <Route path="seo" element={<AdminSEO />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </FirstRunLanguageGate>
            </LanguageProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SoundProvider>
      </MotionConfig>
    </PersistQueryClientProvider>
  </ErrorBoundary>
);

export default App;
