/**
 * App-wide configuration.
 *
 * The backend is the single source of truth (see handover README §0). We never
 * hardcode domain data (moods, colors) — those come from the API. Only the base
 * URL and a few build-time constants live here.
 */

export const API_BASE_URL = 'https://my.dailymood.me';

/** App timezone. Server dates are ICT (UTC+7) — see handover §6.6. */
export const APP_TIMEZONE = 'Asia/Bangkok';
export const APP_UTC_OFFSET_MINUTES = 7 * 60;

/** Free-tier AI analyses per day (server-enforced; client shows UX only). */
export const FREE_AI_DAILY_QUOTA = 3;

/** Cloudflare R2 public base (mood-pack icons live here). Public by design. */
export const R2_PUBLIC_URL = 'https://pub-f0f688a68f884179942645789862cf54.r2.dev';

/** Default mood-pack id (matches the backend default). */
export const DEFAULT_MOOD_PACK = 'set_486038';

/** Mood-pack icon URL: {base}/{packId}/{moodId}.{format} (format from the pack's iconFormat). */
export function moodIconUrl(moodId: string, pack: string = DEFAULT_MOOD_PACK, format = 'svg'): string {
  return `${R2_PUBLIC_URL}/${pack}/${moodId}.${format}`;
}
