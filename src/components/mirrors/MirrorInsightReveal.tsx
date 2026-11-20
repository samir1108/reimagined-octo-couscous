import { motion } from 'framer-motion';
import { Button } from "@/design-system";
import { Card } from "@/design-system";
import { ArrowRight, RefreshCw, Library as LibraryIcon, Sparkles, TriangleAlert } from 'lucide-react';
import type { MirrorInsight } from '@/lib/mirrors/insightBuilder';

/**
 * The reveal shown the moment a mirror is completed.
 *
 * Order matters here. The headline and reading come first and unadorned, then
 * the tension — the part of the profile that disagrees with itself — and only
 * then the next action. Leading with the next action would make the whole
 * thing feel like a productivity tool; leading with the tension is what makes
 * it worth reading.
 *
 * The confidence note is rendered plainly rather than hidden. A preliminary
 * reading that says so is more useful than a confident reading that is wrong.
 */

const BAND_LABEL: Record<string, string> = {
  preliminary: 'Preliminary',
  inferred: 'Inferred',
  read: 'Direct read',
  locked: 'Locked',
};

const CARD_TONE: Record<string, string> = {
  strength: 'border-emerald-500/25 bg-emerald-500/5',
  shadow: 'border-amber-500/25 bg-amber-500/5',
  edge: 'border-border bg-muted/30',
};

interface Props {
  insight: MirrorInsight | null;
  slug: string;
  onRetake: () => void;
  onDone: () => void;
}

export default function MirrorInsightReveal({ insight, slug, onRetake, onDone }: Props) {
  if (!insight) {
    return (
      <div className="max-w-2xl mx-auto pt-16 text-center">
        <p className="text-sm text-muted-foreground">Your reading is saved.</p>
        <Button variant="outline" className="mt-6" onClick={onDone}>
          <LibraryIcon className="w-4 h-4 mr-2" /> Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 pt-4 sm:pt-8">
      <div className="flex items-center justify-between mb-6 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span>Mirror {insight.mirrorNumber} · {insight.module}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-border px-2 py-0.5">
            {BAND_LABEL[insight.band] ?? insight.band}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5">
            asked at {insight.tier ?? 'surface'} depth
          </span>
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-4">
          {insight.headline}
        </h1>

        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line mb-8">
          {insight.reading}
        </p>
      </motion.div>

      {insight.tension && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-5 mb-4 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <TriangleAlert className="w-3.5 h-3.5 text-primary" />
              <h2 className="font-display text-xs uppercase tracking-widest text-primary">
                Where this disagrees with itself
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{insight.tension}</p>
          </Card>
        </motion.div>
      )}

      {insight.cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid gap-3 sm:grid-cols-2 mb-4"
        >
          {insight.cards.map((card) => (
            <Card key={card.title} className={`p-4 ${CARD_TONE[card.type] ?? CARD_TONE.edge}`}>
              <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">{card.body}</p>
            </Card>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <h2 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              What changes from here
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{insight.nextAction}</p>

          {insight.practiceAffinity.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
              {insight.practiceAffinity.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px]"
                >
                  {p.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl border border-dashed border-border p-4 mb-8"
      >
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
          How much this is worth
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {insight.confidenceNote}
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onRetake} className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" /> Read it again
        </Button>
        <Button onClick={onDone} className="flex-[2]">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 mt-4 text-center">
        Saved as mirror {insight.mirrorNumber} · {slug}
      </p>
    </div>
  );
}
