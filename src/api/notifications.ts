/**
 * Push-notification device-token registration (backend push contract).
 *
 * These are silent infrastructure calls — callers swallow errors (no toast),
 * exactly like the RevenueCat login/logout path. The backend upserts by token,
 * so re-registering the same device (incl. after switching accounts) just moves
 * the row to the current user; safe to call on every authenticated launch.
 */
import { apiFetch } from './client';

export type PushPlatform = 'ios' | 'android';

/** POST /api/notifications/register — register/upsert this device's Expo push token. */
export function registerPushToken(token: string, platform: PushPlatform): Promise<unknown> {
  return apiFetch('/api/notifications/register', { method: 'POST', body: { token, platform } });
}

/** DELETE /api/notifications/register — stop pushes to this device (scoped to caller). */
export function unregisterPushToken(token: string): Promise<unknown> {
  return apiFetch('/api/notifications/register', { method: 'DELETE', body: { token } });
}
