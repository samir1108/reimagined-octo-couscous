/**
 * ConsciousOS Program Detail Page
 * ────────────────────────────
 * Shows program overview, phase timeline, and day-by-day breakdown.
 */

"use client";

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProgramBySlug, ALL_PROGRAMS } from "@/lib/programs/programs";
import { SessionPlayer } from "@/components/sessions/SessionPlayer";

const DOMAIN_COLORS: Record<string, string> = {
  attention: "amber",
  awareness: "indigo",
  will: "red",
  thinking: "cyan",
  emotion: "pink",
};

const PHASE_COLORS = [
  "from-blue-500/20 to-blue-500/5",
  "from-indigo-500/20 to-indigo-500/5",
  "from-purple-500/20 to-purple-500/5",
  "from-pink-500/20 to-pink-500/5",
  "from-amber-500/20 to-amber-500/5",
];

export function ProgramDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const program = getProgramBySlug(slug || "");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (!program) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-medium mb-2">Program not found</h2>
          <button
            onClick={() => navigate("/app/programs")}
            className="mt-4 px-6 py-2 bg-white text-black text-sm rounded-full hover:bg-white/90 transition-colors"
          >
            ← Back to Programs
          </button>
        </div>
      </div>
    );
  }

  if (selectedDay !== null) {
    return (
      <SessionPlayer
        programSlug={program.slug}
        day={selectedDay}
        onComplete={() => setSelectedDay(null)}
      />
    );
  }

  const domainColor = DOMAIN_COLORS[program.domain] || "gray";
  const phaseSlug = program.slug.split("_")[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/app/programs")}
            className="text-xs text-white/40 hover:text-white mb-4 transition-colors"
          >
            ← Programs
          </button>
          <div className="flex items-start gap-6">
            <div className="text-6xl">{program.icon}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-light mb-2">{program.label}</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                {program.longDescription}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs px-3 py-1 bg-white/5 rounded-full capitalize text-white/60">
                  {program.durationDays} days
                </span>
                <span className="text-xs px-3 py-1 bg-white/5 rounded-full capitalize text-white/60">
                  {program.domain}
                </span>
                <span className="text-xs px-3 py-1 bg-white/5 rounded-full capitalize text-white/60">
                  {program.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Phase timeline */}
      <section className="border-b border-white/5 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-6">
            Training Phases
          </h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5" />
            <div className="space-y-6">
              {program.phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`relative pl-20 pr-6 py-6 rounded-2xl bg-gradient-to-r ${PHASE_COLORS[idx] || PHASE_COLORS[0]} border border-white/5`}
                >
                  <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-white/20 border border-white/30" />
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium mb-1">{phase.label}</h3>
                      <p className="text-xs text-white/50 mb-3">{phase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.gameIds.slice(0, 3).map((gameId) => (
                          <span
                            key={gameId}
                            className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-white/40"
                          >
                            {gameId.replace("game_", "")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-white/30">
                      Days {phase.days[0]}–{phase.days[1]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Day grid */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-6">
            Day-by-Day
          </h2>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {Array.from({ length: program.durationDays }, (_, i) => i + 1).map((day) => {
              const phase = program.phases.find((p) => day >= p.days[0] && day <= p.days[1]);
              const phaseIdx = phase ? program.phases.indexOf(phase) : 0;
              const colorClass = PHASE_COLORS[phaseIdx]?.split(" ")[0] || PHASE_COLORS[0];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-lg bg-gradient-to-br ${colorClass} border border-white/5 hover:border-white/20 transition-all text-xs text-white/60 hover:text-white flex items-center justify-center`}
                  title={`Day ${day}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white/30 mt-4">Click a day to start training</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/5 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-6">
            Program Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Duration", value: `${program.durationDays} days` },
              { label: "Phases", value: program.phases.length },
              { label: "Capabilities", value: new Set(program.phases.flatMap((p) => p.capabilities)).size },
              { label: "Games", value: new Set(program.phases.flatMap((p) => p.gameIds)).size },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="text-2xl font-light text-white/80 mb-1">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
