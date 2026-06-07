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

/** A saved mood entry (GET /api/log). Shapes verified against the live API. */
export interface MoodEntry {
  id: string;
  userId: string;
  moodTypeId: string;
  note: string | null;
  imageKey: string | null;
  tags: string[];
  sentiment: number | null;
  aiSummary: string | null;
  aiSource: 'manual' | 'nlp' | 'vision' | string;
  activityId: string | null;
  activityEmoji: string | null;
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  /** YYYY-MM-DD (ICT). */
  date: string;
  createdAt: string;
  /** Signed R2 URL, ~1h TTL — do not cache across the hour (§3.1). */
  imageUrl: string | null;
}

/** Gemini suggestion from POST /api/log/smart — NOT yet persisted. */
export interface SmartSuggestion {
  suggestedMoodId: string;
  sentiment: number | null;
  tags: string[];
  imageKey: string | null;
  aiSource: 'nlp' | 'vision' | string;
  aiSummary: string | null;
  suggestedActivityId: string | null;
}

/** Body for POST /api/log/confirm. `date` defaults to today (ICT) server-side. */
export interface ConfirmEntryInput {
  moodTypeId: string;
  note?: string;
  tags?: string[];
  aiSummary?: string | null;
  sentiment?: number | null;
  aiSource: 'manual' | 'nlp' | 'vision';
  activityId?: string | null;
  imageKey?: string | null;
  date?: string;
  location?: string | null;
}

/**
 * AI quota (GET /api/ai/remaining). Premium returns just `{ tier: 'premium' }`
 * (unlimited); free returns a remaining count. We treat any non-premium tier as
 * quota-limited and read `remaining`/`limit` defensively.
 */
export interface AiRemaining {
  tier: 'free' | 'premium' | string;
  remaining?: number;
  limit?: number;
  used?: number;
}

export interface JournalPrompt {
  prompt: string;
  source: 'generated' | 'static' | string;
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
