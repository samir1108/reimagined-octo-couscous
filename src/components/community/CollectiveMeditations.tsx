import { motion } from "framer-motion";
import { Headphones, Users, Calendar } from "lucide-react";
import { Button } from "@/design-system";
import { useCollectiveMeditations, useJoinMeditation, useLeaveMeditation } from "@/hooks/useCommunity";
import { format } from "date-fns";

const typeEmojis: Record<string, string> = {
  silent_sit: "🧘", breath: "🌬️", full_moon: "🌕", weekly_reflection: "📿",
};

export default function CollectiveMeditations() {
  const { data: meditations = [], isLoading } = useCollectiveMeditations();
  const joinMutation = useJoinMeditation();
  const leaveMutation = useLeaveMeditation();

  const upcoming = meditations.filter((m) => new Date(m.scheduled_at) >= new Date());
  const past = meditations.filter((m) => new Date(m.scheduled_at) < new Date());

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Headphones className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground tracking-tight">
          Collective Meditations
        </h3>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl glass-card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <motion.p
          className="text-center text-sm text-muted-foreground/50 font-body py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No meditation sessions scheduled yet. Coming soon.
        </motion.p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((med, i) => (
            <motion.div
              key={med.id}
              className="rounded-xl glass-card p-4 flex items-center justify-between gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{typeEmojis[med.type] || "🧘"}</span>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">{med.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/60 font-body">
                      {format(new Date(med.scheduled_at), "MMM d, h:mm a")}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[10px] text-muted-foreground/60 font-body">{med.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-primary/50" />
                    <span className="text-[10px] text-primary/60 font-display">{med.participant_count} joined</span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant={med.is_joined ? "outline" : "default"}
                className="rounded-xl text-xs font-display shrink-0"
                onClick={() => med.is_joined ? leaveMutation.mutate(med.id) : joinMutation.mutate(med.id)}
                disabled={joinMutation.isPending || leaveMutation.isPending}
              >
                {med.is_joined ? "Leave" : "Join"}
              </Button>
            </motion.div>
          ))}

          {past.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground/40 font-display tracking-wide uppercase mb-2">Past Sessions</p>
              {past.slice(0, 3).map((med) => (
                <div key={med.id} className="rounded-lg glass-subtle p-3 mb-2 opacity-50">
                  <p className="text-xs font-display text-foreground/60">{med.title}</p>
                  <span className="text-[10px] text-muted-foreground/40 font-body">
                    {format(new Date(med.scheduled_at), "MMM d")} • {med.participant_count} attended
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
