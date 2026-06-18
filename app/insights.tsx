/**
 * Weekly AI Insights (/insights) — Pro. Paper Desk dashboard from
 * GET /api/insights/all: hero recap folder, 4-feature grid (Forecast / Mood DNA /
 * Themes / Energy Clock), pattern cards, and a suggestion with feedback.
 * Non-premium → a whole-page FreeGate. POST /api/insights/feedback on react.
 *
 * Deferred vs the web spec: the Ask AI sub-tab (no Ask page yet → toast). The
 * AI-Coach / Weekly-Digest toggles now live in Settings → Notification.
 */
import { useState, type ReactNode } from 'react';
import { View, Pressable, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { RichText } from '../src/components/RichText';
import { SparkleIcon } from '../src/components/icons/Glyphs';
import { PAClip } from '../src/components/paper/PAClip';
import { PASticker } from '../src/components/paper/PASticker';
import { FolderTab } from '../src/components/paper/PaperSheet';
import { RadarChart } from '../src/components/paper/insights/RadarChart';
import { EnergyRadial } from '../src/components/paper/insights/EnergyRadial';
import { MoodBarChart } from '../src/components/paper/insights/MoodBarChart';
import { useTheme } from '../src/theme/ThemeProvider';
import { useInsightsAll, useInsightFeedback, useMoods, useProfile } from '../src/hooks/queries';
import { useMonthlyPriceLabel } from '../src/hooks/useBilling';
import { useToast } from '../src/components/Toast';
import { useGoBack } from '../src/hooks/useGoBack';
import { findMood } from '../src/lib/mood';
import { errorMessageKey } from '../src/api/errors';
import type { InsightPattern, InsightReaction } from '../src/api/types';

const AI_TINT = '#F3ECF9';
const TAG_META: Record<string, { icon: string; bg: string }> = {
  pattern: { icon: '📌', bg: '#FCA45B' },
  correlation: { icon: '↗', bg: '#A673F1' },
  alert: { icon: '⚠️', bg: '#F26B6B' },
};

/** ISO-8601 week key (YYYY-Www) for a given date. */
function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export default function InsightsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const goBack = useGoBack();
  const toast = useToast();

  const profile = useProfile();
  const premium = profile.data?.user.isPremium ?? false;
  const monthlyPrice = useMonthlyPriceLabel();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekParam = weekOffset === 0 ? undefined : isoWeekKey(new Date(Date.now() + weekOffset * 7 * 86400000));
  const q = useInsightsAll(i18n.language, weekParam, premium);
  const moods = useMoods();
  const feedback = useInsightFeedback();
  const [expanded, setExpanded] = useState(false);
  const [reacted, setReacted] = useState<InsightReaction | null>(null);

  const d = q.data;
  const goPro = () => router.push('/profile/subscription');

  const react = async (r: InsightReaction) => {
    if (!d?.suggestion || reacted) return;
    setReacted(r);
    try {
      await feedback.mutateAsync({ weekKey: d.weekKey, suggestionTitle: d.suggestion.title, reaction: r });
      toast.show(t('insights.thanks'));
    } catch (e) {
      setReacted(null);
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80 }}>
      {/* back + sub-tabs */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Pressable onPress={goBack} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
          <Text weight="bold" style={{ fontSize: 22, lineHeight: 26, color: colors.ink2 }}>‹</Text>
        </Pressable>
        <SubTab label={`✨ ${t('insights.tabInsights')}`} active onPress={() => {}} />
        <SubTab label={`💬 ${t('insights.tabAsk')}`} active={false} onPress={() => router.push('/ask-ai')} />
      </View>

      {!premium ? (
        <FreeGate />
      ) : q.isLoading ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : d ? (
        <>
          {/* header */}
          <View style={{ gap: 4 }}>
            <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('insights.eyebrow', { n: d.weekKey?.split('W')[1] ?? '' })}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
              <Text variant="h1" style={{ flexShrink: 1 }}>{t('insights.weekHeading')}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <NavPill label={t('insights.prevWeek')} onPress={() => { setWeekOffset((o) => o - 1); setReacted(null); }} />
                {weekOffset < 0 ? <NavPill label={t('insights.nextWeek')} onPress={() => { setWeekOffset((o) => o + 1); setReacted(null); }} /> : null}
              </View>
            </View>
          </View>

          {!d.status.ready ? (
            d.status.entryCount < 7
              ? <CenterState emoji="📝" title={t('insights.tooFewTitle')} body={t('insights.tooFewBody')} />
              : <CenterState emoji="🔮" title={t('insights.emptyTitle')} body={t('insights.emptyBody')} />
          ) : (
            <>
              {/* disclaimer note */}
              <View style={{ backgroundColor: AI_TINT, borderRadius: radius.md, padding: space.md, flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                <SparkleIcon size={16} color={brand.purple} />
                <Text variant="label" color={colors.ink2} style={{ flex: 1, lineHeight: 21 }}>{t('insights.disclaimer')}</Text>
              </View>

              {/* hero recap */}
              <View>
                <FolderTab label={t('insights.heroTab')} bg={brand.purple} fg="#fff" />
                <View>
                  <View style={{ position: 'absolute', top: -22, right: 28, zIndex: 6 }}><PAClip /></View>
                  <LinearGradient
                    colors={['#A673F1', '#C89BF5', '#FCA45B']}
                    locations={[0, 0.4, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ ...sheetRadius, borderTopLeftRadius: 0, padding: space.xl, gap: space.lg, boxShadow: shadow.md }}
                  >
                    <RichText text={d.headline} color="#fff" style={{ fontSize: 20, lineHeight: 29, fontWeight: '700' }} />
                    {expanded ? <Text variant="body" color="rgba(255,255,255,0.92)" style={{ lineHeight: 25 }}>{d.summary}</Text> : null}
                    <View style={{ flexDirection: 'row', gap: space.sm }}>
                      <GlassBtn label={expanded ? t('insights.showLess') : t('insights.readFull')} onPress={() => setExpanded((e) => !e)} />
                      <GlassBtn label={t('insights.shareWeek')} onPress={() => Share.share({ message: d.summary || d.headline }).catch(() => {})} />
                    </View>
                    {/* 2×2 glass tiles */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      <GlassTile label={t('insights.tileAvg')} value={String(d.stats.avgMood)} delta={d.stats.avgMoodDelta} />
                      <GlassTile label={t('insights.tileGood')} value={`${d.stats.goodDays}/7`} />
                      <GlassTile label={t('insights.tilePattern')} value={String(d.stats.patternsCount)} />
                      <GlassTile label={t('insights.tileWellness')} value={String(d.stats.wellnessScore)} delta={d.stats.wellnessDelta} />
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* 4-feature grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
                <Feature emoji="🔮" label={t('insights.forecast')} accent={brand.purpleStrong}>
                  {d.forecast ? (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                        <PASticker color={findMood(moods.data, d.forecast.predictedMood)?.color ?? brand.purple} moodId={d.forecast.predictedMood} size={28} />
                        <Text weight="extrabold" style={{ fontSize: 18 }}>{Math.round(d.forecast.confidence * 100)}%</Text>
                      </View>
                      <View style={{ gap: 2 }}>
                        {(d.forecast.factors ?? []).slice(0, 3).map((f, i) => (
                          <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <Text variant="label" weight="bold" color={f.direction === '+' ? '#2DA963' : '#E05A5A'}>{f.direction === '+' ? '+' : '−'}</Text>
                            <Text variant="label" color={colors.ink2} numberOfLines={1} style={{ flex: 1 }}>{f.label}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  ) : <Generating />}
                </Feature>

                <Feature emoji="🧬" label={t('insights.moodDna')} accent="#1B7A5A">
                  {d.dna ? (
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <RadarChart axes={d.dna.axes} />
                      <Text variant="label" weight="bold" center>{d.dna.archetype}</Text>
                    </View>
                  ) : <Generating />}
                </Feature>

                <Feature emoji="🔁" label={t('insights.themesTitle')} accent={brand.purpleStrong}>
                  {d.themes?.themes?.length ? (
                    <View style={{ gap: 8 }}>
                      {d.themes.themes.slice(0, 5).map((th, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: th.color }} />
                          <Text variant="label" weight="medium" numberOfLines={1} style={{ flex: 1 }}>{th.label}</Text>
                          <Text variant="label" color={colors.ink3}>{th.count}×</Text>
                        </View>
                      ))}
                    </View>
                  ) : <Generating />}
                </Feature>

                <Feature emoji="⏰" label={t('insights.energyClock')} accent={brand.purpleStrong}>
                  {d.energy ? (
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <EnergyRadial hourly={d.energy.hourly} peakLabel={`${String(d.energy.peakHour).padStart(2, '0')}:00`} />
                      <Text variant="label" color={colors.ink3}>{t('insights.peakAt', { h: `${String(d.energy.peakHour).padStart(2, '0')}:00` })}</Text>
                    </View>
                  ) : <Generating />}
                </Feature>
              </View>

              {/* pattern cards */}
              {d.patterns?.slice(0, 3).map((p, i) => <PatternCard key={i} p={p} />)}

              {/* suggestion */}
              {d.suggestion ? (
                <View>
                  <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 6 }}>
                    <View style={{ width: 88, height: 24, borderRadius: 2, backgroundColor: 'rgba(253,203,86,0.6)', transform: [{ rotate: '-3deg' }] }} />
                  </View>
                  <LinearGradient colors={['#FFF6EA', '#FDEFE0']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ ...sheetRadius, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                      <Text style={{ fontSize: 18 }}>💡</Text>
                      <View style={{ backgroundColor: brand.peach, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text variant="label" weight="bold" color="#fff" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('insights.suggestionBadge')}</Text>
                      </View>
                    </View>
                    <Text variant="title">{d.suggestion.title}</Text>
                    <Text variant="body" color={colors.ink2} style={{ lineHeight: 24 }}>{d.suggestion.description}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: space.xs }}>
                      <FeedbackPill label={`👍 ${t('insights.helpful')}`} active={reacted === 'up'} disabled={!!reacted} onPress={() => react('up')} />
                      <FeedbackPill label={`👎 ${t('insights.notHelpful')}`} active={reacted === 'down'} disabled={!!reacted} onPress={() => react('down')} />
                    </View>
                  </LinearGradient>
                </View>
              ) : null}
            </>
          )}

        </>
      ) : null}
    </Screen>
  );

  // ---- helpers ----
  function SubTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? colors.ink : colors.surface, boxShadow: active ? '0 6px 0 -2px #000' : shadow.sm }}>
        <Text variant="label" weight="bold" color={active ? '#fff' : colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function NavPill({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.surface, boxShadow: shadow.sm }}>
        <Text variant="label" weight="bold" color={colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function GlassBtn({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 }}>
        <Text variant="label" weight="bold" color="#fff">{label}</Text>
      </Pressable>
    );
  }

  function GlassTile({ label, value, delta }: { label: string; value: string; delta?: number }) {
    return (
      <View style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 12, gap: 2 }}>
        <Text variant="label" weight="medium" color="rgba(255,255,255,0.9)">{label}</Text>
        <Text weight="extrabold" style={{ fontSize: 22, color: '#fff' }}>{value}</Text>
        {typeof delta === 'number' && delta !== 0 ? (
          <Text variant="label" weight="bold" style={{ color: delta > 0 ? '#B8FFD8' : '#FFD8D8' }}>{delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}</Text>
        ) : null}
      </View>
    );
  }

  function Feature({ emoji, label, accent, children }: { emoji: string; label: string; accent: string; children: ReactNode }) {
    return (
      <View style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm, boxShadow: shadow.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
          <Text variant="label" weight="bold" color={accent}>{label}</Text>
        </View>
        {children}
      </View>
    );
  }

  function Generating() {
    return (
      <View style={{ alignItems: 'center', paddingVertical: space.lg, gap: 6 }}>
        <Text style={{ fontSize: 22 }}>✨</Text>
        <Text variant="label" color={colors.ink3} center>{t('insights.generating')}</Text>
      </View>
    );
  }

  function PatternCard({ p }: { p: InsightPattern }) {
    const meta = TAG_META[p.tag] ?? TAG_META.pattern;
    return (
      <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.xl, gap: space.sm, boxShadow: shadow.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: meta.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 13 }}>{meta.icon}</Text>
          <Text variant="label" weight="bold" color="#fff" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.tag}</Text>
        </View>
        <Text variant="title">{p.title}</Text>
        <Text variant="body" color={colors.ink2} style={{ lineHeight: 23 }}>{p.description}</Text>
        {p.miniVizData && p.miniVizData.length ? <MoodBarChart data={p.miniVizData} /> : null}
      </View>
    );
  }

  function FeedbackPill({ label, active, disabled, onPress }: { label: string; active: boolean; disabled: boolean; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 9,
          backgroundColor: active ? AI_TINT : colors.surface,
          borderWidth: 1.5,
          borderColor: active ? brand.purple : colors.hairline2,
          opacity: disabled && !active ? 0.5 : 1,
        }}
      >
        <Text variant="label" weight="bold" color={active ? brand.purpleStrong : colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function CenterState({ emoji, title, body }: { emoji: string; title: string; body: string }) {
    return (
      <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.x2, alignItems: 'center', gap: space.sm, boxShadow: shadow.md }}>
        <Text style={{ fontSize: 44 }}>{emoji}</Text>
        <Text variant="h2" center>{title}</Text>
        <Text variant="body" color={colors.ink2} center>{body}</Text>
      </View>
    );
  }

  function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
      <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
        <Text style={{ fontSize: 44 }}>😵</Text>
        <Text variant="h2" center>{t('insights.errorTitle')}</Text>
        <Button variant="purple" label={t('common.retry')} onPress={onRetry} />
      </View>
    );
  }

  function LoadingSkeleton() {
    const Block = ({ h, bg }: { h: number; bg?: string }) => <View style={{ height: h, borderRadius: radius.lg, backgroundColor: bg ?? colors.surface2, opacity: 0.6 }} />;
    return (
      <View style={{ gap: space.lg }}>
        <Block h={36} />
        <Block h={240} bg={AI_TINT} />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}><Block h={120} /></View>
          <View style={{ flex: 1 }}><Block h={120} /></View>
        </View>
        <Block h={180} />
      </View>
    );
  }

  function FreeGate() {
    const bullets = t('insights.freeBullets').split('|');
    return (
      <View style={{ gap: space.lg }}>
        <View style={{ gap: 4 }}>
          <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>✨ AI INSIGHTS</Text>
          <Text variant="h1">{t('insights.freeTitle')}</Text>
        </View>

        {/* CTA folder */}
        <View>
          <FolderTab label={`✨ ${t('subscription.pro')}`} bg={brand.purple} fg="#fff" />
          <View>
            <View style={{ position: 'absolute', top: -20, right: 26, zIndex: 6 }}><PAClip /></View>
            <LinearGradient colors={['#F9A870', '#C89BF5', '#A673F1']} locations={[0, 0.5, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ ...sheetRadius, borderTopLeftRadius: 0, padding: space.xl, gap: space.md, boxShadow: shadow.md }}>
              <Text variant="h2" color="#fff">{t('insights.freeTitle')}</Text>
              <View style={{ gap: 8 }}>
                {bullets.map((b, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 15 }}>✓</Text>
                    <Text variant="label" weight="medium" color="#fff" style={{ flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={goPro} style={{ backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: space.xs }}>
                <Text variant="label" weight="extrabold" color={brand.purpleStrong}>{t('insights.freeSubscribe')}</Text>
              </Pressable>
              <Text variant="label" weight="bold" color="rgba(255,255,255,0.9)" center>{t('insights.freePrice', { price: monthlyPrice })}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* blurred teaser */}
        <View style={{ opacity: 0.5 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.xl, gap: space.sm, boxShadow: shadow.sm }}>
            <Text variant="label" weight="bold" color={brand.purpleStrong}>🔮 {t('insights.forecast')}</Text>
            <Text variant="body" color={colors.ink3}>{t('insights.weeklyTeaser')}</Text>
          </View>
        </View>
      </View>
    );
  }
}
