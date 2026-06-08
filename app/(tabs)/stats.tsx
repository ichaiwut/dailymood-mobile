/**
 * Stats tab — Paper Desk. Week/Month/Year pills (Year Pro-gated → banner), an AI
 * insight card, four KPI cards, the signature mood-trend line chart (with AI
 * pins), a mood-mix breakdown, and activity-impact diverging bars (Pro).
 * GET /api/stats?period= + GET /api/insights. Share = OS share of a text summary
 * (the richer ShareCardModal is a separate handoff).
 */
import { useState, type ReactNode } from 'react';
import { View, Pressable, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { Button } from '../../src/components/Button';
import { MoodLineChart } from '../../src/components/paper/stats/MoodLineChart';
import { PASticker } from '../../src/components/paper/PASticker';
import { SparkleIcon } from '../../src/components/icons/Glyphs';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useStats, useMoods, useProfile, useInsights, useEvents } from '../../src/hooks/queries';
import { findMood, moodLabel } from '../../src/lib/mood';
import { todayKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';
import type { StatsPeriod, Mood, ActivityInsight, MonthEvent } from '../../src/api/types';

const AI_TINT = '#F3ECF9';
const PERIOD_DAYS: Record<StatsPeriod, number> = { week: 7, month: 30, year: 365 };

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();

  const [period, setPeriod] = useState<StatsPeriod>('week');
  const [yearGate, setYearGate] = useState(false);
  const profile = useProfile();
  const premium = profile.data?.user.isPremium ?? false;
  const stats = useStats(period);
  const moods = useMoods();
  const insights = useInsights();

  const d = stats.data;
  const periodLabel = t(`stats.${period}`);
  const goPro = () => router.push('/profile/subscription');

  const onShare = () => {
    if (!d) return;
    Share.share({
      message: `DailyMood · ${t('stats.kpiStreak')} ${d.streak} · ${t('stats.kpiEntries')} ${d.total} · ${t('stats.kpiAvg')} ${d.avgScore.toFixed(1)}`,
    }).catch(() => {});
  };

  // mood mix
  const mix = d
    ? (Object.entries(d.distribution)
        .map(([id, count]) => ({ mood: findMood(moods.data, id), count }))
        .filter((x) => x.mood && x.count > 0)
        .sort((a, b) => b.count - a.count) as { mood: Mood; count: number }[])
    : [];
  const mixTotal = mix.reduce((s, x) => s + x.count, 0);
  const top = mix[0];

  // special days within the period window (events are per-month, so fetch the
  // current + previous month and filter — covers week/month; year is skipped).
  const today = todayKey();
  const curY = Number(today.slice(0, 4));
  const curM = Number(today.slice(5, 7));
  const prevY = curM === 1 ? curY - 1 : curY;
  const prevM = curM === 1 ? 12 : curM - 1;
  const evCur = useEvents(curY, curM);
  const evPrev = useEvents(prevY, prevM);
  const windowStart = (() => {
    const dt = new Date(`${today}T00:00:00Z`);
    dt.setUTCDate(dt.getUTCDate() - (PERIOD_DAYS[period] - 1));
    return dt.toISOString().slice(0, 10);
  })();
  const specialDays: MonthEvent[] =
    period === 'year'
      ? []
      : [...(evPrev.data?.events ?? []), ...(evCur.data?.events ?? [])]
          .filter((e) => e.date >= windowStart && e.date <= today)
          .sort((a, b) => (a.date < b.date ? -1 : 1));
  const dm = (date: string) => `${Number(date.slice(8, 10))}/${Number(date.slice(5, 7))}`;

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
      {/* header + controls */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
        <Text variant="h1">{t('tabs.stats')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
          {d && d.total >= 7 ? (
            <Pressable onPress={onShare} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: brand.purpleStrong, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text variant="label" weight="bold" color="#fff">📤 {t('stats.share')}</Text>
            </Pressable>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['week', 'month', 'year'] as StatsPeriod[]).map((p) => {
              const locked = p === 'year' && !premium;
              const active = period === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => (locked ? setYearGate(true) : (setPeriod(p), setYearGate(false)))}
                  style={{
                    borderRadius: radius.pill,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: active ? brand.purple : colors.surface,
                    opacity: locked ? 0.5 : 1,
                    boxShadow: active ? undefined : shadow.sm,
                  }}
                >
                  <Text variant="label" weight="bold" color={active ? '#fff' : colors.ink2}>{t(`stats.${p}`)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* year gate banner (free) */}
      {yearGate ? (
        <Pressable onPress={goPro} style={{ backgroundColor: AI_TINT, borderRadius: radius.md, padding: space.md }}>
          <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('stats.yearGate')}</Text>
        </Pressable>
      ) : null}

      {stats.isLoading ? (
        <LoadingSkeleton />
      ) : stats.isError ? (
        <Notice message={t(errorMessageKey(stats.error))} tone="error" />
      ) : d ? (
        d.total < 7 ? (
          <TooFew total={d.total} />
        ) : (
          <>
            {/* AI insight */}
            <View style={{ backgroundColor: AI_TINT, ...sheetRadius, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
              <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' }}>
                <View style={{ width: 96, height: 24, borderRadius: 2, backgroundColor: 'rgba(253,203,86,0.6)', transform: [{ rotate: '-3deg' }] }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <LinearGradient colors={['#A673F1', '#C9A6F5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                  <SparkleIcon size={16} color="#fff" />
                </LinearGradient>
                <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('stats.aiInsight')} · {periodLabel}
                </Text>
                {!premium ? (
                  <View style={{ backgroundColor: 'rgba(166,115,241,0.14)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('stats.pro')}</Text>
                  </View>
                ) : null}
              </View>
              {premium && insights.data?.summary ? (
                <Text variant="body" color={colors.ink} numberOfLines={3} style={{ lineHeight: 25 }}>{insights.data.summary}</Text>
              ) : (
                <Text variant="label" color={colors.ink2} style={{ lineHeight: 22 }}>{t('stats.aiFree')}</Text>
              )}
              <Pressable onPress={() => router.push('/insights')} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
                <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.seeMore')}</Text>
              </Pressable>
              {premium ? <Text variant="label" color={colors.ink3}>{t('calendar.aiDisclaimer')}</Text> : null}
            </View>

            {/* KPI cards */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
              <Kpi
                label={t('stats.kpiAvg')}
                value={d.avgScore.toFixed(1)}
                sub={typeof d.avgScoreDelta === 'number' && d.avgScoreDelta !== 0 ? `${d.avgScoreDelta > 0 ? '+' : ''}${d.avgScoreDelta.toFixed(1)} ${d.avgScoreDelta > 0 ? '↑' : '↓'}` : undefined}
                subColor={d.avgScoreDelta && d.avgScoreDelta > 0 ? colors.success : colors.danger}
              />
              <Kpi label={t('stats.kpiEntries')} value={String(d.total)} sub={t('stats.daysN', { n: PERIOD_DAYS[period] })} />
              <Kpi label={t('stats.kpiStreak')} value={`${d.streak} 🔥`} sub={t('stats.daysN', { n: PERIOD_DAYS[period] })} />
              <Kpi label={t('stats.kpiDominant')} value={top?.mood.emoji ?? '—'} sub={top ? `${moodLabel(top.mood, i18n.language)} · ${Math.round((top.count / mixTotal) * 100)}%` : undefined} />
            </View>

            {/* mood trend */}
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="title">{t('stats.moodTrend')}</Text>
                <Text variant="label" color={colors.ink3}>{periodLabel}</Text>
              </View>
              <MoodLineChart points={d.moodTrend} period={period} annotations={d.annotations} premium={premium} onUpgrade={goPro} />
            </Card>

            {/* special days in this period */}
            {specialDays.length ? (
              <Card>
                <Text variant="title">{t('stats.specialDays')}</Text>
                <View style={{ gap: space.sm }}>
                  {specialDays.map((e, i) => {
                    const holiday = e.type === 'holiday';
                    return (
                      <View
                        key={e.id ?? `${e.date}-${i}`}
                        style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: holiday ? '#FFF0F3' : '#EFF6FF', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 }}
                      >
                        <Text style={{ fontSize: 15 }}>{e.emoji}</Text>
                        <Text variant="label" weight="bold" color={holiday ? '#BE123C' : '#1D4ED8'}>
                          {i18n.language === 'th' ? e.labelTh : e.label}
                        </Text>
                        <Text variant="label" color={colors.ink3}>{dm(e.date)}</Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : null}

            {/* mood mix */}
            {top ? (
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="title">{t('stats.moodMix')}</Text>
                  <Text variant="label" color={colors.ink3}>{t('stats.entriesN', { n: mixTotal })}</Text>
                </View>
                {/* stacked bar */}
                <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  {mix.map(({ mood, count }) => (
                    <View key={mood.id} style={{ flex: count, minWidth: 3, backgroundColor: mood.color }} />
                  ))}
                </View>
                {/* featured top mood */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: top.mood.color + '22', borderRadius: 14, padding: space.lg }}>
                  <PASticker color={top.mood.color} moodId={top.mood.id} size={52} />
                  <View style={{ flex: 1 }}>
                    <Text variant="title">{moodLabel(top.mood, i18n.language)}</Text>
                    <Text variant="label" color={colors.ink2}>{t('stats.daysN', { n: top.count })}</Text>
                  </View>
                  <Text weight="extrabold" style={{ fontSize: 28, color: colors.ink }}>{Math.round((top.count / mixTotal) * 100)}%</Text>
                </View>
                {/* top 5 list */}
                <View style={{ gap: space.sm }}>
                  {mix.slice(0, 5).map(({ mood, count }) => {
                    const pct = Math.round((count / mixTotal) * 100);
                    return (
                      <View key={mood.id} style={{ gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <PASticker color={mood.color} moodId={mood.id} size={20} />
                          <Text variant="label" weight="medium" style={{ flex: 1 }}>{moodLabel(mood, i18n.language)}</Text>
                          <Text variant="label" color={colors.ink3}>{t('stats.daysN', { n: count })}</Text>
                          <Text variant="label" weight="bold" style={{ width: 40, textAlign: 'right' }}>{pct}%</Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface2, marginLeft: 28, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${pct}%`, backgroundColor: mood.color, borderRadius: 3 }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : null}

            {/* activity impact */}
            {premium ? (
              d.activityInsight.length > 0 ? (
                <Card>
                  <Text variant="title">{t('stats.activityTitle')}</Text>
                  <Text variant="label" color={colors.ink3}>{t('stats.activitySub', { n: d.total })}</Text>
                  <Text variant="label" color={colors.ink3} style={{ marginTop: -4 }}>{t('stats.activityHint')}</Text>
                  <View style={{ gap: space.md, marginTop: space.xs }}>
                    {d.activityInsight.map((a) => (
                      <ActivityRow key={a.id} a={a} />
                    ))}
                  </View>
                </Card>
              ) : null
            ) : (
              <Pressable onPress={goPro}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                    <Text variant="title" style={{ flex: 1 }}>{t('stats.activityTitle')}</Text>
                    <View style={{ backgroundColor: 'rgba(166,115,241,0.12)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('stats.pro')}</Text>
                    </View>
                  </View>
                  <Text variant="label" color={colors.ink2} style={{ lineHeight: 22 }}>{t('stats.activityTeaser')}</Text>
                  <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('subscription.subscribe')} →</Text>
                </Card>
              </Pressable>
            )}
          </>
        )
      ) : null}
    </Screen>
  );

  function Card({ children }: { children: ReactNode }) {
    return <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.xl, gap: space.md, boxShadow: shadow.md }}>{children}</View>;
  }

  function Kpi({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string }) {
    return (
      <View style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 4, boxShadow: shadow.sm }}>
        <Text variant="eyebrow">{label}</Text>
        <Text weight="extrabold" style={{ fontSize: 32, color: colors.ink }}>{value}</Text>
        {sub ? <Text variant="label" weight="medium" color={subColor ?? colors.ink3}>{sub}</Text> : null}
      </View>
    );
  }

  function ActivityRow({ a }: { a: ActivityInsight }) {
    const w = Math.min(Math.abs(a.impact) / 2, 50); // % of the half-track
    const pos = a.impact >= 0;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Text variant="label" weight="bold" numberOfLines={1} style={{ width: 96 }}>{a.emoji} {a.label}</Text>
        <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surface2, overflow: 'hidden', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: colors.hairline2 }} />
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: pos ? '50%' : `${50 - w}%`, width: `${w}%`, backgroundColor: pos ? brand.mint : '#F4A8A8' }} />
        </View>
        <View style={{ width: 78, alignItems: 'flex-end' }}>
          <Text variant="label" weight="bold" color={pos ? colors.success : colors.danger}>
            {pos ? '↑' : '↓'} {t(pos ? 'stats.activityBetter' : 'stats.activityWorse')}
          </Text>
          <Text variant="label" color={colors.ink3}>{Math.abs(a.impact)}%</Text>
        </View>
      </View>
    );
  }

  function TooFew({ total }: { total: number }) {
    const need = Math.max(0, 7 - total);
    return (
      <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
        <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ width: 96, height: 24, borderRadius: 2, backgroundColor: 'rgba(253,203,86,0.6)', transform: [{ rotate: '-3deg' }] }} />
        </View>
        <Text style={{ fontSize: 44 }}>📊</Text>
        <Text variant="h2" center>{t('stats.tooFewTitle', { n: need })}</Text>
        <Text variant="body" color={colors.ink2} center>{t('stats.tooFewBody')}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: space.sm }}>
          {Array.from({ length: 7 }, (_, i) => {
            const done = i < total;
            return (
              <View key={i} style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? brand.purple : colors.surface2 }}>
                <Text variant="label" weight="bold" color={done ? '#fff' : colors.ink3}>{done ? '✓' : i + 1}</Text>
              </View>
            );
          })}
        </View>
        <Button variant="purple" label={t('stats.logToday')} onPress={() => router.push('/(tabs)')} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  function LoadingSkeleton() {
    const Block = ({ h, bg }: { h: number; bg?: string }) => (
      <View style={{ height: h, borderRadius: radius.lg, backgroundColor: bg ?? colors.surface2, opacity: 0.6 }} />
    );
    return (
      <View style={{ gap: space.lg }}>
        <Block h={120} bg={AI_TINT} />
        <Block h={220} />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}><Block h={90} /></View>
          <View style={{ flex: 1 }}><Block h={90} /></View>
        </View>
      </View>
    );
  }
}
