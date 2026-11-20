import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Home, Flame, BookOpen, PenLine, BarChart3, Moon, Sun, LogOut, Volume2, VolumeX, Settings, ChevronLeft, ChevronRight, Building2, Users, Library as LibraryIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { applyDesignTokens } from "@/design-system/tokens/apply";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSound } from "@/contexts/SoundContext";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useIdleNudge } from "@/hooks/useIdleNudge";
import { useJourneyNudge } from "@/hooks/useJourneyNudge";
import BrandLotus from "@/components/BrandLotus";
import { BrandName } from "@/components/BrandName";
import NotificationBell from "@/components/NotificationBell";
import { SacredExitButton } from "@/components/SacredExitButton";
import { SessionOrchestratorProvider } from "@/contexts/SessionOrchestratorContext";
import { CinematicSessionProvider } from "@/contexts/CinematicSessionContext";
import { PracticeRunControllerProvider, usePracticeRunController } from "@/contexts/PracticeRunControllerContext";
import SpiralStepBanner from "@/components/sutra/SpiralStepBanner";
import PracticeRunMoreMenu from "@/components/practice/PracticeRunMoreMenu";
import PracticeRunFullScreen from "@/components/practice/PracticeRunFullScreen";
import ConsciousnessBusListener from "@/components/ConsciousnessBusListener";
import { PresenceOrb } from "@/components/orb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/design-system";
import AppPreloader from "@/components/AppPreloader";
import { resolveScreenPlaceholder } from "@/lib/ui/screenPlaceholder";

// Primary destinations. Analytics sits beside the daily loop because records
// are read as often as the journal.
const tabs = [
  { title: "Home", path: "/app", icon: Home },
  { title: "Practice", path: "/app/practice", icon: Flame },
  { title: "Guide", path: "/app/guide", icon: BookOpen },
  { title: "Journal", path: "/app/journal", icon: PenLine },
  { title: "Analytics", path: "/app/analytics", icon: BarChart3 },
  { title: "Library", path: "/app/library", icon: LibraryIcon },
];

const settingsTab = { title: "Settings", path: "/app/settings", icon: Settings };

const allTabsWithSettings = [...tabs, settingsTab];

// Routes that own the whole viewport: the floating nav must not compete with
// the session surface. Only shells that render their own exit control belong
// here.
const IMMERSIVE_ROUTE_PREFIXES = [
  "/app/session/",
];

function isImmersiveRoute(pathname: string) {
  return IMMERSIVE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// --- Top Bar Controls (theme + mode)
function ThemeModeToggle() {
  const { mode, setMode } = useTheme();
  const { playSound } = useSound();
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <motion.button
      type="button"
      onClick={() => { playSound("toggle"); setMode(nextMode); }}
      className="glass-1 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${nextMode} mode`}
      aria-pressed={mode === "dark"}
      title={`Switch to ${nextMode} mode`}
    >
      {mode === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </motion.button>
  );
}

function TopBarControls() {
  const { soundEnabled, toggleSound } = useSound();

  return (
    <div className="flex items-center gap-1.5">
      {/* Sound toggle */}
      <motion.button
        onClick={() => { toggleSound(); }}
        className="flex h-9 w-9 items-center justify-center rounded-lg glass-1 text-muted-foreground transition-colors hover:text-foreground"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        title={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </motion.button>

      <ThemeModeToggle />
    </div>
  );
}

// --- Close App Controls
// Closes the installed/app window when the platform allows it. Browsers refuse
// to close windows they did not open, so we fall back to leaving the app
// surface (/app) for the public landing page instead of doing nothing.
function closeAppWindow() {
  try {
    window.close();
  } catch {
    /* ignore */
  }
  window.setTimeout(() => {
    if (!window.closed && window.location.pathname !== "/") {
      window.location.assign("/");
    }
  }, 150);
}

function CloseAppButton({ size = "sm" }: { size?: "sm" | "md" }) {
  const { playSound } = useSound();
  const dimension = size === "md" ? "h-10 w-10" : "h-9 w-9";

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          onClick={() => {
            try { playSound("navigate"); } catch { /* ignore */ }
            closeAppWindow();
          }}
          className={`flex ${dimension} items-center justify-center rounded-lg glass-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Close app"
          title="Close app"
        >
          <X className="h-4 w-4" aria-hidden />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent className="font-body text-xs">Close</TooltipContent>
    </Tooltip>
  );
}

// --- Floating Glass Navigation (All Screens)
function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playSound } = useSound();

  return (
    <motion.div
      className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex justify-center pl-[calc(0.5rem+env(safe-area-inset-left))] pr-[calc(0.5rem+env(safe-area-inset-right))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pl-[calc(1rem+env(safe-area-inset-left))] sm:pr-[calc(1rem+env(safe-area-inset-right))]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav aria-label="Primary" className="mx-auto w-full max-w-[42rem]">
        <div className="glass-2 relative flex w-full items-stretch justify-between gap-0.5 overflow-hidden rounded-[1.25rem] border border-border/25 px-1.5 py-1.5 shadow-[var(--elev-3)]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--gold-300)/0.35),transparent)]"
          />
          {tabs.map((tab) => {
            const isActive = tab.path === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(tab.path);

            return (
              <motion.button
                key={tab.title}
                type="button"
                onClick={() => {
                  try { playSound("navigate"); } catch { /* ignore sound errors */ }
                  navigate(tab.path);
                }}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.title}
                title={tab.title}
                className={`relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[0.9rem] px-0.5 pb-2 pt-1.5 transition-colors duration-300 max-[430px]:gap-0.5 ${isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                whileTap={{ scale: 0.94 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-[0.9rem] border border-primary/20 bg-[linear-gradient(160deg,hsl(var(--primary)/0.16),hsl(var(--primary)/0.06))] shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.12),0_0_18px_hsl(var(--primary)/0.15)]"
                    layoutId="activeNavTab"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${isActive ? "scale-105 drop-shadow-[0_0_8px_hsl(var(--primary)/0.45)]" : ""}`} aria-hidden="true" />
                <span className={`relative z-10 max-w-full truncate text-[0.6875rem] font-body leading-none max-[380px]:text-[0.625rem] sm:text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                  {tab.title}
                </span>
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId="activeNavDot"
                    className="absolute bottom-1 z-10 h-[3px] w-[3px] rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </motion.div>
  );
}

// --- Simple Top Header (All Screens)
function DesktopHeader() {
  const navigate = useNavigate();
  const { playSound } = useSound();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass-2 border-b border-border/15 shadow-[0_1px_0_hsl(var(--gold-300)/0.06)]"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between h-14 px-6 max-w-[1600px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <BrandLotus size={26} />
          <span className="font-display text-base font-semibold tracking-tight text-foreground">
            <BrandName />
          </span>
        </div>

        {/* Breadcrumb */}
        <div className="flex-1 flex justify-center">
          <BreadcrumbBack />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Temple shortcut removed per design - reachable from the bottom tab bar */}
          <NotificationBell />
          <SacredExitButton variant="icon" />
          <TopBarControls />
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => {
                  try { playSound("navigate"); } catch { /* ignore */ }
                  navigate('/app/settings');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg glass-1 text-muted-foreground transition-colors hover:text-foreground"
                whileTap={{ scale: 0.9 }}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent className="font-body text-xs">Settings</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <motion.button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg glass-1 text-muted-foreground transition-colors hover:text-destructive"
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent className="font-body text-xs">Sign Out</TooltipContent>
          </Tooltip>
          <CloseAppButton />
        </div>
      </div>
    </motion.header>
  );
}

// --- Breadcrumb Back Button
function BreadcrumbBack() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playSound } = useSound();

  // Find current tab name
  const currentTab = allTabsWithSettings.find((tab) =>
    tab.path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(tab.path)
  );

  const isHome = location.pathname === "/app";
  const pageName = currentTab?.title || "Page";

  if (isHome) return null;

  // On sub-routes (e.g. /app/library/xxx) show a compact back chip.
  // On top-level tab roots we don't need Back - the tab bar handles it.
  const isSubRoute =
    location.pathname !== "/app" &&
    !allTabsWithSettings.some((t) => t.path === location.pathname);

  if (!isSubRoute) return null;

  return (
    <motion.button
      onClick={() => {
        try { playSound("navigate"); } catch { /* ignore */ }
        if (window.history.length > 1) navigate(-1);
        else navigate(currentTab?.path || "/app");
      }}
      className="flex min-h-[36px] items-center gap-1 pl-1 pr-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Back to ${pageName}`}
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="text-xs font-display font-medium">{pageName}</span>
    </motion.button>
  );
}

// --- Double-tap -> open the Games library (original behavior)
function useDoubleTapGames() {
  const navigate = useNavigate();
  const lastTapRef = useRef<number>(0);
  return useCallback((e: React.MouseEvent) => {
    // Ignore taps on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("a,button,input,textarea,select,[role='button'],[data-no-doubletap]")) return;
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      lastTapRef.current = 0;
      navigate("/app/library?tab=games");
    } else {
      lastTapRef.current = now;
    }
  }, [navigate]);
}

function AppOutletPlaceholder({
  label,
  screen,
  width,
}: {
  label: string;
  screen: ReturnType<typeof resolveScreenPlaceholder>["screen"];
  width: string;
}) {
  return (
    <AppPreloader
      screen={screen}
      width={width}
      label={`Opening ${label}...`}
      className="min-h-[60dvh]"
    />
  );
}

// --- Main Layout
export default function AppLayout() {
  return (
    <SessionOrchestratorProvider>
      <CinematicSessionProvider>
        <PracticeRunControllerProvider>
          <AppLayoutInner />
          <PracticeRunMoreMenu />
          <PracticeRunFullScreen />
        </PracticeRunControllerProvider>
      </CinematicSessionProvider>
    </SessionOrchestratorProvider>
  );
}

function AppLayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, mode, forcedOverride, tokens } = useTheme();
  const isMobile = useIsMobile();
  const isHome = location.pathname === "/app";
  const hasInlineOrb = isHome || location.pathname === "/app/gates" || location.pathname === "/app/before";
  const handleDoubleTap = useDoubleTapGames();
  const { active: practiceRunActive } = usePracticeRunController();
  // One place decides whether app chrome exists on screen. Immersive surfaces
  // own the whole viewport: no nav, no header, no orb launcher competing with
  // the practice the user is in.
  const immersive = Boolean(practiceRunActive) || isImmersiveRoute(location.pathname);

  const currentTab = allTabsWithSettings.find((tab) =>
    tab.path === "/app" ? location.pathname === "/app" : location.pathname.startsWith(tab.path)
  );
  const tabFallback = resolveScreenPlaceholder(location.pathname);
  const placeholderLabel = currentTab?.title || tabFallback.label;

  useLayoutEffect(() => {
    if (forcedOverride) return;
    const root = document.documentElement;
    applyDesignTokens(root, tokens);
    root.classList.toggle("dark", mode === "dark");
    root.classList.toggle("light", mode === "light");
  }, [forcedOverride, location.pathname, mode, theme, tokens]);

  // Push notifications: get userId and activate
  const [pushUserId, setPushUserId] = useState<string>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setPushUserId(data.user?.id));
  }, []);
  usePushNotifications(pushUserId);
  useIdleNudge(pushUserId);
  useJourneyNudge(pushUserId);

  if (isMobile) {
    return (
      <div className="app-theme-backdrop min-h-dvh bg-background" onDoubleClick={handleDoubleTap}>
        <ConsciousnessBusListener />
        <AnimatePresence>
          {!immersive && (
            <motion.header
              key="mobile-header"
              initial={{ y: -64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -64, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-0 z-40 flex items-center justify-between px-4 pt-[calc(0.625rem+env(safe-area-inset-top))] pb-2.5 glass-2 border-b border-border/10 shadow-[0_1px_0_hsl(var(--gold-300)/0.05)]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <BreadcrumbBack />
                <BrandLotus size={22} />
                <span className="font-display text-sm font-semibold tracking-tight text-foreground truncate">
                  <BrandName />
                </span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <NotificationBell />
                <ThemeModeToggle />
                <motion.button
                  onClick={() => {
                    navigate('/app/settings');
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg glass-1 text-muted-foreground transition-colors hover:text-foreground"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </motion.button>
                <CloseAppButton size="md" />
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <main
          className={
            immersive
              ? "relative z-10 px-5 pt-3 pb-6"
              : "relative z-10 px-5 pt-3 pb-[calc(7.5rem+env(safe-area-inset-bottom))]"
          }
        >
          <SpiralStepBanner />
          <Suspense
            fallback={
              <AppOutletPlaceholder
                label={placeholderLabel}
                screen={tabFallback.screen}
                width={tabFallback.width}
              />
            }
          >
            <Outlet />
          </Suspense>
        </main>

        <AnimatePresence>
          {!immersive && <FloatingNav key="floating-nav" />}
        </AnimatePresence>
        {!immersive && !hasInlineOrb && <PresenceOrb />}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="app-theme-backdrop min-h-dvh bg-background" onDoubleClick={handleDoubleTap}>
      <ConsciousnessBusListener />
      <AnimatePresence>
        {!immersive && <DesktopHeader key="desktop-header" />}
      </AnimatePresence>
      <main
        className={
          immersive
            ? "relative z-10 mx-auto w-full max-w-[1600px] px-8 pt-6 pb-8"
            : "relative z-10 mx-auto mt-[calc(3.5rem+env(safe-area-inset-top))] w-full max-w-[1600px] px-8 pt-6 pb-32"
        }
      >
        <SpiralStepBanner />
        <Suspense
          fallback={
            <AppOutletPlaceholder
              label={placeholderLabel}
              screen={tabFallback.screen}
              width={tabFallback.width}
            />
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <AnimatePresence>
        {!immersive && <FloatingNav key="floating-nav" />}
      </AnimatePresence>
      {!immersive && !hasInlineOrb && <PresenceOrb />}
    </div>
  );
}
