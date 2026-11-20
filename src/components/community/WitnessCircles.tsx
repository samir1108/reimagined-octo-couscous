import { motion } from "framer-motion";
import { CircleDot, Users, Calendar } from "lucide-react";
import { Button } from "@/design-system";
import { useWitnessCircles, useJoinCircle, useLeaveCircle } from "@/hooks/useCommunity";
import { format } from "date-fns";

export default function WitnessCircles() {
  const { data: circles = [], isLoading } = useWitnessCircles();
  const joinMutation = useJoinCircle();
  const leaveMutation = useLeaveCircle();

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CircleDot className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground tracking-tight">
            Witness Circles
          </h3>
        </div>
        <p className="text-[11px] text-muted-foreground/50 font-body ml-6">
          Small satsang-style groups. One shares, others witness silently. No advice, no judgement.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl glass-card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : circles.length === 0 ? (
        <motion.p
          className="text-center text-sm text-muted-foreground/50 font-body py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No witness circles available yet. Coming soon.
        </motion.p>
      ) : (
        <div className="space-y-3">
          {circles.map((circle, i) => {
            const isFull = (circle.member_count || 0) >= circle.max_members;

            return (
              <motion.div
                key={circle.id}
                className="rounded-xl glass-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-display font-semibold text-foreground">{circle.name}</p>
                    {circle.description && (
                      <p className="text-xs text-muted-foreground/60 font-body mt-0.5">{circle.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary/50" />
                        <span className="text-[10px] text-primary/60 font-display">
                          {circle.member_count}/{circle.max_members}
                        </span>
                      </div>
                      {circle.next_session_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/50 font-display">
                            Next: {format(new Date(circle.next_session_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={circle.is_member ? "outline" : "default"}
                    className="rounded-xl text-xs font-display shrink-0"
                    onClick={() => circle.is_member ? leaveMutation.mutate(circle.id) : joinMutation.mutate(circle.id)}
                    disabled={(!circle.is_member && isFull) || joinMutation.isPending || leaveMutation.isPending}
                  >
                    {circle.is_member ? "Leave" : isFull ? "Full" : "Join"}
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
