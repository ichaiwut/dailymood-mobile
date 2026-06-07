/**
 * Edit entry (/entry/[id]/edit) — "Paper Desk" design (handoff edit-entry spec,
 * mobile layout): loose header → single peach-tab paper-sheet form (mood tiles,
 * date/time field shells, note + counter, location) → inline danger zone, with a
 * fixed bottom Save/Cancel bar. Save → PATCH, Delete → DELETE (confirm).
 * Date/time editing is read-only for now (native picker is a later enhancement).
 */
import { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Button } from '../../../src/components/Button';
import { TextField } from '../../../src/components/TextField';
import { Notice } from '../../../src/components/Notice';
import { MoodPicker } from '../../../src/components/MoodPicker';
import { BottomSheet } from '../../../src/components/BottomSheet';
import { PaperSheet } from '../../../src/components/paper/PaperSheet';
import { LocationField, type LocationValue } from '../../../src/components/paper/LocationField';
import { CalendarIcon, ClockIcon } from '../../../src/components/icons/Glyphs';
import { useToast } from '../../../src/components/Toast';
import { useGoBack } from '../../../src/hooks/useGoBack';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { useEntry, useMoods, useUpdateEntry, useDeleteEntry } from '../../../src/hooks/queries';
import { formatDateKey, ictClock } from '../../../src/lib/time';
import { errorMessageKey } from '../../../src/api/errors';

const NOTE_MAX = 500;

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = useGoBack();
  const toast = useToast();

  const entry = useEntry(id);
  const moods = useMoods();
  const update = useUpdateEntry(id);
  const del = useDeleteEntry();

  const [moodId, setMoodId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [location, setLocation] = useState<LocationValue>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const d = entry.data;

  useEffect(() => {
    if (d) {
      setMoodId(d.moodTypeId);
      setNote(d.note ?? '');
      setTags(d.tags ?? []);
      setLocation(d.location ? { name: d.location, lat: d.locationLat, lng: d.locationLng } : null);
    }
  }, [d]);

  const addTag = () => {
    const v = newTag.trim().replace(/^#/, '');
    if (v && !tags.includes(v)) setTags((ts) => [...ts, v]);
    setNewTag('');
  };

  const onSave = async () => {
    if (!moodId) return;
    setError(null);
    try {
      await update.mutateAsync({
        moodTypeId: moodId,
        note: note.trim(),
        tags,
        location: location?.name ?? null,
        locationLat: location?.lat ?? null,
        locationLng: location?.lng ?? null,
      });
      goBack();
      toast.show(t('entry.saved'));
    } catch (e) {
      setError(t(errorMessageKey(e)));
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  const onDelete = async () => {
    try {
      await del.mutateAsync(id);
      setConfirming(false);
      router.dismissAll?.();
      router.replace('/(tabs)/calendar');
      toast.show(t('entry.deleted'));
    } catch (e) {
      setConfirming(false);
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  const eyebrowStyle = { textTransform: 'uppercase' as const, letterSpacing: 0.6 };

  return (
    <>
      <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
        {entry.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
        ) : entry.isError ? (
          <Notice message={t(errorMessageKey(entry.error))} tone="error" />
        ) : d ? (
          <>
            {/* loose header */}
            <View style={{ gap: 4, marginTop: space.sm }}>
              <Text variant="label" weight="bold" color={colors.ink3} style={eyebrowStyle}>
                {t('entry.editing', { n: d.entryNumber })}
              </Text>
              <Text variant="h2">
                {t('entry.editTitle')} · {formatDateKey(d.date, i18n.language, { year: undefined })}
              </Text>
            </View>

            {error ? <Notice message={error} tone="error" /> : null}

            {/* form sheet */}
            <PaperSheet tab={t('entry.editTitle')} tabColor={brand.peach} tabTextColor="#fff">
              <View style={{ gap: space.xl }}>
                {/* mood */}
                <View style={{ gap: space.sm }}>
                  <Text variant="label" weight="bold" color={colors.ink3} style={eyebrowStyle}>
                    {t('smartlog.pickMood')}
                  </Text>
                  <MoodPicker moods={moods.data ?? []} selectedId={moodId} onSelect={(m) => setMoodId(m.id)} />
                </View>

                {/* date / time (read-only) */}
                <View style={{ gap: space.sm }}>
                  <Text variant="label" weight="bold" color={colors.ink3} style={eyebrowStyle}>
                    {t('entry.dateTime')}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <FieldShell flex={1.6}>
                      <CalendarIcon size={16} color={colors.ink3} />
                      <Text variant="body" color={colors.ink2} numberOfLines={1}>
                        {formatDateKey(d.date, i18n.language)}
                      </Text>
                    </FieldShell>
                    <FieldShell flex={1}>
                      <ClockIcon size={16} color={colors.ink3} />
                      <Text variant="body" color={colors.ink2}>{ictClock(d.createdAt)}</Text>
                    </FieldShell>
                  </View>
                </View>

                {/* note */}
                <View style={{ gap: space.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="label" weight="bold" color={colors.ink3} style={eyebrowStyle}>
                      {t('entry.note')}
                    </Text>
                    <Text variant="label" color={colors.ink3}>{note.length} / {NOTE_MAX}</Text>
                  </View>
                  <TextField
                    value={note}
                    onChangeText={setNote}
                    multiline
                    maxLength={NOTE_MAX}
                    style={{ minHeight: 120, textAlignVertical: 'top' }}
                  />
                </View>

                {/* tags */}
                <View style={{ gap: space.sm }}>
                  <Text variant="label" weight="bold" color={colors.ink3} style={eyebrowStyle}>
                    {t('smartlog.tags')}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map((tag) => (
                      <Pressable
                        key={tag}
                        onPress={() => setTags((ts) => ts.filter((x) => x !== tag))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: colors.surface3,
                          borderRadius: radius.pill,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        <Text variant="label" weight="medium" color={colors.ink2}>#{tag}</Text>
                        <Text variant="label" color={colors.ink3}>✕</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextField
                    placeholder={t('smartlog.addTag')}
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                    autoCapitalize="none"
                  />
                </View>

                {/* location */}
                <View style={{ gap: space.sm }}>
                  <Text variant="label" weight="bold" color={colors.ink3} style={eyebrowStyle}>
                    {t('smartlog.locationAddLabel')}
                  </Text>
                  <LocationField value={location} onChange={setLocation} />
                </View>
              </View>
            </PaperSheet>

            {/* danger zone */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderColor: '#FCA5A5',
                padding: space.lg,
                gap: space.sm,
              }}
            >
              <Text variant="label" weight="bold" color={'#DC2626'} style={eyebrowStyle}>
                {t('entry.dangerZone')}
              </Text>
              <Pressable onPress={() => setConfirming(true)} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
                <Text variant="label" weight="bold" color={'#DC2626'}>× {t('entry.deleteThis')}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </Screen>

      {/* fixed bottom bar */}
      {d ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            gap: space.sm,
            paddingHorizontal: space.lg,
            paddingTop: space.md,
            paddingBottom: insets.bottom + space.md,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.hairline,
          }}
        >
          <Button variant="paper" label={t('common.cancel')} onPress={goBack} style={{ flex: 1 }} />
          <Button label={t('common.save')} onPress={onSave} loading={update.isPending} style={{ flex: 1.6 }} />
        </View>
      ) : null}

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

  function FieldShell({ children, flex }: { children: React.ReactNode; flex: number }) {
    return (
      <View
        style={{
          flex,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: colors.surface2,
          borderWidth: 1.5,
          borderColor: colors.hairline,
          borderRadius: radius.md,
          paddingVertical: 10,
          paddingHorizontal: 14,
        }}
      >
        {children}
      </View>
    );
  }
}
