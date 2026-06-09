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
  pack?: string;
}

export function MoodPicker({ moods, selectedId, onSelect, layout = 'scroll', pack }: MoodPickerProps) {
  const { i18n } = useTranslation();
  const { colors, radius, space, shadow } = useTheme();

  if (layout === 'grid') {
    // 5-column, row-major grid → row 2 fills from the left (matches design).
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg }}>
        {moods.map((m) => {
          const selected = m.id === selectedId;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={moodLabel(m, i18n.language)}
              onPress={() => onSelect(m)}
              style={{ width: '20%', alignItems: 'center', gap: 6 }}
            >
              <View
                style={
                  selected
                    ? { borderRadius: 999, borderWidth: 2, borderColor: colors.ink, padding: 2 }
                    : { padding: 2 }
                }
              >
                <PASticker color={m.color} moodId={m.id} pack={pack} iconKey={m.isDefault ? undefined : m.iconKey} emoji={m.isDefault ? undefined : m.emoji} size={50} />
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
                width: 74,
                alignItems: 'center',
                gap: 6,
                paddingTop: 11,
                paddingBottom: 9,
                paddingHorizontal: space.xs,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.ink : colors.hairline,
                boxShadow: shadow.sm,
                transform: [{ translateY: selected ? -1 : 0 }],
              }}
            >
              <PASticker
                color={m.color}
                moodId={m.id}
                pack={pack}
                iconKey={m.isDefault ? undefined : m.iconKey}
                emoji={m.isDefault ? undefined : m.emoji}
                size={44}
                discBg={selected ? m.color : colors.surface3}
              />
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
