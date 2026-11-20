import { useState } from 'react';
import { TrendingUp, Target, Trophy, Flame } from 'lucide-react';

export default function KarmaProgressCard({ current = 43, weeklyEarned = 12, streak = 3 }) {
  const [showHistory, setShowHistory] = useState(false);
  const weeklyRate = (weeklyEarned / 7).toFixed(1);
  const projectedMonthly = Math.round(weeklyEarned * 4.33);
  
  const history = [
    { day: 'Mon', earned: 2 },
    { day: 'Tue', earned: 1 },
    { day: 'Wed', earned: 3 },
    { day: 'Thu', earned: 0 },
    { day: 'Fri', earned: 2 },
    { day: 'Sat', earned: 4 },
    { day: 'Sun', earned: 0 },
  ];
  
  return (
    <div className='mt-4 rounded-2xl border border-border/30 bg-card/40 p-4'>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 flex items-center gap-1'>
          <Flame className='w-3 h-3 text-amber-500' /> Karma Progress
        </p>
        <button onClick={() => setShowHistory(!showHistory)} className='text-xs text-primary'>
          {showHistory ? 'Hide History' : 'Weekly History'}
        </button>
      </div>
      
      <div className='grid grid-cols-4 gap-3 mb-4'>
        <div className='p-3 rounded-xl bg-background/50 border border-border/30 text-center'>
          <p className='text-2xl font-bold text-amber-500'>{12}</p>
          <p className='text-[10px] text-muted-foreground'>This Week</p>
        </div>
        <div className='p-3 rounded-xl bg-background/50 border border-border/30 text-center'>
          <p className='text-2xl font-bold text-green-500'>{weeklyRate}/day</p>
          <p className='text-[10px] text-muted-foreground'>Avg Daily</p>
        </div>
        <div className='p-3 rounded-xl bg-background/50 border border-border/30 text-center'>
          <p className='text-2xl font-bold text-blue-500'>{projectedMonthly}</p>
          <p className='text-[10px] text-muted-foreground'>Monthly Proj.</p>
        </div>
        <div className='p-3 rounded-xl bg-background/50 border border-border/30 text-center'>
          <p className='text-2xl font-bold text-purple-500'>{streak}</p>
          <p className='text-[10px] text-muted-foreground'>Day Streak</p>
        </div>
      </div>
      
      {showHistory && (
        <div className='mt-4 pt-4 border-t border-border/30'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60'>Last 7 Days</p>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <TrendingUp className='w-3 h-3' /> +15% vs last week
            </div>
          </div>
          <div className='flex items-end justify-between h-24'>
            {history.map((d, i) => (
              <div key={d.day} className='flex flex-col items-center flex-1 gap-1'>
                <div 
                  className='w-full bg-primary/20 rounded-t transition-all hover:bg-primary/40' 
                  style={{ height: `${Math.max(d.earned * 16, 2)}px` }} 
                  />
                  <span className='text-[9px] text-muted-foreground'>{d.day}</span>
                <span className='text-[9px] font-medium'>{d.earned}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
