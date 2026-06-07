/**
 * Achievements (/profile/achievements) — sticker-album grid. Progress header +
 * filter pills (All/Earned/In progress/Locked) + badge cards: earned = vivid
 * sticker + date, in-progress = pale sticker + progress meter, locked = faded.
 * GET /api/profile/achievements.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { PASticker } from '../../src/components/paper/PASticker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAchievements } from '../../src/hooks/queries';
import { useGoBack } from '../../src/hooks/useGoBack';
import { formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';
import type { BadgeSummary } from '../../src/api/types';

type Filter = 'all' | 'earned' | 'in_progress' | 'locked';

export default function AchievementsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const ach = useAchievements();
  const goBack = useGoBack();
  const [filter, setFilter] = useState<Filter>('all');

  const data = ach.data;
  const badges = (data?.badges ?? []).filter((b) => filter === 'all' || b.status === filter);
  const pct = data && data.total ? Math.round((data.earned / data.total) * 100) : 0;

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Text variant="title" color={colors.ink}>‹</Text>
        </Pressable>
        <Text variant="title">{t('profile.achievements')}</Text>
        <View style={{ width: 20 }} />
      </View>

      {ach.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : ach.isError ? (
        <Notice message={t(errorMessageKey(ach.error))} tone="error" />
      ) : data ? (
        <>
          {/* progress */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.hairline,
              padding: space.lg,
              gap: space.sm,
            }}
          >
            <Text variant="title">{t('badges.unlocked', { n: data.earned, total: data.total })}</Text>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.surface2, overflow: 'hidden' }}>
              <View style={{ width: `${pct}%`, height: 10, backgroundColor: colors.accent }} />
            </View>
          </View>

          {/* filters */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {(['all', 'earned', 'in_progress', 'locked'] as Filter[]).map((f) => {
              const active = filter === f;
              const label =
                f === 'all' ? t('calendar.allMoods') : t(`badges.${f === 'in_progress' ? 'inProgress' : f}`);
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    backgroundColor: active ? colors.ink : colors.surface,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: active ? colors.ink : colors.hairline2,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                  }}
                >
                  <Text variant="label" weight="medium" color={active ? '#fff' : colors.ink2}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {badges.map((b) => (
              <BadgeCard key={b.id} badge={b} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );

  function BadgeCard({ badge }: { badge: BadgeSummary }) {
    const earned = badge.status === 'earned';
    const locked = badge.status === 'locked';
    return (
      <View
        style={{
          width: '47.5%',
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderStyle: locked ? 'dashed' : 'solid',
          padding: space.lg,
          alignItems: 'center',
          gap: space.sm,
          opacity: locked ? 0.6 : 1,
        }}
      >
        <PASticker color={earned ? badge.color : colors.ink3} emoji={badge.icon} size={52} halo={earned} />
        <Text variant="label" weight="bold" center numberOfLines={2}>
          {t(`badges.${badge.id}`)}
        </Text>
        {earned && badge.earnedAt ? (
          <Text variant="label" color={colors.ink3}>
            ✓ {formatDateKey(badge.earnedAt.slice(0, 10), i18n.language, { weekday: undefined, year: undefined })}
          </Text>
        ) : !locked ? (
          <View style={{ width: '100%', gap: 4 }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface2, overflow: 'hidden' }}>
              <View style={{ width: `${badge.progress}%`, height: 6, backgroundColor: badge.color }} />
            </View>
            <Text variant="label" color={colors.ink3} center>
              {badge.current}/{badge.target}
            </Text>
          </View>
        ) : (
          <Text variant="label" color={colors.ink3}>{t('badges.locked')}</Text>
        )}
      </View>
    );
  }
}
