import { cn } from "@/lib/utils";
import { Placeholder } from "@/design-system";
import type { ScreenSkeleton } from "@/lib/ui/screenPlaceholder";

const { Line, Circle, Block, Card, ListRow, Grid } = Placeholder;

type LegacyVariant = "page" | "list" | "card" | "minimal";

type AppPreloaderProps = {
  label?: string;
  className?: string;
  /** Legacy shape used by in-page loading states. Ignored when `screen` is set. */
  variant?: LegacyVariant;
  /** Route-specific skeleton that mirrors the destination screen. */
  screen?: ScreenSkeleton;
  /** Tailwind max-width class for the skeleton column (defaults to page width). */
  width?: string;
};

/**
 * AppPreloader — the single in-app loading shell.
 *
 * Every navigation resolves a `screen` skeleton (see
 * `@/lib/ui/screenPlaceholder`) so the placeholder matches the screen that
 * is about to paint: Home shows an orb + cards, Guide shows chat bubbles,
 * Library shows a search pill + card grid, and so on.
 *
 * Used by:
 *  - App.tsx → top-level <Suspense> route fallback (cold mount)
 *  - AppLayout.tsx → nested <Suspense> per-tab fallback (shell stays painted)
 *  - Analytics.tsx → in-page loading state
 */
export default function AppPreloader({
  label,
  className,
  variant = "page",
  screen,
  width,
}: AppPreloaderProps) {
  const resolved = screen ?? legacyToScreen(variant);

  return (
    <div
      className={cn(
        "w-full flex flex-col items-stretch preloader-hold",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label || "Loading"}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-5",
          width ?? DEFAULT_WIDTH[resolved],
        )}
      >
        {renderSkeleton(resolved)}
      </div>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

const DEFAULT_WIDTH: Record<ScreenSkeleton, string> = {
  home: "max-w-5xl",
  practice: "max-w-2xl",
  guide: "max-w-3xl",
  journal: "max-w-3xl",
  library: "max-w-3xl",
  analytics: "max-w-3xl",
  masters: "max-w-5xl",
  settings: "max-w-2xl",
  admin: "max-w-6xl",
  enterprise: "max-w-6xl",
  session: "max-w-2xl",
  landing: "max-w-5xl",
  page: "max-w-2xl",
};

function legacyToScreen(variant: LegacyVariant): ScreenSkeleton {
  switch (variant) {
    case "minimal":
      return "session";
    case "card":
      return "practice";
    case "list":
      return "journal";
    default:
      return "page";
  }
}

function renderSkeleton(screen: ScreenSkeleton) {
  switch (screen) {
    case "home":
      return <HomeSkeleton />;
    case "practice":
      return <PracticeSkeleton />;
    case "guide":
      return <GuideSkeleton />;
    case "journal":
      return <JournalSkeleton />;
    case "library":
      return <LibrarySkeleton />;
    case "analytics":
      return <AnalyticsSkeleton />;
    case "masters":
      return <MastersSkeleton />;
    case "settings":
      return <SettingsSkeleton />;
    case "admin":
      return <AdminSkeleton />;
    case "enterprise":
      return <EnterpriseSkeleton />;
    case "session":
      return <SessionSkeleton />;
    case "landing":
      return <LandingSkeleton />;
    default:
      return <PageSkeleton />;
  }
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <Circle className="w-9 h-9 shrink-0" />
        <div className="space-y-2 min-w-0">
          <Line className="w-32" />
          <Line className="w-20 h-2.5" />
        </div>
      </div>
      <Block className="w-8 h-8 rounded-lg" />
    </div>
  );
}

function Pills({ count = 4, widthClass = "w-20" }: { count?: number; widthClass?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Block key={i} className={cn("h-8 rounded-full", widthClass)} />
      ))}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Circle className="w-32 h-32 sm:w-40 sm:h-40" />
        <Line className="w-44" />
        <Line className="w-24 h-2.5" />
      </div>
      <div className="flex justify-center">
        <Pills count={3} widthClass="w-24" />
      </div>
      <Card lines={2} withMedia />
      <div className="space-y-1">
        <ListRow lines={2} />
        <ListRow lines={2} />
        <ListRow lines={2} />
      </div>
    </>
  );
}

function PracticeSkeleton() {
  return (
    <>
      <Header />
      <Card lines={2} withMedia />
      <div className="space-y-1">
        <ListRow lines={2} />
        <ListRow lines={2} />
        <ListRow lines={2} />
      </div>
      <Block className="h-11 w-full rounded-full" />
    </>
  );
}

function GuideSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <Block className="h-16 w-2/3 rounded-2xl" />
      <Block className="h-12 w-1/2 rounded-2xl self-end" />
      <Block className="h-20 w-3/4 rounded-2xl" />
      <Block className="h-10 w-2/5 rounded-2xl self-end" />
      <div className="pt-4">
        <Block className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function JournalSkeleton() {
  return (
    <>
      <Header />
      <Block className="h-10 w-full rounded-full" />
      <Pills count={3} widthClass="w-20" />
      <div className="space-y-1">
        <ListRow lines={3} />
        <ListRow lines={2} />
        <ListRow lines={3} />
        <ListRow lines={2} />
      </div>
    </>
  );
}

function LibrarySkeleton() {
  return (
    <>
      <Header />
      <Block className="h-10 w-full max-w-md rounded-full" />
      <Pills count={4} widthClass="w-24" />
      <Grid count={6} columns={2} />
    </>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Block className="h-40 rounded-2xl" />
      <Card lines={2} />
      <Card lines={2} />
    </>
  );
}

function MastersSkeleton() {
  return (
    <>
      <Header />
      <Pills count={4} widthClass="w-24" />
      <Grid count={6} columns={3} />
    </>
  );
}

function SettingsSkeleton() {
  return (
    <>
      <Header />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/30 p-4"
          >
            <div className="space-y-2 min-w-0 flex-1">
              <Line className="w-1/3" />
              <Line className="w-1/2 h-2.5" />
            </div>
            <Block className="h-6 w-16 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
}

function AdminSkeleton() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-border/30 divide-y divide-border/20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Line className="flex-1" />
            <Line className="w-16 h-2.5" />
            <Line className="w-12 h-2.5" />
          </div>
        ))}
      </div>
    </>
  );
}

function EnterpriseSkeleton() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Block className="h-48 rounded-2xl" />
      <div className="space-y-1">
        <ListRow lines={2} />
        <ListRow lines={2} />
      </div>
    </>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex flex-col items-center gap-5 pt-10">
      <Circle className="w-24 h-24" />
      <Line className="w-48" />
      <div className="w-full max-w-sm space-y-2">
        <Line />
        <Line className="w-4/5 mx-auto" />
      </div>
      <Block className="h-11 w-40 rounded-full" />
    </div>
  );
}

function LandingSkeleton() {
  return (
    <div className="space-y-6 pt-4">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
        <Line className="w-24 h-2.5" />
        <Line className="w-full h-8 rounded-xl" />
        <Line className="w-3/4 h-8 rounded-xl" />
        <Line className="w-2/3" />
      </div>
      <div className="flex justify-center gap-3">
        <Block className="h-11 w-32 rounded-full" />
        <Block className="h-11 w-32 rounded-full" />
      </div>
      <Grid count={4} columns={2} />
    </div>
  );
}

function PageSkeleton() {
  return (
    <>
      <Header />
      <Card lines={3} withMedia />
      <Card lines={2} />
      <Card lines={2} />
    </>
  );
}
