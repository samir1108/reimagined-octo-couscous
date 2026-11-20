import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StepTransitionProps {
  stepKey: number | string;
  children: ReactNode;
}

/** Cinematic but restrained step transition; collapses to a fade for reduced motion. */
export function StepTransition({ stepKey, children }: StepTransitionProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={stepKey}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="will-change-[opacity,transform]"
    >
      {children}
    </motion.div>
  );
}
