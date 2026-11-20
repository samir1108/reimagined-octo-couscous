import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Progress, CircularProgress } from "./Progress";
import { Button } from "./Button";
import { Circle, Heart, Brain, Sparkles, Zap, Leaf, Moon, Star, Activity, Target, ChevronRight, AlertTriangle, CheckCircle, Droplets, Flame, Crown } from "lucide-react";

export interface ChakraIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  chakras: Array<{
    id: string;
    name: string;
    sanskritName: string;
    position: number;
    color: string;
    element: string;
    balanced: boolean;
    activation: number;
    blockages?: string[];
    practices?: string[];
  }>;
  overallBalance: number;
  dominantChakra?: string;
  weakChakra?: string;
  variant?: "vertical" | "horizontal" | "circular" | "detailed";
  size?: "sm" | "md" | "lg";
  onChakraClick?: (chakraId: string) => void;
  onBalance?: () => void;
}

export const ChakraIndicator = forwardRef<HTMLDivElement, ChakraIndicatorProps>(
  ({
    className,
    chakras,
    overallBalance,
    dominantChakra,
    weakChakra,
    variant = "vertical",
    size = "md",
    onChakraClick,
    onBalance,
    ...props
  }, ref) => {
    const chakraOrder = [
      { id: "root", name: "Root", sanskrit: "Muladhara", color: "#E53E3E", element: "Earth", icon: Mountain },
      { id: "sacral", name: "Sacral", sanskrit: "Svadhisthana", color: "#DD6B20", element: "Water", icon: Droplets },
      { id: "solar", name: "Solar Plexus", sanskrit: "Manipura", color: "#D69E2E", element: "Fire", icon: Flame },
      { id: "heart", name: "Heart", sanskrit: "Anahata", color: "#38A169", element: "Air", icon: Heart },
      { id: "throat", name: "Throat", sanskrit: "Vishuddha", color: "#3182CE", element: "Ether", icon: Mic },
      { id: "third-eye", name: "Third Eye", sanskrit: "Ajna", color: "#553C9A", element: "Light", icon: Eye },
      { id: "crown", name: "Crown", sanskrit: "Sahasrara", color: "#9F7AEA", element: "Consciousness", icon: Crown },
    ];

    const chakraData = chakraOrder.map((base, i) => {
      const data = chakras.find(c => c.id === base.id);
      return {
        ...base,
        position: i + 1,
        activation: data?.activation ?? 0,
        balanced: data?.balanced ?? false,
        blockages: data?.blockages ?? [],
        practices: data?.practices ?? [],
      };
    }).reverse();

    const sizes = {
      sm: { circle: 32, gap: 8, font: "text-caption", progress: "h-1.5" },
      md: { circle: 48, gap: 12, font: "text-body", progress: "h-2" },
      lg: { circle: 64, gap: 16, font: "text-h5", progress: "h-3" },
    };

    const sizeConfig = sizes[size];

    if (variant === "vertical") {
      return (
        <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-4", className)} {...props}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-h4 text-primary">Chakra System</h3>
              <p className="text-caption text-muted">Energy Centers & Balance</p>
            </div>
            <CircularProgress value={overallBalance} max={100} size={56} strokeWidth={4} semanticColor="gold" showLabel />
          </div>

          <div className="flex flex-col gap-4">
            {chakraData.map((chakra, i) => (
              <div
                key={chakra.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer",
                  "hover:bg-elevated-surface/50",
                  chakra.balanced ? "bg-healing/10 border border-healing/20" : "",
                  chakra.id === weakChakra ? "bg-error/10 border border-error/20" : "",
                  chakra.id === dominantChakra ? "bg-primary-gold/10 border border-primary-gold/20" : ""
                )}
                onClick={() => onChakraClick?.(chakra.id)}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300",
                    `bg-${chakra.color}`
                  )}
                  style={{ width: sizeConfig.circle, height: sizeConfig.circle }}
                >
                  <chakra.icon className="w-1/2 h-1/2 text-white" />
                  {chakra.balanced && (
                    <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-healing bg-void rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-muted font-mono">{chakra.position}</span>
                    <h4 className="text-body font-medium text-primary">{chakra.name}</h4>
                    <span className="text-caption text-muted italic">{chakra.sanskrit}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-caption text-muted">{chakra.element}</span>
                    <Progress value={chakra.activation} max={100} size={size === "sm" ? "xs" : size === "md" ? "sm" : "md"} semanticColor="gold" className="flex-1 max-w-[120px]" />
                    <span className="text-caption font-medium text-primary-gold w-12 text-right">{Math.round(chakra.activation)}%</span>
                  </div>
                  {(chakra.blockages && chakra.blockages.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {chakra.blockages.map((b, j) => (
                        <Badge key={j} variant="shadow-work" size="xs">{b}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="text-muted" />
              </div>
            ))}
          </div>

          {(dominantChakra || weakChakra) && (
            <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t border-border/50">
              {dominantChakra && (
                <div className="p-3 rounded-xl bg-primary-gold/10 border border-primary-gold/20">
                  <div className="flex items-center gap-2 text-primary-gold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-caption font-medium">Dominant: {dominantChakra}</span>
                  </div>
                  <p className="text-caption text-secondary">This center is highly active, leading your energy.</p>
                </div>
              )}
              {weakChakra && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20">
                  <div className="flex items-center gap-2 text-error mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-caption font-medium">Needs Attention: {weakChakra}</span>
                  </div>
                  <p className="text-caption text-secondary">This center may be blocked or underactive.</p>
                </div>
              )}
            </div>
          )}

          {onBalance && (
            <Button variant="gold" fullWidth onClick={onBalance} className="mt-4">
              Balance All Chakras
              <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>
      );
    }

    if (variant === "horizontal") {
      return (
        <Card ref={ref} variant="glass" className={cn("p-6", className)} {...props}>
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
            {chakraData.map((chakra) => (
              <div
                key={chakra.id}
                className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[80px]",
                  "hover:bg-elevated-surface/50",
                  chakra.balanced ? "bg-healing/10" : ""
                )}
                onClick={() => onChakraClick?.(chakra.id)}
              >
                <div
                  className={cn("relative flex items-center justify-center rounded-full transition-all duration-300", `bg-${chakra.color}`)}
                  style={{ width: sizeConfig.circle, height: sizeConfig.circle }}
                >
                  <chakra.icon className="w-1/2 h-1/2 text-white" />
                  {chakra.balanced && <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-healing bg-void rounded-full" />}
                </div>
                <span className="text-caption font-medium text-primary text-center">{chakra.name}</span>
                <span className="text-caption text-muted">{Math.round(chakra.activation)}%</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Progress value={overallBalance} max={100} semanticColor="gold" size="md" showLabel label="Overall Balance" />
          </div>
        </Card>
      );
    }

    if (variant === "circular") {
      return (
        <Card ref={ref} variant="glass-gold" className={cn("p-6", className)} {...props}>
          <div className="relative flex items-center justify-center" style={{ width: size === "sm" ? 200 : size === "md" ? 280 : 360, height: size === "sm" ? 200 : size === "md" ? 280 : 360 }}>
            <svg viewBox="0 0 280 280" className="w-full h-full">
              {chakraData.map((chakra, i) => {
                const angle = (i / chakraData.length) * 360 - 90;
                const radius = (size === "sm" ? 80 : size === "md" ? 110 : 140);
                const x = 140 + radius * Math.cos(angle * Math.PI / 180);
                const y = 140 + radius * Math.sin(angle * Math.PI / 180);
                return (
                  <g key={chakra.id} onClick={() => onChakraClick?.(chakra.id)} style={{ cursor: "pointer" }}>
                    <circle
                      cx={x}
                      cy={y}
                      r={sizeConfig.circle / 2}
                      fill={chakra.color}
                      opacity={chakra.activation / 100}
                      stroke={chakra.balanced ? "var(--color-healing)" : "transparent"}
                      strokeWidth={2}
                      filter="drop-shadow(0 0 8px currentColor)"
                    />
                    <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize={size === "sm" ? 10 : 12} fontWeight="bold">
                      {chakra.name.charAt(0)}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <div className="text-h1 font-medium text-primary">{Math.round(overallBalance)}%</div>
              <div className="text-caption text-muted">Overall Balance</div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-6", className)} {...props}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-h4 text-primary">Chakra System</h3>
            <p className="text-caption text-muted">Detailed Energy Analysis</p>
          </div>
          <CircularProgress value={overallBalance} max={100} size={56} strokeWidth={4} semanticColor="gold" showLabel />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chakraData.map((chakra) => (
            <div
              key={chakra.id}
              className={cn(
                "p-4 rounded-xl bg-elevated-surface/50 cursor-pointer transition-all duration-200",
                "hover:bg-elevated-surface/80 hover:shadow-lg",
                chakra.balanced ? "ring-1 ring-healing/30" : "",
                chakra.id === weakChakra ? "ring-1 ring-error/30" : "",
                chakra.id === dominantChakra ? "ring-1 ring-primary-gold/30" : ""
              )}
              onClick={() => onChakraClick?.(chakra.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn("relative flex items-center justify-center rounded-full", `bg-${chakra.color}`)}
                  style={{ width: 48, height: 48 }}
                >
                  <chakra.icon className="w-6 h-6 text-white" />
                  {chakra.balanced && <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-healing bg-void rounded-full" />}
                </div>
                <div>
                  <h4 className="text-body font-medium text-primary">{chakra.name}</h4>
                  <span className="text-caption text-muted italic">{chakra.sanskrit}</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption text-muted">{chakra.element}</span>
                  <span className={cn("text-caption font-medium", `text-${chakra.activation >= 70 ? "healing" : chakra.activation >= 40 ? "meditation" : "shadow-work"}`)}>
                    {Math.round(chakra.activation)}%
                  </span>
                </div>
                <Progress value={chakra.activation} max={100} semanticColor="gold" size="sm" />
              </div>
              {(chakra.blockages && chakra.blockages.length > 0) && (
                <div className="mb-3">
                  <span className="text-caption text-error mb-1 block">Blockages:</span>
                  <div className="flex flex-wrap gap-1">
                    {chakra.blockages.map((b, j) => (
                      <Badge key={j} variant="shadow-work" size="xs">{b}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(chakra.practices && chakra.practices.length > 0) && (
                <div className="pt-3 border-t border-border/50">
                  <span className="text-caption text-primary-gold mb-1 block">Balancing Practices:</span>
                  <div className="flex flex-wrap gap-1">
                    {chakra.practices.map((p, j) => (
                      <Badge key={j} variant="gold-soft" size="xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {onBalance && (
          <Button variant="gold" fullWidth onClick={onBalance}>
            Balance All Chakras
            <Sparkles className="w-4 h-4 ml-1" />
          </Button>
        )}
      </Card>
    );
  }
);

ChakraIndicator.displayName = "ChakraIndicator";

import { Mountain, Mic } from "lucide-react";