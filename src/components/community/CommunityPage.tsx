import { motion } from "framer-motion";
import ConsciousnessMap from "./ConsciousnessMap";
import AwarenessWall from "./AwarenessWall";
import CollectiveMeditations from "./CollectiveMeditations";
import JourneyGroups from "./JourneyGroups";
import WitnessCircles from "./WitnessCircles";

export default function CommunityPage() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Community philosophy banner */}
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-display tracking-[0.2em] uppercase text-primary/60 mb-1">
          Silent Community
        </p>
        <p className="text-[11px] text-muted-foreground/40 font-body max-w-sm mx-auto">
          Sharing ke liye, attention ke liye nahi. No followers, no likes, no popularity — sirf presence.
        </p>
      </motion.div>

      {/* 1. Collective Consciousness Map */}
      <ConsciousnessMap />

      {/* 2. Shared Awareness Wall */}
      <AwarenessWall />

      {/* 3. Collective Meditations */}
      <CollectiveMeditations />

      {/* 4. Journey Groups */}
      <JourneyGroups />

      {/* 5. Witness Circles */}
      <WitnessCircles />
    </motion.div>
  );
}
