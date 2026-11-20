// Daily commitment step — runs right after pace pick.
// Asks: how many minutes/day + what time should we nudge you?
// We persist both, then schedule a daily local notification via Notifications API
// for the next 11 days (Foundation expected runtime).

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell } from 'lucide-react';
import { Button } from "@/design-system";
import { cn } from '@/lib/utils';

interface PreJourneyCommitmentProps {
  defaultMinutes?: number;
  defaultTime?: string;
  onConfirm: (minutes: number, notifyTime: string) => void;
  loading?: boolean;
}

const MINUTE_OPTS = [10, 20, 30, 45, 60];

export function PreJourneyCommitment({
  defaultMinutes = 30,
  defaultTime = '08:00',
  onConfirm,
  loading,
}: PreJourneyCommitmentProps) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  // Parse defaultTime ("HH:mm" 24h) into 12h + meridiem
  const [defH24, defM] = defaultTime.split(':').map(Number);
  const [hour12, setHour12] = useState<number>(((defH24 + 11) % 12) + 1);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(defH24 >= 12 ? 'PM' : 'AM');
  const minute = defM || 0;

  const to24h = (h12: number, m: 'AM' | 'PM') => {
    let h = h12 % 12;
    if (m === 'PM') h += 12;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };
  const time = to24h(hour12, meridiem);

  const requestNotifPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
  };

  const handleConfirm = async () => {
    await requestNotifPermission();
    onConfirm(minutes, time);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto px-5 py-12"
    >
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Foundation · A small commitment
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
          How much of you, daily?
        </h1>
        <p className="text-muted-foreground mt-3">
          You set the time. The Mirror remembers.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border bg-card/50 p-5 mb-8 space-y-3 text-sm">
        <p className="font-medium text-foreground">How this works</p>
        <ul className="space-y-2 text-muted-foreground leading-relaxed">
          <li>• 60 short sessions across 11 days (or your chosen pace).</li>
          <li>• After every 2nd session, a short Mirror — 3-5 questions.</li>
          <li>• 100 mirrors in total. Each one trains your AI companion.</li>
          <li>• At the end: a cinematic reveal of who you actually are.</li>
          <li>• Then lifetime companionship — personalised to your real shape.</li>
        </ul>
      </div>

      {/* Minutes */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Clock className="w-4 h-4" /> Daily minutes
        </label>
        <div className="flex gap-2">
          {MINUTE_OPTS.map(m => {
            const active = minutes === m;
            return (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={cn(
                  'flex-1 py-3 rounded-xl border-2 font-semibold transition',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-muted-foreground/30',
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          ~{Math.max(1, Math.round(minutes / 6))} sessions per day at this pace.
        </p>
      </div>

      {/* Notify time */}
      <div className="mb-10">
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Bell className="w-4 h-4" /> Daily reminder time
        </label>
        <div className="space-y-3">
          {/* Hour 1-12 grid */}
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
              const active = hour12 === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHour12(h)}
                  className={cn(
                    'py-3 rounded-xl border-2 font-semibold transition text-sm',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-muted-foreground/30',
                  )}
                >
                  {h}
                </button>
              );
            })}
          </div>
          {/* AM / PM */}
          <div className="grid grid-cols-2 gap-2">
            {(['AM', 'PM'] as const).map(m => {
              const active = meridiem === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMeridiem(m)}
                  className={cn(
                    'py-3 rounded-xl border-2 font-semibold transition',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-muted-foreground/30',
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Reminder set for <span className="text-foreground font-medium">{hour12}:00 {meridiem}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          We'll nudge you here. Miss it? The next session opens with a Mirror waiting.
        </p>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Sealing…' : 'Begin'}
      </Button>
    </motion.div>
  );
}
