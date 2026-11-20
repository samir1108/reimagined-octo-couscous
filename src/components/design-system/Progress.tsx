import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "circular" | "semantic";
  semanticColor?: "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "gold";
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = "md", variant = "default", semanticColor = "gold", showLabel = false, label, animate = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      xs: "h-0.5",
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    };

    const semanticColors = {
      observation: "bg-observation",
      "self-inquiry": "bg-self-inquiry",
      meditation: "bg-meditation",
      healing: "bg-healing",
      focus: "bg-focus",
      "shadow-work": "bg-shadow-work",
      awakening: "bg-awakening",
      sleep: "bg-sleep",
      integration: "bg-integration",
      gold: "bg-gradient-to-r from-gold-light via-primary-gold to-gold-light",
    };

    if (variant === "circular") {
      const radius = size === "xs" ? 12 : size === "sm" ? 16 : size === "md" ? 24 : size === "lg" ? 32 : 40;
      const strokeWidth = size === "xs" ? 2 : size === "sm" ? 3 : size === "md" ? 4 : size === "lg" ? 5 : 6;
      const circumference = 2 * Math.PI * (radius - strokeWidth);

      const semanticStroke = {
        observation: "stroke-observation",
        "self-inquiry": "stroke-self-inquiry",
        meditation: "stroke-meditation",
        healing: "stroke-healing",
        focus: "stroke-focus",
        "shadow-work": "stroke-shadow-work",
        awakening: "stroke-awakening",
        sleep: "stroke-sleep",
        integration: "stroke-integration",
        gold: "stroke-primary-gold",
      };

      return (
        <div
          ref={ref}
          className={cn("relative inline-flex items-center justify-center", className)}
          {...props}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
            <circle
              className="progress-ring-track"
              cx={radius}
              cy={radius}
              r={radius - strokeWidth}
              fill="none"
              strokeWidth={strokeWidth}
            />
            <circle
              className={cn("progress-ring-fill", semanticStroke[semanticColor])}
              cx={radius}
              cy={radius}
              r={radius - strokeWidth}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
              style={{
                transition: animate ? "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }}
            />
          </svg>
          {showLabel && (
            <span className="absolute inset-0 flex items-center justify-center text-metadata font-medium text-primary" style={{ fontSize: radius * 0.4 }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={cn("relative overflow-hidden rounded-full bg-border", sizes[size])}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              semanticColors[semanticColor],
              !animate && "transition-none"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mt-2">
            {label && <span className="text-caption text-secondary">{label}</span>}
            <span className="text-caption text-muted">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export interface CircularProgressProps extends Omit<ProgressProps, "variant"> {
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, value, max = 100, size = 48, strokeWidth = 4, trackColor, semanticColor = "gold", showLabel = false, label, animate = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const semanticStroke = {
      observation: "stroke-observation",
      "self-inquiry": "stroke-self-inquiry",
      meditation: "stroke-meditation",
      healing: "stroke-healing",
      focus: "stroke-focus",
      "shadow-work": "stroke-shadow-work",
      awakening: "stroke-awakening",
      sleep: "stroke-sleep",
      integration: "stroke-integration",
      gold: "stroke-primary-gold",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            className="progress-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke={trackColor}
          />
          <circle
            className={cn("progress-ring-fill", semanticStroke[semanticColor])}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - percentage / 100)}
            style={{
              transition: animate ? "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }}
          />
        </svg>
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center font-display font-medium text-primary" style={{ fontSize: size * 0.3 }}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export interface RadialProgressProps extends Omit<ProgressProps, "variant"> {
  size?: number;
  strokeWidth?: number;
  segments?: number;
  gap?: number;
}

export const RadialProgress = forwardRef<HTMLDivElement, RadialProgressProps>(
  ({ className, value, max = 100, size = 64, strokeWidth = 4, segments = 8, gap = 2, semanticColor = "gold", showLabel = false, label, animate = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const segmentLength = circumference / segments;
    const gapLength = (gap / 100) * circumference;
    const activeSegmentLength = segmentLength - gapLength;
    const activeSegments = Math.round((percentage / 100) * segments);

    const semanticStroke = {
      observation: "stroke-observation",
      "self-inquiry": "stroke-self-inquiry",
      meditation: "stroke-meditation",
      healing: "stroke-healing",
      focus: "stroke-focus",
      "shadow-work": "stroke-shadow-work",
      awakening: "stroke-awakening",
      sleep: "stroke-sleep",
      integration: "stroke-integration",
      gold: "stroke-primary-gold",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {Array.from({ length: segments }).map((_, i) => (
            <circle
              key={i}
              className={cn(
                "progress-ring-fill transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                semanticStroke[semanticColor],
                i < activeSegments ? "opacity-100" : "opacity-20"
              )}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${activeSegmentLength} ${gapLength}`}
              strokeDashoffset={-i * segmentLength}
              style={{
                transition: animate ? "opacity 0.3s ease-out, stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }}
            />
          ))}
        </svg>
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center font-display font-medium text-primary" style={{ fontSize: size * 0.35 }}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

RadialProgress.displayName = "RadialProgress";