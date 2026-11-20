/**
 * FoundationWelcomeCards — first-time intro shown once after auto-enrollment.
 * Three short cards explaining the Foundation, then they melt away.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MessageCircle, Eye, Infinity as InfinityIcon } from 'lucide-react';
import { Button } from "@/design-system";

const CARDS = [
  {
    icon: MessageCircle,
    title: 'You and your guide, talking',
    body: 'For the next little while, your guide will walk you through 60 short sessions — as a real conversation, not a lecture. Reply when something lands. Skip when it doesn\'t.',
    accent: 'from-violet-500/20 to-indigo-500/10',
  },
  {
    icon: Eye,
    title: 'Mirrors show you to yourself',
    body: 'Every two sessions, a Mirror unlocks — a deeper question that reveals where you actually stand. 32 in total. They are not tests. They are how the app learns who you are.',
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: InfinityIcon,
    title: 'No pace. No pressure.',
    body: 'One session a day is plenty. Forty in a weekend is fine too. Miss a week and nothing breaks. When the 60 + 32 are done, your lifetime companion wakes up — and stays with you forever.',
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
];

export function FoundationWelcomeCards({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const card = CARDS[i];
  const Icon = card.icon;
  const isLast = i === CARDS.length - 1;

  return (
    <div className="fixed inset-0 z-[140] bg-background/95 backdrop-blur-md flex items-center justify-center px-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="max-w-md w-full"
        >
          <div className={`rounded-3xl p-8 bg-gradient-to-br ${card.accent} border border-border/40`}>
            <div className="w-12 h-12 rounded-2xl bg-background/80 border border-border flex items-center justify-center mb-5">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-foreground">
              {card.title}
            </h2>
            <p className="text-foreground/80 mt-3 leading-relaxed text-[15px]">
              {card.body}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-1.5">
              {CARDS.map((_, n) => (
                <div
                  key={n}
                  className={`h-1.5 rounded-full transition-all ${
                    n === i ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/30'
                  }`}
                />
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => (isLast ? onDone() : setI(i + 1))}
            >
              {isLast ? 'Begin' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {!isLast && (
            <button
              onClick={onDone}
              className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition"
            >
              Skip intro
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
