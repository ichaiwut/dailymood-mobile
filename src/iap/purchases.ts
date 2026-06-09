/**
 * RevenueCat SDK wrapper — the ONLY file that imports `react-native-purchases`.
 *
 * Everything here is a thin, native-only async function so the rest of the app
 * stays free of the SDK. On web every call is a no-op (web buys via Stripe, see
 * `useBilling`). Purchases key off the current Offering's monthly/annual
 * packages — never raw product ids — so the store/RC dashboard owns pricing.
 */
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import {
  RC_API_KEY_IOS,
  RC_API_KEY_ANDROID,
  RC_ENTITLEMENT_ID,
  STORE_SUBSCRIPTIONS_URL,
} from '../config';

export type PlanInterval = 'monthly' | 'yearly';

/** IAP is native-only; web stays on Stripe. */
export function isIapSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** 'ios' | 'android' for the backend reconcile hint. Defaults to ios off-native. */
export function iapPlatform(): 'ios' | 'android' {
  return Platform.OS === 'android' ? 'android' : 'ios';
}

/** Configure once at app launch (anonymous). Identity is set later via logIn. */
export function configurePurchases(): void {
  if (!isIapSupported()) return;
  const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  if (__DEV__ && apiKey.includes('REPLACE_WITH')) {
    console.warn('[IAP] RevenueCat SDK key is a placeholder — purchases will fail until set in src/config.ts.');
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey });
}

/** Identify the current user so entitlements follow them across devices. */
export async function loginPurchases(appUserId: string): Promise<void> {
  if (!isIapSupported()) return;
  await Purchases.logIn(appUserId);
}

/** Drop back to an anonymous RC identity on sign-out. */
export async function logoutPurchases(): Promise<void> {
  if (!isIapSupported()) return;
  // RC throws if the user is already anonymous — that's a no-op for us.
  try {
    await Purchases.logOut();
  } catch {
    /* already anonymous */
  }
}

/** The current Offering (its `monthly` / `annual` packages), or null. */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isIapSupported()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

/** The package for a plan within an offering (yearly → annual). */
export function packageForPlan(
  offering: PurchasesOffering | null,
  plan: PlanInterval,
): PurchasesPackage | null {
  if (!offering) return null;
  return (plan === 'yearly' ? offering.annual : offering.monthly) ?? null;
}

/** Localized store price string for a plan (e.g. "฿99/mo"), or null. */
export function priceStringForPlan(
  offering: PurchasesOffering | null,
  plan: PlanInterval,
): string | null {
  return packageForPlan(offering, plan)?.product.priceString ?? null;
}

/** Buy a package. Throws on failure (incl. user cancellation — see isUserCancelled). */
export async function purchase(pkg: PurchasesPackage): Promise<void> {
  await Purchases.purchasePackage(pkg);
}

/** Restore prior purchases (required by the App Store). Returns CustomerInfo. */
export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** True when the Pro entitlement is active in the given CustomerInfo. */
export function hasProEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[RC_ENTITLEMENT_ID] != null;
}

/** Deep link to the store's manage-subscription screen (falls back per-store). */
export async function getManagementUrl(): Promise<string> {
  const fallback = STORE_SUBSCRIPTIONS_URL[iapPlatform()];
  if (!isIapSupported()) return fallback;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.managementURL ?? fallback;
  } catch {
    return fallback;
  }
}

/** True when an RC error represents the user dismissing the purchase sheet. */
export function isUserCancelled(e: unknown): boolean {
  return !!(e && typeof e === 'object' && 'userCancelled' in e && (e as { userCancelled?: boolean }).userCancelled);
}
