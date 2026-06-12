/**
 * Google + Apple sign-in buttons with real native flows (dev/production build
 * only — the native modules are absent in Expo Go). Google via
 * `@react-native-google-signin`, Apple via `expo-apple-authentication`.
 *
 * On success the returned `TokenPair` is handed to `AuthContext.signIn` (the root
 * layout then redirects to the tabs, same as password login). Cancellation is
 * silent; any other failure is surfaced via `onError` (already mapped to copy).
 *
 * Apple is shown on iOS only — required there by App Store §4.8 once Google is
 * offered. We render Apple's OFFICIAL `AppleAuthenticationButton` (Apple logo +
 * compliant styling); a custom button without the logo is an App Store reject.
 */
import { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '../Button';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { signInWithGoogle, signInWithApple, isAppleAuthAvailable } from '../../auth/socialSignIn';
import { errorMessageKey } from '../../api/errors';

export function SocialButtons({ onError }: { onError: (msg: string) => void }) {
  const { t } = useTranslation();
  const { colors, space, radius } = useTheme();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [appleReady, setAppleReady] = useState(false);

  useEffect(() => {
    isAppleAuthAvailable().then(setAppleReady);
  }, []);

  const run = async (provider: 'google' | 'apple') => {
    if (busy) return;
    setBusy(provider);
    try {
      const pair = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
      if (pair) await signIn(pair); // null = user cancelled → stay on the screen
    } catch (e) {
      onError(t(errorMessageKey(e)));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline2 }} />
        <Text variant="label" color={colors.ink3}>
          {t('auth.or')}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline2 }} />
      </View>

      <Button
        variant="paper"
        label={t('auth.continueWithGoogle')}
        onPress={() => run('google')}
        loading={busy === 'google'}
        leading={
          <Text variant="label" color={colors.ink}>
            G
          </Text>
        }
      />
      {Platform.OS === 'ios' && appleReady ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={radius.md}
          style={{ height: 50, width: '100%' }}
          onPress={() => run('apple')}
        />
      ) : null}
    </View>
  );
}
