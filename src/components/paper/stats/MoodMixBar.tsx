/**
 * Mood mix — a full-width proportion bar coloured by mood, plus a top-moods
 * legend with percentages. Driven by the stats `distribution` map.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useTheme } from '../../../theme/ThemeProvider';
import { findMood, moodLabel } from '../../../lib/mood';
import type { Mood } from '../../../api/types';

export function MoodMixBar({
  distribution,
  moods,
}: {
  distribution: Record<string, number>;
  moods: Mood[];
}) {
  const { i18n } = useTranslation();
  const { colors, radius, space } = useTheme();

  const items = Object.entries(distribution)
    .map(([moodId, count]) => ({ mood: findMood(moods, moodId), count }))
    .filter((x) => x.mood && x.count > 0)
    .sort((a, b) => b.count - a.count) as { mood: Mood; count: number }[];

  const total = items.reduce((s, x) => s + x.count, 0);
  if (total === 0) return null;

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden' }}>
        {items.map(({ mood, count }) => (
          <View key={mood.id} style={{ flex: count, backgroundColor: mood.color }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {items.slice(0, 4).map(({ mood, count }) => (
          <View key={mood.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: mood.color }} />
            <Text variant="label" weight="medium" color={colors.ink2}>
              {moodLabel(mood, i18n.language)} {Math.round((count / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
