import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  Layers,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Badge } from "@/design-system";
import {
  ExtendedSessionConfiguration,
  getFocusType,
  getGuideStyle,
} from "@/types/session-config";
import { useSessionConfig } from "@/hooks/useSessionConfig";
import { buildPersonalizationView } from "@/components/session-personalization/personalizationModel";
import { SessionStudio } from "@/components/session-personalization";
import DeepPersonalizationHub from "./DeepPersonalizationHub";
import AIPersonalizationChat from "./AIPersonalizationChat";

type ViewId = "studio" | "profile" | "ai";

const VIEWS: {
  id: ViewId;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { id: "studio", label: "Session Studio", shortLabel: "Session", description: "Tune every session lever", icon: SlidersHorizontal },
  { id: "profile", label: "Deep Profile", shortLabel: "Profile", description: "Identity, psyche & consciousness", icon: Brain },
  { id: "ai", label: "AI Designer", shortLabel: "AI", description: "Describe it in your own words", icon: Wand2 },
];

export default function PersonalizationSettingsSection() {
  const { config, isLoading } = useSessionConfig();
  const [savedConfig, setSavedConfig] = useState<ExtendedSessionConfiguration | null>(null);
  const [viewId, setViewId] = useState<ViewId>("studio");
  const [visited, setVisited] = useState<Set<ViewId>>(() => new Set<ViewId>(["studio"]));
  const [expanded, setExpanded] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const activeConfig = savedConfig ?? config;
  const view = useMemo(() => buildPersonalizationView(activeConfig), [activeConfig]);

  const handleConfigSaved = useCallback((next: ExtendedSessionConfiguration) => {
    setSavedConfig(next);
  }, []);

  const focus = getFocusType(activeConfig.focusType);
  const guide = getGuideStyle(activeConfig.guideStyle);
  const blockingConflicts = view.conflicts.filter((conflict) => conflict.severity === "blocking").length;
  const activeView = VIEWS.find((entry) => entry.id === viewId) ?? VIEWS[0];

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-5 space-y-3 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={() => {
          setExpanded((prev) => !prev);
          setHasOpened(true);
        }}
        aria-expanded={expanded}
        aria-controls="personalization-body"
        className="w-full text-left p-5 sm:p-6 hover:bg-muted/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/10 border border-primary/20 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-foreground text-sm">Session Personalization</h3>
              <Badge variant="secondary" className="gap-1 text-[10px] px-2 py-0 h-5">
                <Sparkles className="w-2.5 h-2.5" />
                <span className="capitalize">{view.depthLabel}</span>
              </Badge>
              {view.conflicts.length > 0 && (
                <Badge
                  variant="outline"
                  className={`gap-1 text-[10px] px-2 py-0 h-5 ${
                    blockingConflicts > 0
                      ? "border-destructive/40 text-destructive"
                      : "border-amber-500/40 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {view.conflicts.length}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
              {focus.emoji} {focus.label} · {activeConfig.timeBudgetMin} min · {activeConfig.energyMode} energy · {guide.label} guide
            </p>

            {/* Depth meter */}
            <div className="flex items-center gap-2 mt-3">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-golden to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(view.depth * 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                {view.activeSignals}/{view.totalSignals} signals
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Effective settings — visible collapsed */}
        <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
          <Badge variant="outline" className="text-[10px]">{activeConfig.timeBudgetMin} min</Badge>
          <Badge variant="outline" className="text-[10px] capitalize">{activeConfig.preferredGate}</Badge>
          <Badge variant="outline" className="text-[10px] capitalize">{activeConfig.reflectionDepth} reflection</Badge>
          <Badge variant="outline" className="text-[10px]">{view.primaryDomains.slice(0, 2).map((d) => `${d.emoji} ${d.label}`).join(" · ")}</Badge>
        </div>
      </button>

      {/* Expandable body — stays mounted after first open so edits are not lost */}
      {hasOpened && (
        <motion.div
          id="personalization-body"
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
          aria-hidden={!expanded}
        >
          <div className={expanded ? "px-5 sm:px-6 pb-5 sm:pb-6 space-y-5 border-t border-border/30 pt-5" : "hidden"}>
              {/* Layer map */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Personalization layers</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {view.layers.map((layer) => (
                    <div key={layer.id} className="glass-subtle rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-display font-semibold text-foreground truncate">{layer.label}</p>
                        {layer.customizedCount > 0 ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                            {layer.customizedCount} set
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground shrink-0">default</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-body line-clamp-2">{layer.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {view.conflicts.length > 0 && (
                <div
                  className={`rounded-xl p-3 flex items-start gap-2 ${
                    blockingConflicts > 0
                      ? "border border-destructive/40 bg-destructive/10"
                      : "border border-amber-500/30 bg-amber-500/10"
                  }`}
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      {view.conflicts.length} personalization {view.conflicts.length === 1 ? "conflict" : "conflicts"}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{view.conflicts[0].message}</p>
                  </div>
                </div>
              )}

              {/* View cards */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Personalization depth</p>
                <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Personalization views">
                  {VIEWS.map(({ id, label, shortLabel, description, icon: Icon }) => {
                    const selected = viewId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => {
                          setViewId(id);
                          setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
                        }}
                        className={`flex flex-col items-start gap-1.5 rounded-xl p-3 text-left transition-all border ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                            : "glass-subtle border-transparent hover:border-border/50 hover:bg-muted/30"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs font-display font-medium leading-tight">
                          <span className="sm:hidden">{shortLabel}</span>
                          <span className="hidden sm:inline">{label}</span>
                        </span>
                        <span className="hidden sm:block text-[10px] text-muted-foreground font-body line-clamp-1">
                          {description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active view — visited views stay mounted so edits survive tab switches */}
              <p className="text-[11px] text-muted-foreground font-body">{activeView.description}</p>
              {visited.has("studio") && (
                <div className={viewId === "studio" ? "rounded-2xl border border-border/40 bg-background/30 p-3 sm:p-4 min-w-0" : "hidden"}>
                  <SessionStudio onConfigSaved={handleConfigSaved} embedded />
                </div>
              )}
              {visited.has("profile") && (
                <div className={viewId === "profile" ? "min-w-0" : "hidden"}>
                  <DeepPersonalizationHub />
                </div>
              )}
              {visited.has("ai") && (
                <div className={viewId === "ai" ? "min-w-0" : "hidden"}>
                  <AIPersonalizationChat />
                </div>
              )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
