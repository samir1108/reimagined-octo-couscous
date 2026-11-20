import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Users, TrendingUp, Clock, Star, Lock, Brain, Heart, Zap, Eye, Target, Flame, Leaf, Gem, Crown } from "lucide-react";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";
import type { LabGame, Faculty } from "@/games/shell/labRegistry";

const WORLD_CONFIG: Record<string, {
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  faculty: Faculty;
  games: LabGame[];
}> = {
  attention: {
    name: "Attention",
    description: "Train the spotlight of awareness. From scattered to laser-focused.",
    icon: <Target className="w-8 h-8" />,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "rgba(249, 115, 22, 0.4)",
    faculty: "attention",
    games: [],
  },
  body: {
    name: "Body & Nervous System",
    description: "Regulate your physiology. Breath, temperature, interoception.",
    icon: <Brain className="w-8 h-8" />,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
    faculty: "body",
    games: [],
  },
  witness: {
    name: "Witness Consciousness",
    description: "Rest as the observer. Thoughts, emotions, sensations — all witnessed.",
    icon: <Eye className="w-8 h-8" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
    faculty: "witness",
    games: [],
  },
  ego: {
    name: "Ego & Reactivity",
    description: "See the patterns that run you. Spiritual materialism, identity, defense.",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-rose-500 via-pink-500 to-red-500",
    glowColor: "rgba(244, 63, 94, 0.4)",
    faculty: "ego",
    games: [],
  },
  heart: {
    name: "Heart & Empathy",
    description: "Metabolize emotion. Compassion, resonance, the other side.",
    icon: <Heart className="w-8 h-8" />,
    gradient: "from-red-500 via-pink-500 to-rose-500",
    glowColor: "rgba(239, 68, 68, 0.4)",
    faculty: "heart",
    games: [],
  },
  self_inquiry: {
    name: "Self-Inquiry",
    description: "Who am I? Neti neti. The question that dissolves the questioner.",
    icon: <Sparkles className="w-8 h-8" />,
    gradient: "from-indigo-500 via-violet-500 to-purple-500",
    glowColor: "rgba(99, 102, 241, 0.4)",
    faculty: "self_inquiry",
    games: [],
  },
  willpower: {
    name: "Willpower & Impulse",
    description: "The pause between stimulus and response. Voluntary friction.",
    icon: <Flame className="w-8 h-8" />,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    glowColor: "rgba(249, 115, 22, 0.4)",
    faculty: "willpower",
    games: [],
  },
  stillness: {
    name: "Stillness & Silence",
    description: "Do nothing. The mountain reveals. Silence sprints and empty rooms.",
    icon: <Leaf className="w-8 h-8" />,
    gradient: "from-slate-500 via-gray-500 to-zinc-500",
    glowColor: "rgba(100, 116, 139, 0.4)",
    faculty: "stillness",
    games: [],
  },
  voice: {
    name: "Voice & Prosody",
    description: "The name, the mantra, the tone. Japa, dhikr, speech fasts.",
    icon: <Gem className="w-8 h-8" />,
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.4)",
    faculty: "voice",
    games: [],
  },
  brain_head: {
    name: "Head Brain",
    description: "Analysis, logic, planning. The executive center.",
    icon: <Crown className="w-8 h-8" />,
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    glowColor: "rgba(59, 130, 246, 0.4)",
    faculty: "brain_head",
    games: [],
  },
  brain_heart: {
    name: "Heart Brain",
    description: "Coherence, intuition, felt sense. The little brain in the heart.",
    icon: <Heart className="w-8 h-8" />,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    glowColor: "rgba(236, 72, 153, 0.4)",
    faculty: "brain_heart",
    games: [],
  },
  brain_gut: {
    name: "Gut Brain",
    description: "Intuition, interoception, the enteric nervous system.",
    icon: <Sparkles className="w-8 h-8" />,
    gradient: "from-amber-500 via-yellow-500 to-lime-500",
    glowColor: "rgba(234, 179, 8, 0.4)",
    faculty: "brain_gut",
    games: [],
  },
  karma: {
    name: "Karma & Action",
    description: "Action without attachment. Vows, ledger, dakshina, svadharma.",
    icon: <Star className="w-8 h-8" />,
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    glowColor: "rgba(234, 179, 8, 0.4)",
    faculty: "karma",
    games: [],
  },
  liminal: {
    name: "Sleep, Death & Liminal",
    description: "Bardo, dream yoga, maranasati. The thresholds between states.",
    icon: <Leaf className="w-8 h-8" />,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
    faculty: "liminal",
    games: [],
  },
};

const FACULTY_ICONS: Record<Faculty, React.ReactNode> = {
  attention: <Target className="w-3.5 h-3.5" />,
  body: <Brain className="w-3.5 h-3.5" />,
  witness: <Eye className="w-3.5 h-3.5" />,
  ego: <Zap className="w-3.5 h-3.5" />,
  heart: <Heart className="w-3.5 h-3.5" />,
  self_inquiry: <Sparkles className="w-3.5 h-3.5" />,
  willpower: <Flame className="w-3.5 h-3.5" />,
  stillness: <Leaf className="w-3.5 h-3.5" />,
  voice: <Gem className="w-3.5 h-3.5" />,
  brain_head: <Crown className="w-3.5 h-3.5" />,
  brain_heart: <Heart className="w-3.5 h-3.5" />,
  brain_gut: <Star className="w-3.5 h-3.5" />,
  karma: <Star className="w-3.5 h-3.5" />,
  liminal: <Leaf className="w-3.5 h-3.5" />,
};

interface CategoryWorldProps {
  world: typeof WORLD_CONFIG[string];
  onGameClick: (game: LabGame) => void;
  unlockedGames: Set<string>;
  userProgress: Record<string, { completed: boolean; timesPlayed?: number; bestScore?: number }>;
}

export function CategoryWorld({ world, onGameClick, unlockedGames, userProgress }: CategoryWorldProps) {
  const availableGames = world.games.filter(g => g.available);
  const unlocked = availableGames.filter(g => unlockedGames.has(g.id));
  const locked = availableGames.filter(g => !unlockedGames.has(g.id));
  const completedCount = unlocked.filter(g => userProgress[g.id]?.completed).length;
  const totalAvailable = availableGames.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* World Header */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r" style={{ background: world.gradient }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        <div 
          className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"
          style={{ background: world.glowColor }}
        />
        
        <div className="relative p-6 sm:p-8 rounded-3xl border border-border/30 overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: world.gradient }}>
              {world.icon}
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{world.name}</h2>
              <p className="text-muted-foreground mt-1 max-w-md">{world.description}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {completedCount}/{totalAvailable} mastered
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {unlocked.length} unlocked
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              {locked.length} locked
            </Badge>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableGames.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            index={index}
            isUnlocked={unlockedGames.has(game.id)}
            progress={userProgress[game.id]}
            onClick={onGameClick}
          />
        ))}
        {locked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {locked.slice(0, 8).map((game, index) => (
                <LockedGameCard key={game.id} game={game} index={index} />
              ))}
            </div>
            {locked.length > 8 && (
              <div className="col-span-full text-center py-4">
                <p className="text-sm text-muted-foreground">
                  +{locked.length - 8} more locked games. Advance your band to unlock.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

function GameCard({ game, index, isUnlocked, progress, onClick }: {
  game: LabGame;
  index: number;
  isUnlocked: boolean;
  progress?: { completed: boolean; timesPlayed?: number; bestScore?: number };
  onClick: (game: LabGame) => void;
}) {
  const coverImage = coverFor(game.id);
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => isUnlocked && onClick(game)}
      className={`group relative cursor-${isUnlocked ? 'pointer' : 'default'}`}
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted/30 border border-border/30 hover:border-primary/30 transition-all duration-500">
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-60"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Tier Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider text-white shadow-lg bg-gradient-to-r from-amber-500 to-orange-500">
            {game.tier === 'S' ? 'MASTERPIECE' : game.tier === 'A' ? 'EXCELLENT' : game.tier === 'B' ? 'GREAT' : 'GOOD'}
          </span>
        </div>

        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="w-10 h-10 mx-auto mb-3 text-white/70" />
              <p className="text-white font-display font-medium">Band {game.unlockLevel}</p>
            </div>
          </div>
        )}

        {isUnlocked && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => { e.stopPropagation(); onClick(game); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-2xl text-foreground font-medium text-sm">
              <span>Play</span>
            </div>
          </motion.button>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{game.oneLine}</p>
        
        <div className="flex flex-wrap gap-1.5">
          {game.faculties.slice(0, 3).map((faculty) => (
            <Badge key={faculty} variant="outline" className="gap-1.5 px-2 py-1 text-[10px] h-6 border-border/40">
              {FACULTY_ICONS[faculty]}
              <span className="capitalize hidden sm:inline">{faculty.replace("_", " ")}</span>
            </Badge>
          ))}
          {game.faculties.length > 3 && (
            <Badge variant="outline" className="px-2 py-1 text-[10px] h-6 border-border/40 text-muted-foreground">
              +{game.faculties.length - 3}
            </Badge>
          )}
        </div>

        {progress?.completed && isUnlocked && (
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm">
            <Star className="w-4 h-4 fill-emerald-500" />
            <span>Mastered</span>
            {progress.timesPlayed && <span className="text-muted-foreground">({progress.timesPlayed}x)</span>}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function LockedGameCard({ game, index }: { game: LabGame; index: number }) {
  const coverImage = coverFor(game.id);
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="relative aspect-video rounded-2xl overflow-hidden bg-muted/30 border border-border/30 opacity-60"
    >
      {coverImage && (
        <img
          src={coverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider text-white/50 shadow-lg bg-gradient-to-r from-gray-500 to-gray-600">
          LOCKED
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-6 text-white/60">
          <Lock className="w-10 h-10 mx-auto mb-3" />
          <p className="font-display font-medium">Band {game.unlockLevel}</p>
          <p className="text-sm mt-1">{game.name}</p>
        </div>
      </div>
    </motion.article>
  );
}