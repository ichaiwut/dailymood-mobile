/**
 * Personal special days — the recurring yearly events shown in the Profile
 * manager and on the calendar. GET /api/events (no query) returns the manager
 * list; POST creates (Free capped at 3 → 409 limit_reached); DELETE removes.
 * (GET /api/events?year=&month= is the calendar's per-month shape — see calendar.ts.)
 */
import { apiFetch } from './client';
import type { PersonalEvent } from './types';

export function fetchPersonalEvents(): Promise<{ events: PersonalEvent[] }> {
  return apiFetch('/api/events');
}

export function createEvent(input: { label: string; month: number; day: number; emoji: string }): Promise<unknown> {
  return apiFetch('/api/events', { method: 'POST', body: input });
}

export function deleteEvent(id: string): Promise<unknown> {
  return apiFetch(`/api/events/${id}`, { method: 'DELETE' });
}
