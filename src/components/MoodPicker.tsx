/**
 * Horizontal row of rounded-square mood tiles (Paper Desk). Tapping selects a
 * mood; the selected tile gets an ink ring. Used in the Smart Log sheet and the
 * greeting picker.
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
}

export function MoodPicker({ moods, selectedId, onSelect }: MoodPickerProps) {
  const { i18n } = useTranslation();
  const { colors, radius, space } = useTheme();

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
              <PASticker color={m.color} emoji={m.emoji} size={46} />
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
