/**
 * Bottom-nav tab shell: Today / Calendar / Stats / You.
 *
 * The Paper Desk floating-pill nav + center Smart Log FAB land with M2; for now
 * this is a clean, themed tab bar. We also sync the app language to the user's
 * saved profile locale once it loads.
 */
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '../../src/components/Text';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useProfile } from '../../src/hooks/queries';
import { setAppLanguage } from '../../src/i18n';

function useSyncLanguage() {
  const { data } = useProfile();
  useEffect(() => {
    const locale = data?.user.locale;
    if (locale === 'th' || locale === 'en') setAppLanguage(locale);
  }, [data?.user.locale]);
}

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <Text variant="title" color={color}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  useSyncLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.hairline,
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.today'), tabBarIcon: ({ color }) => <TabIcon label="◔" color={color as string} /> }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t('tabs.calendar'), tabBarIcon: ({ color }) => <TabIcon label="▦" color={color as string} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: t('tabs.stats'), tabBarIcon: ({ color }) => <TabIcon label="◴" color={color as string} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: ({ color }) => <TabIcon label="◍" color={color as string} /> }}
      />
    </Tabs>
  );
}
