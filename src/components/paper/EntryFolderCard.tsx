/**
 * Entry folder card — a rotated paper sheet with a time-of-day folder tab
 * (เช้า/บ่าย/เย็น), the mood sticker, a note/summary preview, and tag chips.
 * Shared by the Today dashboard and the Calendar timeline (M3).
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { PASticker } from './PASticker';
import { useTheme } from '../../theme/ThemeProvider';
import { moodLabel } from '../../lib/mood';
import { timeOfDay, ictClock } from '../../lib/time';
import { stripBold } from '../../lib/text';
import type { Mood, MoodEntry } from '../../api/types';

/** Only the fields the card renders — satisfied by MoodEntry and TimelineEntry. */
export type CardEntry = Pick<
  MoodEntry,
  'id' | 'moodTypeId' | 'note' | 'aiSummary' | 'tags' | 'createdAt'
>;

export interface EntryFolderCardProps {
  entry: CardEntry;
  mood?: Mood;
  onPress?: () => void;
  rotate?: number;
}

export function EntryFolderCard({ entry, mood, onPress, rotate = 0 }: EntryFolderCardProps) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const tod = timeOfDay(entry.createdAt);
  const accent = mood?.color ?? colors.primary;

  const title =
    stripBold(entry.aiSummary)?.split('\n')[0] ||
    entry.note?.split('\n')[0] ||
    moodLabel(mood, i18n.language);

  return (
    <View style={rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined}>
      {/* folder tab */}
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: accent,
          borderTopLeftRadius: radius.md,
          borderTopRightRadius: radius.md,
          paddingHorizontal: space.md,
          paddingVertical: 5,
          marginBottom: -2,
        }}
      >
        <Text variant="eyebrow" color="#fff">
          {t(`timeOfDay.${tod}`)} · {ictClock(entry.createdAt)}
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 0,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: space.lg,
          flexDirection: 'row',
          gap: space.md,
          alignItems: 'flex-start',
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <PASticker color={accent} emoji={mood?.emoji ?? '🙂'} size={44} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="label" color={colors.ink2}>
            {moodLabel(mood, i18n.language)}
          </Text>
          {title ? (
            <Text variant="body" numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {entry.tags.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
              {entry.tags.slice(0, 4).map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.pill,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text variant="label" weight="medium" color={colors.ink2}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
