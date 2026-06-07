/**
 * "Check your email" screen. Shown after register and when a sign-in attempt
 * returns email_not_verified. Verification itself happens via the link in the
 * email (opened in the browser); here the user can resend or go back to sign in.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthShell } from '../../src/components/auth/AuthShell';
import { Button } from '../../src/components/Button';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { useTheme } from '../../src/theme/ThemeProvider';
import { resendVerification } from '../../src/api/auth';

export default function VerifyScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onResend = async () => {
    if (!email) return;
    setBusy(true);
    try {
      await resendVerification(email);
      setSent(true);
    } catch {
      // resend is silent on unknown email by design; show the same gentle note
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      tab={t('auth.signIn')}
      title={t('auth.verifyTitle')}
      subtitle={t('auth.verifyBody', { email: email ?? '' })}
    >
      {sent ? <Notice message={t('auth.resent')} tone="info" /> : null}
      <Button label={t('auth.resend')} onPress={onResend} loading={busy} variant="paper" />
      <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="label" color={colors.primary}>
            {t('auth.signIn')}
          </Text>
        </View>
      </Pressable>
    </AuthShell>
  );
}
