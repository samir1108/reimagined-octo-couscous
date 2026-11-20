import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface YourDayCardProps {
  intention?: string;
  mission?: string;
  priority?: string;
  approach?: string;
  reminder?: string;
  doMore?: string[];
  beMindful?: string[];
  avoid?: string[];
  replaceWith?: string;
  smallWin?: string;
  observe?: string[];
  mindCheck?: string;
  emotionalCheck?: string;
  bodyCheck?: string;
  selfInquiry?: string;
  practice?: string;
  japa?: string;
  pauseReset?: string;
  challenge?: string;
  bringIntoAction?: string;
  response?: string;
  connection?: string;
  decision?: string;
  lifeDomain?: string;
  intentionalAction?: string;
  questionToCarry?: string;
  discovery?: string;
  captureMoment?: string;
  eveningReflection?: string;
  gratitude?: string;
}

type Group = { key: string; icon: string; title: string; subtitle: string; items: { label: string; value: string }[] };

export default function YourDayCard(props: YourDayCardProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({ direction: true });

  const groups: Group[] = [
    {
      key: "direction", icon: "🧭", title: "Your Direction", subtitle: "Intention, mission, priority, approach, reminder",
      items: [
        { label: "Today's Intention", value: props.intention || "Notice before you react." },
        { label: "Today's Mission", value: props.mission || "Catch one moment of automatic reaction." },
        { label: "Today's Priority", value: props.priority || "Give attention to what matters most." },
        { label: "How to Approach Today", value: props.approach || "Respond with awareness, not impulse." },
        { label: "Today's Reminder", value: props.reminder || "Pause. Breathe. Choose." },
      ],
    },
    {
      key: "doavoid", icon: "⚖️", title: "Do & Avoid", subtitle: "Actions, habits and alternatives",
      items: [
        { label: "Do More Of", value: (props.doMore || ["Pause before responding"]).join("; ") },
        { label: "Be Mindful Of", value: (props.beMindful || ["Reacting automatically"]).join("; ") },
        { label: "Avoid Today", value: (props.avoid || ["Rushing without awareness"]).join("; ") },
        { label: "Replace This With", value: props.replaceWith || "A conscious pause instead of an instant reaction." },
        { label: "One Small Win", value: props.smallWin || "One moment noticed is progress." },
      ],
    },
    {
      key: "awareness", icon: "👁️", title: "Inner Awareness", subtitle: "Mind, body, emotions, inquiry",
      items: [
        { label: "Observe Today", value: (props.observe || ["Body tension, recurring thoughts, emotional shifts"]).join("; ") },
        { label: "Mind Check", value: props.mindCheck || "What story is my mind telling right now?" },
        { label: "Emotional Check", value: props.emotionalCheck || "What am I feeling beneath the surface?" },
        { label: "Body Check", value: props.bodyCheck || "Where is my body holding tension?" },
        { label: "Self-Inquiry", value: props.selfInquiry || "What happens between impulse and action?" },
      ],
    },
    {
      key: "practices", icon: "🪷", title: "Your Practices", subtitle: "Exercises, repetition, action",
      items: [
        { label: "Today's Practice", value: props.practice || "3 slow breaths when you notice tension." },
        { label: "Japa & Repetition", value: props.japa || "Optional repetition practice if it suits you." },
        { label: "Pause & Reset", value: props.pauseReset || "60 seconds of quiet attention." },
        { label: "Challenge Yourself", value: props.challenge || "Step slightly outside your familiar routine." },
        { label: "Bring Into Action", value: props.bringIntoAction || "Apply one insight in a real moment today." },
      ],
    },
    {
      key: "life", icon: "🌍", title: "Life & Relationships", subtitle: "Decisions, connection, values",
      items: [
        { label: "How to Respond", value: props.response || "Listen fully before replying." },
        { label: "Connection to Practise", value: props.connection || "One intentional conversation today." },
        { label: "Decision to Examine", value: props.decision || "Notice how you choose under pressure." },
        { label: "Life Domain Focus", value: props.lifeDomain || "Work, relationships, health, learning." },
        { label: "Act With Intention", value: props.intentionalAction || "One small action aligned with your values." },
      ],
    },
    {
      key: "reflect", icon: "✨", title: "Reflect & Discover", subtitle: "Questions, discoveries, gratitude",
      items: [
        { label: "Question to Carry", value: props.questionToCarry || "What did I learn about myself today?" },
        { label: "Discovery to Look For", value: props.discovery || "A recurring pattern worth exploring." },
        { label: "Capture a Moment", value: props.captureMoment || "Record one observation when something meaningful happens." },
        { label: "Evening Reflection", value: props.eveningReflection || "What shifted in me today?" },
        { label: "End With Gratitude", value: props.gratitude || "One thing you appreciated today." },
      ],
    },
  ];

  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-display tracking-[0.24em] uppercase text-muted-foreground/60 flex items-center gap-1">
            <span>✦</span> Your Day
          </p>
          <p className="text-xs text-muted-foreground">Your personal guidance for today</p>
        </div>
        <span className="text-[10px] font-display tracking-wider uppercase text-primary/80">{groups.length} areas</span>
      </div>

      <div className="space-y-2">
        {groups.map((g) => {
          const isOpen = !!open[g.key];
          return (
            <div key={g.key} className="rounded-xl border border-border/30 bg-background/50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(g.key)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{g.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-display font-medium text-foreground truncate">{g.title}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{g.subtitle}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2 border-t border-border/30">
                  {g.items.map((it) => (
                    <div key={it.label} className="pt-2">
                      <p className="text-[9px] font-display tracking-[0.2em] uppercase text-primary/70">{it.label}</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{it.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
