/**
 * Change / set password (/profile/password) — Paper Desk. One screen, two modes
 * decided by GET /api/account/password → hasPassword: "change" (has a current
 * password + forgot link) vs "set" (Google/Apple-only user adding a password).
 * Client-validates (≥8 chars, match) before POST; maps error codes to copy;
 * shows a rate-limit countdown on 429. Success doesn't require re-login.
 */
import { useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { useTheme } from '../../src/theme/ThemeProvider';
import { usePasswordStatus, useChangePassword } from '../../src/hooks/queries';
import { useToast } from '../../src/components/Toast';
import { useGoBack } from '../../src/hooks/useGoBack';
import { WashiTape } from '../../src/components/paper/WashiTape';
import { ApiError, errorMessageKey } from '../../src/api/errors';

export default function PasswordScreen() {
  const { t } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const goBack = useGoBack('/(tabs)/profile');
  const statusQ = usePasswordStatus();
  const change = useChangePassword();
  const toast = useToast();

  const hasPassword = statusQ.data?.hasPassword;
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit =
    next.length >= 8 && confirm.length > 0 && !change.isPending && (hasPassword ? current.length > 0 : true);

  const submit = async () => {
    setError(null);
    if (next.length < 8) return setError(t('password.tooShort'));
    if (next !== confirm) return setError(t('password.mismatch'));
    try {
      await change.mutateAsync({ currentPassword: hasPassword ? current : undefined, newPassword: next });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'rate_limited') {
        setError(t('password.rateLimited', { n: Math.max(1, Math.ceil((e.retryAfter ?? 300) / 60)) }));
      } else {
        setError(t(errorMessageKey(e)));
      }
    }
  };

  const back = () => (
    <Pressable onPress={goBack} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
      <Text weight="bold" style={{ fontSize: 22, lineHeight: 26, color: colors.ink2 }}>‹</Text>
    </Pressable>
  );

  // success
  if (done) {
    return (
      <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
        {back()}
        <View style={{ marginTop: space.md }}>
          <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 6 }}>
            <WashiTape color={brand.mint + 'C0'} width={104} rotate={-3} />
          </View>
          <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
            <Text style={{ fontSize: 44 }}>✅</Text>
            <Text variant="h2" center>{t(hasPassword ? 'password.doneChangeTitle' : 'password.doneSetTitle')}</Text>
            <Text variant="body" color={colors.ink2} center>{t(hasPassword ? 'password.doneChangeBody' : 'password.doneSetBody')}</Text>
            <Pressable onPress={() => router.replace('/(tabs)/profile')} style={{ alignSelf: 'stretch', backgroundColor: brand.purple, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: space.sm }}>
              <Text variant="label" weight="bold" color="#fff">{t('password.backToProfile')}</Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
      {back()}

      {statusQ.isLoading || hasPassword === undefined ? (
        statusQ.isError ? (
          <Notice message={t(errorMessageKey(statusQ.error))} tone="error" />
        ) : (
          <View style={{ height: 220, borderRadius: radius.lg, backgroundColor: colors.surface2, opacity: 0.6 }} />
        )
      ) : (
        <>
          <Text variant="h1">{t(hasPassword ? 'password.changeTitle' : 'password.setTitle')}</Text>
          <Text variant="body" color={colors.ink2} style={{ maxWidth: 460 }}>{t(hasPassword ? 'password.changeIntro' : 'password.setIntro')}</Text>

          <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.xl, gap: space.lg, boxShadow: shadow.md }}>
            {hasPassword ? (
              <Field label={t('password.current')} value={current} onChangeText={setCurrent} show={show} onToggle={() => setShow((s) => !s) } autoFocus />
            ) : null}
            <Field label={t('password.new')} value={next} onChangeText={setNext} show={show} onToggle={() => setShow((s) => !s)} placeholder={t('password.newPlaceholder')} autoFocus={!hasPassword} />
            <Field label={t('password.confirm')} value={confirm} onChangeText={setConfirm} show={show} onToggle={() => setShow((s) => !s)} placeholder={t('password.confirmPlaceholder')} />

            {error ? <Text variant="label" weight="bold" color={colors.danger}>{error}</Text> : null}

            <Pressable onPress={submit} disabled={!canSubmit} style={{ height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: canSubmit ? colors.ink : colors.hairline }}>
              {change.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text variant="label" weight="bold" color={canSubmit ? '#fff' : colors.ink3}>{t(hasPassword ? 'password.submitChange' : 'password.submitSet')}</Text>}
            </Pressable>

            {hasPassword ? (
              <Pressable onPress={() => router.push('/(auth)/forgot')} hitSlop={6} style={{ alignSelf: 'center' }}>
                <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('password.forgot')}</Text>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </Screen>
  );

  function Field({ label, value, onChangeText, show, onToggle, placeholder, autoFocus }: { label: string; value: string; onChangeText: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string; autoFocus?: boolean }) {
    return (
      <View style={{ gap: 6 }}>
        <Text variant="label" weight="bold" color={colors.ink2}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.hairline2, borderRadius: 14, backgroundColor: colors.surface2, paddingLeft: 14, paddingRight: 6 }}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.ink3}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={autoFocus}
            style={{ flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 12 }}
          />
          <Pressable onPress={onToggle} hitSlop={8} style={{ padding: 8 }}>
            <Text style={{ fontSize: 16 }}>{show ? '🙈' : '👁'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
