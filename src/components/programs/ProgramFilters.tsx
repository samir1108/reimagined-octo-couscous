import { X } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface Props {
  categories: FilterOption[];
  gurus: FilterOption[];
  audiences: FilterOption[];
  selectedCategory: string | null;
  selectedGuru: string | null;
  selectedAudience: string | null;
  onCategory: (id: string | null) => void;
  onGuru: (id: string | null) => void;
  onAudience: (id: string | null) => void;
  totalMatches: number;
}

function Row({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex items-start gap-3">
      <p className="shrink-0 w-20 pt-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`px-3 py-1.5 rounded-full text-xs border transition ${
            selected === null
              ? "bg-amber-500/20 border-amber-500/50 text-amber-100"
              : "bg-background/30 border-border/60 text-foreground/70 hover:text-foreground hover:border-border"
          }`}
        >
          All
        </button>
        {options.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(active ? null : o.id)}
              className={`px-3 py-1.5 rounded-full text-xs border transition inline-flex items-center gap-1.5 ${
                active
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-100"
                  : "bg-background/30 border-border/60 text-foreground/70 hover:text-foreground hover:border-border"
              }`}
            >
              <span className="capitalize">{o.label}</span>
              <span className="text-[10px] opacity-60">{o.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProgramFilters(props: Props) {
  const anyActive =
    props.selectedCategory || props.selectedGuru || props.selectedAudience;

  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 backdrop-blur-md p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/70">
          Filter · {props.totalMatches} programs
        </p>
        {anyActive && (
          <button
            type="button"
            onClick={() => {
              props.onCategory(null);
              props.onGuru(null);
              props.onAudience(null);
            }}
            className="inline-flex items-center gap-1 text-[11px] text-amber-300/90 hover:text-amber-200 transition"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      <Row
        label="Topic"
        options={props.categories}
        selected={props.selectedCategory}
        onSelect={props.onCategory}
      />
      <Row
        label="Guru"
        options={props.gurus}
        selected={props.selectedGuru}
        onSelect={props.onGuru}
      />
      <Row
        label="For"
        options={props.audiences}
        selected={props.selectedAudience}
        onSelect={props.onAudience}
      />
    </div>
  );
}
