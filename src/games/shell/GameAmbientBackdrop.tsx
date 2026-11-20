// Universal ambient backdrop for every game.
// Replaces "plain black screen" with a faculty-tinted painterly field:
// - radial gradient base
// - drifting blobs (CSS keyframes — cheap, runs on every device)
// - faint particle dust via SVG <circle> grid
// Use as the bottom layer of any game's intro / play phase. Zero interaction.

import { useMemo } from "react";

type Tone =
  | "attention" | "body" | "witness" | "ego" | "heart"
  | "self_inquiry" | "willpower" | "stillness" | "voice"
  | "brain_head" | "brain_heart" | "brain_gut" | "karma" | "liminal"
  | "default";

const PALETTE: Record<Tone, { a: string; b: string; c: string }> = {
  attention:    { a: "#1e293b", b: "#0ea5e9", c: "#fde68a" },
  body:         { a: "#1c1917", b: "#dc2626", c: "#fbbf24" },
  witness:      { a: "#000000", b: "#475569", c: "#e5e7eb" },
  ego:          { a: "#1e1b4b", b: "#7c3aed", c: "#f472b6" },
  heart:        { a: "#3f0d18", b: "#e11d48", c: "#fbcfe8" },
  self_inquiry: { a: "#0c1322", b: "#6366f1", c: "#a5b4fc" },
  willpower:    { a: "#1a0a0a", b: "#b91c1c", c: "#fbbf24" },
  stillness:    { a: "#000000", b: "#1e293b", c: "#94a3b8" },
  voice:        { a: "#1e1b18", b: "#ea580c", c: "#fde68a" },
  brain_head:   { a: "#0a0f1c", b: "#3b82f6", c: "#bae6fd" },
  brain_heart:  { a: "#1f0a14", b: "#f43f5e", c: "#fda4af" },
  brain_gut:    { a: "#1c1208", b: "#d97706", c: "#fde68a" },
  karma:        { a: "#0d1410", b: "#16a34a", c: "#fde68a" },
  liminal:      { a: "#050510", b: "#312e81", c: "#c4b5fd" },
  default:      { a: "#000000", b: "#1f2937", c: "#fbbf24" },
};

export interface GameAmbientBackdropProps {
  tone?: Tone;
  intensity?: "low" | "med" | "high";
  className?: string;
}

export default function GameAmbientBackdrop({
  tone = "default",
  intensity = "med",
  className = "",
}: GameAmbientBackdropProps) {
  const p = PALETTE[tone] ?? PALETTE.default;
  const blobOpacity = intensity === "low" ? 0.18 : intensity === "high" ? 0.5 : 0.32;

  const dust = useMemo(() => {
    const dots: Array<{ cx: number; cy: number; r: number; o: number; d: number }> = [];
    for (let i = 0; i < 60; i++) {
      dots.push({
        cx: Math.random() * 100,
        cy: Math.random() * 100,
        r: 0.15 + Math.random() * 0.55,
        o: 0.15 + Math.random() * 0.45,
        d: 6 + Math.random() * 10,
      });
    }
    return dots;
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {/* base radial */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${p.a} 0%, #000 90%)`,
        }}
      />
      {/* drifting blobs */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[70vmax] h-[70vmax] rounded-full blur-3xl ambient-drift-1"
        style={{ background: p.b, opacity: blobOpacity }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[60vmax] h-[60vmax] rounded-full blur-3xl ambient-drift-2"
        style={{ background: p.c, opacity: blobOpacity * 0.7 }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[40vmax] h-[40vmax] rounded-full blur-3xl ambient-drift-3"
        style={{ background: p.b, opacity: blobOpacity * 0.5 }}
      />

      {/* particle dust */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {dust.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={p.c}
            opacity={d.o}
            style={{
              animation: `ambient-twinkle ${d.d}s ease-in-out ${(i % 7) * 0.4}s infinite`,
            }}
          />
        ))}
      </svg>

      {/* vignette + film grain feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      <style>{`
        @keyframes ambient-drift-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(6vw,4vh) scale(1.08); }
        }
        @keyframes ambient-drift-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-5vw,-3vh) scale(1.12); }
        }
        @keyframes ambient-drift-3 {
          0%,100% { transform: translate(0,0) scale(0.95); }
          50%     { transform: translate(3vw,-5vh) scale(1.05); }
        }
        @keyframes ambient-twinkle {
          0%,100% { opacity: 0.15; }
          50%     { opacity: 0.85; }
        }
        .ambient-drift-1 { animation: ambient-drift-1 22s ease-in-out infinite; will-change: transform; }
        .ambient-drift-2 { animation: ambient-drift-2 28s ease-in-out infinite; will-change: transform; }
        .ambient-drift-3 { animation: ambient-drift-3 18s ease-in-out infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .ambient-drift-1,.ambient-drift-2,.ambient-drift-3 { animation: none; }
        }
      `}</style>
    </div>
  );
}

/** Map a faculty list (or single faculty) to a Tone for the backdrop. */
export function faceToTone(faculties?: string[] | string): Tone {
  if (!faculties) return "default";
  const f = Array.isArray(faculties) ? faculties[0] : faculties;
  const known: Tone[] = [
    "attention","body","witness","ego","heart","self_inquiry","willpower",
    "stillness","voice","brain_head","brain_heart","brain_gut","karma","liminal",
  ];
  return (known as string[]).includes(f) ? (f as Tone) : "default";
}
