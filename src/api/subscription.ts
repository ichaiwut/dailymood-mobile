/**
 * Subscription + billing. Payment happens via Stripe Checkout/Portal on the web
 * (handover §9 — IAP is a later decision); the app opens those URLs in the
 * browser. The in-app 14-day trial is a single tap (no card).
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
