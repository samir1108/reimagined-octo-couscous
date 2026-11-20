import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, Sparkles, BookOpen, Clock, ChevronRight, Zap, Eye } from "lucide-react";
import { useState } from "react";
import type { Guru, GuruPractice } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";
import CinematicPracticeRunner from "./CinematicPracticeRunner";
import SensorialPracticeSession from "./sensorial/SensorialPracticeSession";
import { findSensorialManifest } from "@/data/sensorialPractices";
import { useGuruProgramCatalog, useEnrollGuruProgram, useActiveGuruProgram, type GuruProgram } from "@/hooks/useGuruPrograms";
import ProgramActivation from "./ProgramActivation";
import MasterJourneyReview from "./MasterJourneyReview";

interface MasterProfileProps {
  guru: Guru;
  onBack: () => void;
  onTalk: (guru: Guru) => void;
}

type BottomTab = "about" | "practices" | "programs";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-400/70 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400/70 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400/70 bg-rose-400/10 border-rose-400/20",
};

const PATH_LABELS: Record<string, string> = {
  awareness: "Jnana Yoga · ज्ञान योग",
  kriya: "Kriya Yoga · क्रिया योग",
  hatha: "Hatha Yoga · हठ योग",
  bhakti: "Bhakti Yoga · भक्ति योग",
  karma: "Karma Yoga · कर्म योग",
  neuroscience: "Modern Science · विज्ञान",
  psychology: "Psychology · मनोविज्ञान",
  philosophy: "Darshana · दर्शन",
  advaita: "Advaita Vedanta · अद्वैत",
  tantra: "Tantra · तंत्र",
  compassion: "Karuna · करुणा",
  breath: "Pranayama · प्राणायाम",
  design: "Dharma Design · धर्म",
  nidra: "Yoga Nidra · योग निद्रा",
  vayu: "Vayu Yoga · वायु योग",
  shanti: "Shanti · शांति",
  prana: "Prana Vidya · प्राण विद्या",
  jyoti: "Jyoti Yoga · ज्योति योग",
  dharma: "Dharma · धर्म",
  maya: "Maya Vidya · माया विद्या",
  mantra: "Mantra Yoga · मंत्र योग",
  shakti: "Shakti · शक्ति",
};

export default function MasterProfile({ guru, onBack, onTalk }: MasterProfileProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>("about");
  const [activePractice, setActivePractice] = useState<GuruPractice | null>(null);
  const [showActivation, setShowActivation] = useState<GuruProgram | null>(null);

  const { data: programs, isLoading: programsLoading } = useGuruProgramCatalog(guru.id);
  const { data: activeProgram } = useActiveGuruProgram();
  const enrollMutation = useEnrollGuruProgram();

  const imageSource = MASTER_IMAGES[guru.id] || guru.image;
  const shortTitle = guru.title?.split("·")[0]?.trim() || guru.title;
  const sanskritTitle = guru.title?.split("·")[1]?.trim() || "";
  const yogaPath = PATH_LABELS[guru.path || ""] || guru.path || "Yoga";

  const handleActivationComplete = () => {
    if (!showActivation) return;
    enrollMutation.mutate(
      { guruId: guru.id, program: showActivation },
      { onSuccess: () => setShowActivation(null) }
    );
  };

  // If a practice session is active, show it (prefer cinematic Sensorial player when a manifest exists)
  if (activePractice) {
    const manifest = findSensorialManifest(guru.id, activePractice.name);
    if (manifest) {
      return (
        <SensorialPracticeSession
          manifest={manifest}
          guru={guru}
          onBack={() => setActivePractice(null)}
        />
      );
    }
    return (
      <CinematicPracticeRunner
        practice={activePractice}
        guru={guru}
        onBack={() => setActivePractice(null)}
      />
    );
  }

  // Program activation overlay
  if (showActivation) {
    return (
      <ProgramActivation
        programTitle={showActivation.title}
        programDescription={showActivation.description}
        masterName={guru.name}
        masterImage={imageSource}
        durationDays={showActivation.duration_days}
        dailyTimeMinutes={30}
        hasLegalDisclaimer={false}
        onActivate={handleActivationComplete}
        onClose={() => setShowActivation(null)}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onBack}
    >
      <motion.div
        className="relative w-full h-full bg-background flex flex-col overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] scrollbar-none">
        {/* Hero image */}
        <div className="relative w-full aspect-[3/4] max-h-[45vh] md:aspect-auto md:max-h-none md:h-[70vh] bg-background">
          <img
            src={imageSource}
            alt={guru.name}
            className="w-full h-full object-cover object-top md:object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute left-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 w-9 h-9 rounded-full bg-background/40 backdrop-blur-md border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Name overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-foreground text-2xl font-display font-semibold tracking-wide">
              {guru.name}
            </h1>
            <p className="text-muted-foreground text-sm font-display tracking-wider mt-1">
              {shortTitle} {sanskritTitle && <span className="text-muted-foreground/60">· {sanskritTitle}</span>}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-muted-foreground text-[10px] font-display tracking-wider">
                {yogaPath}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-muted-foreground text-[10px] font-display tracking-wider">
                {guru.practices?.length || 0} Practices
              </span>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="px-5 py-4">
          <blockquote
            className="text-muted-foreground text-sm font-display italic leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', 'DM Sans', serif" }}
          >
            "{guru.quote}"
          </blockquote>
        </div>

        {/* Tab buttons - scrollable row */}
        <div className="px-5 flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
          {([
            { id: "about" as BottomTab, label: "About" },
            { id: "practices" as BottomTab, label: "Practices" },
            { id: "programs" as BottomTab, label: "Programs" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-[11px] font-display tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 pb-44">
          <AnimatePresence mode="wait">
            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <motion.div
                key="about"
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {/* Bio */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h3 className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-2">Biography</h3>
                  <p className="text-foreground/80 text-xs font-display leading-relaxed">
                    {guru.bio || `${guru.name} is a profound teacher whose wisdom guides seekers on the path of ${yogaPath}.`}
                  </p>
                </div>

                {/* Key Teaching */}
                {guru.keyTeaching && (
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                    <h3 className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-2">Key Teachings</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {guru.keyTeaching.split(",").map((t, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-muted/30 border border-border/30 text-muted-foreground text-[10px] font-display">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Associated Texts */}
                {guru.associatedTexts && guru.associatedTexts.length > 0 && (
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                    <h3 className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-2">Sacred Texts</h3>
                    <div className="space-y-2">
                      {guru.associatedTexts.map((text, i) => (
                        <div key={i} className="flex items-center gap-2 text-muted-foreground/70 text-xs font-display">
                          <BookOpen className="w-3 h-3 text-muted-foreground/40" />
                          <span className="capitalize">{text.replace(/-/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* PRACTICES TAB */}
            {activeTab === "practices" && (
              <motion.div
                key="practices"
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-1">
                  Sacred Practices
                </p>
                {guru.practices?.map((practice, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePractice(practice)}
                    className="w-full text-left p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground text-sm font-display font-medium mb-1">{practice.name}</h4>
                        <p className="text-muted-foreground text-xs font-display leading-relaxed line-clamp-2">{practice.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="flex items-center gap-1 text-muted-foreground text-[10px] font-display">
                          <Clock className="w-3 h-3" />
                          {practice.duration}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* PROGRAMS TAB */}
            {activeTab === "programs" && (
              <motion.div
                key="programs"
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-1">
                  Programs
                </p>
                {programsLoading ? (
                  <div className="text-center py-8 text-muted-foreground text-xs font-display">Loading programs...</div>
                ) : (programs && programs.length > 0) ? (
                  programs.map((program, i) => (
                    <button
                      key={program.title + i}
                      onClick={() => {
                        if (!activeProgram) setShowActivation(program);
                      }}
                      className="w-full text-left p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-foreground text-sm font-display font-medium mb-1">{program.title}</h4>
                          <p className="text-muted-foreground text-xs font-display leading-relaxed line-clamp-2">{program.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-muted-foreground text-[10px] font-display">
                              <Clock className="w-3 h-3" />
                              {program.duration_days} days
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-display border ${DIFFICULTY_COLORS[program.difficulty] || "text-muted-foreground bg-muted/30 border-border/30"}`}>
                              {program.difficulty}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors mt-1 shrink-0" />
                      </div>
                    </button>
                  ))
                ) : (
                  /* Fallback to local programs data */
                  guru.programs?.map((program: any, i: number) => (
                    <button
                      key={program.id || i}
                      onClick={() => {
                        if (!activeProgram) setShowActivation({
                          id: program.id,
                          title: program.title,
                          description: program.description,
                          duration_days: program.durationDays,
                          difficulty: program.difficulty,
                          focus: program.focus,
                          guru_id: guru.id,
                          curriculum: [],
                        } as any);
                      }}
                      className="w-full text-left p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-foreground text-sm font-display font-medium mb-1">{program.title}</h4>
                          <p className="text-muted-foreground text-xs font-display leading-relaxed line-clamp-2">{program.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-muted-foreground text-[10px] font-display">
                              <Clock className="w-3 h-3" />
                              {program.durationDays} days
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-display border ${DIFFICULTY_COLORS[program.difficulty] || "text-muted-foreground bg-muted/30 border-border/30"}`}>
                              {program.difficulty}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors mt-1 shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Chat button — sits above the app bottom tab bar */}
      <div className="absolute bottom-[72px] md:bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
        <button
          onClick={() => onTalk(guru)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary/15 border border-primary/25 text-primary text-sm font-display tracking-wider hover:bg-primary/25 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          Chat with {guru.name}
        </button>
      </div>
      </motion.div>
    </motion.div>
  );
}
