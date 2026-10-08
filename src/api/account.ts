/**
 * Account / password. `hasPassword` decides the screen mode (change vs set —
 * Google/Apple-only users have no password yet and can add one). POST works with
 * the Bearer token; changing/setting doesn't invalidate the current session.
 */
import { apiFetch } from './client';
import type { AuthMethods } from './types';

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

/**
 * Connect a Google / Apple account to the signed-in user. `idToken` is the one
 * the native sign-in already returns — the same flow as logging in, pointed at
 * a different endpoint.
 *
 * Errors worth handling: `email_mismatch` (the provider account uses a
 * different address) and `already_linked` (it belongs to another DailyMood
 * account).
 */
export function linkProvider(provider: 'google' | 'apple', idToken: string): Promise<{ ok: boolean; auth: AuthMethods }> {
  return apiFetch(`/api/account/link/${provider}`, { method: 'POST', body: { idToken } });
}

/**
 * Disconnect a provider. Rejects with `last_sign_in_method` when it is the only
 * way into the account — the caller invites the user to set a password first.
 */
export function unlinkProvider(provider: 'google' | 'apple'): Promise<{ ok: boolean; auth: AuthMethods }> {
  return apiFetch(`/api/account/link/${provider}`, { method: 'DELETE' });
}
