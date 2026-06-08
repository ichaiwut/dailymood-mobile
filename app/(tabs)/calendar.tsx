/**
 * Calendar tab — two views of one dataset (handover design): a monthly mood
 * grid + stats, and a timeline feed, switched by a segmented toggle. Month nav
 * at the top. Tapping a day opens the Day Sheet; tapping an entry opens detail.
 */
import { useState, useMemo } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { MoodGrid } from '../../src/components/paper/calendar/MoodGrid';
import { TimelineFeed } from '../../src/components/paper/calendar/TimelineFeed';
import { DaySheet } from '../../src/components/paper/calendar/DaySheet';
import { CalendarAiPanel, CalendarAiUpsell } from '../../src/components/paper/calendar/CalendarAi';
import { PaperSheet, FolderTab } from '../../src/components/paper/PaperSheet';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useCalendarMonth, useMoods, useAiRemaining, useEvents, useCalendarAi } from '../../src/hooks/queries';
import { moodLabel } from '../../src/lib/mood';
import { todayKey, formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';

type ViewMode = 'calendar' | 'timeline';

const [TODAY_Y, TODAY_M] = todayKey().split('-').map(Number);

export default function CalendarScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();

  const [year, setYear] = useState(TODAY_Y);
  const [month, setMonth] = useState(TODAY_M); // 1–12
  const [view, setView] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPatterns, setShowPatterns] = useState(true);

  const cal = useCalendarMonth(year, month);
  const moods = useMoods();
  const ai = useAiRemaining();
  const premium = ai.data?.tier === 'premium';
  const events = useEvents(year, month);
  const calAi = useCalendarAi(year, month, i18n.language, premium);

  const eventMap = useMemo(
    () => new Map((events.data?.events ?? []).map((e) => [e.date, e.type])),
    [events.data],
  );
  const bestDate = calAi.data?.highlights?.bestDay?.date ?? null;
  const recurringDates = useMemo(
    () => new Set((calAi.data?.patterns ?? []).filter((p) => p.type === 'recurring').flatMap((p) => p.dates)),
    [calAi.data],
  );
  const anomalyDates = useMemo(
    () => new Set((calAi.data?.patterns ?? []).filter((p) => p.type === 'anomaly').flatMap((p) => p.dates)),
    [calAi.data],
  );

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
  const monthShort = formatDateKey(`${year}-${String(month).padStart(2, '0')}-01`, i18n.language, {
    weekday: undefined,
    day: undefined,
    month: 'long',
    year: undefined,
  });

  // AI pattern indicators only when toggled on + premium + this month's own data.
  const patternsOn = premium && showPatterns && !calAi.data?.tooFewEntries && !calAi.data?.fallbackMonth;
  const legendPatterns = patternsOn ? calAi.data?.patterns ?? [] : [];

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
                paddingVertical: 10,
                borderRadius: radius.pill,
                backgroundColor: view === v ? colors.surface : 'transparent',
                boxShadow: view === v ? shadow.sm : undefined,
              }}
            >
              <Text variant="label" weight={view === v ? 'bold' : 'medium'} color={view === v ? colors.ink : colors.ink3} style={{ lineHeight: 20 }}>
                {v === 'calendar' ? t('calendar.viewCalendar') : t('calendar.viewTimeline')}
              </Text>
            </Pressable>
          ))}
          {/* Year (Year-in-Pixels) — separate Pro page; 🔒 for free */}
          <Pressable
            onPress={() => router.push('/year-in-pixels')}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.pill }}
          >
            <Text variant="label" weight="medium" color={colors.ink3} style={{ lineHeight: 20 }}>
              {premium ? t('calendar.viewYear') : `🔒 ${t('calendar.viewYear')}`}
            </Text>
          </Pressable>
        </View>

        {view === 'calendar' ? (
          cal.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : cal.isError ? (
            <Notice message={t(errorMessageKey(cal.error))} tone="error" />
          ) : (
            <View style={{ gap: space.lg }}>
              {/* AI cards above the grid (premium) / free upsell (never hidden) */}
              {premium ? (
                <CalendarAiPanel year={year} month={month} onPickDate={setSelectedDate} />
              ) : (
                <CalendarAiUpsell />
              )}

              {/* AI patterns legend + toggle */}
              {premium && (legendPatterns.length || (patternsOn && bestDate)) ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md }}>
                  <Pressable
                    onPress={() => setShowPatterns((s) => !s)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: showPatterns ? colors.ink : colors.surface,
                      borderRadius: radius.pill,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      boxShadow: shadow.sm,
                    }}
                  >
                    <Text variant="label" weight="bold" color={showPatterns ? '#fff' : colors.ink2}>
                      ✦ {t('calendar.aiPatternsLabel')} · {showPatterns ? t('calendar.on') : t('calendar.off')}
                    </Text>
                  </Pressable>
                  {showPatterns && bestDate ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ fontSize: 13, color: brand.peach }}>★</Text>
                      <Text variant="label" color={colors.ink2}>{t('calendar.bestDay')}</Text>
                    </View>
                  ) : null}
                  {legendPatterns.map((p, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.type === 'anomaly' ? brand.lavender : brand.purple }} />
                      <Text variant="label" color={colors.ink2} numberOfLines={1}>{p.title}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <PaperSheet tab={monthShort} tabColor={brand.peach} tabTextColor="#fff" clip clipSide="right">
                <MoodGrid
                  year={year}
                  month={month}
                  days={cal.data?.entries ?? []}
                  moods={moods.data ?? []}
                  locale={i18n.language}
                  onDayPress={setSelectedDate}
                  selectedDate={selectedDate}
                  events={eventMap}
                  bestDate={patternsOn ? bestDate : null}
                  recurringDates={patternsOn ? recurringDates : undefined}
                  anomalyDates={patternsOn ? anomalyDates : undefined}
                />
              </PaperSheet>
              {cal.data ? (
                <View style={{ gap: space.sm }}>
                  {/* row 1: avg + streak */}
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <Stat
                      label={t('calendar.avgShort')}
                      value={cal.data.stats.avgMood.toFixed(1)}
                      tab={brand.peach}
                      sub={
                        cal.data.stats.avgMoodDelta != null && cal.data.stats.avgMoodDelta !== 0
                          ? `${cal.data.stats.avgMoodDelta > 0 ? '↑' : '↓'} ${Math.abs(cal.data.stats.avgMoodDelta).toFixed(1)} ${t('calendar.vsLastMonth')}`
                          : undefined
                      }
                    />
                    <Stat label={t('calendar.streak')} value={`${cal.data.stats.streak}`} tab={brand.purple} sub={t('calendar.streakUnit')} />
                  </View>
                  {/* row 2: logged (full width) */}
                  <View style={{ flexDirection: 'row' }}>
                    <Stat label={t('calendar.logged')} value={`${cal.data.stats.loggedDays}`} tab={brand.mint} tabInk sub={t('calendar.loggedUnit')} inline />
                  </View>
                </View>
              ) : null}
              {moods.data?.length ? <Legend /> : null}
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
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: shadow.sm,
        }}
      >
        <Text variant="title" color={colors.ink}>
          {label}
        </Text>
      </Pressable>
    );
  }

  function Stat({ label, value, tab, tabInk, sub, inline }: { label: string; value: string; tab: string; tabInk?: boolean; sub?: string; inline?: boolean }) {
    return (
      <View style={{ flex: 1 }}>
        {/* compact folder tab */}
        <View
          style={{
            alignSelf: 'flex-start',
            maxWidth: '100%',
            backgroundColor: tab,
            borderTopLeftRadius: radius.sm,
            borderTopRightRadius: radius.sm,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: -2,
          }}
        >
          <Text variant="eyebrow" weight="bold" color={tabInk ? colors.ink : '#fff'} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.surface,
            ...sheetRadius,
            borderTopLeftRadius: 0,
            padding: space.md,
            gap: inline ? 0 : 2,
            flexDirection: inline ? 'row' : 'column',
            alignItems: inline ? 'baseline' : 'stretch',
            boxShadow: shadow.sm,
          }}
        >
          <Text variant="h2">{value}</Text>
          {sub ? (
            <Text variant="label" color={colors.ink3} numberOfLines={1} style={inline ? { marginLeft: 8 } : undefined}>
              {sub}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  function Legend() {
    return (
      <View>
        <FolderTab label={t('calendar.legend')} bg={colors.ink} fg="#fff" />
        <View
          style={{
            backgroundColor: colors.surface,
            ...sheetRadius,
            borderTopLeftRadius: 0,
            padding: space.lg,
            boxShadow: shadow.sm,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {(moods.data ?? []).map((m) => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: m.color }} />
                <Text variant="label" color={colors.ink2}>{moodLabel(m, i18n.language)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }
}
