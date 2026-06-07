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
