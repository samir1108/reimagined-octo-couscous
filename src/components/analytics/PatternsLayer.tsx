import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Moon, Sun, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import type { ConsciousnessProfile } from "@/hooks/useConsciousnessEngine";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

interface Props {
  profile?: ConsciousnessProfile;
  regressions: any[];
}

export function PatternsLayer({ profile, regressions }: Props) {
  const circadian = (profile?.circadian_profile || {}) as Record<string, any>;
  const relational = (profile?.relational || {}) as Record<string, any>;
  const regression = (profile?.regression || {}) as Record<string, any>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">AI Insights</h2>
        <p className="text-sm text-muted-foreground font-body">Deep patterns the engine has discovered over time</p>
      </motion.div>

      {/* Regression Timeline */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h3 className="font-display font-semibold text-foreground text-sm">Dark Nights & Breakthroughs</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs font-body">
          <div className="space-y-1">
            <span className="text-muted-foreground">Dark Night Count</span>
            <p className="text-lg font-display font-bold text-foreground">{regression?.dark_night_count ?? 0}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Highest Baseline</span>
            <p className="text-lg font-display font-bold text-foreground">{Number(regression?.baseline_highest ?? 0).toFixed(1)}</p>
          </div>
        </div>

        {regressions.length > 0 ? (
          <div className="space-y-2 pt-2">
            {regressions.slice(0, 5).map((r, i) => (
              <motion.div
                key={r.id}
                className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                {r.breakthrough_after ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                    {r.trigger_type && <span className="ml-1 capitalize">• {r.trigger_type}</span>}
                  </p>
                  <p className="text-xs text-foreground font-body">
                    {Number(r.baseline_before).toFixed(1)} → {Number(r.lowest_point).toFixed(1)}
                    {r.new_baseline_after && ` → ${Number(r.new_baseline_after).toFixed(1)}`}
                  </p>
                </div>
                {r.breakthrough_after && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Breakthrough</span>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-body italic">No regression events recorded yet.</p>
        )}
      </motion.div>

      {/* Circadian Profile */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Circadian Profile</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={<Sun className="w-3 h-3 text-yellow-400" />}
            label="Peak Practice"
            value={circadian?.peak_practice_time || "Not yet known"}
          />
          <InfoCard
            icon={<Moon className="w-3 h-3 text-blue-400" />}
            label="Natural Rhythm"
            value={circadian?.natural_rhythm || "Discovering..."}
          />
          <InfoCard
            icon={<TrendingUp className="w-3 h-3 text-emerald-400" />}
            label="Consistency"
            value={`${Math.round(Number(circadian?.consistency_score ?? 0) * 100)}%`}
          />
          <InfoCard
            icon={<Moon className="w-3 h-3 text-violet-400" />}
            label="Moon Sensitivity"
            value={`${Math.round(Number(circadian?.moon_sensitivity ?? 0) * 100)}%`}
          />
        </div>
      </motion.div>

      {/* Relational Map */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.35 }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Relational Patterns</h3>
        </div>
        <div className="space-y-2 text-xs font-body">
          <div className="flex justify-between text-muted-foreground">
            <span>Relational Band</span>
            <span className="text-foreground font-medium">{Number(relational?.dimension_band ?? 0).toFixed(1)}</span>
          </div>
          {relational?.shadow_projections?.length > 0 && (
            <div>
              <span className="text-muted-foreground">Shadow Projections:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(relational.shadow_projections as string[]).map((s: string, i: number) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-foreground capitalize">{s}</span>
                ))}
              </div>
            </div>
          )}
          {relational?.mirror_active?.length > 0 && (
            <div>
              <span className="text-muted-foreground">Active Mirrors:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(relational.mirror_active as string[]).map((m: string, i: number) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[9px] font-body uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-display font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}
