/**
 * Calendar endpoints: the monthly mood grid + stats, and the timeline feed
 * (two views of one dataset, mirroring the web Calendar tab).
 */
import { apiFetch } from './client';
import type { CalendarMonth, TimelineEntry } from './types';

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
