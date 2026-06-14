/**
 * Account / password. `hasPassword` decides the screen mode (change vs set —
 * Google/Apple-only users have no password yet and can add one). POST works with
 * the Bearer token; changing/setting doesn't invalidate the current session.
 */
import { apiFetch } from './client';

export function fetchPasswordStatus(): Promise<{ hasPassword: boolean }> {
  return apiFetch('/api/account/password');
}

/** POST — set or change. `currentPassword` required only when one already exists. */
export function changePassword(body: { currentPassword?: string; newPassword: string }): Promise<{ ok: boolean; hadPassword: boolean }> {
  return apiFetch('/api/account/password', { method: 'POST', body });
}

/**
 * DELETE /api/account — permanently delete the signed-in user + all their data
 * (Bearer auth). Required by the Play Store / App Store account-deletion policy.
 * The caller signs out afterwards (the session token is dead once this returns).
 */
export function deleteAccount(): Promise<{ ok: boolean }> {
  return apiFetch('/api/account', { method: 'DELETE' });
}
