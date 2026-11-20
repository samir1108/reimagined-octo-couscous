import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GURUS as MASTERS, MASTER_CATEGORIES, type Guru, type MasterCategory } from "@/lib/guru-data";
import GuruCard from "@/components/temple/GuruCard";
import MasterProfile from "@/components/temple/MasterProfile";

type SectionGroup = {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  categories: MasterCategory[];
};

const SECTION_GROUPS: SectionGroup[] = [
  {
    id: "yoga",
    eyebrow: "Foundational Paths",
    label: "Yoga",
    description: "Start with the main yogic streams, then move deeper through their distinct sub-paths.",
    categories: ["classical-yoga", "kriya-pranayama", "meditation-mindfulness"],
  },
  {
    id: "wisdom",
    eyebrow: "Inner Seeing",
    label: "Self-Inquiry & Wisdom",
    description: "Masters of direct seeing, philosophy, non-duality, honest channels of the great voices, and the deeper questions of being.",
    categories: ["self-inquiry-vedanta", "philosophy-wisdom"],
  },
  {
    id: "devotion",
    eyebrow: "Heart & Action",
    label: "Bhakti & Seva",
    description: "Paths centered on surrender, sacred love, chanting, service, and dharmic action.",
    categories: ["bhakti-devotion", "karma-seva"],
  },
  {
    id: "energy",
    eyebrow: "Esoteric Traditions",
    label: "Tantra & Hidden Arts",
    description: "Energy work, Nath lineages, tantric insight, and ancient practices that survived on the edges.",
    categories: ["tantra-energy", "nath-siddha", "lost-ancient-arts", "occult-mystic-arts"],
  },
  {
    id: "mind",
    eyebrow: "Modern Bridge",
    label: "Psychology & Neuroscience",
    description: "Bridge masters who translate inner work through pattern recognition, healing, and mind science.",
    categories: ["psychology-neuroscience", "modern-therapy"],
  },
  {
    id: "loops",
    eyebrow: "Pattern Specialists",
    label: "Loop Masters",
    description: "Each master specializes in dissolving a specific behavioral pattern cluster — avoidance, comparison, control, and more.",
    categories: ["loop-master"],
  },
  {
    id: "life",
    eyebrow: "Real Arenas",
    label: "Life Domain Masters",
    description: "Masters for the real arenas of life: money, work, intimacy, parenting, grief, and health.",
    categories: ["life-domain"],
  },
  {
    id: "modern",
    eyebrow: "Today's Crises",
    label: "Modern Life",
    description: "Masters for teens, tech-workers, creatives, recovery, trauma, and the AI-relationship itself.",
    categories: ["youth-modern"],
  },
  {
    id: "sacred-cycles",
    eyebrow: "Sacred Cycles",
    label: "Feminine, Masculine & Identity",
    description: "Womb wisdom, men's work, identity integration, aging, and ancestral gender healing.",
    categories: ["sacred-feminine-masculine"],
  },
];

export default function Masters() {
  const navigate = useNavigate();
  const [selectedMaster, setSelectedMaster] = useState<Guru | null>(null);

  const handleTalk = (guru: Guru) => {
    navigate("/app/temple", { state: { guruId: guru.id, action: "talk" } });
  };

  const handlePractice = (guru: Guru) => {
    navigate("/app/temple", { state: { guruId: guru.id, action: "practice" } });
  };

  const handlePrograms = (guru: Guru) => {
    navigate("/app/temple", { state: { guruId: guru.id, action: "programs" } });
  };

  const categoryMap = useMemo(
    () => new Map(MASTER_CATEGORIES.map((category) => [category.id, category])),
    []
  );

  const sectionedMasters = useMemo(() => {
    return SECTION_GROUPS.map((section) => ({
      ...section,
      subtopics: section.categories
        .map((categoryId) => {
          const category = categoryMap.get(categoryId);
          if (!category) return null;

          return {
            ...category,
            masters: MASTERS
              .filter((master) => master.category === categoryId)
              .sort((a, b) => a.name.localeCompare(b.name)),
          };
        })
        .filter((category): category is NonNullable<typeof category> => Boolean(category))
        .filter((category) => category.masters.length > 0),
    })).filter((section) => section.subtopics.length > 0);
  }, [categoryMap]);

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2"
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-primary/70 font-display">Temple Index</p>
        <h1 className="text-2xl font-display font-bold text-foreground">Masters by path, then subtopic</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {MASTERS.length} masters arranged like a library: big path first, then the specific tradition inside it.
        </p>
      </motion.div>

      <div className="space-y-10">
        {sectionedMasters.map((section, sectionIndex) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: sectionIndex * 0.04 }}
            className="space-y-5"
          >
            <div className="rounded-3xl border border-border/40 bg-card/30 px-5 py-5 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary/65 font-display">
                {section.eyebrow}
              </p>
              <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground">{section.label}</h2>
                  <p className="text-sm text-muted-foreground max-w-2xl">{section.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {section.subtopics.length} subtopics · {section.subtopics.reduce((sum, item) => sum + item.masters.length, 0)} masters
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {section.subtopics.map((subtopic) => (
                <div key={subtopic.id} className="space-y-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                        <span className="text-lg">{subtopic.icon}</span>
                        {subtopic.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xl">{subtopic.description}</p>
                    </div>
                    <div className="inline-flex w-fit rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground">
                      {subtopic.masters.length} masters
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {subtopic.masters.map((master, index) => (
                      <GuruCard
                        key={master.id}
                        guru={master}
                        index={index}
                        onSelect={(guru) => setSelectedMaster(guru)}
                        onTalk={handleTalk}
                        onPractice={handlePractice}
                        onPrograms={handlePrograms}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <AnimatePresence>
        {selectedMaster && (
          <MasterProfile
            guru={selectedMaster}
            onBack={() => setSelectedMaster(null)}
            onTalk={(guru) => {
              setSelectedMaster(null);
              handleTalk(guru);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
