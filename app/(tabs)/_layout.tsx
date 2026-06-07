/**
 * Bottom-nav tab shell: Today / Calendar / Stats / You, with the Paper Desk
 * floating-pill nav + center Smart Log FAB. The SmartLogProvider hosts the
 * single Smart Log sheet for the whole tab tree. We also sync the app language
 * to the user's saved profile locale once it loads.
 */
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useProfile } from '../../src/hooks/queries';
import { setAppLanguage } from '../../src/i18n';
import { FloatingNav } from '../../src/components/paper/FloatingNav';
import { SmartLogProvider } from '../../src/components/paper/smartlog/SmartLogProvider';

function useSyncLanguage() {
  const { data } = useProfile();
  useEffect(() => {
    const locale = data?.user.locale;
    if (locale === 'th' || locale === 'en') setAppLanguage(locale);
  }, [data?.user.locale]);
}

export default function TabsLayout() {
  useSyncLanguage();

  return (
    <SmartLogProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingNav {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="stats" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </SmartLogProvider>
  );
}
