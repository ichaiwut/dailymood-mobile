/**
 * Shared TanStack Query hooks. Query keys live here so cache invalidation stays
 * consistent across screens.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMoods } from '../api/moods';
import { fetchProfile } from '../api/profile';
import { listEntries, confirmEntry } from '../api/log';
import { fetchAiRemaining, fetchJournalPrompt } from '../api/ai';
import { todayKey } from '../lib/time';
import type { ConfirmEntryInput } from '../api/types';

export const queryKeys = {
  moods: ['moods'] as const,
  profile: ['profile'] as const,
  aiRemaining: ['ai', 'remaining'] as const,
  entriesByDate: (date: string) => ['log', date] as const,
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

export function useTodayEntries() {
  const date = todayKey();
  return useQuery({
    queryKey: queryKeys.entriesByDate(date),
    queryFn: () => listEntries(date),
  });
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

/** Confirm (save) an entry, then refresh today's list, profile streak, quota. */
export function useConfirmEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfirmEntryInput) => confirmEntry(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.entriesByDate(todayKey()) });
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.aiRemaining });
    },
  });
}
