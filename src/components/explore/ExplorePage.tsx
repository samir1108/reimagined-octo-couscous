import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Layers, Flame, Gamepad2, BookOpen, ChevronRight, Compass, Play, Star } from "lucide-react";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";
import { Input } from "@/design-system";
import { getLibraryItems, searchLibraryItems, getDiscoverySections } from "@/lib/content-library";
import { LIBRARY_CATEGORIES } from "@/types/contentLibrary";
import type { LibraryItem } from "@/types/contentLibrary";

const WORLD_ICONS: Record<string, string> = {
  yogic_practices: "🧘", micro_practices: "⚡", wisdom_teachings: "📜",
  guided_programs: "🗺️", games_interactive: "🎮", podcasts_audio: "🎧",
  meditations: "🕯️", journaling: "📓", self_inquiry: "🔍", challenges_quests: "⚔️",
  rituals_ceremonies: "🕯️", breathwork: "🌬️", somatic: "🫁", courses_learning: "📚",
  stories_parables: "📖", daily_missions: "🎯", tools_widgets: "🔧", assessments: "📊",
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeWorld, setActiveWorld] = useState<string | null>(null);

  const items = getLibraryItems().filter((i) => i.review_status === 'published');
  const sections = getDiscoverySections();
  const worlds = LIBRARY_CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: WORLD_ICONS[c.slug] || "✨",
    count: items.filter((i) => i.category === c.slug).length,
  }));

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchLibraryItems(query, 20);
  }, [query]);

  const filteredItems = useMemo(() => {
    if (activeWorld) return items.filter((i) => i.category === activeWorld);
    return items;
  }, [activeWorld, items]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-bold">Explore</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Discover something within yourself</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="pl-9 rounded-2xl bg-muted/40 border-border/50"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Search Results */}
        {query.trim() && searchResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Search Results ({searchResults.length})
            </h2>
            <div className="space-y-2">
              {searchResults.map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => navigate(`/app/library/item/${item.id}`)} />
              ))}
            </div>
          </section>
        )}

        {query.trim() && searchResults.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No results found. Try different keywords.
          </Card>
        )}

        {/* Discovery Sections (only when not searching) */}
        {!query.trim() && (
          <>
            {/* Continue Your Journey */}
            {sections[0] && sections[0].items.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Continue Your Journey
                </h2>
                <div className="space-y-2">
                  {sections[0].items.map((item) => (
                    <ItemCard key={item.id} item={item} onClick={() => navigate(`/app/library/item/${item.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* Explore Worlds */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Explore Worlds
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {worlds.map((w) => (
                  <motion.button
                    key={w.slug}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveWorld(activeWorld === w.slug ? null : w.slug)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeWorld === w.slug
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-muted/20 hover:border-primary/40"
                    }`}
                  >
                    <div className="text-2xl mb-1">{w.icon}</div>
                    <div className="text-xs font-medium truncate">{w.name}</div>
                    <div className="text-[10px] text-muted-foreground">{w.count} items</div>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* World-filtered items */}
            {activeWorld && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">
                    {LIBRARY_CATEGORIES.find((c) => c.slug === activeWorld)?.name}
                  </h2>
                  <button onClick={() => setActiveWorld(null)} className="text-xs text-primary">
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredItems.slice(0, 20).map((item) => (
                    <ItemCard key={item.id} item={item} onClick={() => navigate(`/app/library/item/${item.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* For Your Current State */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> For Your Current State
              </h2>
              <p className="text-xs text-muted-foreground mb-2">Recommended experiences</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.slice(0, 4).map((item) => (
                  <ItemCard key={item.id} item={item} compact onClick={() => navigate(`/app/library/item/${item.id}`)} />
                ))}
              </div>
            </section>

            {/* Discover Sections */}
            {sections.slice(1).map((section) => (
              section.items.length > 0 && (
                <section key={section.id}>
                  <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <ItemCard key={item.id} item={item} onClick={() => navigate(`/app/library/item/${item.id}`)} />
                    ))}
                  </div>
                </section>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item, compact, onClick }: { item: LibraryItem; compact?: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full text-left"
    >
      <Card className={`p-3 hover:border-primary/50 transition-colors ${compact ? 'p-2' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
            {WORLD_ICONS[item.category] || "✨"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{item.title}</div>
            {!compact && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</div>}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {item.duration_minutes && (
                <span className="text-[10px] text-muted-foreground">{item.duration_minutes}m</span>
              )}
              <Badge variant="outline" className="text-[9px] py-0 capitalize">{item.difficulty}</Badge>
              {item.average_rating && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {item.average_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
        </div>
      </Card>
    </motion.button>
  );
}
