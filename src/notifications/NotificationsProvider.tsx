/**
 * Keeps push registration in sync with the auth session (mirrors PurchasesProvider):
 *  - registers the Expo token when authenticated AND permission is already granted,
 *  - shows a one-time soft pre-prompt when permission is still undetermined,
 *  - re-registers when Expo rotates the token,
 *  - routes a notification tap to its `data.url` (deep-link), including cold start.
 *
 * Reacting to `status` (not just signIn) is deliberate — a returning user is
 * restored on launch without ever calling signIn. Unregister-on-logout lives in
 * AuthContext.signOut: the access token is cleared before status flips, so the
 * Bearer-authed DELETE must fire there, not from this effect.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../auth/AuthContext';
import {
  configureNotifications,
  ensurePushRegistered,
  getPermissionState,
  addTokenRefreshListener,
  wasPrimerSeen,
} from './push';
import { PushPrimerSheet } from '../components/PushPrimerSheet';

/** Deep-link from a notification's `data` payload. v1 only sends `/` (= home). */
function routeFromData(data: Record<string, string> | undefined): void {
  const url = data?.url;
  if (!url || url === '/') return; // '/' = home; the auth gate already lands there
  // Future `data.type`s (weekly digest, etc.) deep-link to their route here.
  router.push(url as never);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [showPrimer, setShowPrimer] = useState(false);
  const pendingUrl = useRef<string | null>(null);

  // One-time: foreground handler + Android channel + tap / token-refresh listeners.
  useEffect(() => {
    configureNotifications();

    const tapSub = Notifications.addNotificationResponseReceivedListener((resp) => {
      routeFromData(resp.notification.request.content.data as Record<string, string>);
    });
    const tokenSub = addTokenRefreshListener(() => {
      ensurePushRegistered().catch(() => {});
    });

    // Cold start: app launched by tapping a notification. Hold the URL until auth
    // resolves (the RootNav gate would otherwise replace it with /(tabs)).
    Notifications.getLastNotificationResponseAsync()
      .then((resp) => {
        const url = resp?.notification.request.content.data?.url;
        if (typeof url === 'string') pendingUrl.current = url;
      })
      .catch(() => {});

    return () => {
      tapSub.remove();
      tokenSub.remove();
    };
  }, []);

  // Follow the session.
  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) return;
    let cancelled = false;

    // Drain a cold-start deep link now that auth resolved + the navigator is ready.
    // The timeout lets RootNav's replace('/(tabs)') run first so we land on top.
    if (pendingUrl.current) {
      const url = pendingUrl.current;
      pendingUrl.current = null;
      if (url && url !== '/') setTimeout(() => router.push(url as never), 0);
    }

    (async () => {
      const state = await getPermissionState();
      if (cancelled) return;
      if (state === 'granted') {
        ensurePushRegistered().catch(() => {});
      } else if (state === 'undetermined') {
        const seen = await wasPrimerSeen();
        if (!cancelled && !seen) setShowPrimer(true);
      }
      // 'denied' → respect it; no nag (the OS won't let us re-ask anyway).
    })();

    return () => {
      cancelled = true;
    };
  }, [status, user?.id]);

  return (
    <>
      {children}
      <PushPrimerSheet visible={showPrimer} onClose={() => setShowPrimer(false)} />
    </>
  );
}
