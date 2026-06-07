/**
 * Timeline feed — reverse-chronological entries for the month, grouped by day,
 * with mood filter chips. Reuses EntryFolderCard for parity with Today.
 */
import { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { Notice } from '../../Notice';
import { EntryFolderCard } from '../EntryFolderCard';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTimeline, useMoods } from '../../../hooks/queries';
import { findMood, moodLabel } from '../../../lib/mood';
import { formatDateKey } from '../../../lib/time';
import { errorMessageKey } from '../../../api/errors';
import type { TimelineEntry } from '../../../api/types';

export function TimelineFeed({
  year,
  month,
  onOpenEntry,
}: {
  year: number;
  month: number;
  onOpenEntry: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const timeline = useTimeline(year, month);
  const moods = useMoods();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = timeline.data ?? [];
    return filter ? list.filter((e) => e.moodTypeId === filter) : list;
  }, [timeline.data, filter]);

  // group by date (already reverse-chron from API)
  const groups = useMemo(() => {
    const map = new Map<string, TimelineEntry[]>();
    for (const e of filtered) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  if (timeline.isLoading) return <ActivityIndicator color={colors.primary} />;
  if (timeline.isError) return <Notice message={t(errorMessageKey(timeline.error))} tone="error" />;

  return (
    <View style={{ gap: space.lg }}>
      {/* mood filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <FilterChip label={t('calendar.allMoods')} active={filter === null} onPress={() => setFilter(null)} />
          {(moods.data ?? []).map((m) => (
            <FilterChip
              key={m.id}
              label={moodLabel(m, i18n.language)}
              dot={m.color}
              active={filter === m.id}
              onPress={() => setFilter(filter === m.id ? null : m.id)}
            />
          ))}
        </View>
      </ScrollView>

      {groups.length === 0 ? (
        <Text variant="body" color={colors.ink3} center style={{ paddingVertical: space.xl }}>
          {t('calendar.emptyMonth')}
        </Text>
      ) : (
        groups.map(([date, dayEntries]) => (
          <View key={date} style={{ gap: space.md }}>
            <Text variant="eyebrow">{formatDateKey(date, i18n.language, { weekday: 'short' })}</Text>
            {dayEntries.map((entry, i) => (
              <EntryFolderCard
                key={entry.id}
                entry={entry}
                mood={findMood(moods.data, entry.moodTypeId)}
                rotate={i % 2 === 0 ? -0.4 : 0.4}
                onPress={() => onOpenEntry(entry.id)}
              />
            ))}
          </View>
        ))
      )}
    </View>
  );

  function FilterChip({
    label,
    active,
    dot,
    onPress,
  }: {
    label: string;
    active: boolean;
    dot?: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: active ? colors.ink : colors.surface,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: active ? colors.ink : colors.hairline2,
          paddingHorizontal: 14,
          paddingVertical: 7,
        }}
      >
        {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
        <Text variant="label" weight="medium" color={active ? '#fff' : colors.ink2}>
          {label}
        </Text>
      </Pressable>
    );
  }
}
