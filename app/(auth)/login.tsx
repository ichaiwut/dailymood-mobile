/**
 * Email-first sign-in (mirrors the web LoginForm).
 *
 *   email → checkEmail:
 *     exists + hasPassword → password step
 *     exists + no password → "you signed up with Google"
 *     not found           → go to register (prefill email)
 *
 * All API error codes are mapped to polite copy via i18n; raw codes never show.
 */
import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthShell } from '../../src/components/auth/AuthShell';
import { TextField } from '../../src/components/TextField';
import { Button } from '../../src/components/Button';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { SocialButtons } from '../../src/components/auth/SocialButtons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthContext';
import { checkEmail, loginWithPassword } from '../../src/api/auth';
import { errorMessageKey, ApiError } from '../../src/api/errors';

type Step = 'email' | 'password' | 'googleOnly';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors, space } = useTheme();
  const router = useRouter();
  const { signIn } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ msg: string; tone: 'info' | 'error' } | null>(null);

  const showError = (e: unknown) =>
    setNotice({ msg: t(errorMessageKey(e)), tone: 'error' });

  const onContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setNotice({ msg: t('errors.unknown'), tone: 'error' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await checkEmail(trimmed);
      setEmail(trimmed);
      if (!res.exists) {
        router.push({ pathname: '/(auth)/register', params: { email: trimmed } });
      } else if (res.hasPassword) {
        setStep('password');
      } else {
        setStep('googleOnly');
      }
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const onSignIn = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const pair = await loginWithPassword(email, password);
      await signIn(pair);
      // Root layout redirects to (tabs) on authenticated status.
    } catch (e) {
      if (e instanceof ApiError && e.code === 'email_not_verified') {
        router.push({ pathname: '/(auth)/verify', params: { email } });
        return;
      }
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const resetToEmail = () => {
    setStep('email');
    setPassword('');
    setNotice(null);
  };

  return (
    <AuthShell
      tab={step === 'email' ? t('auth.signIn') : t('auth.welcome')}
      title={step === 'googleOnly' ? t('auth.googleOnlyTitle') : t('auth.welcome')}
      subtitle={step === 'googleOnly' ? t('auth.googleOnlyBody') : t('auth.tagline')}
    >
      {notice ? <Notice message={notice.msg} tone={notice.tone} /> : null}

      {step !== 'googleOnly' ? (
        <TextField
          label={t('auth.emailLabel')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          editable={step === 'email'}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType={step === 'email' ? 'next' : 'done'}
          onSubmitEditing={step === 'email' ? onContinue : undefined}
        />
      ) : null}

      {step === 'password' ? (
        <>
          <TextField
            label={t('auth.passwordLabel')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={onSignIn}
          />
          <Button label={t('auth.signIn')} onPress={onSignIn} loading={busy} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={resetToEmail} hitSlop={8}>
              <Text variant="label" color={colors.ink3}>
                {t('common.back')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/(auth)/forgot', params: { email } })}
              hitSlop={8}
            >
              <Text variant="label" color={colors.primary}>
                {t('auth.forgotPassword')}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {step === 'email' ? (
        <>
          <Button label={t('auth.continueWithEmail')} onPress={onContinue} loading={busy} />
          <SocialButtons
            onUnavailable={() => setNotice({ msg: t('auth.socialNeedsDevBuild'), tone: 'info' })}
          />
        </>
      ) : null}

      {step === 'googleOnly' ? (
        <>
          <SocialButtons
            onUnavailable={() => setNotice({ msg: t('auth.socialNeedsDevBuild'), tone: 'info' })}
          />
          <Pressable onPress={resetToEmail} hitSlop={8} style={{ marginTop: space.xs }}>
            <Text variant="label" color={colors.ink3}>
              {t('common.back')}
            </Text>
          </Pressable>
        </>
      ) : null}
    </AuthShell>
  );
}
