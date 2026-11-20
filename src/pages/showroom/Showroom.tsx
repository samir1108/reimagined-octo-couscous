import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Compass, Flame, Gamepad2, Sparkles, Mountain, Wind, Eye, Layers, GitBranch, BookA, ListOrdered, Library, Atom, PlayCircle } from "lucide-react";
import LazyVideo from "@/components/LazyVideo";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { SHOWROOM_PROGRAMS } from "@/data/showroomPrograms";
import { getProgramVideo } from "@/data/programVideos";
import { getHandbookVideo, getInnerPathVideo, getWingVideo } from "@/data/wingsVideos";
import { SHOWROOM_HANDBOOKS } from "@/data/showroomHandbooks";
import { AUDIENCES, AUDIENCE_PROGRAM_STUBS } from "@/data/audiencePrograms";
import { GAME_REGISTRY } from "@/games/shell/gameRegistry";
import { EXPERIENCE_PATHS } from "@/data/experiencePaths";
import CardMedia from "@/components/experience/CardMedia";
import { MASTER_IMAGES } from "@/assets/masters";
import observationImg from "@/assets/maps/observation.jpg";
import selfInquiryImg from "@/assets/maps/self-inquiry.jpg";
import netiNetiImg from "@/assets/maps/neti-neti.jpg";
import pranayamaImg from "@/assets/maps/pranayama.jpg";
import heroVideo from "@/assets/videos/hero-meditate-sage.mp4.asset.json";
import heroVideoAlt from "@/assets/videos/hero-temple-sunrise.mp4.asset.json";
import bridgesVideo from "@/assets/videos/hero-neural-light.mp4.asset.json";
import essaysVideo from "@/assets/videos/hero-banyan-tree.mp4.asset.json";
import gamesCtaVid from "@/assets/showroom/games-cta.mp4.asset.json";
import practicesCtaVid from "@/assets/showroom/practices-cta.mp4.asset.json";
import essayReligionVid from "@/assets/showroom/essay-religion.mp4.asset.json";
import essayWitnessVid from "@/assets/showroom/essay-witness.mp4.asset.json";
import essayNinetyVid from "@/assets/showroom/essay-ninety-days.mp4.asset.json";
import wisdomDeckVid from "@/assets/showroom/wisdom-deck.mp4.asset.json";

// Map guru display names to master portrait IDs in /assets/masters.
// Gurus we don't have a direct portrait for get a thematically-matched
// historical master's face so every 7-Day Program card ships with an image.
const GURU_IMAGE: Record<string, string> = {
  // Direct matches
  "Krishna": MASTER_IMAGES["krishna"],
  "Ramana Maharshi": MASTER_IMAGES["ramana"],
  "Patanjali": MASTER_IMAGES["patanjali"],
  "The Buddha": MASTER_IMAGES["buddha"],
  "Vivekananda": MASTER_IMAGES["vivekananda"],
  "Meera": MASTER_IMAGES["meera"],
  "Lao Tzu": MASTER_IMAGES["laotzu"],
  "Sri Aurobindo": MASTER_IMAGES["aurobindo"],
  "Dōgen": MASTER_IMAGES["dogen"],
  // Historical/deity gurus → nearest lineage face we own
  "Arjuna": MASTER_IMAGES["arjun"],
  "Hanuman": MASTER_IMAGES["arjun"],
  "The Witness": MASTER_IMAGES["ramana"],
  "Kali": MASTER_IMAGES["ramakrishna"],
  "Shiva": MASTER_IMAGES["shiva"],
  "Ganesha": MASTER_IMAGES["ramakrishna"],
  "Saraswati": MASTER_IMAGES["nagarjuna"],
  "Yashoda": MASTER_IMAGES["meera"],
  "Chanakya": MASTER_IMAGES["aurobindo"],
  "Vidura": MASTER_IMAGES["aurobindo"],
  "Dhanvantari": MASTER_IMAGES["patanjali"],
};


const INNER_PATHS = [
  {
    slug: "observation",
    href: "/experience/observation",
    name: "The Observation Ladder",
    sanskrit: "साक्षी",
    oneLine: "From feeling the body, to watching thoughts, to choiceless awareness.",
    levels: 7,
    guru: "Buddha & Krishnamurti",
    image: observationImg,
    gradient: "from-sky-700/60 to-indigo-900/60",
  },
  {
    slug: "self-inquiry",
    href: "/experience/self-inquiry",
    name: "Who Am I?",
    sanskrit: "कोऽहम्",
    oneLine: "Ramana's ātma-vichāra. Five levels of the only question that matters.",
    levels: 5,
    guru: "Ramana Maharshi",
    image: selfInquiryImg,
    gradient: "from-amber-700/60 to-rose-900/60",
  },
  {
    slug: "neti-neti",
    href: "/experience/neti-neti",
    name: "Neti Neti",
    sanskrit: "नेति नेति",
    oneLine: "Not this, not this. Refuse every false answer until what remains cannot be refused.",
    levels: 5,
    guru: "The Upanishads",
    image: netiNetiImg,
    gradient: "from-emerald-700/60 to-slate-900/60",
  },
  {
    slug: "pranayama",
    href: "/experience/pranayama",
    name: "The Pranayama Ladder",
    sanskrit: "प्राणायाम",
    oneLine: "Seven levels of breath — from natural awareness to spontaneous stillness.",
    levels: 7,
    guru: "Patanjali",
    image: pranayamaImg,
    gradient: "from-amber-700/60 to-teal-900/60",
  },
];

const Showroom = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  // Reserved for future inline listing; the curated 12 live on /experience/games.
  void GAME_REGISTRY;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ConsciousOS Showroom — free reading, handbooks, and 7-day programs",
    url: `${SITE_URL}/showroom`,
    description:
      "A free, no-signup gallery of the depth inside ConsciousOS — canonical essays, plain-language handbooks, full 7-day programs taught by gurus, and contemplative games.",
  };

  return (
    <>
      <Seo
        title="The Showroom — free programs, handbooks, essays, games"
        description="The full depth of ConsciousOS, free and without signup. 11 complete 7-day programs taught by Krishna, Ramana, Patanjali, Buddha, Hanuman, Meera, Lao Tzu, Dōgen, and more. 15 contemplative games. 15 standalone practices. Plain-language handbooks."
        canonicalPath="/showroom"
        keywords="free meditation programs, 7 day program, consciousness handbook, free yoga course, Ramana, Krishna, Patanjali, Buddha, sati, witness practice, self inquiry"
        jsonLd={jsonLd}
      />
      <main className="relative min-h-screen bg-background text-foreground">

        {/* CINEMATIC HERO — full-bleed video */}
        <section className="relative w-full h-[92vh] min-h-[640px] overflow-hidden">
          <LazyVideo
            src={heroVideo.url}
            poster={heroVideoAlt.url}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

          {/* Back button — floating */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 z-30 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Hero content */}
          <div className="relative z-10 h-full max-w-6xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-16 md:pb-24">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-amber-300/90 mb-5">
              The Experience · free · no signup
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.02] max-w-4xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              See the whole depth<br /><span className="italic text-amber-200/90">before you join.</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/75 max-w-2xl leading-relaxed">
              Four classical yogic paths. Eleven 7-day programs taught by gurus. Programs built for
              corporate leaders, uniformed services, healers and ritual practitioners. Fifteen
              contemplative games. Fifteen practices. Everything readable, free, no account.
            </p>

            {/* Bento stat strip */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
              {[
                { n: "4", l: "Yogic Paths", s: "6 months each" },
                { n: "11", l: "7-Day Programs", s: "free to read" },
                { n: String(AUDIENCES.length), l: "Audience Programs", s: "corporate · gov · healers" },
                { n: "15", l: "Games", s: "contemplative" },
              ].map(s => (
                <div key={s.l} className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-4 py-3.5">
                  <div className="text-3xl md:text-4xl font-light text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.n}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/85">{s.l}</div>
                  <div className="text-[10px] text-white/55 mt-0.5">{s.s}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2 text-white/60 text-xs animate-pulse">
              <PlayCircle className="w-4 h-4" /> Scroll to explore
            </div>

          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">


          {/* FLAGSHIP — Four Paths */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl md:text-2xl font-light">The Six Paths</h2>
              </div>
              <Link to="/experience/paths" className="text-xs text-amber-400/80 hover:text-amber-200">
                See all 4 →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              The flagship. Bhakti, Jnana, Karma, Raja — each path is six levels, six months,
              taught by one master. Level 1 of every path is free, fully readable.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {EXPERIENCE_PATHS.map(path => (
                <Link
                  key={path.slug}
                  to={`/experience/paths/${path.slug}`}
                  className="group block relative overflow-hidden rounded-2xl border border-border/60 hover:border-amber-500/40 transition aspect-[16/10]"
                >
                  <CardMedia
                    image={path.heroImage}
                    videoUrl={path.heroVideo}
                    alt={path.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} mix-blend-overlay opacity-50`} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-sm uppercase tracking-[0.18em] text-amber-300 mb-2 font-medium">
                      with {path.guru} · L1 free
                    </div>
                    <h3 className="text-2xl md:text-3xl font-light text-white">{path.name}</h3>
                    <p className="mt-2 text-sm md:text-base text-white/90 leading-snug line-clamp-2">
                      {path.oneLine}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>


          {/* Shelf 1 — Programs */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl md:text-2xl font-light">7-Day Programs</h2>
              </div>
              <span className="text-xs text-muted-foreground">{SHOWROOM_PROGRAMS.length} free, more coming</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Each is taught by one guru, runs for seven days, and is fully readable now —
              no AI generation, no credits, no signup. Every day has a teaching, a practice, and a question.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {SHOWROOM_PROGRAMS.map(p => {
                const portrait = GURU_IMAGE[p.guru];
                return (
                  <Link
                    key={p.slug}
                    to={`/showroom/programs/${p.slug}`}
                    className={`group block relative overflow-hidden rounded-2xl border border-border/60 hover:border-amber-500/40 transition aspect-[16/10]`}
                  >
                    {portrait ? (
                      <img
                        src={portrait}
                        alt={p.guru}
                        loading="lazy"
                        width={1536}
                        height={960}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${p.color}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.color} mix-blend-overlay opacity-40`} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-sm uppercase tracking-[0.18em] text-amber-300 mb-2 font-medium">
                        with {p.guru} · 7 days
                      </div>
                      <h3 className="text-2xl md:text-3xl font-light text-white">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm md:text-base text-white/90 leading-snug line-clamp-2">
                        {p.subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}

            </div>
          </section>

          {/* Shelf 1b — Audience Programs (Corporate, Government, Healers, Ritual…) */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl md:text-2xl font-light">Programs for who you are</h2>
              </div>
              <Link to="/experience/programs" className="text-xs text-amber-400/80 hover:text-amber-200">
                See all →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Same 7-day arc, tuned for the life you actually live. Corporate leaders, uniformed
              services, people stuck in nervous-system loops, ritual practitioners — a program built
              for each. Same orb. Same session engine.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AUDIENCES.map(a => {
                const live = SHOWROOM_PROGRAMS.filter(p => p.audience === a.id);
                const stubs = AUDIENCE_PROGRAM_STUBS.filter(s => s.audience === a.id);
                const total = live.length + stubs.length;
                if (total === 0) return null;
                const first = live[0] ?? stubs[0];
                const audienceVideo = first && "category" in first ? getProgramVideo(first.slug, (first as { category: import("@/data/showroomPrograms").ShowroomProgram["category"] }).category) : first ? getProgramVideo(first.slug) : undefined;
                return (
                  <Link
                    key={a.id}
                    to={`/experience/programs#${a.id}`}
                    className={`group relative block overflow-hidden rounded-2xl border border-border/60 hover:border-amber-500/50 transition aspect-[16/11]`}
                  >
                    {/* Full-bleed video */}
                    {audienceVideo ? (
                      <LazyVideo
                        src={audienceVideo}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        aria-hidden
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${a.color}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${a.color} mix-blend-overlay opacity-40`} />
                    {/* Text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/90 mb-2">
                        {live.length > 0
                          ? `${live.length} live · ${stubs.length} coming`
                          : `${stubs.length} in production`}
                      </div>
                      <h3 className="text-lg md:text-xl font-medium leading-snug text-white group-hover:text-amber-100 transition">
                        {a.label}
                      </h3>
                      <p className="mt-1.5 text-xs md:text-sm text-white/80 italic line-clamp-2">{a.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Shelf 2 — Handbooks (core) */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl md:text-2xl font-light">Handbooks</h2>
              </div>
              <span className="text-xs text-muted-foreground">Visual + plain words</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              The deepest ideas, drawn as diagrams and explained in short, plain language. No jargon.
              Read in five minutes. Useful for life.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {SHOWROOM_HANDBOOKS.filter(h => h.group !== "bridges").map(h => {
                const vid = getHandbookVideo(h.slug);
                return (
                  <Link
                    key={h.slug}
                    to={`/showroom/handbooks/${h.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border/60 bg-card hover:border-emerald-500/40 transition"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-black">
                      {vid ? (
                        <LazyVideo
                          src={vid}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          aria-hidden
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900/40" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base md:text-lg font-medium group-hover:text-emerald-200 transition">
                        {h.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{h.oneLine}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Shelf 2b — Bridges: science meets yoga (cinematic) */}
          <section className="mb-16 relative overflow-hidden rounded-3xl border border-cyan-500/20">
            <LazyVideo
              src={bridgesVideo.url}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
            <div className="relative p-6 md:p-10">
              <div className="flex items-baseline justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl md:text-2xl font-light">Bridges — science meets yoga</h2>
                </div>
                <span className="text-xs text-muted-foreground hidden md:inline">Sanatana Yoga, in modern language</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                Psychology, the nervous system, the three brains, the four paths, quantum physics, relativity —
                every one of them is describing what yoga has been saying for 5,000 years. The bridges, in plain words.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {SHOWROOM_HANDBOOKS.filter(h => h.group === "bridges").map(h => {
                  const vid = getHandbookVideo(h.slug);
                  return (
                    <Link
                      key={h.slug}
                      to={`/showroom/handbooks/${h.slug}`}
                      className="group block overflow-hidden rounded-xl border border-cyan-500/25 bg-background/60 backdrop-blur-sm hover:border-cyan-400/60 hover:bg-background/80 transition"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-black">
                        {vid ? (
                          <LazyVideo
                            src={vid}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            aria-hidden
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-slate-900/40" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-base md:text-lg font-medium group-hover:text-cyan-100 transition">
                          {h.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{h.subtitle}</p>
                        <p className="mt-3 text-[11px] text-cyan-300/70 italic">{h.oneLine}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>



          {/* Shelf 3 — Read */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl md:text-2xl font-light">Essays</h2>
              </div>
              <Link to="/blog" className="text-xs text-amber-400/80 hover:text-amber-200">
                See all →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Long, citation-rich essays on the ideas the rest of the internet has gotten thin or wrong.
              Bands of consciousness, the witness, what religion was actually meant to be, why the temples lost the practice.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Featured essay — cinematic banyan video */}
              <Link
                to="/blog/the-11-bands-of-consciousness"
                className="group relative overflow-hidden rounded-2xl border border-rose-500/30 md:col-span-2 md:row-span-2 md:aspect-auto min-h-[280px]"
              >
                <LazyVideo
                  src={essaysVideo.url}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-rose-200/80 mb-2">Featured essay</div>
                  <h3 className="text-2xl md:text-3xl font-light text-white group-hover:text-rose-100 transition" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    The 11 Bands of Consciousness
                  </h3>
                  <p className="mt-2 text-sm text-white/75 max-w-md">A complete map of human inner development — from survival to non-dual.</p>
                </div>
              </Link>

              {[
                { slug: "what-is-religion-really", title: "What is religion, really?", sub: "The thing we lost when we kept the festival.", vid: essayReligionVid.url },
                { slug: "the-witness-the-only-practice", title: "The Witness — the only practice", sub: "Three Upanishadic words, one neuroscience finding.", vid: essayWitnessVid.url },
              ].map(e => (
                <Link
                  key={e.slug}
                  to={`/blog/${e.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border/50 bg-card/50 hover:border-rose-500/40 hover:bg-card transition"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-black">
                    <LazyVideo
                      src={e.vid}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-medium group-hover:text-rose-200 transition leading-snug">{e.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">{e.sub}</p>
                  </div>
                </Link>
              ))}
              <Link
                to="/blog/the-first-ninety-days"
                className="md:col-span-3 group block overflow-hidden rounded-2xl border border-border/50 bg-card/40 hover:border-rose-500/40 hover:bg-card/80 transition"
              >
                <div className="relative aspect-[24/5] overflow-hidden bg-black">
                  <LazyVideo
                    src={essayNinetyVid.url}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                <div className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base md:text-lg font-medium group-hover:text-rose-200 transition">The first 90 days, week by week</h3>
                    <p className="mt-1 text-xs text-muted-foreground">The honest field report of starting a real practice.</p>
                  </div>
                  <span className="text-rose-300/80 group-hover:text-rose-200 text-sm whitespace-nowrap">Read →</span>
                </div>
              </Link>
            </div>

          </section>

          {/* Shelf 4 — Games + Practices (twin CTA) */}
          <section className="mb-16 grid md:grid-cols-2 gap-4">
            <Link
              to="/experience/games"
              className="group block overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/15 via-card to-rose-600/10 hover:border-violet-400/60 transition"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black">
                <LazyVideo
                  src={gamesCtaVid.url}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <Gamepad2 className="absolute top-4 left-4 w-6 h-6 text-violet-200 drop-shadow-lg" />
              </div>
              <div className="p-6">
                <h2 className="text-xl md:text-2xl font-light group-hover:text-violet-100 transition">12 Contemplative Games</h2>
                <p className="mt-2 text-sm text-foreground/70 leading-snug">
                  Breath Temple. The Witness. The Pause. Who Is Thinking?
                  Fifteen curated, world-class games — from Vipassanā to Vigyan Bhairav Tantra.
                </p>
                <p className="mt-4 text-xs text-violet-300/80 group-hover:text-violet-200">Explore all twelve →</p>
              </div>
            </Link>
            <Link
              to="/experience/practices"
              className="group block overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/15 via-card to-sky-600/10 hover:border-emerald-400/60 transition"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black">
                <LazyVideo
                  src={practicesCtaVid.url}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <Wind className="absolute top-4 left-4 w-6 h-6 text-emerald-200 drop-shadow-lg" />
              </div>
              <div className="p-6">
                <h2 className="text-xl md:text-2xl font-light group-hover:text-emerald-100 transition">12 Daily Practices</h2>
                <p className="mt-2 text-sm text-foreground/70 leading-snug">
                  Witness, mettā, body scan, ātma vichāra, trāṭaka, yoga nidrā —
                  full step-by-step instructions in plain English. Practice freely.
                </p>
                <p className="mt-4 text-xs text-emerald-300/80 group-hover:text-emerald-200">Open the practices →</p>
              </div>
            </Link>
          </section>

          {/* Shelf 5 — The Inner Paths (cinematic, same shape as Six Paths) */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-300" />
                <h2 className="text-xl md:text-2xl font-light">The Inner Paths</h2>
              </div>
              <span className="text-xs text-amber-400/80">Complete ladders, free to walk</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              The four interior disciplines every yogic tradition converges on — Observation,
              Self-Inquiry, Neti-Neti, and Pranayama. Each laid out as a walkable ladder
              with teachings, micro-practices, and the traps to avoid. Fully readable, free.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {INNER_PATHS.map(p => {
                const vid = getInnerPathVideo(p.slug);
                return (
                <Link
                  key={p.slug}
                  to={p.href}
                  className="group block relative overflow-hidden rounded-2xl border border-border/60 hover:border-amber-500/40 transition aspect-[16/10]"
                >
                  {vid ? (
                    <LazyVideo
                      src={vid}
                      poster={p.image}
                      aria-label={p.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={1536}
                      height={960}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} mix-blend-overlay opacity-50`} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-sm uppercase tracking-[0.18em] text-amber-300 mb-2 font-medium">
                      {p.levels} levels · with {p.guru} · free
                    </div>
                    <h3 className="text-2xl md:text-3xl font-light text-white">{p.name}</h3>
                    <p className="mt-2 text-sm md:text-base text-white/90 leading-snug line-clamp-2">
                      {p.oneLine}
                    </p>
                  </div>
                </Link>
                );
              })}
            </div>

            {/* Wisdom Deck — companion card */}
            <div className="mt-4">
              <Link
                to="/experience/wisdom"
                className="group block overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-600/15 via-card to-amber-600/10 hover:border-rose-400/60 transition"
              >
                <div className="relative aspect-[24/5] overflow-hidden bg-black">
                  <LazyVideo
                    src={wisdomDeckVid.url}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <Layers className="absolute top-4 left-4 w-6 h-6 text-rose-200 drop-shadow-lg" />
                </div>
                <div className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-light group-hover:text-rose-100 transition">50 Wisdom Cards</h3>
                    <p className="text-xs text-foreground/70">Rumi, Buddha, Lao Tzu, Ramana, Krishnamurti — one line, swipe & sit.</p>
                  </div>
                  <span className="text-xs text-rose-300/80 group-hover:text-rose-200 whitespace-nowrap">Open deck →</span>
                </div>
              </Link>
            </div>
          </section>


          {/* Shelf 6 — The Deeper Wings (Lineage, Glossary, Prerequisites, Loops Atlas, Bridges) */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl md:text-2xl font-light">The Deeper Wings</h2>
              </div>
              <span className="text-xs text-amber-400/80">Long-form, citation-rich — free to read</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              The architecture behind everything else: the ancestry of the seers, the words wellness culture stole,
              the prerequisites no one tells you, the loops running your life, and the bridges between modern science and Sanatana yoga.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  href: "/experience/lineage",
                  icon: GitBranch,
                  title: "The Lineage Tree",
                  sub: "Saptarishi → seven streams → today",
                  body: "How seven seers seeded Vedanta, Tantra, Ayurveda, Bhakti, Nyaya, Dharma, and Sankhya — and which modern field is rediscovering each.",
                  gradient: "from-indigo-600/15 via-card to-violet-600/10",
                  accent: "border-indigo-500/30 hover:border-indigo-400/60 text-indigo-200",
                },
                {
                  href: "/experience/glossary",
                  icon: BookA,
                  title: "The Living Glossary",
                  sub: "Words that got stolen, returned",
                  body: "Meditation. Yoga. Karma. Guru. Chakra. Samadhi. Fifteen sacred words restored to their original meaning — with the prerequisites the wellness market deletes.",
                  gradient: "from-rose-600/15 via-card to-amber-600/10",
                  accent: "border-rose-500/30 hover:border-rose-400/60 text-rose-200",
                },
                {
                  href: "/experience/prerequisites",
                  icon: ListOrdered,
                  title: "The Prerequisites Map",
                  sub: "You cannot skip steps",
                  body: "Patanjali's eight limbs as a working diagram. Why meditation requires the six limbs before it. Plus the prerequisite ladders for peace, healing, love, and enlightenment.",
                  gradient: "from-emerald-600/15 via-card to-sky-600/10",
                  accent: "border-emerald-500/30 hover:border-emerald-400/60 text-emerald-200",
                },
                {
                  href: "/experience/loops-atlas",
                  icon: Library,
                  title: "The Loops Atlas",
                  sub: "Twelve patterns, deeply mapped",
                  body: "People-pleasing, doom-scrolling, impostor syndrome, perfectionism, rumination. Each with trigger, neuroscience, ancient diagnosis, and the dissolution path.",
                  gradient: "from-violet-600/15 via-card to-rose-600/10",
                  accent: "border-violet-500/30 hover:border-violet-400/60 text-violet-200",
                },
                {
                  href: "/experience/bridges",
                  icon: Atom,
                  title: "The Bridges",
                  sub: "Modern science ↔ the seers",
                  body: "Default Mode Network ↔ vrtti. Polyvagal theory ↔ iḍā/piṅgalā. Quantum entanglement ↔ Brahman. Twelve places science is catching up.",
                  gradient: "from-cyan-600/15 via-card to-amber-600/10",
                  accent: "border-cyan-500/30 hover:border-cyan-400/60 text-cyan-200",
                  span: "md:col-span-2",
                },
              ].map(({ href, icon: Icon, title, sub, body, gradient, accent, span }) => {
                const vid = getWingVideo(href);
                return (
                  <Link
                    key={href}
                    to={href}
                    className={`group block overflow-hidden rounded-2xl border ${accent} bg-gradient-to-br ${gradient} transition ${span ?? ""}`}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-black">
                      {vid ? (
                        <LazyVideo
                          src={vid}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          aria-hidden
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <Icon className="absolute top-4 left-4 w-6 h-6 opacity-95 drop-shadow-lg" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg md:text-xl font-light">{title}</h3>
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] opacity-70">{sub}</div>
                      <p className="mt-3 text-sm text-foreground/75 leading-snug">{body}</p>
                      <p className="mt-4 text-xs opacity-80 group-hover:opacity-100 transition">Open →</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>


          {/* Footer CTA */}
          <section className="border-t border-border/60 pt-10 mt-16 text-center">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-light">Like what you see?</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              The Showroom is a window. Inside the full app, the gurus talk back, the practices adapt to you,
              and the journey continues for years.
            </p>
            <Link
              to="/auth"
              className="inline-block mt-6 px-6 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              Begin your own journey
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default Showroom;
