import { useRef } from "react";
import { useScroll } from "framer-motion";

/**
 * useSceneProgress — scroll progress for a sticky scene.
 * 0 = the scene has just pinned, 1 = the scene is about to unpin.
 */
export function useSceneProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return { ref, progress: scrollYProgress };
}

export type SceneProgress = ReturnType<typeof useSceneProgress>["progress"];
