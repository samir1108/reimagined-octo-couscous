"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Heart, Brain, Waves, Users, Briefcase, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DOMAIN_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  body: { label: "Body", icon: Sparkles, color: "hsl(var(--primary))" },
  health: { label: "Body", icon: Sparkles, color: "hsl(var(--primary))" },
  mind: { label: "Mind", icon: Brain, color: "hsl(var(--success))" },
  emotion: { label: "Emotions", icon: Waves, color: "hsl(var(--accent))" },
  emotions: { label: "Emotions", icon: Waves, color: "hsl(var(--accent))" },
  relationships: { label: "Relationships", icon: Users, color: "hsl(var(--gold-600))" },
  work: { label: "Work", icon: Briefcase, color: "hsl(var(--muted-foreground))" },
  finances: { label: "Finances", icon: Briefcase, color: "hsl(var(--muted-foreground))" },
  social: { label: "Social", icon: Users, color: "hsl(var(--gold-600))" },
  spirituality: { label: "Inner life", icon: Heart, color: "hsl(var(--sage-muted, 100 12% 35%))" },
  "inner peace": { label: "Inner peace", icon: Heart, color: "hsl(var(--sage-muted, 100 12% 35%))" },
  purpose: { label: "Purpose", icon: Heart, color: "hsl(var(--sage-muted, 100 12% 35%))" },
  creativity: { label: "Creativity", icon: Sparkles, color: "hsl(var(--primary))" },
  community: { label: "Community", icon: Users, color: "hsl(var(--gold-600))" },
};

interface LifeMapProps {
  lifeDomains: Record<string, number>;
}

export default function LifeMap({ lifeDomains }: LifeMapProps) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const domains = Object.entries(lifeDomains)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
    .slice(0, 6);

  if (!domains.length) return null;

  return (
    <section aria-labelledby="lifemap-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-primary/65">Your life map</p>
          <h2 id="lifemap-title" className="mt-1 text-2xl font-light text-foreground" style={{ fontFamily: "var(--font-editorial)" }}>Awareness, lived</h2>
          <p className="mt-1 text-[10px] text-muted-foreground/60">Profile estimates for reflection, not validated measures of consciousness.</p>
        </div>
        <motion.button
          type="button"
          onClick={() => navigate("/app/analytics?tab=domains")}
          aria-label="Explore life domains"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-primary/70 transition hover:border-primary/25 hover:text-accent"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </div>

      <motion.ul
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        {domains.map(([name, value], index) => {
          const config = DOMAIN_CONFIG[name] || { label: name.replace(/[_-]/g, " "), icon: Sparkles, color: "hsl(var(--primary))" };
          const Icon = config.icon;
          const color = config.color;
          return (
            <motion.li
              key={name}
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: reducedMotion ? 0 : index * 0.05 }}
              className="flex items-center justify-between gap-4 border-b border-border/40 pb-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-8 w-8 place-items-center rounded-xl"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
                </span>
                <span className="text-foreground/70">{config.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-muted-foreground/70" aria-label={value > 0 ? `Profile estimate ${value}` : "Not yet mapped"}>
                  {value > 0 ? value : "—"}
                </span>
                <div className="h-1.5 w-24 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={{ width: `${value > 0 ? Math.min(100, Math.max(0, value)) : 0}%` }}
                    transition={{ duration: 0.8, delay: reducedMotion ? 0 : 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
      {domains.some(([, value]) => value <= 0) && (
        <p className="mt-3 text-[10px] text-muted-foreground/60">
          A dash means no estimate is available yet; it does not mean you scored zero.
        </p>
      )}
    </section>
  );
}