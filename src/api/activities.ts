/** Activities (system defaults + user custom). */
import { apiFetch } from './client';
import type { Activity } from './types';

export function fetchActivities(): Promise<Activity[]> {
  return apiFetch<{ activities: Activity[] }>('/api/activities').then((r) => r.activities);
}
