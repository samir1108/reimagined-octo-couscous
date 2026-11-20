/**
 * DomainsScreen
 * ─────────────
 * Onboarding step: user picks which Practice Domains call to them.
 * Mirrors the TaskDomainsPicker UI but framed cinematically.
 *
 * Saves → user_consciousness_profile.life_domains.active_domains
 * Default = DEFAULT_ACTIVE_DOMAINS (8 domains pre-selected).
 *
 * Skippable — defaults are always usable.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  TASK_DOMAINS,
  DOMAIN_CATEGORIES,
  DEFAULT_ACTIVE_DOMAINS,
} from "@/data/taskDomains";

export interface DomainsScreenValue {
  activeDomains: string[];
}

interface Props {
  name?: string;
  initial?: DomainsScreenValue | null;
  onComplete: (value: DomainsScreenValue) => void;
  onSkip?: () => void;
}

export default function DomainsScreen({ name, initial, onComplete, onSkip }: Props) {
  const [active, setActive] = useState<string[]>(
    initial?.activeDomains?.length ? initial.activeDomains : DEFAULT_ACTIVE_DOMAINS,
  );

  const toggle = (id: string) => {
    setActive((prev) =>
      prev.includes(id)
        ? prev.length > 3
          ? prev.filter((d) => d !== id)
          : prev
        : [...prev, id],
    );
  };

  const categories = Object.entries(DOMAIN_CATEGORIES) as [
    string,
    { label: string; emoji: string },
  ][];

  return (
    <motion.div
      key="domains"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-xl mx-auto text-center"
    >
      <p
        className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-3 font-display"
      >
        Your Practice Domains
      </p>
      <h2
        className="text-2xl md:text-3xl font-display text-foreground mb-2 leading-snug"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {name ? `${name}, what calls to you?` : "What calls to you?"}
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-6">
        Choose the areas the engine will weave into your daily practice ·{" "}
        <span className="text-primary">{active.length} active</span>
      </p>

      <div className="space-y-4 text-left max-h-[55dvh] overflow-y-auto pr-1 -mr-1">
        {categories.map(([catKey, catInfo]) => {
          const domains = TASK_DOMAINS.filter((d) => d.category === catKey);
          if (domains.length === 0) return null;
          return (
            <div key={catKey}>
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {catInfo.emoji} {catInfo.label}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {domains.map((d) => {
                  const on = active.includes(d.id);
                  return (
                    <motion.button
                      key={d.id}
                      type="button"
                      onClick={() => toggle(d.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm font-body transition-all ${
                        on
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-card/40 text-muted-foreground border border-border/30 hover:text-foreground"
                      }`}
                    >
                      <span className="text-base shrink-0">{d.emoji}</span>
                      <span className="flex-1 truncate">{d.label}</span>
                      {on && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          disabled={active.length < 3}
          onClick={() => onComplete({ activeDomains: active })}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-display tracking-wide hover:bg-primary/90 transition disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
