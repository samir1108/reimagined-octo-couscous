/**
 * HomeAtmosphere — the sanctum's opening line.
 *
 * SATYUG seal + the gate of the day (Morning · Midday · Evening · Night),
 * its greeting, and its accent colour. Pure presentation over the existing
 * dailyGates system; the ambient sky behind it is drawn by AmbientBackground.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, MoonStar } from "lucide-react";
import { getCurrentGate, getGateDef, getGateGreeting, type GateId } from "@/lib/consciousness/dailyGates";
import { getCosmicWeather } from "@/lib/consciousness/cosmicWeather";

const EASE = [0.16, 1, 0.3, 1] as const;

const GATE_ICONS: Record<GateId, typeof Sun> = {
  morning: Sunrise,
  midday: Sun,
  evening: Sunset,
  night: MoonStar,
};

/** The four time-based atmospheres, named the way the product speaks them. */
const ATMOSPHERE_LABEL: Record<GateId, string> = {
  morning: "Morning",
  midday: "Day",
  evening: "Evening",
  night: "Night",
};

export default function HomeAtmosphere() {
  const [gate, setGate] = useState<GateId>(() => getCurrentGate(new Date().getHours()));

  // Keep the atmosphere honest across midnight returns and long sittings.
  useEffect(() => {
    const tick = () => setGate(getCurrentGate(new Date().getHours()));
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const gateDef = getGateDef(gate);
  const Glyph = GATE_ICONS[gate];
  const greeting = getGateGreeting(gate, 0);
  const cosmic = getCosmicWeather();

  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-full text-center"
    >
{/* The open gate — label, glyph, accent */}
      <div className="mt-2.5 flex items-center justify-center gap-2">
        <Glyph
          className="h-3.5 w-3.5"
          style={{ color: `hsl(${gateDef.accentColor})` }}
          aria-hidden
        />
        <p
          className="text-[9px] font-display tracking-[0.3em] uppercase"
          style={{ color: `hsl(${gateDef.accentColor} / 0.85)` }}
        >
          {ATMOSPHERE_LABEL[gate]} · {gateDef.theme}
        </p>
      </div>

      <h1 className="mt-2 text-[15px] font-display font-light leading-snug text-foreground/75">
        {greeting}
      </h1>

      {/* The sky's quiet context — moon phase and season, one hairline line */}
      <p className="mt-1.5 text-[10px] font-display tracking-[0.14em] uppercase text-muted-foreground/40">
        {cosmic.moonPhase} · {cosmic.season} — {cosmic.moonNudge}
      </p>
    </motion.header>
  );
}
