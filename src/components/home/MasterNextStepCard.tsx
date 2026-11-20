/**
 * MasterNextStepCard — Surfaces the most recent unread "master_next_step"
 * notification right on Home, in the Master's voice.
 * Lazy: just reads existing notifications; no extra AI call.
 */
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Props {
  userId?: string;
}

export default function MasterNextStepCard({ userId }: Props) {
  const { notifications, markRead } = useNotifications(userId) as any;
  const [authedUserId, setAuthedUserId] = useState<string | undefined>(userId);

  useEffect(() => {
    if (userId) return;
    supabase.auth.getUser().then(({ data }) => setAuthedUserId(data.user?.id));
  }, [userId]);

  const next = useMemo(() => {
    if (!notifications) return null;
    return (notifications as any[]).find(
      (n) => n?.type === "master_next_step" && !n?.read
    );
  }, [notifications]);

  if (!next) return null;

  const masterName = next?.metadata?.master_name as string | undefined;

  return (
    <AnimatePresence>
      <motion.div
        key={next.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="glass-subtle rounded-2xl p-4 space-y-3 border border-primary/15"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary/80" />
            <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80">
              {masterName ? `${masterName}'s next step` : "Your next step"}
            </p>
          </div>
          <button
            onClick={() => markRead?.(next.id)}
            className="text-[10px] font-display tracking-wider uppercase text-muted-foreground/60 hover:text-primary/80 transition flex items-center gap-1"
            aria-label="Mark done"
          >
            <Check className="w-3 h-3" />
            Done
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-display text-foreground leading-snug">
            {next.title}
          </p>
          <p className="text-[13px] font-body text-muted-foreground/90 leading-relaxed italic">
            {next.body}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
