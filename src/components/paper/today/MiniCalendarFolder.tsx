/**
 * Mini calendar (Today right rail) — a mint-tab folder showing the current month
 * with today highlighted and logged days tinted by their mood colour. "ดูทั้งหมด →"
 * opens the full calendar. Data from useCalendarMonth (per-day moodTypeId).
 */
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { FolderTab } from '../PaperSheet';
import { useTheme } from '../../../theme/ThemeProvider';
import { useCalendarMonth, useMoods } from '../../../hooks/queries';
import { findMood } from '../../../lib/mood';
import { todayKey } from '../../../lib/time';
import { APP_TIMEZONE } from '../../../config';

const pad = (n: number) => String(n).padStart(2, '0');

export function MiniCalendarFolder() {
  const { t, i18n } = useTranslation();
  const { colors, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const lang = i18n.language === 'th' ? 'th-TH' : 'en-US';

  const today = todayKey();
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const cal = useCalendarMonth(year, month);
  const moods = useMoods();

  const dayMood: Record<number, string | null> = {};
  for (const e of cal.data?.entries ?? []) {
    if (e.moodTypeId) dayMood[Number(e.date.slice(8, 10))] = e.moodTypeId;
  }

  const monthLabel = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: APP_TIMEZONE }).format(new Date(Date.UTC(year, month - 1, 1)));
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const todayDay = Number(today.slice(8, 10));
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(lang, { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 7 + i))),
  ); // Jan 7 2024 = Sunday
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <View>
      <FolderTab label={monthLabel} bg={brand.mint} fg={colors.ink} />
      <View style={{ backgroundColor: colors.surface, ...sheetRadius, borderTopLeftRadius: 0, padding: space.lg, gap: space.sm, boxShadow: shadow.md }}>
        <Pressable onPress={() => router.push('/(tabs)/calendar')} hitSlop={6} style={{ alignSelf: 'flex-end' }}>
          <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('today.viewAll')}</Text>
        </Pressable>

        {/* weekday header */}
        <View style={{ flexDirection: 'row' }}>
          {weekdays.map((w, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center' }}>
              <Text variant="label" weight="bold" color={colors.ink3} style={{ fontSize: 14 }}>{w}</Text>
            </View>
          ))}
        </View>

        {/* day grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 }}>
          {cells.map((d, i) => {
            if (d == null) return <View key={`b${i}`} style={{ width: `${100 / 7}%`, height: 34 }} />;
            const mood = findMood(moods.data, dayMood[d]);
            const isToday = d === todayDay;
            return (
              <View key={d} style={{ width: `${100 / 7}%`, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mood ? mood.color : isToday ? colors.surface2 : 'transparent',
                    borderWidth: isToday ? 2 : 0,
                    borderColor: brand.purple,
                  }}
                >
                  <Text variant="label" weight={isToday ? 'bold' : 'medium'} color={mood ? '#1A1320' : colors.ink2} style={{ fontSize: 14 }}>{d}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
