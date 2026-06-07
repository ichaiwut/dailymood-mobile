/**
 * Year in Pixels (/year-in-pixels) — Pro. A pixel per day for the whole year
 * (transposed for mobile: 31 day-rows × 12 month-columns), an AI year summary,
 * and stat cards. Free users see the Pro gate. GET /api/year-in-pixels.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { Notice } from '../src/components/Notice';
import { RichText } from '../src/components/RichText';
import { PaperSheet } from '../src/components/paper/PaperSheet';
import { PASticker } from '../src/components/paper/PASticker';
import { useTheme } from '../src/theme/ThemeProvider';
import { useYearInPixels, useMoods, useAiRemaining } from '../src/hooks/queries';
import { useGoBack } from '../src/hooks/useGoBack';
import { useRouter } from 'expo-router';
import { findMood, moodLabel } from '../src/lib/mood';
import { todayKey } from '../src/lib/time';
import { APP_TIMEZONE } from '../src/config';
import { errorMessageKey } from '../src/api/errors';

const THIS_YEAR = Number(todayKey().slice(0, 4));
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export default function YearInPixelsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const goBack = useGoBack();

  const ai = useAiRemaining();
  const premium = ai.data?.tier === 'premium';
  const [year, setYear] = useState(THIS_YEAR);
  const [selected, setSelected] = useState<string | null>(null);

  const moods = useMoods();
  const yip = useYearInPixels(year, i18n.language, premium);
  const d = yip.data;
  const today = todayKey();

  const monthLabel = (m: number) =>
    new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', {
      month: 'narrow',
      timeZone: APP_TIMEZONE,
    }).format(new Date(Date.UTC(year, m - 1, 1)));

  const selMood = selected ? findMood(moods.data, d?.dayMap[selected]) : undefined;

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80 }}>
      {/* header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Text variant="label" weight="bold" color={colors.ink2}>← {t('common.back')}</Text>
        </Pressable>
        {premium ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={8}>
              <Text variant="title" color={colors.ink2}>◀</Text>
            </Pressable>
            <Text variant="title">{year}</Text>
            <Pressable onPress={() => setYear((y) => Math.min(THIS_YEAR, y + 1))} hitSlop={8} disabled={year >= THIS_YEAR}>
              <Text variant="title" color={year >= THIS_YEAR ? colors.ink3 : colors.ink2}>▶</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Text variant="label" weight="bold" color={brand.purple} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {t('yip.eyebrow')} · {year}
      </Text>

      {!premium ? (
        /* Pro gate */
        <View style={{ marginTop: space.x2 }}>
          <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 6 }}>
            <View style={{ width: 110, height: 26, borderRadius: 2, backgroundColor: 'rgba(212,190,228,0.75)', transform: [{ rotate: '-3deg' }] }} />
          </View>
          <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
            <Text style={{ fontSize: 48 }}>🎨</Text>
            <Text variant="h2" center>{t('yip.title')}</Text>
            <Text variant="body" color={colors.ink2} center>{t('yip.gateBody')}</Text>
            <Button variant="purple" label={t('yip.upgrade')} onPress={() => router.push('/profile/subscription')} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
          </View>
        </View>
      ) : yip.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : yip.isError ? (
        <Notice message={t(errorMessageKey(yip.error))} tone="error" />
      ) : d ? (
        <>
          {/* AI year summary */}
          {d.aiSummary ? (
            <View style={{ marginTop: space.xs }}>
              <View style={{ backgroundColor: '#F3ECF9', ...sheetRadius, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
                <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' }}>
                  <View style={{ width: 100, height: 26, borderRadius: 2, backgroundColor: 'rgba(253,203,86,0.65)', transform: [{ rotate: '-3deg' }] }} />
                </View>
                <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('yip.yearSummary')} · {year}
                </Text>
                <RichText text={d.aiSummary.summary} style={{ lineHeight: 24 }} />
                {d.aiSummary.yearTheme ? (
                  <Text variant="label" weight="bold" color={brand.purpleStrong}>🏷️ {d.aiSummary.yearTheme}</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* pixel grid */}
          <PaperSheet>
            {/* month header row */}
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <View style={{ width: 22 }} />
              {MONTHS.map((m) => (
                <View key={m} style={{ flex: 1, alignItems: 'center' }}>
                  <Text variant="label" weight="bold" color={colors.ink3} style={{ fontSize: 14 }}>{monthLabel(m)}</Text>
                </View>
              ))}
            </View>
            {DAYS.map((day) => (
              <View key={day} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <View style={{ width: 22 }}>
                  <Text variant="label" color={colors.ink3} style={{ fontSize: 14 }}>{day}</Text>
                </View>
                {MONTHS.map((m) => {
                  if (day > daysInMonth(year, m)) return <View key={m} style={{ flex: 1, aspectRatio: 1, margin: 1 }} />;
                  const key = `${year}-${pad(m)}-${pad(day)}`;
                  const mood = findMood(moods.data, d.dayMap[key]);
                  const isToday = key === today;
                  const isSel = key === selected;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setSelected(isSel ? null : key)}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        margin: 1,
                        borderRadius: 3,
                        backgroundColor: mood ? mood.color : colors.surface2,
                        borderWidth: isSel ? 2 : isToday ? 2 : 0,
                        borderColor: isSel ? colors.ink : brand.purple,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </PaperSheet>

          {/* selected-cell tooltip */}
          {selected ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, boxShadow: shadow.sm }}>
              <PASticker color={selMood?.color ?? colors.ink3} moodId={selMood?.id} size={36} />
              <View>
                <Text variant="label" weight="bold">
                  {new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: APP_TIMEZONE }).format(new Date(`${selected}T00:00:00+07:00`))}
                </Text>
                <Text variant="label" color={colors.ink2}>{selMood ? moodLabel(selMood, i18n.language) : t('calendar.emptyDay')}</Text>
              </View>
            </View>
          ) : null}

          {/* stat cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            <Stat label={t('yip.dominant')} value={d.dominantMood ? moodLabel(findMood(moods.data, d.dominantMood), i18n.language) : '—'} sub={d.dominantPct ? `${d.dominantPct}%` : undefined} />
            <Stat label={t('yip.longestStreak')} value={d.streak ? t('yip.streakDays', { n: d.streak.days }) : '—'} />
            <Stat label={t('yip.daysLogged', { n: d.totalDays, total: d.daysInYear })} value={`${Math.round((d.totalDays / d.daysInYear) * 100)}%`} />
          </View>
        </>
      ) : null}
    </Screen>
  );

  function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
      <View style={{ flexGrow: 1, minWidth: '46%', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, gap: 2, boxShadow: shadow.sm }}>
        <Text variant="label" color={colors.ink3}>{label}</Text>
        <Text variant="title">{value || '—'}{sub ? <Text variant="label" color={colors.ink3}>  {sub}</Text> : null}</Text>
      </View>
    );
  }
}
