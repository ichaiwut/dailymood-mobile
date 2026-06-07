/**
 * Edit entry (/entry/[id]/edit). Mood + note + tags editable; Save → PATCH,
 * Delete → DELETE (confirm). Date is kept as-is for now (a date picker is a
 * later enhancement). Mirrors the web edit form's core fields.
 */
import { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { Button } from '../../../src/components/Button';
import { TextField } from '../../../src/components/TextField';
import { Notice } from '../../../src/components/Notice';
import { MoodPicker } from '../../../src/components/MoodPicker';
import { BottomSheet } from '../../../src/components/BottomSheet';
import { LocationField, type LocationValue } from '../../../src/components/paper/LocationField';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { useEntry, useMoods, useUpdateEntry, useDeleteEntry } from '../../../src/hooks/queries';
import { formatDateKey } from '../../../src/lib/time';
import { errorMessageKey } from '../../../src/api/errors';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const router = useRouter();

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

  // Prefill once the entry loads.
  useEffect(() => {
    if (entry.data) {
      setMoodId(entry.data.moodTypeId);
      setNote(entry.data.note ?? '');
      setTags(entry.data.tags ?? []);
      setLocation(
        entry.data.location
          ? { name: entry.data.location, lat: entry.data.locationLat, lng: entry.data.locationLng }
          : null,
      );
    }
  }, [entry.data]);

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
      router.back();
    } catch (e) {
      setError(t(errorMessageKey(e)));
    }
  };

  const onDelete = async () => {
    try {
      await del.mutateAsync(id);
      setConfirming(false);
      router.dismissAll?.();
      router.replace('/(tabs)/calendar');
    } catch {
      setConfirming(false);
    }
  };

  return (
    <>
      <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text variant="title" color={colors.ink}>‹</Text>
          </Pressable>
          <Text variant="title">{t('entry.edit')}</Text>
          <View style={{ width: 20 }} />
        </View>

        {entry.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
        ) : entry.isError ? (
          <Notice message={t(errorMessageKey(entry.error))} tone="error" />
        ) : entry.data ? (
          <>
            {error ? <Notice message={error} tone="error" /> : null}

            <Text variant="body" color={colors.ink2}>
              {formatDateKey(entry.data.date, i18n.language)}
            </Text>

            <View style={{ gap: space.sm }}>
              <Text variant="label" color={colors.ink2}>{t('smartlog.pickMood')}</Text>
              <MoodPicker moods={moods.data ?? []} selectedId={moodId} onSelect={(m) => setMoodId(m.id)} />
            </View>

            <TextField
              label={t('entry.note')}
              value={note}
              onChangeText={setNote}
              multiline
              style={{ minHeight: 96, textAlignVertical: 'top' }}
            />

            <View style={{ gap: space.sm }}>
              <Text variant="label" color={colors.ink2}>{t('smartlog.tags')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => setTags((ts) => ts.filter((x) => x !== tag))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.hairline2,
                      borderRadius: radius.pill,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text variant="label" weight="medium">#{tag}</Text>
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

            <View style={{ gap: space.sm }}>
              <Text variant="label" color={colors.ink2}>{t('smartlog.locationAddLabel')}</Text>
              <LocationField value={location} onChange={setLocation} />
            </View>

            <Button label={t('common.save')} onPress={onSave} loading={update.isPending} />
            <Button variant="paper" label={t('entry.delete')} onPress={() => setConfirming(true)} />
          </>
        ) : null}
      </Screen>

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
}
