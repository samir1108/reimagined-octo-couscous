import { useMemo } from "react";
import { motion } from "framer-motion";
import { useThemeOfDay } from "@/hooks/useThemeOfDay";
import { ArrowRight, Clock, Compass, Flame, Heart, Eye, Activity } from "lucide-react";

const STAGGER = 0.06;

function SurfaceCard({ icon, label, text, delay = 0 }: { icon: React.ReactNode; label: string; text?: string; delay?: number }) {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 sm:p-5 transition-colors hover:bg-card/40"
    >
      {/* Top-edge shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      {/* Colored left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent opacity-60" aria-hidden />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/40 text-foreground/65">
          {icon}
        </div>
        <span className="text-[9px] font-display tracking-[0.25em] uppercase text-foreground/50">
          {label}
        </span>
      </div>
      <p className="whitespace-pre-line text-[13px] leading-[1.65] text-foreground/75">{text}</p>
    </motion.div>
  );
}

export default function DesignedDayBody() {
  const { data: themeResponse, isLoading, isFetching } = useThemeOfDay();
  const theme = themeResponse?.theme;
  const isComposing = (theme as any)?._composing;

  const surfaces = useMemo(() => {
    if (!theme) return [];
    const items: Array<{ icon: React.ReactNode; label: string; text: string; delay: number }> = [];
    let delay = 0.15;

    const t = theme as any;

    if (t.yesterday_bridge && t.yesterday_title) {
      items.push({
        icon: <ArrowRight className="h-3 w-3" />,
        label: "Yesterday → Today",
        text: `${t.yesterday_title} → ${t.title}`,
        delay: delay++ + STAGGER,
      });
    }

    if (t.felt_sense_opener) {
      items.push({
        icon: <Eye className="h-3 w-3" />,
        label: "How the day opens",
        text: t.felt_sense_opener,
        delay: delay++ + STAGGER,
      });
    }

    if (t.micro_practice?.title || t.micro_practice?.description) {
      const practiceText = [t.micro_practice.title, t.micro_practice.description, t.micro_practice.duration_min ? `~${t.micro_practice.duration_min} min` : null].filter(Boolean).join(" · ");
      items.push({
        icon: <Activity className="h-3 w-3" />,
        label: "Practice",
        text: practiceText,
        delay: delay++ + STAGGER,
      });
    }

    if (t.inner_inquiry || t.engagement_question) {
      items.push({
        icon: <Compass className="h-3 w-3" />,
        label: "Question",
        text: t.inner_inquiry || t.engagement_question,
        delay: delay++ + STAGGER,
      });
    }

    if (t.resistance_warning || t.forbidden_thing) {
      const warningText = [t.resistance_warning, t.forbidden_thing ? `Forbidden: ${t.forbidden_thing}` : null].filter(Boolean).join(". ");
      items.push({
        icon: <Flame className="h-3 w-3" />,
        label: "Watch for",
        text: warningText,
        delay: delay++ + STAGGER,
      });
    }

    if (Array.isArray(t.daily_intentions) && t.daily_intentions.length > 0) {
      items.push({
        icon: <Heart className="h-3 w-3" />,
        label: "Intentions",
        text: t.daily_intentions.map((i: string) => `• ${i}`).join("\n"),
        delay: delay++ + STAGGER,
      });
    }

    if (t.evening_close) {
      items.push({
        icon: <Clock className="h-3 w-3" />,
        label: "Evening close",
        text: t.evening_close,
        delay: delay++ + STAGGER,
      });
    }

    if (t.spiral_marker || t.tradition_lens || t.chakra_focus) {
      const lineageParts: string[] = [];
      if (typeof t.spiral_marker === "string") lineageParts.push(t.spiral_marker);
      if (t.tradition_lens) {
        const tl = t.tradition_lens as any;
        if (tl.translation) lineageParts.push(tl.translation);
        else if (tl.sanskrit) lineageParts.push(tl.sanskrit);
      }
      if (t.chakra_focus) {
        const cf = t.chakra_focus as any;
        if (cf.english) lineageParts.push(cf.english);
        else if (cf.sanskrit) lineageParts.push(cf.sanskrit);
      }
      const lineage = lineageParts.join(" · ");
      if (lineage) {
        items.push({
          icon: <Compass className="h-3 w-3" />,
          label: "Lineage",
          text: lineage,
          delay: delay++ + STAGGER,
        });
      }
    }

    return items;
  }, [theme]);

  if (isLoading || isFetching || isComposing) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-20 text-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm text-muted-foreground"
        >
          Your guide is composing today…
        </motion.div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">No theme yet. Hold the orb to begin.</p>
      </div>
    );
  }

  const themeAny = theme as any;
  const arcInfo = themeAny.sequence_no != null && themeAny.max_depth
    ? `Thread ${themeAny.sequence_no} of ${themeAny.max_depth}`
    : null;
  const phaseLabel = themeAny.evolution_status
    ? themeAny.evolution_status.charAt(0).toUpperCase() + themeAny.evolution_status.slice(1)
    : null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6 space-y-3 pb-24">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/40 p-5 sm:p-7 backdrop-blur-sm"
      >
        {/* Premium accent: top gradient */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
          aria-hidden
        />
        {/* Side accent strip */}
        <div className="pointer-events-none absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-foreground/20 via-foreground/10 to-transparent" aria-hidden />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase text-foreground/35 mb-2">
          Day {themeAny.journey_day || 1}
          {arcInfo && ` · ${arcInfo}`}
          {phaseLabel && ` · ${phaseLabel}`}
        </p>
        <h1 className="text-[28px] sm:text-[34px] font-display font-semibold leading-[1.05] tracking-tight text-foreground/90">
          {themeAny.title}
        </h1>
        {themeAny.theme_rationale && (
          <p className="mt-2.5 text-[13px] text-foreground/65 leading-[1.65]">
            {typeof themeAny.theme_rationale === "string"
              ? themeAny.theme_rationale
              : themeAny.theme_rationale?.whyToday || themeAny.theme_rationale?.summary || ""}
          </p>
        )}
        {themeAny.felt_sense_opener && (
          <p className="mt-2 text-[12px] text-foreground/50 italic leading-relaxed">
            "{themeAny.felt_sense_opener}"
          </p>
        )}
        {themeAny.description && (
          <p className="mt-2 text-[12px] text-foreground/35 leading-relaxed line-clamp-2">
            {themeAny.description}
          </p>
        )}
      </motion.div>

      {/* ── Surfaces ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        {surfaces.map((s, i) => (
          <SurfaceCard key={i} {...s} />
        ))}
      </div>

      {/* ── Arc position ───────────────────────────────────────────── */}
      {themeAny.current_depth != null && themeAny.max_depth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="pt-3 pb-1"
        >
          <div className="flex items-center justify-between text-[10px] text-foreground/40">
            <span className="font-display tracking-[0.2em] uppercase">
              Depth {themeAny.current_depth} / {themeAny.max_depth}
            </span>
            {themeAny.spiral_marker && (
              <span className="font-body italic text-foreground/40">{themeAny.spiral_marker}</span>
            )}
          </div>
          <div className="mt-1.5 h-[3px] rounded-full bg-card/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-foreground/20 via-foreground/45 to-foreground/20 transition-all duration-700"
              style={{ width: `${Math.min(100, (themeAny.current_depth / themeAny.max_depth) * 100)}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Orb spacer — the orb lives outside this component (pinned bottom) ── */}
      <div className="h-16" />
    </div>
  );
}
