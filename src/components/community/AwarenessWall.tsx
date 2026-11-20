import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useObservations } from "@/hooks/useCommunity";
import ComposeObservation from "./ComposeObservation";
import ObservationCard from "./ObservationCard";

export default function AwarenessWall() {
  const { data: observations = [], isLoading } = useObservations();

  return (
    <div className="space-y-4">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground tracking-tight">
          Shared Awareness Wall
        </h3>
      </motion.div>

      <ComposeObservation />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl glass-card p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : observations.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-muted-foreground/50 text-sm font-body">
            No observations yet. Share what you're noticing.
          </p>
          <p className="text-muted-foreground/30 text-xs font-body mt-1">
            "Main akela nahi hu" — you're not alone in this.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {observations.map((obs) => (
            <ObservationCard key={obs.id} observation={obs} />
          ))}
        </div>
      )}
    </div>
  );
}
