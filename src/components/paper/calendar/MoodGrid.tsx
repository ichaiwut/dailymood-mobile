/**
 * Monthly mood grid — 7-column calendar where each logged day is filled with
 * its dominant mood colour; empty days are tinted. Today gets a purple ring.
 * Tapping a day opens the Day Sheet.
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useToast } from '../../Toast';
import { useTheme } from '../../../theme/ThemeProvider';
import { findMood } from '../../../lib/mood';
import { todayKey, isFutureKey } from '../../../lib/time';
import type { CalendarDay, Mood } from '../../../api/types';

const WEEKDAYS: Record<string, string[]> = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export interface MoodGridProps {
  year: number;
  month: number; // 1–12
  days: CalendarDay[];
  moods: Mood[];
  locale: string;
  onDayPress: (dateKey: string) => void;
  selectedDate?: string | null;
}

export function MoodGrid({ year, month, days, moods, locale, onDayPress, selectedDate }: MoodGridProps) {
  const { colors, space, brand } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const today = todayKey();

  const moodByDate = new Map(days.map((d) => [d.date, d.moodTypeId]));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const weekdays = WEEKDAYS[locale === 'th' ? 'th' : 'en'];

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row' }}>
        {weekdays.map((w) => (
          <View key={w} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="label" weight="bold" color={colors.ink3}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (day == null) return <View key={`b${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const dateKey = `${year}-${pad(month)}-${pad(day)}`;
          const moodId = moodByDate.get(dateKey);
          const mood = findMood(moods, moodId);
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          const isFuture = isFutureKey(dateKey);
          // selected ring (ink) wins over today ring (purple).
          const ringColor = isSelected ? colors.ink : isToday ? brand.purple : 'transparent';
          return (
            <View key={dateKey} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}>
              <Pressable
                onPress={() => (isFuture ? toast.show(t('calendar.futureDay'), 'error') : onDayPress(dateKey))}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: mood ? mood.color : colors.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: ringColor === 'transparent' ? 0 : 2.5,
                  borderColor: ringColor,
                  opacity: isFuture ? 0.4 : 1,
                }}
              >
                <Text
                  variant="label"
                  weight={isToday || isSelected ? 'bold' : 'medium'}
                  color={mood ? 'rgba(0,0,0,0.55)' : colors.ink3}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
