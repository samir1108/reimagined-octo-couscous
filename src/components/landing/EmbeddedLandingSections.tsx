import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface LandingSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  content: React.ReactNode;
}

const SECTIONS: LandingSection[] = [
  {
    id: "mirror",
    title: "The Mirror",
    subtitle: "See yourself — deeply, honestly, beautifully",
    icon: <Sparkles className="w-6 h-6" />,
    color: "#8B5CF6",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Your daily consciousness dashboard. Track your V-level, explore active loops, review your theme of the day, and witness your growth across 4 dimensions.</p>
        <p className="text-primary/80 font-medium">Tap any tab to dive deeper into a specific lens.</p>
      </div>
    ),
  },
  {
    id: "practice",
    title: "Daily Practice",
    subtitle: "Micro-habits that compound into transformation",
    icon: <ArrowRight className="w-6 h-6 rotate-45" />,
    color: "#10B981",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Personalized 30/50/20 practice mix: one core anchor, two AI-tuned picks, one free choice. Tuned to your arrival state, active loops, and today's theme.</p>
        <p className="text-primary/80 font-medium">Adapts in real-time as you check in.</p>
      </div>
    ),
  },
  {
    id: "journey",
    title: "Guided Journeys",
    subtitle: "Structured paths with living teachers",
    icon: <Sparkles className="w-6 h-6" />,
    color: "#EC4899",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Foundation Course (118 days), Guru Programs, and personalized arcs. Each day brings a teaching, a practice, and an evening integration — all woven into your Mirror.</p>
        <p className="text-primary/80 font-medium">Progress unlocks deeper layers automatically.</p>
      </div>
    ),
  },
  {
    id: "community",
    title: "Sangha & Council",
    subtitle: "Walk the path together",
    icon: <ArrowRight className="w-6 h-6 rotate-45" />,
    color: "#3B82F6",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Council of Yogis for archetypal guidance. Mirror reflections shared with trusted peers. Anonymous pattern matching shows you're not alone in your loops.</p>
        <p className="text-primary/80 font-medium">Connection without comparison.</p>
      </div>
    ),
  },
];

export default function EmbeddedLandingSections({ sections = SECTIONS }: { sections?: LandingSection[] }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          className="group glass-card rounded-2xl border border-border/30 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.02]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <button
            onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
            className="w-full p-5 flex items-start gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-expanded={openSection === section.id}
          >
            <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center flex-col" style={{ backgroundColor: section.color + "15", borderColor: section.color + "40" }}>
              <span style={{ color: section.color }}>{section.icon}</span>
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-display text-lg font-semibold text-foreground truncate">{section.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{section.subtitle}</p>
            </div>
            <motion.div
              className="shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors"
              animate={{ rotate: openSection === section.id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: openSection === section.id ? "auto" : 0, opacity: openSection === section.id ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border/30">
              {section.content}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}