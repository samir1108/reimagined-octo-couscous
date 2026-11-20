import { useCallback, useState } from "react";
import {
  advanceLandingVideo,
  getLandingVideo,
} from "@/lib/media/landingPlaylist";

/**
 * Rotates through the shared landing film playlist: each film plays to the end,
 * then the next one loads, and the last wraps back to the first. The cursor is
 * module-level so the hero and auth screens continue the same sequence.
 */
export function useLandingVideoPlaylist() {
  const [src, setSrc] = useState(getLandingVideo);

  const handleEnded = useCallback(() => {
    setSrc(advanceLandingVideo());
  }, []);

  return { src, handleEnded };
}
