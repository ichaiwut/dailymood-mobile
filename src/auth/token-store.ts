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
 */
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'dm.refreshToken';

let accessTokenInMemory: string | null = null;

export const tokenStore = {
  // --- access token (memory only) ---
  getAccessToken(): string | null {
    return accessTokenInMemory;
  },
  setAccessToken(token: string | null): void {
    accessTokenInMemory = token;
  },

  // --- refresh token (secure store only) ---
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  /** Clear everything — on logout or unrecoverable auth failure. */
  async clear(): Promise<void> {
    accessTokenInMemory = null;
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
