/**
 * Subscription + billing. Web pays via Stripe Checkout/Portal (URLs opened in
 * the browser); native pays via RevenueCat IAP and syncs through reconcileIap.
 * The in-app 14-day trial is a single tap (no card).
 */
import { apiFetch } from './client';
import type { SubscriptionData } from './types';

export function fetchSubscription(): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>('/api/subscription');
}

/** POST /api/trial/activate — one-time 14-day free Pro trial. */
export function activateTrial(): Promise<unknown> {
  return apiFetch('/api/trial/activate', { method: 'POST' });
}

/** POST /api/stripe/checkout — returns a hosted Checkout URL to open in-browser. */
export function createCheckout(plan: 'monthly' | 'yearly'): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/api/stripe/checkout', { method: 'POST', body: { plan } });
}

/** POST /api/stripe/portal — returns the Customer Portal URL to open in-browser. */
export function createPortal(): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/api/stripe/portal', { method: 'POST' });
}

/**
 * POST /api/iap/reconcile — native in-app-purchase sync (App Store / Play).
 *
 * The app calls this right after a successful RevenueCat purchase/restore. The
 * backend does NOT trust this call to grant Pro; it looks the user up by the
 * Bearer token (whose id equals the RevenueCat appUserID set via Purchases.logIn),
 * fetches the authoritative entitlement from RevenueCat's REST API, updates the
 * user, and returns the fresh SubscriptionData. Calling it just makes Pro reflect
 * immediately instead of waiting on the RC webhook.
 *
 * --- BACKEND CONTRACT (to build server-side; not in this repo) -----------------
 * Request:  { platform: 'ios' | 'android' }   (auth: Bearer)
 * Response: SubscriptionData  (existing shape + hasIapSubscription, iapSource)
 * Errors:   `iap_failed` when RC lookup fails (mapped to friendly copy client-side)
 *
 * RevenueCat webhook → POST /api/webhooks/revenuecat (verify Authorization header,
 * idempotent on event.id, look user up by app_user_id):
 *   INITIAL_PURCHASE | RENEWAL | UNCANCELLATION | PRODUCT_CHANGE | TRANSFER
 *        → isPremium=true; set planInterval, currentPeriodEnd, iapSource, hasIapSubscription=true
 *   CANCELLATION  → cancelAtPeriodEnd=true (KEEP isPremium until period end)
 *   EXPIRATION    → isPremium=false; hasIapSubscription=false
 *   BILLING_ISSUE → grace period; keep isPremium until EXPIRATION
 *   REFUND        → isPremium=false immediately
 * ------------------------------------------------------------------------------
 */
export function reconcileIap(platform: 'ios' | 'android'): Promise<SubscriptionData> {
  return apiFetch<SubscriptionData>('/api/iap/reconcile', { method: 'POST', body: { platform } });
}
