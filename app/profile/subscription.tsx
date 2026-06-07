/**
 * Subscription (/profile/subscription). Three states: Free (start trial / go
 * Pro), Trial (countdown + subscribe), Paid Pro (manage billing). Payment uses
 * Stripe Checkout/Portal opened in the browser (handover §9 — IAP is a later
 * decision). The 14-day trial activates in-app (one tap, no card).
 */
import { useState } from 'react';
import { View, Pressable, Linking, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Notice } from '../../src/components/Notice';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSubscription, useActivateTrial } from '../../src/hooks/queries';
import { createCheckout, createPortal } from '../../src/api/subscription';
import { formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';
import { useToast } from '../../src/components/Toast';
import { useGoBack } from '../../src/hooks/useGoBack';

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const sub = useSubscription();
  const activate = useActivateTrial();
  const toast = useToast();
  const goBack = useGoBack();

  const onActivateTrial = async () => {
    try {
      await activate.mutateAsync();
      toast.show(t('subscription.trialActivated'));
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const d = sub.data;
  const state = !d ? 'loading' : d.isTrialing ? 'trial' : d.isPremium ? 'pro' : 'free';

  const openBilling = async (kind: 'checkout' | 'portal') => {
    setBusy(true);
    setError(null);
    try {
      const { url } = kind === 'checkout' ? await createCheckout(plan) : await createPortal();
      await Linking.openURL(url);
    } catch (e) {
      setError(t(errorMessageKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Text variant="title" color={colors.ink}>‹</Text>
        </Pressable>
        <Text variant="title">{t('subscription.title')}</Text>
        <View style={{ width: 20 }} />
      </View>

      {error ? <Notice message={error} tone="error" /> : null}

      {state === 'loading' ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : (
        <>
          {/* status hero */}
          <View
            style={{
              backgroundColor: state === 'free' ? colors.surface : brand.purple,
              borderRadius: radius.lg,
              borderWidth: state === 'free' ? 1 : 0,
              borderColor: colors.hairline,
              padding: space.xl,
              gap: space.sm,
              shadowColor: colors.paperShadow,
              shadowOffset: { width: 6, height: 8 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6,
            }}
          >
            <Text variant="eyebrow" color={state === 'free' ? colors.ink3 : 'rgba(255,255,255,0.85)'}>
              {state === 'pro' ? t('subscription.pro') : state === 'trial' ? t('subscription.trialing') : t('subscription.free')}
            </Text>
            {state === 'trial' ? (
              <Text variant="h2" color="#fff">{t('subscription.daysLeft', { n: d!.trialDaysLeft })}</Text>
            ) : state === 'pro' ? (
              <Text variant="h2" color="#fff">{t('subscription.pro')}</Text>
            ) : (
              <Text variant="h2">{t('subscription.proPerks')}</Text>
            )}
            <Text variant="label" color={state === 'free' ? colors.ink2 : 'rgba(255,255,255,0.8)'}>
              {t('subscription.memberFor')}: {d?.memberSince ? formatDateKey(d.memberSince.slice(0, 10), i18n.language, { weekday: undefined, day: undefined, month: 'long', year: 'numeric' }) : '—'}
            </Text>
          </View>

          {/* FREE → start trial */}
          {state === 'free' ? (
            <>
              {!d?.trialActivatedAt ? (
                <View style={{ gap: space.sm }}>
                  <Button label={t('subscription.startTrial')} onPress={onActivateTrial} loading={activate.isPending} />
                  <Text variant="label" center color={colors.ink3}>{t('subscription.noCard')}</Text>
                </View>
              ) : null}
              {activate.isSuccess ? <Notice message={t('subscription.trialActivated')} tone="info" /> : null}
            </>
          ) : null}

          {/* FREE or TRIAL → subscribe (plan picker + checkout) */}
          {state !== 'pro' ? (
            <>
              <View style={{ flexDirection: 'row', gap: space.md }}>
                {(['yearly', 'monthly'] as const).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPlan(p)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderRadius: radius.md,
                      borderWidth: plan === p ? 2 : 1,
                      borderColor: plan === p ? brand.purple : colors.hairline2,
                      padding: space.lg,
                      alignItems: 'center',
                    }}
                  >
                    <Text variant="label" weight="bold" color={plan === p ? colors.primary : colors.ink2}>
                      {t(`subscription.${p}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Button label={t('subscription.subscribe')} onPress={() => openBilling('checkout')} loading={busy} />
            </>
          ) : null}

          {/* PRO → manage billing */}
          {state === 'pro' ? (
            <Button label={t('subscription.manageBilling')} variant="paper" onPress={() => openBilling('portal')} loading={busy} />
          ) : null}
        </>
      )}
    </Screen>
  );
}
