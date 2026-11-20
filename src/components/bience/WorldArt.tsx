import type { BienceWorld } from "@/lib/bience/model";
import { hsla } from "@/lib/bience/visuals";

const rainLines =
  "repeating-linear-gradient(104deg, transparent 0 14px, rgba(255,255,255,0.10) 14px 15px, transparent 15px 30px)";

function motifLayers(world: BienceWorld): { background: string; opacity?: number; blend?: string }[] {
  const [dark, mid, accent, glow] = world.palette;
  switch (world.motif) {
    case "monsoon":
      return [
        { background: rainLines, opacity: 0.35 },
        {
          background: `radial-gradient(ellipse 70% 55% at 70% 105%, ${hsla(accent, 0.55)}, transparent 70%)`,
          blend: "screen",
        },
      ];
    case "sunrise":
      return [
        {
          background: `radial-gradient(circle at 62% 78%, ${hsla(glow, 0.9)} 0%, ${hsla(accent, 0.5)} 22%, transparent 58%)`,
          blend: "screen",
        },
        { background: rainLines, opacity: 0.12 },
      ];
    case "hearth":
      return [
        {
          background: `radial-gradient(ellipse 60% 45% at 50% 110%, ${hsla([28, 96, 58], 0.75)}, transparent 68%)`,
          blend: "screen",
        },
        {
          background: `radial-gradient(circle at 44% 82%, ${hsla([30, 90, 62], 0.5)} 0 1px, transparent 2px), radial-gradient(circle at 58% 70%, ${hsla([34, 92, 66], 0.45)} 0 1px, transparent 2px)`,
        },
      ];
    case "fireflies":
      return [
        {
          background: `radial-gradient(circle at 26% 62%, ${hsla([90, 70, 62], 0.7)} 0 1.2px, transparent 2px), radial-gradient(circle at 62% 44%, ${hsla([80, 60, 58], 0.6)} 0 1px, transparent 2px), radial-gradient(circle at 78% 72%, ${hsla([96, 70, 60], 0.5)} 0 1.4px, transparent 2.4px)`,
          blend: "screen",
        },
        {
          background: `radial-gradient(ellipse 80% 50% at 50% 108%, ${hsla(mid, 0.7)}, transparent 70%)`,
        },
      ];
    case "mandala":
      return [
        {
          background: `conic-gradient(from 0deg at 50% 55%, ${hsla(glow, 0.16)}, transparent 18%, ${hsla(glow, 0.14)} 34%, transparent 52%, ${hsla(glow, 0.16)} 70%, transparent 88%)`,
          blend: "screen",
        },
        {
          background: `radial-gradient(circle at 50% 55%, ${hsla(glow, 0.5)} 0%, transparent 46%)`,
          blend: "screen",
        },
      ];
    case "cosmos":
      return [
        {
          background: `radial-gradient(circle at 30% 32%, ${hsla(glow, 0.42)}, transparent 46%), radial-gradient(circle at 74% 58%, ${hsla(accent, 0.35)}, transparent 50%)`,
          blend: "screen",
        },
        {
          background: `radial-gradient(circle at 18% 22%, rgba(255,255,255,0.7) 0 0.8px, transparent 1.4px), radial-gradient(circle at 66% 18%, rgba(255,255,255,0.6) 0 0.9px, transparent 1.5px), radial-gradient(circle at 82% 66%, rgba(255,255,255,0.5) 0 0.7px, transparent 1.3px)`,
        },
      ];
    case "water":
      return [
        {
          background:
            "repeating-linear-gradient(0deg, transparent 0 6px, rgba(255,255,255,0.07) 6px 7px, transparent 7px 13px)",
          opacity: 0.5,
        },
        {
          background: `linear-gradient(180deg, transparent 45%, ${hsla(accent, 0.4)} 100%)`,
        },
      ];
    case "bells":
      return [
        {
          background: `radial-gradient(circle at 50% 62%, transparent 0 22%, ${hsla(glow, 0.28)} 23%, transparent 25%), radial-gradient(circle at 50% 62%, transparent 0 34%, ${hsla(glow, 0.2)} 35%, transparent 37%)`,
          blend: "screen",
        },
        {
          background: `radial-gradient(ellipse 70% 55% at 50% 110%, ${hsla(accent, 0.5)}, transparent 70%)`,
        },
      ];
    default:
      return [{ background: `radial-gradient(circle at 60% 70%, ${hsla(glow, 0.4)}, transparent 60%)` }];
  }
}

export default function WorldArt({ world, dim = false }: { world: BienceWorld; dim?: boolean }) {
  const [dark, mid, accent, glow] = world.palette;
  const layers = motifLayers(world);
  return (
    <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <span
        className="absolute inset-0"
        style={{ background: `linear-gradient(150deg, ${hsla(mid, 0.85)} 0%, ${hsla(dark, 0.98)} 68%)` }}
      />
      {layers.map((layer, index) => (
        <span
          key={index}
          className="absolute inset-0"
          style={{
            background: layer.background,
            opacity: dim ? (layer.opacity ?? 1) * 0.6 : layer.opacity ?? 1,
            mixBlendMode: (layer.blend as "screen" | undefined) ?? "normal",
          }}
        />
      ))}
      <span
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${hsla(glow, 0.45)}, transparent)` }}
      />
    </span>
  );
}
