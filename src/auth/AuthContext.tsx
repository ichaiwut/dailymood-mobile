/**
 * Auth session. Holds the signed-in user and exposes sign-in / sign-out.
 *
 * Lifecycle:
 *  - On mount: try to restore a session from the stored refresh token.
 *  - On sign-in (password/Google/Apple): persist the token pair and set user.
 *  - On sign-out: revoke the refresh token server-side, then clear local state.
 *  - The API client calls our session-expired handler when a refresh fails
 *    mid-session (e.g. theft revoke, §2.5) — we drop to unauthenticated.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { restoreSession, setSessionExpiredHandler } from '../api/client';
import { logout as apiLogout } from '../api/auth';
import { unregisterFromPush } from '../notifications/push';
import { signOutSocial } from './socialSignIn';
import { tokenStore } from './token-store';
import { setAppLanguage } from '../i18n';
import type { AuthUser, TokenPair } from '../api/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: Status;
  user: AuthUser | null;
  signIn: (pair: TokenPair) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const mounted = useRef(true);

  const persist = useCallback(async (pair: TokenPair) => {
    tokenStore.setAccessToken(pair.accessToken);
    await tokenStore.setRefreshToken(pair.refreshToken);
    setUser(pair.user);
    setStatus('authenticated');
  }, []);

  const signIn = useCallback(
    async (pair: TokenPair) => {
      await persist(pair);
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    // Flip to unauthenticated FIRST so the root layout redirects to login
    // immediately — sign-out must NEVER block on a network / SDK / push call.
    // Everything below is best-effort and detached (the logout endpoint is
    // idempotent; a missed call is harmless — the token is revoked on next login
    // and expires server-side regardless).
    const refreshToken = await tokenStore.getRefreshToken();
    setUser(null);
    setStatus('unauthenticated');
    // Clear the Google session so the next sign-in shows the account picker
    // (no-op if not signed in via Google). Fire-and-forget; never throws.
    void signOutSocial();
    // Server + push cleanup, then clear local tokens. Detached: does not block
    // the UI. The push unregister + logout are Bearer-authed, so tokens are
    // cleared only after they run. RevenueCat logout / push re-register follow
    // the status change in their own providers.
    void (async () => {
      await unregisterFromPush().catch(() => {});
      if (refreshToken) await apiLogout(refreshToken).catch(() => {});
      await tokenStore.clear();
    })();
  }, []);

  // Drop to login when a mid-session refresh fails.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      if (!mounted.current) return;
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  // Restore on launch.
  useEffect(() => {
    mounted.current = true;
    (async () => {
      const pair = await restoreSession();
      if (!mounted.current) return;
      if (pair) {
        setUser(pair.user);
        setStatus('authenticated');
      } else {
        await tokenStore.clear();
        setStatus('unauthenticated');
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-export so screens can sync language after profile loads.
export { setAppLanguage };
