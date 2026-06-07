/**
 * Auth endpoints. Mobile token endpoints live under /api/auth/mobile/* (§2.2);
 * register / verify / forgot reuse the web public endpoints (no mobile variant).
 *
 * All calls here set `auth: false, retryOn401: false` — they must not trigger
 * the Bearer interceptor or the refresh-retry loop.
 */
import { apiFetch } from './client';
import { deviceName } from '../lib/device';
import type { TokenPair } from './types';

const NO_AUTH = { auth: false, retryOn401: false } as const;

export interface EmailCheck {
  exists: boolean;
  hasPassword: boolean;
}

/** Email-first flow: decide whether to show password, register, or Google-only. */
export function checkEmail(email: string): Promise<EmailCheck> {
  return apiFetch<EmailCheck>('/api/auth/check-email', {
    ...NO_AUTH,
    method: 'POST',
    body: { email },
  });
}

export function loginWithPassword(email: string, password: string): Promise<TokenPair> {
  return apiFetch<TokenPair>('/api/auth/mobile/login', {
    ...NO_AUTH,
    method: 'POST',
    body: { email, password, device: deviceName() },
  });
}

export function loginWithGoogle(idToken: string): Promise<TokenPair> {
  return apiFetch<TokenPair>('/api/auth/mobile/google', {
    ...NO_AUTH,
    method: 'POST',
    body: { idToken, device: deviceName() },
  });
}

export function loginWithApple(idToken: string, name?: string): Promise<TokenPair> {
  return apiFetch<TokenPair>('/api/auth/mobile/apple', {
    ...NO_AUTH,
    method: 'POST',
    body: { idToken, name, device: deviceName() },
  });
}

/** Revoke a refresh token server-side (idempotent — always resolves). */
export function logout(refreshToken: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/auth/mobile/logout', {
    ...NO_AUTH,
    method: 'POST',
    body: { refreshToken },
  });
}

export function register(email: string, password: string, name?: string): Promise<unknown> {
  return apiFetch('/api/auth/register', {
    ...NO_AUTH,
    method: 'POST',
    body: { email, password, name },
  });
}

export function resendVerification(email: string): Promise<unknown> {
  return apiFetch('/api/auth/resend-verify', {
    ...NO_AUTH,
    method: 'POST',
    body: { email },
  });
}

export function forgotPassword(email: string): Promise<unknown> {
  return apiFetch('/api/auth/forgot', {
    ...NO_AUTH,
    method: 'POST',
    body: { email },
  });
}
