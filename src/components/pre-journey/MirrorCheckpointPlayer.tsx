// Mirror checkpoint launcher — opens after every 2nd Foundation session.
// Each checkpoint is a FULL Library assessment (12-50 questions). This screen
// frames the moment, then hands off to the AssessmentRunner at /app/library/:slug.
// On return, hooks/usePreJourney detects the saved user_assessment_results row
// and marks the mirror complete.

import { motion } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/design-system";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { MirrorCheckpoint } from '@/data/pre-journey/mirrors';
import { MIRROR_TOTAL } from '@/data/pre-journey/mirrors';
import LoopMappingQuestionnaire from './LoopMappingQuestionnaire';

interface MirrorPlayerProps {
  checkpoint: MirrorCheckpoint;
  afterSessionId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface AssessmentMeta {
  title: string;
  cover_emoji: string | null;
  intro: string | null;
  question_count: number;
  estimated_minutes: number;
  tradition: string;
}

export function MirrorCheckpointPlayer({
  checkpoint,
  onClose,
  onComplete,
}: MirrorPlayerProps) {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<AssessmentMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoopMap = checkpoint.kind === 'loop-map';

  useEffect(() => {
    if (isLoopMap) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('assessment_definitions')
        .select('title, cover_emoji, intro, question_count, estimated_minutes, tradition')
        .eq('slug', checkpoint.assessmentSlug)
        .maybeSingle();
      if (!cancelled) {
        setMeta(data as AssessmentMeta | null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [checkpoint.assessmentSlug, isLoopMap]);

  const handleBegin = () => {
    // Hand off to the existing Library assessment runner.
    // usePreJourney will detect completion and seal the mirror.
    navigate(`/app/library/${checkpoint.assessmentSlug}?from=mirror&n=${checkpoint.number}`);
  };

  // Loop-map mirror: render the dedicated questionnaire (intensity / triggers / connections).
  if (isLoopMap) {
    return (
      <LoopMappingQuestionnaire
        onClose={onClose}
        onComplete={() => onComplete()}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[140] bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wider">
              Mirror {checkpoint.number} / {MIRROR_TOTAL} · {checkpoint.module}
            </p>
            <p className="text-sm font-medium mt-0.5 line-clamp-1">{checkpoint.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-xl mx-auto px-5 py-12 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Mirror Checkpoint
          </div>

          <p className="text-sm text-muted-foreground italic mb-8">{checkpoint.hook}</p>

          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          ) : meta ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-border bg-card p-8 text-left shadow-sm"
            >
              <div className="text-5xl mb-4">{meta.cover_emoji ?? '🪞'}</div>
              <h2 className="text-2xl md:text-3xl font-semibold leading-snug text-foreground">
                {meta.title}
              </h2>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                {meta.tradition}
              </p>
              {meta.intro && (
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {meta.intro}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
                <span>⏱ {meta.estimated_minutes} min</span>
                <span>•</span>
                <span>{meta.question_count} questions</span>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              This mirror is not available yet. Skip for now and continue your journey.
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
            Sit with this fully. Your answers feed the engine that personalises every session
            after this — and they shape how deeply this same mirror asks next time.
          </p>
        </motion.div>
      </div>


      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-xl mx-auto flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            Later
          </Button>
          <Button
            size="lg"
            className="flex-[2]"
            onClick={handleBegin}
            disabled={loading || !meta}
          >
            Begin mirror
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
