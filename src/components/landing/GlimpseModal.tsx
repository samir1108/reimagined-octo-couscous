import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/design-system";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system";
import { ScrollArea } from "@/design-system";
import templeVideo from "@/assets/videos/hero-temple-sunrise.mp4.asset.json";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MANIFESTS as SENSORIAL_MANIFESTS } from "@/data/sensorialPractices";
import { FLAGSHIP_GAMES, FACULTY_LABEL, type Faculty } from "@/games/shell/labRegistry";
import { ALL_GUIDES } from "@/lib/guru-data";
import { ALL_PROGRAMS_V3 } from "@/lib/programs";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Play, Gamepad2 } from "lucide-react";

type Item = { name: string; meta?: string; desc?: string; href: string };
type Group = { title: string; items: Item[] };

// Programs — sourced from ALL_PROGRAMS_V3 so taps open the real program in-app.
const PROGRAMS: Group[] = (() => {
  const byCat = new Map<string, Item[]>();
  for (const p of ALL_PROGRAMS_V3) {
    const cat = (p.category ?? "other").toString();
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push({
      name: p.title,
      meta: `${p.totalSessions} sessions`,
      desc: p.subtitle ?? "",
      href: `/app/programs-v3?open=${encodeURIComponent(p.id)}`,
    });
  }
  const order = ["self_mastery", "performance", "relationships", "spiritual", "wellbeing", "well-being", "other"];
  const keys = Array.from(byCat.keys()).sort((a, b) => {
    const ai = order.indexOf(a); const bi = order.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return keys.map((k) => ({
    title: k.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    items: byCat.get(k)!,
  }));
})();

// Practices = the in-app sensorial practices.
const PRACTICES: Group[] = (() => {
  const items: Item[] = SENSORIAL_MANIFESTS.map((m) => {
    const guru = ALL_GUIDES.find((g) => g.id === m.guruId);
    const masterName =
      guru?.name ??
      m.guruId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const sensors: string[] = [];
    if (m.sensors?.mic) sensors.push("Mic");
    if (m.sensors?.camera) sensors.push("Camera");
    if (m.videoUrl) sensors.push("Video");
    const sensorTail = sensors.length ? ` · ${sensors.join(" · ")}` : "";
    return {
      name: m.title,
      meta: `${m.totalMinutes} min`,
      desc: `${masterName} · ${m.steps.length} steps${sensorTail}`,
      href: `/app/library?tab=practices&open=${encodeURIComponent(m.key)}`,
    };
  });
  return [{ title: "Cinematic Practices", items }];
})();

// Games = the in-app Conscious Games Lab. Only the flagship lineup is listed.
const GAMES: Group[] = (() => {
  const byFaculty = new Map<Faculty, Item[]>();
  for (const g of FLAGSHIP_GAMES) {
    const fac = g.faculties[0];
    if (!fac) continue;
    if (!byFaculty.has(fac)) byFaculty.set(fac, []);
    byFaculty.get(fac)!.push({
      name: g.name,
      desc: g.oneLine,
      href: `/app/games/${encodeURIComponent(g.id)}`,
    });
  }
  const order: Faculty[] = [
    "attention", "witness", "body", "heart", "self_inquiry",
    "ego", "willpower", "stillness", "brain_head", "brain_heart",
    "brain_gut", "voice", "karma", "liminal",
  ];
  return order
    .filter((f) => byFaculty.has(f))
    .map((f) => ({ title: FACULTY_LABEL[f], items: byFaculty.get(f)! }));
})();


function GroupList({ groups, icon: Icon, onPick }: { groups: Group[]; icon: React.ComponentType<{ className?: string }>; onPick: (href: string) => void }) {
  return (
    <ScrollArea className="h-[55vh] pr-4">
      <div className="space-y-8 pb-6">
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-xs font-body tracking-[0.3em] uppercase text-primary/80 mb-3">
              {g.title}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {g.items.map((it) => (
                <button
                  key={it.name + it.href}
                  type="button"
                  onClick={() => onPick(it.href)}
                  className="text-left rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/60 hover:bg-card/60 transition-colors group"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-display text-base text-foreground">{it.name}</div>
                    {it.meta && (
                      <div className="text-xs text-primary/80 font-body whitespace-nowrap">{it.meta}</div>
                    )}
                  </div>
                  {it.desc && (
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{it.desc}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 text-[11px] text-primary/80 opacity-80 group-hover:opacity-100 transition">
                    <Icon className="w-3 h-3" />
                    <span>Open · free</span>
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const GlimpseModal = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const go = (href: string) => {
    onOpenChange(false);
    // small delay so the dialog close animation doesn't fight the route change
    setTimeout(() => navigate(href), 60);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <VisuallyHidden>
          <DialogTitle>A Glimpse Inside ConsciousOS</DialogTitle>
          <DialogDescription>Explore programs, practices and games — all free</DialogDescription>
        </VisuallyHidden>

        {/* Temple video header */}
        <div className="relative h-48 md:h-60 w-full overflow-hidden">
          <video
            src={templeVideo.url}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        <div className="px-6 pb-6">
          <Tabs defaultValue="programs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="practices">Practices</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
            </TabsList>

            <TabsContent value="programs">
              <p className="text-sm text-muted-foreground mb-4">
                Tap any program — it opens on your Home and runs session by session. Free.
              </p>
              <GroupList groups={PROGRAMS} icon={Play} onPick={go} />
            </TabsContent>
            <TabsContent value="practices">
              <p className="text-sm text-muted-foreground mb-4">
                Tap a practice — opens the same cinematic player as inside the app. Free.
              </p>
              <GroupList groups={PRACTICES} icon={Play} onPick={go} />
            </TabsContent>
            <TabsContent value="games">
              <p className="text-sm text-muted-foreground mb-4">
                Tap a game — opens directly. Experiential diagnostics, all free.
              </p>
              <GroupList groups={GAMES} icon={Gamepad2} onPick={go} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlimpseModal;
