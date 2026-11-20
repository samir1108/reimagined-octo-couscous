"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, X, ChevronLeft, ChevronRight, 
  Star, Heart, Clock, Users, Award,
  Sparkles, Zap, Flame, Leaf, Brain,
  Music, Dumbbell, BookOpen, Moon, Sun,
  Wind, Grid, List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_SESSIONS, SESSION_CATEGORIES, type DemoSession } from "@/data/demoSessions";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Pranayama": <Wind className="h-4 w-4" />,
  "Meditation": <Brain className="h-4 w-4" />,
  "Self-Inquiry": <Search className="h-4 w-4" />,
  "Yoga Asana": <Dumbbell className="h-4 w-4" />,
  "Programs": <BookOpen className="h-4 w-4" />,
  "Specialty": <Sparkles className="h-4 w-4" />,
  "Featured": <Award className="h-4 w-4" />,
  "All": <Grid className="h-4 w-4" />,
};

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

interface DemoSessionShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (session: DemoSession) => void;
}

export function DemoSessionShowcase({ isOpen, onClose, onStartSession }: DemoSessionShowcaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const ITEMS_PER_PAGE = viewMode === "grid" ? 12 : 10;

  const filteredSessions = useMemo(() => {
    return DEMO_SESSIONS.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || session.category === selectedCategory;
      
      const matchesDifficulty = selectedDifficulty === "all" || session.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleStartSession = useCallback((session: DemoSession) => {
    onStartSession(session);
    onClose();
  }, [onStartSession, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-showcase-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-7xl mx-auto p-4 md:p-6 min-h-[calc(100vh-2rem)]"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h1 id="demo-showcase-title" className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-gold-400 via-white to-amber-400 bg-clip-text text-transparent">
                Demo Sessions
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredSessions.length} curated sessions · Hold the orb to begin any practice
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                aria-label="Close demo showcase"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                placeholder="Search sessions... (title, description, tags)"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {SESSION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(0); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    "flex items-center gap-2",
                    selectedCategory === cat
                      ? "bg-gold-400/20 text-gold-400 border border-gold-400/50"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
                  )}
                >
                  {CATEGORY_ICONS[cat]}
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              {(["all", "beginner", "intermediate", "advanced"] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => { setSelectedDifficulty(diff); setCurrentPage(0); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    selectedDifficulty === diff
                      ? "bg-gold-400/20 text-gold-400 border border-gold-400/50"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
                  )}
                >
                  {diff === "all" ? "All Levels" : DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-gold-400/20 text-gold-400" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Grid view"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-gold-400/20 text-gold-400" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {paginatedSessions.length} of {filteredSessions.length} sessions</span>
            <div className="flex items-center gap-2">
              <select
                value={ITEMS_PER_PAGE.toString()}
                onChange={e => { /* Could add page size selector */ }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-foreground"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
          </div>

          {/* Sessions Grid/List */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={viewMode}
              layout
              className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                  : "space-y-3"
              )}
            >
              {paginatedSessions.map((session, index) => (
                <DemoSessionCard
                  key={session.id}
                  session={session}
                  index={index}
                  isFavorite={favorites.has(session.id)}
                  onFavoriteToggle={toggleFavorite}
                  onStart={handleStartSession}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium mb-2">No sessions found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/10"
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 1) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-xl text-sm font-medium transition-all",
                        currentPage === pageNum
                          ? "bg-gold-400 text-black"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {/* Footer Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          >
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-gold-400">{DEMO_SESSIONS.length}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-emerald-400">
                {DEMO_SESSIONS.filter(s => s.difficulty === "beginner").length}
              </div>
              <div className="text-xs text-muted-foreground">Beginner Friendly</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-amber-400">
                {DEMO_SESSIONS.filter(s => s.featured).length}
              </div>
              <div className="text-xs text-muted-foreground">Featured</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-rose-400">
                {DEMO_SESSIONS.filter(s => s.category === "Programs").length}
              </div>
              <div className="text-xs text-muted-foreground">Multi-Day Programs</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Session Card Component
interface DemoSessionCardProps {
  session: DemoSession;
  index: number;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
  onStart: (session: DemoSession) => void;
  viewMode: "grid" | "list";
}

function DemoSessionCard({ session, index, isFavorite, onFavoriteToggle, onStart, viewMode }: DemoSessionCardProps) {
  const delay = Math.min(index * 0.05, 0.3);

  const cardContent = (
    <>
      {/* Featured Badge */}
      {session.featured && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-3 right-3 z-10"
        >
          <div className="flex items-center gap-1 px-2 py-1 bg-gold-400/20 text-gold-400 text-xs font-medium rounded-full border border-gold-400/30">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        </motion.div>
      )}

      {/* Icon & Category */}
      <div className={cn(
        "relative aspect-square rounded-2xl overflow-hidden mb-4",
        viewMode === "list" ? "w-24 h-24 flex-shrink-0" : ""
      )}>
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${session.color})` }}
        />
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          session.gradient
        )}>
          <span className="text-4xl md:text-5xl lg:text-6xl filter drop-shadow-lg" aria-hidden="true">
            {session.icon}
          </span>
        </div>
        
        {/* Difficulty Badge */}
        <div className={cn(
          "absolute bottom-2 left-2 px-2 py-1 text-xs font-medium rounded-full",
          DIFFICULTY_COLORS[session.difficulty]
        )}>
          {DIFFICULTY_LABELS[session.difficulty]}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", viewMode === "list" ? "flex flex-col justify-center" : "")}>
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground">
            {session.category}
          </span>
          {session.instructor && (
            <span className="text-xs text-muted-foreground/70">
              · {session.instructor}
            </span>
          )}
        </div>

        <h3 className={cn(
          "font-display font-semibold text-foreground mb-2",
          viewMode === "grid" ? "text-lg" : "text-base"
        )}>
          {session.title}
        </h3>
        
        <p className={cn(
          "text-sm text-muted-foreground mb-3 line-clamp-2",
          viewMode === "grid" ? "text-muted-foreground/80" : ""
        )}>
          {session.subtitle}
        </p>

        <p className={cn(
          "text-sm text-foreground/70 mb-4 line-clamp-3",
          viewMode === "list" ? "line-clamp-2" : ""
        )}>
          {session.description}
        </p>

        {/* Meta Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {session.tags.slice(0, viewMode === "grid" ? 3 : 4).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground/80">
              {tag}
            </span>
          ))}
          {session.tags.length > (viewMode === "grid" ? 3 : 4) && (
            <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground/50">
              +{session.tags.length - (viewMode === "grid" ? 3 : 4)}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.duration}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {session.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {session.participants}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFavoriteToggle(session.id)}
            className={cn(
              "p-2 rounded-xl transition-all flex-1 flex items-center justify-center gap-1.5",
              isFavorite 
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
            <span className="text-xs font-medium hidden sm:inline">{isFavorite ? "Saved" : "Save"}</span>
          </button>
          
          <button
            onClick={() => onStart(session)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gold-400 to-amber-500 text-black font-semibold rounded-xl hover:from-gold-300 hover:to-amber-400 transition-all shadow-lg shadow-gold-400/25"
          >
            Begin
          </button>
        </div>
      </div>
    </>
  );

  if (viewMode === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay, type: "spring", damping: 25, stiffness: 300 }}
        className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-gold-400/30 hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] transition-all duration-300"
      >
        <div className="p-5 h-full flex flex-col">
          {cardContent}
        </div>
        
        {/* Hover Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-gold-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay, type: "spring", damping: 25, stiffness: 300 }}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-gold-400/30 hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] transition-all duration-300 flex items-center gap-5 p-4"
    >
      <div className="flex items-center gap-5 w-full">
        <div className="flex-shrink-0 w-24 h-24 relative">
          <div 
            className="absolute inset-0 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${session.color})` }}
          />
          <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: session.gradient }}>
            <span className="text-3xl" aria-hidden="true">{session.icon}</span>
          </div>
          <div className={cn("absolute bottom-0 left-0 px-2 py-0.5 text-[10px] font-medium rounded-tr-xl", DIFFICULTY_COLORS[session.difficulty])}>
            {DIFFICULTY_LABELS[session.difficulty]}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            {session.featured && (
              <span className="px-2 py-0.5 bg-gold-400/20 text-gold-400 text-[10px] font-medium rounded-full flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-current" />
                Featured
              </span>
            )}
            <span className="text-xs font-medium px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground">
              {session.category}
            </span>
            {session.instructor && (
              <span className="text-xs text-muted-foreground/70">· {session.instructor}</span>
            )}
          </div>
          
          <h3 className="font-display font-semibold text-foreground text-base mb-1">{session.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{session.subtitle}</p>
          <p className="text-sm text-foreground/70 line-clamp-2 mb-3">{session.description}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {session.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground/80">{tag}</span>
            ))}
            {session.tags.length > 4 && <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground/50">+{session.tags.length - 4}</span>}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.duration}</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current" />{session.rating}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.participants}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFavoriteToggle(session.id)}
              className={cn("p-2 rounded-xl transition-all flex items-center gap-1.5", isFavorite ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10")}
            >
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
              <span className="text-xs font-medium">{isFavorite ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={() => onStart(session)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-gold-400 to-amber-500 text-black font-semibold rounded-xl hover:from-gold-300 hover:to-amber-400 transition-all shadow-lg shadow-gold-400/25"
            >
              Begin Session
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DemoSessionShowcase;