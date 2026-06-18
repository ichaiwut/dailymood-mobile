/**
 * Billing actions, centralizing the payment-platform rule:
 *   • web    → Stripe Checkout / Portal URL opened in the browser
 *   • native → in-app purchase via RevenueCat (Apple/Google REQUIRE IAP for
 *              digital goods). Purchase → backend reconcile → Pro reflects.
 *
 * Subscription management splits by source, not platform:
 *   • Stripe-created subs  → `openPortal()` (hosted URL, any platform)
 *   • store-created subs   → `openStoreSubscription()` (App Store / Play settings)
 *
 * The 14-day trial is not a purchase and works everywhere (see useActivateTrial).
 */
import { useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createCheckout, createPortal } from '../api/subscription';
import { useToast } from '../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ApiError, errorMessageKey } from '../api/errors';
import { useOfferings, usePurchase, useRestore } from '../iap/hooks';
import { getManagementUrl, isIapSupported, packageForPlan } from '../iap/purchases';

/** Map any thrown billing error to a friendly i18n key (RC errors aren't ApiErrors). */
function billingErrorKey(e: unknown): string {
  return e instanceof ApiError ? errorMessageKey(e) : 'errors.iap_failed';
}

export function useBilling() {
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { status } = useAuth();

  const native = isIapSupported();
  const offerings = useOfferings(); // native-only; no-ops on web
  const purchaseM = usePurchase();
  const restoreM = useRestore();

  const subscribe = async (plan: 'monthly' | 'yearly') => {
    if (status !== 'authenticated') {
      toast.show(t('pricing.loginFirst'));
      router.push('/(auth)/login');
      return;
    }

    if (native) {
      const pkg = packageForPlan(offerings.data ?? null, plan);
      if (!pkg) {
        toast.show(t('pricing.offeringsUnavailable'), 'error');
        return;
      }
      try {
        const res = await purchaseM.mutateAsync(pkg);
        if (res.status === 'cancelled') return; // user dismissed the sheet — silent
        if (res.status === 'pending') {
          toast.show(t('pricing.purchasePending')); // charged; webhook will activate Pro
          return;
        }
        toast.show(t('pricing.purchaseSuccess'));
        router.replace({ pathname: '/pricing', params: { success: '1' } }); // → 🎉 "Welcome to Pro"
      } catch (e) {
        toast.show(t(billingErrorKey(e)), 'error');
      }
      return;
    }

    // web → Stripe Checkout
    setBusy(true);
    try {
      const { url } = await createCheckout(plan);
      await Linking.openURL(url);
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    } finally {
      setBusy(false);
    }
  };

  /** Stripe Customer Portal (web-created subscriptions) — a hosted URL. */
  const openPortal = async () => {
    setBusy(true);
    try {
      const { url } = await createPortal();
      await Linking.openURL(url);
      toast.show(t('subscription.openingBrowser'));
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    } finally {
      setBusy(false);
    }
  };

  /** App Store / Play manage-subscription screen (store-created subscriptions). */
  const openStoreSubscription = async () => {
    setBusy(true);
    try {
      await Linking.openURL(await getManagementUrl());
    } catch {
      toast.show(t('errors.iap_failed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  /** Restore prior store purchases (required by the App Store). Native only. */
  const restore = async () => {
    try {
      const res = await restoreM.mutateAsync();
      if (res.status === 'ok') toast.show(t('pricing.restoreSuccess'));
      else if (res.status === 'pending') toast.show(t('pricing.purchasePending'));
      else toast.show(t('pricing.restoreNothing')); // notFound
    } catch (e) {
      toast.show(t(billingErrorKey(e)), 'error');
    }
  };

  const monthlyPkg = packageForPlan(offerings.data ?? null, 'monthly');
  const yearlyPkg = packageForPlan(offerings.data ?? null, 'yearly');

  return {
    subscribe,
    openPortal,
    openStoreSubscription,
    restore,
    /** Live store prices (native); null on web or while still loading. */
    prices: {
      monthly: monthlyPkg?.product.priceString ?? null,
      yearly: yearlyPkg?.product.priceString ?? null,
      // Per-month equivalent of the annual plan + the annual savings %, derived
      // live from the store so changing a price never needs a code edit.
      yearlyPerMonth: yearlyPkg ? `฿${Math.round(yearlyPkg.product.price / 12)}` : null,
      savePct:
        monthlyPkg && yearlyPkg && monthlyPkg.product.price > 0
          ? Math.round((1 - yearlyPkg.product.price / (monthlyPkg.product.price * 12)) * 100)
          : null,
    },
    supportsIap: native,
    busy: busy || purchaseM.isPending || restoreM.isPending,
  };
}

/** The six Pro feature cards, shared by /pricing and /profile/subscription. */
export const PRO_FEATURES: { icon: string; title: string; desc: string }[] = [
  { icon: '✨', title: 'pricing.featAi', desc: 'pricing.featAiDesc' },
  { icon: '🔮', title: 'pricing.featInsights', desc: 'pricing.featInsightsDesc' },
  { icon: '📅', title: 'pricing.featCalendar', desc: 'pricing.featCalendarDesc' },
  { icon: '🎨', title: 'pricing.featMoods', desc: 'pricing.featMoodsDesc' },
  { icon: '📊', title: 'pricing.featYip', desc: 'pricing.featYipDesc' },
  { icon: '📤', title: 'pricing.featExport', desc: 'pricing.featExportDesc' },
];

/** Live monthly store price (e.g. "฿49") for upsell cards outside the paywall; falls back to copy. */
export function useMonthlyPriceLabel(fallback = '฿49'): string {
  const offerings = useOfferings();
  return packageForPlan(offerings.data ?? null, 'monthly')?.product.priceString ?? fallback;
}
