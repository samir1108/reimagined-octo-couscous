/**
 * COMPANION INSIGHTS HOOK — Real-time companion notifications in UI
 * Subscribes to Consciousness Bus for companion_* signal types
 */

import { useEffect, useState } from 'react';
import { useConsciousnessBus, type EngineSignal } from '@/hooks/useConsciousnessBus';

export interface CompanionInsight {
  id: string;
  type: 'insight' | 'milestone' | 'nudge' | 'pattern';
  title: string;
  body: string;
  action?: 'guide' | 'journal' | 'none';
  mode?: string;
  journalPrompt?: string;
  aiContext?: string;
  insightSummary: string;
  referencedData: string[];
  createdAt: string;
  read: boolean;
}

/** Hook to get real-time companion insights from Consciousness Bus */
export function useCompanionInsights(): {
  insights: CompanionInsight[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
} {
  const { signals } = useConsciousnessBus();
  const [insights, setInsights] = useState<CompanionInsight[]>([]);

  // Filter companion signals and convert to insights
  useEffect(() => {
    const companionSignals = signals
      .filter((s): s is EngineSignal & { metadata: any } => 
        s.signal_type.startsWith('companion_') && !!s.metadata
      )
      .map((s) => ({
        id: s.id,
        type: s.signal_type.replace('companion_', '') as CompanionInsight['type'],
        title: s.metadata?.title || 'Companion Insight',
        body: s.metadata?.body || '',
        action: s.metadata?.action,
        mode: s.metadata?.mode,
        journalPrompt: s.metadata?.journalPrompt,
        aiContext: s.metadata?.aiContext,
        insightSummary: s.metadata?.insightSummary || '',
        referencedData: s.metadata?.referencedData || [],
        createdAt: s.created_at,
        read: false,
      }));

    setInsights(prev => {
      // Merge new signals, avoiding duplicates by ID
      const existingIds = new Set(prev.map(i => i.id));
      const newInsights = companionSignals.filter(i => !existingIds.has(i.id));
      return [...newInsights, ...prev].slice(0, 50); // Keep last 50
    });
  }, [signals]);

  const unreadCount = insights.filter(i => !i.read).length;

  const markAsRead = (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  const markAllAsRead = () => {
    setInsights(prev => prev.map(i => ({ ...i, read: true })));
  };

  const dismiss = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  return { insights, unreadCount, markAsRead, markAllAsRead, dismiss };
}

/** Hook for the latest unread companion insight (for banner/toast) */
export function useLatestCompanionInsight(): CompanionInsight | null {
  const { insights } = useCompanionInsights();
  return insights.find(i => !i.read) || null;
}

/** Hook for companion insights by type */
export function useCompanionInsightsByType(type: CompanionInsight['type']): CompanionInsight[] {
  const { insights } = useCompanionInsights();
  return insights.filter(i => i.type === type);
}

/** Component: Companion Insight Banner (for Home/Guide screens) */
export function CompanionInsightBanner({ onDismiss, onAction }: { 
  onDismiss?: (id: string) => void;
  onAction?: (insight: CompanionInsight) => void;
}) {
  const latest = useLatestCompanionInsight();
  
  if (!latest) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-sacred-surface border border-sacred-border rounded-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sacred-text">{latest.title}</h4>
            <p className="text-sm text-sacred-muted mt-1">{latest.body}</p>
            
            {(latest.action === 'guide' || latest.action === 'journal') && (
              <button
                onClick={() => onAction?.(latest)}
                className="mt-2 text-xs font-medium text-sacred-gold hover:underline"
              >
                {latest.action === 'guide' ? 'Open Guide' : 'Journal Now'}
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss?.(latest.id)}
            className="text-sacred-muted hover:text-sacred-text p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Component: Companion Insights Panel (for dedicated insights screen) */
export function CompanionInsightsPanel() {
  const { insights, unreadCount, markAsRead, markAllAsRead, dismiss } = useCompanionInsights();

  if (insights.length === 0) {
    return (
      <div className="text-center py-12 text-sacred-muted">
        <p>No companion insights yet.</p>
        <p className="text-sm mt-2">Your companion will share insights as it learns your patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Companion Insights</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-sacred-gold hover:underline">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border transition-colors ${
              insight.read 
                ? 'bg-sacred-surface/50 border-sacred-border' 
                : 'bg-sacred-gold/10 border-sacred-gold/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{insight.type === 'milestone' ? '🎉' : insight.type === 'nudge' ? '💡' : insight.type === 'pattern' ? '🔍' : '✨'}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sacred-text">{insight.title}</h4>
                <p className="text-sm text-sacred-muted mt-1">{insight.body}</p>
                <p className="text-xs text-sacred-muted/70 mt-2">
                  {new Date(insight.createdAt).toLocaleDateString()} · {insight.insightSummary}
                </p>
              </div>
              <div className="flex gap-1">
                {!insight.read && (
                  <button onClick={() => markAsRead(insight.id)} className="text-xs text-sacred-gold hover:underline px-2 py-1">
                    Mark read
                  </button>
                )}
                <button onClick={() => dismiss(insight.id)} className="text-sacred-muted hover:text-sacred-text p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}