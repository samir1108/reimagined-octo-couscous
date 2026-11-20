/**
 * Screen-aware loading placeholders.
 *
 * Every route resolves to a skeleton shape that mirrors the screen it is
 * about to paint, so navigation never flashes a generic "loading page"
 * inside a screen that looks completely different.
 */

export type ScreenSkeleton =
  | "home"
  | "practice"
  | "guide"
  | "journal"
  | "library"
  | "analytics"
  | "masters"
  | "settings"
  | "admin"
  | "enterprise"
  | "session"
  | "landing"
  | "page";

export type ScreenPlaceholderSpec = {
  screen: ScreenSkeleton;
  label: string;
  /** Tailwind max-width class for the skeleton column. */
  width: string;
};

const SPECS = {
  home: { screen: "home", label: "Home", width: "max-w-5xl" },
  practice: { screen: "practice", label: "Practice", width: "max-w-2xl" },
  guide: { screen: "guide", label: "Guide", width: "max-w-3xl" },
  journal: { screen: "journal", label: "Journal", width: "max-w-3xl" },
  library: { screen: "library", label: "Library", width: "max-w-3xl" },
  analytics: { screen: "analytics", label: "Analytics", width: "max-w-3xl" },
  masters: { screen: "masters", label: "Masters", width: "max-w-5xl" },
  settings: { screen: "settings", label: "Settings", width: "max-w-2xl" },
  admin: { screen: "admin", label: "Admin", width: "max-w-6xl" },
  enterprise: { screen: "enterprise", label: "Enterprise", width: "max-w-6xl" },
  session: { screen: "session", label: "Session", width: "max-w-2xl" },
  landing: { screen: "landing", label: "SatYug", width: "max-w-5xl" },
  page: { screen: "page", label: "Page", width: "max-w-2xl" },
} satisfies Record<string, ScreenPlaceholderSpec>;

type SpecKey = keyof typeof SPECS;

/**
 * Ordered route table — the first prefix that matches wins.
 * Order matters: keep the most specific paths first.
 */
const ROUTE_TABLE: Array<[prefix: string, key: SpecKey]> = [
  // ── App shell tabs
  ["/app/practice", "practice"],
  ["/app/guide", "guide"],
  ["/app/journal", "journal"],
  ["/app/analytics", "analytics"],
  ["/app/mirror", "analytics"],
  ["/app/spiral", "analytics"],
  ["/app/constellation", "analytics"],
  ["/app/sentient", "analytics"],
  ["/app/games-insights", "analytics"],
  ["/app/masters", "masters"],
  ["/app/library", "library"],
  ["/app/explore", "library"],
  ["/app/memory", "library"],
  ["/app/settings", "settings"],
  ["/app/credits", "settings"],
  ["/app/integrations", "settings"],
  ["/app/gates", "session"],
  ["/app/before", "session"],
  ["/app/pre-journey", "session"],
  ["/app/first-eleven", "session"],
  ["/app/awakening", "session"],
  ["/app/journeys", "session"],
  ["/app/foundation", "session"],
  ["/app/meet-yourself", "session"],
  ["/app/yourself", "session"],
  ["/app/life-legacy", "session"],
  // ── Full-screen cinematic / practice sessions
  ["/app/cinematic-journey", "session"],
  ["/app/orb", "session"],
  ["/app/session", "session"],
  ["/app/games", "page"],
  // ── App root (Home is the only exact match; everything else falls through)
  ["/app", "home"],
  // ── Back-office surfaces
  ["/admin", "admin"],
  ["/enterprise", "enterprise"],
  // ── Public / marketing surfaces
  ["/experience", "page"],
  ["/showroom", "page"],
  ["/temple", "session"],
  ["/handbook", "page"],
  ["/blog", "page"],
  ["/knowledge", "page"],
  ["/loops", "page"],
  ["/journey", "page"],
  ["/inner-llms", "page"],
  ["/app-intro", "landing"],
  ["/auth", "page"],
];

/**
 * Resolve which skeleton a route should paint while its chunk
 * (or its first data fetch) is still loading.
 */
export function resolveScreenPlaceholder(pathname: string): ScreenPlaceholderSpec {
  const path = pathname.replace(/\/+$/, "") || "/";

  for (const [prefix, key] of ROUTE_TABLE) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return SPECS[key];
    }
  }

  return path === "/" ? SPECS.landing : SPECS.page;
}
