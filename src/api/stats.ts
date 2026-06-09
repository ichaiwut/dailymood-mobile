/**
 * Stats + weekly insights endpoints.
 */
import { apiFetch } from './client';
import type { StatsData, StatsPeriod, InsightsData, InsightsAll, InsightReaction } from './types';

/** GET /api/stats?period=week|month|year. Year requires premium (server-enforced). */
export function fetchStats(period: StatsPeriod): Promise<StatsData> {
  return apiFetch<StatsData>(`/api/stats?period=${period}`);
}

/** GET /api/insights — weekly AI insights (free: preview + locked). */
export function fetchInsights(): Promise<InsightsData> {
  return apiFetch<InsightsData>('/api/insights');
}

/** GET /api/insights/all — the rich weekly dashboard (Pro). `week` = ISO week key for history. */
export function fetchInsightsAll(locale: string, week?: string): Promise<InsightsAll> {
  const q = new URLSearchParams({ locale });
  if (week) q.set('week', week);
  return apiFetch<InsightsAll>(`/api/insights/all?${q.toString()}`);
}

/** POST /api/insights/feedback (premium). */
export function sendInsightFeedback(body: {
  weekKey: string;
  suggestionTitle: string;
  reaction: InsightReaction;
}): Promise<unknown> {
  return apiFetch('/api/insights/feedback', { method: 'POST', body });
}
