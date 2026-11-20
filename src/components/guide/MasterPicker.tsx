import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/design-system";
import { Button } from "@/design-system";
import { GURUS } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick?: (guruId: string) => void;
};

/**
 * Score a master against a user-typed topic by matching keywords against
 * name / path / keyTeaching / quote / bio. Higher = more relevant.
 */
function scoreMaster(g: any, topic: string): number {
  if (!topic.trim()) return 0;
  const q = topic.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  const haystack = [
    g.name,
    g.title,
    g.path,
    g.category,
    g.keyTeaching,
    g.quote,
    g.bio,
    ...(g.associatedTexts || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (haystack.includes(t)) score += 2;
  }
  // direct name match boost
  if (g.name?.toLowerCase().includes(q)) score += 5;
  return score;
}

export default function MasterPicker({ open, onOpenChange, onPick }: Props) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");

  const list = useMemo(() => {
    if (!topic.trim()) return GURUS;
    const scored = GURUS.map((g) => ({ g, s: scoreMaster(g, topic) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.g);
    // fall back to full list if nothing matched
    return scored.length ? scored : GURUS;
  }, [topic]);

  const suggested = useMemo(() => {
    if (!topic.trim()) return [];
    return list.slice(0, 3);
  }, [list, topic]);

  const handlePick = (id: string) => {
    onOpenChange(false);
    if (onPick) onPick(id);
    else navigate(`/app/guide?guruId=${id}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/40"
      >
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Talk to any master
          </SheetTitle>
        </SheetHeader>

        {/* Search / topic card */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Search a master, or type a topic…"
              className="w-full pl-9 pr-9 py-3 rounded-xl glass-card text-sm font-body
                         placeholder:text-muted-foreground border border-border/40
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {topic && (
              <button
                onClick={() => setTopic("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/40"
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {suggested.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-[11px] text-primary/80 font-display tracking-wide flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                AI suggests {suggested.length} master{suggested.length > 1 ? "s" : ""} for "{topic}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <div className="space-y-1.5">
            {list.map((g, i) => {
              const img = MASTER_IMAGES[g.id] || g.image;
              const isSuggested = suggested.includes(g);
              return (
                <motion.button
                  key={g.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.012, 0.2) }}
                  onClick={() => handlePick(g.id)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl
                              hover:bg-muted/40 active:bg-muted/60 transition-colors
                              text-left group ${isSuggested ? "ring-1 ring-primary/30 bg-primary/5" : ""}`}
                >
                  <img
                    src={img}
                    alt={g.name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover object-[center_22%] shrink-0
                               border border-border/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display text-foreground truncate">
                      {g.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {g.path || g.category || g.title}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 rounded-full text-[11px] font-display
                               text-primary opacity-70 group-hover:opacity-100"
                    tabIndex={-1}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Talk
                  </Button>
                </motion.button>
              );
            })}
            {list.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-12">
                No masters found.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
