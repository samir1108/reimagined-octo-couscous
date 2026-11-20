/**
 * TEMPLE - Master Presence Indicator
 * Per temple.md Section 33: Shows which masters are actively witnessing user's journey
 */
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

type PresenceType = "active" | "elder" | "future";

interface MasterPresence {
  masterId: string;
  masterName: string;
  masterImage: string;
  type: PresenceType;
  currentDay?: number;
  totalDays?: number;
  lastInteraction?: string;
  quote?: string;
}

interface MasterPresenceIndicatorProps {
  presences: MasterPresence[];
  onBrowseMasters?: () => void;
}

const PRESENCE_LABELS: Record<PresenceType, string> = {
  active: "Active Guide",
  elder: "Elder Presence",
  future: "Future Guide",
};

export default function MasterPresenceIndicator({
  presences,
  onBrowseMasters,
}: MasterPresenceIndicatorProps) {
  return (
    <div className="p-4">
      <h3 className="text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase mb-3">
        Currently Witnessing Your Journey
      </h3>

      <div className="space-y-3">
        {presences.map((presence, i) => (
          <motion.div
            key={presence.masterId}
            className={`p-3 rounded-xl border transition-all ${
              presence.type === "active"
                ? "bg-primary/5 border-primary/15"
                : presence.type === "elder"
                ? "bg-muted/20 border-border/30"
                : "bg-muted/10 border-border/20 opacity-70"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <img
                  src={presence.masterImage}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover object-top ring-1 ring-border/30"
                />
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    presence.type === "active"
                      ? "bg-emerald-500"
                      : presence.type === "elder"
                      ? "bg-muted-foreground"
                      : "bg-primary/40"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-foreground text-xs font-display font-medium">
                    {presence.masterName}
                  </p>
                  <span
                    className={`text-[9px] font-display tracking-wider px-1.5 py-0.5 rounded-full ${
                      presence.type === "active"
                        ? "bg-primary/10 text-primary"
                        : presence.type === "elder"
                        ? "bg-muted/40 text-muted-foreground"
                        : "bg-muted/30 text-muted-foreground/70"
                    }`}
                  >
                    {PRESENCE_LABELS[presence.type]}
                  </span>
                </div>
                {presence.type === "active" && presence.currentDay && presence.totalDays && (
                  <p className="text-muted-foreground text-[10px] font-display mt-0.5">
                    Day {presence.currentDay}/{presence.totalDays} Journey
                  </p>
                )}
                {presence.type === "elder" && presence.totalDays && (
                  <p className="text-muted-foreground/70 text-[10px] font-display mt-0.5">
                    Completed {presence.totalDays} days · Still watches silently
                  </p>
                )}
                {presence.type === "future" && (
                  <p className="text-muted-foreground/70 text-[10px] font-display mt-0.5 italic">
                    "{presence.quote || "The path calls to you. Ready?"}"
                  </p>
                )}
                {presence.quote && presence.type === "active" && (
                  <motion.p
                    className="text-muted-foreground text-[10px] font-display italic mt-1"
                    style={{ fontFamily: "'Cormorant Garamond', 'DM Sans', serif" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    "{presence.quote}"
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {onBrowseMasters && (
        <button
          onClick={onBrowseMasters}
          className="w-full mt-3 py-2 rounded-xl bg-muted/30 border border-border/30 text-muted-foreground text-[10px] font-display tracking-wider hover:bg-muted/50 hover:text-foreground transition-all flex items-center justify-center gap-1"
        >
          Browse Other Masters
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
