/**
 * DesktopHomeRails — desktop-only side rails (lg+).
 *
 * Glanceable cards that act like a personal mirror — each one is a different
 * signal from the consciousness engine, NOT a re-statement of what the center
 * of Home already shows. The center owns: theme name, mission, orb.
 * The rails own: progress, state, patterns.
 *
 *   LEFT  (You today):    Streak · Band · Witness
 *   RIGHT (Mirror):       Active loop · Center · Rhythm
 *
 * Tap a card → routes to the matching analytics layer so the user can go
 * deeper. Mobile: returns null.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, Eye, Target, Activity, Brain } from "lucide-react";
import RhythmIcon from "@/components/personalization/RhythmIcon";
import { getLoopName } from "@/lib/onboarding/getLoopName";

interface RailProps {
  side: "left" | "right";
  children: React.ReactNode;
}

function Rail({ side, children }: RailProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-20 flex-col gap-4 w-[220px] ${
        side === "left" ? "left-8" : "right-8"
      }`}
    >
      {children}
    </motion.aside>
  );
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  /** 0..1 — renders a thin progress line under the value */
  progress?: number;
  onClick?: () => void;
}

function PresenceCard({ icon, label, value, hint, progress, onClick }: CardProps) {
  const Comp = (onClick ? "button" : "div") as React.ElementType;
  return (
    <Comp
      onClick={onClick}
      className={`text-left w-full pointer-events-auto rounded-2xl border border-border/30 bg-background/30 backdrop-blur-md px-4 py-3 transition-colors ${
        onClick ? "hover:border-primary/40 hover:bg-background/40 cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-muted-foreground/70">{icon}</div>
        <div className="text-[9px] font-display tracking-[0.25em] uppercase text-muted-foreground/60">
          {label}
        </div>
      </div>
      <div className="text-base font-display font-medium text-foreground/90 leading-tight truncate">
        {value}
      </div>
      {typeof progress === "number" && (
        <div className="mt-1.5 h-[2px] w-full rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-primary/50"
          />
        </div>
      )}
      {hint && (
        <div className="text-[10px] text-muted-foreground/50 mt-1 leading-snug truncate">
          {hint}
        </div>
      )}
    </Comp>
  );
}

const BAND_NAMES: Record<number, string> = {
  0: "Sleeper", 1: "Questioner", 2: "Observer", 3: "Alchemist",
  4: "Navigator", 5: "Architect", 6: "Channel",
};

const WITNESS_LABEL: Record<number, string> = {
  0: "Pre-witness", 1: "Glimmers", 2: "Emerging",
  3: "Steady", 4: "Sustained", 5: "Pervasive",
};

interface DesktopHomeRailsProps {
  streak?: number;
  journeyDay?: number;
  totalSessions?: number;
  guruName?: string;
  /** Full engine profile — gives band, witness, loops, h/h/g */
  profile?: {
    overall_band?: number;
    witness_depth?: number;
    active_loops?: string[];
    assessment_data?: {
      headHeartGut?: { head?: number; heart?: number; gut?: number };
    } | null;
    streak_current?: number;
    streak_longest?: number;
    total_sessions?: number;
    total_journal_entries?: number;
    journey_day?: number;
  } | null;
  userId?: string;
}

export default function DesktopHomeRails({
  streak,
  journeyDay,
  totalSessions,
  profile,
  userId,
}: DesktopHomeRailsProps) {
  const navigate = useNavigate();

  // ── Resolve mirror values from the engine profile ──────────────────────
  const band = typeof profile?.overall_band === "number" ? profile!.overall_band! : null;
  const bandName = band !== null ? (BAND_NAMES[Math.round(band)] ?? "Awakening") : "Calibrating";
  const bandValue = band !== null ? band.toFixed(1) : "—";
  const bandProgress = band !== null ? band - Math.floor(band) : 0;

  const witness = typeof profile?.witness_depth === "number" ? Math.round(profile!.witness_depth!) : null;
  const witnessValue = witness !== null ? `Level ${witness}` : "Not set";
  const witnessHint = witness !== null ? (WITNESS_LABEL[Math.min(5, witness)] ?? "Emerging") : "Begin to map";
  const witnessProgress = witness !== null ? Math.min(1, witness / 5) : 0;

  const loopIds = profile?.active_loops ?? [];
  const loopValue = loopIds.length ? getLoopName(loopIds[0]) : "Quiet";
  const loopHint = loopIds.length
    ? `${loopIds.length} alive now${loopIds.length > 1 ? ` · ${getLoopName(loopIds[1])}` : ""}`
    : "No loop active";

  const streakDays = streak && streak > 0 ? streak : 0;
  const streakBest = typeof profile?.streak_longest === "number" ? profile.streak_longest : null;
  const sessions = totalSessions ?? profile?.total_sessions ?? 0;
  const journalCount = profile?.total_journal_entries ?? 0;

  // headHeartGut comes from elder reading → assessment_data
  const hhg = profile?.assessment_data?.headHeartGut ?? null;
  let centerValue = "—";
  let centerHint = "Map yourself";
  let centerProgress = 0;
  if (hhg && (hhg.head || hhg.heart || hhg.gut)) {
    const total = (hhg.head || 0) + (hhg.heart || 0) + (hhg.gut || 0) || 1;
    const parts: Array<{ k: string; v: number }> = [
      { k: "Head", v: hhg.head || 0 },
      { k: "Heart", v: hhg.heart || 0 },
      { k: "Gut", v: hhg.gut || 0 },
    ];
    parts.sort((a, b) => b.v - a.v);
    centerValue = `${parts[0].k} ${Math.round((parts[0].v / total) * 100)}%`;
    centerHint = `${parts[1].k} · ${parts[2].k} below`;
    centerProgress = parts[0].v / total;
  }

  return (
    <>
      {/* LEFT — YOU TODAY: progress + state */}
      <Rail side="left">
        <PresenceCard
          icon={<Flame className="w-3.5 h-3.5" />}
          label="Streak"
          value={streakDays > 0 ? `${streakDays} ${streakDays === 1 ? "day" : "days"}` : "Begin today"}
          progress={streakBest && streakBest > 0 ? Math.min(1, streakDays / streakBest) : streakDays > 0 ? 0.15 : 0}
          hint={
            streakDays > 0
              ? `${sessions} sessions · Day ${journeyDay ?? profile?.journey_day ?? 1}${streakBest ? ` · best ${streakBest}` : ""}`
              : "Tap the orb to begin"
          }
        />
        <PresenceCard
          icon={<Target className="w-3.5 h-3.5" />}
          label="Band"
          value={bandValue}
          progress={bandProgress}
          hint={band !== null ? `${bandName} · ${Math.round(bandProgress * 100)}% to next` : bandName}
          onClick={() => navigate("/app/analytics")}
        />
        <PresenceCard
          icon={<Eye className="w-3.5 h-3.5" />}
          label="Witness"
          value={witnessValue}
          progress={witnessProgress}
          hint={`${witnessHint}${journalCount > 0 ? ` · ${journalCount} notes` : ""}`}
          onClick={() => navigate("/app/analytics")}
        />
      </Rail>

      {/* RIGHT — MIRROR: what the engine sees in you right now */}
      <Rail side="right">
        <PresenceCard
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Active loop"
          value={loopValue}
          hint={loopHint}
          onClick={() => navigate("/app/analytics")}
        />
        <PresenceCard
          icon={<Brain className="w-3.5 h-3.5" />}
          label="Center"
          value={centerValue}
          progress={centerProgress}
          hint={centerHint}
          onClick={() => navigate("/app/analytics")}
        />
        {/* Rhythm — kundli-aware time-of-day card. Tap to expand. */}
        <RhythmIcon userId={userId} variant="card" />
      </Rail>
    </>
  );
}
