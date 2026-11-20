import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_PROGRAMS, PROGRAM_CATEGORIES } from "@/data/programs";
import type { Program, ProgramCategory } from "@/data/programs/types";
import ProgramCard from "./ProgramCard";
import ProgramDetail from "./ProgramDetail";
import { useActiveEnrollment, useLeaveProgram } from "@/hooks/usePrograms";
import ActiveProgramView from "./ActiveProgramView";
import { getProgramById } from "@/data/programs";
import { Play, LogOut } from "lucide-react";
import V2ProgramsSection from "./V2ProgramsSection";
import AudienceSpectrumSection from "./AudienceSpectrumSection";


export default function ProgramsTab() {
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | "all">("all");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showActiveView, setShowActiveView] = useState(false);

  const { data: activeEnrollment } = useActiveEnrollment();
  const leaveProgram = useLeaveProgram();
  const activeProgram = activeEnrollment ? getProgramById(activeEnrollment.program_id) : null;

  // Only show programs with actual curriculum content (non-stubs have >0 curriculum items with real knowledge)
  const programs = (selectedCategory === "all" ? ALL_PROGRAMS : ALL_PROGRAMS.filter(p => p.category === selectedCategory))
    .filter(p => p.curriculum.length > 0 && p.curriculum[0]?.knowledge?.content?.length > 100);

  if (selectedProgram) {
    return (
      <ProgramDetail
        program={selectedProgram}
        onBack={() => setSelectedProgram(null)}
        onEnrolled={() => setShowActiveView(true)}
      />
    );
  }

  return (
    <motion.div
      key="programs"
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AudienceSpectrumSection />

      <V2ProgramsSection />


      {/* Active Program Banner */}
      {activeEnrollment && activeProgram && (
        <motion.div
          className="glass-card rounded-2xl p-4 border border-primary/20 transition-colors"
          
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" onClick={() => setShowActiveView(true)}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${activeProgram.coverGradient} flex items-center justify-center`}>
                <Play className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-primary font-display tracking-wider uppercase">Active Program</p>
                <p className="text-sm font-display font-semibold text-foreground">{activeProgram.title}</p>
                <p className="text-xs text-muted-foreground font-body">
                  Day {activeEnrollment.current_day} of {activeProgram.duration}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => setShowActiveView(true)}
                className="text-xs px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-display cursor-pointer"
              >
                Continue
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to leave this program?")) {
                    leaveProgram.mutate(activeEnrollment.id);
                  }
                }}
                className="w-8 h-8 rounded-xl glass-subtle flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                title="Leave Program"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-display transition-all ${
            selectedCategory === "all"
              ? "bg-primary/15 text-primary border border-primary/20"
              : "glass-subtle text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {PROGRAM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-display transition-all ${
              selectedCategory === cat.id
                ? "bg-primary/15 text-primary border border-primary/20"
                : "glass-subtle text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onClick={() => setSelectedProgram(program)}
          />
        ))}
      </div>

      {programs.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <span className="text-3xl mb-2 block">🔮</span>
          <p className="text-sm font-display text-foreground mb-1">Coming Soon</p>
          <p className="text-xs text-muted-foreground font-body">
            Full content programs for this category are being crafted.
          </p>
        </div>
      )}

      {/* Active Program Full-Screen View */}
      <AnimatePresence>
        {showActiveView && activeEnrollment && activeProgram && (
          <ActiveProgramView
            program={activeProgram}
            enrollment={activeEnrollment}
            onClose={() => setShowActiveView(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
