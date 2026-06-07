/**
 * Calendar endpoints: the monthly mood grid + stats, and the timeline feed
 * (two views of one dataset, mirroring the web Calendar tab).
 */
import { apiFetch } from './client';
import type {
  CalendarMonth,
  TimelineEntry,
  YearInPixels,
  CalendarAi,
  CalendarAskResult,
  MonthEvents,
} from './types';

/** Month is 1–12; we zero-pad for the API. */
function mm(month: number): string {
  return String(month).padStart(2, '0');
}

/** GET /api/calendar?year=Y&month=MM — dominant mood per day + stats. */
export function fetchCalendarMonth(year: number, month: number): Promise<CalendarMonth> {
  return apiFetch<CalendarMonth>(`/api/calendar?year=${year}&month=${mm(month)}`);
}

/** GET /api/calendar/timeline?year=Y&month=MM — full entries for the month. */
export function fetchTimeline(year: number, month: number): Promise<TimelineEntry[]> {
  return apiFetch<{ entries: TimelineEntry[] }>(
    `/api/calendar/timeline?year=${year}&month=${mm(month)}`,
  ).then((r) => r.entries);
}

/** GET /api/year-in-pixels?year=Y — year-of-moods + AI summary + stats (Pro). */
export function fetchYearInPixels(year: number, locale: string): Promise<YearInPixels> {
  return apiFetch<YearInPixels>(`/api/year-in-pixels?year=${year}&locale=${locale}`);
}

/** GET /api/calendar/ai?year=Y&month=MM — monthly AI summary + patterns (Pro). */
export function fetchCalendarAi(year: number, month: number, locale: string): Promise<CalendarAi> {
  return apiFetch<CalendarAi>(`/api/calendar/ai?year=${year}&month=${mm(month)}&locale=${locale}`);
}

/** POST /api/calendar/ask — natural-language question over a month (Pro, 10/hr). */
export function askCalendar(body: {
  query: string;
  year: number;
  month: number;
  locale: string;
}): Promise<CalendarAskResult> {
  return apiFetch<CalendarAskResult>('/api/calendar/ask', { method: 'POST', body });
}

/** GET /api/events?year=Y&month=MM — holidays + personal special days. */
export function fetchEvents(year: number, month: number): Promise<MonthEvents> {
  return apiFetch<MonthEvents>(`/api/events?year=${year}&month=${mm(month)}`);
}
