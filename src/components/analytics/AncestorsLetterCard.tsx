/**
 * AncestorsLetterCard
 * ───────────────────
 * Weekly letter from a long-departed master in the user's lineage.
 * Content is composed client-side from the user's dimension data + a curated
 * letter template per master. Pure additive UI — no backend.
 *
 * Cycles weekly: ISO week number % 3 picks one of the three lineage masters.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, X } from "lucide-react";
import { deriveLineage } from "@/data/lineageMap";

interface Props {
  strongestDimension?: string | null;
  userName?: string;
}

interface LetterTemplate {
  greeting: (name: string) => string;
  body: string[];
  blessing: string;
}

// Lightweight templates per known master name — falls back to generic.
const LETTERS: Record<string, LetterTemplate> = {
  "Ramana Maharshi": {
    greeting: (n) => `Beloved ${n},`,
    body: [
      "I write to you across the silence. The only question that ever mattered is still the same: Who is the one reading these words?",
      "Do not search for me in books. Sit. Ask. Wait. The 'I' that asks will dissolve into the 'I' that simply is.",
      "Your loops are not enemies. They are messengers, asking the same question in a louder voice. Listen, then let go.",
    ],
    blessing: "Be still, and know.",
  },
  "Nisargadatta Maharaj": {
    greeting: (n) => `${n},`,
    body: [
      "You came again to the cigarette shop of the mind. Buying thoughts, smoking them, discarding them. Still you remain.",
      "The body is not you. The mind is not you. The witness is not you. Even 'I am' is a borrowed clothing.",
      "Drop the false. What remains, without effort, is the real. Nothing else is needed.",
    ],
    blessing: "Stay with 'I am'.",
  },
  "Adyashanti": {
    greeting: (n) => `Friend ${n},`,
    body: [
      "Awakening is not the end. It is the beginning of the longest tenderness.",
      "Notice the part of you that wants this week to look different than it did. Notice — and let even that wanting be allowed.",
      "Freedom is not somewhere else. It is the simple permission for this moment to be as it is.",
    ],
    blessing: "Allow. Allow. Allow.",
  },
  "Rumi": {
    greeting: (n) => `Beloved ${n},`,
    body: [
      "The wound is the place where the light enters. Do not bandage it too quickly.",
      "Whatever you ran from this week — sit with it tonight. The thing chasing you is your own forgotten self.",
      "Dance, even alone in your kitchen. The body remembers what the mind has misplaced.",
    ],
    blessing: "Out beyond ideas, I will meet you there.",
  },
};

const GENERIC: LetterTemplate = {
  greeting: (n) => `Dear ${n},`,
  body: [
    "Across the centuries the same waters keep flowing through different forms. This week, you drank from them too.",
    "Do not mistake the difficulty of the path for proof that you are off it. Difficulty often means you are exactly on it.",
    "Practice slowly. Notice gently. The work is not to become someone new — it is to stop forgetting who you already are.",
  ],
  blessing: "Walk well.",
};

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function AncestorsLetterCard({ strongestDimension, userName }: Props) {
  const lineage = useMemo(() => {
    const dim = strongestDimension || "awareness";
    return deriveLineage({ [dim]: 10 }, 6);
  }, [strongestDimension]);

  const master = useMemo(() => {
    const masters = lineage.masters;
    if (!masters.length) return null;
    const wk = isoWeek(new Date());
    return masters[wk % masters.length];
  }, [lineage]);

  const [open, setOpen] = useState(false);

  if (!master) return null;

  const masterName = master.name;
  const tpl = LETTERS[masterName] || GENERIC;
  const name = userName || "friend";

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-left rounded-2xl p-4 mb-4
                   bg-gradient-to-br from-amber-500/10 via-background/40 to-background/80
                   border border-amber-400/20 hover:border-amber-400/40 transition group"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
            <Feather className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80 mb-1">
              A letter from your lineage
            </p>
            <h3 className="font-display text-base text-foreground leading-snug">
              {masterName} writes to you this week
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tap to open the letter
            </p>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-xl overflow-y-auto"
          >
            <motion.article
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl mx-auto px-6 py-12 relative"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80 mb-3">
                A letter across time
              </p>
              <h2 className="font-display text-3xl text-foreground mb-1">
                {masterName}
              </h2>
              <p className="text-xs text-muted-foreground mb-8">
                Your lineage · this week
              </p>

              <p className="font-display text-lg text-foreground mb-6">
                {tpl.greeting(name)}
              </p>

              {tpl.body.map((para, i) => (
                <p
                  key={i}
                  className="text-[15px] text-foreground/85 leading-relaxed mb-5"
                >
                  {para}
                </p>
              ))}

              <p className="mt-8 italic text-amber-200/90 text-lg border-l-2 border-amber-400/40 pl-4">
                {tpl.blessing}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                — {masterName}
              </p>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
