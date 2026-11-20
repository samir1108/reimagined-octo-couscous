import { motion } from "framer-motion";
import { ArrowLeft, X, Play, Sparkles, GraduationCap, Gamepad2, Users } from "lucide-react";
import type { World } from "./worldData";
import MiniBreath from "./MiniBreath";

interface Props {
  world: World;
  onClose: () => void;
}

/**
 * Awwwards-grade world deep-dive:
 *  1. Cinematic hero with manifesto
 *  2. Programs gallery
 *  3. Featured masters
 *  4. Games / practices showcase
 *  5. Mini-experience (interactive breath)
 *  6. Personal mirror persona card
 *  7. CTA → /auth
 *
 * Long-form, scrollable, sticky background until you exit.
 */
export default function WorldDeepDive({ world, onClose }: Props) {
  return (
    <motion.section
      key={`world-${world.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-[100dvh] overflow-x-hidden"
    >
      {/* Sticky cinematic background */}
      <div className="fixed inset-0 -z-0">
        <video
          src={world.video}
          poster={world.image}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 70% 15%, hsl(${world.accent} / .35), transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Sticky utility bar */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-amber-100/5">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-10 py-4">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-amber-100/80 hover:text-amber-100 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> All worlds
            </button>
            <div className="text-[11px] uppercase tracking-[0.3em]" style={{ color: `hsl(${world.accent})` }}>
              {world.title}
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-amber-100/20 text-amber-100/80 hover:bg-amber-100/10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. HERO + MANIFESTO */}
        <section className="min-h-[90dvh] flex items-center px-4 md:px-10 py-20">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                style={{ background: `hsl(${world.accent} / .2)`, color: `hsl(${world.accent})` }}
              >
                <world.Icon className="w-5 h-5" />
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-amber-50 leading-[1.02] mb-8">
              {world.tagline}
            </h1>
            <p className="text-xl md:text-2xl text-amber-100/80 leading-relaxed max-w-2xl">
              {world.manifesto}
            </p>
            <div className="mt-10 text-sm text-amber-200/60 inline-flex items-center gap-3">
              <span className="w-8 h-px bg-amber-200/40" /> scroll to walk through
            </div>
          </motion.div>
        </section>

        {/* 2. PROGRAMS */}
        <Section
          eyebrow="Programs"
          title="Walk-through paths"
          subtitle="Designed protocols — not generic wellness — for the life you actually live."
          icon={<GraduationCap className="w-4 h-4" />}
          accent={world.accent}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {world.programs.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.7 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-amber-100/10 bg-black/50 backdrop-blur-md p-6 transition hover:border-amber-100/30"
              >
                <div
                  className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, hsl(${world.accent} / .25), transparent 60%)` }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.25em]" style={{ color: `hsl(${world.accent})` }}>
                      {p.duration}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-amber-100/40">Program</span>
                  </div>
                  <h3 className="text-2xl font-serif text-amber-50 mb-2">{p.title}</h3>
                  <p className="text-sm text-amber-100/70 leading-relaxed">{p.promise}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* 3. MASTERS */}
        <Section
          eyebrow="Featured masters"
          title="Sit at the feet of someone real"
          subtitle="Each master is a fully-developed voice — built from their actual lineage and writing."
          icon={<Users className="w-4 h-4" />}
          accent={world.accent}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {world.masters.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
                className="rounded-2xl border border-amber-100/10 bg-black/40 backdrop-blur-md p-5"
              >
                <div
                  className="w-12 h-12 rounded-full mb-4 flex items-center justify-center text-lg font-serif"
                  style={{
                    background: `radial-gradient(circle, hsl(${world.accent} / .35), hsl(${world.accent} / .1))`,
                    color: `hsl(${world.accent})`,
                    boxShadow: `0 0 30px hsl(${world.accent} / .25)`,
                  }}
                >
                  {m.name.charAt(0)}
                </div>
                <div className="text-amber-50 font-serif text-lg leading-tight">{m.name}</div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-amber-200/50 mt-1 mb-3">
                  {m.lineage}
                </div>
                <p className="text-sm text-amber-100/75 italic leading-relaxed">"{m.one_line}"</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* 4. GAMES + SIGNATURE PRACTICE */}
        <Section
          eyebrow="Games & practice"
          title="Train the faculty, not the affirmation"
          subtitle="Short, beautiful trainers built with neuroscience — for attention, breath, perception."
          icon={<Gamepad2 className="w-4 h-4" />}
          accent={world.accent}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {world.games.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-amber-100/10 bg-black/40 backdrop-blur-md p-5 hover:border-amber-100/30 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-amber-200/60">
                    {g.faculty}
                  </span>
                  <span className="text-[11px] text-amber-100/40">{g.minutes} min</span>
                </div>
                <div className="text-xl font-serif text-amber-50">{g.title}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* 5. MINI-EXPERIENCE */}
        <Section
          eyebrow="Touch it"
          title="A 30-second taste, right here"
          subtitle="You don't have to sign up to feel something move."
          icon={<Sparkles className="w-4 h-4" />}
          accent={world.accent}
        >
          <div className="max-w-2xl">
            <MiniBreath accent={world.accent} />
          </div>
        </Section>

        {/* 6. PERSONAL MIRROR */}
        <Section
          eyebrow="Meet someone like you"
          title={`This is ${world.mirror.name}.`}
          subtitle={world.mirror.arc}
          icon={<Users className="w-4 h-4" />}
          accent={world.accent}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-amber-100/10 bg-black/50 backdrop-blur-md p-6">
              <div className="text-[11px] uppercase tracking-[0.25em] text-rose-200/60 mb-3">Before</div>
              <p className="text-amber-50/85 leading-relaxed">{world.mirror.before}</p>
            </div>
            <div className="rounded-2xl border p-6"
              style={{
                borderColor: `hsl(${world.accent} / .35)`,
                background: `linear-gradient(180deg, hsl(${world.accent} / .12), hsl(0 0% 0% / .5))`,
                boxShadow: `0 0 50px -20px hsl(${world.accent} / .5)`,
              }}>
              <div className="text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: `hsl(${world.accent})` }}>
                After
              </div>
              <p className="text-amber-50 leading-relaxed">{world.mirror.after}</p>
              <div className="mt-5 text-xs text-amber-100/50">
                {world.mirror.name} · {world.mirror.age} · {world.mirror.role}
              </div>
            </div>
          </div>
        </Section>

        {/* 7. CTA */}
        <section className="px-4 md:px-10 py-24 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[11px] uppercase tracking-[0.4em] text-amber-200/60 mb-6">
              When you're ready
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-amber-50 mb-8 max-w-2xl mx-auto leading-tight">
              Step inside this world — the rest is built around you.
            </h2>
            <a
              href="/auth"
              className="inline-flex items-center gap-3 rounded-full bg-amber-100 text-black px-8 py-4 text-sm font-medium hover:bg-amber-200 transition"
            >
              <Play className="w-4 h-4" />
              Begin {world.title.toLowerCase()}
            </a>
            <div className="mt-3 text-xs text-amber-100/50">Free to begin · no credit card</div>
          </motion.div>
        </section>
      </div>
    </motion.section>
  );
}

function Section({
  eyebrow, title, subtitle, icon, accent, children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 md:px-10 py-20 md:py-28 border-t border-amber-100/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: `hsl(${accent})` }}>
            {icon}
            {eyebrow}
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-amber-50 leading-tight mb-3">{title}</h2>
          {subtitle && <p className="text-amber-100/70 text-base md:text-lg leading-relaxed">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
