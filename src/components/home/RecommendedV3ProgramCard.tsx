/**
 * RecommendedV3ProgramCard
 * ─────────────────────────
 * Surfaces the best-matching V3 program from the new 42-program library
 * based on the user's current journey signals.
 *
 * Silent when no match scores > 0 — never noisy on Home.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/design-system";
import { Badge } from "@/design-system";
import { Button } from "@/design-system";
import { topV3Program, type JourneyMetrics } from "@/lib/programs/recommender";
import { getCurrentTimeSlot } from "@/lib/timeSlots";

interface Props {
  /** Pass whatever metrics Home already knows. All optional. */
  metrics?: Omit<JourneyMetrics, "timeOfDay">;
}

export default function RecommendedV3ProgramCard({ metrics }: Props) {
  const navigate = useNavigate();

  const rec = useMemo(() => {
    return topV3Program({ ...metrics, timeOfDay: getCurrentTimeSlot() });
  }, [metrics]);

  if (!rec) return null;
  const { program, reasons } = rec;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-lg">
            {program.icon || "🪷"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80">
                Suggested program
              </span>
              <Sparkles className="h-3 w-3 text-primary/60" />
            </div>
            <div className="font-semibold truncate">{program.title}</div>
            <div className="text-sm text-muted-foreground truncate">{program.subtitle}</div>
            {reasons.length > 0 && (
              <div className="text-xs text-muted-foreground/80 mt-1 italic truncate">
                {reasons.slice(0, 2).join(" · ")}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {program.totalSessions} sessions
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {program.difficulty}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => navigate("/app/programs-v3")}
            data-no-doubletap
          >
            Open
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
