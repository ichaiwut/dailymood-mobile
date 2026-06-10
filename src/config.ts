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

/**
 * RevenueCat (native in-app purchases — iOS App Store / Google Play). Web keeps
 * using Stripe; native must use IAP per Apple/Google policy. These are the
 * PUBLIC SDK keys (safe to commit, like a Stripe publishable key) — the RC
 * SECRET key lives only on the backend, which validates entitlements.
 *
 * TODO(iap): replace the placeholders below once the RevenueCat project exists.
 *   1. Create monthly + yearly subscription products in App Store Connect and
 *      Google Play Console (suggested ids in IAP_PRODUCT_IDS, for reference).
 *   2. In RevenueCat, attach both products to an Offering whose `monthly` and
 *      `annual` packages map to them, and to an Entitlement named RC_ENTITLEMENT_ID.
 *   3. Paste the iOS/Android public SDK keys here. No store ids are needed in the
 *      app — purchases key off the offering's packages, not raw product ids.
 */
// DEV: RevenueCat **Test Store** key (single key, not store-specific) — lets us
// test the SDK/paywall/entitlement flow without App Store/Play setup. For
// production, create real app configs in RevenueCat and swap in the per-platform
// public SDK keys (iOS `appl_…`, Android `goog_…`).
export const RC_API_KEY_IOS = 'test_DUaEZpfgooOErKgGZTfAHGzIFKm';
export const RC_API_KEY_ANDROID = 'test_DUaEZpfgooOErKgGZTfAHGzIFKm';

/**
 * RevenueCat entitlement IDENTIFIER that grants Pro. Must match the entitlement's
 * **Identifier** in the RC dashboard EXACTLY (RC REST keys entitlements by identifier)
 * AND the backend's REVENUECAT_ENTITLEMENT_ID. All three must stay in sync —
 * changing one alone silently breaks restore (client) + the Pro grant (backend).
 */
export const RC_ENTITLEMENT_ID = 'Dailymood Pro';

/** Reference product ids to create in the stores (the app buys via RC packages). */
export const IAP_PRODUCT_IDS = {
  monthly: 'me.dailymood.app.pro.monthly',
  yearly: 'me.dailymood.app.pro.yearly',
} as const;

/** Where to send users to manage/cancel a store subscription if RC has no managementURL. */
export const STORE_SUBSCRIPTIONS_URL = {
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
} as const;
