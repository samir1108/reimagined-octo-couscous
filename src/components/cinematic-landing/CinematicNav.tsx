import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/design-system";

export interface ActLink {
  id: string;
  label: string;
}

interface CinematicNavProps {
  acts: ActLink[];
  onSkipStory?: () => void;
}

export default function CinematicNav({ acts, onSkipStory }: CinematicNavProps) {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [active, setActive] = useState<string>(acts[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -20% 0px" },
    );

    acts.forEach((act) => {
      const element = document.getElementById(act.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [acts]);

  const goToApp = () => navigate("/auth");
  const signIn = () => navigate("/auth");

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-primary/70 via-secondary/70 to-primary/30"
        style={{ scaleX: progress }}
        aria-hidden
      />

      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-3 text-left"
          aria-label="ConsciousOS — back to top"
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.55),transparent_70%)]" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.34em] text-foreground/75 transition-colors group-hover:text-foreground">
            ConsciousOS
          </span>
        </button>

        <nav className="flex items-center gap-2" aria-label="Primary">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipStory}
            className="hidden gap-1.5 text-foreground/70 hover:text-foreground sm:inline-flex"
          >
            <SkipForward className="h-4 w-4" />
            Skip story
          </Button>
          <Button variant="ghost" size="sm" onClick={signIn} className="text-foreground/80">
            Sign in
          </Button>
          <Button size="sm" onClick={goToApp} className="gap-1.5">
            Begin your journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </nav>
      </header>

      <nav
        className="fixed right-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
        aria-label="Story chapters"
      >
        {acts.map((act) => {
          const isActive = active === act.id;
          return (
            <a
              key={act.id}
              href={`#${act.id}`}
              className="group flex items-center gap-2"
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className={`text-[0.6rem] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? "text-foreground/80 opacity-100"
                    : "text-foreground/35 opacity-0 group-hover:opacity-100"
                }`}
              >
                {act.label}
              </span>
              <span
                className={`block h-px transition-all duration-500 ${
                  isActive ? "w-8 bg-primary" : "w-4 bg-foreground/25 group-hover:w-6 group-hover:bg-foreground/50"
                }`}
                aria-hidden
              />
            </a>
          );
        })}
      </nav>
    </>
  );
}
