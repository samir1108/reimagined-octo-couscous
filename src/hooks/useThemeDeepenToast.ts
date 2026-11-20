/**
 * useThemeDeepenToast — Watches the daily theme's `last_evolved_at` and shows
 * a subtle toast when the Living Theme Engine deepens, holds, or closes the thread.
 * Mount this once near the app root (or on Home).
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useThemeOfDay } from '@/hooks/useThemeOfDay';

export function useThemeDeepenToast() {
  const { data } = useThemeOfDay();
  const lastSeen = useRef<string | null>(null);

  useEffect(() => {
    const evolvedAt = data?.theme?.last_evolved_at ?? null;
    if (!evolvedAt) return;

    // First mount — record without firing
    if (lastSeen.current === null) {
      lastSeen.current = evolvedAt;
      return;
    }

    if (evolvedAt !== lastSeen.current) {
      lastSeen.current = evolvedAt;
      const status = data?.theme?.evolution_status;
      const subAngle = data?.theme?.sub_angle;

      if (status === 'closed') {
        toast('This thread closed', {
          description: 'A new thread arrives tomorrow. Sit with what stayed.',
          duration: 4200,
        });
      } else if (subAngle) {
        toast('↻ The thread deepens', {
          description: subAngle,
          duration: 4200,
        });
      }
    }
  }, [data?.theme?.last_evolved_at, data?.theme?.evolution_status, data?.theme?.sub_angle]);
}
