import { useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Zap, Lock, Check, Star, Brain, Heart, Eye, Target, Flame, Leaf, Crown, Sparkles, Award } from "lucide-react";
import { type UnifiedGame, FACULTY_LABELS, FACULTY_ICONS, FACULTY_GRADIENTS } from "@/lib/games/unifiedRegistry";
import { cn } from "@/lib/utils";

interface GameCardRichProps {
  game: UnifiedGame;
  isUnlocked: boolean;
  isInProgress?: boolean;
  isCompleted?: boolean;
  onClick: () => void;
  showFaculty?: boolean;
  variant?: "default" | "compact" | "featured";
  index?: number;
}

const facultyIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  attention: Brain,
  body: Heart,
  witness: Eye,
  ego: Target,
  heart: Flame,
  self_inquiry: Leaf,
  willpower: Crown,
  stillness: Sparkles,
  voice: Award,
  brain_head: Brain,
  brain_heart: Heart,
  brain_gut: Leaf,
  karma: Award,
  liminal: Sparkles,
};

export function GameCardRich({
  game,
  isUnlocked,
  isInProgress = false,
  isCompleted = false,
  onClick,
  showFaculty = true,
  variant = "default",
}: GameCardRichProps) {
  const primaryFaculty = game.faculties[0];
  const Icon = primaryFaculty ? facultyIconMap[primaryFaculty] : Sparkles;
  const facultyLabel = primaryFaculty ? FACULTY_LABELS[primaryFaculty] : "General";
  const gradient = primaryFaculty ? FACULTY_GRADIENTS[primaryFaculty] : "from-primary to-primary/70";

  const cardClasses = useMemo(() => cn(
    "relative group overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer",
    "bg-gradient-to-br from-white/5 to-white/10 border border-white/10",
    "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
    "active:scale-[0.98]",
    variant === "compact" && "p-3",
    variant === "default" && "p-4",
    variant === "featured" && "p-6",
    !isUnlocked && "opacity-50 pointer-events-none",
  ), [variant, isUnlocked, primaryFaculty]);

  const badgeClasses = useMemo(() => cn(
    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
    "bg-gradient-to-r " + gradient + " text-white/90",
  ), [gradient]);

  if (variant === "compact") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={!isUnlocked}
        className={cardClasses}
        style={{ minWidth: 160 }}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br " + gradient + "/30",
          )}>
            <Icon className="w-5 h-5" style={{ color: `hsl(var(--primary))` }} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-white truncate">{game.title}</p>
            <p className="text-xs text-white/50 truncate">{game.description}</p>
          </div>
          {isInProgress && <Play className="w-5 h-5 text-primary animate-pulse" />}
          {isCompleted && <Check className="w-5 h-5 text-green-400" />}
          {!isUnlocked && <Lock className="w-5 h-5 text-white/30" />}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      disabled={!isUnlocked}
      className={cardClasses}
      style={{ minHeight: variant === "featured" ? 200 : 160 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br" style={{ opacity: isUnlocked ? 0 : 1 }} />
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Lock className="w-12 h-12 text-white/30" />
        </div>
      )}

      <div className={cn("relative z-10 flex flex-col h-full", variant === "featured" && "justify-between")}>
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br " + gradient + "/30",
          )}>
            <Icon className="w-6 h-6" style={{ color: `hsl(var(--primary))` }} />
          </div>
          <div className="flex items-center gap-1.5">
            {isCompleted && <Check className="w-5 h-5 text-green-400" />}
            {isInProgress && <Play className="w-5 h-5 text-primary animate-pulse" />}
            {!isUnlocked && <Lock className="w-5 h-5 text-white/30" />}
          </div>
        </div>

        <div className="flex-1 mt-4">
          <h3 className="font-bold text-white mb-1 truncate">{game.title}</h3>
          <p className="text-sm text-white/60 line-clamp-2 mb-3">{game.description}</p>
          
          {showFaculty && primaryFaculty && (
            <span className={badgeClasses}>
              <span className="text-[0.7em] mr-1">{FACULTY_ICONS[primaryFaculty]}</span>
              {facultyLabel}
            </span>
          )}
        </div>

        {variant === "featured" && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
            {game.faculties.slice(0, 4).map((faculty) => (
              <span
                key={faculty}
                className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/70"
              >
                {FACULTY_LABELS[faculty]}
              </span>
            ))}
            {game.faculties.length > 4 && (
              <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/50">
                +{game.faculties.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {game.durationMin}min
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {game.difficulty}/5
          </span>
          {game.unlockLevel > 1 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Lvl {game.unlockLevel}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}