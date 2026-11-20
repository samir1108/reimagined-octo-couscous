/**
 * ConsciousOS Games Page
 * ──────────────────
 * Lists all available training games with category filters.
 */

"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES, type GameDefinition } from "@/lib/games/games";
import { getGamesByCategory } from "@/lib/capabilityMap";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "attention", label: "Attention" },
  { id: "body", label: "Body" },
  { id: "emotion", label: "Emotion" },
  { id: "thought", label: "Thought" },
  { id: "decision", label: "Decision" },
  { id: "will", label: "Will" },
];

const DIFFICULTY_COLORS = {
  1: "text-green-400",
  2: "text-emerald-400",
  3: "text-amber-400",
  4: "text-orange-400",
  5: "text-red-400",
};

export default function GamesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const games = useMemo(() => {
    let filtered = category === "all" ? Object.values(GAMES) : getGamesByCategory(category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.label.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [category, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-light mb-2">Games</h1>
          <p className="text-white/50 text-sm">
            Cognitive training exercises. Play them standalone or as part of a program.
          </p>
        </div>
      </header>

      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  category === cat.id
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {games.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              No games found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} onClick={() => navigate(`/app/games/${game.id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GameCard({ game, onClick }: { game: GameDefinition; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{game.icon}</div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < game.difficulty ? `${DIFFICULTY_COLORS[game.difficulty as keyof typeof DIFFICULTY_COLORS]} bg-current` : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="text-base font-medium mb-1 group-hover:text-amber-400 transition-colors">
        {game.label}
      </h3>
      <p className="text-white/50 text-xs mb-4 line-clamp-2">{game.description}</p>

      <div className="flex items-center justify-between text-xs text-white/40">
        <span className="capitalize">{game.durationSec}s</span>
        <span className="capitalize">{game.inputType}</span>
        <span className="capitalize">{game.category}</span>
      </div>
    </button>
  );
}
