/**
 * TEMPLE - Calendar Component
 * Per temple.md Section 32: Sacred dates, lunar cycles, personal milestones, global events
 */
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon, Star, Calendar as CalendarIcon, Users } from "lucide-react";
import { useState } from "react";

type EventType = "full-moon" | "new-moon" | "personal-milestone" | "traditional-observance" | "global-sangha";

interface TempleEvent {
  id: string;
  date: number;
  type: EventType;
  title: string;
  description: string;
  masterName?: string;
  isGlobal: boolean;
  participantCount?: number;
}

const EVENTS: TempleEvent[] = [
  {
    id: "1",
    date: 5,
    type: "personal-milestone" as const,
    title: "Your Temple Anniversary",
    description: "1 year since you entered the Temple",
    isGlobal: false,
  },
  {
    id: "2",
    date: 14,
    type: "traditional-observance" as const,
    title: "Navratri Begins",
    description: "9 nights with Devi masters",
    masterName: "Devi",
    isGlobal: false,
  },
  {
    id: "3",
    date: 19,
    type: "full-moon" as const,
    title: "Full Moon",
    description: "Krishna offers extended silence session. The energy is different tonight.",
    masterName: "Krishna",
    isGlobal: false,
  },
  {
    id: "4",
    date: 21,
    type: "global-sangha" as const,
    title: "Global Sangha Event",
    description: "100,000 meditating together at 8 PM",
    isGlobal: true,
    participantCount: 100000,
  },
];

const EVENT_TYPE_ICONS: Record<EventType, React.ReactNode> = {
  "full-moon": <Moon className="w-3 h-3 text-blue-300/60" />,
  "new-moon": <Moon className="w-3 h-3 text-gray-400/60" />,
  "personal-milestone": <Star className="w-3 h-3 text-amber-300/60" />,
  "traditional-observance": <CalendarIcon className="w-3 h-3 text-orange-300/60" />,
  "global-sangha": <Users className="w-3 h-3 text-purple-300/60" />,
};

export default function TempleCalendar() {
  const [currentMonth] = useState("April 2026");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // April 2026 starts on Wednesday (index 3)
  const daysInMonth = 30;
  const startDay = 3;

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Empty cells for start
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const getEventsForDate = (date: number) => EVENTS.filter((e) => e.date === date);

  return (
    <div className="pt-6 pb-8 px-4 md:px-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-2">🌙 Temple Calendar</p>
        <div className="flex items-center justify-center gap-4">
          <button className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-white/80 text-xl font-display tracking-wide">{currentMonth}</h2>
          <button className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-white/20 text-[9px] font-display tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day, dayIdx) => {
              const events = day ? getEventsForDate(day) : [];
              const hasEvent = events.length > 0;
              const isSelected = selectedDate === day;
              const today = day === 5; // Simulated today

              return (
                <button
                  key={dayIdx}
                  onClick={() => day && setSelectedDate(day)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-display transition-all ${
                    !day
                      ? "pointer-events-none"
                      : isSelected
                      ? "bg-amber-500/20 text-white/90 border border-amber-500/30"
                      : today
                      ? "bg-white/[0.08] text-white/80 border border-white/[0.15]"
                      : hasEvent
                      ? "bg-white/[0.04] text-white/60 border border-white/[0.08] hover:bg-white/[0.08]"
                      : "text-white/40 hover:bg-white/[0.04]"
                  }`}
                >
                  {day}
                  {hasEvent && (
                    <div className="absolute bottom-0.5 flex gap-0.5">
                      {events.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-amber-400/60" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Date Events */}
      {selectedDate && getEventsForDate(selectedDate).length > 0 && (
        <motion.div
          className="space-y-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase">
            April {selectedDate} Events
          </h3>
          {getEventsForDate(selectedDate).map((event, i) => (
            <motion.div
              key={event.id}
              className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-2">
                {EVENT_TYPE_ICONS[event.type]}
                <div>
                  <p className="text-white/70 text-xs font-display font-medium">{event.title}</p>
                  <p className="text-white/30 text-[10px] font-display mt-0.5">{event.description}</p>
                  {event.participantCount && (
                    <p className="text-purple-400/40 text-[10px] font-display mt-1">
                      🌍 {event.participantCount.toLocaleString()} practitioners
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upcoming Events */}
      <div>
        <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
          Upcoming Events
        </h3>
        <div className="space-y-2">
          {EVENTS.map((event, i) => (
            <motion.div
              key={event.id}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {EVENT_TYPE_ICONS[event.type]}
                  <div>
                    <p className="text-white/60 text-xs font-display">
                      Apr {event.date}: {event.title}
                    </p>
                    {event.isGlobal && (
                      <p className="text-purple-400/40 text-[10px] font-display">🌍 Global Sangha</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-white/20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
