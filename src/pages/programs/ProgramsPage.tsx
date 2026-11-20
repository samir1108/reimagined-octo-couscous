/**
 * ConsciousOS Programs Page
 * ─────────────────────
 * Lists all available programs with progress indicators.
 */

"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_PROGRAMS, type ProgramDefinition } from "@/lib/programs/programs";
import { getProgramsByDomain } from "@/lib/capabilityMap";

const DIFFICULTY_COLORS = {
  beginner: "text-green-400 bg-green-400/10",
  intermediate: "text-amber-400 bg-amber-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

const DOMAIN_COLORS: Record<string, string> = {
  attention: "amber",
  awareness: "indigo",
  will: "red",
  thinking: "cyan",
  emotion: "pink",
};

export function ProgramsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const programs =
    filter === "all"
      ? ALL_PROGRAMS
      : getProgramsByDomain(filter);

  const filtered = programs.filter((p) =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-light mb-2">Programs</h1>
          <p className="text-white/50 text-sm">
            Structured training journeys spanning multiple days.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
          <div className="flex gap-2">
            {["all", "attention", "awareness", "will", "thinking", "emotion"].map((domain) => (
              <button
                key={domain}
                onClick={() => setFilter(domain)}
                className={`px-3 py-1.5 text-xs rounded-full capitalize transition-colors ${
                  filter === domain
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {domain === "all" ? "All" : domain}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Programs grid */}
      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              No programs found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((program) => (
                <ProgramCard key={program.id} program={program} onClick={() => navigate(`/app/programs/${program.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Program card ────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  onClick,
}: {
  program: ProgramDefinition;
  onClick: () => void;
}) {
  const domainColor = DOMAIN_COLORS[program.domain] || "gray";

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{program.icon}</div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
            DIFFICULTY_COLORS[program.difficulty]
          }`}
        >
          {program.difficulty}
        </span>
      </div>

      <h3 className="text-lg font-medium mb-1 group-hover:text-amber-400 transition-colors">
        {program.label}
      </h3>

      <p className="text-white/50 text-sm mb-4 line-clamp-2">
        {program.description}
      </p>

      <div className="flex items-center justify-between text-xs text-white/40">
        <span className="capitalize">{program.durationDays} days</span>
        <span className="capitalize">{program.domain}</span>
        <span>{program.phases.length} phases</span>
      </div>

      {/* Phase dots */}
      <div className="mt-4 flex gap-1">
        {program.phases.map((phase) => (
          <div
            key={phase.id}
            className="flex-1 h-1 rounded-full bg-white/10"
            title={phase.label}
          />
        ))}
      </div>

      <div className="mt-3 text-xs text-amber-400/70 group-hover:text-amber-400 transition-colors">
        {program.tagline} →
      </div>
    </button>
  );
}
