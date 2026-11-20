/**
 * DailyRhythmPicker — Settings panel that lets the user change their
 * Daily Rhythm pattern after onboarding. Mirrors the 5 archetypal patterns
 * from the onboarding flow.
 */
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import { RHYTHM_PATTERNS, type RhythmPatternId } from "@/components/Onboarding";

export default function DailyRhythmPicker() {
  const qc = useQueryClient();

  const { data: current } = useQuery({
    queryKey: ["daily-rhythm-pattern"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("spiritual_dna_assessments")
        .select("assessment_conversation")
        .eq("user_id", user.id)
        .maybeSingle();
      const conv = (data?.assessment_conversation as any) || {};
      return {
        userId: user.id,
        patternId: (conv.rhythm_pattern as RhythmPatternId | undefined) ?? null,
      };
    },
  });

  const [selected, setSelected] = useState<RhythmPatternId | null>(null);

  useEffect(() => {
    if (current?.patternId) setSelected(current.patternId);
  }, [current?.patternId]);

  const save = useMutation({
    mutationFn: async (patternId: RhythmPatternId) => {
      if (!current?.userId) throw new Error("Not signed in");
      const pattern = RHYTHM_PATTERNS.find((p) => p.id === patternId)!;
      const isFlex = patternId === "irregular";
      const effectiveSlots = isFlex
        ? ["morning", "midday", "evening", "night"]
        : [...pattern.slots];
      const primarySlot = effectiveSlots[0] ?? "morning";
      const secondarySlot = effectiveSlots.length > 1 ? effectiveSlots[1] : null;
      const skippedSlots = ["morning", "midday", "evening", "night"].filter(
        (s) => !effectiveSlots.includes(s),
      );

      // Read existing conversation so we don't clobber other onboarding data
      const { data: existing } = await supabase
        .from("spiritual_dna_assessments")
        .select("assessment_conversation")
        .eq("user_id", current.userId)
        .maybeSingle();
      const prev = (existing?.assessment_conversation as any) || {};

      const { error } = await supabase
        .from("spiritual_dna_assessments")
        .upsert(
          {
            user_id: current.userId,
            available_time_daily: Math.max(15, effectiveSlots.length * 15),
            circadian_type:
              patternId === "night_only"
                ? "night_owl"
                : patternId === "morning_only" || patternId === "morning_evening"
                ? "early_bird"
                : "flexible",
            assessment_conversation: {
              ...prev,
              available_slots: effectiveSlots,
              primary_slot: primarySlot,
              secondary_slot: secondarySlot,
              skipped_slots: skippedSlots,
              flexible_mode: isFlex,
              rhythm_pattern: patternId,
            } as any,
          },
          { onConflict: "user_id" },
        );
      if (error) throw error;

      // Also update the living user_spiritual_dna profile if it exists
      await supabase
        .from("user_spiritual_dna")
        .update({
          available_slots: effectiveSlots as any,
          primary_slot: primarySlot,
          skipped_slots: skippedSlots as any,
          flexible_mode: isFlex,
        })
        .eq("user_id", current.userId);
    },
    onSuccess: (_, patternId) => {
      const pattern = RHYTHM_PATTERNS.find((p) => p.id === patternId);
      toast({
        title: "Daily rhythm updated",
        description: `Engine will now adapt to "${pattern?.label}".`,
      });
      qc.invalidateQueries({ queryKey: ["daily-rhythm-pattern"] });
      qc.invalidateQueries({ queryKey: ["user-time-profile"] });
    },
    onError: (e: any) => {
      consciousFromError(e, "actionMissed");
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-body text-foreground">Daily Rhythm</span>
      </div>
      <p className="text-xs text-muted-foreground font-body mb-4 pl-7">
        When can you make time? The engine adapts — no guilt for the rest.
      </p>

      <div className="space-y-2">
        {RHYTHM_PATTERNS.map((pattern) => {
          const isSelected = selected === pattern.id;
          return (
            <motion.button
              key={pattern.id}
              onClick={() => {
                setSelected(pattern.id);
                save.mutate(pattern.id);
              }}
              disabled={save.isPending}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/30 glass-subtle hover:bg-muted/40"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl mt-0.5">{pattern.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-display font-medium ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}>
                  {pattern.label}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {pattern.description}
                </p>
              </div>
              {isSelected && (
                <span className="text-[10px] font-body text-primary mt-1 shrink-0">
                  Active
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
