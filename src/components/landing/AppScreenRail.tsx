import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { APP_SCREENS, appScreen } from "./landingData";
import { CHAMPAGNE, GOLD, GOLD_BODY, GOLD_EMBER, GOLD_LEAF } from "./landingTheme";

/* The rail of app screens is an instrument, not a decal.

   A trackpad already knows how to move it sideways, but a plain mouse does
   not: the wheel is vertical, the scrollbar is hidden, and a visitor with a
   mouse arrives at a row of frames that cannot be moved at all. So the rail
   takes the wheel, takes the hand, takes the arrow keys, and always says
   which screens are in view.

   The rail rests on a grid — one detent per card — rather than on CSS
   scroll-snap, because the first and last cards can never be centred and
   their snap points collapse into the ends. Detents are measured from the
   live layout, so the step is always exactly one screen, never a guess. */

const CARD = "[data-rail-card]";

const AppScreenRail = () => {
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, pointerId: -1, startX: 0, startScroll: 0 });

  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [visible, setVisible] = useState<{ first: number; last: number } | null>(null);

  /* How far along the rail is, and what is left in either direction. */
  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setProgress(max > 0 ? Math.min(1, Math.max(0, left / max)) : 0);
    setAtStart(left <= 2);
    setAtEnd(max <= 0 || left >= max - 2);

    const railRect = el.getBoundingClientRect();
    const cards = Array.from(el.querySelectorAll<HTMLElement>(CARD));
    const numbers = cards
      .filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.right > railRect.left + 8 && rect.left < railRect.right - 8;
      })
      .map((card) => Number(card.dataset.railCard))
      .filter((n) => Number.isFinite(n));

    if (numbers.length) {
      setVisible({ first: Math.min(...numbers), last: Math.max(...numbers) });
    }
  }, []);

  /* The resting places: one per card, measured from the live layout. */
  const detents = useCallback((): number[] => {
    const el = railRef.current;
    if (!el) return [];
    const cards = Array.from(el.querySelectorAll<HTMLElement>(CARD));
    if (!cards.length) return [0];

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const first = cards[0].getBoundingClientRect();
    const second = cards[1]?.getBoundingClientRect();
    const step = second ? Math.round(second.left - first.left) : cards[0].offsetWidth;

    return cards.map((_, i) => Math.min(max, Math.max(0, i * step)));
  }, []);

  /* direction 0 lands on the nearest detent; ±1 steps to the next one. */
  const goTo = useCallback(
    (direction: 0 | 1 | -1) => {
      const el = railRef.current;
      if (!el) return;
      const points = detents();
      if (!points.length) return;

      const current = el.scrollLeft;
      let index = 0;
      let best = Infinity;
      points.forEach((point, i) => {
        const d = Math.abs(point - current);
        if (d < best) {
          best = d;
          index = i;
        }
      });

      const target =
        direction === 0
          ? points[index]
          : points[Math.max(0, Math.min(points.length - 1, index + direction))];

      el.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [detents, reduceMotion],
  );

  /* One listener for every kind of settling: wheel, trackpad, drag, arrow.
     The rail comes to rest on a detent once the movement stops. */
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    let timer: number | null = null;
    const onScroll = () => {
      measure();
      if (drag.current.active) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => goTo(0), 180);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();

    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [goTo, measure]);

  /* A mouse wheel has no horizontal axis, so the rail turns the vertical
     scroll sideways — until it runs out of rail, at which point the wheel is
     handed back to the page so nobody is ever trapped on one row. */
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (event.deltaY < 0 && el.scrollLeft <= 0) return;
      if (event.deltaY > 0 && el.scrollLeft >= max - 1) return;
      event.preventDefault();
      el.scrollBy({ left: event.deltaY, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const el = railRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
    };
    el.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = railRef.current;
    if (!el) return;
    el.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = railRef.current;
    drag.current.active = false;
    if (el && el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    setDragging(false);
    goTo(0);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(-1);
    }
  };

  const fill = Math.max(6, progress * 100);

  return (
    <div>
      <div
        ref={railRef}
        role="region"
        aria-label="The app, screen by screen"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onDragStart={(event) => event.preventDefault()}
        className={`relative mt-14 flex gap-6 overflow-x-auto px-6 pb-6 scrollbar-hide focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:outline-offset-4 md:px-10 lg:px-16 ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {APP_SCREENS.map((screen, index) => (
          <motion.figure
            key={screen.n}
            data-rail-card={screen.n}
            className="w-[248px] shrink-0"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: Math.min(index * 0.03, 0.3) }}
          >
            <div
              className="relative overflow-hidden rounded-[1.4rem] p-2"
              style={{ background: "linear-gradient(160deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.05))" }}
            >
              <div className="overflow-hidden rounded-[1.1rem] bg-black" style={{ height: 520 }}>
                <img
                  src={appScreen(screen.n)}
                  alt={screen.title}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block h-full w-full object-cover object-top"
                />
              </div>
            </div>
            <p className="mt-5 font-display tabular-nums text-[0.625rem] uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              {String(screen.n).padStart(2, "0")}
            </p>
            <h3 className="font-display mt-2 text-lg leading-snug">{screen.title}</h3>
            <p className="mt-2 font-body text-[0.85rem] font-light leading-[1.75]" style={{ color: GOLD_BODY }}>
              {screen.caption}
            </p>
          </motion.figure>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 px-6 md:px-10 lg:px-16">
        <p className="font-display text-[0.6875rem] uppercase tracking-[0.22em]" style={{ color: GOLD_EMBER }}>
          Drag, scroll or step it
        </p>

        <div className="flex items-center gap-5">
          {visible ? (
            <span
              data-rail-range
              className="font-display tabular-nums text-[0.6875rem] tracking-[0.2em]"
              style={{ color: CHAMPAGNE }}
            >
              {String(visible.first).padStart(2, "0")}
              {visible.last !== visible.first ? ` — ${String(visible.last).padStart(2, "0")}` : ""}
            </span>
          ) : null}

          <div className="h-px w-28 sm:w-44" style={{ background: "hsl(var(--primary) / 0.18)" }}>
            <div
              className="h-px transition-[width] duration-200 ease-out"
              style={{ width: `${fill}%`, background: GOLD }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={atStart}
              aria-label="Previous screen"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.06] text-foreground/90 transition-colors duration-300 hover:border-primary/50 hover:bg-primary/15 disabled:opacity-25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={atEnd}
              aria-label="Next screen"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.06] text-foreground/90 transition-colors duration-300 hover:border-primary/50 hover:bg-primary/15 disabled:opacity-25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppScreenRail;
