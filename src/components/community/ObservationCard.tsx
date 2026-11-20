import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { CommunityObservation, useToggleReaction } from "@/hooks/useCommunity";
import { formatDistanceToNow } from "date-fns";

interface Props {
  observation: CommunityObservation;
}

export default function ObservationCard({ observation }: Props) {
  const toggleReaction = useToggleReaction();

  const getDisplayLabel = () => {
    if (observation.display_mode === "anonymous") return "Anonymous";
    if (observation.display_mode === "real" && observation.display_name) return observation.display_name;
    // Seeker mode — generate stable short id from user_id
    return `Seeker_${observation.user_id.slice(0, 4).toUpperCase()}`;
  };

  const isAcknowledged = observation.user_reactions?.includes("acknowledged");
  const isWitnessed = observation.user_reactions?.includes("witnessed");

  return (
    <motion.div
      className="rounded-xl glass-card p-4 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-display text-muted-foreground/60 tracking-wide">
          {getDisplayLabel()}
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-body">
          {formatDistanceToNow(new Date(observation.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground/80 font-body leading-relaxed">
        {observation.content}
      </p>

      {/* Tags */}
      {observation.tags.length > 0 && (
        <div className="flex gap-1.5">
          {observation.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary/60 font-display capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => toggleReaction.mutate({ observationId: observation.id, type: "acknowledged" })}
          className={`flex items-center gap-1.5 text-[11px] font-display transition-all ${
            isAcknowledged ? "text-primary" : "text-muted-foreground/50 hover:text-primary/70"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isAcknowledged ? "fill-current" : ""}`} />
          <span>Acknowledge</span>
          {(observation.reaction_counts?.acknowledged || 0) > 0 && (
            <span className="text-[10px] opacity-60">{observation.reaction_counts?.acknowledged}</span>
          )}
        </button>

        <button
          onClick={() => toggleReaction.mutate({ observationId: observation.id, type: "witnessed" })}
          className={`flex items-center gap-1.5 text-[11px] font-display transition-all ${
            isWitnessed ? "text-primary" : "text-muted-foreground/50 hover:text-primary/70"
          }`}
        >
          <Eye className={`w-3.5 h-3.5 ${isWitnessed ? "fill-current" : ""}`} />
          <span>Witnessed</span>
          {(observation.reaction_counts?.witnessed || 0) > 0 && (
            <span className="text-[10px] opacity-60">{observation.reaction_counts?.witnessed}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
