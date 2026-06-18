/**
 * Shared TanStack Query hooks. Query keys live here so cache invalidation stays
 * consistent across screens.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMoods, createMood, deleteMood } from '../api/moods';
import { fetchActivities } from '../api/activities';
import {
  fetchProfile,
  updateProfile,
  fetchAchievements,
  uploadAvatar,
  deleteAvatar,
} from '../api/profile';
import { fetchSubscription, activateTrial } from '../api/subscription';
import { listEntries, confirmEntry, getEntry, updateEntry, deleteEntry } from '../api/log';
import { fetchAiRemaining, fetchJournalPrompt } from '../api/ai';
import {
  fetchCalendarMonth,
  fetchTimeline,
  fetchYearInPixels,
  fetchCalendarAi,
  askCalendar,
  fetchEvents,
} from '../api/calendar';
import { fetchStats, fetchInsights, fetchInsightsAll, sendInsightFeedback } from '../api/stats';
import { fetchAskThreads, fetchAskSuggested } from '../api/askai';
import { fetchBookmarks, fetchReactions } from '../api/articles';
import { fetchPersonalEvents, createEvent, deleteEvent } from '../api/events';
import { fetchPasswordStatus, changePassword } from '../api/account';
import { todayKey } from '../lib/time';
import type {
  ConfirmEntryInput,
  UpdateEntryInput,
  StatsPeriod,
  InsightReaction,
  UpdateProfileInput,
} from '../api/types';

export const queryKeys = {
  moods: ['moods'] as const,
  profile: ['profile'] as const,
  aiRemaining: ['ai', 'remaining'] as const,
  entriesByDate: (date: string) => ['log', date] as const,
  calendarMonth: (y: number, m: number) => ['calendar', y, m] as const,
  calendarAi: (y: number, m: number) => ['calendar-ai', y, m] as const,
  events: (y: number, m: number) => ['events', y, m] as const,
  yearInPixels: (y: number) => ['year-in-pixels', y] as const,
  timeline: (y: number, m: number) => ['timeline', y, m] as const,
  entry: (id: string) => ['entry', id] as const,
  stats: (period: StatsPeriod) => ['stats', period] as const,
  insights: ['insights'] as const,
  insightsAll: (week?: string) => ['insights-all', week ?? 'current'] as const,
  askThreads: ['ask-ai', 'threads'] as const,
  askSuggested: (locale: string) => ['ask-ai', 'suggested', locale] as const,
  bookmarks: ['articles', 'bookmarks'] as const,
  reactions: ['articles', 'reactions'] as const,
  personalEvents: ['personal-events'] as const,
  achievements: ['achievements'] as const,
  subscription: ['subscription'] as const,
  iapOfferings: ['iap', 'offerings'] as const,
};

export function useMoods() {
  return useQuery({
    queryKey: queryKeys.moods,
    queryFn: fetchMoods,
    staleTime: 5 * 60_000, // moods rarely change
  });
}

export function useActivities() {
  return useQuery({ queryKey: ['activities'], queryFn: fetchActivities, staleTime: 5 * 60_000 });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });
}

/**
 * The user's selected mood-icon pack + its icon format, for `MoodPicker`/`PASticker`.
 * Always thread these into mood icons so entries render the user's chosen pack
 * (not the default). Undefined while the profile loads → PASticker's default pack.
 */
export function useMoodPack(): { pack: string | undefined; packFormat: string | undefined } {
  const { data } = useProfile();
  const pack = data?.user.moodPack;
  return { pack, packFormat: data?.packs?.find((p) => p.id === pack)?.iconFormat };
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

/** Year-in-Pixels (Pro). Pass enabled=false for free users to skip the call. */
export function useYearInPixels(year: number, locale: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.yearInPixels(year),
    queryFn: () => fetchYearInPixels(year, locale),
    enabled,
  });
}

/** Monthly calendar AI (Pro): summary + highlights + patterns. */
export function useCalendarAi(year: number, month: number, locale: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.calendarAi(year, month),
    queryFn: () => fetchCalendarAi(year, month, locale),
    enabled,
    staleTime: 5 * 60_000, // cached server-side
  });
}

/** Special days (holidays + personal) for a month. */
export function useEvents(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.events(year, month),
    queryFn: () => fetchEvents(year, month),
    staleTime: 60 * 60_000,
  });
}

/** Ask-AI over a month (Pro, 10/hr — handle 429 at the call site). */
export function useAskCalendar() {
  return useMutation({
    mutationFn: (body: { query: string; year: number; month: number; locale: string }) =>
      askCalendar(body),
  });
}

export function useEntry(id: string) {
  return useQuery({ queryKey: queryKeys.entry(id), queryFn: () => getEntry(id), enabled: !!id });
}

/** Invalidate every list/aggregate that an entry write can affect. */
function invalidateEntryViews(qc: ReturnType<typeof useQueryClient>) {
  // refetchType 'all' so the list updates even if the Today screen is momentarily
  // inactive behind the Smart Log modal.
  qc.invalidateQueries({ queryKey: ['log'], refetchType: 'all' });
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

export function useInsightsAll(locale: string, week?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.insightsAll(week),
    queryFn: () => fetchInsightsAll(locale, week),
    enabled,
    // The backend returns forecast/themes/dna as null on first load and generates
    // them fire-and-forget (cached in DB for the next call). Without polling the
    // "AI กำลังสร้าง…" cards stay stuck until a manual refresh — so poll until they
    // land. Stop once all present, when entries are too few to ever generate them,
    // or after ~6 attempts so a persistently-failing generator can't loop forever.
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d || d.tooFewEntries) return false;
      const pending = !d.forecast || !d.dna || !d.themes;
      if (!pending || query.state.dataUpdateCount > 6) return false;
      return 8000;
    },
  });
}

export function useAskThreads(enabled = true) {
  return useQuery({ queryKey: queryKeys.askThreads, queryFn: fetchAskThreads, enabled });
}

export function useAskSuggested(locale: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.askSuggested(locale), queryFn: () => fetchAskSuggested(locale), enabled, staleTime: 60 * 60_000 });
}

export function useBookmarks() {
  return useQuery({ queryKey: queryKeys.bookmarks, queryFn: fetchBookmarks });
}

export function useCreateMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { emoji: string; label: string; color: string; iconKey?: string }) => createMood(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.moods }),
  });
}

export function useDeleteMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMood(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.moods }),
  });
}

export function usePersonalEvents() {
  return useQuery({ queryKey: queryKeys.personalEvents, queryFn: fetchPersonalEvents });
}

export function usePasswordStatus() {
  return useQuery({ queryKey: ['account', 'password'], queryFn: fetchPasswordStatus });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (body: { currentPassword?: string; newPassword: string }) => changePassword(body) });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { label: string; month: number; day: number; emoji: string }) => createEvent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.personalEvents });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.personalEvents });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useReactions() {
  return useQuery({ queryKey: queryKeys.reactions, queryFn: fetchReactions });
}

export function useInsightFeedback() {
  return useMutation({
    mutationFn: (body: { weekKey: string; suggestionTitle: string; reaction: InsightReaction }) =>
      sendInsightFeedback(body),
  });
}

export function useAchievements() {
  return useQuery({ queryKey: queryKeys.achievements, queryFn: fetchAchievements });
}

export function useSubscription(enabled = true) {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: fetchSubscription, enabled });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => uploadAvatar(uri),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useActivateTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => activateTrial(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subscription });
      qc.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
