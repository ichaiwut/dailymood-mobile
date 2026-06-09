/**
 * Configures RevenueCat once at launch and keeps its identity in sync with the
 * auth session. Two-phase by design: configure anonymously on mount (so the SDK
 * is ready before any purchase), then logIn/logOut as auth `status` settles.
 *
 * Reacting to `status` (not just signIn/signOut) is deliberate — a returning
 * user is restored on launch without ever calling signIn, so wiring identity
 * only into signIn would leave them unidentified to RevenueCat.
 *
 * Native-only: every RC call no-ops on web (web subscribes via Stripe).
 */
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { configurePurchases, loginPurchases, logoutPurchases } from './purchases';

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  // Configure anonymously, exactly once.
  useEffect(() => {
    configurePurchases();
  }, []);

  // Follow the session: identify when authenticated, reset on sign-out.
  useEffect(() => {
    if (status === 'authenticated' && user?.id) {
      loginPurchases(user.id).catch(() => {});
    } else if (status === 'unauthenticated') {
      logoutPurchases().catch(() => {});
    }
    // 'loading' → wait; the next status change handles it.
  }, [status, user?.id]);

  return <>{children}</>;
}
