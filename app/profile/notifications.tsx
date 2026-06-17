/**
 * Notification settings (/profile/notifications). Per-topic email/push toggles +
 * the daily reminder schedule (see NotificationSection). Reached from a row in the
 * profile tab so that hub stays short. Back nav via useGoBack (deep-link safe).
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useGoBack } from '../../src/hooks/useGoBack';
import { NotificationSection } from '../../src/components/NotificationSection';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { colors, space } = useTheme();
  const goBack = useGoBack();

  return (
    <Screen scroll contentStyle={{ gap: space.md, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Text variant="title" color={colors.ink}>‹</Text>
        </Pressable>
        <Text variant="title">{t('settings.notifications')}</Text>
        <View style={{ width: 20 }} />
      </View>

      <Text variant="body" color={colors.ink3}>{t('settings.notificationsBody')}</Text>

      <NotificationSection />
    </Screen>
  );
}
