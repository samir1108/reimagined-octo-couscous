"use client";
import { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function CountUp({ end, start = 0, duration = 1.2, className, suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(start);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (duration <= 0) {
      setCount(end);
      return;
    }
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [end, start, duration]);

  return <span className={className}>{mounted ? count.toLocaleString() : "—"}{suffix}</span>;
}