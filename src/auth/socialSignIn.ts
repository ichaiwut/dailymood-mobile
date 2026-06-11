/**
 * Native social sign-in (Google + Apple) → the backend mobile token endpoints
 * (`/api/auth/mobile/google`, `/api/auth/mobile/apple`). The backend verifies the
 * provider ID token directly (no code exchange) and returns the same `TokenPair`
 * as password login.
 *
 * Each fn returns a `TokenPair` on success or `null` when the user cancels (the
 * caller stays put, no error). Any other failure throws: a backend rejection is an
 * `ApiError` (mapped to copy via `errorMessageKey`), a native failure is generic.
 *
 * Requires a dev/production build — these native modules are absent in Expo Go.
 */
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../config';
import { loginWithGoogle, loginWithApple } from '../api/auth';
import type { TokenPair } from '../api/types';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  // `webClientId` makes the returned idToken's audience the web client, which is
  // what the backend verifies (GOOGLE_WEB_CLIENT_ID). `iosClientId` drives the
  // native iOS flow.
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID });
  configured = true;
}

/** Native sign-in succeeded but returned no usable identity token. */
export class SocialSignInError extends Error {}

/** Returns a TokenPair, or null if the user cancelled. */
export async function signInWithGoogle(): Promise<TokenPair | null> {
  ensureConfigured();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null; // user cancelled
    const idToken = response.data.idToken;
    if (!idToken) throw new SocialSignInError('google: missing idToken');
    return await loginWithGoogle(idToken);
  } catch (e) {
    if (
      isErrorWithCode(e) &&
      (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)
    ) {
      return null;
    }
    throw e;
  }
}

/** iOS only. Returns a TokenPair, or null if the user cancelled. */
export async function signInWithApple(): Promise<TokenPair | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const idToken = credential.identityToken;
    if (!idToken) throw new SocialSignInError('apple: missing identityToken');
    // Apple sends the name only on the FIRST authorization; absent thereafter.
    const name =
      [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim() || undefined;
    return await loginWithApple(idToken, name);
  } catch (e) {
    if ((e as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}

/** Whether Sign in with Apple can be offered (iOS 13+ on a real Apple device). */
export function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return Promise.resolve(false);
  return AppleAuthentication.isAvailableAsync();
}
