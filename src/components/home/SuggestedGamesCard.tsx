/**
 * SuggestedGamesCard — engine-driven game suggestions on Home.
 * Collapsed: a slim "Games for you today" pill.
 * Expanded: a card listing all suggested games with Play CTAs.
 *
 * Hidden gracefully if the engine has no signals yet.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gamepad2, ChevronDown, Play } from "lucide-react";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { recommendGames } from "@/lib/recommendGames";
import { FACULTY_LABEL } from "@/games/shell/labRegistry";

export default function SuggestedGamesCard() {
  const { data: engine } = useConsciousnessEngine();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const profile = engine?.profile;
  const plan = engine?.plan;

  const games = useMemo(() => {
    return recommendGames({
      dimensionBands: plan?.dimensionBands ?? profile?.dimension_bands,
      witnessGap: plan?.witnessGap ?? profile?.witness_gap,
      bypassingRisk: plan?.bypassingRisk ?? profile?.bypassing_risk,
      dominantPath: plan?.dominantPath ?? profile?.dominant_path,
    }, 3);
  }, [plan, profile]);

  // Engine-gated: only surface games when there is a real reason today.
  // Reasons: a low dimension band, meaningful witness gap / bypassing risk,
  // or a deterministic ~1-in-3 daily rotation so it doesn't feel constant.
  const shouldShow = useMemo(() => {
    if (!games.length) return false;
    const bands = (plan?.dimensionBands ?? profile?.dimension_bands ?? {}) as Record<string, number>;
    const hasLowBand = Object.values(bands).some((b) => typeof b === "number" && b <= 3);
    const wGap = (plan?.witnessGap ?? profile?.witness_gap ?? 0) as number;
    const bRisk = (plan?.bypassingRisk ?? profile?.bypassing_risk ?? 0) as number;
    const signalDriven = hasLowBand || wGap >= 0.5 || bRisk >= 0.5;
    // Daily rotation salt — show ~33% of days even without strong signal.
    const day = Math.floor(Date.now() / 86400000);
    const rotation = day % 3 === 0;
    return signalDriven || rotation;
  }, [games, plan, profile]);

  if (!shouldShow) return null;

  const lead = games[0];

  return (
    <div className="w-full max-w-md mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass-subtle border border-border/30 hover:border-primary/40 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/70">
              Games for you today
            </div>
            <div className="text-sm font-display text-foreground/90 truncate">
              {games.length} picked · {lead.name}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-border/30 bg-background/40 backdrop-blur-md p-3 space-y-2">
              {games.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display text-foreground/90 truncate">
                      {g.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {g.oneLine}
                    </div>
                    <div className="text-[10px] text-primary/70 font-display tracking-wider uppercase mt-0.5 truncate">
                      {g.faculties.slice(0, 2).map((f) => FACULTY_LABEL[f]).join(" · ")}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/app/games?focus=${g.id}`)}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-display"
                  >
                    <Play className="w-3 h-3 fill-current" /> Play
                  </button>
                </div>
              ))}
              <button
                onClick={() => navigate("/app/games")}
                className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-1.5 font-display tracking-wider uppercase"
              >
                Browse all games →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
