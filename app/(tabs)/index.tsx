/**
 * Today dashboard (web-matched): trial promo bar → top bar → greeting folder
 * (paperclip + highlighted question + mood disc grid) → inline AI composer →
 * today's entries → streak. Sections stagger in.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { Appear } from '../../src/components/Appear';
import { Skeleton } from '../../src/components/Skeleton';
import { TopBar } from '../../src/components/paper/today/TopBar';
import { GreetingFolder } from '../../src/components/paper/today/GreetingFolder';
import { TodayTimeline } from '../../src/components/paper/today/TodayTimeline';
import { AiWeeklyFolder } from '../../src/components/paper/today/AiWeeklyFolder';
import { StreakCard } from '../../src/components/paper/today/StreakCard';
import { MiniCalendarFolder } from '../../src/components/paper/today/MiniCalendarFolder';
import { EmptyToday } from '../../src/components/paper/today/EmptyToday';
import { EntryFolderCard } from '../../src/components/paper/EntryFolderCard';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useProfile, useTodayEntries, useMoods } from '../../src/hooks/queries';
import { findMood } from '../../src/lib/mood';
import { errorMessageKey } from '../../src/api/errors';

export default function TodayScreen() {
  const { t } = useTranslation();
  const { colors, radius, space } = useTheme();
  const router = useRouter();
  const profile = useProfile();
  const entries = useTodayEntries();
  const moods = useMoods();
  const u = profile.data?.user;

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
      <TopBar name={u?.name} email={u?.email} accent={u?.accentColor} />

      <Appear>
        <GreetingFolder />
      </Appear>

      {/* today's entries */}
      <Appear delay={120} style={{ gap: space.lg }}>
        {entries.isLoading ? (
          <View style={{ gap: space.md }}>
            <Text variant="eyebrow">{t('tabs.today')}</Text>
            <Skeleton height={88} radius={radius.lg} />
            <Skeleton height={88} radius={radius.lg} />
          </View>
        ) : entries.isError ? (
          <Notice message={t(errorMessageKey(entries.error))} tone="error" />
        ) : (
          <>
            {/* the day-axis timeline always shows — even with no entries yet */}
            <TodayTimeline entries={entries.data ?? []} moods={moods.data ?? []} />
            {entries.data && entries.data.length > 0 ? (
              <View style={{ gap: space.lg }}>
                {entries.data.map((entry, i) => (
                  <EntryFolderCard
                    key={entry.id}
                    entry={entry}
                    mood={findMood(moods.data, entry.moodTypeId)}
                    rotate={i % 2 === 0 ? -0.5 : 0.5}
                    onPress={() => router.push(`/entry/${entry.id}`)}
                  />
                ))}
              </View>
            ) : (
              <EmptyToday />
            )}
          </>
        )}
      </Appear>

      {/* AI weekly insights — after the entries */}
      <Appear delay={160}>
        <AiWeeklyFolder />
      </Appear>

      {profile.data ? (
        <Appear delay={200}>
          <StreakCard streak={profile.data.stats.streak} />
        </Appear>
      ) : null}

      <Appear delay={240}>
        <MiniCalendarFolder />
      </Appear>
    </Screen>
  );
}
