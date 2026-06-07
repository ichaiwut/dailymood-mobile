/**
 * Profile. Used to read the user's tier (isPremium) and locale, which drive UX
 * gating and i18n. Premium is server-enforced — the client only adapts UX.
 */
import { apiFetch } from './client';
import type { Profile } from './types';

export function fetchProfile(): Promise<Profile> {
  return apiFetch<Profile>('/api/profile');
}
