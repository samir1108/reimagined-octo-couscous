// "How this sitting was built" — the visible frame behind the agenda.
// Surfaces archetype, leading voice, starved dimension, chakra and the loops
// the engine is actually working on, so the session reads as composed — not random.

import { Compass, Fingerprint, Waves } from "lucide-react";
import type { SessionPlanMeta } from "@/lib/session-shell/types";
import {
  archetypeMeta,
  chakraLabel,
  dimensionLabel,
  hardwareLabel,
  loopChips,
  VOICE_META,
} from "./sessionFrame";

interface Props {
  meta?: SessionPlanMeta | null;
  nextMilestone?: { count: number; name: string } | null;
  totalMin?: number;
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/30 bg-background/40 px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-foreground/90">{value}</p>
    </div>
  );
}

export function SessionFrameCard({ meta, nextMilestone, totalMin }: Props) {
  if (!meta) return null;
  const archetype = archetypeMeta(meta.archetype);
  const voice = meta.leadVoice ? VOICE_META[meta.leadVoice] : null;
  const dimension = dimensionLabel(meta.starvedDimension);
  const chakra = chakraLabel(meta.chakraFocus);
  const loops = loopChips(meta);
  const levelValues = meta.practiceLevels ? Object.values(meta.practiceLevels).map(Number) : [];
  const level = levelValues.length
    ? Math.max(1, Math.min(5, Math.round(levelValues.reduce((a, b) => a + b, 0) / levelValues.length)))
    : null;
  const hardware = (meta.hardwareUsed || []).map(hardwareLabel);

  const hasFrame = !!archetype || !!voice || !!dimension || !!chakra || loops.length > 0;
  if (!hasFrame) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3 border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-primary/70" />
          <p className="text-[10px] font-display uppercase tracking-[0.25em] text-primary/70">
            How this sitting was built
          </p>
        </div>
        {archetype && (
          <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary/90">
            {archetype.label}
          </span>
        )}
      </div>

      <div className="space-y-3 px-4 py-3">
        {(archetype?.line || meta.leadMaster) && (
          <p className="text-xs leading-relaxed text-foreground/80">
            {archetype?.line && <span className="capitalize">{archetype.line}</span>}
            {meta.leadMaster && (
              <span className="text-muted-foreground/70">
                {archetype?.line ? " · " : ""}held by {meta.leadMaster}
              </span>
            )}
          </p>
        )}

        {archetype?.shape && (
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
            <Waves className="h-3 w-3 text-primary/50" />
            {archetype.shape}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {voice && <Chip label="Lead voice" value={voice.label} />}
          {dimension && <Chip label="Weakest" value={dimension} />}
          {chakra && <Chip label="Focus" value={chakra} />}
          {level !== null && <Chip label="Depth" value={`Level ${level}`} />}
        </div>

        {voice && (
          <p className="text-[11px] italic leading-snug text-muted-foreground/75">
            Because {voice.line}.
          </p>
        )}

        {loops.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
              Working on
            </span>
            {loops.map((l) => (
              <span
                key={l.id}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-500/90"
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2 border-t border-border/25 pt-2 text-[10px] leading-relaxed text-muted-foreground/65">
          <Fingerprint className="mt-0.5 h-3 w-3 shrink-0 text-primary/50" />
          <span>
            {[
              meta.stage ? `Stage: ${meta.stage}` : null,
              typeof meta.vLevelStart === "number" ? `V-Level ${meta.vLevelStart.toFixed(1)}` : null,
              meta.memoryInjected ? "memory of last sittings injected" : null,
              hardware.length ? `body signals: ${hardware.join(", ")}` : null,
              typeof totalMin === "number" ? `~${totalMin} min total` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Composed from your current state."}
          </span>
        </div>

        {nextMilestone && (
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/50">
            Next threshold · {nextMilestone.name} at sitting {nextMilestone.count}
          </p>
        )}
      </div>
    </div>
  );
}
