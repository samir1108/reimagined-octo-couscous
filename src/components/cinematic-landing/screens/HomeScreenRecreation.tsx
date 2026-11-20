import { ArrowRight, Compass, Library, Moon, Repeat, Sun, Sunrise, Sunset } from "lucide-react";
import { SLOT_DESIGN } from "@/lib/slotDesign";
import { EXPERIENCE_PRACTICES } from "@/data/experiencePractices";

/**
 * HomeScreenRecreation — a faithful DOM reconstruction of the ConsciousOS Home
 * screen, built from the product's own data rather than invented copy:
 *
 *   slot rhythm  → `SLOT_DESIGN` (src/lib/slotDesign.ts)
 *   theme        → a real practice from `EXPERIENCE_PRACTICES`
 *
 * The four daily rooms are:
 *   Morning  → The Awakening  → Sankalpa
 *   Midday   → The Pulse      → The Reset
 *   Evening  → The Hall       → Three Stones
 *   Night    → The Sanctuary  → Empty Bowl
 *
 * It renders inside a device frame for the landing page so visitors see the
 * real product structure without the page pretending to be a screenshot.
 * A real capture can replace it at any time via
 * `landingImages.homeScreenshot`.
 */

const SLOT_ORDER = ["morning", "midday", "evening", "night"] as const;

const SLOT_ICONS = {
  morning: Sunrise,
  midday: Sun,
  evening: Sunset,
  night: Moon,
} as const;

const THEME_PRACTICE = EXPERIENCE_PRACTICES.find((practice) => practice.slug === "witness");

export default function HomeScreenRecreation({ compact = false }: { compact?: boolean }) {
  const active = SLOT_DESIGN.morning;

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0807] text-foreground">
      <header className="flex items-center justify-between px-4 pt-4 md:px-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.34em] text-foreground/70">
            ConsciousOS
          </span>
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-foreground/40">Day 42</span>
      </header>

      <div className="px-4 pt-5 md:px-6">
        <div className="flex items-center gap-2">
          <Sunrise className="h-3.5 w-3.5 text-primary/80" />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.28em] text-primary/80">
            {active.room}
          </span>
        </div>
        <p className="mt-3 text-lg font-light leading-tight md:text-2xl">{active.greeting}.</p>
        <p className="mt-1 text-xs text-foreground/55">{active.invitation}</p>
      </div>

      <div className="relative mt-4 flex flex-1 items-center justify-center">
        <div className="absolute h-40 w-40 rounded-full border border-primary/20 md:h-52 md:w-52" />
        <div className="absolute h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,236,170,0.75)_0%,rgba(251,191,36,0.35)_45%,transparent_75%)] blur-[1px] md:h-36 md:w-36" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/25 bg-black/40 backdrop-blur md:h-28 md:w-28">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary/70">Hold to begin</span>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <div className="rounded-2xl border border-foreground/10 bg-white/[0.03] p-4">
          <p className="text-[0.6rem] uppercase tracking-[0.28em] text-foreground/45">Today&rsquo;s theme</p>
          <p className="mt-2 text-sm font-medium text-foreground/90 md:text-base">
            {THEME_PRACTICE?.name ?? "The Witness"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/60">
            {THEME_PRACTICE?.oneLine ?? "Watch thoughts pass without grabbing them."}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Begin session
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {!compact && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: Compass, label: "Map" },
              { icon: Repeat, label: "Loops" },
              { icon: Library, label: "Library" },
            ].map((entry) => (
              <div
                key={entry.label}
                className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 bg-white/[0.02] py-2.5 text-[0.65rem] uppercase tracking-[0.16em] text-foreground/60"
              >
                <entry.icon className="h-3.5 w-3.5" />
                {entry.label}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          {SLOT_ORDER.map((slot) => {
            const Icon = SLOT_ICONS[slot];
            const isActive = slot === "morning";
            return (
              <div key={slot} className="flex flex-col items-center gap-1">
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-foreground/30"}`}
                />
                <span
                  className={`text-[0.55rem] uppercase tracking-[0.14em] ${
                    isActive ? "text-foreground/70" : "text-foreground/30"
                  }`}
                >
                  {SLOT_DESIGN[slot].slot.charAt(0).toUpperCase() + SLOT_DESIGN[slot].slot.slice(1)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-1/4 rounded-full bg-primary/70" />
        </div>
      </div>
    </div>
  );
}
