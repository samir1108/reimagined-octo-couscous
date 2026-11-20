"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const isPullingRef = useRef(isPulling);
  const isRefreshingRef = useRef(isRefreshing);
  const pullDistanceRef = useRef(pullDistance);

  isPullingRef.current = isPulling;
  isRefreshingRef.current = isRefreshing;
  pullDistanceRef.current = pullDistance;

  const reset = useCallback(() => {
    setIsPulling(false);
    setPullDistance(0);
    startY.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const el = elementRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      const scrollTop = el.scrollTop;
      if (scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null || isRefreshingRef.current) return;
      const currentY = e.touches[0].clientY;
      const distance = (currentY - startY.current) / resistance;
      if (distance <= 0) {
        startY.current = currentY;
        return;
      }
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshingRef.current) return;
      if (pullDistanceRef.current >= threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      reset();
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", reset, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", reset);
    };
  }, [enabled, onRefresh, resistance, threshold, reset]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = isPulling || isRefreshing;

  return {
    ref: elementRef,
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    shouldShowIndicator,
  };
}

export default usePullToRefresh;