// "The Council met about you" — 1–3 master quorum with tappable portraits.
// The count is dynamic: it mirrors the session's actual diversity (max 3).

// Every master is here for a real reason tied to a specific step kind.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CouncilMember } from "./stepRevolution";

interface CouncilHeaderProps {
  council: CouncilMember[];
  verdicts: string[];
  totalMasters?: number;
}

const COUNT_WORD = ["", "one", "two", "three", "four", "five"];

export function CouncilHeader({ council, verdicts, totalMasters = 118 }: CouncilHeaderProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!council.length) return null;

  const active = openIdx !== null ? council[openIdx] : null;
  const countWord = COUNT_WORD[council.length] || String(council.length);
  const masterWord = council.length === 1 ? "master" : "masters";

  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-md p-4 sm:p-5">
      <p className="text-[10px] font-display tracking-[0.3em] uppercase text-primary/70 text-center mb-3">
        {council.length === 1 ? "Your Master Speaks" : "The Council Convened"}
      </p>
      <div className="flex items-center justify-center gap-4 mb-3 flex-wrap">
        {council.map((m, i) => {
          const g = m.guru;
          const isOpen = openIdx === i;
          return (
            <button
              key={g.id + i}
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="flex flex-col items-center group focus:outline-none"
              aria-expanded={isOpen}
            >
              <div
                className={
                  "h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-cover bg-center shadow-lg transition-all " +
                  (isOpen
                    ? "border-2 border-primary scale-110 shadow-primary/40"
                    : "border-2 border-primary/30 group-hover:border-primary/60 group-hover:scale-105")
                }
                style={{ backgroundImage: g.image ? `url(${g.image})` : undefined }}
              />
              <p className="mt-1.5 text-[10px] uppercase tracking-wider text-foreground/80 max-w-[80px] text-center truncate">
                {g.name}
              </p>
              {m.isPrimary && (
                <span className="mt-0.5 text-[8px] tracking-wider uppercase text-primary/80">
                  your guru
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={`v-${openIdx}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-primary/20 bg-background/40 p-3 text-center"
          >
            <p className="text-xs text-foreground/90 leading-relaxed">
              <span className="font-medium text-primary/90">{active.guru.name}</span>{" "}
              {verdicts[openIdx!] || "chose this for you."}
            </p>
            {active.guru.keyTeaching && (
              <p className="mt-1.5 text-[11px] italic text-muted-foreground/80 leading-snug">
                "{active.guru.keyTeaching}"
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5 text-center"
          >
            {council.map((m, i) => (
              <p key={m.guru.id + i} className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground/90 font-medium">{m.guru.name.split(" ")[0]}</span>{" "}
                {verdicts[i] || "chose this for you."}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
        {active
          ? "tap again to close"
          : `${countWord} of ${totalMasters} ${masterWord} chose this session for you`}
      </p>
    </div>
  );
}
