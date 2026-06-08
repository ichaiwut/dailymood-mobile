/**
 * Profile + achievements. Tier (isPremium) drives UX gating; premium is
 * server-enforced. Avatar upload (premium) is deferred to the image milestone.
 */
import { apiFetch } from './client';
import { appendImagePart } from '../lib/image';
import type { Profile, AchievementsData, UpdateProfileInput } from './types';

export function fetchProfile(): Promise<Profile> {
  return apiFetch<Profile>('/api/profile');
}

/** PATCH /api/profile — name, bio, accentColor, locale, weeklyDigestEnabled, aiCoachEnabled. */
export function updateProfile(input: UpdateProfileInput): Promise<unknown> {
  return apiFetch('/api/profile', { method: 'PATCH', body: input });
}

/** GET /api/profile/achievements — badge progress (auto-earns on check). */
export function fetchAchievements(): Promise<AchievementsData> {
  return apiFetch<AchievementsData>('/api/profile/achievements');
}

/** POST /api/profile/avatar (premium) — multipart `image` → { imageKey }. */
export async function uploadAvatar(uri: string): Promise<{ imageKey: string }> {
  const form = new FormData();
  await appendImagePart(form, 'image', uri);
  return apiFetch<{ imageKey: string }>('/api/profile/avatar', { method: 'POST', body: form });
}

/** DELETE /api/profile/avatar — remove custom avatar. */
export function deleteAvatar(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/profile/avatar', { method: 'DELETE' });
}
