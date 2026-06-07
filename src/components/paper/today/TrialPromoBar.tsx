/**
 * Trial promo strip (peach→purple). Shows the active-trial countdown, or a
 * "try Pro free" CTA for users who haven't started one. Hidden for paid Pro.
 * Tapping opens the subscription screen. Dismissible for the session.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useTheme } from '../../../theme/ThemeProvider';
import { useSubscription } from '../../../hooks/queries';

export function TrialPromoBar() {
  const { t } = useTranslation();
  const { brand, radius, space } = useTheme();
  const router = useRouter();
  const sub = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  const d = sub.data;
  if (!d || dismissed) return null;
  // Paid Pro (not trialing) → nothing to promote.
  if (d.isPremium && !d.isTrialing) return null;
  // Free user who already used their trial → nothing to offer.
  if (!d.isTrialing && d.trialActivatedAt) return null;

  const label = d.isTrialing
    ? `✨ ${t('subscription.trialing')} · ${t('subscription.daysLeft', { n: d.trialDaysLeft })}`
    : `✨ ${t('subscription.startTrial')}`;

  return (
    <Pressable
      onPress={() => router.push('/profile/subscription')}
      style={{
        backgroundColor: brand.peach,
        borderRadius: radius.md,
        paddingVertical: 10,
        paddingHorizontal: space.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
      }}
    >
      <Text variant="label" weight="bold" color="#fff" style={{ flex: 1 }}>
        {label}
      </Text>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
        <Text variant="label" weight="bold" color="#fff">{t('subscription.subscribe')} →</Text>
      </View>
      <Pressable onPress={() => setDismissed(true)} hitSlop={10}>
        <Text variant="label" weight="bold" color="#fff">✕</Text>
      </Pressable>
    </Pressable>
  );
}
