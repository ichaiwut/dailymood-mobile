/**
 * "วันนี้" section header + day-axis timeline sheet (ported from web
 * today-timeline). Hour ticks 6:00–21:00 with a mood dot at each entry's ICT
 * time, a yellow washi strip, and a "ตอนนี้/Now" pill at the day's right edge.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { WashiTape } from '../WashiTape';
import { useTheme } from '../../../theme/ThemeProvider';
import { findMood } from '../../../lib/mood';
import { ictHour } from '../../../lib/time';
import type { Mood, MoodEntry } from '../../../api/types';

const HOURS = ['6:00', '9:00', '12:00', '15:00', '18:00', '21:00'];

export function TodayTimeline({ entries, moods }: { entries: MoodEntry[]; moods: Mood[] }) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow } = useTheme();

  return (
    <View style={{ gap: space.lg }}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}
      >
        <Text variant="h2">{t('tabs.today')}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.surface,
            borderRadius: radius.pill,
            paddingHorizontal: 14,
            paddingVertical: 7,
            boxShadow: shadow.sm,
          }}
        >
          <Text style={{ fontSize: 14 }}>📌</Text>
          <Text variant="label" weight="bold">
            {t('today.items', { count: entries.length })}
          </Text>
        </View>
      </View>

      {/* timeline sheet */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          paddingHorizontal: space.xl,
          paddingTop: space.xl,
          paddingBottom: space.lg,
          boxShadow: shadow.md,
        }}
      >
        <View style={{ position: 'absolute', top: -12, left: 28 }}>
          <WashiTape color={brand.yellow + 'C0'} width={92} rotate={-3} />
        </View>

        {/* hour ticks */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          {HOURS.map((h) => (
            <Text key={h} variant="label" weight="bold" color={colors.ink3} style={{ fontSize: 14 }}>
              {h}
            </Text>
          ))}
        </View>

        {/* track + dots + now pill */}
        <View style={{ height: 5, backgroundColor: colors.surface3, borderRadius: 100, marginTop: 4 }}>
          {entries.slice(0, 8).map((e, i) => {
            const h = ictHour(new Date(e.createdAt));
            const pct = Math.min(92, Math.max(3, ((h - 6) / 15) * 100));
            const color = findMood(moods, e.moodTypeId)?.color ?? colors.ink3;
            return (
              <View
                key={e.id ?? i}
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: -7,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: color,
                  borderWidth: 3,
                  borderColor: '#fff',
                  boxShadow: '0 3px 8px rgba(60,40,20,0.25)',
                  transform: [{ translateX: -9 }],
                }}
              />
            );
          })}
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: -30,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: brand.purple,
              borderRadius: 100,
              paddingHorizontal: 11,
              paddingVertical: 4,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
            <Text variant="label" weight="bold" color="#fff" style={{ fontSize: 14 }}>
              {t('today.now')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
