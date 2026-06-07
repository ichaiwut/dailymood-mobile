/**
 * Mood picker. Two layouts:
 *  - 'scroll' (default): horizontal rounded-square tiles (Smart Log, Edit).
 *  - 'grid': wrapping circular sticker discs + labels (Today greeting, web-style).
 */
import { ScrollView, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { PASticker } from './paper/PASticker';
import { useTheme } from '../theme/ThemeProvider';
import { moodLabel } from '../lib/mood';
import type { Mood } from '../api/types';

export interface MoodPickerProps {
  moods: Mood[];
  selectedId?: string | null;
  onSelect: (mood: Mood) => void;
  layout?: 'scroll' | 'grid';
}

export function MoodPicker({ moods, selectedId, onSelect, layout = 'scroll' }: MoodPickerProps) {
  const { i18n } = useTranslation();
  const { colors, radius, space } = useTheme();

  if (layout === 'grid') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, justifyContent: 'space-between' }}>
        {moods.map((m) => {
          const selected = m.id === selectedId;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={moodLabel(m, i18n.language)}
              onPress={() => onSelect(m)}
              style={{ width: '18%', minWidth: 60, alignItems: 'center', gap: 5 }}
            >
              <View
                style={
                  selected
                    ? { borderRadius: 999, borderWidth: 2, borderColor: colors.ink, padding: 2 }
                    : { padding: 2 }
                }
              >
                <PASticker color={m.color} moodId={m.id} size={52} />
              </View>
              <Text variant="label" weight={selected ? 'bold' : 'medium'} center numberOfLines={1}>
                {moodLabel(m, i18n.language)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: space.md, paddingVertical: 2 }}>
        {moods.map((m) => {
          const selected = m.id === selectedId;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={moodLabel(m, i18n.language)}
              onPress={() => onSelect(m)}
              style={{
                width: 76,
                alignItems: 'center',
                gap: 6,
                paddingVertical: space.md,
                paddingHorizontal: space.xs,
                borderRadius: radius.md,
                backgroundColor: selected ? colors.surface : colors.surface2,
                borderWidth: 2,
                borderColor: selected ? colors.ink : 'transparent',
              }}
            >
              <PASticker color={m.color} moodId={m.id} size={46} />
              <Text variant="label" weight={selected ? 'bold' : 'medium'} center numberOfLines={1}>
                {moodLabel(m, i18n.language)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
