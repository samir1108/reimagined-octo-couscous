/**
 * GoalsSettingsCard
 * ─────────────────
 * Settings → My Goals card. Shows current priority + secondary goals and
 * lets the user edit anytime via an inline expanded picker.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Pencil, X } from "lucide-react";
import { useUserGoals } from "@/hooks/useUserGoals";
import { findGoal } from "@/lib/goals/catalog";
import GoalsScreen from "@/components/onboarding/GoalsScreen";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";

export default function GoalsSettingsCard() {
  const { data: current, save } = useUserGoals();
  const [editing, setEditing] = useState(false);

  const priority = current?.priority_goal ? findGoal(current.priority_goal) : null;
  const secondary = (current?.secondary_goals ?? [])
    .map((id) => findGoal(id))
    .filter(Boolean) as ReturnType<typeof findGoal>[];

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-subtle flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">My Goals</h3>
            <p className="text-[11px] text-muted-foreground">
              The engine prioritizes practices around what matters most to you.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground transition"
          aria-label={editing ? "Close editor" : "Edit goals"}
        >
          {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </button>
      </div>

      {!editing && (
        <div className="space-y-2">
          {priority ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2">
              <span className="text-lg">{priority.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-display tracking-[0.25em] uppercase text-primary">
                    Priority
                  </span>
                </div>
                <p className="text-sm font-display text-foreground truncate">{priority.label}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/80 italic">
              No goals set yet. Tap edit to choose what brings you here.
            </p>
          )}
          {secondary.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {secondary.map((g) =>
                g ? (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    <span>{g.emoji}</span>
                    {g.label}
                  </span>
                ) : null
              )}
            </div>
          )}
          {current?.why_now && (
            <p className="pt-1 text-[11px] italic text-muted-foreground/80">
              "{current.why_now}"
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GoalsScreen
              embedded
              initial={
                current
                  ? {
                      priorityGoal: current.priority_goal,
                      secondaryGoals: current.secondary_goals,
                      whyNow: current.why_now,
                    }
                  : null
              }
              onComplete={async (v) => {
                try {
                  await save.mutateAsync({
                    priorityGoal: v.priorityGoal,
                    secondaryGoals: v.secondaryGoals,
                    whyNow: v.whyNow,
                  });
                  toast({ title: "Goals updated", description: "Your engine will adapt." });
                  setEditing(false);
                } catch (e: any) {
                  consciousFromError(e, "actionMissed");
                }
              }}
              cta="Save goals"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
