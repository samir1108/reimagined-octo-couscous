import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";

type AnimatedPathProps = Omit<
  ComponentProps<typeof motion.path>,
  "initial" | "animate" | "transition" | "pathLength"
> & {
  progress?: number;
  duration?: number;
  delay?: number;
};

export function AnimatedPath({
  progress = 1,
  duration = 0.9,
  delay = 0,
  ...pathProps
}: AnimatedPathProps) {
  const reduceMotion = useReducedMotion();
  const targetProgress = Math.max(0, Math.min(1, progress));

  return (
    <motion.path
      {...pathProps}
      initial={reduceMotion ? false : { pathLength: 0, opacity: 0.55 }}
      animate={{ pathLength: targetProgress, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : duration, delay, ease: "easeOut" }}
    />
  );
}
