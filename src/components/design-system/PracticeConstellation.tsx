import { forwardRef, type HTMLAttributes, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Sparkles, Star, ChevronRight, Target, Heart, Brain, Leaf, Moon, Zap, Activity, Search, Compass, CheckCircle, Plus } from "lucide-react";

export interface PracticeConstellationProps extends HTMLAttributes<HTMLDivElement> {
  nodes: Array<{
    id: string;
    name: string;
    type: "meditation" | "breathing" | "movement" | "journaling" | "inquiry" | "ritual" | "sleep" | "integration";
    position: { x: number; y: number };
    completed: boolean;
    active?: boolean;
    locked?: boolean;
    connections?: string[];
    progress?: number;
    frequency?: string;
    duration?: number;
  }>;
  currentNode?: string;
  onNodeClick?: (nodeId: string) => void;
  onStartPractice?: (nodeId: string) => void;
  variant?: "interactive" | "overview" | "path";
  showConnections?: boolean;
  animate?: boolean;
}

export const PracticeConstellation = forwardRef<HTMLDivElement, PracticeConstellationProps>(
  ({
    className,
    nodes,
    currentNode,
    onNodeClick,
    onStartPractice,
    variant = "interactive",
    showConnections = true,
    animate = true,
    ...props
  }, ref) => {
    const typeConfig = {
      meditation: { color: "meditation", icon: Sparkles, label: "Meditation" },
      breathing: { color: "healing", icon: Leaf, label: "Breathing" },
      movement: { color: "focus", icon: Zap, label: "Movement" },
      journaling: { color: "observation", icon: BookOpen, label: "Journaling" },
      inquiry: { color: "self-inquiry", icon: Search, label: "Inquiry" },
      ritual: { color: "awakening", icon: Heart, label: "Ritual" },
      sleep: { color: "sleep", icon: Moon, label: "Sleep" },
      integration: { color: "integration", icon: Target, label: "Integration" },
    };

    const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

    const getConnections = (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node?.connections) return [];
      return node.connections.map(id => nodeMap.get(id)).filter(Boolean);
    };

    const containerSize = { width: 400, height: 400 };

    if (variant === "overview") {
      const completedCount = nodes.filter(n => n.completed).length;
      const activeCount = nodes.filter(n => n.active).length;
      const lockedCount = nodes.filter(n => n.locked).length;

      return (
        <Card ref={ref} variant="glass-gold" className={cn("p-6 space-y-6", className)} {...props}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h4 text-primary">Practice Constellation</h3>
              <p className="text-caption text-muted mt-1">Your evolving practice ecosystem</p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-h3 font-medium text-healing">{completedCount}</div>
                <div className="text-caption text-muted">Completed</div>
              </div>
              <div>
                <div className="text-h3 font-medium text-primary-gold">{activeCount}</div>
                <div className="text-caption text-muted">Active</div>
              </div>
              <div>
                <div className="text-h3 font-medium text-muted">{lockedCount}</div>
                <div className="text-caption text-muted">Locked</div>
              </div>
            </div>
          </div>

          <div className="relative" style={{ width: "100%", height: 300 }}>
            <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {showConnections && nodes.flatMap(node =>
                (node.connections || []).map(connId => {
                  const target = nodeMap.get(connId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${node.id}-${connId}`}
                      x1={node.position.x}
                      y1={node.position.y}
                      x2={target.position.x}
                      y2={target.position.y}
                      stroke="var(--color-primary-gold)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      opacity="0.3"
                      className={cn(animate && "animate-draw")}
                    />
                  );
                }).filter(Boolean)
              )}
              {nodes.map(node => {
                const config = typeConfig[node.type];
                const isCurrent = node.id === currentNode;
                return (
                  <g key={node.id} onClick={() => onNodeClick?.(node.id)} style={{ cursor: node.locked ? "not-allowed" : "pointer" }}>
                    <circle
                      cx={node.position.x}
                      cy={node.position.y}
                      r={isCurrent ? 16 : node.active ? 14 : 10}
                      fill={node.locked ? "var(--color-border)" : node.completed ? "var(--color-healing)" : isCurrent ? "var(--color-primary-gold)" : node.active ? "var(--color-primary-gold)" : "var(--color-elevated-surface)"}
                      stroke={isCurrent ? "var(--color-primary-gold)" : node.active ? "var(--color-primary-gold)" : node.completed ? "var(--color-healing)" : "var(--color-border)"}
                      strokeWidth={isCurrent ? 3 : node.active ? 2 : 1}
                      filter={isCurrent ? "drop-shadow(0 0 8px var(--color-primary-gold))" : node.active ? "drop-shadow(0 0 6px var(--color-primary-gold))" : "none"}
                      opacity={node.locked ? 0.5 : 1}
                      className={cn(
                        "transition-all duration-300",
                        animate && (isCurrent ? "animate-pulse-gentle" : node.active ? "animate-float-gentle" : "")
                      )}
                    />
                    {node.completed && (
                      <text x={node.position.x} y={node.position.y + 4} textAnchor="middle" fill="var(--color-void)" fontSize="8" fontWeight="bold">
                        ✓
                      </text>
                    )}
                    {node.locked && (
                      <text x={node.position.x} y={node.position.y + 4} textAnchor="middle" fill="var(--color-muted)" fontSize="10">
                        🔒
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(typeConfig).map(([type, config]) => {
              const count = nodes.filter(n => n.type === type).length;
              if (count === 0) return null;
              return (
                <Badge key={type} variant={config.color as any} size="xs" dot>
                  {config.label} ({count})
                </Badge>
              );
            })}
          </div>
        </Card>
      );
    }

    if (variant === "path") {
      const pathNodes = nodes.filter(n => !n.locked).sort((a, b) => a.position.y - b.position.y);
      return (
        <Card ref={ref} variant="glass" className={cn("p-6 space-y-4", className)} {...props}>
          <h3 className="text-h4 text-primary">Practice Path</h3>
          <div className="relative pl-4 border-l border-border/50">
            {pathNodes.map((node, i) => {
              const config = typeConfig[node.type];
              const isCurrent = node.id === currentNode;
              return (
                <div key={node.id} className={cn("relative pb-6 last:pb-0 ml-4", isCurrent && "ring-2 ring-primary-gold/30 rounded-xl -ml-2 px-2")}>
                  <div className="absolute left-[-22px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: node.completed ? "var(--color-healing)" : isCurrent ? "var(--color-primary-gold)" : "transparent",
                      borderColor: node.completed ? "var(--color-healing)" : isCurrent ? "var(--color-primary-gold)" : "var(--color-border)",
                    }}
                  >
                    {node.completed && <CheckCircle className="w-2.5 h-2.5 text-void" />}
                    {isCurrent && !node.completed && <span className="w-1.5 h-1.5 rounded-full bg-primary-gold animate-pulse" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", `text-${config.color} bg-${config.color}/15`)}>
                      <config.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-body font-medium text-primary">{node.name}</h4>
                        <Badge variant={config.color as any} size="xs">{config.label}</Badge>
                        {isCurrent && <Badge variant="gold" size="xs">Current</Badge>}
                        {node.completed && <Badge variant="healing" size="xs">Done</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-caption text-muted mt-1">
                        {node.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{node.duration}min</span>}
                        {node.frequency && <span>{node.frequency}</span>}
                        {node.progress !== undefined && <span className="text-primary-gold">{Math.round(node.progress)}%</span>}
                      </div>
                    </div>
                    {onStartPractice && !node.completed && !node.locked && (
                      <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); onStartPractice(node.id); }}>
                        {node.completed ? "Repeat" : "Start"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} variant="glass-gold" className={cn("p-6", className)} {...props}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-h4 text-primary">Practice Constellation</h3>
            <p className="text-caption text-muted mt-1">Interactive map of your practices</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {}}>
              <Compass className="w-4 h-4 mr-1" /> Center
            </Button>
            <Button variant="gold-ghost" size="sm" onClick={() => {}}>
              <Plus className="w-4 h-4 mr-1" /> Add Practice
            </Button>
          </div>
        </div>

        <div className="relative" style={{ width: "100%", height: 400 }}>
          <svg viewBox="0 0 400 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {showConnections && nodes.flatMap(node =>
              (node.connections || []).map(connId => {
                const target = nodeMap.get(connId);
                if (!target) return null;
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={target.position.x}
                    y2={target.position.y}
                    stroke="var(--color-primary-gold)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.2"
                    className={cn(animate && "animate-draw")}
                  />
                );
              }).filter(Boolean)
            )}
            {nodes.map(node => {
              const config = typeConfig[node.type];
              const isCurrent = node.id === currentNode;
              const connections = getConnections(node.id);
              return (
                <g key={node.id} onClick={() => onNodeClick?.(node.id)} style={{ cursor: node.locked ? "not-allowed" : "pointer" }}>
                  {connections.length > 0 && !node.locked && (
                    <circle
                      cx={node.position.x}
                      cy={node.position.y}
                      r={isCurrent ? 28 : node.active ? 24 : 20}
                      fill="none"
                      stroke={isCurrent ? "var(--color-primary-gold)" : node.active ? "var(--color-primary-gold)" : "var(--color-border)"}
                      strokeWidth={isCurrent ? 2 : 1}
                      strokeDasharray="8,4"
                      opacity={isCurrent ? 0.5 : node.active ? 0.3 : 0.15}
                      className={cn(animate && "animate-rotate-slow")}
                    />
                  )}
                  <circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={isCurrent ? 18 : node.active ? 16 : 12}
                    fill={node.locked ? "var(--color-border)" : node.completed ? "var(--color-healing)" : isCurrent ? "var(--color-primary-gold)" : node.active ? "var(--color-primary-gold)" : "var(--color-elevated-surface)"}
                    stroke={isCurrent ? "var(--color-primary-gold)" : node.active ? "var(--color-primary-gold)" : node.completed ? "var(--color-healing)" : "var(--color-border)"}
                    strokeWidth={isCurrent ? 3 : node.active ? 2 : 1}
                    filter={isCurrent ? "drop-shadow(0 0 12px var(--color-primary-gold))" : node.active ? "drop-shadow(0 0 8px var(--color-primary-gold))" : "none"}
                    opacity={node.locked ? 0.5 : 1}
                    className={cn(
                      "transition-all duration-300",
                      animate && (isCurrent ? "animate-pulse-gentle" : node.active ? "animate-float-gentle" : "")
                    )}
                  />
                  {node.completed && (
                    <text x={node.position.x} y={node.position.y + 5} textAnchor="middle" fill="var(--color-void)" fontSize="10" fontWeight="bold">
                      ✓
                    </text>
                  )}
                  {node.locked && (
                    <text x={node.position.x} y={node.position.y + 5} textAnchor="middle" fill="var(--color-muted)" fontSize="12">
                      🔒
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {nodes.map(node => {
            const config = typeConfig[node.type];
            const isCurrent = node.id === currentNode;
            return (
              <div
                key={node.id}
                className="absolute pointer-events-none"
                style={{
                  left: node.position.x - 80,
                  top: node.position.y - 60,
                  width: 160,
                  transform: `translateX(-50%)`,
                }}
              >
                <div className={cn(
                  "text-center px-2",
                  isCurrent && "animate-fade-in"
                )}>
                  <div className={cn("text-caption font-medium text-primary truncate", isCurrent ? "text-primary-gold" : "")}>
                    {node.name}
                  </div>
                  <Badge variant={config.color as any} size="xs" className="mx-auto">{config.label}</Badge>
                  {isCurrent && <div className="text-caption text-primary-gold mt-1">← Current Focus</div>}
                  {node.locked && <div className="text-caption text-muted mt-1">Locked</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-6 pt-4 border-t border-border/50">
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = nodes.filter(n => n.type === type).length;
            const completed = nodes.filter(n => n.type === type && n.completed).length;
            if (count === 0) return null;
            return (
              <Badge key={type} variant={config.color as any} size="sm" dot>
                {config.label}: {completed}/{count}
              </Badge>
            );
          })}
        </div>
      </Card>
    );
  }
);

PracticeConstellation.displayName = "PracticeConstellation";

import { BookOpen, Clock } from "lucide-react";