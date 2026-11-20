import { useId, type CSSProperties } from "react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  hue?: number;
  compact?: boolean;
  format?: (value: number) => string;
  onCommit?: () => void;
  hideLabel?: boolean;
};

export default function BienceSlider({ value, onChange, label, hue = 42, compact, format, onCommit, hideLabel }: Props) {
  const id = useId();
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const style = {
    "--pct": `${percent}%`,
    "--dial": `hsl(${hue} 70% 62%)`,
    "--dial-glow": `hsl(${hue} 82% 58% / 0.55)`,
  } as CSSProperties;

  return (
    <div className="group/slider w-full">
      <style>{`
        .bience-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
          cursor: pointer;
          height: ${compact ? "18px" : "24px"};
        }
        .bience-range:focus-visible { outline: none; }
        .bience-range::-webkit-slider-runnable-track {
          height: ${compact ? "3px" : "4px"};
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            var(--dial) 0 var(--pct),
            hsl(0 0% 100% / 0.1) var(--pct) 100%
          );
        }
        .bience-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: ${compact ? "10px" : "14px"};
          height: ${compact ? "10px" : "14px"};
          margin-top: ${compact ? "-3.5px" : "-5px"};
          border-radius: 999px;
          background: var(--dial);
          box-shadow: 0 0 0 3px hsl(0 0% 100% / 0.06), 0 0 16px var(--dial-glow);
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bience-range:hover::-webkit-slider-thumb { transform: scale(1.18); }
        .bience-range:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px hsl(var(--ring) / 0.35), 0 0 16px var(--dial-glow);
        }
        .bience-range::-moz-range-track {
          height: ${compact ? "3px" : "4px"};
          border-radius: 999px;
          background: hsl(0 0% 100% / 0.1);
        }
        .bience-range::-moz-range-progress {
          height: ${compact ? "3px" : "4px"};
          border-radius: 999px;
          background: var(--dial);
        }
        .bience-range::-moz-range-thumb {
          width: ${compact ? "10px" : "14px"};
          height: ${compact ? "10px" : "14px"};
          border: none;
          border-radius: 999px;
          background: var(--dial);
          box-shadow: 0 0 16px var(--dial-glow);
        }
      `}</style>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={hideLabel ? "sr-only" : "text-[13px] font-medium text-foreground/80"}>
          {label}
        </label>
        <span className="font-[var(--font-mono,monospace)] text-[11px] tabular-nums text-muted-foreground">
          {format ? format(value) : `${percent}%`}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="bience-range mt-1"
        style={style}
        aria-label={label}
        aria-valuetext={format ? format(value) : `${percent} percent`}
      />
    </div>
  );
}
