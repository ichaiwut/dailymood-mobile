/**
 * Create account. Reached from login when the email isn't found. After a
 * successful register the backend sends a verification email, so we route to
 * the verify screen rather than signing in (mobile login requires a verified
 * email — handover §2.2).
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
import { register } from '../../src/api/auth';
import { errorMessageKey } from '../../src/api/errors';
import { useGoBack } from '../../src/hooks/useGoBack';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const goBack = useGoBack('/(auth)/login');
  const params = useLocalSearchParams<{ email?: string }>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || password.length < 8) {
      setError(t('errors.unknown'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(trimmed, password, name.trim() || undefined);
      router.replace({ pathname: '/(auth)/verify', params: { email: trimmed } });
    } catch (e) {
      setError(t(errorMessageKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell tab={t('auth.register')} title={t('auth.createAccount')} subtitle={t('auth.tagline')}>
      {error ? <Notice message={error} tone="error" /> : null}
      <TextField
        label={t('auth.nameLabel')}
        placeholder={t('auth.namePlaceholder')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextField
        label={t('auth.emailLabel')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextField
        label={t('auth.passwordLabel')}
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <Button label={t('auth.register')} onPress={onSubmit} loading={busy} />
      <Pressable onPress={goBack} hitSlop={8}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="label" color={colors.ink3}>
            {t('common.back')}
          </Text>
        </View>
      </Pressable>
    </AuthShell>
  );
}
