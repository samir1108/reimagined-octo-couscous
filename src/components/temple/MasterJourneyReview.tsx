import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Flame, Sprout, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Guru } from "@/lib/guru-data";
import { useQuery } from "@tanstack/react-query";
import { triggerInsufficientCredits } from "@/lib/handleCreditError";

interface JourneyReview {
  wisdom: string;
  practice: string;
  growth: string;
}

interface MasterJourneyReviewProps {
  guru: Guru;
}

async function fetchJourneyReview(guru: Guru): Promise<JourneyReview> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await supabase.functions.invoke("master-journey-review", {
    body: {
      master_id: guru.id,
      master_name: guru.name,
      master_path: guru.path,
      master_tradition: guru.title,
    },
  });

  if (res.error) throw new Error(res.error.message || "Failed to get review");
  if (res.data?.error === "insufficient_credits") throw new Error("insufficient_credits");
  if (!res.data?.review) throw new Error("No review data");
  return res.data.review;
}

const SECTIONS = [
  { key: "wisdom" as const, label: "WISDOM", sublabel: "प्रज्ञा", icon: Eye, gradient: "from-violet-500/20 to-indigo-500/20", border: "border-violet-500/20" },
  { key: "practice" as const, label: "PRACTICE", sublabel: "साधना", icon: Flame, gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/20" },
  { key: "growth" as const, label: "GROWTH", sublabel: "विकास", icon: Sprout, gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
];

export default function MasterJourneyReview({ guru }: MasterJourneyReviewProps) {
  const [hasRequested, setHasRequested] = useState(false);

  const { data: review, isLoading, error, refetch } = useQuery({
    queryKey: ["master-journey-review", guru.id],
    queryFn: () => fetchJourneyReview(guru),
    enabled: hasRequested,
    staleTime: 24 * 60 * 60 * 1000, // 24h cache
    retry: false,
  });

  if (!hasRequested) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-10 px-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Eye className="w-7 h-7 text-primary/70" />
        </div>
        <h3 className="text-foreground text-sm font-display font-medium mb-2">
          {guru.name}'s Eye on Your Path
        </h3>
        <p className="text-muted-foreground text-xs font-display leading-relaxed mb-6 max-w-[260px]">
          {guru.name} will review your journey — sessions, patterns, growth — and share personalized wisdom from the {guru.path || "Yoga"} tradition.
        </p>
        <button
          onClick={() => setHasRequested(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/15 border border-primary/25 text-primary text-sm font-display tracking-wider hover:bg-primary/25 transition-all"
        >
          <Eye className="w-4 h-4" />
          Reveal My Path
        </button>
        <p className="text-muted-foreground/50 text-[10px] font-display mt-3">
          Uses credits · Cached for 24 hours
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-muted-foreground text-xs font-display tracking-wider animate-pulse">
          {guru.name} is reviewing your journey...
        </p>
      </motion.div>
    );
  }

  if (error) {
    const isCredits = error.message === "insufficient_credits";
    if (isCredits) {
      // Fire toast + redirect to /app/credits, then render a soft placeholder.
      triggerInsufficientCredits();
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-10 px-4 text-center"
      >
        <p className="text-muted-foreground text-xs font-display mb-4">
          {isCredits ? "Not enough credits for this review." : "Something went wrong. Please try again."}
        </p>
        {!isCredits && (
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/30 border border-border/30 text-muted-foreground text-xs font-display hover:bg-muted/50 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </motion.div>
    );
  }

  if (!review) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <AnimatePresence>
        {SECTIONS.map((section, i) => {
          const content = review[section.key];
          if (!content) return null;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${section.gradient} border ${section.border} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Icon className="w-3.5 h-3.5 text-foreground/60" />
                <span className="text-foreground/70 text-[10px] font-display tracking-[0.3em] uppercase">
                  {section.label}
                </span>
                <span className="text-muted-foreground/40 text-[10px] font-display">
                  {section.sublabel}
                </span>
              </div>
              <p className="text-foreground/80 text-xs font-display leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', 'DM Sans', serif" }}
              >
                {content}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Refresh button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground/50 text-[10px] font-display hover:text-muted-foreground/70 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh (uses credits)
        </button>
      </div>
    </motion.div>
  );
}
