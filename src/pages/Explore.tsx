import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Compass, BookOpen, Gamepad2, Brain, Heart, Zap, Eye, Target, Flame, Leaf, Gem, Crown, Star, Filter, X, ChevronDown, ChevronUp, RefreshCw, Loader2, Zap as ZapIcon, Repeat, Clock, Sun, Moon, Award, Trophy, ArrowRight, History, Bell } from "lucide-react";
import { UNIFIED_GAMES, getGamesByFaculty, getQuickGames, getGamesForTimeOfDay, getUnifiedGame, type UnifiedGame, type Faculty, FACULTY_LABELS, FACULTY_ICONS, FACULTY_GRADIENTS } from "@/lib/games/unifiedRegistry";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useGameSessions, useRecentGames, useGameStats } from "@/hooks/useGameSessions";
import { useAuthReady } from "@/hooks/useAuthReady";
import { GameCardRich } from "@/components/explore/GameCardRich";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Badge } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system";
import { useIsMobile } from "@/hooks/use-mobile";

const WORLD_ORDER: Faculty[] = [
  "attention", "body", "witness", "ego", "heart", "self_inquiry",
  "willpower", "stillness", "voice", "brain_head", "brain_heart", "brain_gut", "karma", "liminal"
];

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 11) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

function getWeakDimensions(profile: any): string[] {
  if (!profile?.dimension_bands) return [];
  return Object.entries(profile.dimension_bands)
    .sort((a, b) => (a[1] as number) - (b[1] as number))
    .slice(0, 3)
    .map(([dim]) => dim);
}

function getRecommendedFaculties(weakDims: string[]): Faculty[] {
  const dimToFaculty: Record<string, Faculty[]> = {
    thought: ["attention", "self_inquiry", "brain_head"],
    emotion: ["heart", "ego", "brain_heart"],
    body: ["body", "brain_gut", "voice"],
    awareness: ["witness", "stillness", "liminal"],
  };
  const faculties = new Set<Faculty>();
  weakDims.forEach(dim => {
    dimToFaculty[dim]?.forEach(f => faculties.add(f));
  });
  return Array.from(faculties);
}

export default function Explore() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isReady } = useAuthReady();
  const { data: engineData } = useConsciousnessEngine();
  
  const { sessions, activeSession, dailyGame, startSession, getOrCreateDailyGame, isLoading: sessionsLoading } = useGameSessions(user?.id);
  const recentGames = useRecentGames(user?.id, 5);
  const gameStats = useGameStats(user?.id);
  
  const [activeTab, setActiveTab] = useState<"worlds" | "games" | "programs" | "wisdom" | "insights">("worlds");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWorlds, setExpandedWorlds] = useState<Set<Faculty>>(new Set(["attention", "body", "witness"]));
  const [showAllWorlds, setShowAllWorlds] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState(false);

  const userBand = (engineData?.profile as any)?.band || 1;
  const weakDims = getWeakDimensions(engineData?.profile);
  const recommendedFaculties = getRecommendedFaculties(weakDims);
  const timeOfDay = getTimeOfDay();

  const allGames = useMemo(() => UNIFIED_GAMES.filter(g => g.available), []);
  const unlockedGames = useMemo(() => new Set(allGames.filter(g => g.unlockLevel <= userBand).map(g => g.id)), [userBand, allGames]);
  
  const gamesByFaculty = useMemo(() => {
    const grouped: Record<Faculty, UnifiedGame[]> = {} as Record<Faculty, UnifiedGame[]>;
    allGames.forEach(game => {
      game.faculties.forEach(faculty => {
        if (!grouped[faculty]) grouped[faculty] = [];
        grouped[faculty].push(game);
      });
    });
    return grouped;
  }, [allGames]);

  const inProgressGames = useMemo(() => 
    allGames.filter(g => unlockedGames.has(g.id) && sessions.some(s => s.game_id === g.id && (s.phase === "play" || s.phase === "intro") && !s.completed_at)),
    [allGames, unlockedGames, sessions]
  );

  const recommendedGames = useMemo(() => {
    if (!engineData?.profile) return [];
    const unlocked = allGames.filter(g => unlockedGames.has(g.id));
    return unlocked
      .filter(g => g.faculties.some(f => recommendedFaculties.includes(f)))
      .sort((a, b) => {
        const aScore = a.faculties.filter(f => recommendedFaculties.includes(f)).length;
        const bScore = b.faculties.filter(f => recommendedFaculties.includes(f)).length;
        return bScore - aScore;
      })
      .slice(0, 8);
  }, [engineData?.profile, allGames, unlockedGames, recommendedFaculties]);

  const timeAwareGames = useMemo(() => {
    const unlocked = allGames.filter(g => unlockedGames.has(g.id));
    return getGamesForTimeOfDay(timeOfDay)
      .filter(g => unlockedGames.has(g.id))
      .slice(0, 6);
  }, [timeOfDay, allGames, unlockedGames]);

  const quickGames = useMemo(() => 
    getQuickGames(2).filter(g => unlockedGames.has(g.id)).slice(0, 4),
    [unlockedGames]
  );

  const completedGames = useMemo(() => 
    allGames.filter(g => sessions.some(s => s.game_id === g.id && s.outcome === "completed")),
    [allGames, sessions]
  );

  const handleGameClick = useCallback((game: UnifiedGame) => {
    startSession(game.id);
    navigate(`/app/games/${game.id}`);
  }, [startSession, navigate]);

  const handleDailyGameClick = useCallback(async () => {
    if (dailyGame?.completed_at) return;
    const daily = await getOrCreateDailyGame();
    if (daily?.game) {
      handleGameClick(daily.game);
    }
  }, [dailyGame, getOrCreateDailyGame, handleGameClick]);

  const handleRefresh = useCallback(async () => {
    setPullToRefresh(true);
    await new Promise(r => setTimeout(r, 1000));
    setPullToRefresh(false);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Pull to Refresh */}
      {isMobile && pullToRefresh && (
        <div className="fixed top-0 left-0 right-0 h-12 flex items-center justify-center z-50 bg-background/95 backdrop-blur">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
                  Explore
                </h1>
                {gameStats.totalPlayed > 0 && (
                  <Badge variant="secondary" className="gap-1.5 text-xs">
                    <Trophy className="w-3 h-3" />
                    {gameStats.totalPlayed} sessions · {gameStats.totalCompleted} completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {allGames.length} games · {unlockedGames.size} unlocked · {completedGames.length} mastered
              </p>
            </motion.div>
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, faculties..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-card/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border/30 overflow-x-auto">
            {[
              { key: "worlds", label: "Worlds", icon: <Compass className="w-4 h-4" /> },
              { key: "games", label: "All Games", icon: <Gamepad2 className="w-4 h-4" /> },
              { key: "programs", label: "Programs", icon: <BookOpen className="w-4 h-4" /> },
              { key: "wisdom", label: "Wisdom", icon: <Sparkles className="w-4 h-4" /> },
              { key: "insights", label: "Insights", icon: <History className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display tracking-wider uppercase whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "worlds" && (
            <motion.div
              key="worlds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onTouchStart={handleRefresh}
            >
              <WorldsView
                gamesByFaculty={gamesByFaculty}
                unlockedGames={unlockedGames}
                sessions={sessions}
                userBand={userBand}
                weakDims={weakDims}
                recommendedGames={recommendedGames}
                timeAwareGames={timeAwareGames}
                quickGames={quickGames}
                inProgressGames={inProgressGames}
                recentGames={recentGames}
                dailyGame={dailyGame}
                gameStats={gameStats}
                timeOfDay={timeOfDay}
                expandedWorlds={expandedWorlds}
                onToggleWorld={setExpandedWorlds}
                onGameClick={handleGameClick}
                onDailyClick={handleDailyGameClick}
                onNavigate={navigate}
                isLoading={sessionsLoading}
              />
            </motion.div>
          )}
          {activeTab === "games" && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AllGamesView
                games={allGames}
                unlockedGames={unlockedGames}
                searchQuery={searchQuery}
                onGameClick={handleGameClick}
              />
            </motion.div>
          )}
          {activeTab === "programs" && (
            <motion.div
              key="programs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProgramsView navigate={navigate} />
            </motion.div>
          )}
          {activeTab === "wisdom" && (
            <motion.div
              key="wisdom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WisdomView navigate={navigate} />
            </motion.div>
          )}
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InsightsView 
                sessions={sessions} 
                allGames={allGames}
                gameStats={gameStats}
                navigate={navigate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {[
              { key: "worlds", label: "Explore", icon: <Compass className="w-5 h-5" /> },
              { key: "games", label: "Games", icon: <Gamepad2 className="w-5 h-5" /> },
              { key: "programs", label: "Journey", icon: <BookOpen className="w-5 h-5" /> },
              { key: "wisdom", label: "Wisdom", icon: <Sparkles className="w-5 h-5" /> },
              { key: "insights", label: "Insights", icon: <History className="w-5 h-5" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function WorldsView({
  gamesByFaculty,
  unlockedGames,
  sessions,
  userBand,
  weakDims,
  recommendedGames,
  timeAwareGames,
  quickGames,
  inProgressGames,
  recentGames,
  dailyGame,
  gameStats,
  timeOfDay,
  expandedWorlds,
  onToggleWorld,
  onGameClick,
  onDailyClick,
  onNavigate,
  isLoading,
}: any) {
  const [showAllWorlds, setShowAllWorlds] = useState(false);
  const toggleWorld = (faculty: Faculty) => {
    onToggleWorld(prev => {
      const next = new Set(prev);
      if (next.has(faculty)) next.delete(faculty);
      else next.add(faculty);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Daily Game Hero */}
      {dailyGame && !dailyGame.completed_at && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <DailyGameCard game={dailyGame.game} streak={dailyGame.streak} onClick={onDailyClick} />
        </motion.section>
      )}

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={<Sparkles className="w-5 h-5" />} value={recommendedGames.length} label="For your weak dimensions" gradient="from-indigo-500 to-purple-500" />
          <StatCard icon={<Sun className="w-5 h-5" />} value={timeAwareGames.length} label={`${timeOfDay} practice`} gradient={timeOfDay === "morning" ? "from-amber-500 to-orange-500" : timeOfDay === "evening" ? "from-pink-500 to-rose-500" : "from-indigo-500 to-purple-500"} />
          <StatCard icon={<Clock className="w-5 h-5" />} value={quickGames.length} label="Quick (≤2 min)" gradient="from-emerald-500 to-teal-500" />
          <StatCard icon={<ZapIcon className="w-5 h-5" />} value={inProgressGames.length} label="In progress" gradient="from-amber-500 to-orange-500" />
          <StatCard icon={<Repeat className="w-5 h-5" />} value={userBand} label="Current band" gradient="from-violet-500 to-purple-500" />
        </div>
      </motion.div>

      {/* Time-Aware Section */}
      {timeAwareGames.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
              {timeOfDay === "morning" && <Sun className="w-6 h-6 text-amber-500" />}
              {timeOfDay === "afternoon" && <ZapIcon className="w-6 h-6 text-blue-500" />}
              {timeOfDay === "evening" && <Moon className="w-6 h-6 text-pink-500" />}
              {timeOfDay === "night" && <Sparkles className="w-6 h-6 text-purple-500" />}
              {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Practice
            </h2>
            <Badge variant="secondary" className="text-xs">Aligned with your rhythm</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timeAwareGames.map((game, index) => (
              <GameCardRich key={game.id} game={game} index={index} isUnlocked={unlockedGames.has(game.id)} onClick={onGameClick} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Games */}
      {recentGames && recentGames.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
              <History className="w-6 h-6 text-muted-foreground" />
              Recently Played
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("/app/games-insights")}>
              View Insights
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {recentGames.map((session: any, index: number) => {
              const game = session.game;
              if (!game) return null;
              return (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => onGameClick(game)}
                  className="p-4 rounded-2xl border border-border/30 bg-card/50 hover:border-primary/40 hover:bg-card/70 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                      {FACULTY_ICONS[game.faculties[0]]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{game.name}</p>
                      <p className="text-[10px] text-muted-foreground">{game.durationMinutes} min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{new Date(session.completed_at || session.started_at).toLocaleDateString()}</span>
                    <span className="capitalize">{session.outcome}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Quick Games */}
      {quickGames.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
              <Clock className="w-6 h-6 text-emerald-500" />
              Quick Games (≤2 min)
            </h2>
            <Badge variant="outline" className="text-xs">Perfect for micro-breaks</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickGames.map((game, index) => (
              <GameCardRich key={game.id} game={game} index={index} isUnlocked={unlockedGames.has(game.id)} onClick={onGameClick} />
            ))}
          </div>
        </motion.section>
      )}

      {/* In Progress */}
      {inProgressGames.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold text-foreground mb-4">
            <ZapIcon className="w-6 h-6 text-amber-500" />
            Continue Playing
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {inProgressGames.map((game, index) => (
              <GameCardRich key={game.id} game={game} index={index} isUnlocked={true} onClick={onGameClick} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Recommended */}
      {recommendedGames.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
              <Sparkles className="w-6 h-6 text-primary" />
              Recommended for You
            </h2>
            <Badge variant="secondary" className="text-xs">Based on weak dimensions: {weakDims.join(", ")}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedGames.map((game, index) => (
              <GameCardRich key={game.id} game={game} index={index} isUnlocked={unlockedGames.has(game.id)} onClick={onGameClick} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Worlds Grid */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground">Explore Worlds</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAllWorlds(!showAllWorlds)}>
            {showAllWorlds ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {showAllWorlds ? "Show Less" : "Show All"}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {WORLD_ORDER.slice(0, showAllWorlds ? WORLD_ORDER.length : 6).map((faculty) => {
            const games = gamesByFaculty[faculty] || [];
            if (games.length === 0) return null;
            
            return (
              <WorldCard
                key={faculty}
                faculty={faculty}
                games={games}
                unlockedGames={unlockedGames}
                userBand={userBand}
                sessions={sessions}
                isExpanded={expandedWorlds.has(faculty)}
                onToggle={toggleWorld}
                onGameClick={onGameClick}
              />
            );
          })}
        </div>
        
        {!showAllWorlds && WORLD_ORDER.length > 6 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => setShowAllWorlds(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Explore {WORLD_ORDER.length - 6} more worlds
            </Button>
          </div>
        )}
      </motion.section>
    </div>
  );
}

function DailyGameCard({ game, streak, onClick }: { game: any; streak: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 cursor-pointer"
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-4 right-4 flex items-center gap-1 text-white/90 text-sm">
        <Bell className="w-4 h-4" />
        <span>Daily Game</span>
      </div>
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-white/80">Day {streak + 1} streak</span>
            {streak > 0 && <span className="text-amber-300 text-lg">🔥</span>}
          </div>
          <h3 className="text-2xl font-display font-bold text-white">{game.name}</h3>
          <p className="text-white/80 mt-1 max-w-md">{game.oneLine}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {game.durationMinutes} min</span>
            <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {game.faculties[0]}</span>
          </div>
        </div>
        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function WorldCard({
  faculty,
  games,
  unlockedGames,
  userBand,
  sessions,
  isExpanded,
  onToggle,
  onGameClick,
}: any) {
  const availableGames = games.filter(g => g.available);
  const unlocked = availableGames.filter(g => unlockedGames.has(g.id));
  const locked = availableGames.filter(g => !unlockedGames.has(g.id));
  const completedCount = unlocked.filter(g => sessions.some(s => s.game_id === g.id && s.outcome === "completed")).length;
  const totalAvailable = availableGames.length;
  const gradient = FACULTY_GRADIENTS[faculty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br" style={{ background: gradient, opacity: 0.1 }} />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl opacity-20 -translate-x-1/2 translate-y-1/2" style={{ background: gradient }} />
        
        <div className="relative p-5 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: gradient }}>
                <span className="text-2xl">{FACULTY_ICONS[faculty]}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{FACULTY_LABELS[faculty]}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="gap-1 h-5 px-1.5">
                    <Award className="w-3 h-3" /> {completedCount}/{totalAvailable}
                  </Badge>
                  <Badge variant="outline" className="gap-1 h-5 px-1.5">
                    <Trophy className="w-3 h-3" /> {unlocked.length}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(faculty)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          <div className="relative w-20 h-20 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - (283 * completedCount) / Math.max(totalAvailable, 1)}
                className="text-primary"
                style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * completedCount) / Math.max(totalAvailable, 1) }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-foreground">{completedCount}</span>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 mt-4">
                  {unlocked.slice(0, 4).map((game, index) => (
                    <MiniGameCard key={game.id} game={game} onClick={onGameClick} />
                  ))}
                  {locked.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3">
                      {locked.slice(0, 2).map((game, index) => (
                        <MiniLockedCard key={game.id} game={game} userBand={userBand} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => onToggle(faculty)}
          >
            {isExpanded ? "Collapse" : "Explore World"}
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function MiniGameCard({ game, onClick }: { game: any; onClick: (game: any) => void }) {
  return (
    <button
      onClick={() => onClick(game)}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/50 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-lg">{FACULTY_ICONS[game.faculties[0]]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{game.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{game.oneLine}</p>
      </div>
      <span className="text-xs text-muted-foreground">{game.durationMinutes}min</span>
    </button>
  );
}

function MiniLockedCard({ game, userBand }: { game: any; userBand: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/40 opacity-60">
      <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
        <span className="text-lg">{FACULTY_ICONS[game.faculties[0]]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{game.name}</p>
        <p className="text-[11px] text-muted-foreground/60">Unlocks at Band {game.unlockLevel} (you're Band {userBand})</p>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, gradient }: { icon: React.ReactNode; value: number | string; label: string; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br" style={{ background: gradient, opacity: 0.05 }} />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: gradient }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function AllGamesView({ games, unlockedGames, searchQuery, onGameClick }: any) {
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const q = searchQuery.toLowerCase();
    return games.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.oneLine.toLowerCase().includes(q) ||
      g.faculties.some(f => f.includes(q))
    );
  }, [games, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground">
          All Games ({filteredGames.length})
        </h2>
        <Badge variant="secondary" className="gap-1">
          <Trophy className="w-3 h-3" />
          {unlockedGames.size} unlocked
        </Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGames.map((game, index) => (
          <GameCardRich
            key={game.id}
            game={game}
            index={index}
            isUnlocked={unlockedGames.has(game.id)}
            onClick={onGameClick}
          />
        ))}
      </div>
    </div>
  );
}

function ProgramsView({ navigate }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-foreground">Programs</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Foundation Course", desc: "118-day consciousness curriculum", icon: <BookOpen className="w-5 h-5" />, path: "/app/foundation" },
          { name: "First Eleven", desc: "The gateway mirrors", icon: <Sparkles className="w-5 h-5" />, path: "/app/first-eleven" },
          { name: "Awakening Journey", desc: "60-session deep dive", icon: <ZapIcon className="w-5 h-5" />, path: "/app/awakening" },
          { name: "Programs V3", desc: "Structured transformation arcs", icon: <Repeat className="w-5 h-5" />, path: "/app/programs-v3" },
        ].map((p) => (
          <motion.button
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => navigate(p.path)}
            className="p-5 rounded-2xl border border-border/30 bg-card/50 hover:border-primary/40 hover:bg-card/70 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
              {p.icon}
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function WisdomView({ navigate }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-foreground">Wisdom & Teachings</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Knowledge Base", desc: "Curated wisdom from traditions", icon: <BookOpen className="w-5 h-5" />, path: "/app/knowledge" },
          { name: "Loops Library", desc: "Psychological patterns mapped", icon: <Repeat className="w-5 h-5" />, path: "/app/loops" },
          { name: "Mirrors", desc: "Self-assessment checkpoints", icon: <Sparkles className="w-5 h-5" />, path: "/app/mirror" },
          { name: "Dharma Oracle", desc: "AI-guided wisdom", icon: <ZapIcon className="w-5 h-5" />, path: "/app/dharma-oracle" },
        ].map((w) => (
          <motion.button
            key={w.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => navigate(w.path)}
            className="p-5 rounded-2xl border border-border/30 bg-card/50 hover:border-primary/40 hover:bg-card/70 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
              {w.icon}
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">{w.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{w.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function InsightsView({ sessions, allGames, gameStats, navigate }: any) {
  const completed = sessions.filter(s => s.outcome === "completed");
  
  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; lastAt: string; totalMs: number; sample: Record<string, unknown> }>();
    completed.forEach((r) => {
      const cur = map.get(r.game_id) ?? { count: 0, lastAt: r.created_at, totalMs: 0, sample: r.signals ?? {} };
      cur.count += 1;
      if (r.created_at > cur.lastAt) cur.lastAt = r.created_at;
      const dur = (r.signals as any)?.duration_ms || r.duration_ms;
      if (typeof dur === "number") cur.totalMs += dur;
      map.set(r.game_id, cur);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, game: allGames.find((g: any) => g.id === id) }))
      .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  }, [completed, allGames]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground">Game Insights</h2>
        <Badge variant="secondary" className="gap-1">
          <History className="w-3 h-3" />
          {gameStats.totalPlayed} sessions
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Trophy className="w-5 h-5" />} value={gameStats.totalPlayed} label="Total Sessions" gradient="from-amber-500 to-orange-500" />
        <StatCard icon={<Clock className="w-5 h-5" />} value={gameStats.totalCompleted} label="Minutes Played" gradient="from-emerald-500 to-teal-500" />
        <StatCard icon={<Gamepad2 className="w-5 h-5" />} value={gameStats.uniqueGames} label="Games Mastered" gradient="from-blue-500 to-indigo-500" />
        <StatCard icon={<Brain className="w-5 h-5" />} value={gameStats.favoriteFaculty || "—"} label="Strongest Faculty" gradient="from-purple-500 to-violet-500" />
      </div>

      {grouped.length === 0 ? (
        <div className="border border-border/30 rounded-2xl p-8 text-center">
          <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg text-foreground mb-2">No game insights yet</p>
          <p className="text-sm text-muted-foreground mb-4">Play a game to see your signals reflected here</p>
          <Button onClick={() => navigate("/app/explore?tab=games")} className="w-full max-w-xs">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Explore Games
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/app/games/${g.id}`)}
              className="border border-border/30 rounded-xl p-4 hover:bg-muted/50 transition cursor-pointer"
            >
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-base text-foreground">{g.game?.name ?? g.id}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {new Date(g.lastAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{g.game?.signal ?? "—"}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>{g.count}× played</span>
                {g.totalMs > 0 && <span>{Math.round(g.totalMs / 1000)}s total</span>}
                {Object.entries(g.sample).slice(0, 3).map(([k, v]) => (
                  <span key={k} className="text-muted-foreground/60">
                    {k}: {String(v).slice(0, 14)}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}