/**
 * ProgramsV3 — preview / playground page for session-based programs.
 * Route: /app/programs-v3
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  ALL_PROGRAMS_V3,
  ALL_ATOMS,
  composeProgramSession,
  type ComposerUserState,
} from "@/lib/programs";
import type { SessionProgramV3, Atom, AtomCategory, ComposedSession } from "@/lib/programs/types";
import { Card } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { createSessionWithPlan } from "@/lib/session-shell/api";
import { toast } from "sonner";
import { getActiveProgram } from "@/lib/programs/activeProgram";

function currentGate(): ComposerUserState["gate"] {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 16) return "midday";
  if (h < 20) return "evening";
  return "night";
}

// Only show practices with rich/interactive modalities (voice, somatic, journaling).
// Pure "read"/"sit" atoms are deprioritized so the Practices tab reflects what we
// actually shipped this week (TTS narration, mic-driven, write-back, somatic).
const INTERACTIVE_MODALITIES = new Set(["listen", "speak", "write", "move"]);

export default function ProgramsV3() {
  const navigate = useNavigate();

  const initialOpen = (() => {
    if (typeof window === "undefined") return null;
    const q = new URLSearchParams(window.location.search).get("open");
    return q || null;
  })();

  // ---- ALL hooks declared up-front (Rules of Hooks) ----
  const [openId, setOpenId] = useState<string | null>(initialOpen);
  const [tab, setTab] = useState<"programs" | "practices">("programs");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [activeAtomCat, setActiveAtomCat] = useState<string>("all");
  const [composed, setComposed] = useState<ComposedSession | null>(null);

  const program = useMemo(
    () => ALL_PROGRAMS_V3.find((p) => p.id === openId) ?? null,
    [openId],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    ALL_PROGRAMS_V3.forEach((p) => set.add(p.category));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(
    () => activeCat === "all" ? ALL_PROGRAMS_V3 : ALL_PROGRAMS_V3.filter((p) => p.category === activeCat),
    [activeCat],
  );

  // Practices we actually built this week — rich modalities only.
  const interactiveAtoms = useMemo<Atom[]>(
    () => ALL_ATOMS.filter((a) => INTERACTIVE_MODALITIES.has(a.modality)),
    [],
  );

  const atomCategories = useMemo(() => {
    const set = new Set<AtomCategory>();
    interactiveAtoms.forEach((a) => set.add(a.category));
    return ["all", ...Array.from(set).sort()] as const;
  }, [interactiveAtoms]);

  const atomsFiltered = useMemo<Atom[]>(
    () => activeAtomCat === "all" ? interactiveAtoms : interactiveAtoms.filter((a) => a.category === activeAtomCat),
    [activeAtomCat, interactiveAtoms],
  );

  // Resume in-progress program if any (e.g. tapped from Home running card).
  useEffect(() => {
    if (composed) return;
    const active = getActiveProgram();
    if (!active) return;
    if (initialOpen && active.programId === initialOpen) {
      const prog = ALL_PROGRAMS_V3.find((p) => p.id === active.programId);
      const tpl = prog?.sessions.find((s) => s.index === active.sessionIndex);
      if (!prog || !tpl) return;
      const state: ComposerUserState = {
        gate: currentGate(),
        energy: "medium",
        maxLevel: 2,
        activeLoops: [],
        recentAtomIds: [],
      };
      setOpenId(prog.id);
      setComposed(composeProgramSession(tpl, state));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Rendering ----

  const BackBar = ({ onBack, label }: { onBack: () => void; label: string }) => (
    <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
      <ArrowLeft className="h-4 w-4 mr-1" /> {label}
    </Button>
  );

  if (program) {
    return (
      <div className="container max-w-2xl mx-auto py-6 px-4 space-y-4">
        <BackBar onBack={() => setOpenId(null)} label="All programs" />
        <ProgramDetail
          program={program}
          onStartSession={async (sessionIndex) => {
            const tpl = program.sessions.find((s) => s.index === sessionIndex);
            if (!tpl) return;
            const state: ComposerUserState = {
              gate: currentGate(),
              energy: "medium",
              maxLevel: 2,
              activeLoops: [],
              recentAtomIds: [],
            };
            const cs = composeProgramSession(tpl, state);
            
            // Convert ComposedSession to SessionPlan format for session-shell
            const sessionPlan = {
              id: `${program.id}-${sessionIndex}`,
              system: "program",
              userId: "",
              status: "active",
              title: `${program.title} — Session ${sessionIndex}`,
              gate: currentGate(),
              steps: cs.atoms.map((atom, i) => ({
                id: `step-${i}`,
                kind: atom.modality as any,
                title: atom.label || atom.id,
                estMinutes: Math.ceil((atom.durationSec?.typical || 180) / 60),
                atomId: atom.id,
                durationSec: atom.durationSec,
              })),
              totalEstMinutes: Math.ceil(cs.atoms.reduce((sum, a) => sum + (a.durationSec?.typical || 180), 0) / 60),
              context: {
                energy: "medium",
                daysSinceLastSession: 0,
                journeyDay: 1,
                activeLoops: [],
              },
              metadata: { programId: program.id, sessionIndex },
              createdAt: new Date().toISOString(),
            };
            
            try {
              const { sessionId } = await createSessionWithPlan(sessionPlan);
              navigate(`/app/session/${sessionId}`);
            } catch (e) {
              console.error("Failed to create session:", e);
              toast.error("Failed to start session. Please try again.", { duration: 8000 });
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4 space-y-4">
      <BackBar onBack={() => navigate("/app")} label="Home" />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Developed this week</h1>
        <p className="text-sm text-muted-foreground">
          {ALL_PROGRAMS_V3.length} programs · {interactiveAtoms.length} interactive practices.
        </p>
      </header>

      <div className="flex gap-2 border-b border-border">
        {(["programs", "practices"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px transition ${
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "programs" ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs capitalize transition ${
                  activeCat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="p-4 cursor-pointer hover:bg-accent/30 transition"
                onClick={() => setOpenId(p.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{p.subtitle}</div>
                    <div className="text-xs text-muted-foreground mt-1 capitalize">
                      {p.category} · {p.difficulty}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{p.totalSessions} sessions</Badge>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {atomCategories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveAtomCat(c)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs capitalize transition ${
                  activeAtomCat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c.replace(/-/g, " ")}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {atomsFiltered.map((a) => (
              <Card key={a.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{a.intent}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 capitalize">
                      {a.category.replace(/-/g, " ")} · L{a.level} · {a.intensity} · {Math.round(a.durationSec.typical / 60)}m
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                    {a.modality}
                  </Badge>
                </div>
              </Card>
            ))}
            {atomsFiltered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No practices in this category yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProgramDetail({
  program,
  onStartSession,
}: {
  program: SessionProgramV3;
  onStartSession: (sessionIndex: number) => void;
}) {
  return (
    <>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{program.title}</h1>
        <p className="text-sm text-muted-foreground">{program.description}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {program.tags.map((t) => (
            <Badge key={t} variant="outline">{t}</Badge>
          ))}
        </div>
      </header>

      <div className="space-y-2">
        {program.sessions.map((s) => (
          <Card key={s.index} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Session {s.index} · {s.phase}
                </div>
                <div className="font-medium truncate">{s.intent}</div>
                <div className="text-xs text-muted-foreground">
                  {s.required.length} required
                  {s.optional?.length ? ` · ${s.optional.length} optional` : ""}
                  {" · "}~{s.targetMinutes} min
                </div>
              </div>
              <Button size="sm" onClick={() => onStartSession(s.index)}>
                Start
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
