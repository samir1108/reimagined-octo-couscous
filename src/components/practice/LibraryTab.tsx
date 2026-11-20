/**
 * LibraryTab — Practice Library with By Master / By Practice toggle.
 *
 *   • By Practice: each practice card with stack of master photos
 *   • By Master:   each master card → click → opens MasterPracticeSheet
 *                  showing that master's practices with durations
 *   • Tapping any practice → CinematicPracticeRunner
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Clock } from "lucide-react";

import { ALL_PRACTICES, getPracticeById, type PracticeDef, type PracticeId } from "@/types/practices";
import { GURUS, type Guru, type MasterCategory } from "@/lib/guru-data";
import MasterProfile from "@/components/temple/MasterProfile";
import CinematicPracticeRunner from "@/components/practice/CinematicPracticeRunner";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Practice → master categories that teach it
const PRACTICE_TO_CATEGORIES: Record<PracticeId, MasterCategory[]> = {
  observation: ["meditation-mindfulness", "self-inquiry-vedanta"],
  "self-inquiry": ["self-inquiry-vedanta", "philosophy-wisdom"],
  breath: ["kriya-pranayama", "classical-yoga"],
  witnessing: ["self-inquiry-vedanta", "meditation-mindfulness"],
  body: ["classical-yoga", "kriya-pranayama"],
  bhakti: ["bhakti-devotion"],
  karma: ["karma-seva"],
  jnana: ["philosophy-wisdom", "self-inquiry-vedanta"],
  raja: ["classical-yoga"],
  kriya: ["kriya-pranayama"],
  tantra: ["tantra-energy", "nath-siddha", "lost-ancient-arts"],
  neuroscience: ["psychology-neuroscience"],
  relationship: ["modern-therapy", "psychology-neuroscience"],
  "work-career": ["life-domain", "karma-seva"],
  finance: ["life-domain"],
  health: ["life-domain", "psychology-neuroscience"],
  "emotional-healing": ["modern-therapy", "psychology-neuroscience"],
  "loop-dissolution": ["loop-master", "psychology-neuroscience"],
};

const LAYER_META: Record<PracticeDef["layer"], { label: string; eyebrow: string }> = {
  core: { label: "Core", eyebrow: "Foundational" },
  path: { label: "Path", eyebrow: "Yogic Streams" },
  specialty: { label: "Specialty", eyebrow: "Activated by Context" },
};

function mastersForPractice(id: PracticeId): Guru[] {
  const cats = PRACTICE_TO_CATEGORIES[id] ?? [];
  if (cats.length === 0) return [];
  const set = new Set(cats);
  return GURUS.filter((g) => g.category && set.has(g.category as MasterCategory));
}

function practicesForMaster(masterId: string): PracticeDef[] {
  const master = GURUS.find((g) => g.id === masterId);
  if (!master?.category) return [];
  return ALL_PRACTICES.filter((p) =>
    (PRACTICE_TO_CATEGORIES[p.id] ?? []).includes(master.category as MasterCategory)
  );
}

interface RunnerTarget {
  practice: PracticeDef;
  master?: Guru;
  levelIdx?: number;
}

export default function LibraryTab() {
  const navigate = useNavigate();
  const [selectedMaster, setSelectedMaster] = useState<Guru | null>(null);
  const [openMaster, setOpenMaster] = useState<Guru | null>(null);
  const [openPractice, setOpenPractice] = useState<PracticeDef | null>(null);
  const [runner, setRunner] = useState<RunnerTarget | null>(null);

  const launchPractice = (id: PracticeId, master?: Guru, levelIdx = 0) => {
    const p = getPracticeById(id);
    if (!p) return;
    setRunner({ practice: p, master, levelIdx });
    setOpenMaster(null);
    setOpenPractice(null);
  };

  const showComingSoon = () => {
    toast({
      title: "Coming soon",
      description: "Individual master practice journeys are being prepared.",
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/app/frameworks")}
        className="w-full rounded-2xl border border-border bg-card p-4 text-left"
      >
        <span className="block font-medium">Session Framework Library</span>
        <span className="block text-xs text-muted-foreground">Browse structured session methods</span>
      </button>
      <MasterGrid
        onOpenMaster={() => showComingSoon()}
        onProfile={(g) => setSelectedMaster(g)}
      />

      {/* Footer escape hatch */}
      <button
        onClick={() => navigate("/app/library")}
        className="w-full text-center text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors py-3"
      >
        Browse full library →
      </button>

      {/* Master profile sheet */}
      <AnimatePresence>
        {selectedMaster && (
          <MasterProfile
            guru={selectedMaster}
            onBack={() => setSelectedMaster(null)}
            onTalk={(g) => {
              setSelectedMaster(null);
              navigate("/app/temple", { state: { guruId: g.id, action: "talk" } });
            }}
          />
        )}
      </AnimatePresence>

      {/* Master → Practices list sheet (uses master's own practices) */}
      <AnimatePresence>
        {openMaster && (
          <MasterPracticeSheet
            master={openMaster}
            onClose={() => setOpenMaster(null)}
            onPick={(gp) => {
              setRunner({
                practice: {
                  id: openMaster.id + ":" + gp.name,
                  label: gp.name,
                  icon: "🪷",
                  levels: [{ name: gp.name, description: gp.description }],
                  steps: gp.steps,
                  duration: gp.duration,
                } as unknown,
                master: openMaster,
                levelIdx: 0,
              });
              setOpenMaster(null);
            }}
            onProfile={() => { setSelectedMaster(openMaster); setOpenMaster(null); }}
          />
        )}
      </AnimatePresence>

      {/* Practice → Levels list sheet */}
      <AnimatePresence>
        {openPractice && (
          <PracticeLevelsSheet
            practice={openPractice}
            onClose={() => setOpenPractice(null)}
            onPick={(idx) => {
              const masters = mastersForPractice(openPractice.id);
              setRunner({ practice: openPractice, master: masters[0], levelIdx: idx });
              setOpenPractice(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cinematic runner */}
      <AnimatePresence>
        {runner && (() => {
          const idx = runner.levelIdx ?? 0;
          const lv = runner.practice.levels[idx] ?? runner.practice.levels[0];
          const steps = (runner.practice as unknown).steps?.length
            ? (runner.practice as unknown).steps
            : [`${lv.name}. ${lv.description}.`];
          const mins = (runner.practice as unknown).duration
            ? parseInt(String((runner.practice as unknown).duration)) || 5
            : 5;
          return (
            <CinematicPracticeRunner
              title={`${runner.practice.label}`}
              subtitle={runner.master ? `with ${runner.master.name}` : undefined}
              bgImage={runner.master?.bgImage || runner.master?.image}
              steps={steps}
              totalMinutes={mins}
              guruId={runner.master?.id}
              practiceName={runner.practice.label}
              onClose={() => setRunner(null)}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/* ─── By-Practice grouping (existing layout) ─── */
function PracticeGrouped({
  grouped, onLaunch, onOpenMaster,
}: {
  grouped: Record<PracticeDef["layer"], PracticeDef[]>;
  onLaunch: (id: PracticeId) => void;
  onOpenMaster: (g: Guru) => void;
}) {
  return (
    <div className="space-y-8">
      {(["core", "path", "specialty"] as const).map((layer) => {
        const practices = grouped[layer];
        if (!practices.length) return null;
        const meta = LAYER_META[layer];
        return (
          <section key={layer} className="space-y-3">
            <div className="px-1">
              <p className="text-[10px] uppercase tracking-[0.32em] text-primary/70 font-display">
                {meta.eyebrow}
              </p>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {meta.label} practices
              </h2>
            </div>
            <div className="space-y-2">
              {practices.map((p, idx) => {
                const masters = mastersForPractice(p.id).slice(0, 4);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group flex items-center gap-3 rounded-2xl border border-border/30 bg-card/40 px-3 py-3 hover:bg-card/60 hover:border-primary/30 transition-colors"
                  >
                    <button
                      onClick={() => onLaunch(p.id)}
                      className="flex flex-1 items-center gap-3 text-left min-w-0"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-lg">
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-sm text-foreground truncate">
                          {p.label}
                        </div>
                        <div className="text-[11px] font-body text-muted-foreground truncate">
                          {p.levels.length} levels{p.activationCondition ? ` · ${p.activationCondition}` : ""}
                        </div>
                      </div>
                    </button>
                    {masters.length > 0 && (
                      <div className="flex items-center -space-x-2 shrink-0">
                        {masters.map((m) => (
                          <button
                            key={m.id}
                            onClick={(e) => { e.stopPropagation(); onOpenMaster(m); }}
                            title={m.name}
                            className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-background hover:ring-primary/60 hover:z-10 transition-all bg-muted"
                          >
                            {m.image ? (
                              <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-display text-muted-foreground">
                                {m.name.charAt(0)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ─── By-Master grid ─── */
function MasterGrid({
  onOpenMaster, onProfile,
}: { onOpenMaster: (g: Guru) => void; onProfile: (g: Guru) => void }) {
  const visible = useMemo(() => GURUS.filter((g) => (g.practices?.length ?? 0) > 0).slice(0, 60), []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {visible.map((g, idx) => {
        const count = g.practices?.length ?? 0;
        const previews = (g.practices ?? []).slice(0, 3);
        const remaining = Math.max(0, count - previews.length);
        return (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.015 }}
            onClick={() => onOpenMaster(g)}
            onContextMenu={(e) => { e.preventDefault(); onProfile(g); }}
            className="group relative rounded-2xl overflow-hidden border border-border/30 bg-card/40 hover:border-primary/50 transition-colors text-left flex gap-3 p-3"
          >
            <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted">
              {g.image ? (
                <img src={g.image} alt={g.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/10" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-foreground truncate">{g.name}</p>
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70 mt-0.5">
                {count} practice{count === 1 ? "" : "s"}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {previews.map((p, i) => (
                  <li key={p.name + i} className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                    <span className="text-primary/60">·</span>
                    <span className="truncate">{p.name}</span>
                  </li>
                ))}
                {remaining > 0 && (
                  <li className="text-[10px] text-muted-foreground/70 italic">
                    +{remaining} more
                  </li>
                )}
              </ul>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Master → practice list sheet (master's own practices) ─── */
function MasterPracticeSheet({
  master, onClose, onPick, onProfile,
}: {
  master: Guru;
  onClose: () => void;
  onPick: (gp: import("@/lib/guru-data").GuruPractice) => void;
  onProfile: () => void;
}) {
  const list = master.practices ?? [];
  return (
    <motion.div
      className="fixed inset-0 z-[110] bg-background flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="w-full h-full flex flex-col"
      >
        <div className="relative h-[55vh] shrink-0">
          {master.image && <img src={master.image} alt={master.name} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white/90 hover:bg-black/60"
          >
            ←
          </button>
          <button
            onClick={onProfile}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-[10px] font-display tracking-[0.2em] uppercase text-white/90 hover:bg-black/60"
          >
            About
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[10px] font-display tracking-[0.3em] uppercase text-primary/90">Sacred Practices</p>
            <h3 className="font-display text-3xl text-foreground mt-1">{master.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{list.length} practice{list.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {list.map((p, i) => (
            <button
              key={p.name + i}
              onClick={() => onPick(p)}
              className="w-full flex items-center gap-3 rounded-2xl border border-border/30 bg-card/40 px-3 py-3 hover:bg-card/60 hover:border-primary/40 transition-colors text-left"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-lg">
                🪷
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-foreground truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {p.duration}
                </div>
                {p.description && (
                  <div className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">{p.description}</div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            </button>
          ))}
          {list.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No practices yet.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Practice → Levels list sheet ─── */
function PracticeLevelsSheet({
  practice, onClose, onPick,
}: {
  practice: PracticeDef;
  onClose: () => void;
  onPick: (levelIdx: number) => void;
}) {
  const masters = useMemo(() => mastersForPractice(practice.id).slice(0, 6), [practice.id]);
  return (
    <motion.div
      className="fixed inset-0 z-[110] bg-background flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="w-full h-full flex flex-col"
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-6 border-b border-border/30">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 left-4 h-9 w-9 rounded-full bg-card/60 backdrop-blur flex items-center justify-center text-foreground/80 hover:bg-card"
          >
            ←
          </button>
          <div className="text-center pt-2">
            <div className="text-4xl mb-2">{practice.icon}</div>
            <p className="text-[10px] font-display tracking-[0.3em] uppercase text-primary/80">
              {LAYER_META[practice.layer].label} Practice
            </p>
            <h3 className="font-display text-2xl text-foreground mt-1">{practice.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {practice.levels.length} levels · choose where to begin
            </p>
            {masters.length > 0 && (
              <div className="flex items-center justify-center -space-x-2 mt-3">
                {masters.map((m) => (
                  <div key={m.id} title={m.name} className="h-7 w-7 rounded-full overflow-hidden ring-2 ring-background bg-muted">
                    {m.image ? (
                      <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[9px] font-display">{m.name.charAt(0)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Levels list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {practice.levels.map((lv, idx) => (
            <motion.button
              key={lv.level}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onPick(idx)}
              className="w-full flex items-center gap-3 rounded-2xl border border-border/30 bg-card/40 px-3 py-3 hover:bg-card/60 hover:border-primary/40 transition-colors text-left"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center font-display text-sm text-primary">
                L{lv.level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-foreground truncate">{lv.name}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{lv.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

