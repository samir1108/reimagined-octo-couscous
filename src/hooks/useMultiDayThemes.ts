import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { clearThemeCache } from '@/hooks/useThemeOfDay';

interface MultiDayThemeResponse {
  theme: {
    id: string;
    title: string;
    description: string;
    theme_date: string;
    affirmation: string;
    focus_areas: string[];
    micro_practice?: { title?: string; description?: string; duration_min?: number };
    inner_inquiry?: string;
    engagement_question?: string;
    felt_sense_opener?: string;
    resistance_warning?: string;
    theme_rationale?: string;
    daily_intentions?: string[];
    learning_focus?: string;
    action_items?: string[];
    current_depth?: number;
    max_depth?: number;
    sequence_no?: number;
    sub_angle?: string | null;
    evolution_status?: 'open' | 'closed';
    deepened_wisdom?: string | null;
    deepened_reasoning?: string | null;
    deepened_explore?: { label: string; prompt: string }[] | null;
    recommended_practice?: { title: string; why: string; duration_min: number; type: string } | null;
    last_evolved_at?: string | null;
  } | null;
  dailyTasks: any[];
  observationTasks: any[];
  sessions: any[];
  gap_days?: number;
  recalibration_note?: string | null;
  previous_focus?: string[];
  previous_title?: string | null;
}

interface DayTheme {
  date: string;
  label: string;
  theme: MultiDayThemeResponse['theme'];
  isComposing: boolean;
  isToday: boolean;
}

const CACHE_KEY_PREFIX = 'satyug-theme-';

function getCachedTheme(date: string): MultiDayThemeResponse | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${date}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached?.theme?.theme_date === date) return cached;
    // Corrupted cache - wrong date stored
    console.warn(`[multi-day] Cache date mismatch for ${date}, clearing`);
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${date}`);
    return null;
  } catch {
    return null;
  }
}

function setCachedTheme(date: string, data: MultiDayThemeResponse) {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${date}`, JSON.stringify(data));
  } catch { /* quota exceeded — ignore */ }
}

export function useMultiDayThemes(days: number = 3) {
  const queryClient = useQueryClient();

  // Clear potentially corrupted cache on mount
  useEffect(() => {
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const date = d.toISOString().split('T')[0];
      try {
        const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${date}`);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.theme?.theme_date !== date) {
            console.warn(`[multi-day] Clearing stale cache for ${date}`);
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${date}`);
          }
        }
      } catch {}
    }
  }, [days]);

  useEffect(() => {
    function handleThemeComposed() {
      queryClient.invalidateQueries({ queryKey: ['multi-day-themes'] });
    }
    window.addEventListener('theme:composed', handleThemeComposed);
    return () => window.removeEventListener('theme:composed', handleThemeComposed);
  }, [queryClient]);

  return useQuery<DayTheme[]>({
    queryKey: ['multi-day-themes', days, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const today = new Date();
      const dates: string[] = [];
      const labels: string[] = [];

      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
        if (i === 0) labels.push('Today');
        else if (i === 1) labels.push('Tomorrow');
        else labels.push(d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }));
      }

      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) throw new Error('Not authenticated');

      const results: DayTheme[] = [];

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const label = labels[i];
        const isToday = i === 0;

        // Check localStorage cache first
        const cached = getCachedTheme(date);
        if (cached && authSession) {
          console.log(`[multi-day] Cache HIT for ${date} (${label})`, cached.theme?.title);
          const [
            { data: freshSessions },
            { data: freshDailyTasks },
            { data: freshObsTasks },
          ] = await Promise.all([
            supabase
              .from('sessions')
              .select('*')
              .eq('session_date', date)
              .order('started_at', { ascending: true }),
            supabase
              .from('daily_tasks')
              .select('*')
              .eq('user_id', authSession.user.id)
              .eq('task_date', date)
              .order('time_slot'),
            supabase
              .from('observation_tasks')
              .select('*')
              .eq('user_id', authSession.user.id)
              .eq('task_date', date)
              .order('chain_order', { ascending: true }),
          ]);

          let theme = cached.theme;
          const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!theme.id || !UUID_RE.test(String(theme.id))) {
            theme = { ...theme, id: null } as typeof theme;
          }

          results.push({
            date,
            label,
            theme,
            isComposing: false,
            isToday,
          });
          continue;
        }

        // Check if pre-composed theme exists in DB
        console.log(`[multi-day] Querying DB for ${date} (${label})`);
        const { data: precomposedTheme, error: themeError } = await supabase
          .from('daily_themes')
          .select('*')
          .eq('user_id', authSession.user.id)
          .eq('theme_date', date)
          .order('sequence_no', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (themeError) {
          console.error(`[multi-day] DB error for ${date}:`, themeError);
        }
        console.log(`[multi-day] DB result for ${date}:`, precomposedTheme?.title || 'NULL');

        if (precomposedTheme) {
          const [
            { data: freshSessions },
            { data: freshDailyTasks },
            { data: freshObsTasks },
          ] = await Promise.all([
            supabase
              .from('sessions')
              .select('*')
              .eq('session_date', date)
              .order('started_at', { ascending: true }),
            supabase
              .from('daily_tasks')
              .select('*')
              .eq('user_id', authSession.user.id)
              .eq('task_date', date)
              .order('time_slot'),
            supabase
              .from('observation_tasks')
              .select('*')
              .eq('user_id', authSession.user.id)
              .eq('task_date', date)
              .order('chain_order', { ascending: true }),
          ]);

          const themeData = {
            theme: precomposedTheme as any,
            dailyTasks: (freshDailyTasks || []) as any[],
            observationTasks: (freshObsTasks || []) as any[],
            sessions: (freshSessions || []) as any[],
          };

          setCachedTheme(date, themeData);

          results.push({
            date,
            label,
            theme: precomposedTheme as any,
            isComposing: false,
            isToday,
          });
          continue;
        }

        // No theme yet - trigger background composition for future days
        if (!isToday) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('theme:composing', { detail: { active: true, date } }));
          }

          // Fire-and-forget composition for future days
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-theme`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authSession.access_token}`,
              },
              body: JSON.stringify({
                targetDate: date,
              }),
            }
          ).then(async (response) => {
            if (response.ok) {
              const data = await response.json();
              setCachedTheme(date, data);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('theme:composed', { detail: { ...data, date } }));
              }
            }
          }).catch(() => { /* ignore */ });
        }

        // Return composing state for future days
        results.push({
          date,
          label,
          theme: {
            id: 'composing',
            title: isToday ? 'Composing your day…' : `${label}'s journey is being prepared…`,
            description: isToday ? 'Your guide is preparing today\'s experience.' : `We're composing ${label.toLowerCase()}'s journey for you.`,
            theme_date: date,
            created_at: new Date().toISOString(),
            affirmation: 'I am present.',
            focus_areas: ['presence'],
            user_id: authSession.user.id,
            _composing: true,
          } as any,
          isComposing: !isToday,
          isToday,
        });
      }

      return results;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24h
    retry: 2,
  });
}

export function useRefreshMultiDayThemes() {
  const qc = useQueryClient();
  return () => {
    // Clear all cached themes
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const date = d.toISOString().split('T')[0];
      try { localStorage.removeItem(`${CACHE_KEY_PREFIX}${date}`); } catch {}
    }
    qc.invalidateQueries({ queryKey: ['multi-day-themes'] });
    qc.invalidateQueries({ queryKey: ['theme-of-day'] });
    qc.invalidateQueries({ queryKey: ['observation-tasks'] });
    qc.invalidateQueries({ queryKey: ['daily-tasks'] });
  };
}