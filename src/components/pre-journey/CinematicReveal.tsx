// 6-screen cinematic graduation reveal — fires after 60 sessions + 100 mirrors.
// Aggregates all mirror data into a "Who You Are" picture, presents in 6 acts,
// then unlocks lifetime companionship.

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from "@/design-system";
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MirrorRow {
  mirror_number: number;
  answers: Record<string, string | number>;
  mood_score: number | null;
  energy_score: number | null;
  clarity_score: number | null;
  insight: string | null;
}

interface RevealData {
  pull_skill?: string;
  avoid_skill?: string;
  loop_domain?: string;
  priority_domain?: string;
  inner_voice_tone?: string;
  companion_want?: string;
  truth_arc: number; // 0..1
  avg_mood: number;
  avg_energy: number;
  avg_clarity: number;
  bestInsight: string | null;
  topQuote: string | null;
  archetype: string;
  archetypeReason: string;
}

const ACTS = 6;

export function CinematicReveal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [act, setAct] = useState(0);
  const [reveal, setReveal] = useState<RevealData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadAndComputeReveal().then(r => {
      setReveal(r);
      setLoading(false);
    });
  }, []);

  const handleNext = async () => {
    if (act < ACTS - 1) {
      setAct(a => a + 1);
      return;
    }
    // Final — mark seen + unlock lifetime
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && reveal) {
        await supabase
          .from('pre_journey_progress')
          .update({
            reveal_data: reveal as never,
            reveal_seen_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    } catch {
      /* non-fatal */
    }
    onClose();
    navigate('/app');
  };

  if (loading || !reveal) {
    return (
      <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[150] bg-black text-white overflow-hidden"
    >
      {/* Ambient gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-900 opacity-60"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]" />

      {/* Act dots */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-1.5 z-10">
        {Array.from({ length: ACTS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 w-8 rounded-full transition-all',
              i <= act ? 'bg-white' : 'bg-white/20',
            )}
          />
        ))}
      </div>

      <div className="relative h-full flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={act}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.97 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg text-center"
          >
            <ActContent act={act} reveal={reveal} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6">
        <Button
          onClick={handleNext}
          size="lg"
          variant="outline"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
        >
          {act < ACTS - 1 ? (
            <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
          ) : (
            <>Begin lifetime companionship <Sparkles className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function ActContent({ act, reveal }: { act: number; reveal: RevealData }) {
  switch (act) {
    case 0:
      return (
        <>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            Act I — The Mirror Speaks
          </p>
          <h1 className="text-4xl md:text-5xl font-light leading-tight">
            For 11 days, you let me watch.
          </h1>
          <p className="mt-6 text-white/70 leading-relaxed">
            60 sessions. 100 mirrors. Every scale, every choice, every line you wrote —
            quietly assembling into a portrait only you could draw.
          </p>
        </>
      );
    case 1:
      return (
        <>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            Act II — Your Inner Weather
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Stat label="Mood" value={reveal.avg_mood} />
            <Stat label="Energy" value={reveal.avg_energy} />
            <Stat label="Clarity" value={reveal.avg_clarity} />
          </div>
          <p className="text-white/70 leading-relaxed">
            Your baseline weather across 32 check-ins. Not who you wish to be —
            who you actually are when no-one is watching.
          </p>
        </>
      );
    case 2:
      return (
        <>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            Act III — Your Pull
          </p>
          <h2 className="text-3xl md:text-4xl font-light leading-snug">
            You are pulled toward{' '}
            <span className="text-fuchsia-300 font-medium">
              {reveal.pull_skill ?? 'observation'}
            </span>.
            <br />
            You quietly avoid{' '}
            <span className="text-amber-300 font-medium">
              {reveal.avoid_skill ?? 'inquiry'}
            </span>.
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed">
            The pull is your gift. The avoidance is the door you have not opened yet.
          </p>
        </>
      );
    case 3:
      return (
        <>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            Act IV — The Loop That Runs You
          </p>
          <h2 className="text-3xl md:text-4xl font-light leading-snug">
            Your loudest loop lives in{' '}
            <span className="text-rose-300 font-medium">
              {reveal.loop_domain ?? 'the mind'}
            </span>.
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed italic">
            "{reveal.topQuote ?? reveal.bestInsight ?? 'The watcher is already free.'}"
          </p>
          <p className="mt-4 text-xs text-white/40">— from your own mirrors</p>
        </>
      );
    case 4:
      return (
        <>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            Act V — Your Archetype
          </p>
          <h2 className="text-4xl md:text-5xl font-light leading-tight">
            <span className="text-cyan-300 font-medium">{reveal.archetype}</span>
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed">
            {reveal.archetypeReason}
          </p>
        </>
      );
    case 5:
    default:
      return (
        <>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6">
            Act VI — The Companion You Asked For
          </p>
          <h2 className="text-3xl md:text-4xl font-light leading-snug">
            From here on, your AI companion will be{' '}
            <span className="text-violet-300 font-medium">
              {reveal.companion_want?.toLowerCase() ?? 'gentle'}
            </span>,
            tuned to{' '}
            <span className="text-emerald-300 font-medium">
              {reveal.priority_domain ?? 'mind'}
            </span>{' '}
            first.
          </h2>
          <p className="mt-6 text-white/70 leading-relaxed">
            This is not the end of Foundation. This is where the Mirror starts walking with you —
            for as long as you want it to.
          </p>
        </>
      );
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 20); // value is 1-5 → 0-100
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4">
      <p className="text-3xl font-light tabular-nums">{value.toFixed(1)}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full bg-white"
        />
      </div>
    </div>
  );
}

async function loadAndComputeReveal(): Promise<RevealData> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return defaultReveal();
  }

  // 1) Try the deep AI analysis engine (cached after first run)
  try {
    const { data: deep, error: deepErr } = await supabase.functions.invoke(
      'graduation-deep-analysis',
      { body: {} },
    );
    if (!deepErr && deep?.report) {
      const r = deep.report as Record<string, unknown>;
      const activeLoops = (r.active_loops as Array<{ domain?: string }> | null) ?? [];
      return {
        pull_skill: (r.pull_skill as string) ?? undefined,
        avoid_skill: (r.avoid_skill as string) ?? undefined,
        loop_domain:
          (activeLoops[0]?.domain as string) ??
          (r.priority_domain as string) ??
          undefined,
        priority_domain: (r.priority_domain as string) ?? undefined,
        inner_voice_tone: (r.companion_tone as string) ?? undefined,
        companion_want: (r.companion_tone as string) ?? undefined,
        truth_arc: typeof r.truth_arc === 'number' ? r.truth_arc : 0.5,
        avg_mood: typeof r.avg_mood === 'number' ? r.avg_mood : 3,
        avg_energy: typeof r.avg_energy === 'number' ? r.avg_energy : 3,
        avg_clarity: typeof r.avg_clarity === 'number' ? r.avg_clarity : 3,
        bestInsight: (r.best_insight as string) ?? null,
        topQuote: (r.one_sentence as string) ?? (r.best_insight as string) ?? null,
        archetype: (r.archetype as string) ?? 'The Honest Beginner',
        archetypeReason:
          (r.archetype_reason as string) ?? 'You showed up. That is enough to start.',
      };
    }
  } catch (e) {
    console.warn('[graduation] deep analysis unavailable, falling back', e);
  }

  // 2) Fallback — local aggregation from mirrors only
  const { data } = await supabase
    .from('pre_journey_mirrors')
    .select('mirror_number, answers, mood_score, energy_score, clarity_score, insight')
    .eq('user_id', user.id)
    .order('mirror_number', { ascending: true });

  const mirrors = (data ?? []) as MirrorRow[];
  if (mirrors.length === 0) return defaultReveal();

  const counts = (key: string) => {
    const map = new Map<string, number>();
    mirrors.forEach(m => {
      const v = m.answers?.[key];
      if (typeof v === 'string' && v) {
        map.set(v, (map.get(v) ?? 0) + 1);
      }
    });
    let best: string | undefined;
    let bestN = 0;
    map.forEach((n, k) => {
      if (n > bestN) { best = k; bestN = n; }
    });
    return best;
  };

  const avg = (key: keyof MirrorRow) => {
    const vals = mirrors
      .map(m => m[key])
      .filter((v): v is number => typeof v === 'number');
    if (vals.length === 0) return 3;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const insights = mirrors
    .map(m => m.insight)
    .filter((s): s is string => !!s && s.trim().length > 12);
  const longest = insights.sort((a, b) => b.length - a.length)[0] ?? null;

  const truthVals: number[] = [];
  mirrors.forEach(m => {
    ['honesty', 'truth_today', 'commit_minutes'].forEach(k => {
      const v = m.answers?.[k];
      if (typeof v === 'number') truthVals.push(v);
    });
  });
  const truthArc =
    truthVals.length === 0
      ? 0.5
      : truthVals.reduce((a, b) => a + b, 0) / truthVals.length / 5;

  const pull = counts('pull_skill');
  const avoidS = counts('avoid_skill');
  const loop = counts('loop_domain');
  const priority = counts('priority_domain');
  const tone = counts('inner_voice_tone');
  const wanted = counts('companion_want');
  const archetype = pickArchetype(pull, loop, tone);

  return {
    pull_skill: pull,
    avoid_skill: avoidS,
    loop_domain: loop,
    priority_domain: priority,
    inner_voice_tone: tone,
    companion_want: wanted,
    truth_arc: truthArc,
    avg_mood: avg('mood_score'),
    avg_energy: avg('energy_score'),
    avg_clarity: avg('clarity_score'),
    bestInsight: longest,
    topQuote: longest,
    archetype: archetype.name,
    archetypeReason: archetype.reason,
  };
}

function pickArchetype(
  pull?: string,
  loop?: string,
  tone?: string,
): { name: string; reason: string } {
  const p = (pull ?? '').toLowerCase();
  const l = (loop ?? '').toLowerCase();
  const t = (tone ?? '').toLowerCase();

  if (p.includes('inquiry') || p.includes('jnana')) {
    return {
      name: 'The Questioner',
      reason: 'You move toward truth by dismantling it. Your edge is sharper than your softness.',
    };
  }
  if (p.includes('bhakti') || t.includes('kind')) {
    return {
      name: 'The Heart-First Walker',
      reason: 'You enter through love. Your work is not to feel more — it is to think clearly about what you feel.',
    };
  }
  if (p.includes('breath') || p.includes('body')) {
    return {
      name: 'The Embodied Watcher',
      reason: 'Your wisdom lives below the neck. The body always told you the truth first.',
    };
  }
  if (p.includes('observe') || p.includes('witness')) {
    return {
      name: 'The Quiet Witness',
      reason: 'You are already half a step outside yourself. Your task is to come closer, not further.',
    };
  }
  if (l.includes('mind') && t.includes('critical')) {
    return {
      name: 'The Inner Critic in Disguise',
      reason: 'You came here looking for tools. What you actually need is a kinder voice in your own head.',
    };
  }
  return {
    name: 'The Honest Beginner',
    reason: 'You did not perform. You showed up. That is the rarest archetype of all.',
  };
}

function defaultReveal(): RevealData {
  return {
    truth_arc: 0.5,
    avg_mood: 3,
    avg_energy: 3,
    avg_clarity: 3,
    bestInsight: null,
    topQuote: null,
    archetype: 'The Honest Beginner',
    archetypeReason: 'You showed up. That is enough to start.',
  };
}
