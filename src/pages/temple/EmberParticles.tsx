import { useMemo } from "react";

/**
 * Drifting amber embers — pure CSS keyframes, no canvas, ~40 nodes.
 * Deterministic via useMemo so SSR/CSR match.
 */
export default function EmberParticles({ count = 40 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        dur: Math.random() * 14 + 14,
        delay: Math.random() * 12,
        drift: (Math.random() - 0.5) * 80,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-[-20px] rounded-full bg-amber-300"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            opacity: 0,
            filter: "blur(0.4px)",
            boxShadow: "0 0 8px hsl(38 95% 60% / .8)",
            animation: `temple-ember ${e.dur}s ${e.delay}s linear infinite`,
            // @ts-expect-error css var
            "--drift": `${e.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes temple-ember {
          0%   { transform: translateY(0) translateX(0); opacity: 0 }
          10%  { opacity: .8 }
          90%  { opacity: .6 }
          100% { transform: translateY(-110vh) translateX(var(--drift)); opacity: 0 }
        }
      `}</style>
    </div>
  );
}
