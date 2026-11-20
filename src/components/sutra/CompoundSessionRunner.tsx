/**
 * CompoundSessionRunner — orchestrates a multi-block plan from the orchestrator.
 *
 * The orchestrator may return 2 blocks (e.g. Wisdom → Practice → Journal).
 * When the user completes block N, we navigate to block N+1's route after a brief
 * "Next step" reveal so it feels like one continuous session, not two clicks.
 *
 * Activated via location.state.sutraPlan + sutraBlock from SessionIntroCard.
 * Each session-end surface (orb, guide, journal, witness) calls finishCurrentBlock()
 * via useCompoundSession() — that hook reads the state, fires `complete` feedback,
 * and either advances to the next block or closes the chain.
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { NextSessionPlan, SessionBlock } from "@/lib/sutra/orchestrator";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";

export interface SutraNavState {
  plan?: NextSessionPlan;
  sutraBlock?: SessionBlock;
  blockIndex?: number;
}

/** Hook used inside any session surface (orb, guide, journal, witness, evening)
 *  to mark the current block complete and advance. */
export function useCompoundSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { submit } = useSessionFeedback();

  const state = (location.state || {}) as SutraNavState;
  const plan = state.plan;
  const currentIndex = typeof state.blockIndex === "number" ? state.blockIndex : 0;
  const currentBlock = state.sutraBlock || plan?.blocks?.[currentIndex];
  const hasNext = !!plan && currentIndex + 1 < (plan.blocks?.length || 0);

  const finish = useCallback(
    async (opts?: { quality?: number }) => {
      if (currentBlock?.practice) {
        await submit({
          practice: currentBlock.practice,
          kind: "complete",
          quality: opts?.quality ?? 0.6,
        });
      }
      if (!plan || !hasNext) return { advanced: false };
      const nextIndex = currentIndex + 1;
      const nextBlock = plan.blocks[nextIndex];
      // Brief delay to let UX settle, then navigate to next block route
      navigate(nextBlock.route, {
        state: { plan, sutraBlock: nextBlock, blockIndex: nextIndex } as SutraNavState,
      });
      return { advanced: true, nextBlock };
    },
    [currentBlock, plan, hasNext, currentIndex, navigate, submit],
  );

  return {
    plan,
    currentBlock,
    currentIndex,
    hasNext,
    isInCompound: !!plan && (plan.blocks?.length || 0) > 1,
    finish,
  };
}

/** Optional reveal banner that any surface can render to show
 *  "Step 2 of 3 · {practice}" while inside a compound session. */
export function CompoundProgressPill() {
  const { plan, currentIndex, isInCompound, currentBlock } = useCompoundSession();
  if (!isInCompound || !plan || !currentBlock) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur border border-border text-[11px]"
      >
        <span className="text-muted-foreground uppercase tracking-wider">
          Step {currentIndex + 1}/{plan.blocks.length}
        </span>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-foreground">{currentBlock.label}</span>
      </motion.div>
    </div>
  );
}

/** Inline "next step" reveal — shown after a block completes, before navigating. */
export function CompoundNextStepReveal({
  open,
  onContinue,
  onClose,
}: {
  open: boolean;
  onContinue: () => void;
  onClose: () => void;
}) {
  const { plan, currentIndex } = useCompoundSession();
  const next = plan?.blocks?.[currentIndex + 1];

  return (
    <AnimatePresence>
      {open && next && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-xl flex items-center justify-center p-5"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm text-center"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Continue the thread
            </div>
            <div className="text-xl font-light text-foreground mb-2">{next.label}</div>
            <div className="text-sm text-muted-foreground mb-7 px-3">{next.intro}</div>
            <button
              onClick={onContinue}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition mb-2 inline-flex items-center justify-center gap-1.5"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-[11px] text-muted-foreground hover:text-foreground transition"
            >
              End here
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
