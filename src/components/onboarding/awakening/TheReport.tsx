/**
 * TheReport — the session-11 development report.
 * ─────────────────────────────────
 * The eleven sessions end here: everything the user actually did, assembled
 * into one honest document — what they learned to notice, the patterns they
 * named, what their actions created, and the paths recommended next.
 *
 * Nothing here is invented. Every line traces back to the user's own
 * answers, vows, and practices.
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { DevelopmentReport } from "@/lib/onboarding/awakening";
import DevelopmentMapCard from "./DevelopmentMapCard";
import type { CapabilityMap } from "@/lib/onboarding/awakening";
import { CAPABILITY_LABEL } from "@/lib/onboarding/awakening";

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.12, duration: 0.6, ease: "easeOut" as const },
});

export default function TheReport({
  report,
  map,
  onOpenPath,
  onDone,
}: {
  report: DevelopmentReport;
  map: CapabilityMap;
  onOpenPath: (journeySlug: string) => void;
  onDone: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100dvh] bg-background px-5 py-10"
    >
      <div className="w-full max-w-md mx-auto">
        <motion.p {...stagger(0)} className="text-[10px] uppercase tracking-[0.32em] text-primary/80 text-center mb-2">
          The awakening journey · complete
        </motion.p>
        <motion.h1 {...stagger(1)} className="font-display text-3xl text-foreground text-center leading-tight mb-2">
          Your development map.
        </motion.h1>
        <motion.p {...stagger(1)} className="text-[12.5px] text-muted-foreground text-center mb-8 leading-relaxed">
          {report.headline}
        </motion.p>

        {/* Strengths and growth edges */}
        <motion.div {...stagger(2)} className="flex gap-2 mb-3">
          <div className="flex-1 rounded-2xl border border-border/40 bg-card/40 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 mb-1.5">Strengths</p>
            <p className="font-display text-[14px] text-foreground/90">
              {report.strengths.map((c) => CAPABILITY_LABEL[c]).join(" · ")}
            </p>
          </div>
          <div className="flex-1 rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70 mb-1.5">Growth edges</p>
            <p className="font-display text-[14px] text-foreground/90">
              {report.growthEdges.map((c) => CAPABILITY_LABEL[c]).join(" · ")}
            </p>
          </div>
        </motion.div>

        {/* The map */}
        <motion.div {...stagger(3)} className="mb-3">
          <DevelopmentMapCard map={map} />
        </motion.div>

        {/* The sections */}
        {report.sections.map((section, i) => (
          <motion.div
            key={section.id}
            {...stagger(4 + i)}
            className="rounded-3xl border border-border/40 bg-card/40 px-5 py-4 mb-3"
          >
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80 mb-2">
              {section.title}
            </p>
            <div className="space-y-1.5">
              {section.lines.map((line, li) => (
                <p key={li} className="text-[13px] text-foreground/85 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Recommended paths */}
        <motion.p {...stagger(9)} className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-2 mt-6">
          Where to go next
        </motion.p>
        {report.recommendedPaths.map((path, i) => (
          <motion.button
            key={path.slug}
            {...stagger(10 + i)}
            onClick={() => path.journeySlug && onOpenPath(path.journeySlug)}
            className="w-full text-left rounded-2xl border border-border/40 bg-card/40 hover:border-primary/50 hover:bg-card/60 px-4 py-3.5 mb-2.5 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-display text-[15px] text-foreground">{path.title}</span>
              <ArrowRight className="h-4 w-4 text-primary/70 shrink-0" />
            </div>
            <p className="text-[12px] text-muted-foreground leading-snug">{path.reason}</p>
          </motion.button>
        ))}

        {/* Done */}
        <motion.div {...stagger(13)} className="flex flex-col items-center gap-3 pt-4 pb-8">
          <p className="text-[12.5px] text-muted-foreground text-center max-w-[300px] leading-relaxed">
            The map is drawn and it keeps moving. The system now runs on what you have learned to
            notice.
          </p>
          <button
            onClick={onDone}
            className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
          >
            Continue into the app
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
