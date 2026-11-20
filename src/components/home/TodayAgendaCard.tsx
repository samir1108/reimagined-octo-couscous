import { useState } from 'react';
import { Clock, Sun, Moon, Star, Coffee, BookOpen, Heart, Zap } from 'lucide-react';

const TIME_SLOTS = [
  { id: 'dawn', label: 'Dawn', time: '5:30–7:00 AM', icon: Sun, color: 'text-amber-400', suggested: 'Meditation • Breathwork' },
  { id: 'morning', label: 'Morning', time: '7:00–10:00 AM', icon: Coffee, color: 'text-amber-500', suggested: 'Movement • Journaling' },
  { id: 'midday', label: 'Midday', time: '12:00–2:00 PM', icon: Sun, color: 'text-yellow-400', suggested: 'Focus Work • Walk' },
  { id: 'afternoon', label: 'Afternoon', time: '2:00–5:00 PM', icon: Zap, color: 'text-orange-400', suggested: 'Creative • Meetings' },
  { id: 'evening', label: 'Evening', time: '5:00–8:00 PM', icon: Moon, color: 'text-blue-400', suggested: 'Reflection • Connection' },
  { id: 'night', label: 'Night', time: '8:00–10:00 PM', icon: Star, color: 'text-indigo-400', suggested: 'Wind-down • Reading' },
];

const DAILY_FOCUS = [
  { time: '6:00 AM', task: 'Morning observation (10 min)', type: 'practice', done: false },
  { time: '12:30 PM', task: 'Midday presence check', type: 'presence', done: false },
  { time: '6:30 PM', task: 'Evening reflection', type: 'reflection', done: false },
  { time: '9:00 PM', task: 'Journal 3 lines', type: 'journal', done: false },
];

function getTypeStyle(type) {
  switch (type) {
    case 'practice': return 'bg-blue-500/20 text-blue-500';
    case 'presence': return 'bg-green-500/20 text-green-500';
    case 'reflection': return 'bg-purple-500/20 text-purple-500';
    default: return 'bg-amber-500/20 text-amber-500';
  }
}

export default function TodayAgendaCard({ completedSlots = [] }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className='mt-4 rounded-2xl border border-border/30 bg-card/40 p-4'>
      <div className='flex items-center justify-between mb-3'>
        <p className='text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 flex items-center gap-1'>
          <span className='text-xl'>📅</span> Today's Agenda
        </p>
        <button onClick={() => setExpanded(!expanded)} className='text-xs text-primary'>
          {expanded ? 'Show Less' : 'Full Timeline'}
        </button>
      </div>
      
      <div className='space-y-2 mb-4'>
        {DAILY_FOCUS.map((item, i) => (
          <div key={i} className='flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30'>
            <div className='w-16 text-right text-xs text-muted-foreground font-mono'>{item.time}</div>
            <div className='flex-1'>
              <p className='text-sm font-medium'>{item.task}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getTypeStyle(item.type)}`}>{item.type}</span>
            </div>
            <input type='checkbox' className='w-5 h-5 accent-primary' />
          </div>
        ))}
        
        {expanded && (
          <>
            <div className='mt-4 pt-4 border-t border-border/30'>
              <p className='text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-3'>Time Slots Forecast</p>
              <div className='space-y-2'>
                {TIME_SLOTS.map(slot => (
                  <div key={slot.id} className='flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30'>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${slot.color.replace('text-', 'bg-')}/20`}>
                      <slot.icon className={`w-5 h-5 ${slot.color}`} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium'>{slot.label}</p>
                        <span className='text-xs text-muted-foreground'>{slot.time}</span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-0.5'>Suggested: {slot.suggested}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <button onClick={() => setExpanded(!expanded)} className='w-full mt-3 text-xs text-primary'>
          {expanded ? 'Show Less' : 'View Full Timeline & Forecast'}
        </button>
      </div>
    </div>
  );
}
