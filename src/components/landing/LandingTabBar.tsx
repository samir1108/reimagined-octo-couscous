import { useCallback, useEffect, useRef, useState } from "react";

type LandingTab = { id: string; label: string };

// Every tab maps to a section that exists on the landing page once the
// embedded story sections have mounted (or to a React section like Pricing).
const TABS: LandingTab[] = [
  { id: "cos-how", label: "How it works" },
  { id: "cos-screens", label: "Inside the app" },
  { id: "cos-flow", label: "A session" },
  { id: "cos-who", label: "Who it's for" },
  { id: "cos-deep", label: "The depth" },
  { id: "cos-research", label: "Research" },
  { id: "cos-trust", label: "Safety" },
  { id: "cos-orgs", label: "For teams" },
  { id: "cos-model", label: "The model" },
  { id: "cos-origin", label: "Origin" },
  { id: "cos-voices", label: "Voices" },
  { id: "cos-roadmap", label: "Roadmap" },
  { id: "cos-faq", label: "FAQ" },
  { id: "pricing", label: "Pricing" },
  { id: "join", label: "Join" },
];

// Fixed navbar (~60px) + this strip (~46px) — keeps anchored sections clear.
const SCROLL_OFFSET = 116;

const LandingTabBar = () => {
  const [active, setActive] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setActive(id);
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  // Scroll-spy: the embedded sections arrive after a fetch, so keep retrying
  // until they exist, then observe them for the active tab.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let timer = 0;

    const attach = () => {
      if (io) return true;
      const els = TABS.map((tab) => document.getElementById(tab.id)).filter(
        (el): el is HTMLElement => Boolean(el),
      );
      if (els.length < 4) return false;

      els.forEach((el) => {
        el.style.scrollMarginTop = `${SCROLL_OFFSET}px`;
      });

      io = new IntersectionObserver(
        (entries) => {
          const hit = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (hit) setActive(hit.target.id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.15, 0.35, 0.6] },
      );
      els.forEach((el) => io?.observe(el));
      return true;
    };

    if (!attach()) {
      let tries = 0;
      timer = window.setInterval(() => {
        tries += 1;
        if (attach() || tries > 40) window.clearInterval(timer);
      }, 400);
    }

    const onReady = () => {
      attach();
    };
    const onScroll = () => {
      if (window.scrollY < 160) setActive(null);
    };
    window.addEventListener("cos:landing-ready", onReady);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("cos:landing-ready", onReady);
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  // Keep the selected tab visible in the horizontally scrollable strip.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !active) return;
    const btn = strip.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!btn) return;
    const left = btn.offsetLeft - strip.clientWidth / 2 + btn.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <div className="border-t border-border/20 bg-background/60">
      <div
        ref={stripRef}
        role="tablist"
        aria-label="Landing sections"
        className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 md:justify-center md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-tab={tab.id}
              onClick={() => goTo(tab.id)}
              className={
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-xs " +
                (isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground/80 hover:bg-muted/20 hover:text-foreground")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LandingTabBar;
