import { forwardRef } from "react";

type ProgressSize = number | "sm" | "md" | "lg";

function resolveSize(size: ProgressSize, fallback: number): number {
  if (typeof size === "number") return size;
  if (size === "sm") return 40;
  if (size === "lg") return 96;
  if (size === "md") return 64;
  return fallback;
}

export interface CircularProgressProps {
  /** 0..1 */
  value: number;
  size?: ProgressSize;
  strokeWidth?: number;
  className?: string;
  /** Show the numeric percentage in the middle. */
  showValue?: boolean;
  /** Show a label (or the percentage) in the middle. */
  showLabel?: boolean;
  /** Custom centre label, e.g. "Complete". */
  label?: string;
  /** Colour hint retained for design-system parity. */
  variant?: string;
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ value, size = 48, strokeWidth = 4, className, showValue = false, showLabel = false, label, variant }, ref) => {
    const px = resolveSize(size, 48);
    const clamped = Math.max(0, Math.min(1, value));
    const r = (px - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    return (
      <div
        ref={ref}
        className={className}
        data-variant={variant}
        style={{ width: px, height: px, position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        role="progressbar"
        aria-valuenow={Math.round(clamped * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg width={px} height={px} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={strokeWidth} />
          <circle
            cx={px / 2}
            cy={px / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - clamped)}
          />
        </svg>
        {(showValue || showLabel) && (
          <span style={{ position: "absolute", fontSize: px / 4 }}>
            {label ?? `${Math.round(clamped * 100)}%`}
          </span>
        )}
      </div>
    );
  },
);
CircularProgress.displayName = "CircularProgress";

export interface ArcProgressProps extends Omit<CircularProgressProps, "showValue"> {
  /** Sweep in degrees (default 240). */
  sweep?: number;
}

export const ArcProgress = forwardRef<HTMLDivElement, ArcProgressProps>(
  ({ value, size = 96, strokeWidth = 6, className, showLabel = true, label, variant, sweep = 240 }, ref) => {
    const px = resolveSize(size, 96);
    const clamped = Math.max(0, Math.min(1, value));
    const r = (px - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const arcLength = (sweep / 360) * circumference;
    const startAngle = 90 + (360 - sweep) / 2;
    return (
      <div
        ref={ref}
        className={className}
        data-variant={variant}
        style={{ width: px, height: px, position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        role="progressbar"
        aria-valuenow={Math.round(clamped * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg width={px} height={px} style={{ transform: `rotate(${startAngle}deg)` }}>
          <circle
            cx={px / 2}
            cy={px / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
          />
          <circle
            cx={px / 2}
            cy={px / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength * clamped} ${circumference}`}
          />
        </svg>
        {showLabel && (
          <span style={{ position: "absolute", fontSize: px / 5 }}>
            {label ?? `${Math.round(clamped * 100)}%`}
          </span>
        )}
      </div>
    );
  },
);
ArcProgress.displayName = "ArcProgress";
