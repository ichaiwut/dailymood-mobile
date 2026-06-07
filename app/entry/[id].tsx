/**
 * Entry detail (/entry/[id]). Mood hero folder + note + AI insight + flashback
 * (premium; free sees a teaser, never hidden) + tags + nearby days. Top bar has
 * back / edit; delete confirms in a bottom sheet. GET /api/log/[id].
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Notice } from '../../src/components/Notice';
import { BottomSheet } from '../../src/components/BottomSheet';
import { PASticker } from '../../src/components/paper/PASticker';
import { WashiTape } from '../../src/components/paper/WashiTape';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useEntry, useMoods, useDeleteEntry } from '../../src/hooks/queries';
import { findMood, moodLabel } from '../../src/lib/mood';
import { formatDateKey } from '../../src/lib/time';
import { stripBold } from '../../src/lib/text';
import { errorMessageKey } from '../../src/api/errors';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();
  const entry = useEntry(id);
  const moods = useMoods();
  const del = useDeleteEntry();
  const [confirming, setConfirming] = useState(false);

  const mood = findMood(moods.data, entry.data?.moodTypeId);
  const accent = mood?.color ?? colors.primary;

  const onDelete = async () => {
    try {
      await del.mutateAsync(id);
      setConfirming(false);
      router.back();
    } catch {
      setConfirming(false);
    }
  };

  return (
    <>
      <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
        {/* top bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text variant="title" color={colors.ink}>‹</Text>
          </Pressable>
          {entry.data ? (
            <Pressable onPress={() => router.push(`/entry/${id}/edit`)} hitSlop={10}>
              <Text variant="label" color={colors.primary}>{t('entry.edit')}</Text>
            </Pressable>
          ) : null}
        </View>

        {entry.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
        ) : entry.isError ? (
          <Notice message={t(errorMessageKey(entry.error))} tone="error" />
        ) : entry.data ? (
          <>
            {/* mood hero folder */}
            <View>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: accent,
                  borderTopLeftRadius: radius.md,
                  borderTopRightRadius: radius.md,
                  paddingHorizontal: space.lg,
                  paddingVertical: 6,
                  marginBottom: -2,
                }}
              >
                <Text variant="eyebrow" color="#fff">
                  {t('entry.entryNo', { n: entry.data.entryNumber })}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: 0,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.hairline,
                  padding: space.xl,
                  gap: space.md,
                  alignItems: 'center',
                  shadowColor: colors.paperShadow,
                  shadowOffset: { width: 6, height: 8 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 6,
                }}
              >
                <PASticker color={accent} emoji={mood?.emoji ?? '🙂'} size={72} halo />
                <Text variant="title">{moodLabel(mood, i18n.language)}</Text>
                <Text variant="body" color={colors.ink2}>
                  {formatDateKey(entry.data.date, i18n.language)}
                </Text>
              </View>
            </View>

            {/* note */}
            {entry.data.note ? (
              <Sheet title={t('entry.note')} accent={brand.peach}>
                <Text variant="body">{entry.data.note}</Text>
              </Sheet>
            ) : null}

            {/* image */}
            {entry.data.imageUrl ? (
              <Image
                source={{ uri: entry.data.imageUrl }}
                style={{ width: '100%', height: 220, borderRadius: radius.lg }}
                resizeMode="cover"
              />
            ) : null}

            {/* AI insight */}
            {entry.data.aiSummary ? (
              <Sheet title={t('entry.aiInsight')} accent={brand.purple}>
                <Text variant="body">{stripBold(entry.data.aiSummary)}</Text>
              </Sheet>
            ) : null}

            {/* flashback (premium) / teaser */}
            {entry.data.flashback ? (
              <Sheet title={t('entry.flashback')} accent={brand.blue}>
                <Text variant="body">{stripBold(entry.data.flashback.message)}</Text>
                <Text variant="label" color={colors.ink3} style={{ marginTop: 6 }}>
                  {formatDateKey(entry.data.flashback.pastDate, i18n.language)}
                </Text>
              </Sheet>
            ) : !entry.data.isPremium ? (
              <View
                style={{
                  borderRadius: radius.lg,
                  borderWidth: 1.5,
                  borderColor: colors.hairline2,
                  borderStyle: 'dashed',
                  padding: space.lg,
                  gap: 4,
                }}
              >
                <Text variant="label" color={colors.primary}>✦ {t('entry.flashback')} · PREMIUM</Text>
                <Text variant="body" color={colors.ink2}>{t('entry.flashbackTeaser')}</Text>
              </View>
            ) : null}

            {/* tags */}
            {entry.data.tags.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {entry.data.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: colors.surface2,
                      borderRadius: radius.pill,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}
                  >
                    <Text variant="label" weight="medium" color={colors.ink2}>#{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* delete */}
            <Button
              variant="paper"
              label={t('entry.delete')}
              onPress={() => setConfirming(true)}
              style={{ marginTop: space.md }}
            />
          </>
        ) : null}
      </Screen>

      {/* delete confirm */}
      <BottomSheet visible={confirming} onClose={() => setConfirming(false)}>
        <View style={{ gap: space.lg, paddingBottom: space.md }}>
          <Text variant="h2">{t('entry.deleteConfirm')}</Text>
          <Text variant="body" color={colors.ink2}>{t('entry.deleteConfirmBody')}</Text>
          <Button label={t('entry.delete')} onPress={onDelete} loading={del.isPending} />
          <Button variant="paper" label={t('common.cancel')} onPress={() => setConfirming(false)} />
        </View>
      </BottomSheet>
    </>
  );

  function Sheet({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
      <View>
        <View style={{ marginLeft: space.lg, marginBottom: -10, zIndex: 1 }}>
          <WashiTape color={accent + 'AA'} rotate={-3} width={70} />
        </View>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: space.lg,
            gap: 6,
            shadowColor: colors.paperShadow,
            shadowOffset: { width: 4, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
          }}
        >
          <Text variant="label" color={colors.ink3}>{title}</Text>
          {children}
        </View>
      </View>
    );
  }
}
