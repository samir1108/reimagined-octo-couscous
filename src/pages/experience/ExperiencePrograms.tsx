import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { SHOWROOM_PROGRAMS } from "@/data/showroomPrograms";
import { AUDIENCES, AUDIENCE_PROGRAM_STUBS } from "@/data/audiencePrograms";
import ProgramMediaCard from "@/components/programs/ProgramMediaCard";
import CommunityRail from "@/components/programs/CommunityRail";
import {
  loadPersonalizationProfile,
  scorePrograms,
  topForYou,
  type PersonalizationProfile,
} from "@/lib/programPersonalization";

const CATEGORY_LABELS: Record<string, string> = {
  decision: "Decision",
  willpower: "Willpower",
  love: "Love & Relationships",
  knowledge: "Knowledge",
  purpose: "Purpose",
  nervous: "Nervous System",
  art: "Art & Creativity",
  "self-inquiry": "Self-Inquiry",
  attention: "Attention",
  shadow: "Shadow",
};

const ExperiencePrograms = () => {
  useForceDarkMode();

  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [selCategory, setSelCategory] = useState<string | null>(null);
  const [selGuru, setSelGuru] = useState<string | null>(null);
  const [selAudience, setSelAudience] = useState<string | null>(
    searchParams.get("audience"),
  );

  useEffect(() => {
    loadPersonalizationProfile().then(setProfile);
  }, []);

  // Sync when URL changes (e.g. navigating from AudienceSpectrumSection).
  useEffect(() => {
    const a = searchParams.get("audience");
    if (a) setSelAudience(a);
  }, [searchParams]);


  // Build filter options from the full catalog (unfiltered counts respect
  // the OTHER active filters so counts stay meaningful as user drills down).
  const filterOptions = useMemo(() => {
    const countBy = (
      key: "category" | "guru" | "audience",
      ignore: "category" | "guru" | "audience",
    ) => {
      const map = new Map<string, number>();
      for (const p of SHOWROOM_PROGRAMS) {
        if (ignore !== "category" && selCategory && p.category !== selCategory) continue;
        if (ignore !== "guru" && selGuru && p.guru !== selGuru) continue;
        if (ignore !== "audience" && selAudience && p.audience !== selAudience) continue;
        const v = (p as any)[key] as string | undefined;
        if (!v) continue;
        map.set(v, (map.get(v) ?? 0) + 1);
      }
      return map;
    };

    const catMap = countBy("category", "category");
    const guruMap = countBy("guru", "guru");
    const audMap = countBy("audience", "audience");

    const categories = Array.from(catMap.entries())
      .map(([id, count]) => ({ id, label: CATEGORY_LABELS[id] ?? id, count }))
      .sort((a, b) => b.count - a.count);
    const gurus = Array.from(guruMap.entries())
      .map(([id, count]) => ({ id, label: id, count }))
      .sort((a, b) => b.count - a.count);
    const audiences = AUDIENCES
      .map((a) => ({ id: a.id, label: a.label, count: audMap.get(a.id) ?? 0 }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    return { categories, gurus, audiences };
  }, [selCategory, selGuru, selAudience]);

  // Apply filters to the actual program list
  const filteredPrograms = useMemo(() => {
    return SHOWROOM_PROGRAMS.filter((p) => {
      if (selCategory && p.category !== selCategory) return false;
      if (selGuru && p.guru !== selGuru) return false;
      if (selAudience && p.audience !== selAudience) return false;
      return true;
    });
  }, [selCategory, selGuru, selAudience]);

  const filteredStubs = useMemo(() => {
    return AUDIENCE_PROGRAM_STUBS.filter((s) => {
      if (selCategory) return false; // stubs have no category
      if (selGuru && s.guru !== selGuru) return false;
      if (selAudience && s.audience !== selAudience) return false;
      return true;
    });
  }, [selCategory, selGuru, selAudience]);

  const liveByAudience = useMemo(() => {
    const map = new Map<string, typeof SHOWROOM_PROGRAMS>();
    for (const p of filteredPrograms) {
      if (!p.audience) continue;
      const arr = map.get(p.audience) ?? [];
      arr.push(p);
      map.set(p.audience, arr);
    }
    return map;
  }, [filteredPrograms]);

  const stubsByAudience = useMemo(() => {
    const map = new Map<string, typeof AUDIENCE_PROGRAM_STUBS>();
    for (const s of filteredStubs) {
      const arr = map.get(s.audience) ?? [];
      arr.push(s);
      map.set(s.audience, arr);
    }
    return map;
  }, [filteredStubs]);

  const unassignedPrograms = useMemo(
    () => filteredPrograms.filter((p) => !p.audience),
    [filteredPrograms],
  );

  const anyFilter = !!(selCategory || selGuru || selAudience);

  const audiencePrograms = SHOWROOM_PROGRAMS.filter((p) => p.audience);
  const scored = useMemo(() => scorePrograms(audiencePrograms, profile), [audiencePrograms, profile]);
  const forYou = useMemo(() => topForYou(scored, 4), [scored]);
  const reasonBySlug = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of scored) if (s.reason) m[s.program.slug] = s.reason;
    return m;
  }, [scored]);

  const totalMatches = filteredPrograms.length + filteredStubs.length;
  const liveCount = audiencePrograms.length;
  const stubCount = AUDIENCE_PROGRAM_STUBS.length;

  const railItems = AUDIENCES
    .map((a) => ({
      id: a.id,
      label: a.label,
      count: (liveByAudience.get(a.id)?.length ?? 0) + (stubsByAudience.get(a.id)?.length ?? 0),
    }))
    .filter((x) => x.count > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ConsciousOS Programs — for teams, professions and communities",
    url: `${SITE_URL}/experience/programs`,
    description: `Audience-specific 7-day programs: corporate leadership, uniformed services, trauma & nervous system (LOOPS), ritual practice (Shakti), and more.`,
  };

  return (
    <>
      <Seo
        title="Programs — for corporate teams, government, healers, ritual practitioners"
        description="Audience-specific 7-day programs. Corporate leadership under fire. Duty without damage for uniformed services. LOOPS for the nervous system. Shakti and the ethics of power. Same orb-driven session engine, tuned for who you are."
        canonicalPath="/experience/programs"
        keywords="corporate meditation, leadership burnout, police meditation, military ptsd, trauma yoga, shakti, witchcraft ethics, nervous system training, karma yoga"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.assign("/experience");
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Hero */}
          <header className="mt-8 md:mt-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs uppercase tracking-[0.28em] text-amber-500/80"
              >
                Programs
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-3 text-4xl md:text-6xl font-light leading-[1.05] tracking-tight"
              >
                A program for<br />
                <span className="text-amber-300/90">who you are</span> —<br />
                not just what you feel.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl"
              >
                The Six Paths are for anyone. Programs are for <em>someone</em> —
                a corporate leader running on fumes, an officer whose shift follows them home,
                a person in the same anxiety loop for the third year, a witch learning to close
                what she opens. Same orb. Same session engine. Tuned for the life you actually live.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="mt-6 inline-flex items-center gap-2 text-xs text-foreground/70 bg-background/30 px-3 py-1.5 rounded-full border border-border/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {liveCount} programs live · {stubCount} in production
              </motion.div>
            </div>
            <div className="hidden md:block">
              
            </div>
          </header>

          {/* For you shelf */}
          {forYou.length > 0 && profile && (
            <section className="mt-16 md:mt-24">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-amber-400/90">Ranked for you</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-light">
                    Because your root loop is{" "}
                    <span className="text-amber-300 italic">
                      {profile.analysis.loopRootLabel}
                    </span>
                  </h2>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
                {forYou.map((s, i) => (
                  <ProgramMediaCard
                    key={s.program.slug}
                    program={s.program}
                    reason={s.reason}
                    index={i}
                    featured={i === 0}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Body: rail + shelves */}
          <div className="mt-16 md:mt-24 flex gap-10">
            <CommunityRail items={railItems} />

            <div className="flex-1 min-w-0 space-y-20">
              {AUDIENCES.map((a) => {
                const live = liveByAudience.get(a.id) ?? [];
                const stubs = stubsByAudience.get(a.id) ?? [];
                if (live.length === 0 && stubs.length === 0) return null;
                return (
                  <section key={a.id} id={a.id} className="scroll-mt-24">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                      className={`rounded-2xl border border-border/60 bg-gradient-to-br ${a.color} p-6 md:p-8`}
                    >
                      <h2 className="text-2xl md:text-3xl font-light">{a.label}</h2>
                      <p className="mt-2 text-sm md:text-base text-foreground/70 italic">{a.tagline}</p>
                    </motion.div>

                    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {live.map((p, i) => (
                        <ProgramMediaCard
                          key={p.slug}
                          program={p}
                          reason={reasonBySlug[p.slug]}
                          index={i}
                        />
                      ))}
                      {stubs.map((s, i) => (
                        <motion.div
                          key={s.slug}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className={`relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br ${s.color} p-6 min-h-[300px] flex flex-col opacity-70`}
                        >
                          <div className="text-4xl grayscale">{s.theme}</div>
                          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                            with {s.guru}
                          </p>
                          <h3 className="mt-1 text-lg font-medium leading-snug text-foreground/85">
                            {s.title}
                          </h3>
                          <p className="mt-2 text-sm text-foreground/60 line-clamp-3">{s.subtitle}</p>
                          <div className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-500/60">
                            Next release
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <section className="mt-28 text-center border-t border-border/60 pt-12 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Don't see your community? Programs get built when we hear a real ask.
              Tell us who you are and what breaks you.
            </p>
            <Link
              to="/experience/paths"
              className="inline-block mt-6 px-6 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              Or walk one of the Six Paths →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperiencePrograms;
