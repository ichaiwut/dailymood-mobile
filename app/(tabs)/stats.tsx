/**
 * Stats tab — Week/Month/Year toggle (Year is Pro-gated), mood trend chart with
 * delta badge, mood mix, headline stats, highest-mood day, and a link to the
 * weekly AI Insights. GET /api/stats?period=.
 */
import { useState, type ReactNode } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { MoodLineChart } from '../../src/components/paper/stats/MoodLineChart';
import { MoodMixBar } from '../../src/components/paper/stats/MoodMixBar';
import { PASticker } from '../../src/components/paper/PASticker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStats, useMoods, useProfile } from '../../src/hooks/queries';
import { findMood, moodLabel } from '../../src/lib/mood';
import { formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';
import type { StatsPeriod } from '../../src/api/types';

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();

  const [period, setPeriod] = useState<StatsPeriod>('week');
  const profile = useProfile();
  const premium = profile.data?.user.isPremium ?? false;
  const stats = useStats(period);
  const moods = useMoods();

  const delta = stats.data?.avgScoreDelta;

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
      <Text variant="h1">{t('tabs.stats')}</Text>

      {/* period toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4 }}>
        {(['week', 'month', 'year'] as StatsPeriod[]).map((p) => {
          const locked = p === 'year' && !premium;
          const active = period === p;
          return (
            <Pressable
              key={p}
              onPress={() => (locked ? null : setPeriod(p))}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 9,
                borderRadius: radius.pill,
                backgroundColor: active ? colors.surface : 'transparent',
                opacity: locked ? 0.5 : 1,
              }}
            >
              <Text variant="label" weight={active ? 'bold' : 'medium'} color={active ? colors.ink : colors.ink3}>
                {t(`stats.${p}`)}{locked ? ' ✦' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {stats.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : stats.isError ? (
        <Notice message={t(errorMessageKey(stats.error))} tone="error" />
      ) : stats.data ? (
        <>
          {/* trend chart */}
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="label" color={colors.ink3}>{t('stats.moodTrend')}</Text>
              {typeof delta === 'number' && delta !== 0 ? (
                <View
                  style={{
                    backgroundColor: (delta > 0 ? brand.mint : brand.peach) + '33',
                    borderRadius: radius.pill,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text variant="label" weight="bold" color={delta > 0 ? colors.success : colors.danger}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
                  </Text>
                </View>
              ) : null}
            </View>
            {stats.data.total > 0 ? (
              <MoodLineChart points={stats.data.moodTrend} />
            ) : (
              <Text variant="body" color={colors.ink3} center style={{ paddingVertical: space.xl }}>
                {t('stats.tooFew')}
              </Text>
            )}
          </Card>

          {/* headline stats */}
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Stat label={t('stats.avgMood')} value={stats.data.avgScore.toFixed(1)} accent={colors.primary} />
            <Stat label={t('stats.streak')} value={`${stats.data.streak}`} accent={brand.peach} />
            <Stat label={t('stats.entries')} value={`${stats.data.total}`} accent={brand.mint} />
          </View>

          {/* mood mix */}
          {Object.keys(stats.data.distribution).length > 0 ? (
            <Card>
              <Text variant="label" color={colors.ink3}>{t('stats.moodMix')}</Text>
              <MoodMixBar distribution={stats.data.distribution} moods={moods.data ?? []} />
            </Card>
          ) : null}

          {/* highest mood day */}
          {stats.data.bestDay?.moodId ? (
            <Card accent={findMood(moods.data, stats.data.bestDay.moodId)?.color}>
              <Text variant="label" color={colors.ink3}>{t('stats.highestDay')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <PASticker
                  color={findMood(moods.data, stats.data.bestDay.moodId)?.color ?? colors.primary}
                  moodId={stats.data.bestDay.moodId}
                  size={44}
                />
                <View>
                  <Text variant="title">{moodLabel(findMood(moods.data, stats.data.bestDay.moodId), i18n.language)}</Text>
                  <Text variant="label" color={colors.ink2}>{formatDateKey(stats.data.bestDay.date, i18n.language)}</Text>
                </View>
              </View>
            </Card>
          ) : null}

          {/* insights link */}
          <Pressable onPress={() => router.push('/insights')}>
            <Card accent={brand.purple}>
              <Text variant="label" color={colors.primary}>{t('stats.insightsTitle')}</Text>
              <Text variant="title" color={colors.primary}>{t('stats.insightsCta')}</Text>
            </Card>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );

  function Card({ children, accent }: { children: ReactNode; accent?: string }) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderLeftWidth: accent ? 4 : 1,
          borderLeftColor: accent ?? colors.hairline,
          padding: space.lg,
          gap: space.md,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        {children}
      </View>
    );
  }

  function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderLeftWidth: 4,
          borderLeftColor: accent,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: space.md,
          gap: 2,
        }}
      >
        <Text variant="eyebrow">{label}</Text>
        <Text variant="h2">{value}</Text>
      </View>
    );
  }
}
