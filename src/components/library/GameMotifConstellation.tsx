import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ConsciousnessProfile } from "@/hooks/useConsciousnessEngine";
import { FLAGSHIP_GAMES, type Faculty, type LabGame } from "@/games/shell/labRegistry";
import { DIMENSIONS } from "@/lib/library/practiceDimensions";

const MOTIFS: Array<{
  id: string;
  shape: "pulse" | "scan" | "witness" | "mirrors" | "coherence" | "orbit";
}> = [
  { id: "slow-tap", shape: "pulse" },
  { id: "body-scanner", shape: "scan" },
  { id: "witness-room", shape: "witness" },
  { id: "two-mirrors", shape: "mirrors" },
  { id: "heart-coherence-bridge", shape: "coherence" },
  { id: "mirror-realm", shape: "orbit" },
];

const DIMENSION_FACULTIES: Record<string, Faculty[]> = {
  thought: ["self_inquiry", "attention"],
  emotion: ["heart", "brain_heart"],
  body: ["body", "brain_gut"],
  awareness: ["witness", "stillness"],
};

interface Props {
  profile?: ConsciousnessProfile;
}

function Motif({ shape }: { shape: (typeof MOTIFS)[number]["shape"] }) {
  const gold = "hsl(var(--primary))";
  const muted = "hsl(var(--border))";

  if (shape === "pulse" || shape === "coherence") {
    return (
      <svg viewBox="0 0 120 52" className="h-12 w-full" aria-hidden="true">
        <path d="M5 27H30L39 13L50 40L61 21L69 27H115" fill="none" stroke={shape === "pulse" ? gold : muted} strokeWidth="1.5" />
        {shape === "coherence" && <path d="M5 27Q20 9 35 27T65 27T95 27T115 27" fill="none" stroke={gold} strokeWidth="1.5" />}
      </svg>
    );
  }
  if (shape === "scan") {
    return (
      <svg viewBox="0 0 120 52" className="h-12 w-full" aria-hidden="true">
        <circle cx="60" cy="12" r="5" fill="none" stroke={gold} />
        <path d="M60 18V38M46 26H74M49 38L44 48M71 38L76 48" fill="none" stroke={muted} />
        <path d="M39 26H81" stroke={gold} strokeDasharray="3 3" />
      </svg>
    );
  }
  if (shape === "witness") {
    return (
      <svg viewBox="0 0 120 52" className="h-12 w-full" aria-hidden="true">
        <path d="M18 26Q60 -2 102 26Q60 54 18 26Z" fill="none" stroke={gold} />
        <circle cx="60" cy="26" r="8" fill="none" stroke={muted} />
        <circle cx="60" cy="26" r="3" fill={gold} />
      </svg>
    );
  }
  if (shape === "mirrors") {
    return (
      <svg viewBox="0 0 120 52" className="h-12 w-full" aria-hidden="true">
        <circle cx="48" cy="26" r="15" fill="none" stroke={gold} />
        <circle cx="72" cy="26" r="15" fill="none" stroke="hsl(var(--secondary))" />
        <circle cx="60" cy="26" r="2.5" fill={gold} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 52" className="h-12 w-full" aria-hidden="true">
      {[0, 1, 2].map((ring) => (
        <circle
          key={ring}
          cx="60"
          cy="26"
          r={8 + ring * 9}
          fill="none"
          stroke={ring === 0 ? gold : muted}
          strokeDasharray={ring === 2 ? "2 4" : undefined}
        />
      ))}
      <circle cx="60" cy="26" r="3" fill={gold} />
    </svg>
  );
}

function gameTitle(game: LabGame | undefined, id: string): string {
  return game?.name ?? id.replace(/-/g, " ");
}

export function GameMotifConstellation({ profile }: Props) {
  const navigate = useNavigate();
  const games = useMemo(
    () => MOTIFS.flatMap((motif) => {
      const game = FLAGSHIP_GAMES.find((candidate) => candidate.id === motif.id);
      return game ? [{ ...motif, game }] : [];
    }),
    [],
  );
  if (games.length === 0) return null;

  const bands = profile?.dimension_bands;
  const lowestDimension = bands
    ? DIMENSIONS.reduce((current, dimension) => {
        const curVal = bands[current.key] ?? 0;
        const nextVal = bands[dimension.key] ?? 0;
        return nextVal < curVal ? dimension : current;
      }, DIMENSIONS[0])
    : null;
  const recommendedFaculties = lowestDimension
    ? (DIMENSION_FACULTIES[lowestDimension.key] || [])
    : [];

  return (
    <section className="glass-card rounded-2xl border border-primary/15 p-4" aria-labelledby="game-motif-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="game-motif-title" className="text-sm font-display font-semibold text-foreground">
            Practice, made visible
          </h2>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Six playable practices, shown as the faculties they train.
          </p>
        </div>
        {lowestDimension && (
          <span className="shrink-0 rounded-full border border-primary/20 px-2.5 py-1 text-[9px] text-primary">
            Your focus · {lowestDimension.label}
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {games.map(({ game, shape }) => {
          const recommended = game.faculties.some((faculty) => recommendedFaculties.includes(faculty));
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => navigate(`/app/games/${game.id}`)}
              className={`rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                recommended
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/35 bg-background/20 hover:border-primary/25"
              }`}
            >
              <Motif shape={shape} />
              <span className="mt-1 block truncate text-[10px] font-medium text-foreground">{gameTitle(game, game.id)}</span>
              <span className="mt-0.5 block text-[9px] text-muted-foreground">
                {recommended ? "Matched to your current focus" : game.faculties.slice(0, 2).join(" · ")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
