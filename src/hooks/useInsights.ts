import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Timeframe } from '@/machines/insightsMachine';

export interface DimensionTrend {
  dimension: string;
  slope: number;
  current: number;
  previous: number;
  direction: 'rising' | 'falling' | 'stable';
}

export interface Prediction {
  type: string;
  severity: 'info' | 'warning' | 'critical' | 'positive';
  title: string;
  description: string;
  confidence: number;
}

export interface InsightsData {
  trends: {
    dimensions: DimensionTrend[];
    sessions: { slope: number; recentCount: number; totalDays: number };
    mood: { slope: number; avgMood: number };
    energy: { slope: number; avgEnergy: number };
  };
  predictions: Prediction[];
  aiSummary: string;
  meta: {
    daysAnalyzed: number;
    signalsCount: number;
    sessionsCount: number;
    reflectionsCount: number;
    journeyDay: number;
    profileState: string;
  };
}

export function useInsights(timeframe: Timeframe = 14) {
  return useQuery<InsightsData>({
    queryKey: ['predictive-insights', timeframe],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('predictive-insights', {
        body: { days: timeframe },
      });

      if (error) throw new Error(error.message || 'Failed to fetch insights');
      return data as InsightsData;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}
