/**
 * Push notifications — the ONLY file that imports `expo-notifications`.
 *
 * Native-only: every call no-ops on web (Expo push tokens don't exist there),
 * mirroring `src/iap/purchases.ts`. The Expo push token is POSTed to the backend
 * by `NotificationsProvider`; tap-handling / deep-linking lives there too. Push
 * tokens also require a real device — the iOS Simulator can't acquire one.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { registerPushToken, unregisterPushToken, type PushPlatform } from '../api/notifications';

const ANDROID_CHANNEL_ID = 'default';
const PRIMER_SEEN_KEY = 'dm_push_primer_seen';

/** OS permission as a simple tri-state the UI can branch on. */
export type PermissionState = 'granted' | 'denied' | 'undetermined';

/** Last Expo token registered this session — used to unregister on logout. */
let cachedToken: string | null = null;

/** Push is native-only; web has no Expo push token. */
function isPushSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function pushPlatform(): PushPlatform {
  return Platform.OS === 'android' ? 'android' : 'ios';
}

function projectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
}

/**
 * Foreground display behaviour + the Android notification channel. Safe to call
 * once on mount; no-ops on web.
 */
export function configureNotifications(): void {
  if (!isPushSupported()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    }).catch(() => {});
  }
}

/** Current OS permission state. Does NOT prompt. */
export async function getPermissionState(): Promise<PermissionState> {
  if (!isPushSupported()) return 'denied';
  const perm = await Notifications.getPermissionsAsync();
  return perm.granted ? 'granted' : perm.canAskAgain ? 'undetermined' : 'denied';
}

async function fetchExpoToken(): Promise<string | null> {
  if (!isPushSupported() || !Device.isDevice) return null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: projectId() });
    return data ?? null;
  } catch {
    // Offline / Expo request failed — try again on the next authenticated launch.
    return null;
  }
}

/**
 * Register this device with the backend IF the OS permission is already granted.
 * Never prompts (the soft pre-prompt owns asking via `requestAndRegister`). Silent.
 */
export async function ensurePushRegistered(): Promise<void> {
  if (!isPushSupported() || !Device.isDevice) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  const token = await fetchExpoToken();
  if (!token) return;
  cachedToken = token;
  try {
    await registerPushToken(token, pushPlatform());
  } catch {
    /* silent infra call */
  }
}

/**
 * Prompt for permission, then register on grant. Returns whether it was granted.
 * Drives the soft pre-prompt's "Turn on" action.
 */
export async function requestAndRegister(): Promise<boolean> {
  if (!isPushSupported() || !Device.isDevice) return false;
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  await ensurePushRegistered();
  return true;
}

/**
 * DELETE this device's token (best-effort). MUST be called while the auth access
 * token still exists — i.e. inside signOut, before tokenStore.clear().
 */
export async function unregisterFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  let token = cachedToken;
  // Restored-session-then-immediate-logout: we may not have registered this run.
  if (!token) token = await fetchExpoToken();
  if (!token) return;
  cachedToken = null;
  try {
    await unregisterPushToken(token);
  } catch {
    /* best-effort; dead tokens are pruned server-side on the next send */
  }
}

/** Fires when Expo rotates the token; caller re-registers if still authed. */
export function addTokenRefreshListener(onRefresh: () => void) {
  return Notifications.addPushTokenListener(() => onRefresh());
}

// --- soft pre-prompt "seen" flag (device-level UX, not a secret) ---

export async function wasPrimerSeen(): Promise<boolean> {
  if (!isPushSupported()) return true; // never show on web
  try {
    return (await SecureStore.getItemAsync(PRIMER_SEEN_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markPrimerSeen(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    await SecureStore.setItemAsync(PRIMER_SEEN_KEY, '1');
  } catch {
    /* non-critical */
  }
}
