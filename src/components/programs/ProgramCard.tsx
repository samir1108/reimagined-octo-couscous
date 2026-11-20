import { motion } from "framer-motion";
import { Clock, BookOpen } from "lucide-react";
import type { Program } from "@/data/programs/types";

interface ProgramCardProps {
  program: Program;
  onClick: () => void;
}

export default function ProgramCard({ program, onClick }: ProgramCardProps) {
  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
          {program.title}
        </h3>
        <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed">
          {program.subtitle}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1 text-muted-foreground/60">
            <BookOpen className="w-3 h-3" />
            <span className="text-[10px] font-display">{program.curriculum.length} lessons</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground/60">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-display capitalize">{program.difficulty}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
