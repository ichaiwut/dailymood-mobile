/**
 * Shared TanStack Query hooks. Query keys live here so cache invalidation stays
 * consistent across screens.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMoods } from '../api/moods';
import { fetchProfile } from '../api/profile';
import { listEntries, confirmEntry, getEntry, updateEntry, deleteEntry } from '../api/log';
import { fetchAiRemaining, fetchJournalPrompt } from '../api/ai';
import { fetchCalendarMonth, fetchTimeline } from '../api/calendar';
import { fetchStats, fetchInsights, sendInsightFeedback } from '../api/stats';
import { todayKey } from '../lib/time';
import type {
  ConfirmEntryInput,
  UpdateEntryInput,
  StatsPeriod,
  InsightReaction,
} from '../api/types';

export const queryKeys = {
  moods: ['moods'] as const,
  profile: ['profile'] as const,
  aiRemaining: ['ai', 'remaining'] as const,
  entriesByDate: (date: string) => ['log', date] as const,
  calendarMonth: (y: number, m: number) => ['calendar', y, m] as const,
  timeline: (y: number, m: number) => ['timeline', y, m] as const,
  entry: (id: string) => ['entry', id] as const,
  stats: (period: StatsPeriod) => ['stats', period] as const,
  insights: ['insights'] as const,
};

export function useMoods() {
  return useQuery({
    queryKey: queryKeys.moods,
    queryFn: fetchMoods,
    staleTime: 5 * 60_000, // moods rarely change
  });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });
}

export function useEntriesByDate(date: string | null) {
  return useQuery({
    queryKey: queryKeys.entriesByDate(date ?? 'none'),
    queryFn: () => listEntries(date as string),
    enabled: !!date,
  });
}

export function useTodayEntries() {
  return useEntriesByDate(todayKey());
}

export function useAiRemaining() {
  return useQuery({
    queryKey: queryKeys.aiRemaining,
    queryFn: fetchAiRemaining,
    staleTime: 60_000,
  });
}

/** Mood-adaptive journal placeholder. Disabled until a mood + locale are known. */
export function useJournalPrompt(moodId: string | null | undefined, locale: string, enabled: boolean) {
  return useQuery({
    queryKey: ['journalPrompt', moodId, locale],
    queryFn: () => fetchJournalPrompt(moodId as string, locale),
    enabled: enabled && !!moodId,
    staleTime: 60 * 60_000, // cached per mood/day server-side
  });
}

export function useCalendarMonth(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.calendarMonth(year, month),
    queryFn: () => fetchCalendarMonth(year, month),
  });
}

export function useTimeline(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.timeline(year, month),
    queryFn: () => fetchTimeline(year, month),
  });
}

export function useEntry(id: string) {
  return useQuery({ queryKey: queryKeys.entry(id), queryFn: () => getEntry(id), enabled: !!id });
}

/** Invalidate every list/aggregate that an entry write can affect. */
function invalidateEntryViews(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.entriesByDate(todayKey()) });
  qc.invalidateQueries({ queryKey: queryKeys.profile });
  qc.invalidateQueries({ queryKey: queryKeys.aiRemaining });
  qc.invalidateQueries({ queryKey: ['calendar'] });
  qc.invalidateQueries({ queryKey: ['timeline'] });
}

/** Confirm (save) an entry, then refresh today's list, profile streak, quota. */
export function useConfirmEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfirmEntryInput) => confirmEntry(input),
    onSuccess: () => invalidateEntryViews(qc),
  });
}

export function useUpdateEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEntryInput) => updateEntry(id, input),
    onSuccess: () => {
      invalidateEntryViews(qc);
      qc.invalidateQueries({ queryKey: queryKeys.entry(id) });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => invalidateEntryViews(qc),
  });
}

export function useStats(period: StatsPeriod) {
  return useQuery({ queryKey: queryKeys.stats(period), queryFn: () => fetchStats(period) });
}

export function useInsights() {
  return useQuery({ queryKey: queryKeys.insights, queryFn: fetchInsights });
}

export function useInsightFeedback() {
  return useMutation({
    mutationFn: (body: { weekKey: string; suggestionTitle: string; reaction: InsightReaction }) =>
      sendInsightFeedback(body),
  });
}
