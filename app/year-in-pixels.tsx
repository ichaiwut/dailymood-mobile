/**
 * Year in Pixels (/year-in-pixels) — Pro. A pixel per day for the whole year
 * (transposed for mobile: 31 day-rows × 12 month-columns), an AI year summary,
 * and stat cards. Free users see the Pro gate. GET /api/year-in-pixels.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { Notice } from '../src/components/Notice';
import { RichText } from '../src/components/RichText';
import { SparkleIcon } from '../src/components/icons/Glyphs';
import { useToast } from '../src/components/Toast';
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
// pixel grid: months down the side, days across (horizontally swipeable, like web)
const CELL = 27;
const GAP = 3;
const HEADER_H = 20;
const LABEL_W = 42;

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
  const toast = useToast();

  const ai = useAiRemaining();
  const premium = ai.data?.tier === 'premium';
  const [year, setYear] = useState(THIS_YEAR);
  const [selected, setSelected] = useState<string | null>(null);

  const moods = useMoods();
  const yip = useYearInPixels(year, i18n.language, premium);
  const d = yip.data;
  const today = todayKey();

  const selMood = selected ? findMood(moods.data, d?.dayMap[selected]) : undefined;
  const dominantMood = d?.dominantMood ? findMood(moods.data, d.dominantMood) : undefined;
  const monthShort = (m: number) =>
    new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', {
      month: 'short',
      timeZone: APP_TIMEZONE,
    }).format(new Date(Date.UTC(year, m - 1, 1)));

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
          {/* AI year summary — header, summary, theme chip, stats + "tell me more" */}
          <View style={{ marginTop: space.xs }}>
            <View style={{ backgroundColor: '#F3ECF9', ...sheetRadius, padding: space.xl, gap: space.md, boxShadow: shadow.md }}>
              {/* washi tape */}
              <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' }}>
                <View style={{ width: 100, height: 26, borderRadius: 2, backgroundColor: 'rgba(253,203,86,0.65)', transform: [{ rotate: '-3deg' }] }} />
              </View>

              {/* header: gradient sparkle + title + Pro pill */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <LinearGradient
                  colors={['#A673F1', '#C9A6F5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}
                >
                  <SparkleIcon size={16} color="#fff" />
                </LinearGradient>
                <Text variant="title" color={brand.purpleStrong} style={{ flex: 1 }}>
                  {t('yip.yearSummary')} · {year}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, boxShadow: shadow.sm }}>
                  <SparkleIcon size={12} color={brand.purple} />
                  <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('yip.pro')}</Text>
                </View>
              </View>

              {d.aiSummary ? (
                <>
                  <RichText text={d.aiSummary.summary} style={{ lineHeight: 26, fontSize: 16 }} />
                  {d.aiSummary.yearTheme ? (
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, backgroundColor: 'rgba(252,164,91,0.22)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 }}>
                      <Text style={{ fontSize: 14 }}>📑</Text>
                      <Text variant="label" weight="bold" color="#B5651D">{d.aiSummary.yearTheme}</Text>
                    </View>
                  ) : null}
                  <Text variant="label" color={colors.ink3}>{t('yip.aiDisclaimer')}</Text>
                </>
              ) : (
                <Text variant="body" color={colors.ink2}>{t('stats.tooFew')}</Text>
              )}

              {/* 2×2 stat cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.xs }}>
                <Stat
                  emoji={dominantMood?.emoji ?? '😊'}
                  label={t('yip.statDominant')}
                  value={dominantMood ? moodLabel(dominantMood, i18n.language) : '—'}
                  meta={d.dominantPct ? `${d.dominantPct}%` : undefined}
                />
                <Stat
                  emoji="🔥"
                  label={t('yip.statStreak')}
                  value={d.streak ? t('yip.streakDays', { n: d.streak.days }) : '—'}
                  meta={d.streak ? monthShort(d.streak.month) : undefined}
                />
                <Stat emoji="📝" label={t('yip.statEntries')} value={t('yip.times', { n: d.totalDays })} />
                <Stat
                  emoji="💡"
                  label={t('yip.statTrigger')}
                  value={d.topTrigger ? `"${d.topTrigger.tag}"` : '—'}
                  meta={d.topTrigger ? t('yip.times', { n: d.topTrigger.count }) : undefined}
                />
              </View>

              {/* "tell me the story" → the scroll-reveal Year Story recap page */}
              {d.aiSummary ? (
                <Pressable
                  onPress={() => router.push({ pathname: '/year-in-pixels/story', params: { year: String(year) } })}
                  style={{ borderRadius: radius.md, overflow: 'hidden', marginTop: space.xs }}
                >
                  <LinearGradient
                    colors={['#A673F1', '#9747FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 14, alignItems: 'center' }}
                  >
                    <Text variant="label" weight="bold" color="#fff">{t('yip.tellMore')}</Text>
                  </LinearGradient>
                </Pressable>
              ) : null}

              {/* compare with previous year (flips the card) + PDF report (soon) */}
              <WhiteBtn emoji="📊" label={t('yip.compare', { year: year - 1 })} onPress={() => { setSelected(null); setYear((y) => y - 1); }} />
              <WhiteBtn emoji="📄" label={t('yip.downloadPdf')} onPress={() => toast.show(t('yip.pdfSoon'))} />
            </View>
          </View>

          {/* pixel grid — months down the side, days across (swipe right for more) */}
          <PaperSheet tab={t('calendar.viewYear')} tabColor={brand.peach} tabTextColor={colors.ink}>
            <View style={{ flexDirection: 'row' }}>
              {/* fixed month-label column */}
              <View style={{ width: LABEL_W }}>
                <View style={{ height: HEADER_H, marginBottom: GAP }} />
                {MONTHS.map((m) => (
                  <View key={m} style={{ height: CELL, marginBottom: GAP, justifyContent: 'center' }}>
                    <Text variant="label" weight="bold" color={colors.ink2} style={{ fontSize: 14 }}>{monthShort(m)}</Text>
                  </View>
                ))}
              </View>

              {/* horizontally scrollable day columns */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* day-number header */}
                  <View style={{ flexDirection: 'row', height: HEADER_H, marginBottom: GAP }}>
                    {DAYS.map((day) => (
                      <View key={day} style={{ width: CELL, marginRight: GAP, alignItems: 'center', justifyContent: 'center' }}>
                        <Text variant="label" color={colors.ink3} style={{ fontSize: 14 }}>{day}</Text>
                      </View>
                    ))}
                  </View>
                  {MONTHS.map((m) => (
                    <View key={m} style={{ flexDirection: 'row', marginBottom: GAP }}>
                      {DAYS.map((day) => {
                        if (day > daysInMonth(year, m)) return <View key={day} style={{ width: CELL, height: CELL, marginRight: GAP }} />;
                        const key = `${year}-${pad(m)}-${pad(day)}`;
                        const mood = findMood(moods.data, d.dayMap[key]);
                        const isToday = key === today;
                        const isSel = key === selected;
                        return (
                          <Pressable
                            key={day}
                            onPress={() => setSelected(isSel ? null : key)}
                            style={{
                              width: CELL,
                              height: CELL,
                              marginRight: GAP,
                              borderRadius: 7,
                              backgroundColor: mood ? mood.color : colors.surface2,
                              borderWidth: isSel ? 2.5 : isToday ? 2.5 : 0,
                              borderColor: isSel ? colors.ink : brand.yellow,
                            }}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* mood legend */}
            <View style={{ height: 1, backgroundColor: colors.hairline, marginVertical: space.lg }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm, columnGap: space.lg }}>
              {moods.data?.map((mo) => (
                <View key={mo.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: mo.color }} />
                  <Text variant="label" color={colors.ink2}>{moodLabel(mo, i18n.language)}</Text>
                </View>
              ))}
            </View>

            {/* dominant-of-year footer */}
            {dominantMood ? (
              <Text variant="label" color={colors.ink3} style={{ marginTop: space.lg }}>
                {t('yip.dominantOfYear')} · <Text variant="label" weight="bold" color={colors.ink}>{moodLabel(dominantMood, i18n.language)}</Text>
                {d.dominantPct ? `  ·  ${d.dominantPct}%` : ''}
              </Text>
            ) : null}
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
        </>
      ) : null}
    </Screen>
  );

  function WhiteBtn({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          paddingVertical: 13,
          boxShadow: shadow.sm,
        }}
      >
        <Text style={{ fontSize: 15 }}>{emoji}</Text>
        <Text variant="label" weight="bold" color={colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function Stat({ emoji, label, value, meta }: { emoji: string; label: string; value: string; meta?: string }) {
    return (
      <View style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, gap: 8, boxShadow: shadow.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 15 }}>{emoji}</Text>
          <Text variant="label" color={colors.ink3} style={{ flex: 1 }}>{label}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 5 }}>
          <Text weight="bold" style={{ fontSize: 17 }}>{value || '—'}</Text>
          {meta ? <Text variant="label" color={colors.ink3}>· {meta}</Text> : null}
        </View>
      </View>
    );
  }
}
