"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InnerWorldProps {
  activePatterns: Array<{ id: string; name: string; description: string }>;
  latestReflection?: string;
  isLoading?: boolean;
}

export default function InnerWorld({ activePatterns, latestReflection, isLoading = false }: InnerWorldProps) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const hasEvidence = activePatterns.length > 0 || Boolean(latestReflection?.trim());

  return (
    <section aria-labelledby="inner-world-title" className="relative">
      <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-start">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-primary/65">Personal intelligence</p>
          <h2
            id="inner-world-title"
            className="mt-1.5 text-2xl font-light tracking-wide text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Your inner world
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
            {isLoading
              ? "Gathering your profile and recent session context."
              : hasEvidence
              ? "A few things your profile and recent sessions actually record."
              : "There is not enough personal history to draw a pattern yet. Nothing needs to be assumed."}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3 border-y border-border/50 py-5" role="status" aria-label="Loading personal context">
            <span className="block h-3 w-2/3 animate-pulse rounded bg-muted/60" />
            <span className="block h-3 w-1/2 animate-pulse rounded bg-muted/40" />
          </div>
        ) : hasEvidence ? (
          <div className="divide-y divide-border/50 border-y border-border/50">
            {activePatterns.slice(0, 2).map((pattern, index) => (
              <motion.article
                key={pattern.id}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: reducedMotion ? 0 : index * 0.06 }}
                className="py-4 first:pt-4"
              >
                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm text-foreground">{pattern.name}</h3>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{pattern.description}</p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/55">
                      Listed in your consciousness profile · a prompt for observation, not a diagnosis
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}

            {latestReflection?.trim() && (
              <motion.article
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.12 }}
                className="py-4"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm text-foreground">From your latest sitting</h3>
                    <p className="mt-1 break-words text-xs leading-6 text-foreground/70">{latestReflection}</p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/55">
                      Your session summary · today
                    </p>
                  </div>
                </div>
              </motion.article>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/app/journal")}
            className="flex min-h-24 items-center justify-between gap-4 border-y border-border/50 py-5 text-left text-sm text-foreground/70 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Begin with a reflection of your own
            <ArrowRight className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
