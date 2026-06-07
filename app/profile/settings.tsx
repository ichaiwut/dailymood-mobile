/**
 * Settings (/profile/settings). Language (EN/TH → PATCH locale + app switch),
 * and About links (Terms / Privacy) opened in the browser. Reminder/privacy
 * toggles are deferred (the documented PATCH covers name/bio/accent/locale).
 */
import { View, Pressable, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useProfile, useUpdateProfile } from '../../src/hooks/queries';
import { setAppLanguage } from '../../src/i18n';
import { API_BASE_URL } from '../../src/config';
import { errorMessageKey } from '../../src/api/errors';
import { useToast } from '../../src/components/Toast';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const router = useRouter();
  const profile = useProfile();
  const update = useUpdateProfile();
  const toast = useToast();

  const current = (profile.data?.user.locale ?? i18n.language) as 'th' | 'en';

  const setLocale = async (locale: 'th' | 'en') => {
    if (locale === current) return;
    setAppLanguage(locale);
    try {
      await update.mutateAsync({ locale });
      toast.show(t('profile.saved'));
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text variant="title" color={colors.ink}>‹</Text>
        </Pressable>
        <Text variant="title">{t('profile.settings')}</Text>
        <View style={{ width: 20 }} />
      </View>

      {profile.isLoading ? <ActivityIndicator color={colors.primary} /> : null}

      {/* language */}
      <Section title={t('profile.language')}>
        <Radio label={t('settings.languageEn')} selected={current === 'en'} onPress={() => setLocale('en')} />
        <Divider />
        <Radio label={t('settings.languageTh')} selected={current === 'th'} onPress={() => setLocale('th')} />
      </Section>

      {/* about */}
      <Section title={t('profile.about')}>
        <LinkRow label={t('settings.terms')} onPress={() => Linking.openURL(`${API_BASE_URL}/terms`)} />
        <Divider />
        <LinkRow label={t('settings.privacyPolicy')} onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)} />
      </Section>
    </Screen>
  );

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <View style={{ gap: space.sm }}>
        <Text variant="eyebrow">{title}</Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.hairline,
            paddingHorizontal: space.lg,
          }}
        >
          {children}
        </View>
      </View>
    );
  }

  function Radio({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.md }}>
        <Text variant="body">{label}</Text>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: selected ? colors.primary : colors.hairline2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} /> : null}
        </View>
      </Pressable>
    );
  }

  function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.md }}>
        <Text variant="body">{label}</Text>
        <Text variant="title" color={colors.ink3}>›</Text>
      </Pressable>
    );
  }

  function Divider() {
    return <View style={{ height: 1, backgroundColor: colors.hairline }} />;
  }
}
