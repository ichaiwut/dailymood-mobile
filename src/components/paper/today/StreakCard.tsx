/**
 * Streak card — washi-taped paper: STREAK eyebrow, big number + "วันติดต่อกัน" + 🔥,
 * and a 14-cell progress row (filled peach up to the streak). Ported from web.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { WashiTape } from '../WashiTape';
import { useTheme } from '../../../theme/ThemeProvider';

export function StreakCard({ streak }: { streak: number }) {
  const { t } = useTranslation();
  const { colors, radius, space, brand, shadow } = useTheme();
  const cells = Array.from({ length: 14 }, (_, i) => i < streak);

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: -12, zIndex: 1 }}>
        <WashiTape color={brand.peach + '99'} rotate={-4} width={96} />
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: space.xl,
          gap: space.md,
          boxShadow: shadow.md,
        }}
      >
        {/* eyebrow */}
        <Text
          variant="label"
          weight="bold"
          color={colors.ink3}
          style={{ textTransform: 'uppercase', letterSpacing: 1.1 }}
        >
          {t('today.streakLabel')}
        </Text>

        {/* number + label + fire */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
          <Text style={{ fontSize: 46, fontFamily: 'Urbanist_800ExtraBold', color: colors.ink, lineHeight: 48 }}>
            {streak}
          </Text>
          <Text variant="label" weight="bold" color={colors.ink3} style={{ marginBottom: 6 }}>
            {t('today.consecutiveDays')}
          </Text>
          <Text style={{ fontSize: 30, marginLeft: 'auto' }}>🔥</Text>
        </View>

        {/* 14-cell progress */}
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {cells.map((on, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 26,
                borderRadius: 5,
                backgroundColor: on ? brand.peach : colors.surface3,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
