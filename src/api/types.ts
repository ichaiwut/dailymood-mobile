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

/** An activity chip (GET /api/activities) — 10 system defaults + custom. */
export interface Activity {
  id: string;
  userId: string | null;
  emoji: string;
  label: string;
  labelTh: string;
  order: number;
  isDefault: boolean;
  createdAt: string;
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
    imageKey: string | null;
    locale: 'th' | 'en';
    isPremium: boolean;
    bio: string | null;
    accentColor: string;
    moodPack: string;
    createdAt: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    planInterval: string | null;
    // settings — notification prefs are per-topic × per-channel (email/push)
    reminderEmailEnabled: boolean;
    reminderPushEnabled: boolean;
    reminderTime: string;
    reminderDays: string;
    hidePreview: boolean;
    anonymousInsights: boolean;
    weeklyDigestEmailEnabled: boolean;
    weeklyDigestPushEnabled: boolean;
    aiCoachEmailEnabled: boolean;
    aiCoachPushEnabled: boolean;
  };
  stats: {
    streak: number;
    totalEntries: number;
    avgMood: number;
    avgMoodEmoji: string;
  };
  moodSignature: {
    distribution: {
      moodId: string;
      label: string;
      labelTh: string;
      color: string;
      emoji: string;
      percent: number;
      count: number;
    }[];
    hasSufficientData: boolean;
  };
  achievements: AchievementsData;
  packs: MoodPack[];
  tier: 'guest' | 'free' | 'premium' | string;
}

/** A mood-icon pack (GET /api/profile `packs`). Icons live at R2_PUBLIC_URL/{id}/{mood}.{iconFormat}. */
export interface MoodPack {
  id: string;
  label: string;
  premium: boolean;
  iconFormat: string;
}

export interface BadgeSummary {
  id: string;
  icon: string;
  color: string;
  target: number;
  current: number;
  progress: number;
  status: 'earned' | 'in_progress' | 'locked';
  earnedAt: string | null;
}

export interface AchievementsData {
  total: number;
  earned: number;
  inProgress: number;
  locked: number;
  badges: BadgeSummary[];
}

export interface SubscriptionData {
  isPremium: boolean;
  hasStripeCustomer: boolean;
  /** True when Pro came from a native store purchase (App Store / Play). */
  hasIapSubscription: boolean;
  /** Which store the IAP subscription is on, for manage/cancel deep links. */
  iapSource: 'apple' | 'google' | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  planInterval: string | null;
  subscriptionStatus: string | null;
  memberSince: string;
  trialActivatedAt: string | null;
  trialEndsAt: string | null;
  trialDaysLeft: number;
  isTrialing: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  accentColor?: string;
  locale?: 'th' | 'en';
  reminderEmailEnabled?: boolean;
  reminderPushEnabled?: boolean;
  weeklyDigestEmailEnabled?: boolean;
  weeklyDigestPushEnabled?: boolean;
  aiCoachEmailEnabled?: boolean;
  aiCoachPushEnabled?: boolean;
  hidePreview?: boolean;
  anonymousInsights?: boolean;
  moodPack?: string;
  reminderTime?: string;
  reminderDays?: string;
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
  locationLat?: number | null;
  locationLng?: number | null;
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

/** One day's dominant mood (GET /api/calendar entries). */
export interface CalendarDay {
  date: string;
  moodTypeId: string | null;
}

export interface CalendarStats {
  avgMood: number;
  avgMoodDelta: number | null;
  streak: number;
  loggedDays: number;
  totalDays: number;
}

export interface CalendarMonth {
  entries: CalendarDay[];
  stats: CalendarStats;
}

/** GET /api/year-in-pixels — a year of dominant moods + AI summary + stats (Pro). */
export interface YearInPixels {
  year: number;
  /** date key (YYYY-MM-DD) → moodId, one mood per logged day. */
  dayMap: Record<string, string>;
  totalDays: number;
  daysInYear: number;
  bestMonth: { month: number; avg: number } | null;
  hardMonth: { month: number; avg: number } | null;
  dominantMood: string | null;
  dominantPct: number;
  trendQ4: { pct: number } | null;
  topTrigger: { tag: string; count: number } | null;
  streak: { days: number; month: number } | null;
  aiSummary: {
    summary: string;
    summaryShort: string;
    bestQuarter: string;
    hardestPeriod: string;
    yearTheme: string;
  } | null;
}

/** GET /api/calendar/ai — monthly summary + highlights + patterns (Pro). */
export interface CalendarAiPattern {
  type: 'best' | 'recurring' | 'anomaly' | string;
  dates: string[];
  title: string;
  explanation: string;
  icon: string;
}
export interface CalendarAi {
  summary?: string;
  summaryFirstSentence?: string;
  highlights?: {
    bestDay: { date: string; emoji: string } | null;
    hardDay: { date: string; emoji: string } | null;
    topTag: string | null;
  };
  patterns?: CalendarAiPattern[];
  cached?: boolean;
  tooFewEntries?: boolean;
  fallbackMonth?: string;
}

/** POST /api/calendar/ask result. */
export interface CalendarAskResult {
  answer: string;
  matchingDates: string[];
}

/** GET /api/events — holidays + personal special days for a month. */
export interface MonthEvent {
  id?: string;
  date: string;
  type: 'holiday' | 'personal' | string;
  label: string;
  labelTh: string;
  emoji: string;
}
export interface MonthEvents {
  events: MonthEvent[];
}

/** A user's yearly special day (GET /api/events with no query — manager list). */
export interface PersonalEvent {
  id: string;
  label: string;
  labelTh: string | null;
  month: number;
  day: number;
  emoji: string;
}

/** Lighter entry shape for the timeline feed (GET /api/calendar/timeline). */
export interface TimelineEntry {
  id: string;
  moodTypeId: string;
  note: string | null;
  aiSummary: string | null;
  tags: string[];
  activityId: string | null;
  activityEmoji: string | null;
  location: string | null;
  date: string;
  createdAt: string;
  imageUrl: string | null;
}

/** Premium flashback reflection on negative-mood entries. */
export interface Flashback {
  message: string;
  pastDate: string;
  pastNote: string | null;
}

/** GET /api/log/[id] — full entry plus context (nearby days, streak, flashback). */
export interface EntryDetail extends MoodEntry {
  isPremium: boolean;
  entryNumber: string;
  nearby: { date: string; moodTypeId: string | null; note: string | null }[];
  lastYear: { date: string; moodTypeId: string | null } | null;
  streak: number;
  flashback: Flashback | null;
}

/** Body for PATCH /api/log/[id]. */
export interface UpdateEntryInput {
  moodTypeId?: string;
  note?: string;
  tags?: string[];
  date?: string;
  activityId?: string | null;
  location?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  aiSummary?: string | null;
  sentiment?: number | null;
  aiSource?: 'manual' | 'nlp' | 'vision' | string;
}

// --- Stats (GET /api/stats?period=) ---
export type StatsPeriod = 'week' | 'month' | 'year';

export interface MoodTrendPoint {
  date: string;
  moodId: string | null;
  avgScore?: number | null;
}

export interface BestDay {
  date: string;
  moodId: string | null;
  score: number;
  entries: number;
}

/** One AI chart annotation (premium) — a pin on the mood-trend line. */
export interface ChartAnnotation {
  type: 'best' | 'worst' | 'anomaly_drop' | 'anomaly_spike' | string;
  dateKey: string;
  labelEn: string;
  labelTh: string;
  tagRefs: string[];
  importance: number;
}

/** One activity's impact on mood (GET /api/stats activityInsight). */
export interface ActivityInsight {
  id: string;
  label: string;
  emoji: string;
  /** signed impact score; positive lifts mood, negative lowers it. */
  impact: number;
  freq: number;
}

export interface StatsData {
  streak: number;
  todayMood: { moodId: string; createdAt: number } | null;
  last7: { date: string; moodId: string | null }[];
  moodTrend: MoodTrendPoint[];
  /** moodId → count */
  distribution: Record<string, number>;
  total: number;
  total30d: number;
  period: StatsPeriod;
  avgScore: number;
  avgScoreDelta: number | null;
  bestDay: BestDay | null;
  /** Tag-mood correlation; shape varies and may be empty — rendered defensively. */
  activityImpact: unknown[];
  activityInsight: ActivityInsight[];
  /** AI chart annotations (premium); may be empty. */
  annotations: ChartAnnotation[];
}

// --- Insights (GET /api/insights) ---
export interface InsightPattern {
  title: string;
  description: string;
  tag: 'pattern' | 'correlation' | 'alert' | string;
  miniVizData?: number[];
}

export interface InsightSuggestion {
  title: string;
  description: string;
}

export interface InsightsData {
  headline: string;
  previewHeadline: string;
  summary: string;
  patterns: InsightPattern[];
  suggestion: InsightSuggestion | null;
  tier: 'free' | 'premium' | string;
  weekKey: string;
  streak: number;
}

export type InsightReaction = 'up' | 'down' | 'routine';

// --- Articles (GET /api/articles/bookmarks | /reactions) ---
export interface ArticleItem {
  slug: string;
  titleTh: string;
  titleEn: string;
  excerptTh: string;
  excerptEn: string;
  coverImageUrl: string | null;
  categoryLabelTh: string | null;
  categoryLabelEn: string | null;
  readingTimeMinutes: number;
  tone: string;
  /** present on /reactions — the mood the user picked after reading. */
  moodTypeId?: string | null;
}

// --- Ask AI chat (GET/POST /api/ask-ai/*) ---
export interface AskAiSource {
  kind: string; // e.g. 'entry'
  ref: string; // e.g. a date key
  snippet: string;
}
export interface AskAiMessage {
  id: string;
  role: 'user' | 'ai' | string;
  content: string;
  createdAt: string;
  sourcesJson?: AskAiSource[];
  entriesUsed?: number;
  feedback?: 'up' | 'down' | null;
}
export interface AskAiThread {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface AskAiSendResult {
  userMessage: AskAiMessage;
  aiMessage: AskAiMessage;
}

// --- Insights "all" (GET /api/insights/all) — the rich weekly dashboard ---
export interface InsightsForecast {
  factors: { label: string; direction: '+' | '-' | string }[];
  miniTrend: number[];
  reasoning: string;
  confidence: number; // 0..1
  predictedMood: string; // moodId
}
export interface InsightsEnergy {
  hourly: number[]; // 24 values 0..1
  peakHour: number;
  troughHour: number;
}
export interface InsightsTheme {
  color: string;
  count: number;
  label: string;
}
export interface InsightsDna {
  axes: { calm: number; depth: number; bright: number; energy: number; social: number };
  archetype: string;
  description: string;
  archetypeIcon: string;
}
export interface InsightsAll {
  status: { ready: boolean; entryCount: number; aiQuota: number | null; tier: 'free' | 'premium' | string };
  weekKey: string;
  stats: {
    avgMood: number;
    avgMoodDelta: number;
    goodDays: number;
    patternsCount: number;
    wellnessScore: number;
    wellnessDelta: number;
  };
  streak: number;
  headline: string;
  summary: string;
  patterns: InsightPattern[];
  suggestion: InsightSuggestion | null;
  forecast: InsightsForecast | null;
  energy: InsightsEnergy | null;
  themes: { themes: InsightsTheme[] } | null;
  dna: InsightsDna | null;
  empty?: boolean;
  tooFewEntries?: boolean;
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
  | 'weak_password'
  | 'current_password_required'
  | 'wrong_current_password'
  | 'same_password'
  | 'iap_failed'
  | 'network_error'
  | 'unknown';
