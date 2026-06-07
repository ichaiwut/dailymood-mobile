/**
 * You / Profile (M1 placeholder). Shows the signed-in identity + premium badge
 * and provides sign-out (revokes the refresh token, clears secure storage).
 * The full profile experience arrives in M5.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { PaperSheet } from '../../src/components/paper/PaperSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthContext';
import { useProfile } from '../../src/hooks/queries';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, space, radius, brand } = useTheme();
  const { user, signOut } = useAuth();
  const profile = useProfile();
  const [busy, setBusy] = useState(false);

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  const isPremium = profile.data?.user.isPremium;

  return (
    <Screen contentStyle={{ gap: space.xl }}>
      <Text variant="h1">{t('tabs.profile')}</Text>

      <PaperSheet tab="DailyMood">
        <View style={{ gap: space.sm }}>
          <Text variant="title">{user?.name ?? user?.email ?? '—'}</Text>
          <Text variant="body" color={colors.ink2}>
            {user?.email}
          </Text>
          {isPremium ? (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: brand.purple,
                borderRadius: radius.pill,
                paddingHorizontal: space.md,
                paddingVertical: 4,
                marginTop: space.xs,
              }}
            >
              <Text variant="eyebrow" color="#fff">
                PREMIUM
              </Text>
            </View>
          ) : null}
        </View>
      </PaperSheet>

      <Button label={t('auth.signOut')} onPress={onSignOut} loading={busy} variant="paper" />
    </Screen>
  );
}
