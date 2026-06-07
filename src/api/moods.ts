/**
 * Moods. ALWAYS fetched from the API — never hardcoded (handover §3.1). The live
 * set and colors differ from the design doc; the backend is source of truth.
 */
import { apiFetch } from './client';
import type { Mood } from './types';

export function fetchMoods(): Promise<Mood[]> {
  // /api/moods is tier "any" but we send the Bearer when available so custom
  // (premium) moods are included for the signed-in user.
  return apiFetch<{ moods: Mood[] }>('/api/moods').then((r) => r.moods);
}
