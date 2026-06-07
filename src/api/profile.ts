/**
 * Profile + achievements. Tier (isPremium) drives UX gating; premium is
 * server-enforced. Avatar upload (premium) is deferred to the image milestone.
 */
import { apiFetch } from './client';
import type { Profile, AchievementsData, UpdateProfileInput } from './types';

export function fetchProfile(): Promise<Profile> {
  return apiFetch<Profile>('/api/profile');
}

/** PATCH /api/profile — name, bio, accentColor, locale. */
export function updateProfile(input: UpdateProfileInput): Promise<unknown> {
  return apiFetch('/api/profile', { method: 'PATCH', body: input });
}

/** GET /api/profile/achievements — badge progress (auto-earns on check). */
export function fetchAchievements(): Promise<AchievementsData> {
  return apiFetch<AchievementsData>('/api/profile/achievements');
}
