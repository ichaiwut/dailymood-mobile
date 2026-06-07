/**
 * Today dashboard (M2): greeting folder with mood picker → AI composer →
 * today's entries (folder cards) or empty state → streak. The mood picker,
 * composer, and FAB all open the Smart Log sheet.
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { Appear } from '../../src/components/Appear';
import { Skeleton } from '../../src/components/Skeleton';
import { GreetingFolder } from '../../src/components/paper/today/GreetingFolder';
import { StreakCard } from '../../src/components/paper/today/StreakCard';
import { EmptyToday } from '../../src/components/paper/today/EmptyToday';
import { EntryFolderCard } from '../../src/components/paper/EntryFolderCard';
import { useSmartLog } from '../../src/components/paper/smartlog/SmartLogProvider';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useProfile, useTodayEntries, useMoods } from '../../src/hooks/queries';
import { findMood } from '../../src/lib/mood';
import { errorMessageKey } from '../../src/api/errors';

export default function TodayScreen() {
  const { t } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const profile = useProfile();
  const entries = useTodayEntries();
  const moods = useMoods();
  const smartLog = useSmartLog();

  return (
    <Screen scroll contentStyle={{ gap: space.xl, paddingBottom: 120 }}>
      <Appear>
        <GreetingFolder name={profile.data?.user.name} />
      </Appear>

      {/* AI composer card */}
      <Appear delay={60}>
        <Pressable
          onPress={() => smartLog.open()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderColor: brand.purple,
            padding: space.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
          }}
        >
          <Text style={{ fontSize: 22 }}>✦</Text>
          <Text variant="body" color={colors.ink3} style={{ flex: 1 }}>
            {t('today.composerPlaceholder')}
          </Text>
        </Pressable>
      </Appear>

      {/* today's entries */}
      <Appear delay={120} style={{ gap: space.md }}>
        <Text variant="eyebrow">{t('tabs.today')}</Text>
        {entries.isLoading ? (
          <View style={{ gap: space.md }}>
            <Skeleton height={88} radius={radius.lg} />
            <Skeleton height={88} radius={radius.lg} />
          </View>
        ) : entries.isError ? (
          <Notice message={t(errorMessageKey(entries.error))} tone="error" />
        ) : entries.data && entries.data.length > 0 ? (
          <View style={{ gap: space.lg }}>
            {entries.data.map((entry, i) => (
              <EntryFolderCard
                key={entry.id}
                entry={entry}
                mood={findMood(moods.data, entry.moodTypeId)}
                rotate={i % 2 === 0 ? -0.5 : 0.5}
              />
            ))}
          </View>
        ) : (
          <EmptyToday />
        )}
      </Appear>

      {profile.data ? (
        <Appear delay={180}>
          <StreakCard streak={profile.data.stats.streak} />
        </Appear>
      ) : null}
    </Screen>
  );
}
