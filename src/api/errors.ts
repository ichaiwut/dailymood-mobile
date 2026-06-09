/**
 * API error handling. The backend returns machine codes like `invalid_credentials`;
 * those are NEVER shown to users (handover rule §6.1). The UI resolves a code to
 * polite TH/EN copy via i18n using `errorMessageKey()`.
 */
import type { ApiErrorCode } from './types';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  /** Seconds to wait, parsed from `retry-after` on 429 responses. */
  readonly retryAfter?: number;

  constructor(code: ApiErrorCode, status: number, retryAfter?: number) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const KNOWN_CODES: ReadonlySet<string> = new Set([
  'invalid_credentials',
  'email_not_verified',
  'invalid_token',
  'token_expired',
  'rate_limited',
  'auth_required',
  'limit_reached',
  'weak_password',
  'current_password_required',
  'wrong_current_password',
  'same_password',
  'iap_failed',
]);

/** Normalize any raw `{ error }` string from the API into a known code. */
export function normalizeErrorCode(raw: unknown): ApiErrorCode {
  return typeof raw === 'string' && KNOWN_CODES.has(raw)
    ? (raw as ApiErrorCode)
    : 'unknown';
}

/** i18n key under the `errors` namespace for a given error code. */
export function errorMessageKey(err: unknown): string {
  const code = err instanceof ApiError ? err.code : 'unknown';
  return `errors.${code}`;
}
