/**
 * TeachingCards — the two corrections every beginner needs before sitting:
 * what meditation is not, and the three-session observer arc.
 */

import { Link } from "react-router-dom";
import { MYTH_CARDS, OBSERVER_ARC } from "@/lib/prescription";

export default function TeachingCards() {
  return (
    <details className="rounded-2xl border border-border/40 bg-card/60 px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">
        Read before you sit · 60 seconds
      </summary>

      <div className="mt-3 space-y-2">
        {MYTH_CARDS.map((card) => (
          <div key={card.myth} className="rounded-xl bg-muted/30 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground line-through">{card.myth}</p>
            <p className="mt-1 text-xs">{card.fact}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border/40 pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          The observer in 3 sessions
        </p>
        <ol className="mt-2 space-y-2">
          {OBSERVER_ARC.map((session, index) => (
            <li key={session.title} className="flex gap-2 text-xs">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px]">
                {index + 1}
              </span>
              <span>
                <span className="font-medium">{session.title}</span>
                <span className="block text-muted-foreground">{session.teaching}</span>
              </span>
            </li>
          ))}
        </ol>
        <Link
          to="/app/arcs/observer"
          className="mt-3 inline-block rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40"
        >
          Start with session 1
        </Link>
      </div>
    </details>
  );
}
