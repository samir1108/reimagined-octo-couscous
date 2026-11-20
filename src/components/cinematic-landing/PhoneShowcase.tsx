import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * PhoneShowcase — the real mobile UI, in real phone frames.
 *
 * Every frame is a genuine capture of the shipped app taken by
 * `scripts/capture-screens.mjs` (390×844 @2x, headless Chrome), published
 * to `public/landing/mobile/`. Nothing here is a mockup: it is the product.
 */

interface PhoneShot {
  slug: string;
  title: string;
  caption: string;
  route: string;
}

const SHOTS: PhoneShot[] = [
  {
    slug: "app-intro",
    title: "First light",
    caption: "A place to begin, every single day.",
    route: "/app-intro",
  },
  {
    slug: "experience",
    title: "Experience",
    caption: "Guided paths, practices and programs — 270+ ways in.",
    route: "/experience",
  },
  {
    slug: "loops",
    title: "Loops",
    caption: "Notice what repeats. Explore what triggers it.",
    route: "/loops",
  },
  {
    slug: "loops-atlas",
    title: "Loops Atlas",
    caption: "Every recurring pattern the system has noticed in you.",
    route: "/experience/loops-atlas",
  },
  {
    slug: "knowledge",
    title: "Knowledge",
    caption: "Essays, frameworks and traditions — inside the session.",
    route: "/knowledge",
  },
  {
    slug: "handbook",
    title: "Handbook",
    caption: "Your working manual for the journey you are on.",
    route: "/handbook",
  },
];

export default function PhoneShowcase() {
  return (
    <section id="the-app" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <span className="text-[0.62rem] uppercase tracking-[0.34em] text-primary/75">
            The app
          </span>
          <h2 className="mt-4 text-3xl font-light leading-tight text-foreground sm:text-4xl md:text-5xl">
            Built for the moment you are actually in.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            One tap to the orb. The rest of the app is what supports it — your patterns, your
            libraries, your journey, and the record of what you have noticed.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-5 sm:gap-7 md:grid-cols-3 lg:grid-cols-6">
          {SHOTS.map((shot, index) => (
            <motion.div
              key={shot.slug}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.07, ease: [0, 0, 0.2, 1] }}
            >
              <Link to={shot.route} className="group block">
                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.6rem] border border-border/50 bg-card/40 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-primary/40">
                  <img
                    src={`/landing/mobile/${shot.slug}.png`}
                    alt={`${shot.title} screen of ConsciousOS`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>

                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-foreground/90">
                      {shot.title}
                    </p>
                    <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground/70">
                      {shot.caption}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/0 transition-colors group-hover:text-primary/70" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
