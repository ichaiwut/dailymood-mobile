/**
 * Subscription (/profile/subscription) — manage your plan. GET /api/subscription
 * picks one of three states: Free (A), Trialing (B), Active Pro (C). The 14-day
 * trial activates in-app (no card). Paid subscribe goes through `useBilling`
 * (web → Stripe Checkout via /pricing; native → IAP, pending). Billing
 * management = Stripe Portal (opened in browser) when `hasStripeCustomer`.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Notice } from '../../src/components/Notice';
import { BottomSheet } from '../../src/components/BottomSheet';
import { PAClip } from '../../src/components/paper/PAClip';
import { FolderTab } from '../../src/components/paper/PaperSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSubscription, useActivateTrial } from '../../src/hooks/queries';
import { useBilling, PRO_FEATURES } from '../../src/hooks/useBilling';
import { useToast } from '../../src/components/Toast';
import { useGoBack } from '../../src/hooks/useGoBack';
import { formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';

const DANGER = '#D94444';

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const goBack = useGoBack('/(tabs)/profile');
  const sub = useSubscription();
  const activate = useActivateTrial();
  const billing = useBilling();
  const toast = useToast();

  const [trialSheet, setTrialSheet] = useState(false);
  const [cancelSheet, setCancelSheet] = useState(false);

  const d = sub.data;
  const fmt = (iso: string | null) =>
    iso ? formatDateKey(iso.slice(0, 10), i18n.language, { weekday: undefined, day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const onActivateTrial = async () => {
    try {
      await activate.mutateAsync();
      toast.show(t('subscription.trialActivated'));
      setTrialSheet(false);
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80, maxWidth: 880, alignSelf: 'center', width: '100%' }}>
      <Pressable onPress={goBack} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
        <Text weight="bold" style={{ fontSize: 22, lineHeight: 26, color: colors.ink2 }}>‹</Text>
      </Pressable>

      {sub.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : sub.isError || !d ? (
        <Notice message={t(errorMessageKey(sub.error))} tone="error" />
      ) : !d.isPremium ? (
        <FreeState />
      ) : d.isTrialing ? (
        <TrialState />
      ) : (
        <ActiveState />
      )}

      {/* trial confirm sheet */}
      <BottomSheet visible={trialSheet} onClose={() => setTrialSheet(false)}>
        <View style={{ gap: space.md }}>
          <Text variant="h2" center>{t('subscription.trialConfirmTitle')}</Text>
          <Text variant="body" color={colors.ink2} center>{t('subscription.trialConfirmBody')}</Text>
          <Button variant="purple" label={t('subscription.trialConfirmBtn')} onPress={onActivateTrial} loading={activate.isPending} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
          <Button variant="paper" label={t('common.cancel')} onPress={() => setTrialSheet(false)} style={{ alignSelf: 'stretch' }} />
        </View>
      </BottomSheet>

      {/* cancel sheet */}
      <BottomSheet visible={cancelSheet} onClose={() => setCancelSheet(false)}>
        <View style={{ gap: space.md }}>
          <Text style={{ fontSize: 36, textAlign: 'center' }}>😢</Text>
          <Text variant="h2" center>{t('subscription.cancelSheetTitle')}</Text>
          <Text variant="body" color={colors.ink2} center>{t('subscription.cancelSheetBody')}</Text>
          <Pressable onPress={() => { setCancelSheet(false); billing.openPortal(); }} style={{ borderWidth: 1.5, borderColor: '#F5DADA', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }}>
            <Text variant="label" weight="bold" color={DANGER}>{t('subscription.confirmCancel')}</Text>
          </Pressable>
          <Button variant="purple" label={t('subscription.keepPro')} onPress={() => setCancelSheet(false)} style={{ alignSelf: 'stretch' }} />
        </View>
      </BottomSheet>
    </Screen>
  );

  // ---- states ----
  function FreeState() {
    const usedTrial = !!d!.trialActivatedAt;
    return (
      <View style={{ gap: space.lg }}>
        <View style={{ gap: 2 }}>
          <Text variant="eyebrow">{t('subscription.eyebrow')}</Text>
          <Text variant="h1">{t('subscription.planTitle')}</Text>
        </View>

        {!usedTrial ? (
          <View>
            <View style={{ position: 'absolute', top: -22, right: 26, zIndex: 6 }}><PAClip /></View>
            <LinearGradient colors={['#FCA45B', '#A673F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
              <Text style={{ fontSize: 22 }}>✨</Text>
              <Text weight="extrabold" style={{ fontSize: 20, color: '#fff' }}>{t('subscription.trialCardTitle')}</Text>
              <Text variant="label" style={{ color: 'rgba(255,255,255,0.9)' }}>{t('pricing.trialBody')}</Text>
              <Pressable onPress={() => setTrialSheet(true)} style={{ backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginTop: space.xs }}>
                <Text variant="label" weight="extrabold" color={brand.purpleStrong}>{t('pricing.trialBtn')}</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ) : (
          <View style={{ backgroundColor: '#FFF6EA', borderRadius: radius.md, padding: space.lg, flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text variant="label" weight="bold">{t('subscription.trialExpiredTitle')}</Text>
              <Text variant="label" color={colors.ink3}>{t('subscription.trialExpiredBody')}</Text>
            </View>
          </View>
        )}

        {/* compare: Free + Pro */}
        <View style={{ gap: space.md }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: space.xl, gap: space.sm, boxShadow: shadow.sm }}>
            <Text variant="label" color={colors.ink3}>{t('subscription.currentPlan')}</Text>
            <Text weight="extrabold" style={{ fontSize: 24 }}>{t('subscription.free')}</Text>
            <Text variant="label" color={colors.ink2}>{t('pricing.rowSmartlog')} · {t('pricing.valPerDay')}</Text>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface2, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '40%', backgroundColor: '#FCA45B', borderRadius: 3 }} />
            </View>
          </View>

          <View>
            <View style={{ position: 'absolute', top: -22, right: 26, zIndex: 6 }}><PAClip /></View>
            <LinearGradient colors={['#F9A870', '#D4A0E8', '#C89BF5']} locations={[0, 0.5, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
              <Text weight="extrabold" style={{ fontSize: 26, color: '#fff' }}>Pro</Text>
              <Text variant="label" weight="bold" style={{ color: '#fff' }}>{t('pricing.perMonth')}</Text>
              <View style={{ gap: 6, marginTop: 4 }}>
                {t('subscription.proBullets').split('|').map((b, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>
                    <Text variant="label" weight="medium" color="#fff" style={{ flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => router.push('/pricing')} style={{ backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: space.sm }}>
                <Text variant="label" weight="extrabold" color={brand.purpleStrong}>{t('subscription.subscribe')} →</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  }

  function TrialState() {
    const urgent = d!.trialDaysLeft <= 3;
    return (
      <View style={{ gap: space.lg }}>
        <Text variant="h1">{t('subscription.trialStateTitle')}</Text>
        <View>
          <View style={{ position: 'absolute', top: -22, right: 26, zIndex: 6 }}><PAClip /></View>
          <LinearGradient colors={urgent ? ['#D94444', '#FCA45B'] : ['#FCA45B', '#A673F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
            <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text variant="label" weight="bold" color="#fff">{urgent ? '⏰' : '✨'} {t('subscription.trialing')}</Text>
            </View>
            <Text weight="extrabold" style={{ fontSize: 20, color: '#fff' }}>{t('subscription.daysLeftBig', { n: d!.trialDaysLeft })}</Text>
            <Text variant="label" style={{ color: 'rgba(255,255,255,0.9)' }}>{t('subscription.trialEnds', { date: fmt(d!.trialEndsAt) })}</Text>
            <Pressable onPress={() => router.push('/pricing')} style={{ backgroundColor: '#fff', borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginTop: space.xs }}>
              <Text variant="label" weight="extrabold" color={brand.purpleStrong}>{t('subscription.subscribe')} →</Text>
            </Pressable>
          </LinearGradient>
        </View>
        <FeaturesGrid />
      </View>
    );
  }

  function ActiveState() {
    const planLabel = d!.planInterval === 'year' ? t('subscription.proYearly') : d!.planInterval === 'month' ? t('subscription.proMonthly') : 'Pro';
    const priceLabel = d!.planInterval === 'year' ? t('pricing.perYear') : t('pricing.perMonth');
    const comped = !d!.hasStripeCustomer;
    return (
      <View style={{ gap: space.lg }}>
        <Text variant="h1">Pro</Text>
        <View>
          <FolderTab label={`✨ ${planLabel}`} bg={brand.purple} fg="#fff" />
          <View>
            <View style={{ position: 'absolute', top: -20, right: 26, zIndex: 6 }}><PAClip /></View>
            <LinearGradient colors={['#2C2435', '#3D2E50']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ ...sheetRadius, borderTopLeftRadius: 0, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
              {comped ? (
                <>
                  <Text weight="extrabold" style={{ fontSize: 18, color: '#fff' }}>{t('subscription.comped')}</Text>
                  <Text variant="label" style={{ color: 'rgba(255,255,255,0.85)' }}>{t('subscription.compedSub')}</Text>
                </>
              ) : (
                <>
                  <Text weight="extrabold" style={{ fontSize: 18, color: '#fff' }}>
                    {d!.cancelAtPeriodEnd ? t('subscription.endsOn', { date: fmt(d!.currentPeriodEnd) }) : t('subscription.autoRenew', { date: fmt(d!.currentPeriodEnd) })}
                  </Text>
                  <Text variant="label" style={{ color: 'rgba(255,255,255,0.85)' }}>{priceLabel}</Text>
                </>
              )}
              {d!.hasStripeCustomer ? (
                <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
                  <Pressable onPress={billing.openPortal} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' }}>
                    <Text variant="label" weight="bold" color="#fff">{t('subscription.manage')}</Text>
                  </Pressable>
                  {!d!.cancelAtPeriodEnd ? (
                    <Pressable onPress={() => setCancelSheet(true)} style={{ flex: 1, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' }}>
                      <Text variant="label" weight="bold" color="#fff">{t('subscription.cancel')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </LinearGradient>
          </View>
        </View>

        {d!.cancelAtPeriodEnd ? (
          <View style={{ backgroundColor: '#FFF6EA', borderRadius: radius.md, padding: space.lg, gap: space.sm }}>
            <Text variant="label" weight="bold">⏳ {t('subscription.cancelingNotice')}</Text>
            <Button variant="purple" label={t('subscription.resubscribe')} onPress={billing.openPortal} style={{ alignSelf: 'flex-start' }} />
          </View>
        ) : null}

        <FeaturesGrid />

        <Text variant="title">{t('subscription.usageTitle')}</Text>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <UsageCard label={t('subscription.usageAi')} />
          <UsageCard label={t('subscription.usageVision')} />
        </View>
      </View>
    );
  }

  function FeaturesGrid() {
    return (
      <View style={{ gap: space.sm }}>
        <Text variant="title">{t('subscription.whatYouGet')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {PRO_FEATURES.map((f) => (
            <View key={f.title} style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.surface, borderRadius: 16, padding: space.lg, gap: 6, boxShadow: shadow.sm }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>{f.icon}</Text></View>
              <Text variant="label" weight="bold">{t(f.title)}</Text>
              <Text variant="label" color={colors.ink3} style={{ lineHeight: 20 }}>{t(f.desc)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function UsageCard({ label }: { label: string }) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: space.lg, gap: 4, boxShadow: shadow.sm }}>
        <Text variant="label" color={colors.ink3}>{label}</Text>
        <Text weight="extrabold" style={{ fontSize: 22, color: brand.purpleStrong }}>{t('subscription.unlimited')}</Text>
      </View>
    );
  }
}
