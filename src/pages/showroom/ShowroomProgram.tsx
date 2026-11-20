import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Clock, Headphones, BookOpen } from "lucide-react";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { getShowroomProgram } from "@/data/showroomPrograms";

const ShowroomProgram = () => {
  useForceDarkMode();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const program = slug ? getShowroomProgram(slug) : undefined;
  if (!program) return <Navigate to="/showroom" replace />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.subtitle,
    provider: { "@type": "Organization", name: "ConsciousOS" },
    url: `${SITE_URL}/showroom/programs/${program.slug}`,
    hasCourseInstance: program.days.map(d => ({
      "@type": "CourseInstance",
      name: `Day ${d.day}: ${d.title}`,
      description: d.oneLine,
    })),
  };

  return (
    <>
      <Seo
        title={`${program.title} — free 7-day program with ${program.guru}`}
        description={`${program.subtitle} ${program.promise}`}
        canonicalPath={`/showroom/programs/${program.slug}`}
        type="article"
        keywords={`${program.title}, ${program.guru}, 7 day program, free meditation course, satyug-app`}
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
          <button
            onClick={() => navigate("/showroom")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <header className={`mt-6 rounded-3xl bg-gradient-to-br ${program.color} border border-border/60 p-8 md:p-12`}>
            <div className="text-5xl md:text-6xl">{program.theme}</div>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-amber-300/80">taught by {program.guru}</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-light leading-tight">{program.title}</h1>
            <p className="mt-4 text-base md:text-lg text-foreground/80 leading-relaxed">{program.subtitle}</p>
            <p className="mt-4 text-sm text-foreground/70 italic">{program.guruRole}.</p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-foreground/70 bg-background/30 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {program.duration} · 5–15 min per day · free, no signup
            </div>
            <p className="mt-6 text-sm md:text-base text-foreground/85 leading-relaxed">
              <span className="text-amber-300/80 font-medium">The promise:</span> {program.promise}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={`/experience/programs/${program.slug}/day/1/session`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium text-sm hover:from-amber-300 hover:to-orange-400 transition shadow-[0_0_40px_-8px_rgba(251,191,36,0.6)]"
              >
                <Headphones className="w-4 h-4" /> Begin live session — Day 1
              </Link>
              <Link
                to={`/experience/programs/${program.slug}/day/1`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border/60 text-foreground/85 hover:border-amber-400/50 hover:text-amber-100 transition text-sm"
              >
                <BookOpen className="w-4 h-4" /> Read Day 1 first
              </Link>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              A real voice, in {program.guru}'s tradition, walks you through each day.
            </p>
          </header>

          <section className="mt-10">
            <h2 className="text-lg font-light text-muted-foreground mb-4">The seven days</h2>
            <ol className="space-y-3">
              {program.days.map(d => (
                <li key={d.day}>
                  <Link
                    to={`/showroom/programs/${program.slug}/day/${d.day}`}
                    className="group block rounded-xl border border-border/60 bg-card/50 p-5 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl font-light text-amber-400/70 w-10">{d.day}</span>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-medium group-hover:text-amber-100 transition">
                          {d.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground italic">{d.oneLine}</p>
                        <p className="mt-2 text-xs text-foreground/50">
                          {d.practice.name} · {d.practice.durationMin} min
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/experience/programs/${program.slug}/day/${d.day}/session`);
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-100 text-[11px] hover:bg-amber-500/30 transition"
                        aria-label={`Begin live session for day ${d.day}`}
                      >
                        <Headphones className="w-3 h-3" /> Session
                      </button>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 text-center border-t border-border/60 pt-10">
            <Link
              to={`/showroom/programs/${program.slug}/day/1`}
              className="inline-block px-6 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              Begin Day 1 →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ShowroomProgram;
