import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/design-system";
import { Flame, Play } from "lucide-react";
import { FLAGSHIP_GAMES, isFlagshipGame, FACULTY_LABEL, type Faculty } from "@/games/shell/labRegistry";
import { coverFor } from "@/games/shell/facultyCovers";
import { getHeroImage } from "@/games/shell/heroImages";
import { getGameVideo } from "@/games/shell/gameVideos";
import { GameMotifConstellation } from "@/components/library/GameMotifConstellation";
import type { ConsciousnessProfile } from "@/hooks/useConsciousnessEngine";

export default function GamesTab({ profile }: { profile?: ConsciousnessProfile }) {
  const navigate = useNavigate();
  const [gameFilter, setGameFilter] = useState<Faculty | "all">("all");

  const available = FLAGSHIP_GAMES;
  const facultyCounts = new Map<Faculty, number>();
  available.forEach((g) => g.faculties.forEach((f) => facultyCounts.set(f, (facultyCounts.get(f) || 0) + 1)));
  const order: Faculty[] = ["self_inquiry", "witness", "attention", "ego", "heart", "body", "stillness", "willpower", "voice", "brain_head", "brain_heart", "brain_gut", "karma", "liminal"];
  const facultyOptions = order.filter((f) => facultyCounts.has(f));
  const filtered = gameFilter === "all" ? available : available.filter((g) => g.faculties.includes(gameFilter));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center mb-3 px-4">
        Micro-practices the engine can hand you anytime. Faculties trained shown below each.
      </p>

      <GameMotifConstellation profile={profile} />

      <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide mb-2">
        <div className="flex gap-2 pb-1 w-max">
          <button
            onClick={() => setGameFilter("all")}
            className={`text-[11px] px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
              gameFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            All ({available.length})
          </button>
          {facultyOptions.map((f) => (
            <button
              key={f}
              onClick={() => setGameFilter(f)}
              className={`text-[11px] px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                gameFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {FACULTY_LABEL[f as keyof typeof FACULTY_LABEL]} ({facultyCounts.get(f)})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">No practices in this category yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((g, i) => {
          const cover = getHeroImage(g.id) || coverFor(g.faculties);
          const video = getGameVideo(g.id);
          const isFlagship = isFlagshipGame(g.id);
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(`/app/games/${g.id}`)}
              className="w-full text-left group"
            >
              <Card className={`overflow-hidden hover:border-primary/50 transition-all duration-300 ${isFlagship ? "border-amber-500/30" : ""}`}>
                <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
                  {video ? (
                    <video
                      src={video}
                      poster={cover}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <img
                      src={cover}
                      alt={g.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  {isFlagship && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-100 bg-amber-500/25 backdrop-blur px-2 py-0.5 rounded-full border border-amber-400/40">
                      <Flame className="w-2.5 h-2.5" /> Flagship
                    </div>
                  )}
                  <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider text-white/85 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full border border-white/15">
                    Tier {g.tier}
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <Play className="w-3.5 h-3.5 text-primary-foreground fill-current ml-0.5" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-display text-sm font-semibold truncate group-hover:text-primary transition-colors">{g.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2 leading-snug">{g.oneLine}</p>
                  <div className="flex flex-wrap gap-1">
                    {g.faculties.slice(0, 3).map((f) => (
                      <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                        {FACULTY_LABEL[f]}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
