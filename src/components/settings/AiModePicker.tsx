/**
 * AiModePicker — global toggle between Fast (Groq) and Premium (GPT-5.5).
 *
 * Reads/writes `profiles.ai_mode`. Both modes draw from the same credit
 * wallet — Premium just costs significantly more per message in exchange
 * for higher reasoning quality.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Sparkles, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

type AiMode = "fast" | "premium";

const MODES: Array<{
  id: AiMode;
  label: string;
  tagline: string;
  cost: string;
  Icon: typeof Zap;
  bullets: string[];
}> = [
  {
    id: "fast",
    label: "Fast",
    tagline: "Quick, light, gentle on credits.",
    cost: "≈ ₹0.50 / message",
    Icon: Zap,
    bullets: [
      "Powered by Llama 3.3 70B (Groq)",
      "Best for daily check-ins, short replies, quick reflections",
      "Replies in 1–3 seconds",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    tagline: "Deepest reasoning. Slower, costlier, sharper.",
    cost: "≈ ₹4–8 / message",
    Icon: Sparkles,
    bullets: [
      "Powered by GPT-5.5 (latest OpenAI)",
      "Best for Elder readings, deep analyses, master sessions",
      "Replies in 5–15 seconds, much higher nuance",
    ],
  },
];

export default function AiModePicker() {
  const qc = useQueryClient();

  const { data: mode = "fast", isLoading } = useQuery({
    queryKey: ["ai-mode"],
    queryFn: async (): Promise<AiMode> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "fast";
      const { data } = await supabase
        .from("profiles")
        .select("ai_mode")
        .eq("user_id", user.id)
        .maybeSingle();
      const m = (data as any)?.ai_mode;
      return m === "premium" ? "premium" : "fast";
    },
  });

  const [pending, setPending] = useState<AiMode | null>(null);

  const mutate = useMutation({
    mutationFn: async (next: AiMode) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ ai_mode: next } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      return next;
    },
    onMutate: (next) => setPending(next),
    onSuccess: (next) => {
      qc.setQueryData(["ai-mode"], next);
      toast({
        title: next === "premium" ? "Premium AI activated" : "Fast AI activated",
        description:
          next === "premium"
            ? "All your AI now uses GPT-5.5. Credits will be deducted faster."
            : "All your AI now uses the fast Llama model. Easy on credits.",
      });
    },
    onError: (e: any) =>
      toast({
        title: "Couldn't update",
        description: e?.message ?? "Try again",
        variant: "destructive",
      }),
    onSettled: () => setPending(null),
  });

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base text-foreground">AI Mode</h3>
      </div>
      <p className="text-[12.5px] text-muted-foreground mb-4 leading-relaxed">
        Choose which AI brain powers your Elder, Guide, masters, and every reflection.
        Both modes use the same credit wallet — Premium just spends faster for sharper insight.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((m) => {
          const active = mode === m.id;
          const isPending = pending === m.id;
          const Icon = m.Icon;
          return (
            <motion.button
              key={m.id}
              type="button"
              disabled={isLoading || mutate.isPending}
              onClick={() => !active && mutate.mutate(m.id)}
              whileTap={{ scale: 0.985 }}
              className={`text-left rounded-2xl p-4 border transition relative overflow-hidden ${
                active
                  ? "border-primary/70 bg-primary/10 ring-1 ring-primary/40"
                  : "border-border/40 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
              } ${isPending ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon
                  className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="font-display text-sm text-foreground">{m.label}</span>
                {active && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-2">
                {m.tagline}
              </p>
              <p className="text-[11px] font-medium text-primary/90 tabular-nums mb-2">
                {m.cost}
              </p>
              <ul className="space-y-1">
                {m.bullets.map((b) => (
                  <li
                    key={b}
                    className="text-[11.5px] text-muted-foreground/90 flex gap-1.5"
                  >
                    <span className="text-primary/70 shrink-0">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>

      <p className="text-[10.5px] text-muted-foreground/70 mt-3 leading-relaxed">
        You can switch modes anytime. The change takes effect on your very next message.
      </p>
    </div>
  );
}
