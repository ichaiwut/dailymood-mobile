/**
 * Calendar AI — premium monthly summary + patterns feed + ask-AI section, and the
 * free upsell card (never hidden). GET /api/calendar/ai, POST /api/calendar/ask.
 * Matches the web "{month} · AI สรุป" card + separate "ถาม AI" section.
 */
import { useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Text } from '../../Text';
import { RichText } from '../../RichText';
import { SparkleIcon } from '../../icons/Glyphs';
import { useToast } from '../../Toast';
import { useTheme } from '../../../theme/ThemeProvider';
import { useCalendarAi, useAskCalendar } from '../../../hooks/queries';
import { ApiError, errorMessageKey } from '../../../api/errors';
import { APP_TIMEZONE } from '../../../config';
import i18n from '../../../i18n';

const AI_TINT = '#F3ECF9';
const PATTERN_BG = ['#F4EBFE', '#FDE8DA', '#E8F4FD', '#F0FDF4'];

/** Gradient sparkle square (purple → light) used as the AI card icon. */
function SparkleSquare({ size = 40 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#A673F1', '#C9A6F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
    >
      <SparkleIcon size={size * 0.45} color="#fff" />
    </LinearGradient>
  );
}

/** Free upsell — shown when the user isn't premium. */
export function CalendarAiUpsell() {
  const { t } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/profile/subscription')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: AI_TINT, borderRadius: radius.md, padding: space.lg }}
    >
      <SparkleSquare size={32} />
      <View style={{ flex: 1 }}>
        <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.aiUpsellTitle')}</Text>
        <Text variant="label" color={colors.ink2}>{t('calendar.aiUpsellBody')}</Text>
      </View>
      <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.upgrade')}</Text>
    </Pressable>
  );
}

export function CalendarAiPanel({
  year,
  month,
  onPickDate,
}: {
  year: number;
  month: number;
  onPickDate: (date: string) => void;
}) {
  const { t } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const aiQ = useCalendarAi(year, month, i18n.language);
  const ask = useAskCalendar();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<{ answer: string; matchingDates: string[] } | null>(null);

  const d = aiQ.data;
  // Sparse months fall back to another month's AI — label the card with the
  // month the summary is actually about.
  const dispYear = d?.fallbackMonth ? Number(d.fallbackMonth.slice(0, 4)) : year;
  const dispMonth = d?.fallbackMonth ? Number(d.fallbackMonth.slice(5, 7)) : month;
  const monthName = new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', {
    month: 'long',
    timeZone: APP_TIMEZONE,
  }).format(new Date(Date.UTC(dispYear, dispMonth - 1, 1)));
  const shortDate = (date: string) =>
    new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', timeZone: APP_TIMEZONE }).format(new Date(`${date}T00:00:00+07:00`));

  const submit = async () => {
    const q = query.trim();
    if (!q || ask.isPending) return;
    try {
      const r = await ask.mutateAsync({ query: q, year, month, locale: i18n.language });
      setAnswer(r);
      setQuery('');
    } catch (e) {
      const msg = e instanceof ApiError && e.code === 'rate_limited' ? 'calendar.rateLimited' : errorMessageKey(e);
      toast.show(t(msg), 'error');
    }
  };

  if (aiQ.isLoading) return <ActivityIndicator color={colors.primary} />;

  return (
    <View style={{ gap: space.lg }}>
      {/* monthly summary — only the CURRENT month's own AI (never the backend's
          cross-month fallback) */}
      {d?.summary && !d.tooFewEntries && !d.fallbackMonth ? (
        <View style={{ marginTop: space.xs }}>
          <View style={{ backgroundColor: AI_TINT, ...sheetRadius, padding: space.xl, gap: space.md, boxShadow: shadow.md }}>
            {/* washi tape */}
            <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' }}>
              <View style={{ width: 100, height: 26, borderRadius: 2, backgroundColor: 'rgba(253,203,86,0.65)', transform: [{ rotate: '-3deg' }] }} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <SparkleSquare />
              <Text variant="title" color={brand.purpleStrong}>
                {monthName} · {t('calendar.aiSummaryShort')}
              </Text>
            </View>

            {d.fallbackMonth ? (
              <Text variant="label" color={colors.ink3}>{t('calendar.aiFallbackNote', { month: monthName })}</Text>
            ) : null}

            <RichText text={d.summary} style={{ lineHeight: 24 }} />

            {/* highlight chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {d.highlights?.bestDay ? (
                <Chip emoji={d.highlights.bestDay.emoji} label={t('calendar.bestDay')} meta={shortDate(d.highlights.bestDay.date)} onPress={() => onPickDate(d.highlights!.bestDay!.date)} />
              ) : null}
              {d.highlights?.hardDay ? (
                <Chip emoji={d.highlights.hardDay.emoji} label={t('calendar.hardDay')} meta={shortDate(d.highlights.hardDay.date)} onPress={() => onPickDate(d.highlights!.hardDay!.date)} />
              ) : null}
              {d.highlights?.topTag ? <Chip emoji="🏷️" label={t('calendar.topTagLabel')} meta={d.highlights.topTag} /> : null}
            </View>

            <Pressable onPress={() => router.push('/insights')} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
              <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.seeMore')}</Text>
            </Pressable>
            <Text variant="label" color={colors.ink3}>{t('calendar.aiDisclaimer')}</Text>
          </View>
        </View>
      ) : d?.tooFewEntries || d?.fallbackMonth ? (
        <View style={{ backgroundColor: colors.surface2, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.hairline2, borderStyle: 'dashed', padding: space.lg }}>
          <Text variant="label" color={colors.ink3}>{t('calendar.aiTooFew')}</Text>
        </View>
      ) : null}

      {/* patterns feed (current month only) */}
      {d?.patterns?.length && !d.tooFewEntries && !d.fallbackMonth ? (
        <View style={{ gap: space.sm }}>
          <Text variant="eyebrow">{t('calendar.patternsFound')}</Text>
          {d.patterns.map((p, i) => {
            const target = p.dates?.[0];
            return (
              <Pressable
                key={i}
                onPress={() => target && onPickDate(target)}
                disabled={!target}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, boxShadow: shadow.sm }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PATTERN_BG[i % PATTERN_BG.length], alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{p.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label" weight="bold">{p.title}</Text>
                  <Text variant="label" color={colors.ink2}>{p.explanation}</Text>
                </View>
                {target ? (
                  <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.view')}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* ask AI — its own section */}
      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <SparkleSquare size={34} />
          <Text variant="title">{t('calendar.askTitle')}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.hairline,
            borderRadius: radius.md,
            paddingLeft: 14,
            paddingRight: 6,
            paddingVertical: 6,
          }}
        >
          <SparkleIcon size={15} color={brand.purple} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submit}
            returnKeyType="send"
            placeholder={t('calendar.askPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink, padding: 0 }}
          />
          <Pressable
            onPress={submit}
            disabled={!query.trim() || ask.isPending}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: query.trim() ? brand.purple : colors.surface3, alignItems: 'center', justifyContent: 'center' }}
          >
            {ask.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 16, color: query.trim() ? '#fff' : colors.ink3 }}>→</Text>}
          </Pressable>
        </View>
        {answer ? (
          <View style={{ backgroundColor: AI_TINT, borderRadius: radius.md, padding: space.lg, gap: space.sm }}>
            <RichText text={answer.answer} style={{ lineHeight: 22 }} />
            {answer.matchingDates.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {answer.matchingDates.map((dt) => (
                  <Chip key={dt} label={shortDate(dt)} onPress={() => onPickDate(dt)} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        <Text variant="label" color={colors.ink3}>{t('calendar.askDisclaimer')}</Text>
      </View>
    </View>
  );

  function Chip({ emoji, label, meta, onPress }: { emoji?: string; label: string; meta?: string; onPress?: () => void }) {
    const body = (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.surface,
          borderRadius: radius.pill,
          paddingHorizontal: 12,
          paddingVertical: 8,
          boxShadow: shadow.sm,
        }}
      >
        {emoji ? <Text style={{ fontSize: 14 }}>{emoji}</Text> : null}
        <Text variant="label" weight="bold">{label}</Text>
        {meta ? <Text variant="label" color={colors.ink3}>· {meta}</Text> : null}
      </View>
    );
    return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
  }
}
