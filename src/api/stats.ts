/**
 * Stats + weekly insights endpoints.
 */
import { apiFetch } from './client';
import type { StatsData, StatsPeriod, InsightsData, InsightReaction } from './types';

/** GET /api/stats?period=week|month|year. Year requires premium (server-enforced). */
export function fetchStats(period: StatsPeriod): Promise<StatsData> {
  return apiFetch<StatsData>(`/api/stats?period=${period}`);
}

/** GET /api/insights — weekly AI insights (free: preview + locked). */
export function fetchInsights(): Promise<InsightsData> {
  return apiFetch<InsightsData>('/api/insights');
}

/** POST /api/insights/feedback (premium). */
export function sendInsightFeedback(body: {
  weekKey: string;
  suggestionTitle: string;
  reaction: InsightReaction;
}): Promise<unknown> {
  return apiFetch('/api/insights/feedback', { method: 'POST', body });
}
