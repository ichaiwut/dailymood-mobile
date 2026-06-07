/**
 * Central API client implementing the handover auth contract (§2.3–2.5):
 *
 *  - Bearer accessToken on every authed request.
 *  - On 401: call /refresh ONCE (single-flight) even if many requests fail at
 *    the same time, then retry the original request with the new accessToken.
 *  - On refresh failure: clear tokens and notify the app to bounce to /login.
 *  - The refresh token rotates on every success and reuse is treated as theft,
 *    so we never fire two refreshes with the same token — hence single-flight.
 */
import { API_BASE_URL } from '../config';
import { deviceName } from '../lib/device';
import { tokenStore } from '../auth/token-store';
import { ApiError, normalizeErrorCode } from './errors';
import type { TokenPair } from './types';

// --- session-expired notification (AuthContext subscribes) ---
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;
export function setSessionExpiredHandler(fn: SessionExpiredHandler | null): void {
  onSessionExpired = fn;
}

// --- single-flight refresh ---
let refreshPromise: Promise<TokenPair | null> | null = null;

async function performRefresh(): Promise<TokenPair | null> {
  const refreshToken = await tokenStore.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/mobile/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, device: deviceName() }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TokenPair;
    tokenStore.setAccessToken(data.accessToken);
    await tokenStore.setRefreshToken(data.refreshToken);
    return data;
  } catch {
    return null;
  }
}

/** Coalesce concurrent refreshes (both 401-retry and launch restore). */
function refreshOnce(): Promise<TokenPair | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Restore a session at app launch from the stored refresh token. Returns the
 * fresh token pair (incl. user) or null if there's nothing valid to restore.
 */
export function restoreSession(): Promise<TokenPair | null> {
  return refreshOnce();
}

async function toApiError(res: Response): Promise<ApiError> {
  let code = 'unknown';
  try {
    const body = await res.json();
    code = normalizeErrorCode(body?.error);
  } catch {
    // non-JSON body
  }
  const retryAfterHeader = res.headers.get('retry-after');
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
  return new ApiError(normalizeErrorCode(code), res.status, retryAfter);
}

async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Attach the Bearer token (default true). Set false for auth endpoints. */
  auth?: boolean;
  /** Attempt one refresh+retry on 401 (default true). */
  retryOn401?: boolean;
  /** Request body — plain object (JSON-encoded) or FormData (passthrough). */
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retryOn401 = true, headers, body, ...rest } = options;

  const send = async (): Promise<Response> => {
    const h = new Headers(headers as HeadersInit | undefined);
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body != null && !isForm && !h.has('Content-Type')) {
      h.set('Content-Type', 'application/json');
    }
    if (auth) {
      const at = tokenStore.getAccessToken();
      if (at) h.set('Authorization', `Bearer ${at}`);
    }
    const encodedBody =
      body == null ? undefined : isForm ? (body as FormData) : JSON.stringify(body);
    return fetch(`${API_BASE_URL}${path}`, { ...rest, headers: h, body: encodedBody });
  };

  let res: Response;
  try {
    res = await send();
  } catch {
    throw new ApiError('network_error', 0);
  }

  if (res.status === 401 && auth && retryOn401) {
    const refreshed = (await refreshOnce()) != null;
    if (refreshed) {
      try {
        res = await send();
      } catch {
        throw new ApiError('network_error', 0);
      }
    } else {
      await tokenStore.clear();
      onSessionExpired?.();
      throw await toApiError(res);
    }
  }

  if (!res.ok) throw await toApiError(res);
  return parseBody<T>(res);
}
