/**
 * SessionOrchestratorContext
 * --------------------------
 * Drives multi-step "spiral" sessions across all surfaces (guide, journal,
 * practice, witness, wisdom, orb). Theme + ordered blocks come from
 * NextSessionPlan (sutra orchestrator). This context tracks which step is
 * active, persists across refreshes, and exposes start/advance/complete/stop.
 *
 * UI layers (NextStepBanner + StepTransitionCard) consume this and mount
 * globally inside <AppEntry/> so they appear on every surface.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type { NextSessionPlan, SessionBlock } from "@/lib/sutra/orchestrator";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "hope-app-active-spiral-v1";

export interface ActiveSpiralState {
  plan: NextSessionPlan;
  guruId: string | null;
  currentIndex: number;
  /** indices of completed blocks */
  completed: number[];
  /** true when between-step transition card should show */
  showTransition: boolean;
  startedAt: number;
}

interface OrchestratorAPI {
  active: ActiveSpiralState | null;
  /** start spiral and route to first block */
  start: (plan: NextSessionPlan, guruId?: string | null) => void;
  /** mark current step complete; if more steps, show transition card */
  completeCurrent: () => Promise<void>;
  /** continue from transition card → route to next block */
  advance: () => void;
  /** abort everything */
  stop: () => void;
  /** convenience for surface pages */
  isActive: boolean;
  currentBlock: SessionBlock | null;
  nextBlock: SessionBlock | null;
  totalSteps: number;
  stepNumber: number;
}

const Ctx = createContext<OrchestratorAPI | null>(null);

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "late night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

function blockRoute(
  block: SessionBlock,
  guruId: string | null,
  plan?: NextSessionPlan,
  meta?: { totalBlocks?: number; blockIndex?: number },
): string {
  let route = block.route;
  const sep = route.includes("?") ? "&" : "?";
  const params: string[] = [];
  if (guruId) params.push(`guruId=${encodeURIComponent(guruId)}`);

  // ─── Structured JOURNEY_SESSION header ───
  // Edge function `guide-chat` parses these fields and uses them to compose
  // a 4-beat opener (greet → locate → teach → hand off). Keep field names
  // stable; new fields are additive.
  const blockNum = (meta?.blockIndex ?? 0) + 1;
  const blockTotal = meta?.totalBlocks ?? 1;
  const ctx = [
    `JOURNEY_SESSION`,
    `GREETING: ${getGreeting()}`,
    `SOURCE: orchestrator`,
    `SESSION: ${blockNum} of ${blockTotal}`,
    `DAY_LABEL: Step ${blockNum} of ${blockTotal}`,
    plan ? `THEME: ${plan.sessionTheme.title}` : "",
    plan?.sessionTheme?.micro ? `MICRO: ${plan.sessionTheme.micro}` : "",
    `BLOCK: ${block.label} (${block.practice}, ~${Math.round(block.durationSec / 60)}m)`,
    block.intro ? `TEACHING: ${block.intro}` : "",
    plan?.why ? `WHY: ${plan.why}` : "",
    plan?.observationTail ? `REFLECTION: ${plan.observationTail}` : "",
  ].filter(Boolean).join("\n");
  params.push(`aiContext=${encodeURIComponent(ctx)}`);

  if (params.length) route = `${route}${sep}${params.join("&")}`;
  return route;
}


export function SessionOrchestratorProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveSpiralState | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ActiveSpiralState;
      // Expire after 12h
      if (Date.now() - parsed.startedAt > 12 * 60 * 60 * 1000) return null;
      return parsed;
    } catch {
      return null;
    }
  });

  // persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (active) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [active]);

  const start = useCallback(
    (plan: NextSessionPlan, guruId: string | null = null) => {
      if (!plan?.blocks?.length) return;
      const state: ActiveSpiralState = {
        plan,
        guruId,
        currentIndex: 0,
        completed: [],
        showTransition: false,
        startedAt: Date.now(),
      };
      setActive(state);
      navigate(blockRoute(plan.blocks[0], guruId, plan, { totalBlocks: plan.blocks.length, blockIndex: 0 }), {
        state: { sutraBlock: plan.blocks[0], plan },
      });
    },
    [navigate],
  );

  const completeCurrent = useCallback(async () => {
    // Snapshot current spiral synchronously
    const prev = active;
    if (!prev) return;
    const isLast = prev.currentIndex >= prev.plan.blocks.length - 1;
    const completed = prev.completed.includes(prev.currentIndex)
      ? prev.completed
      : [...prev.completed, prev.currentIndex];

    if (isLast) {
      setActive(null);
      navigate("/app");
      return;
    }

    // Mark transition card visible immediately so UX feels snappy
    setActive({ ...prev, completed, showTransition: true });

    // Mid-session adaptive injection — fire-and-await with short timeout.
    // If it returns 'replace' or 'inject', mutate the plan in-place so the
    // transition card + advance() pick up the new block.
    try {
      const completedBlock = prev.plan.blocks[prev.currentIndex];
      const nextBlock = prev.plan.blocks[prev.currentIndex + 1];
      const remainingBlocks = prev.plan.blocks.slice(prev.currentIndex + 2);

      const adaptPromise = supabase.functions.invoke("adapt-next-block", {
        body: {
          sessionTheme: prev.plan.sessionTheme?.title ?? "",
          completedBlock,
          nextBlock,
          remainingBlocks,
        },
      });
      const timeoutPromise = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 4000),
      );
      const result: any = await Promise.race([adaptPromise, timeoutPromise]);
      const decision = result?.data;

      if (decision?.action === "replace" && decision.block) {
        setActive((cur) => {
          if (!cur) return cur;
          const newBlocks = [...cur.plan.blocks];
          newBlocks[cur.currentIndex + 1] = decision.block as SessionBlock;
          return { ...cur, plan: { ...cur.plan, blocks: newBlocks } };
        });
      } else if (decision?.action === "inject" && decision.block) {
        setActive((cur) => {
          if (!cur) return cur;
          const newBlocks = [...cur.plan.blocks];
          newBlocks.splice(cur.currentIndex + 1, 0, decision.block as SessionBlock);
          return { ...cur, plan: { ...cur.plan, blocks: newBlocks } };
        });
      }
    } catch (e) {
      // silent — keep planned next block
      console.warn("[orchestrator] adapt-next-block failed", e);
    }
  }, [active, navigate]);

  const advance = useCallback(() => {
    setActive((prev) => {
      if (!prev) return prev;
      const nextIdx = prev.currentIndex + 1;
      if (nextIdx >= prev.plan.blocks.length) {
        navigate("/app");
        return null;
      }
      const nextBlock = prev.plan.blocks[nextIdx];
      navigate(blockRoute(nextBlock, prev.guruId, prev.plan, { totalBlocks: prev.plan.blocks.length, blockIndex: nextIdx }), {
        state: { sutraBlock: nextBlock, plan: prev.plan },
      });
      return { ...prev, currentIndex: nextIdx, showTransition: false };
    });
  }, [navigate]);

  const stop = useCallback(() => {
    setActive(null);
    navigate("/app");
  }, [navigate]);

  const value = useMemo<OrchestratorAPI>(() => {
    const currentBlock = active?.plan.blocks[active.currentIndex] ?? null;
    const nextBlock =
      active && active.currentIndex + 1 < active.plan.blocks.length
        ? active.plan.blocks[active.currentIndex + 1]
        : null;
    return {
      active,
      start,
      completeCurrent,
      advance,
      stop,
      isActive: !!active,
      currentBlock,
      nextBlock,
      totalSteps: active?.plan.blocks.length ?? 0,
      stepNumber: active ? active.currentIndex + 1 : 0,
    };
  }, [active, start, completeCurrent, advance, stop]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSessionOrchestrator(): OrchestratorAPI {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useSessionOrchestrator must be used inside SessionOrchestratorProvider");
  }
  return ctx;
}
