/**
 * Profile + achievements. Tier (isPremium) drives UX gating; premium is
 * server-enforced. Avatar upload (premium) is deferred to the image milestone.
 */
import { apiFetch } from './client';
import { appendImagePart } from '../lib/image';
import { API_BASE_URL } from '../config';
import { tokenStore } from '../auth/token-store';
import type { Profile, AchievementsData, UpdateProfileInput } from './types';

export function fetchProfile(): Promise<Profile> {
  return apiFetch<Profile>('/api/profile');
}

/** DELETE /api/profile/clear — wipe all of the user's entries (irreversible). */
export function clearEntries(): Promise<unknown> {
  return apiFetch('/api/profile/clear', { method: 'DELETE' });
}

/** GET /api/feedback — cooldown status for the feedback form. */
export function fetchFeedbackStatus(): Promise<{ cooldown: boolean; remainMin: number }> {
  return apiFetch('/api/feedback');
}

/** POST /api/feedback — submit a feedback message (rate-limited → 429). */
export function submitFeedback(message: string): Promise<unknown> {
  return apiFetch('/api/feedback', { method: 'POST', body: { message } });
}

/** GET /api/profile/export — the user's entries as CSV text (raw, not JSON). */
export async function exportEntriesCsv(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/profile/export`, {
    headers: { Authorization: `Bearer ${tokenStore.getAccessToken() ?? ''}` },
  });
  if (!res.ok) throw new Error(`export_failed_${res.status}`);
  return res.text();
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
