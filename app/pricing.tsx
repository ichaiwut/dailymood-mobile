/**
 * Pricing (/pricing) — the Pro sales page (guest-viewable). Hero, optional trial
 * CTA, monthly/yearly plan picker, the main subscribe CTA, a features grid, and
 * a Free-vs-Pro comparison folder. Payment: web → Stripe Checkout; native → IAP
 * (pending, shows a toast) — see `useBilling`. The 14-day trial works everywhere.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { BottomSheet } from '../src/components/BottomSheet';
import { PAClip } from '../src/components/paper/PAClip';
import { WashiTape } from '../src/components/paper/WashiTape';
import { FolderTab } from '../src/components/paper/PaperSheet';
import { useTheme } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthContext';
import { useSubscription, useActivateTrial } from '../src/hooks/queries';
import { useBilling, PRO_FEATURES } from '../src/hooks/useBilling';
import { useToast } from '../src/components/Toast';
import { useGoBack } from '../src/hooks/useGoBack';
import { API_BASE_URL } from '../src/config';
import { errorMessageKey } from '../src/api/errors';
import { Linking } from 'react-native';

const PRO_GRAD: [string, string] = ['#FCA45B', '#A673F1'];

export default function PricingScreen() {
  const { t } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const goBack = useGoBack('/(tabs)');
  const params = useLocalSearchParams<{ success?: string; cancelled?: string }>();
  const { status } = useAuth();
  const authed = status === 'authenticated';

  const sub = useSubscription(authed);
  const billing = useBilling();
  const activate = useActivateTrial();
  const toast = useToast();

  const isPremium = sub.data?.isPremium ?? false;
  const tier = isPremium ? 'premium' : authed ? 'free' : 'guest';
  const hasUsedTrial = isPremium || !!sub.data?.trialActivatedAt;
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [trialSheet, setTrialSheet] = useState(false);

  const onActivateTrial = async () => {
    try {
      await activate.mutateAsync();
      toast.show(t('subscription.trialActivated'));
      setTrialSheet(false);
      router.replace('/profile/subscription');
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  // success state
  if (params.success) {
    return (
      <Screen scroll contentStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: space.md, padding: space.x2 }}>
        <Text style={{ fontSize: 56 }}>🎉</Text>
        <Text variant="h1" center>{t('pricing.successTitle')}</Text>
        <Text variant="body" color={colors.ink2} center>{t('pricing.successSub')}</Text>
        <Button variant="ink" label={t('pricing.startUsing')} onPress={() => router.replace('/(tabs)')} style={{ alignSelf: 'stretch', marginTop: space.md }} />
      </Screen>
    );
  }

  const rows: { l: string; f: string; p: string }[] = [
    { l: 'rowSmartlog', f: t('pricing.valPerDay'), p: t('pricing.valUnlimited') },
    { l: 'rowVision', f: '—', p: '✓' },
    { l: 'rowInsights', f: t('pricing.valPreview'), p: t('pricing.valFull') },
    { l: 'rowAsk', f: '—', p: t('pricing.valAskPro') },
    { l: 'rowCalAi', f: '—', p: '✓' },
    { l: 'rowYip', f: '—', p: '✓' },
    { l: 'rowYearStats', f: '—', p: '✓' },
    { l: 'rowCustom', f: '—', p: '✓' },
    { l: 'rowExport', f: '—', p: '✓' },
  ];

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
      <Pressable onPress={goBack} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
        <Text weight="bold" style={{ fontSize: 22, lineHeight: 26, color: colors.ink2 }}>‹</Text>
      </Pressable>

      {params.cancelled ? (
        <View style={{ backgroundColor: '#FFF6EA', borderRadius: radius.md, padding: space.lg, flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Text style={{ fontSize: 22 }}>😕</Text>
          <View style={{ flex: 1 }}>
            <Text variant="label" weight="bold">{t('pricing.cancelledTitle')}</Text>
            <Text variant="label" color={colors.ink3}>{t('pricing.cancelledBody')}</Text>
          </View>
        </View>
      ) : null}

      {/* hero */}
      <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
        <LinearGradient colors={PRO_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
          <Text variant="label" weight="bold" color="#fff">{t('pricing.proPill')}</Text>
        </LinearGradient>
        <Text variant="h1" center>{t('pricing.heroLine1')}</Text>
        <Text weight="extrabold" center style={{ fontSize: 26, color: brand.purpleStrong }}>{t('pricing.heroLine2')}</Text>
        <Text variant="body" color={colors.ink2} center>{t('pricing.heroSub')}</Text>
      </View>

      {/* trial CTA */}
      {!hasUsedTrial && tier === 'free' ? (
        <View>
          <View style={{ position: 'absolute', top: -12, left: 26, zIndex: 6 }}><WashiTape color={brand.lavender + 'C0'} width={96} rotate={-3} /></View>
          <View style={{ backgroundColor: '#F3ECF9', ...sheetRadius, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
            <Text variant="title">{t('pricing.trialTitle')}</Text>
            <Text variant="label" color={colors.ink2}>{t('pricing.trialBody')}</Text>
            <Pressable onPress={() => setTrialSheet(true)} style={{ borderRadius: radius.md, overflow: 'hidden', marginTop: space.xs }}>
              <LinearGradient colors={PRO_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text variant="label" weight="bold" color="#fff">{t('pricing.trialBtn')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* plan picker */}
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <PlanCard kind="monthly" price={t('pricing.perMonth')} label={t('pricing.planMonthly')} selected={plan === 'monthly'} onPress={() => setPlan('monthly')} />
        <PlanCard kind="yearly" price={t('pricing.perYear')} label={t('pricing.planYearly')} selected={plan === 'yearly'} onPress={() => setPlan('yearly')} sub={t('pricing.perMonthYearly')} badge={t('pricing.save33')} />
      </View>

      {/* main CTA */}
      <Pressable onPress={() => billing.subscribe(plan)} disabled={billing.busy} style={{ borderRadius: radius.md, overflow: 'hidden', boxShadow: `0 8px 0 -2px ${brand.purpleStrong}` }}>
        <LinearGradient colors={PRO_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 16, alignItems: 'center' }}>
          <Text weight="extrabold" style={{ fontSize: 17, color: '#fff' }}>{t('pricing.subscribeCta')}</Text>
        </LinearGradient>
      </Pressable>
      <Text variant="label" color={colors.ink3} center>{t('pricing.secure')}</Text>

      {/* features grid */}
      <Text variant="title" style={{ marginTop: space.sm }}>{t('pricing.featuresTitle')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {PRO_FEATURES.map((f) => (
          <View key={f.title} style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.surface, borderRadius: 16, padding: space.lg, gap: 6, boxShadow: shadow.sm }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>{f.icon}</Text></View>
            <Text variant="label" weight="bold">{t(f.title)}</Text>
            <Text variant="label" color={colors.ink3} style={{ lineHeight: 20 }}>{t(f.desc)}</Text>
          </View>
        ))}
      </View>

      {/* comparison folder */}
      <View style={{ marginTop: space.md }}>
        <FolderTab label={t('pricing.compareTitle')} bg={colors.ink} fg="#fff" />
        <View>
          <View style={{ position: 'absolute', top: -20, right: 26, zIndex: 6 }}><PAClip /></View>
          <View style={{ backgroundColor: colors.surface, ...sheetRadius, borderTopLeftRadius: 0, padding: space.xl, boxShadow: shadow.md }}>
            <View style={{ flexDirection: 'row', paddingBottom: space.sm }}>
              <Text variant="label" weight="bold" color={colors.ink3} style={{ flex: 1.4 }}> </Text>
              <Text variant="label" weight="bold" color={colors.ink3} style={{ flex: 1, textAlign: 'center' }}>{t('pricing.colFree')}</Text>
              <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ flex: 1, textAlign: 'center' }}>{t('pricing.colPro')}</Text>
            </View>
            {rows.map((r) => (
              <View key={r.l} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.hairline }}>
                <Text variant="label" weight="medium" style={{ flex: 1.4 }}>{t(`pricing.${r.l}`)}</Text>
                <Text variant="label" color={colors.ink3} style={{ flex: 1, textAlign: 'center' }}>{r.f}</Text>
                <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ flex: 1, textAlign: 'center' }}>{r.p}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* footer links */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.lg, marginTop: space.sm }}>
        <Pressable onPress={() => Linking.openURL(`${API_BASE_URL}/terms`)}><Text variant="label" color={colors.ink3}>{t('profile.terms')}</Text></Pressable>
        <Pressable onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)}><Text variant="label" color={colors.ink3}>{t('profile.privacyPolicy')}</Text></Pressable>
      </View>

      {/* trial confirm sheet */}
      <BottomSheet visible={trialSheet} onClose={() => setTrialSheet(false)}>
        <View style={{ gap: space.md }}>
          <Text variant="h2" center>{t('subscription.trialConfirmTitle')}</Text>
          <Text variant="body" color={colors.ink2} center>{t('subscription.trialConfirmBody')}</Text>
          <Button variant="purple" label={t('subscription.trialConfirmBtn')} onPress={onActivateTrial} loading={activate.isPending} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
          <Button variant="paper" label={t('common.cancel')} onPress={() => setTrialSheet(false)} style={{ alignSelf: 'stretch' }} />
        </View>
      </BottomSheet>
    </Screen>
  );

  function PlanCard({ kind, price, label, sub, badge, selected, onPress }: { kind: string; price: string; label: string; sub?: string; badge?: string; selected: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1, backgroundColor: selected ? '#F3ECF9' : colors.surface, borderRadius: 16, borderWidth: 2.5, borderColor: selected ? brand.purple : colors.hairline, padding: space.lg, gap: 6, boxShadow: shadow.sm }}>
        {badge ? (
          <View style={{ position: 'absolute', top: -10, right: 10, backgroundColor: '#FCA45B', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text variant="label" weight="bold" color="#fff" style={{ fontSize: 14 }}>{badge}</Text>
          </View>
        ) : null}
        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: selected ? 6 : 2, borderColor: selected ? brand.purple : colors.hairline2 }} />
        <Text variant="label" weight="medium" color={colors.ink2}>{label}</Text>
        <Text weight="extrabold" style={{ fontSize: 20 }}>{price}</Text>
        {sub ? <Text variant="label" weight="bold" color={brand.purpleStrong}>{sub}</Text> : null}
      </Pressable>
    );
  }
}
