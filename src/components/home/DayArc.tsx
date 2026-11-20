"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import { getCurrentGateForSchedule, type GateId } from "@/lib/consciousness/dailyGates";

const GATES = [
  { id: "morning", label: "Awakening", hint: "Arrive in the day", Icon: Sunrise },
  { id: "midday", label: "Presence", hint: "Meet the moment", Icon: Sun },
  { id: "evening", label: "Integration", hint: "Gather what the day held", Icon: Sunset },
  { id: "night", label: "Sanctuary", hint: "Let the day settle", Icon: Moon },
] as const;

interface DayArcProps {
  currentGate: GateId;
  wakeTime?: string | null;
  sleepTime?: string | null;
  onEnterGate: (gate: GateId) => void;
}

export default function DayArc({ currentGate, wakeTime, sleepTime, onEnterGate }: DayArcProps) {
  const reducedMotion = useReducedMotion();
  const { data: gateRecord } = useDailyGates();
  const now = new Date();

  return (
    <section aria-labelledby="day-arc-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#D6B36A]/65">A rhythm, not a checklist</p>
          <h2 id="day-arc-title" className="mt-1.5 text-2xl font-light tracking-wide text-[#E9E2D3] sm:text-3xl" style={{ fontFamily: "var(--font-editorial)" }}>The day, in four moments</h2>
        </div>
        <p className="mb-5 text-[10px] text-[#98958B]/60">Enter any gate when it feels right</p>
      </div>

      <div className="relative">
        {/* Curved pathway SVG - responsive, organic curve */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-0 h-14 w-full overflow-visible max-sm:hidden"
        >
          <defs>
            <linearGradient id="day-arc-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop stopColor="#D6B36A" stopOpacity=".15" />
              <stop offset=".5" stopColor="#D6B36A" stopOpacity=".55" />
              <stop offset="1" stopColor="#D6B36A" stopOpacity=".15" />
            </linearGradient>
          </defs>
          <path
            d="M 60 50 C 200 10, 300 10, 420 50 S 650 90, 880 50"
            fill="none"
            stroke="url(#day-arc-gradient)"
            strokeWidth="1.5"
            strokeDasharray="3 7"
            className="motion-safe:transition-all motion-safe:duration-1000"
          />
          {/* Subtle glow along the path */}
          <path
            d="M 60 50 C 200 10, 300 10, 420 50 S 650 90, 880 50"
            fill="none"
            stroke="#D6B36A"
            strokeOpacity="0.04"
            strokeWidth="3"
          />
        </svg>

        {/* Gate nodes */}
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-1">
          {GATES.map(({ id, label, hint, Icon }) => {
            const isCurrent = currentGate === id;
            const isComplete = gateRecord?.[`${id}_done`] === true;
            const isUpcoming = GATES.findIndex(g => g.id === id) > GATES.findIndex(g => g.id === currentGate);
            const isMissed = !isComplete && GATES.findIndex(g => g.id === id) < GATES.findIndex(g => g.id === currentGate);

            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => onEnterGate(id as GateId)}
                aria-label={`Enter ${label} gate`}
                aria-current={isCurrent ? "step" : undefined}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: reducedMotion ? 0 : GATES.findIndex(g => g.id === id) * 0.08 }}
                className={`group relative rounded-2xl px-3 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B36A] sm:px-4 ${
                  isCurrent ? "bg-[#141714]/75 ring-1 ring-[#D6B36A]/20" :
                  isComplete ? "hover:bg-[#141714]/45" :
                  isUpcoming ? "hover:bg-[#141714]/35" :
                  "hover:bg-[#141714]/30 opacity-70"
                }`}
              >
                {/* Node indicator with organic glow */}
                <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full bg-[#0D100E] transition ${
                  isCurrent
                    ? "border-2 border-[#D6B36A]/60 text-[#F4D99A] shadow-[0_0_24px_rgba(214,179,106,.15)]"
                    : isComplete
                      ? "border border-[#D6B36A]/40 text-[#D6B36A]/80"
                      : isUpcoming
                        ? "border border-[#D6B36A]/20 text-[#D6B36A]/65"
                        : "border border-white/[0.06] text-[#98958B]/50"
                }`}>
                  {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-full border border-[#D6B36A]/30 animate-ping motion-reduce:animate-none" aria-hidden="true" />
                  )}
                </span>
                <span className={`mt-3 block text-[9px] font-medium uppercase tracking-[0.18em] ${
                  isCurrent ? "text-[#F4D99A]" :
                  isComplete ? "text-[#E9E2D3]/80" :
                  isUpcoming ? "text-[#E9E2D3]/65" :
                  "text-[#98958B]/50"
                }`}>{label}</span>
                <span className="mt-1 block text-[10px] leading-relaxed text-[#98958B]/65">{hint}</span>
                <span className="mt-2 block text-[9px] text-[#D6B36A]/55">
                  {isComplete ? "Completed" : isCurrent ? "Now" : isUpcoming ? "Upcoming" : "Missed"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}