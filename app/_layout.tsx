/**
 * Root layout: loads fonts, mounts all providers, and gates navigation by auth
 * status. Unauthenticated users are pushed to (auth); authenticated users into
 * (tabs). While the session is restoring, the index route shows a loader.
 */
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { ToastProvider } from '../src/components/Toast';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { PurchasesProvider } from '../src/iap/PurchasesProvider';
import { OfflineNotice } from '../src/components/OfflineNotice';
import { NotificationsProvider } from '../src/notifications/NotificationsProvider';
import { fontMap } from '../src/theme/typography';
import '../src/i18n';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// Make React Query offline-aware: when connectivity drops, queries pause instead
// of erroring; the moment NetInfo reports we're back online, every screen's
// queries refetch automatically (pairs with the <OfflineNotice /> popup).
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) =>
    setOnline(state.isConnected !== false && state.isInternetReachable !== false),
  ),
);

function RootNav() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const segs = segments as string[];
    const inAuthGroup = segs[0] === '(auth)';
    const atRoot = segs.length === 0; // the '/' loader
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && (inAuthGroup || atRoot)) {
      // Only bounce authenticated users off the auth screens / root loader —
      // NOT off legitimate stack routes like /entry/[id], /insights, /profile/*.
      router.replace('/(tabs)');
    }
  }, [status, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontMap);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <PurchasesProvider>
                <ToastProvider>
                  <NotificationsProvider>
                    <StatusBar style="dark" />
                    <RootNav />
                    <OfflineNotice />
                  </NotificationsProvider>
                </ToastProvider>
              </PurchasesProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
