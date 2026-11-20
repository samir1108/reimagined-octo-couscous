import { useState } from "react";
import { motion } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const moods = [
  { emoji: "😫", label: "Struggling", value: 1 },
  { emoji: "😕", label: "Low", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "🤩", label: "Great", value: 5 },
];

const energies = [
  { emoji: "🔋", label: "Drained", value: 1 },
  { emoji: "⚡", label: "Low", value: 2 },
  { emoji: "✨", label: "Balanced", value: 3 },
  { emoji: "🔥", label: "Energized", value: 4 },
  { emoji: "💥", label: "Peak", value: 5 },
];

export default function MoodPulseWidget({ orgId }: { orgId: string }) {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!mood || !energy) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      // Look up team for proper team-level aggregation
      const { data: member } = await supabase
        .from("org_members" as any)
        .select("team_id")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .maybeSingle();
      // Upsert (one pulse per user/day/context) — re-submitting same day overwrites
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("mood_pulses" as any).upsert({
        org_id: orgId,
        user_id: user.id,
        team_id: (member as any)?.team_id ?? null,
        mood_score: mood,
        energy_score: energy,
        context: "work",
        pulse_date: today,
      }, { onConflict: "user_id,pulse_date,context" });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Mood pulse recorded!");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-5 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-2xl mb-2">✅</p>
        <p className="text-sm font-body text-foreground font-medium">Today's pulse recorded</p>
        <p className="text-xs text-muted-foreground font-body mt-1">Your response is anonymous to managers</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <SmilePlus className="w-5 h-5 text-primary" />
        <h3 className="font-display text-base font-semibold text-foreground">Daily Mood Pulse</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-body text-muted-foreground mb-2">How are you feeling?</p>
          <div className="flex gap-2">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  mood === m.value
                    ? "border-primary bg-primary/10"
                    : "border-border/20 hover:border-primary/30"
                }`}
              >
                <span className="text-lg">{m.emoji}</span>
                <span className="text-[9px] font-body text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-body text-muted-foreground mb-2">Energy level?</p>
          <div className="flex gap-2">
            {energies.map((e) => (
              <button
                key={e.value}
                onClick={() => setEnergy(e.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  energy === e.value
                    ? "border-primary bg-primary/10"
                    : "border-border/20 hover:border-primary/30"
                }`}
              >
                <span className="text-lg">{e.emoji}</span>
                <span className="text-[9px] font-body text-muted-foreground">{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!mood || !energy || submitting}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {submitting ? "Submitting..." : "Submit Pulse"}
        </button>
        <p className="text-[10px] text-muted-foreground font-body text-center">
          🔒 Anonymous — managers only see team averages
        </p>
      </div>
    </motion.div>
  );
}
