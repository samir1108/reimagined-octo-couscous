import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2, Landmark, GraduationCap, Baby, HeartPulse, Stethoscope,
  Palette, Users, Trophy, Rocket, Scale, Sparkles, Flame, Home,
  BookOpen, Music, Feather, Shield, Lock, Eye, Handshake, Moon,
  HeartCrack, Cross,
} from "lucide-react";
import { AUDIENCES } from "@/data/audiencePrograms";
import { SHOWROOM_PROGRAMS } from "@/data/showroomPrograms";

// Icon per audience id
const ICONS: Record<string, any> = {
  corporate: Building2,
  government: Landmark,
  healers: Sparkles,
  ritual: Flame,
  creators: Palette,
  parents: Home,
  students: GraduationCap,
  athletes: Trophy,
  founders: Rocket,
  healthcare: Stethoscope,
  teachers: BookOpen,
  grief: HeartCrack,
  nurses: HeartPulse,
  lawyers: Scale,
  monks: Feather,
  refugees: Shield,
  recovery: Handshake,
  caregivers: Cross,
  lgbtq: Sparkles,
  prisoners: Lock,
  journalists: Eye,
  sexworkers: Users,
  widows: Moon,
  musicians: Music,
  kids: Baby,
};

// Group audiences into three human buckets so the section reads like the
// landing page "Experience" grid instead of one long flat list.
const GROUPS: { id: string; label: string; sub: string; ids: string[] }[] = [
  {
    id: "institutions",
    label: "Institutions",
    sub: "Companies, schools, hospitals, governments",
    ids: ["corporate", "founders", "government", "healthcare", "teachers", "students", "kids", "athletes"],
  },
  {
    id: "callings",
    label: "Callings & Craft",
    sub: "The people who hold others together",
    ids: ["nurses", "healers", "lawyers", "journalists", "creators", "musicians", "monks", "caregivers"],
  },
  {
    id: "life",
    label: "Life Situations",
    sub: "Where the practice actually meets you",
    ids: ["parents", "grief", "widows", "recovery", "refugees", "prisoners", "lgbtq", "ritual", "sexworkers"],
  },
];

// Program counts per audience (live + all seed data).
function useAudienceCounts() {
  const map = new Map<string, number>();
  for (const p of SHOWROOM_PROGRAMS) {
    if (!p.audience) continue;
    map.set(p.audience, (map.get(p.audience) ?? 0) + 1);
  }
  return map;
}

export default function AudienceSpectrumSection() {
  const navigate = useNavigate();
  const counts = useAudienceCounts();

  const byId = new Map<string, (typeof AUDIENCES)[number]>(AUDIENCES.map((a) => [a.id, a]));
  // Include a synthetic "kids" tile even though data isn't authored yet.
  const KIDS = {
    id: "kids",
    label: "Kids & Teens",
    tagline: "Attention, feelings, and the phone in their hand.",
    color: "from-amber-400/20 to-pink-400/10",
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-display tracking-[0.25em] uppercase text-primary/70 mb-2">
          For Every Kind Of Life
        </p>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Who is this practice for?
        </h2>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Pick the world you're actually living in. Every card opens a full library of 7-day programs tuned for that life.
        </p>
      </div>

      {GROUPS.map((group, gi) => (
        <div key={group.id} className="space-y-3">
          <div>
            <p className="text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground">
              {group.label}
            </p>
            <p className="text-xs text-muted-foreground/70 font-body">{group.sub}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {group.ids.map((id, i) => {
              const meta =
                id === "kids"
                  ? KIDS
                  : byId.get(id) ?? { id, label: id, tagline: "", color: "from-primary/20 to-secondary/10" };
              const Icon = ICONS[id] ?? Sparkles;
              const count = counts.get(id) ?? 0;
              const comingSoon = id === "kids" || count === 0;

              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (gi * 6 + i) * 0.03, duration: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    comingSoon
                      ? null
                      : navigate(`/experience/programs?audience=${id}`)
                  }
                  className={`relative text-left rounded-2xl p-4 border border-border/50 glass-card overflow-hidden group ${
                    comingSoon ? "opacity-70 cursor-default" : "hover:border-primary/40"
                  } transition-all`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-60 pointer-events-none`}
                  />
                  <div className="relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-background/40 backdrop-blur-sm flex items-center justify-center mb-3 border border-border/40">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <p className="text-sm font-display font-semibold text-foreground leading-tight">
                      {meta.label}
                    </p>
                    {meta.tagline && (
                      <p className="text-[11px] text-muted-foreground font-body mt-1 leading-snug line-clamp-2">
                        {meta.tagline}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-display tracking-wider uppercase text-primary/70">
                        {comingSoon ? "Coming soon" : `${count} program${count === 1 ? "" : "s"}`}
                      </span>
                      {!comingSoon && (
                        <span className="text-[10px] font-display text-primary/60">Open →</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
