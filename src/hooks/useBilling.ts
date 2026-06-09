/**
 * Billing actions, centralizing the payment-platform rule:
 *   • web    → Stripe Checkout / Portal URL opened in the browser
 *   • native → in-app purchase (Apple/Google) is REQUIRED for digital goods, and
 *              isn't integrated yet, so subscribe shows a "coming soon" toast.
 *              (The 14-day trial is not a purchase and works everywhere.)
 * Stripe billing-portal management is a web URL, so it's opened via Linking on
 * any platform for web-created subscriptions.
 */
import { useState } from 'react';
import { Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createCheckout, createPortal } from '../api/subscription';
import { useToast } from '../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { errorMessageKey } from '../api/errors';

export function useBilling() {
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { status } = useAuth();

  const subscribe = async (plan: 'monthly' | 'yearly') => {
    if (status !== 'authenticated') {
      toast.show(t('pricing.loginFirst'));
      router.push('/(auth)/login');
      return;
    }
    if (Platform.OS !== 'web') {
      // App Store / Play forbid selling digital subs via an external URL.
      toast.show(t('pricing.iapPending'));
      return;
    }
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

  const openPortal = async () => {
    setBusy(true);
    try {
      const { url } = await createPortal();
      await Linking.openURL(url);
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    } finally {
      setBusy(false);
    }
  };

  return { subscribe, openPortal, busy };
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
