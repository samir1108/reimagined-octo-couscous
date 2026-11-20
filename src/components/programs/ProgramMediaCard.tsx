import { Link } from "react-router-dom";
import { Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import LazyVideo from "@/components/LazyVideo";
import { getProgramVideo } from "@/data/programVideos";
import type { ShowroomProgram } from "@/data/showroomPrograms";
import { MASTER_IMAGES } from "@/assets/masters";

/** Map a guru name → the master portrait file (uses what's on disk). */
const GURU_TO_MASTER: Record<string, string> = {
  Krishna: "krishna",
  Arjuna: "arjun",
  Meera: "meera",
  Shiva: "shiva",
  "The Witness": "ramana",
  Ramana: "ramana",
  Kali: "ramakrishna",
  "Lao Tzu": "laotzu",
  Dōgen: "dogen",
  Patanjali: "patanjali",
  Buddha: "buddha",
  Saraswati: "kavya",
  Yashoda: "maatru",
  Ganesha: "drishti-focus",
  Hanuman: "veer",
  Chanakya: "karma-yogi",
  Dhanvantari: "karuna",
  Vidura: "dharma",
  Vivekananda: "vivekananda",
  Aurobindo: "aurobindo",
  Ramakrishna: "ramakrishna",
};

function masterImage(guru: string): string | undefined {
  const key = GURU_TO_MASTER[guru];
  if (key && MASTER_IMAGES[key]) return MASTER_IMAGES[key];
  return undefined;
}

interface Props {
  program: ShowroomProgram;
  reason?: string;
  index?: number;
  featured?: boolean;
}

export default function ProgramMediaCard({ program: p, reason, index = 0, featured = false }: Props) {
  const video = getProgramVideo(p.slug, p.category);
  const portrait = masterImage(p.guru);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className={featured ? "col-span-full" : ""}
    >
      <Link
        to={`/experience/programs/${p.slug}`}
        className={`group relative block overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${p.color}
          hover:border-amber-500/50 transition-all duration-500
          ${featured ? "min-h-[380px] md:min-h-[440px]" : "min-h-[300px]"}
          shadow-[0_10px_40px_-20px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_-20px_rgba(251,191,36,0.25)]`}
      >
        {/* Video layer */}
        {video && (
          <LazyVideo
            src={video}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-[1200ms]"
            aria-hidden
          />
        )}
        {/* Master portrait — corner medallion */}
        {portrait && (
          <div className="absolute top-4 right-4 z-10">
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-amber-400/40 shadow-lg backdrop-blur-sm">
              <img
                src={portrait}
                alt={p.guru}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>
        )}
        {/* Readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/20 pointer-events-none" />
        {/* Amber glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.15),transparent_60%)]" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <div className="text-4xl md:text-5xl mb-3 drop-shadow-lg">{p.theme}</div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-amber-300/90 font-medium">
            with {p.guru}
          </p>
          <h3 className={`mt-2 font-light leading-tight text-foreground group-hover:text-amber-100 transition
            ${featured ? "text-2xl md:text-4xl" : "text-lg md:text-xl"}`}>
            {p.title}
          </h3>
          <p className={`mt-2 text-foreground/75 leading-relaxed
            ${featured ? "text-sm md:text-base line-clamp-3" : "text-xs md:text-sm line-clamp-2"}`}>
            {p.subtitle}
          </p>

          {reason && (
            <div className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
              <span className="italic leading-snug">{reason}</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/50">
            <Clock className="w-3 h-3" /> 7 days · free · no signup
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
