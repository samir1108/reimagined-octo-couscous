/**
 * JourneyRecreation — the journey arc.
 *
 * Session titles follow the naming engine in `src/lib/session/naming.ts`
 * ("The {Ordinal} {Gate}: {Subtitle}") and the milestone names come from the
 * same module, so what a visitor reads here is what the app actually writes.
 */
const MILESTONES = [
  { label: "The Arrival", at: 1 },
  { label: "The First Week", at: 7 },
  { label: "The First Month", at: 30 },
];

const SESSIONS = [
  {
    ordinal: "Forty-Seventh",
    gate: "Rising",
    subtitle: "Where Thoughts Become Weather",
    when: "Morning",
    minutes: 12,
  },
  {
    ordinal: "Forty-Sixth",
    gate: "Pause",
    subtitle: "The Still Point of the Day",
    when: "Midday",
    minutes: 1,
  },
  {
    ordinal: "Forty-Fifth",
    gate: "Descent",
    subtitle: "Harvesting What the Day Revealed",
    when: "Evening",
    minutes: 15,
  },
  {
    ordinal: "Forty-Fourth",
    gate: "Sanctuary",
    subtitle: "Where Silence Does the Work",
    when: "Night",
    minutes: 8,
  },
];

export default function JourneyRecreation() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0a0807] text-foreground">
      <header className="px-5 pt-5">
        <p className="text-[0.55rem] uppercase tracking-[0.3em] text-primary/70">Your journey</p>
        <h3 className="mt-1.5 text-base font-medium md:text-lg">
          Forty-seven sittings. One spiral.
        </h3>
        <p className="mt-1 text-xs text-foreground/50">
          In a spiral, you visit the same place twice. Depth is greater.
        </p>
      </header>

      <div className="mt-4 px-5">
        <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.16em] text-foreground/45">
          <span>Band 2 &middot; The Observer</span>
          <span className="text-primary/80">47 / 60 to Band 3</span>
        </div>
        <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-[78%] rounded-full bg-primary/70" />
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-hidden px-5">
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 h-[calc(100%-0.5rem)] w-px bg-foreground/10" />
          {SESSIONS.map((session) => (
            <div key={`${session.ordinal}-${session.gate}`} className="relative pb-4">
              <span className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full border border-primary/50 bg-[#0a0807]" />
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-foreground/40">
                {session.when} &middot; {session.minutes} min
              </p>
              <p className="mt-1 text-xs font-medium leading-snug text-foreground/85">
                The {session.ordinal} {session.gate}: {session.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <p className="text-[0.55rem] uppercase tracking-[0.28em] text-foreground/45">Milestones</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MILESTONES.map((milestone) => (
            <span
              key={milestone.at}
              className="rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-primary/85"
            >
              {milestone.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
