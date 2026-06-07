/**
 * Entry detail (/entry/[id]) — "Paper Desk" design (handoff entry-detail spec).
 * Top bar → mood hero folder → note / AI insight / flashback / photo / location /
 * tags / delete → rail (nearby days · last month · streak). Single-column stack.
 * GET /api/log/[id]. functionality unchanged; this is the design pass.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { PaperSheet } from '../../src/components/paper/PaperSheet';
import { PASticker } from '../../src/components/paper/PASticker';
import { LocationPill } from '../../src/components/paper/LocationPill';
import { SparkleIcon } from '../../src/components/icons/Glyphs';
import { useToast } from '../../src/components/Toast';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useEntry, useMoods, useActivities, useDeleteEntry } from '../../src/hooks/queries';
import { findMood, moodLabel } from '../../src/lib/mood';
import { ictClock, timeOfDay } from '../../src/lib/time';
import { stripBold } from '../../src/lib/text';
import { APP_TIMEZONE } from '../../src/config';
import { errorMessageKey } from '../../src/api/errors';
import type { Mood } from '../../src/api/types';

function fmt(dateKey: string, locale: string, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      ...opts,
      timeZone: APP_TIMEZONE,
    }).format(new Date(`${dateKey}T00:00:00+07:00`));
  } catch {
    return dateKey;
  }
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const entry = useEntry(id);
  const moods = useMoods();
  const activities = useActivities();
  const del = useDeleteEntry();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const d = entry.data;
  const mood = findMood(moods.data, d?.moodTypeId);
  const accent = mood?.color ?? colors.primary;
  const lang = i18n.language;
  const activity = activities.data?.find((a) => a.id === d?.activityId);

  const onDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await del.mutateAsync(id);
      router.back();
      toast.show(t('entry.deleted'));
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80 }}>
      {/* top bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <Text variant="label" weight="bold" color={colors.ink2}>← {t('common.back')}</Text>
        </Pressable>
        {d ? (
          <Pressable
            onPress={() => router.push(`/entry/${id}/edit`)}
            accessibilityRole="button"
            style={{
              backgroundColor: colors.surface,
              borderRadius: 11,
              height: 38,
              paddingHorizontal: 16,
              justifyContent: 'center',
              boxShadow: '0 5px 14px -8px rgba(60,40,20,0.4)',
            }}
          >
            <Text variant="label" weight="bold" color={colors.ink2}>✎ {t('entry.edit')}</Text>
          </Pressable>
        ) : null}
      </View>

      {entry.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : entry.isError ? (
        <Notice message={t(errorMessageKey(entry.error))} tone="error" />
      ) : d ? (
        <>
          {/* mood hero folder */}
          <PaperSheet
            tab={fmt(d.date, lang, { weekday: 'long', day: 'numeric', month: 'short' })}
            tabColor={brand.lavender}
            tabTextColor={colors.ink}
            clip
            clipSide="right"
          >
            {/* mood glow */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 170,
                height: 170,
                borderRadius: 85,
                backgroundColor: accent,
                opacity: 0.22,
              }}
            />
            <View style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={{ transform: [{ rotate: '-6deg' }] }}>
                  <PASticker color={accent} moodId={mood?.id} pack={undefined} size={64} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="h2">{moodLabel(mood, lang)}</Text>
                  <Text variant="label" color={colors.ink2}>
                    {fmt(d.date, lang, { weekday: 'long' })} · {ictClock(d.createdAt)} ·{' '}
                    {t(`timeOfDay.${timeOfDay(d.createdAt)}`)}
                  </Text>
                </View>
              </View>

              {/* big date */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                <Text style={{ fontSize: 56, lineHeight: 58, fontFamily: 'Urbanist_800ExtraBold', color: colors.ink }}>
                  {fmt(d.date, lang, { day: 'numeric' })}
                </Text>
                <Text
                  style={{
                    fontSize: 30,
                    fontStyle: 'italic',
                    fontFamily: 'Urbanist_800ExtraBold',
                    color: colors.ink2,
                    marginBottom: 6,
                  }}
                >
                  {fmt(d.date, lang, { month: 'short' })}
                </Text>
                <Text variant="body" color={colors.ink3} style={{ marginBottom: 9 }}>
                  {fmt(d.date, lang, { year: 'numeric' })}
                </Text>
              </View>

              {/* entry no + activity */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
                <Text variant="label" weight="bold" color={colors.ink3} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('entry.entryNo', { n: d.entryNumber })}
                </Text>
                {activity || d.activityEmoji ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: colors.surface3,
                      borderRadius: radius.pill,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{activity?.emoji ?? d.activityEmoji}</Text>
                    {activity ? (
                      <Text variant="label" weight="medium" color={colors.ink2}>
                        {lang === 'th' ? activity.labelTh : activity.label}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          </PaperSheet>

          {/* note */}
          {d.note ? (
            <PaperSheet washi washiColor={'rgba(252,164,91,0.5)'}>
              <Text variant="label" weight="bold" color={colors.ink3} style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {t('entry.note')}
              </Text>
              <Text variant="body" style={{ lineHeight: 26 }}>{d.note}</Text>
            </PaperSheet>
          ) : null}

          {/* AI insight */}
          {d.aiSummary ? (
            <PaperSheet washi washiColor={'rgba(253,203,86,0.65)'} style={{ marginTop: space.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <SparkleIcon size={14} color={brand.purpleStrong} />
                <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {t('entry.aiNoticed')}
                </Text>
              </View>
              <Text variant="body" style={{ lineHeight: 24 }}>{stripBold(d.aiSummary)}</Text>
              <Text variant="label" color={colors.ink3} style={{ marginTop: 8 }}>
                {t('insights.disclaimer')}
              </Text>
            </PaperSheet>
          ) : null}

          {/* flashback (premium) / teaser */}
          {d.flashback ? (
            <PaperSheet washi washiColor={'rgba(212,190,228,0.75)'}>
              <Text variant="label" weight="bold" color={'#5B8FA8'} style={{ marginBottom: 6 }}>
                🕰 {t('entry.lookBack')}
              </Text>
              <Text variant="body" style={{ lineHeight: 24 }}>{stripBold(d.flashback.message)}</Text>
              <Text variant="label" color={colors.ink3} style={{ marginTop: 6 }}>
                {fmt(d.flashback.pastDate, lang, { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </PaperSheet>
          ) : !d.isPremium ? (
            <View
              style={{
                backgroundColor: colors.surface2,
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderColor: colors.hairline2,
                borderStyle: 'dashed',
                padding: space.lg,
                gap: 4,
              }}
            >
              <Text variant="label" weight="bold" color={brand.purpleStrong}>🕰 {t('entry.unlockPro')}</Text>
              <Text variant="body" color={colors.ink2}>{t('entry.flashbackTeaser')}</Text>
            </View>
          ) : null}

          {/* photo */}
          {d.imageUrl ? (
            <PaperSheet clip clipSide="right" style={{ marginTop: space.xs }}>
              <Image
                source={{ uri: d.imageUrl }}
                style={{ width: '100%', height: 240, borderRadius: radius.md }}
                resizeMode="cover"
              />
            </PaperSheet>
          ) : null}

          {/* location */}
          {d.location ? (
            <LocationPill name={d.location} lat={d.locationLat} lng={d.locationLng} maxWidth={300} />
          ) : null}

          {/* tags */}
          {d.tags.length ? (
            <View style={{ gap: space.sm }}>
              <Text variant="label" weight="bold" color={colors.ink3} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {t('entry.tagsLabel')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {d.tags.map((tag) => (
                  <View key={tag} style={{ backgroundColor: colors.surface3, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Text variant="label" weight="medium" color={colors.ink2}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* rail: nearby days */}
          {d.nearby.length ? (
            <PaperSheet tab={t('entry.nearby')} tabColor={colors.ink} tabTextColor="#fff" style={{ marginTop: space.sm }}>
              <View style={{ gap: space.md }}>
                {d.nearby.map((n) => {
                  const nm = findMood(moods.data, n.moodTypeId);
                  const isThis = n.date === d.date;
                  return (
                    <View key={n.date} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                      <PASticker color={nm?.color ?? colors.ink3} moodId={nm?.id} size={isThis ? 34 : 26} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text variant="label" weight={isThis ? 'bold' : 'medium'} color={isThis ? colors.ink : colors.ink2}>
                            {fmt(n.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })}
                          </Text>
                          {isThis ? (
                            <View style={{ backgroundColor: brand.purple, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                              <Text variant="label" weight="bold" color="#fff" style={{ fontSize: 14 }}>{t('entry.thisEntry')}</Text>
                            </View>
                          ) : null}
                        </View>
                        {n.note ? (
                          <Text variant="label" color={colors.ink3} numberOfLines={1}>{n.note}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </PaperSheet>
          ) : null}

          {/* rail: last month */}
          {d.lastYear ? (
            <RailLastMonth date={d.lastYear.date} mood={findMood(moods.data, d.lastYear.moodTypeId)} lang={lang} />
          ) : null}

          {/* rail: streak */}
          {d.streak > 1 ? (
            <PaperSheet washi washiColor={'rgba(252,164,91,0.5)'}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>🔥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="title">{t('entry.streakDay', { n: d.streak })}</Text>
                  <Text variant="label" color={colors.ink3}>{t('entry.streakKeepGoing')}</Text>
                </View>
              </View>
            </PaperSheet>
          ) : null}

          {/* delete (2-step) */}
          <Pressable onPress={onDelete} hitSlop={8} style={{ alignSelf: 'center', paddingVertical: space.md }}>
            <Text variant="label" weight="bold" color={confirmDelete ? colors.danger : colors.ink3}>
              {confirmDelete ? `✓ ${t('entry.confirmDelete')}` : `× ${t('entry.deleteThis')}`}
            </Text>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

function RailLastMonth({ date, mood, lang }: { date: string; mood?: Mood; lang: string }) {
  const { t, i18n } = useTranslation();
  const { colors, brand, space } = useTheme();
  return (
    <PaperSheet tab={t('entry.lastMonth')} tabColor={brand.mint} tabTextColor={colors.ink}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <PASticker color={mood?.color ?? colors.ink3} moodId={mood?.id} size={36} />
        <View style={{ flex: 1 }}>
          <Text variant="label" weight="bold">
            {fmt(date, i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
          <Text variant="label" color={colors.ink2}>{moodLabel(mood, lang)}</Text>
        </View>
      </View>
    </PaperSheet>
  );
}
