import { motion } from "framer-motion";
import { Users, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/design-system";
import { useJourneyGroups, useJoinGroup, useLeaveGroup } from "@/hooks/useCommunity";
import { differenceInDays } from "date-fns";

const typeEmojis: Record<string, string> = {
  awareness_challenge: "👁‍🗨", thought_observation: "💭",
  emotional_awareness: "❤️", ego_watching: "🪞",
};

export default function JourneyGroups() {
  const { data: groups = [], isLoading } = useJourneyGroups();
  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground tracking-tight">
          Journey Groups
        </h3>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl glass-card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <motion.p
          className="text-center text-sm text-muted-foreground/50 font-body py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No active groups right now. Groups will appear here as they're created.
        </motion.p>
      ) : (
        <div className="space-y-3">
          {groups.map((group, i) => {
            const daysLeft = Math.max(0, group.duration_days - differenceInDays(new Date(), new Date(group.starts_at)));
            const isFull = (group.member_count || 0) >= group.max_members;

            return (
              <motion.div
                key={group.id}
                className="rounded-xl glass-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{typeEmojis[group.type] || "🌀"}</span>
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">{group.name}</p>
                      <p className="text-xs text-muted-foreground/60 font-body mt-0.5 line-clamp-2">
                        {group.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-primary/50" />
                          <span className="text-[10px] text-primary/60 font-display">
                            {group.member_count}/{group.max_members}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/50 font-display">
                            {daysLeft} days left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={group.is_member ? "outline" : "default"}
                    className="rounded-xl text-xs font-display shrink-0"
                    onClick={() => group.is_member ? leaveMutation.mutate(group.id) : joinMutation.mutate(group.id)}
                    disabled={(!group.is_member && isFull) || joinMutation.isPending || leaveMutation.isPending}
                  >
                    {group.is_member ? "Leave" : isFull ? "Full" : "Join"}
                    {!group.is_member && !isFull && <ArrowRight className="w-3 h-3" />}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
