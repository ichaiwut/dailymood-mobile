/**
 * Shared API types. Shapes mirror the live backend responses (verified against
 * my.dailymood.me) — see handover features.md for the full schema.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

/** Successful response from every /api/auth/mobile/{login,google,apple,refresh}. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}

/** A mood type from GET /api/moods. Never hardcode these — always fetch. */
export interface Mood {
  id: string;
  userId: string | null;
  emoji: string;
  label: string;
  labelTh: string;
  color: string;
  order: number;
  isDefault: boolean;
  iconKey: string | null;
}

/** Subset of GET /api/profile we rely on early; extended in later milestones. */
export interface Profile {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    imageUrl: string | null;
    locale: 'th' | 'en';
    isPremium: boolean;
    bio: string | null;
    accentColor: string;
    moodPack: string;
    createdAt: string;
  };
  stats: {
    streak: number;
    totalEntries: number;
    avgMood: number;
    avgMoodEmoji: string;
  };
}

/**
 * Error codes the API returns in `{ error }`. We map these to human TH/EN copy
 * before they reach the UI (handover rule §6.1) — raw codes must never be shown.
 */
export type ApiErrorCode =
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'invalid_token'
  | 'token_expired'
  | 'rate_limited'
  | 'auth_required'
  | 'limit_reached'
  | 'network_error'
  | 'unknown';
