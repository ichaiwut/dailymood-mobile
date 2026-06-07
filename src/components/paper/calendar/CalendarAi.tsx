/**
 * Calendar AI — premium monthly summary + patterns feed + ask-AI bar, and the
 * free upsell card (never hidden). GET /api/calendar/ai, POST /api/calendar/ask.
 */
import { useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Text } from '../../Text';
import { RichText } from '../../RichText';
import { SparkleIcon } from '../../icons/Glyphs';
import { useToast } from '../../Toast';
import { useTheme } from '../../../theme/ThemeProvider';
import { useCalendarAi, useAskCalendar } from '../../../hooks/queries';
import { ApiError, errorMessageKey } from '../../../api/errors';
import i18n from '../../../i18n';

const AI_TINT = '#F3ECF9';
const PATTERN_BG = ['#F4EBFE', '#FDE8DA', '#E8F4FD', '#F0FDF4'];

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
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: brand.purple, alignItems: 'center', justifyContent: 'center' }}>
        <SparkleIcon size={16} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.aiUpsellTitle')}</Text>
        <Text variant="label" color={colors.ink2}>{t('calendar.aiUpsellBody')}</Text>
      </View>
      <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('calendar.upgrade')}</Text>
    </Pressable>
  );
}

/** Premium AI panel for a given month. onPickDate opens that day's sheet. */
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
  const { colors, radius, space, brand, shadow } = useTheme();
  const toast = useToast();
  const aiQ = useCalendarAi(year, month, i18n.language);
  const ask = useAskCalendar();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<{ answer: string; matchingDates: string[] } | null>(null);

  const d = aiQ.data;

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
    <View style={{ gap: space.md }}>
      {/* monthly summary */}
      {d?.summary ? (
        <View style={{ backgroundColor: AI_TINT, borderRadius: radius.lg, padding: space.lg, gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SparkleIcon size={14} color={brand.purpleStrong} />
            <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {t('entry.aiNoticed')}
            </Text>
          </View>
          <RichText text={d.summary} style={{ lineHeight: 22 }} />
          {/* highlight chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {d.highlights?.bestDay ? <Chip text={`${d.highlights.bestDay.emoji} ${t('calendar.bestDay')}`} onPress={() => onPickDate(d.highlights!.bestDay!.date)} /> : null}
            {d.highlights?.hardDay ? <Chip text={`${d.highlights.hardDay.emoji} ${t('calendar.hardDay')}`} onPress={() => onPickDate(d.highlights!.hardDay!.date)} /> : null}
            {d.highlights?.topTag ? <Chip text={`#${d.highlights.topTag}`} /> : null}
          </View>
        </View>
      ) : d?.tooFewEntries ? (
        <View style={{ backgroundColor: colors.surface2, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.hairline2, borderStyle: 'dashed', padding: space.lg }}>
          <Text variant="label" color={colors.ink3}>{t('calendar.aiTooFew')}</Text>
        </View>
      ) : null}

      {/* patterns feed */}
      {d?.patterns?.length ? (
        <View style={{ gap: space.sm }}>
          <Text variant="eyebrow">{t('calendar.patterns')}</Text>
          {d.patterns.map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, boxShadow: shadow.sm }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PATTERN_BG[i % PATTERN_BG.length], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>{p.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" weight="bold">{p.title}</Text>
                <Text variant="label" color={colors.ink2}>{p.explanation}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* ask AI */}
      <View style={{ gap: space.sm }}>
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
            {ask.isPending ? <ActivityIndicator size="small" color="#fff" /> : <SparkleIcon size={15} color={query.trim() ? '#fff' : colors.ink3} />}
          </Pressable>
        </View>
        {answer ? (
          <View style={{ backgroundColor: AI_TINT, borderRadius: radius.md, padding: space.lg, gap: space.sm }}>
            <RichText text={answer.answer} style={{ lineHeight: 22 }} />
            {answer.matchingDates.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {answer.matchingDates.map((dt) => (
                  <Chip key={dt} text={dt.slice(5)} onPress={() => onPickDate(dt)} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );

  function Chip({ text, onPress }: { text: string; onPress?: () => void }) {
    const body = (
      <View style={{ backgroundColor: colors.surface3, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
        <Text variant="label" weight="medium" color={brand.purpleStrong}>{text}</Text>
      </View>
    );
    return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
  }
}
