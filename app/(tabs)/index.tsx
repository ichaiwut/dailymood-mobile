/**
 * Today (M1 placeholder). Proves the authenticated stack end-to-end: it reads
 * the profile (greeting + streak) and the live mood set (rendered as a row),
 * both via Bearer-authed requests with auto-refresh. The full Today dashboard
 * and Smart Log flow arrive in M2.
 */
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { PaperSheet } from '../../src/components/paper/PaperSheet';
import { Notice } from '../../src/components/Notice';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useMoods, useProfile } from '../../src/hooks/queries';
import { errorMessageKey } from '../../src/api/errors';
import type { Mood } from '../../src/api/types';

function moodLabel(m: Mood): string {
  return i18n.language === 'th' ? m.labelTh : m.label;
}

export default function TodayScreen() {
  const { t } = useTranslation();
  const { colors, space, radius } = useTheme();
  const profile = useProfile();
  const moods = useMoods();

  return (
    <Screen scroll contentStyle={{ gap: space.xl }}>
      <View style={{ gap: space.xs }}>
        <Text variant="eyebrow">{t('tabs.today')}</Text>
        <Text variant="h1">
          {profile.data?.user.name
            ? `${t('auth.welcome')}, ${profile.data.user.name}`
            : t('auth.welcome')}
        </Text>
      </View>

      {profile.isError ? <Notice message={t(errorMessageKey(profile.error))} tone="error" /> : null}

      {profile.data ? (
        <PaperSheet tab="DailyMood">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Stat value={profile.data.stats.streak} label="🔥" colors={colors} />
            <Stat value={profile.data.stats.totalEntries} label="📓" colors={colors} />
            <Stat
              value={Math.round(profile.data.stats.avgMood * 10) / 10}
              label={profile.data.stats.avgMoodEmoji}
              colors={colors}
            />
          </View>
        </PaperSheet>
      ) : null}

      <View style={{ gap: space.md }}>
        <Text variant="title">{t('tabs.today')}</Text>
        {moods.isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : moods.isError ? (
          <Notice message={t(errorMessageKey(moods.error))} tone="error" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: space.md }}>
              {moods.data?.map((m) => (
                <View
                  key={m.id}
                  style={{
                    alignItems: 'center',
                    gap: 6,
                    padding: space.md,
                    width: 84,
                    borderRadius: radius.md,
                    backgroundColor: m.color + '22',
                    borderWidth: 1,
                    borderColor: m.color,
                  }}
                >
                  <Text style={{ fontSize: 30 }}>{m.emoji}</Text>
                  <Text variant="label" center numberOfLines={1}>
                    {moodLabel(m)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

function Stat({
  value,
  label,
  colors,
}: {
  value: number;
  label: string;
  colors: { ink: string; ink3: string };
}) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text variant="h2">{label}</Text>
      <Text variant="title" color={colors.ink}>
        {value}
      </Text>
    </View>
  );
}
