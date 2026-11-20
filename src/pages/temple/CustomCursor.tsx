import { useEffect, useRef } from "react";

/**
 * Glowing amber cursor follower. Pure DOM, no React re-renders on mousemove.
 * Hidden on touch devices via CSS pointer media query.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let dx = window.innerWidth / 2;
    let dy = window.innerHeight / 2;
    let rx = dx;
    let ry = dy;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      dx = e.clientX;
      dy = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx - 4}px, ${dy - 4}px, 0)`;
      }
    };

    const loop = () => {
      rx += (dx - rx) * 0.12;
      ry += (dy - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - 22}px, ${ry - 22}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[60] w-11 h-11 rounded-full border border-amber-200/40 hidden md:block"
        style={{ mixBlendMode: "screen", boxShadow: "0 0 30px hsl(38 95% 55% / .3)" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[60] w-2 h-2 rounded-full bg-amber-200 hidden md:block"
        style={{ mixBlendMode: "screen" }}
      />
    </>
  );
}
