/**
 * Calendar tab — two views of one dataset (handover design): a monthly mood
 * grid + stats, and a timeline feed, switched by a segmented toggle. Month nav
 * at the top. Tapping a day opens the Day Sheet; tapping an entry opens detail.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { MoodGrid } from '../../src/components/paper/calendar/MoodGrid';
import { TimelineFeed } from '../../src/components/paper/calendar/TimelineFeed';
import { DaySheet } from '../../src/components/paper/calendar/DaySheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useCalendarMonth, useMoods } from '../../src/hooks/queries';
import { todayKey, formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';

type ViewMode = 'calendar' | 'timeline';

const [TODAY_Y, TODAY_M] = todayKey().split('-').map(Number);

export default function CalendarScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();

  const [year, setYear] = useState(TODAY_Y);
  const [month, setMonth] = useState(TODAY_M); // 1–12
  const [view, setView] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const cal = useCalendarMonth(year, month);
  const moods = useMoods();

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const monthLabel = formatDateKey(`${year}-${String(month).padStart(2, '0')}-01`, i18n.language, {
    weekday: undefined,
    day: undefined,
    month: 'long',
    year: 'numeric',
  });

  const openEntry = (id: string) => router.push(`/entry/${id}`);

  return (
    <>
      <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
        {/* month nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <NavBtn label="‹" onPress={() => shiftMonth(-1)} />
          <Text variant="h2">{monthLabel}</Text>
          <NavBtn label="›" onPress={() => shiftMonth(1)} />
        </View>

        {/* view toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surface2,
            borderRadius: radius.pill,
            padding: 4,
          }}
        >
          {(['calendar', 'timeline'] as ViewMode[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 9,
                borderRadius: radius.pill,
                backgroundColor: view === v ? colors.surface : 'transparent',
              }}
            >
              <Text variant="label" weight={view === v ? 'bold' : 'medium'} color={view === v ? colors.ink : colors.ink3}>
                {v === 'calendar' ? t('calendar.viewCalendar') : t('calendar.viewTimeline')}
              </Text>
            </Pressable>
          ))}
        </View>

        {view === 'calendar' ? (
          cal.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : cal.isError ? (
            <Notice message={t(errorMessageKey(cal.error))} tone="error" />
          ) : (
            <View style={{ gap: space.lg }}>
              <MoodGrid
                year={year}
                month={month}
                days={cal.data?.entries ?? []}
                moods={moods.data ?? []}
                locale={i18n.language}
                onDayPress={setSelectedDate}
              />
              {cal.data ? (
                <View style={{ flexDirection: 'row', gap: space.md }}>
                  <Stat label={t('calendar.avgMood')} value={cal.data.stats.avgMood.toFixed(1)} accent={colors.primary} />
                  <Stat label={t('calendar.streak')} value={`${cal.data.stats.streak}`} accent={colors.accent} />
                  <Stat label={t('calendar.logged')} value={`${cal.data.stats.loggedDays}`} accent={brand.mint} />
                </View>
              ) : null}
            </View>
          )
        ) : (
          <TimelineFeed year={year} month={month} onOpenEntry={openEntry} />
        )}
      </Screen>

      <DaySheet date={selectedDate} onClose={() => setSelectedDate(null)} onOpenEntry={openEntry} />
    </>
  );

  function NavBtn({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.hairline2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="title" color={colors.ink}>
          {label}
        </Text>
      </Pressable>
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
