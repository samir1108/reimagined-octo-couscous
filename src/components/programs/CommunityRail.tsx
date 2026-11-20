import { useEffect, useState } from "react";

interface RailItem {
  id: string;
  label: string;
  count: number;
}

interface Props {
  items: RailItem[];
}

export default function CommunityRail({ items }: Props) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [items]);

  return (
    <aside className="hidden lg:block sticky top-24 self-start w-56 shrink-0">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-4">Communities</p>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`group relative flex items-center justify-between text-sm py-2 pl-4 pr-2 rounded-lg transition-all
                ${isActive
                  ? "text-amber-100 bg-amber-500/10 border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"}`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r transition-all
                  ${isActive ? "bg-amber-400" : "bg-transparent group-hover:bg-border"}`}
              />
              <span className="truncate">{it.label}</span>
              <span className="text-[10px] text-muted-foreground/60 ml-2">{it.count}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
