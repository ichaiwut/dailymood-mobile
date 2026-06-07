/**
 * Forgot password. Sends a reset link via email. The API is silent on unknown
 * emails (anti-enumeration), so we always show the same gentle confirmation.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthShell } from '../../src/components/auth/AuthShell';
import { TextField } from '../../src/components/TextField';
import { Button } from '../../src/components/Button';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { useTheme } from '../../src/theme/ThemeProvider';
import { forgotPassword } from '../../src/api/auth';

export default function ForgotScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
    } catch {
      // intentionally ignored — same confirmation regardless
    } finally {
      setBusy(false);
      setSent(true);
    }
  };

  return (
    <AuthShell tab={t('auth.signIn')} title={t('auth.forgotTitle')} subtitle={t('auth.forgotBody')}>
      {sent ? (
        <Notice message={t('auth.forgotSent')} tone="info" />
      ) : (
        <>
          <TextField
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Button label={t('auth.sendResetLink')} onPress={onSubmit} loading={busy} />
        </>
      )}
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
