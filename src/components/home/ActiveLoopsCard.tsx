import { useState } from 'react';
import { AlertCircle, Clock, Target, Zap, Heart, Brain, Wind } from 'lucide-react';

const LOOP_TYPES = [
  { id: 'rumination', name: 'Rumination', icon: Brain, color: 'text-amber-500', severity: 'high', desc: 'Repetitive negative thoughts' },
  { id: 'avoidance', name: 'Avoidance', icon: AlertCircle, color: 'text-red-500', severity: 'medium', desc: 'Escaping uncomfortable feelings' },
  { id: 'perfectionism', name: 'Perfectionism', icon: Target, color: 'text-blue-500', severity: 'medium', desc: 'Unrealistic standards' },
  { id: 'reactivity', name: 'Reactivity', icon: Zap, color: 'text-orange-500', severity: 'high', desc: 'Instant emotional reactions' },
  { id: 'self-criticism', name: 'Self-Criticism', icon: Heart, color: 'text-rose-500', severity: 'low', desc: 'Harsh inner dialogue' },
  { id: 'distraction', name: 'Distraction', icon: Wind, color: 'text-violet-500', severity: 'low', desc: 'Escaping into busyness' },
];

export default function ActiveLoopsCard({ loops = ['rumination', 'reactivity'] }) {
  const [expanded, setExpanded] = useState(false);
  const activeLoops = LOOP_TYPES.filter(l => loops.includes(l.id));
  const inactiveLoops = LOOP_TYPES.filter(l => !loops.includes(l.id));
  
  return (
    <div className='mt-4 rounded-2xl border border-border/30 bg-card/40 p-4'>
      <div className='flex items-center justify-between mb-3'>
        <p className='text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 flex items-center gap-1'>
          <span className='text-xl'>🔄</span> Active Loops
        </p>
        <button onClick={() => setExpanded(!expanded)} className='text-xs text-primary'>
          {expanded ? 'Show Less' : 'All Loops'}
        </button>
      </div>
      
      {activeLoops.length === 0 ? (
        <div className='text-center py-4 text-muted-foreground/50'>
          <p className='text-sm'>No active loops detected</p>
          <p className='text-xs mt-1'>Your mind is clear today</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {activeLoops.map(loop => (
            <div key={loop.id} className='flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${loop.color.replace('text-', 'bg-')}/20`}>
                <loop.icon className={`w-5 h-5 ${loop.color}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <p className='font-medium text-sm'>{loop.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${loop.severity === 'high' ? 'bg-red-500/20 text-red-500' : loop.severity === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                    {loop.severity}
                  </span>
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>{loop.desc}</p>
              </div>
              <button className='text-xs text-primary'>Work on this</button>
            </div>
          ))}
        </div>
      )}
      
      {expanded && inactiveLoops.length > 0 && (
        <div className='mt-4 pt-4 border-t border-border/30'>
          <p className='text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2'>Inactive Loops</p>
          <div className='grid grid-cols-3 gap-2'>
            {inactiveLoops.map(loop => (
              <button key={loop.id} className='p-2 rounded-xl border border-border/30 text-center hover:border-primary/30 transition-colors'>
                <loop.icon className='w-4 h-4 mx-auto mb-1 text-muted-foreground/50' />
                <p className='text-[9px] text-muted-foreground'>{loop.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
