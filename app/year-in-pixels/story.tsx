/**
 * Year Story (/year-in-pixels/story?year=YYYY) — Pro. A scroll-reveal recap of the
 * whole year, Paper Desk style. Every section is wrapped in <Reveal> so it fades up
 * as it enters the viewport (driven by the parent scroll position; respects
 * reduce-motion). Same data as Year in Pixels: GET /api/year-in-pixels.
 */
import { View, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Notice } from '../../src/components/Notice';
import { RichText } from '../../src/components/RichText';
import { Reveal } from '../../src/components/Reveal';
import { SparkleIcon } from '../../src/components/icons/Glyphs';
import { PaperSheet, FolderTab } from '../../src/components/paper/PaperSheet';
import { PASticker } from '../../src/components/paper/PASticker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useYearInPixels, useMoods, useAiRemaining } from '../../src/hooks/queries';
import { useGoBack } from '../../src/hooks/useGoBack';
import { findMood, moodLabel } from '../../src/lib/mood';
import { todayKey } from '../../src/lib/time';
import { APP_TIMEZONE } from '../../src/config';
import { errorMessageKey } from '../../src/api/errors';
import type { Mood } from '../../src/api/types';

const THIS_YEAR = Number(todayKey().slice(0, 4));
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const WEEKS = Array.from({ length: 53 }, (_, i) => i);
// pixel grid (months down the side, days across — swipeable)
const CELL = 22;
const GAP = 3;
const HEADER_H = 18;
const LABEL_W = 40;

const pad = (n: number) => String(n).padStart(2, '0');
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const dayOfYear = (y: number, m: number, d: number) =>
  Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000);

/** Dominant mood id per ISO-ish week (0..52), from the day→mood map. */
function weekStrip(year: number, dayMap: Record<string, string>) {
  const tally: Record<number, Record<string, number>> = {};
  for (const [key, moodId] of Object.entries(dayMap)) {
    if (!key.startsWith(`${year}-`)) continue;
    const m = Number(key.slice(5, 7));
    const d = Number(key.slice(8, 10));
    const w = Math.min(52, Math.floor(dayOfYear(year, m, d) / 7));
    (tally[w] ??= {})[moodId] = ((tally[w] ??= {})[moodId] ?? 0) + 1;
  }
  return WEEKS.map((w) => {
    const counts = tally[w];
    if (!counts) return null;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  });
}

/** Mood distribution across the whole year, as % segments (desc). */
function distribution(dayMap: Record<string, string>, moods: Mood[] | undefined) {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const moodId of Object.values(dayMap)) {
    counts[moodId] = (counts[moodId] ?? 0) + 1;
    total++;
  }
  if (!total) return [];
  return Object.entries(counts)
    .map(([id, n]) => ({ mood: findMood(moods, id), pct: (n / total) * 100 }))
    .filter((s) => s.mood)
    .sort((a, b) => b.pct - a.pct);
}

export default function YearStoryScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const goBack = useGoBack('/year-in-pixels');
  const params = useLocalSearchParams<{ year?: string }>();
  const year = Number(params.year) || THIS_YEAR;
  const { height: vh } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const aiQ = useAiRemaining();
  const premium = aiQ.data?.tier === 'premium';
  const moods = useMoods();
  const yip = useYearInPixels(year, i18n.language, premium);
  const d = yip.data;
  const today = todayKey();

  const monthLong = (m: number) =>
    new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { month: 'long', timeZone: APP_TIMEZONE }).format(
      new Date(Date.UTC(year, m - 1, 1)),
    );
  const monthShort = (m: number) =>
    new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { month: 'short', timeZone: APP_TIMEZONE }).format(
      new Date(Date.UTC(year, m - 1, 1)),
    );

  const content = (
    <View style={{ width: '100%', maxWidth: 960, alignSelf: 'center', gap: space.xl }}>
      {!premium ? (
        <Gate />
      ) : yip.isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: space.x3 }} />
      ) : yip.isError ? (
        <Notice message={t(errorMessageKey(yip.error))} tone="error" />
      ) : d ? (
        <>
          {/* 1 · hero */}
          <Reveal scrollY={scrollY} vh={vh}>
            <PaperSheet tab={`★ ${t('yip.storyTab')}`} tabColor={brand.purple} clip clipSide="right">
              <Pressable onPress={goBack} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
                <Text variant="label" weight="bold" color={colors.ink3}>{t('yip.backToPixels')}</Text>
              </Pressable>
              <Text weight="extrabold" style={{ fontSize: 52, marginTop: space.sm, color: colors.ink }}>{year}</Text>
              <Text variant="label" color={colors.ink3} style={{ marginBottom: space.lg }}>{t('yip.allDaysTab')}</Text>
              {/* 52-week strip */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
                {weekStrip(year, d.dayMap).map((moodId, i) => {
                  const mood = findMood(moods.data, moodId);
                  return (
                    <View
                      key={i}
                      style={{ width: 10, height: 16, borderRadius: 2, backgroundColor: mood ? mood.color : colors.surface2 }}
                    />
                  );
                })}
              </View>
            </PaperSheet>
          </Reveal>

          {/* 2 · stat folders */}
          <Reveal scrollY={scrollY} vh={vh}>
            <Row>
              <StatSheet washi={brand.peach} value={t('yip.times', { n: d.totalDays })} label={t('yip.statEntries')} meta={t('yip.ofYear', { pct: Math.round((d.totalDays / d.daysInYear) * 100) })} />
              <StatSheet washi={brand.yellow} value={d.streak ? t('yip.streakDays', { n: d.streak.days }) : '—'} label={t('yip.statStreak')} meta={d.streak ? monthShort(d.streak.month) : undefined} />
            </Row>
          </Reveal>

          {/* 3 · dominant mood */}
          {dominantMood() ? (
            <Reveal scrollY={scrollY} vh={vh}>
              <PaperSheet tab={t('yip.dominantTab')} tabColor={brand.lavender} tabTextColor={colors.ink}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
                  <View style={{ transform: [{ rotate: '-6deg' }] }}>
                    <PASticker color={dominantMood()!.color} moodId={dominantMood()!.id} size={64} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="h2">{moodLabel(dominantMood(), i18n.language)}</Text>
                    <Text variant="label" color={colors.ink3}>{t('yip.moodMix')}</Text>
                  </View>
                  <Text variant="display" color={brand.purpleStrong}>{d.dominantPct}%</Text>
                </View>
                {/* distribution bar */}
                <View style={{ flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginTop: space.lg, backgroundColor: colors.surface2 }}>
                  {distribution(d.dayMap, moods.data).map((seg, i) => (
                    <View key={i} style={{ width: `${seg.pct}%`, backgroundColor: seg.mood!.color }} />
                  ))}
                </View>
              </PaperSheet>
            </Reveal>
          ) : null}

          {/* 4 · best / toughest month */}
          {d.bestMonth || d.hardMonth ? (
            <Reveal scrollY={scrollY} vh={vh}>
              <Row>
                {d.bestMonth ? (
                  <MonthSheet tab={t('yip.bestMonthTab')} tabColor={brand.yellow} tabFg={colors.ink} month={monthLong(d.bestMonth.month)} avg={d.bestMonth.avg} />
                ) : null}
                {d.hardMonth ? (
                  <MonthSheet tab={t('yip.toughMonthTab')} tabColor={brand.purple} month={monthLong(d.hardMonth.month)} avg={d.hardMonth.avg} />
                ) : null}
              </Row>
            </Reveal>
          ) : null}

          {/* 5 · patterns */}
          {d.topTrigger || d.trendQ4 ? (
            <Reveal scrollY={scrollY} vh={vh}>
              <Row>
                {d.topTrigger ? (
                  <StatSheet washi={brand.mint} value={`"${d.topTrigger.tag}"`} label={t('yip.topTriggerLabel')} meta={t('yip.times', { n: d.topTrigger.count })} />
                ) : null}
                {d.trendQ4 ? (
                  <StatSheet
                    washi={brand.lavender}
                    value={`${d.trendQ4.pct > 0 ? '+' : ''}${d.trendQ4.pct}%`}
                    label={t('yip.finalQuarter')}
                    meta={t(d.trendQ4.pct > 1 ? 'yip.trendUp' : d.trendQ4.pct < -1 ? 'yip.trendDown' : 'yip.trendFlat')}
                  />
                ) : null}
              </Row>
            </Reveal>
          ) : null}

          {/* 6 · AI year summary (plum gradient) */}
          {d.aiSummary?.summary ? (
            <Reveal scrollY={scrollY} vh={vh}>
              <View>
                <FolderTab label={`✦ ${t('yip.aiYearTab')}`} bg="#2A1F33" fg="#fff" />
                <LinearGradient
                  colors={['#2A1F33', '#1A1320']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.4, y: 1 }}
                  style={{ ...sheetRadius, borderTopLeftRadius: 0, padding: space.x2, boxShadow: shadow.md }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md }}>
                    <SparkleIcon size={18} color={brand.lavender} />
                    <Text variant="label" weight="bold" color={brand.lavender} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {t('yip.aiYearTab')} · {year}
                    </Text>
                  </View>
                  <RichText text={d.aiSummary.summary} color="#fff" style={{ lineHeight: 27, fontSize: 16 }} />
                  {d.aiSummary.yearTheme ? (
                    <Text variant="label" weight="bold" color={brand.peach} style={{ marginTop: space.md }}>📑 {d.aiSummary.yearTheme}</Text>
                  ) : null}
                </LinearGradient>
              </View>
            </Reveal>
          ) : null}

          {/* 7 · pixel grid */}
          <Reveal scrollY={scrollY} vh={vh}>
            <PaperSheet tab={t('yip.allDaysTab')} tabColor={brand.mint} tabTextColor={colors.ink}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: LABEL_W }}>
                  <View style={{ height: HEADER_H, marginBottom: GAP }} />
                  {MONTHS.map((m) => (
                    <View key={m} style={{ height: CELL, marginBottom: GAP, justifyContent: 'center' }}>
                      <Text variant="label" weight="bold" color={colors.ink3} style={{ fontSize: 14 }}>{monthShort(m)}</Text>
                    </View>
                  ))}
                </View>
                <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
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
                          return (
                            <View
                              key={day}
                              style={{
                                width: CELL,
                                height: CELL,
                                marginRight: GAP,
                                borderRadius: 3,
                                backgroundColor: mood ? mood.color : colors.surface2,
                                borderWidth: key === today ? 2 : 0,
                                borderColor: brand.yellow,
                              }}
                            />
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </Animated.ScrollView>
              </View>
              {/* legend */}
              <View style={{ height: 1, backgroundColor: colors.hairline, marginVertical: space.lg }} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm, columnGap: space.lg }}>
                {moods.data?.map((mo) => (
                  <View key={mo.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: mo.color }} />
                    <Text variant="label" color={colors.ink2}>{moodLabel(mo, i18n.language)}</Text>
                  </View>
                ))}
              </View>
            </PaperSheet>
          </Reveal>

          {/* 8 · outro */}
          <Reveal scrollY={scrollY} vh={vh}>
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
              <View style={{ transform: [{ rotate: '-8deg' }] }}>
                <PASticker color={brand.yellow} moodId={dominantMood()?.id} emoji={dominantMood() ? undefined : '🎉'} size={52} />
              </View>
              <Text variant="h2" center>{t('yip.outroThanks', { year })}</Text>
              <Text variant="body" color={colors.ink2} center>{t('yip.outroSub')}</Text>
              <Button variant="purple" label={t('yip.backToPixels')} onPress={goBack} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
            </View>
          </Reveal>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + 60, paddingHorizontal: space.lg }}
      >
        {content}
      </Animated.ScrollView>
    </View>
  );

  function dominantMood() {
    return d?.dominantMood ? findMood(moods.data, d.dominantMood) : undefined;
  }

  function Row({ children }: { children: React.ReactNode }) {
    return <View style={{ flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' }}>{children}</View>;
  }

  function StatSheet({ value, label, meta, washi }: { value: string; label: string; meta?: string; washi: string }) {
    return (
      <View style={{ flexGrow: 1, flexBasis: '46%' }}>
        <View style={{ position: 'absolute', top: -10, left: 18, zIndex: 6 }}>
          <View style={{ width: 64, height: 22, borderRadius: 2, backgroundColor: washi, opacity: 0.7, transform: [{ rotate: '-3deg' }] }} />
        </View>
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: 4, boxShadow: shadow.md }}>
          <Text weight="extrabold" style={{ fontSize: 26, color: colors.ink }}>{value}</Text>
          <Text variant="label" color={colors.ink3}>{label}{meta ? `  ·  ${meta}` : ''}</Text>
        </View>
      </View>
    );
  }

  function MonthSheet({ tab, tabColor, tabFg, month, avg }: { tab: string; tabColor: string; tabFg?: string; month: string; avg: number }) {
    return (
      <View style={{ flexGrow: 1, flexBasis: '46%' }}>
        <PaperSheet tab={tab} tabColor={tabColor} tabTextColor={tabFg}>
          <Text variant="h2">{month}</Text>
          <Text variant="label" color={colors.ink3} style={{ marginTop: 2 }}>{t('yip.avgMood', { v: avg.toFixed(1) })}</Text>
        </PaperSheet>
      </View>
    );
  }

  function Gate() {
    return (
      <View style={{ marginTop: space.x3, maxWidth: 460, alignSelf: 'center', width: '100%' }}>
        <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 6 }}>
          <View style={{ width: 110, height: 26, borderRadius: 2, backgroundColor: 'rgba(212,190,228,0.75)', transform: [{ rotate: '-3deg' }] }} />
        </View>
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
          <Text style={{ fontSize: 48 }}>🎨</Text>
          <Text variant="h2" center>{t('yip.title')}</Text>
          <Text variant="body" color={colors.ink2} center>{t('yip.gateBody')}</Text>
          <Button variant="purple" label={t('yip.upgrade')} onPress={() => router.push('/profile/subscription')} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
        </View>
      </View>
    );
  }
}
