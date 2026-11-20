import {
  AudioLines,
  Bell,
  Bird,
  Bug,
  CloudLightning,
  CloudRain,
  Droplets,
  Flame,
  Music2,
  RotateCcw,
  Sparkles,
  Users,
  VolumeX,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

import BienceSlider from "./BienceSlider";
import { LAYERS, LAYER_GROUPS, type LayerId, type LayerSpec } from "@/lib/bience/model";

const ICONS: Record<LayerId, LucideIcon> = {
  rain: CloudRain,
  storm: CloudLightning,
  wind: Wind,
  fire: Flame,
  stream: Droplets,
  ocean: Waves,
  birds: Bird,
  crickets: Bug,
  crowd: Users,
  tanpura: Music2,
  bowls: Bell,
  choir: AudioLines,
  sub: AudioLines,
  shimmer: Sparkles,
};

type Props = {
  levels: Record<LayerId, number>;
  reverb: number;
  onLayer: (id: LayerId, value: number) => void;
  onReverb: (value: number) => void;
  onRestore: () => void;
  onSilence: () => void;
  className?: string;
  evolve: boolean;
  onEvolve: (value: boolean) => void;
};

function LayerRow({
  spec,
  value,
  onChange,
}: {
  spec: LayerSpec;
  value: number;
  onChange: (value: number) => void;
}) {
  const Icon = ICONS[spec.id];
  const lit = value > 0.005;
  return (
    <div
      className="group relative flex items-start gap-3 rounded-2xl px-2 py-2 transition-colors duration-300 hover:bg-white/[0.035]"
      data-layer={spec.id}
      title={spec.hint}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500"
        style={{
          borderColor: lit ? `hsl(${spec.hue} 60% 60% / 0.3)` : "hsl(0 0% 100% / 0.07)",
          background: lit ? `hsl(${spec.hue} 60% 40% / 0.14)` : "hsl(0 0% 100% / 0.03)",
          color: lit ? `hsl(${spec.hue} 72% 70%)` : "hsl(0 0% 100% / 0.35)",
          boxShadow: lit ? `0 0 18px hsl(${spec.hue} 70% 50% / 0.16)` : "none",
        }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="pt-0.5">
          <BienceSlider
            label={spec.label}
            value={value}
            hue={spec.hue}
            onChange={onChange}
            compact
          />
        </div>
      </div>
    </div>
  );
}

export default function BienceMixer({ levels, reverb, onLayer, onReverb, onRestore, onSilence, className, evolve, onEvolve }: Props) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 px-2 pb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">Mixer</p>
          <h2 className="font-[var(--font-display,inherit)] text-lg leading-tight text-foreground">Build the room</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRestore}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label="Restore this world's mix"
            title="Restore the world's mix"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onSilence}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label="Silence all layers"
            title="Silence all layers"
          >
            <VolumeX className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {LAYER_GROUPS.map((group) => {
          const items = Object.values(LAYERS).filter((spec) => spec.group === group.id);
          if (items.length === 0) return null;
          return (
            <section key={group.id} aria-label={group.label}>
              <p className="px-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground/45">{group.label}</p>
              <div className="mt-1 space-y-0.5">
                {items.map((spec) => (
                  <LayerRow
                    key={spec.id}
                    spec={spec}
                    value={levels[spec.id] ?? 0}
                    onChange={(value) => onLayer(spec.id, value)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={evolve}
          onClick={() => onEvolve(!evolve)}
          className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none"
        >
          <span className="flex items-center gap-2">
            <Sparkles className={`h-4 w-4 ${evolve ? "text-primary" : "text-muted-foreground/50"}`} />
            <span>
              <span className="block text-[13px] font-medium text-foreground/85">Living mix</span>
              <span className="block text-[10px] text-muted-foreground/50">Drifts on its own while you sit</span>
            </span>
          </span>
          <span
            aria-hidden
            className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300"
            style={{ background: evolve ? "hsl(var(--primary) / 0.75)" : "hsl(0 0% 100% / 0.12)" }}
          >
            <span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300"
              style={{ transform: evolve ? "translateX(18px)" : "translateX(2px)" }}
            />
          </span>
        </button>
        <BienceSlider label="Room depth" value={reverb} hue={262} onChange={onReverb} compact />
      </div>
    </div>
  );
}
