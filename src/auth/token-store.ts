/**
 * Token storage.
 *
 * Per handover §2.1: the refresh token lives ONLY in the secure store
 * (Keychain / Keystore via expo-secure-store) — never AsyncStorage. The access
 * token is kept in memory only and is intentionally not persisted.
 *
 * We also store only the LATEST refresh token. The backend rotates it on every
 * refresh and treats reuse of an old token as theft (§2.5), so keeping stale
 * copies is actively harmful.
 *
 * Platform note: expo-secure-store has no implementation on web, so for the
 * browser PREVIEW we fall back to localStorage. That is NOT secure storage —
 * only the native iOS/Android builds get Keychain/Keystore. Treat web as a
 * convenience preview, never the security-sensitive target.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'dm.refreshToken';
const isWeb = Platform.OS === 'web';

let accessTokenInMemory: string | null = null;

async function readRefresh(): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(REFRESH_TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function writeRefresh(token: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // ignore (private mode etc.)
    }
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function deleteRefresh(): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export const tokenStore = {
  // --- access token (memory only) ---
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },
  setAccessToken(token: string | null): void {
    accessTokenInMemory = token;
  },

  // --- refresh token (secure store on native, localStorage on web) ---
  getRefreshToken: readRefresh,
  setRefreshToken: writeRefresh,

  /** Clear everything — on logout or unrecoverable auth failure. */
  async clear(): Promise<void> {
    accessTokenInMemory = null;
    await deleteRefresh();
  },
};
